export declare class RateLimiter {
    private readonly interval;
    private readonly maxRequests;
    private tokens;
    private lastRefill;
    private queue;
    constructor(requestsPerMinute?: number);
    private refillTokens;
    private processQueue;
    waitForToken(): Promise<void>;
}
