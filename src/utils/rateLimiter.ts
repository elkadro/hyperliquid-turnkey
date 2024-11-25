
export class RateLimiter {
    public readonly interval: number; // Time interval in milliseconds for one token
    private readonly maxRequests: number; // Maximum requests allowed
    private tokens: number; // Available tokens
    private lastRefill: number; // Last time tokens were refilled
    private queue: { weight: number; resolve: () => void }[] = []; // Queue of pending requests with weights

    private requestCount: number = 0; // Count of processed requests in the current minute
    private lastLogTime: number = Date.now(); // Last time RPM was logged

    constructor(requestsPerMinute: number = 1199) {
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
        while (this.queue.length > 0) {
            const nextRequest = this.queue[0];

            if (this.tokens >= nextRequest.weight) {
                this.tokens -= nextRequest.weight;
                this.queue.shift()?.resolve(); // Remove the request from the queue and resolve it
                this.logQueue(); // Log queue state after resolving
            } else {
                break; // Not enough tokens for the next request
            }
        }
    }

    private logRequestsPerMinute() {
        const now = Date.now();
        const elapsed = now - this.lastLogTime;

        if (elapsed >= 60 * 1000) {
            const rpm = this.requestCount * 1000 * 60 / elapsed;
            console.log(`Hyperliquid SDK Rate Limiter: Requests processed in the last minute: ${rpm.toFixed(2)}`);
            this.requestCount = 0; // Reset count for the next minute
            this.lastLogTime = now; // Reset the log timer
        }
    }

    private logQueue() {
        console.log(`Hyperliquid SDK Rate Limiter: Current Queue Weight: ${this.queue.reduce((sum, req) => sum + req.weight, 0)}`);
    }

    async waitForToken(weight: number = 1): Promise<void> {
        if (weight <= 0) throw new Error('Weight must be greater than 0');
        
        this.refillTokens();

        if (this.tokens >= weight) {
            this.tokens -= weight;
            this.requestCount += weight; // Add the weight to the request count
            this.logRequestsPerMinute(); // Check and log RPM
            return; // Immediately process if tokens are available
        }

        // If not enough tokens are available, enqueue the request
        return new Promise<void>((resolve) => {
            this.queue.push({ weight, resolve });
        }).then(() => {
            this.requestCount += weight; // Add the weight to the request count when processed
            this.logRequestsPerMinute(); // Check and log RPM
            this.processQueue(); // Process the queue after resolving
        });
    }
}