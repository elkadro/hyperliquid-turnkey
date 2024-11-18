"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    constructor(requestsPerMinute = 1188) {
        this.capacity = requestsPerMinute; // Maximum tokens (e.g., 1200/min)
        this.refillRate = requestsPerMinute / 60000; // Tokens per millisecond
        this.tokens = this.capacity;
        this.lastUpdated = Date.now();
    }
    refillTokens() {
        const now = Date.now();
        const elapsedMs = now - this.lastUpdated;
        // Refill tokens based on elapsed time
        this.tokens = Math.min(this.capacity, this.tokens + elapsedMs * this.refillRate);
        this.lastUpdated = now;
    }
    async waitForToken(weight = 1) {
        this.refillTokens();
        if (this.tokens >= weight) {
            this.tokens -= weight;
            return;
        }
        // Calculate time to wait for enough tokens
        const timeToWait = ((weight - this.tokens) / this.refillRate);
        return new Promise(resolve => setTimeout(resolve, timeToWait)).then(() => {
            this.waitForToken(weight); // Check again after waiting
        });
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=rateLimiter.js.map