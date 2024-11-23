export declare class RateLimiter {
    readonly interval: number;
    private readonly maxRequests;
    private tokens;
    private lastRefill;
    private queue;
    private requestCount;
    private lastLogTime;
    constructor(requestsPerMinute?: number);
    private refillTokens;
    private processQueue;
    private logRequestsPerMinute;
    private logQueue;
    waitForToken(weight?: number): Promise<void>;
}
