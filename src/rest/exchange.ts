import { ethers } from 'ethers';
import { RateLimiter } from '../utils/rateLimiter';
import { HttpApi } from '../utils/helpers';
import { InfoAPI } from './info';
import {
  signL1Action,
  orderRequestToOrderWire,
  orderWiresToOrderAction,
  CancelOrderResponse,
  signUserSignedAction,
  signUsdTransferAction,
  signWithdrawFromBridgeAction,
  removeTrailingZeros,
  orderToWire,
  orderWireToAction,
} from '../utils/signing';
import * as CONSTANTS from '../types/constants';

import {
  CreateVaultRequest,
  CreateVaultResponse,
  VaultDistributeRequest,
  VaultModifyRequest,
  CancelOrderRequest,
  OrderRequest,
  Order
} from '../types/index';

import { ExchangeType, ENDPOINTS } from '../types/constants';
import { SymbolConversion } from '../utils/symbolConversion';
import { floatToWire } from '../utils/signing';
import { Hyperliquid } from '../index';


// const IS_MAINNET = true; // Make sure this matches the IS_MAINNET in signing.ts

export class ExchangeAPI {
  private turnkeySigner: any;
  private httpApi: HttpApi;
  private symbolConversion: SymbolConversion;
  private IS_MAINNET = true;
  private walletAddress: string | null;
  private turnkeySignerAddress: string = "";
  private parent: Hyperliquid;
  private vaultAddress: string | null;
  // Properties for unique nonce generation
  private nonceCounter = 0;
  private lastNonceTimestamp = 0;

  constructor(
    testnet: boolean,
    turnkeySigner: any,
    private info: InfoAPI,
    rateLimiter: RateLimiter,
    symbolConversion: SymbolConversion,
    walletAddress: string | null = null,
    parent: Hyperliquid,
    vaultAddress: string | null = null,
    _proxy?: string | undefined
  ) {
    const baseURL = testnet ? CONSTANTS.BASE_URLS.TESTNET : CONSTANTS.BASE_URLS.PRODUCTION;
    this.IS_MAINNET = !testnet;
    this.httpApi = new HttpApi(baseURL, ENDPOINTS.EXCHANGE, rateLimiter,_proxy);
    this.turnkeySigner = turnkeySigner;
    this.symbolConversion = symbolConversion;
    this.walletAddress = walletAddress;
    this.parent = parent;
    this.vaultAddress = vaultAddress;
    (async () => {
      this.turnkeySignerAddress = await turnkeySigner.getAddress();
    })();
  }

  private async getAssetIndex(symbol: string): Promise<number> {
    const index = await this.symbolConversion.getAssetIndex(symbol);
    if (index === undefined) {
      throw new Error(`Unknown asset: ${symbol}`);
    }
      return index;
  }

  async placeOrder(orderRequest: OrderRequest | Order): Promise<any> {
    const grouping = (orderRequest as any).grouping || "na";
    let builder = (orderRequest as any).builder;
    
    // Normalize builder address to lowercase if it exists
    if (builder) {
      builder = {
        ...builder,
        address: builder.address?.toLowerCase() || builder.b?.toLowerCase()
      };
    }
    
    const ordersArray = (orderRequest as Order).orders ?? [orderRequest as OrderRequest];
    try {
      const assetIndexCache = new Map<string, number>();
      // const assetIndex = await this.getAssetIndex(orderRequest.coin);
      // Normalize price and size values to remove trailing zeros
      const normalizedOrders = ordersArray.map((order: Order) => {
        const normalizedOrder = { ...order };
        
        // Handle price normalization
        if (typeof normalizedOrder.limit_px === 'string') {
          normalizedOrder.limit_px = removeTrailingZeros(normalizedOrder.limit_px);
        }
        
        // Handle size normalization
        if (typeof normalizedOrder.sz === 'string') {
          normalizedOrder.sz = removeTrailingZeros(normalizedOrder.sz);
        }
        
        return normalizedOrder;
      });

      const orderWires = await Promise.all(
        normalizedOrders.map(async (o: Order) => {
          let assetIndex = assetIndexCache.get(o.coin);
          if (assetIndex === undefined) {
            assetIndex = await this.getAssetIndex(o.coin);
            assetIndexCache.set(o.coin, assetIndex);
          }
          return orderToWire(o, assetIndex);
        })
      );

      const actions = orderWireToAction(orderWires, grouping, builder);
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, actions, orderRequest.vaultAddress || null, nonce, this.IS_MAINNET);
      let payload;
      if(orderRequest.vaultAddress) {
        payload = { action: actions, nonce, signature, vaultAddress: orderRequest.vaultAddress || null };
      }
      else {
        payload = { action: actions, nonce, signature };
      }
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Cancel using order id (oid)
  async cancelOrder(cancelRequests: CancelOrderRequest | CancelOrderRequest[], vaultAddress?: string): Promise<CancelOrderResponse> {
    try {
      const cancels = Array.isArray(cancelRequests) ? cancelRequests : [cancelRequests];
      
      // Ensure all cancel requests have asset indices
      const cancelsWithIndices = await Promise.all(cancels.map(async (req) => ({
        ...req,
        a: await this.getAssetIndex(req.coin)
      })));
  
      const action = {
        type: ExchangeType.CANCEL,
        cancels: cancelsWithIndices.map(({ a, o }) => ({ a, o }))
      };
      
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, vaultAddress || null, nonce, this.IS_MAINNET);
      let payload;
      if(vaultAddress) {
      payload = { action, nonce, signature, vaultAddress: vaultAddress };
      }
      else {
        payload = { action, nonce, signature };
      }
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Cancel using a CLOID
  async cancelOrderByCloid(symbol: string, cloid: string, vaultAddress?: string): Promise<any> {
    try {
      const assetIndex = await this.getAssetIndex(symbol);
      const action = {
        type: ExchangeType.CANCEL_BY_CLOID,
        cancels: [{ asset: assetIndex, cloid }]
      };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, vaultAddress || null, nonce, this.IS_MAINNET);
      let payload;
      if(vaultAddress) {
        payload = { action, nonce, signature, vaultAddress: vaultAddress };
      }else
      {
        payload = { action, nonce, signature };
      }
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Modify a single order
  async modifyOrder(oid: number, orderRequest: OrderRequest): Promise<any> {
    try {
      const assetIndex = await this.getAssetIndex(orderRequest.coin);

      const orderWire = orderRequestToOrderWire(orderRequest, assetIndex);
      const action = {
        type: ExchangeType.MODIFY,
        oid,
        order: orderWire
      };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, orderRequest.vaultAddress || null, nonce, this.IS_MAINNET);
      let payload;
      if(orderRequest.vaultAddress) {
      payload = { action, nonce, signature, vaultAddress: orderRequest.vaultAddress };
      }
      else {
        payload = { action, nonce, signature };
      }
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Modify multiple orders at once
  async batchModifyOrders(modifies: Array<{ oid: number, order: OrderRequest }>, vaultAddress?: string): Promise<any> {
    try {
      // First, get all asset indices in parallel
      const assetIndices = await Promise.all(
        modifies.map(m => this.getAssetIndex(m.order.coin))
      );
  
      const action = {
        type: ExchangeType.BATCH_MODIFY,
        modifies: modifies.map((m, index) => {

          return {
            oid: m.oid,
            order: orderRequestToOrderWire(m.order, assetIndices[index])
          };
        })
      };
  
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, vaultAddress || null, nonce, this.IS_MAINNET);
      let payload;
      if(vaultAddress) {
      payload = { action, nonce, signature, vaultAddress: vaultAddress };
      }
      else {
        payload = { action, nonce, signature };
      }
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Update leverage. Set leverageMode to "cross" if you want cross leverage, otherwise it'll set it to "isolated by default"
  async updateLeverage(symbol: string, leverageMode: string, leverage: number, vaultAddress?: string): Promise<any> {
    try {
      const assetIndex = await this.getAssetIndex(symbol);
      const action = {
        type: ExchangeType.UPDATE_LEVERAGE,
        asset: assetIndex,
        isCross: leverageMode === "cross",
        leverage: leverage
      };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, vaultAddress || null, nonce, this.IS_MAINNET);
      let payload;
      if(vaultAddress) {
      payload = { action, nonce, signature, vaultAddress: vaultAddress };
      }
      else {
        payload = { action, nonce, signature };
      }
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Update how much margin there is on a perps position
  async updateIsolatedMargin(symbol: string, isBuy: boolean, ntli: number, vaultAddress?: string): Promise<any> {
    try {
      const assetIndex = await this.getAssetIndex(symbol);
      const action = {
        type: ExchangeType.UPDATE_ISOLATED_MARGIN,
        asset: assetIndex,
        isBuy,
        ntli
      };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, vaultAddress || null, nonce, this.IS_MAINNET);
      let payload;
      if(vaultAddress) {
      payload = { action, nonce, signature, vaultAddress: vaultAddress };
      }
      else {
        payload = { action, nonce, signature };
      }
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Takes from the perps wallet and sends to another wallet without the $1 fee (doesn't touch bridge, so no fees)
  async usdTransfer(destination: string, amount: number): Promise<any> {
    try {
      const action = {
        type: ExchangeType.USD_SEND,
        hyperliquidChain: this.IS_MAINNET ? 'Mainnet' : 'Testnet',
        signatureChainId: '0xa4b1',
        destination: destination,
        amount: amount.toString(),
        time: Date.now()
      };
      const signature = await signUsdTransferAction(this.turnkeySigner, action, this.IS_MAINNET);

      const payload = { action, nonce: action.time, signature };
      return this.httpApi.makeRequest(payload, 1, this.walletAddress || this.turnkeySignerAddress);
    } catch (error) {
      throw error;
    }
  }

  //Transfer SPOT assets i.e PURR to another wallet (doesn't touch bridge, so no fees)
  async spotTransfer(destination: string, token: string, amount: string): Promise<any> {
    try {
      const action = {
        type: ExchangeType.SPOT_SEND,
        hyperliquidChain: this.IS_MAINNET ? 'Mainnet' : 'Testnet',
        signatureChainId: '0xa4b1',
        destination,
        token,
        amount,
        time: Date.now()
      };
      const signature = await signUserSignedAction(
        this.turnkeySigner,
        action,
        [
          { name: 'hyperliquidChain', type: 'string' },
          { name: 'destination', type: 'string' },
          { name: 'token', type: 'string' },
          { name: 'amount', type: 'string' },
          { name: 'time', type: 'uint64' }
        ],
        'HyperliquidTransaction:SpotSend', this.IS_MAINNET
      );

      const payload = { action, nonce: action.time, signature };
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Withdraw USDC, this txn goes across the bridge and costs $1 in fees as of writing this
  async initiateWithdrawal(destination: string, amount: number): Promise<any> {
    try {
      const action = {
        type: ExchangeType.WITHDRAW,
        hyperliquidChain: this.IS_MAINNET ? 'Mainnet' : 'Testnet',
        signatureChainId: '0xa4b1',
        destination: destination,
        amount: amount.toString(),
        time: Date.now()
      };
      const signature = await signWithdrawFromBridgeAction(this.turnkeySigner, action, this.IS_MAINNET);

      const payload = { action, nonce: action.time, signature };
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Transfer between spot and perpetual wallets (intra-account transfer)
  async transferBetweenSpotAndPerp(usdc: number, toPerp: boolean): Promise<any> {
    try {
      const action = {
        type: ExchangeType.SPOT_USER,
        classTransfer: {
          usdc: usdc * 1e6,
          toPerp: toPerp
        }
      };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, null, nonce, this.IS_MAINNET);

      const payload = { action, nonce, signature };
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Schedule a cancel for a given time (in ms) //Note: Only available once you've traded $1 000 000 in volume
  async scheduleCancel(time: number | null): Promise<any> {
    try {
      const action = { type: ExchangeType.SCHEDULE_CANCEL, time };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, null, nonce, this.IS_MAINNET);

      const payload = { action, nonce, signature };
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  //Transfer between vault and perpetual wallets (intra-account transfer)
  async vaultTransfer(vaultAddress: string, isDeposit: boolean, usd: number): Promise<any> {
    try {
      const action = {
        type: ExchangeType.VAULT_TRANSFER,
        vaultAddress,
        isDeposit,
        usd
      };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, null, nonce, this.IS_MAINNET);

      const payload = { action, nonce, signature };
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  async setReferrer(code: string): Promise<any> {
    try {
      const action = {
        type: ExchangeType.SET_REFERRER,
        code
      };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, null, nonce, this.IS_MAINNET);

      const payload = { action, nonce, signature };
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }
  async createVault(name: string, description: string, initialUsd: number): Promise<CreateVaultResponse> {
    await this.parent.ensureInitialized();
    try {
      const action = {
        type: ExchangeType.CREATE_VAULT,
        name,
        description,
        initialUsd
      };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, null, nonce, this.IS_MAINNET);

      const payload = { action, nonce, signature };
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  // Distribute funds from a vault between followers
  async vaultDistribute(vaultAddress: string, usd: number): Promise<any> {
    await this.parent.ensureInitialized();
    try {
      const action = {
        type: ExchangeType.VAULT_DISTRIBUTE,
        vaultAddress,
        usd
      };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, null, nonce, this.IS_MAINNET);

      const payload = { action, nonce, signature };
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  // Modify a vault's configuration
  async vaultModify(vaultAddress: string, allowDeposits: boolean | null, alwaysCloseOnWithdraw: boolean | null): Promise<any> {
    await this.parent.ensureInitialized();
    try {
      const action = {
        type: ExchangeType.VAULT_MODIFY,
        vaultAddress,
        allowDeposits,
        alwaysCloseOnWithdraw
      };
      const nonce = this.generateUniqueNonce();
      const signature = await signL1Action(this.turnkeySigner, action, null, nonce, this.IS_MAINNET);

      const payload = { action, nonce, signature };
      return this.httpApi.makeRequest(payload, 1);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generates a unique nonce by using the current timestamp in milliseconds
   * If multiple calls happen in the same millisecond, it ensures the nonce is still increasing
   * @returns A unique nonce value
   */
  private generateUniqueNonce(): number {
    const timestamp = Date.now();
    
    // Ensure the nonce is always greater than the previous one
    if (timestamp <= this.lastNonceTimestamp) {
      // If we're in the same millisecond, increment by 1 from the last nonce
      this.lastNonceTimestamp += 1;
      return this.lastNonceTimestamp;
    }
    
    // Otherwise use the current timestamp
    this.lastNonceTimestamp = timestamp;
    return timestamp;
  }
}
