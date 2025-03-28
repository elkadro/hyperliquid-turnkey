import { RateLimiter } from '../utils/rateLimiter';
import { InfoAPI } from './info';
import { CancelOrderResponse } from '../utils/signing';
import { CreateVaultResponse, CancelOrderRequest, OrderRequest } from '../types/index';
import { SymbolConversion } from '../utils/symbolConversion';
import { Hyperliquid } from '../index';
export declare class ExchangeAPI {
    private info;
    private turnkeySigner;
    private httpApi;
    private symbolConversion;
    private IS_MAINNET;
    private walletAddress;
    private turnkeySignerAddress;
    private parent;
    private vaultAddress;
    private nonceCounter;
    private lastNonceTimestamp;
    constructor(testnet: boolean, turnkeySigner: any, info: InfoAPI, rateLimiter: RateLimiter, symbolConversion: SymbolConversion, walletAddress: (string | null) | undefined, parent: Hyperliquid, vaultAddress?: string | null, _proxy?: string | undefined);
    private getAssetIndex;
    placeOrder(orderRequest: OrderRequest): Promise<any>;
    cancelOrder(cancelRequests: CancelOrderRequest | CancelOrderRequest[], vaultAddress?: string): Promise<CancelOrderResponse>;
    cancelOrderByCloid(symbol: string, cloid: string, vaultAddress?: string): Promise<any>;
    modifyOrder(oid: number, orderRequest: OrderRequest): Promise<any>;
    batchModifyOrders(modifies: Array<{
        oid: number;
        order: OrderRequest;
    }>, vaultAddress?: string): Promise<any>;
    updateLeverage(symbol: string, leverageMode: string, leverage: number, vaultAddress?: string): Promise<any>;
    updateIsolatedMargin(symbol: string, isBuy: boolean, ntli: number, vaultAddress?: string): Promise<any>;
    usdTransfer(destination: string, amount: number): Promise<any>;
    spotTransfer(destination: string, token: string, amount: string): Promise<any>;
    initiateWithdrawal(destination: string, amount: number): Promise<any>;
    transferBetweenSpotAndPerp(usdc: number, toPerp: boolean): Promise<any>;
    scheduleCancel(time: number | null): Promise<any>;
    vaultTransfer(vaultAddress: string, isDeposit: boolean, usd: number): Promise<any>;
    setReferrer(code: string): Promise<any>;
    createVault(name: string, description: string, initialUsd: number): Promise<CreateVaultResponse>;
    vaultDistribute(vaultAddress: string, usd: number): Promise<any>;
    vaultModify(vaultAddress: string, allowDeposits: boolean | null, alwaysCloseOnWithdraw: boolean | null): Promise<any>;
    /**
     * Generates a unique nonce by using the current timestamp in milliseconds
     * If multiple calls happen in the same millisecond, it ensures the nonce is still increasing
     * @returns A unique nonce value
     */
    private generateUniqueNonce;
}
