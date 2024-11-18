export class RateLimiter {
    private readonly interval: number; // Time interval in milliseconds for one token
    private readonly maxRequests: number; // Maximum requests allowed
    private tokens: number; // Available tokens
    private lastRefill: number; // Last time tokens were refilled
    private queue: (() => void)[] = []; // Queue of pending requests

    constructor(requestsPerMinute: number = 588) {
        this.maxRequests = requestsPerMinute;
        this.interval = (60 * 1000) / requestsPerMinute; // Time interval for one request
        this.tokens = requestsPerMinute; // Start full
        this.lastRefill = Date.now();
    }

    private refillTokens() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;

        // Refill tokens based on elapsed time
        const newTokens = Math.floor(elapsed / this.interval);
        if (newTokens > 0) {
            this.tokens = Math.min(this.maxRequests, this.tokens + newTokens);
            this.lastRefill += newTokens * this.interval; // Update last refill time
        }
    }

    private processQueue() {
        while (this.queue.length > 0 && this.tokens > 0) {
            this.tokens--;
            const resolve = this.queue.shift();
            if (resolve) resolve(); // Release the queued request
        }
    }

    async waitForToken(): Promise<void> {
        this.refillTokens();

        if (this.tokens > 0) {
            this.tokens--;
            return; // Immediately process if tokens are available
        }

        // If no tokens are available, enqueue the request
        return new Promise<void>(resolve => {
            this.queue.push(resolve);
        }).then(() => {
            this.processQueue(); // Process the queue after resolving
        });
    }
}