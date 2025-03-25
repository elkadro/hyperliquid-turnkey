import { RateLimiter } from '../utils/rateLimiter';
import { GeneralInfoAPI } from './info/general';
import { SpotInfoAPI } from './info/spot';
import { PerpetualsInfoAPI } from './info/perpetuals';
import { HttpApi } from '../utils/helpers';
import { SymbolConversion } from '../utils/symbolConversion';

import { 
    AllMids, 
    Meta, 
    UserOpenOrders, 
    FrontendOpenOrders, 
    UserFills, 
    UserRateLimit, 
    OrderStatus, 
    L2Book, 
    CandleSnapshot 
} from '../types/index';

import { InfoType, ENDPOINTS } from '../types/constants';
import { Hyperliquid } from '..';

export class InfoAPI {
    public spot: SpotInfoAPI;
    public perpetuals: PerpetualsInfoAPI;
    private httpApi: HttpApi;
    private generalAPI: GeneralInfoAPI;
    private symbolConversion: SymbolConversion;
    private parent: Hyperliquid;

    constructor(baseURL: string, rateLimiter: RateLimiter, symbolConversion: SymbolConversion, parent: Hyperliquid, _proxy?: string) {
        this.httpApi = new HttpApi(baseURL, ENDPOINTS.INFO, rateLimiter,_proxy);
        this.symbolConversion = symbolConversion;
        this.parent = parent;
        this.generalAPI = new GeneralInfoAPI(this.httpApi, this.symbolConversion);
        this.spot = new SpotInfoAPI(this.httpApi, this.symbolConversion);
        this.perpetuals = new PerpetualsInfoAPI(this.httpApi, this.symbolConversion);
    }

    async getAssetIndex(assetName: string): Promise<number | undefined> {
        await this.parent.ensureInitialized();
        return await this.symbolConversion.getAssetIndex(assetName);
    }

    async getInternalName(exchangeName: string): Promise<string | undefined> {
        await this.parent.ensureInitialized();
        return await this.symbolConversion.convertSymbol(exchangeName);
    }

    async getAllAssets(): Promise<{ perp: string[], spot: string[] }> {
        await this.parent.ensureInitialized();
        return await this.symbolConversion.getAllAssets();
    }

    async getAllMids(rawResponse: boolean = false): Promise<AllMids> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getAllMids(rawResponse);
    }

    async getUserOpenOrders(user: string, rawResponse: boolean = false): Promise<UserOpenOrders> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getUserOpenOrders(user, rawResponse);
    }

    async getFrontendOpenOrders(user: string, rawResponse: boolean = false): Promise<FrontendOpenOrders> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getFrontendOpenOrders(user, rawResponse);
    }

    async getUserFills(user: string, rawResponse: boolean = false): Promise<UserFills> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getUserFills(user, rawResponse);
    }

    async getUserFees(user: string, rawResponse: boolean = false): Promise<any> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getUserFees(user, rawResponse);
    }

    async getUserFillsByTime(user: string, startTime: number, endTime: number, rawResponse: boolean = false): Promise<UserFills> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getUserFillsByTime(user, startTime, endTime, rawResponse);
    }

    async getUserRateLimit(user: string, rawResponse: boolean = false): Promise<UserRateLimit> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getUserRateLimit(user, rawResponse);
    }

    async getOrderStatus(user: string, oid: number | string, rawResponse: boolean = false): Promise<OrderStatus> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getOrderStatus(user, oid, rawResponse);
    }

    async getL2Book(coin: string, rawResponse: boolean = false): Promise<L2Book> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getL2Book(coin, rawResponse);
    }

    async getCandleSnapshot(coin: string, interval: string, startTime: number, endTime: number, rawResponse: boolean = false): Promise<CandleSnapshot> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getCandleSnapshot(coin, interval, startTime, endTime, rawResponse);
    }

    async getClearinghouseState(user: string, rawResponse: boolean = false): Promise<any> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getClearinghouseState(user, rawResponse);
    }
    async getClearinghouseSpotState(user: string, rawResponse: boolean = false): Promise<any> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getClearinghouseSpotState(user, rawResponse);
    }

    async getSpotMetaAndAssetCtxs(rawResponse: boolean = false): Promise<any> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getSpotMetaAndAssetCtxs(rawResponse);
    }
    async getMetaAndAssetCtxs(rawResponse: boolean = false): Promise<any> {
        await this.parent.ensureInitialized();
        return this.generalAPI.getMetaAndAssetCtxs(rawResponse);
    }
}
