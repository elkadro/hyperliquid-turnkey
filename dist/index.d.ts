import { InfoAPI } from './rest/info';
import { ExchangeAPI } from './rest/exchange';
import { WebSocketClient } from './websocket/connection';
import { WebSocketSubscriptions } from './websocket/subscriptions';
import { CustomOperations } from './rest/custom';
export { ExchangeAPI } from './rest/exchange';
export { InfoAPI } from './rest/info';
export declare class Hyperliquid {
    info: InfoAPI;
    exchange: ExchangeAPI;
    ws: WebSocketClient;
    subscriptions: WebSocketSubscriptions;
    custom: CustomOperations;
    proxy: string | undefined;
    private rateLimiter;
    private symbolConversion;
    private isValidPrivateKey;
    private walletAddress;
    constructor(turnkeySigner: any | null, testnet: boolean | undefined, walletAddress: string, _prepMeta: any, _spotMeta: any, _proxy?: string);
    private createAuthenticatedProxy;
    private initializeWithTurnkey;
    isAuthenticated(): boolean;
    connect(): Promise<void>;
    disconnect(): void;
}
export * from './types';
export * from './utils/signing';
