import axios, { AxiosInstance } from 'axios';
import { handleApiError } from './errors';
import { RateLimiter } from './rateLimiter';


export class HttpApi {
    private client: AxiosInstance;
    private endpoint: string;
    private rateLimiter: RateLimiter;

    constructor(baseUrl: string, endpoint: string = "/", rateLimiter: RateLimiter) {
        this.endpoint = endpoint;
        this.client = axios.create({
            baseURL: baseUrl,
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
