export declare class SymbolConversion {
    private assetToIndexMap;
    private exchangeToInternalNameMap;
    private httpApi;
    private refreshIntervalMs;
    private refreshInterval;
    private initializationPromise;
    private perpMeta;
    private spotMeta;
    constructor(baseURL: string, rateLimiter: any, _perpMeta: any, _spotMeta: any, _proxy?: string);
    private initialize;
    private refreshAssetMaps;
    private startPeriodicRefresh;
    stopPeriodicRefresh(): void;
    private ensureInitialized;
    getInternalName(exchangeName: string): Promise<string | undefined>;
    getExchangeName(internalName: string): Promise<string | undefined>;
    getAssetIndex(assetSymbol: string): Promise<number | undefined>;
    getAllAssets(): Promise<{
        perp: string[];
        spot: string[];
    }>;
    convertSymbol(symbol: string, mode?: string, symbolMode?: string): Promise<string>;
    convertSymbolsInObject(obj: any, symbolsFields?: Array<string>, symbolMode?: string): Promise<any>;
    convertToNumber(value: any): any;
    convertResponse(response: any, symbolsFields?: string[], symbolMode?: string): Promise<any>;
}
