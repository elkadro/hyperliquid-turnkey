# Hyperliquid Turnkey API SDK

Typescript SDK to more easily interact with Hyperliquid's API through Turnkey signer

All info on the Hyperliquid API can be found here: [HyperLiquid API Documentation](https://hyperliquid.gitbook.io/hyperliquid-docs)

## Important
This project supports multiple-client per machine but caching the perpMeta and spotMeta in your codebase since each one costs 20 tokens to call the api. Hence now you can create alot of clients and pass to them the global spotMeta and perpMeta. The old sdk used to call them for each client periodically.

## Current Version updates for v1.4.7:
-Spot meta and PERP meta were being called upon client creation. Now they will be called once if the supplied meta contructor params are empty
-Added meta contructor params so you can cache them outside the client (they cost 20 tokens each to request from the api!)
-Changed the rate limiter and made it smooth

## Installation

```bash
yarn add hyperliquid-sdk-turnkey @alchemy/aa-signers
```

## Usage if multiple clients (one client per turnkey signer) on one IP address
**Description**: If using multiple clients on same machine, the rate limit inside the client itself will be useless since it is for that client only while the api charges you per IP address. You can enforce the same ratelimit outside in your own codebase and make sure to call waitForToken function everywhere. This will be different from the rate limiter inside the hyperliquid sdk.

**API Agent Wallet Usage:** If you are using API Agent wallets everything works as normal but you need to add your actual account's wallet address in the Hyperliquid object field 'walletAddress'. The wallet is the same address inside turnkey signer object.

```typescript
import { Hyperliquid, OrderRequest } from "hyperliquid-sdk-turnkey";
const { TurnkeySigner } = require('@alchemy/aa-signers/turnkey');

/// If using multiple clients on one machine, one client per turnkey
let spotMeta: any = [];
let perpMeta: any = [];
let lastUpdated: number = 0; // Timestamp of the last update

export const getTurnkeySigner = async (subOrganizationId: string, ethereumAddress: string, rpcUrl: string) => {
  const signer = new TurnkeySigner({
    apiUrl: process.env.TURNKEY_BASE_URL || "https://api.turnkey.com",
    stamper: stamper,
  });

  const authParams = {
    resolveSubOrganization: async () => new TurnkeySubOrganization({
      subOrganizationId: subOrganizationId,
      signWith: ethereumAddress,
    }),
    transport: http(rpcUrl) as HttpTransport,  // Cast to Transport if necessary
  };
  
  await signer.authenticate(authParams);

  return signer;
};

export async function populateAndUseVariables(hyperliquid: Hyperliquid, rateLimiter: RateLimiter): Promise<void> {
  const now = Date.now();
  // Populate variables if they are empty or a minute has passed
  if (spotMeta.length === 0 || perpMeta.length === 0 || now - lastUpdated > 60 * 1000) {
      console.log("Hyperliquid: Populating meta");
      // Enforce an external global rate limiter (not included) if using multiple clients on the same machine
      // await rateLimiter.waitForToken(2);
      perpMeta = await hyperliquid.info.getMetaAndAssetCtxs(true);
      // Enforce an external global rate limiter (not included) if using multiple clients on the same machine
      // await rateLimiter.waitForToken(2);
      spotMeta = await hyperliquid.info.getSpotMetaAndAssetCtxs(true);
      lastUpdated = now; // Update the timestamp
  }
}

export async function getHyperliquidClient(turnkeySigner: TurnkeySigner, walletAddress: string) => {
const sdk = new Hyperliquid(
  <turnkeySigner - TurnkeySigner>,
  <testnet - boolean (OPTIONAL)>,
  <walletAddress - string (Required if you are using an API Agent Wallet, otherwise not necessary)>
  <perpMeta - Array (Get it from the global the perpMeta)>
  <spotMeta - Array (Get it from the global spotMeta)>
);
await populateAndUseVariables(hyperLiquidClient);
return sdk;
}

// Use the SDK methods

//Initiate your turnkeySigner your way if you need to change
const turnkeySigner = getTurnkeySigner(...)
// Deduce the walletAddress from the signer or use turnkey api
const walletAddress = ...
const sdk = await getHyperLiquidClient(turnkeySigner,walletAddress);
// Enforce an external global rate limiter (not included) if using multiple clients on the same machine
sdk.info.getAllMids().then(allMids => {
  console.log(allMids);
});
```

## Symbol Naming Convention

Instead of using native symbols (which can be confusing, like @1, @4, @5 for spot and only the coin name for perps), we've implemented a more intuitive naming system:

- For perpetuals: `<coin>-PERP` (e.g., BTC-PERP, ETH-PERP)
- For spot: `<coin>-SPOT` (e.g., PURR-SPOT, BTC-SPOT)

This convention makes it easier to distinguish between spot and perpetual markets.



## Examples


### Exchange API Methods

```typescript
// Place an order
sdk.exchange.placeOrder({
  coin: 'BTC-PERP',
  is_buy: true,
  sz: 1,
  limit_px: 30000,
  order_type: { limit: { tif: 'Gtc' } },
  reduce_only: false
  //vaultAddress <str> - optional field in case you are using vaults 
}).then(placeOrderResult => {
  console.log(placeOrderResult);
}).catch(error => {
  console.error('Error placing order:', error);
});

// Cancel an order
sdk.exchange.cancelOrder({
  coin: 'BTC-PERP',
  o: 123456 // order ID
}).then(cancelOrderResult => {
  console.log(cancelOrderResult);
}).catch(error => {
  console.error('Error cancelling order:', error);
});

// Transfer between perpetual and spot accounts
sdk.exchange.transferBetweenSpotAndPerp(100, true) // Transfer 100 USDC from spot to perp
  .then(transferResult => {
    console.log(transferResult);
  }).catch(error => {
    console.error('Error transferring funds:', error);
  });
```
All methods supported can be found here: [Hyperliquid Exchange Endpoint API Documentation](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)



### General Info Methods

```typescript
// Get all mids
sdk.info.getAllMids().then(allMids => {
  console.log(allMids);
}).catch(error => {
  console.error('Error getting all mids:', error);
});

// Get user open orders
sdk.info.getUserOpenOrders('user_address_here').then(userOpenOrders => {
  console.log(userOpenOrders);
}).catch(error => {
  console.error('Error getting user open orders:', error);
});

// Get L2 order book
sdk.info.getL2Book('BTC-PERP').then(l2Book => {
  console.log(l2Book);
}).catch(error => {
  console.error('Error getting L2 book:', error);
});
```

All methods supported can be found here: [Hyperliquid Info Endpoint API Documentation](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint)


### WebSocket Methods

```typescript
const { Hyperliquid } = require('hyperliquid');

async function testWebSocket() {
    // Create a new Hyperliquid instance
    // You can pass a private key here if you need authenticated access
    const sdk = new Hyperliquid();

    try {
        // Connect to the WebSocket
        await sdk.connect();
        console.log('Connected to WebSocket');

        // Subscribe to get latest prices for all coins
        sdk.subscriptions.subscribeToAllMids((data) => {
            console.log('Received trades data:', data);
        });
        
        // Get updates anytime the user gets new fills
        sdk.subscriptions.subscribeToUserFills("<wallet_address_here>", (data) => {
            console.log('Received user fills data:', data);
        });
        
        // Get updates on 1 minute ETH-PERP candles
        sdk.subscriptions.subscribeToCandle("BTC-PERP", "1m", (data) => {
            console.log('Received candle data:', data);
        });

        // Keep the script running
        await new Promise(() => {});
    } catch (error) {
        console.error('Error:', error);
    }
}

testWebSocket();
```


### Spot Info Methods

```typescript
//Get spot metadata
sdk.info.spot.getSpotMeta().then(spotMeta => {
  console.log(spotMeta);
}).catch(error => {
  console.error('Error getting spot metadata:', error);
});

// Get spot clearinghouse state
sdk.info.spot.getSpotClearinghouseState('user_address_here').then(spotClearinghouseState => {
  console.log(spotClearinghouseState);
}).catch(error => {
  console.error('Error getting spot clearinghouse state:', error);
});
```
All methods supported can be found here: [Hyperliquid Spot Info Endpoint API Documentation](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot)



### Perpetuals Info Methods

```typescript
// Get perpetuals metadata
sdk.info.perpetuals.getMeta().then(perpsMeta => {
  console.log(perpsMeta);
}).catch(error => {
  console.error('Error getting perpetuals metadata:', error);
});

// Get user's perpetuals account summary
sdk.info.perpetuals.getClearinghouseState('user_address_here').then(clearinghouseState => {
  console.log(clearinghouseState);
}).catch(error => {
  console.error('Error getting clearinghouse state:', error);
});
```
All methods supported can be found here: [Hyperliquid Perpetuals Info Endpoint API Documentation](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals)


### Custom Methods

```typescript
// Cancel all orders
sdk.custom.cancelAllOrders().then(cancelAllResult => {
  console.log(cancelAllResult);
}).catch(error => {
  console.error('Error cancelling all orders:', error);
});

// Cancel all orders for a specific symbol
sdk.custom.cancelAllOrders('BTC-PERP').then(cancelAllBTCResult => {
  console.log(cancelAllBTCResult);
}).catch(error => {
  console.error('Error cancelling all BTC-PERP orders:', error);
});

// Get all tradable assets
const allAssets = sdk.custom.getAllAssets();
console.log(allAssets);
```
All Custom methods are listed above. These are custom methods that are not part of the official Hyperliquid API. As more are added we will add examples for them here.



## Documentation

For more detailed documentation on all available methods and their parameters, please refer to the [official Hyperliquid API documentation](https://hyperliquid.gitbook.io/hyperliquid-docs/).



## License

MIT
