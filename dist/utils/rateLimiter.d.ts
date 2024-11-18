export declare class RateLimiter {
    private tokens;
    private lastUpdated;
    private readonly refillRate;
    private readonly capacity;
    constructor(requestsPerMinute?: number);
    private refillTokens;
    waitForToken(weight?: number): Promise<void>;
}
