"use strict";
// src/rest/info/general.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralInfoAPI = void 0;
const constants_1 = require("../../types/constants");
class GeneralInfoAPI {
    constructor(httpApi, symbolConversion) {
        this.httpApi = httpApi;
        this.symbolConversion = symbolConversion;
    }
    async getAllMids(rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.ALL_MIDS });
        if (rawResponse) {
            return response;
        }
        else {
            const convertedResponse = {};
            for (const [key, value] of Object.entries(response)) {
                const convertedKey = await this.symbolConversion.convertSymbol(key);
                const convertedValue = parseFloat(value);
                convertedResponse[convertedKey] = convertedValue;
            }
            return convertedResponse;
        }
    }
    async getUserOpenOrders(user, rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.OPEN_ORDERS, user: user });
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getFrontendOpenOrders(user, rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.FRONTEND_OPEN_ORDERS, user: user }, 20);
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getUserFills(user, rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.USER_FILLS, user: user }, 20);
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getUserFees(user, rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.USER_FEES, user: user }, 20);
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getUserFillsByTime(user, startTime, endTime, rawResponse = false) {
        let params = {
            user: user,
            startTime: Math.round(startTime),
            type: constants_1.InfoType.USER_FILLS_BY_TIME
        };
        if (endTime) {
            params.endTime = Math.round(endTime);
        }
        const response = await this.httpApi.makeRequest(params, 20);
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getUserRateLimit(user, rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.USER_RATE_LIMIT, user: user }, 20);
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getOrderStatus(user, oid, rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.ORDER_STATUS, user: user, oid: oid });
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getL2Book(coin, rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.L2_BOOK, coin: await this.symbolConversion.convertSymbol(coin, "reverse") });
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getCandleSnapshot(coin, interval, startTime, endTime, rawResponse = false) {
        const response = await this.httpApi.makeRequest({
            type: constants_1.InfoType.CANDLE_SNAPSHOT,
            req: { coin: await this.symbolConversion.convertSymbol(coin, "reverse"), interval: interval, startTime: startTime, endTime: endTime }
        });
        return rawResponse ? response : await this.symbolConversion.convertResponse(response, ["s"]);
    }
    async getClearinghouseState(user, rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.PERPS_CLEARINGHOUSE_STATE, user: user });
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getClearinghouseSpotState(user, rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.SPOT_CLEARINGHOUSE_STATE, user: user });
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getSpotMetaAndAssetCtxs(rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.SPOT_META_AND_ASSET_CTXS });
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
    async getMetaAndAssetCtxs(rawResponse = false) {
        const response = await this.httpApi.makeRequest({ type: constants_1.InfoType.PERPS_META_AND_ASSET_CTXS });
        return rawResponse ? response : await this.symbolConversion.convertResponse(response);
    }
}
exports.GeneralInfoAPI = GeneralInfoAPI;
//# sourceMappingURL=general.js.map