import { InfoAPI } from './rest/info';
import { ExchangeAPI } from './rest/exchange';
import { WebSocketClient } from './websocket/connection';
import { WebSocketSubscriptions } from './websocket/subscriptions';
import { RateLimiter } from './utils/rateLimiter';
import * as CONSTANTS from './types/constants';
import { CustomOperations } from './rest/custom';
import { ethers } from 'ethers';
import { SymbolConversion } from './utils/symbolConversion';
import { AuthenticationError } from './utils/errors';


export { ExchangeAPI } from './rest/exchange';
export { InfoAPI } from './rest/info';

export class Hyperliquid {
  public info: InfoAPI;
  public exchange: ExchangeAPI;
  public ws: WebSocketClient;
  public subscriptions: WebSocketSubscriptions;
  public custom: CustomOperations;
  public proxy: string | undefined = undefined;

  private rateLimiter: RateLimiter;
  private symbolConversion: SymbolConversion;
  private isValidPrivateKey: boolean = false;
  private walletAddress: string | null = null;

  constructor(turnkeySigner: any | null = null, testnet: boolean = false, walletAddress: string, _prepMeta: any, _spotMeta: any, _proxy?: string) {
    const baseURL = testnet ? CONSTANTS.BASE_URLS.TESTNET : CONSTANTS.BASE_URLS.PRODUCTION;
    if (_proxy && _proxy.length > 0) {
      this.proxy = _proxy
    }
    this.rateLimiter = new RateLimiter();
    this.symbolConversion = new SymbolConversion(baseURL, this.rateLimiter, _prepMeta, _spotMeta,_proxy);

    this.info = new InfoAPI(baseURL, this.rateLimiter, this.symbolConversion,_proxy);
    this.ws = new WebSocketClient(testnet);
    this.subscriptions = new WebSocketSubscriptions(this.ws, this.symbolConversion);

    // Create proxy objects for exchange and custom
    this.exchange = this.createAuthenticatedProxy(ExchangeAPI);
    this.custom = this.createAuthenticatedProxy(CustomOperations);

    this.walletAddress = walletAddress;

    if (turnkeySigner) {
      this.initializeWithTurnkey(turnkeySigner, testnet);
    }
  }

  private createAuthenticatedProxy<T extends object>(Class: new (...args: any[]) => T): T {
    return new Proxy({} as T, {
      get: (target, prop) => {
        if (!this.isValidPrivateKey) {
          throw new AuthenticationError('Invalid or missing private key. This method requires authentication.');
        }
        return target[prop as keyof T];
      }
    });
  }

  private initializeWithTurnkey(turnkeySigner: any, testnet: boolean = false): void {
    try {
      
      this.exchange = new ExchangeAPI(testnet, turnkeySigner, this.info, this.rateLimiter, this.symbolConversion, this.walletAddress, this.proxy);
      this.custom = new CustomOperations(this.exchange, this.info, turnkeySigner, this.symbolConversion, this.walletAddress);
      this.isValidPrivateKey = true;
    } catch (error) {
      console.warn("Invalid turnkey signer provided. Some functionalities will be limited.");
      this.isValidPrivateKey = false;
    }
  }

  public isAuthenticated(): boolean {
    return this.isValidPrivateKey;
  }

  async connect(): Promise<void> {
    await this.ws.connect();
    if (!this.isValidPrivateKey) {
      console.warn("Not authenticated. Some WebSocket functionalities may be limited.");
    }
  }

  disconnect(): void {
    this.ws.close();
  }
}

export * from './types';
export * from './utils/signing';
