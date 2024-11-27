import { RateLimiter } from './rateLimiter';
export declare class HttpApi {
    private endpoint;
    private rateLimiter;
    private proxy;
    private theBase;
    constructor(baseUrl: string, endpoint: string | undefined, rateLimiter: RateLimiter, _proxy?: string);
    makeRequest(payload: any, weight?: number, endpoint?: string): Promise<any>;
}
