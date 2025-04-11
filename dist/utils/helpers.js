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
        this.theBase = "";
        if (_proxy) {
            this.proxy = _proxy;
        }
        this.theBase = (this.proxy && this.proxy.length > 0) ? this.proxy : baseUrl;
        console.log(`Hyperliquid SDK: Using url ${this.theBase}`);
        this.endpoint = endpoint;
        // this.client = axios.create({
        //     baseURL: base,
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // });
        this.rateLimiter = rateLimiter;
    }
    async makeRequest(payload, weight = 2, endpoint = this.endpoint) {
        try {
            await this.rateLimiter.waitForToken();
            const past = Date.now();
            const response = await axios_1.default.post(`${this.theBase}${endpoint}`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            // const response = await this.client.post(endpoint, payload);
            console.log(`Hyperliquid SDK: Request of ${endpoint} took ${Date.now() - past}ms`);
            // Check if response data is null or undefined before returning
            if (response.data === null || response.data === undefined) {
                throw new Error('Received null or undefined response data');
            }
            return response.data;
        }
        catch (error) {
            (0, errors_1.handleApiError)(error);
        }
    }
}
exports.HttpApi = HttpApi;
//# sourceMappingURL=helpers.js.map