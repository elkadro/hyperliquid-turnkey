import { RateLimiter } from './rateLimiter';
export declare class HttpApi {
    private client;
    private endpoint;
    private rateLimiter;
    private proxy;
    constructor(baseUrl: string, endpoint: string | undefined, rateLimiter: RateLimiter, _proxy?: string);
    makeRequest(payload: any, weight?: number, endpoint?: string): Promise<any>;
}
