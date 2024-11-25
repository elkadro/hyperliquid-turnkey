"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    constructor(requestsPerMinute = 1199) {
        this.queue = []; // Queue of pending requests with weights
        this.requestCount = 0; // Count of processed requests in the current minute
        this.lastLogTime = Date.now(); // Last time RPM was logged
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
        while (this.queue.length > 0) {
            const nextRequest = this.queue[0];
            if (this.tokens >= nextRequest.weight) {
                this.tokens -= nextRequest.weight;
                this.queue.shift()?.resolve(); // Remove the request from the queue and resolve it
                this.logQueue(); // Log queue state after resolving
            }
            else {
                break; // Not enough tokens for the next request
            }
        }
    }
    logRequestsPerMinute() {
        const now = Date.now();
        const elapsed = now - this.lastLogTime;
        if (elapsed >= 60 * 1000) {
            const rpm = this.requestCount * 1000 * 60 / elapsed;
            console.log(`Hyperliquid SDK Rate Limiter: Requests processed in the last minute: ${rpm.toFixed(2)}`);
            this.requestCount = 0; // Reset count for the next minute
            this.lastLogTime = now; // Reset the log timer
        }
    }
    logQueue() {
        console.log(`Hyperliquid SDK Rate Limiter: Current Queue Weight: ${this.queue.reduce((sum, req) => sum + req.weight, 0)}`);
    }
    async waitForToken(weight = 1) {
        if (weight <= 0)
            throw new Error('Weight must be greater than 0');
        this.refillTokens();
        if (this.tokens >= weight) {
            this.tokens -= weight;
            this.requestCount += weight; // Add the weight to the request count
            this.logRequestsPerMinute(); // Check and log RPM
            return; // Immediately process if tokens are available
        }
        // If not enough tokens are available, enqueue the request
        return new Promise((resolve) => {
            this.queue.push({ weight, resolve });
        }).then(() => {
            this.requestCount += weight; // Add the weight to the request count when processed
            this.logRequestsPerMinute(); // Check and log RPM
            this.processQueue(); // Process the queue after resolving
        });
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=rateLimiter.js.map