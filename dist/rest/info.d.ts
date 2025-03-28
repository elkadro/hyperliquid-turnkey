import { RateLimiter } from '../utils/rateLimiter';
import { SpotInfoAPI } from './info/spot';
import { PerpetualsInfoAPI } from './info/perpetuals';
import { SymbolConversion } from '../utils/symbolConversion';
import { AllMids, UserOpenOrders, FrontendOpenOrders, UserFills, UserRateLimit, OrderStatus, L2Book, CandleSnapshot } from '../types/index';
import { Hyperliquid } from '..';
export declare class InfoAPI {
    spot: SpotInfoAPI;
    perpetuals: PerpetualsInfoAPI;
    private httpApi;
    private generalAPI;
    private symbolConversion;
    private parent;
    constructor(baseURL: string, rateLimiter: RateLimiter, symbolConversion: SymbolConversion, parent: Hyperliquid, _proxy?: string);
    getAssetIndex(assetName: string): Promise<number | undefined>;
    getInternalName(exchangeName: string): Promise<string | undefined>;
    getAllAssets(): Promise<{
        perp: string[];
        spot: string[];
    }>;
    getAllMids(rawResponse?: boolean): Promise<AllMids>;
    getUserOpenOrders(user: string, rawResponse?: boolean): Promise<UserOpenOrders>;
    getFrontendOpenOrders(user: string, rawResponse?: boolean): Promise<FrontendOpenOrders>;
    getUserFills(user: string, rawResponse?: boolean): Promise<UserFills>;
    getUserFees(user: string, rawResponse?: boolean): Promise<any>;
    getUserFillsByTime(user: string, startTime: number, endTime: number, rawResponse?: boolean): Promise<UserFills>;
    getUserRateLimit(user: string, rawResponse?: boolean): Promise<UserRateLimit>;
    getOrderStatus(user: string, oid: number | string, rawResponse?: boolean): Promise<OrderStatus>;
    getL2Book(coin: string, rawResponse?: boolean): Promise<L2Book>;
    getCandleSnapshot(coin: string, interval: string, startTime: number, endTime: number, rawResponse?: boolean): Promise<CandleSnapshot>;
    getClearinghouseState(user: string, rawResponse?: boolean): Promise<any>;
    getClearinghouseSpotState(user: string, rawResponse?: boolean): Promise<any>;
    getSpotMetaAndAssetCtxs(rawResponse?: boolean): Promise<any>;
    getMetaAndAssetCtxs(rawResponse?: boolean): Promise<any>;
}
