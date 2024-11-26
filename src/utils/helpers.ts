import axios, { AxiosInstance } from 'axios';
import { handleApiError } from './errors';
import { RateLimiter } from './rateLimiter';


export class HttpApi {
    private client: AxiosInstance;
    private endpoint: string;
    private rateLimiter: RateLimiter;
    private proxy: string | undefined = undefined;

    constructor(baseUrl: string, endpoint: string = "/", rateLimiter: RateLimiter, _proxy?: string) {
        if(_proxy) {
            this.proxy = _proxy;
        }
        const base = (this.proxy && this.proxy.length > 0) ? this.proxy : baseUrl;
        console.log(`Hyperliquid SDK: Using url ${base}`);
        this.endpoint = endpoint;
        this.client = axios.create({
            baseURL: base,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.rateLimiter = rateLimiter;
    }

    async makeRequest(payload: any, weight: number = 2, endpoint: string = this.endpoint,): Promise<any> {
        try {
            
            await this.rateLimiter.waitForToken();
            const past = Date.now();
            const response = await this.client.post(endpoint, payload);
            console.log(`Hyperliquid SDK: Request of ${endpoint} took ${Date.now() - past}ms`);
            return response.data;
        } catch (error) {
            handleApiError(error);
        }
    }
}
