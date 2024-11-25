"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpApi = void 0;
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("./errors");
class HttpApi {
    constructor(baseUrl, endpoint = "/", rateLimiter, _proxy) {
        this.proxy = undefined;
        if (_proxy) {
            this.proxy = _proxy;
        }
        this.endpoint = endpoint;
        this.client = axios_1.default.create({
            baseURL: (this.proxy && this.proxy.length > 0) ? this.proxy : baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.rateLimiter = rateLimiter;
    }
    async makeRequest(payload, weight = 2, endpoint = this.endpoint) {
        try {
            await this.rateLimiter.waitForToken();
            const past = Date.now();
            const response = await this.client.post(endpoint, payload);
            console.log(`Hyperliquid SDK: Request of ${endpoint} took ${Date.now() - past}ms`);
            return response.data;
        }
        catch (error) {
            (0, errors_1.handleApiError)(error);
        }
    }
}
exports.HttpApi = HttpApi;
//# sourceMappingURL=helpers.js.map