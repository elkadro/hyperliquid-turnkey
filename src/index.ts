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

  private _turnkeySigner: any | null = null;
  private _testnet: boolean = false;
  private rateLimiter: RateLimiter;
  private symbolConversion: SymbolConversion;
  private isValidPrivateKey: boolean = false;
  private walletAddress: string | null = null;
  private _initialized: boolean = false;
  private _initializing: Promise<void> | null = null;
  private _walletAddress?: string;
  private vaultAddress?: string | null = null;

  constructor(turnkeySigner: any | null = null, testnet: boolean = false, walletAddress: string, _prepMeta: any, _spotMeta: any, _proxy?: string) {
    const baseURL = testnet ? CONSTANTS.BASE_URLS.TESTNET : CONSTANTS.BASE_URLS.PRODUCTION;
    if (_proxy && _proxy.length > 0) {
      this.proxy = _proxy
    }
    this.rateLimiter = new RateLimiter();
    this.symbolConversion = new SymbolConversion(baseURL, this.rateLimiter, _prepMeta, _spotMeta,_proxy);

    this.info = new InfoAPI(baseURL, this.rateLimiter, this.symbolConversion, this, _proxy);
    this.ws = new WebSocketClient(testnet);
    this.subscriptions = new WebSocketSubscriptions(this.ws, this.symbolConversion);

    // Create proxy objects for exchange and custom
    this.exchange = this.createAuthenticatedProxy(ExchangeAPI);
    this.custom = this.createAuthenticatedProxy(CustomOperations);

    this.walletAddress = walletAddress;
    this._testnet = testnet;
    this._turnkeySigner = turnkeySigner;
    if (turnkeySigner) {
      (async () => {
        await this.initializeWithTurnkey(turnkeySigner, testnet);
      })();
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

  private async initializeWithTurnkey(turnkeySigner: any, testnet: boolean = false): Promise<void> {
    if (this._initialized) return;
    try {
      
      this.exchange = new ExchangeAPI(testnet, turnkeySigner, this.info, this.rateLimiter, this.symbolConversion, this.walletAddress, this, this.vaultAddress, this.proxy);
      this.custom = new CustomOperations(this.exchange, this.info, turnkeySigner, this.symbolConversion, this.walletAddress);
      this.isValidPrivateKey = true;
      this._initialized = true;
      this._initializing = null;
    } catch (error) {
      this._initializing = null;
      console.warn("Invalid turnkey signer provided. Some functionalities will be limited.");
      this.isValidPrivateKey = false;
    }
  }

  public async ensureInitialized(): Promise<void> {
    await this.connect();
  }

  public isAuthenticated(): boolean {
    this.ensureInitialized();
    return this.isValidPrivateKey;
  }

  async connect(): Promise<void> {
    // await this.ws.connect();
    // if (!this.isValidPrivateKey) {
    //   console.warn("Not authenticated. Some WebSocket functionalities may be limited.");
    // }
    if (!this._initialized) {
        if (!this._initializing) {
            this._initializing = this.initializeWithTurnkey(this._turnkeySigner, this._testnet);
        }
        await this._initializing;
    }
  }

  disconnect(): void {
    this.ws.close();
  }
}

export * from './types';
export * from './utils/signing';
