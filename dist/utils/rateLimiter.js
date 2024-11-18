"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    constructor(requestsPerMinute = 588) {
        this.queue = []; // Queue of pending requests
        this.maxRequests = requestsPerMinute;
        this.interval = (60 * 1000) / requestsPerMinute; // Time interval for one request
        this.tokens = requestsPerMinute; // Start full
        this.lastRefill = Date.now();
    }
    refillTokens() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        // Refill tokens based on elapsed time
        const newTokens = Math.floor(elapsed / this.interval);
        if (newTokens > 0) {
            this.tokens = Math.min(this.maxRequests, this.tokens + newTokens);
            this.lastRefill += newTokens * this.interval; // Update last refill time
        }
    }
    processQueue() {
        while (this.queue.length > 0 && this.tokens > 0) {
            this.tokens--;
            const resolve = this.queue.shift();
            if (resolve)
                resolve(); // Release the queued request
        }
    }
    async waitForToken() {
        this.refillTokens();
        if (this.tokens > 0) {
            this.tokens--;
            return; // Immediately process if tokens are available
        }
        // If no tokens are available, enqueue the request
        return new Promise(resolve => {
            this.queue.push(resolve);
        }).then(() => {
            this.processQueue(); // Process the queue after resolving
        });
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=rateLimiter.js.map