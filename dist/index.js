"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hyperliquid = exports.InfoAPI = exports.ExchangeAPI = void 0;
const info_1 = require("./rest/info");
const exchange_1 = require("./rest/exchange");
const connection_1 = require("./websocket/connection");
const subscriptions_1 = require("./websocket/subscriptions");
const rateLimiter_1 = require("./utils/rateLimiter");
const CONSTANTS = __importStar(require("./types/constants"));
const custom_1 = require("./rest/custom");
const symbolConversion_1 = require("./utils/symbolConversion");
const errors_1 = require("./utils/errors");
var exchange_2 = require("./rest/exchange");
Object.defineProperty(exports, "ExchangeAPI", { enumerable: true, get: function () { return exchange_2.ExchangeAPI; } });
var info_2 = require("./rest/info");
Object.defineProperty(exports, "InfoAPI", { enumerable: true, get: function () { return info_2.InfoAPI; } });
class Hyperliquid {
    constructor(turnkeySigner = null, testnet = false, walletAddress, _prepMeta, _spotMeta, _proxy) {
        this.proxy = undefined;
        this._turnkeySigner = null;
        this._testnet = false;
        this.isValidPrivateKey = false;
        this.walletAddress = null;
        this._initialized = false;
        this._initializing = null;
        this.vaultAddress = null;
        const baseURL = testnet ? CONSTANTS.BASE_URLS.TESTNET : CONSTANTS.BASE_URLS.PRODUCTION;
        if (_proxy && _proxy.length > 0) {
            this.proxy = _proxy;
        }
        this.rateLimiter = new rateLimiter_1.RateLimiter();
        this.symbolConversion = new symbolConversion_1.SymbolConversion(baseURL, this.rateLimiter, _prepMeta, _spotMeta, _proxy);
        this.info = new info_1.InfoAPI(baseURL, this.rateLimiter, this.symbolConversion, this, _proxy);
        this.ws = new connection_1.WebSocketClient(testnet);
        this.subscriptions = new subscriptions_1.WebSocketSubscriptions(this.ws, this.symbolConversion);
        // Create proxy objects for exchange and custom
        this.exchange = this.createAuthenticatedProxy(exchange_1.ExchangeAPI);
        this.custom = this.createAuthenticatedProxy(custom_1.CustomOperations);
        this.walletAddress = walletAddress;
        this._testnet = testnet;
        this._turnkeySigner = turnkeySigner;
        if (turnkeySigner) {
            (async () => {
                await this.initializeWithTurnkey(turnkeySigner, testnet);
            })();
        }
    }
    createAuthenticatedProxy(Class) {
        return new Proxy({}, {
            get: (target, prop) => {
                if (!this.isValidPrivateKey) {
                    throw new errors_1.AuthenticationError('Invalid or missing private key. This method requires authentication.');
                }
                return target[prop];
            }
        });
    }
    async initializeWithTurnkey(turnkeySigner, testnet = false) {
        if (this._initialized)
            return;
        try {
            this.exchange = new exchange_1.ExchangeAPI(testnet, turnkeySigner, this.info, this.rateLimiter, this.symbolConversion, this.walletAddress, this, this.vaultAddress, this.proxy);
            this.custom = new custom_1.CustomOperations(this.exchange, this.info, turnkeySigner, this.symbolConversion, this.walletAddress);
            this.isValidPrivateKey = true;
            this._initialized = true;
            this._initializing = null;
        }
        catch (error) {
            this._initializing = null;
            console.warn("Invalid turnkey signer provided. Some functionalities will be limited.");
            this.isValidPrivateKey = false;
        }
    }
    async ensureInitialized() {
        await this.connect();
    }
    isAuthenticated() {
        this.ensureInitialized();
        return this.isValidPrivateKey;
    }
    async connect() {
        // await this.ws.connect();
        // if (!this.isValidPrivateKey) {
        //   console.warn("Not authenticated. Some WebSocket functionalities may be limited.");
        // }
        if (!this._initialized) {
            if (!this._initializing) {
                this._initializing = this.initializeWithTurnkey(this._turnkeySigner, this._testnet);
            }
            await this._initializing;
        }
    }
    disconnect() {
        this.ws.close();
    }
}
exports.Hyperliquid = Hyperliquid;
__exportStar(require("./types"), exports);
__exportStar(require("./utils/signing"), exports);
//# sourceMappingURL=index.js.map