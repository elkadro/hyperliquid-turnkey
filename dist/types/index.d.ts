export type Tif = 'Alo' | 'Ioc' | 'Gtc';
export type Tpsl = 'tp' | 'sl';
export type LimitOrderType = {
    tif: Tif;
};
export type TriggerOrderType = {
    triggerPx: string | number;
    isMarket: boolean;
    tpsl: Tpsl;
};
export type Grouping = 'na' | 'normalTpsl' | 'positionTpsl';
export type OrderType = {
    limit?: LimitOrderType;
    trigger?: TriggerOrderTypeWire;
};
export type Cloid = string;
export type OidOrCloid = number | Cloid;
export interface AllMids {
    [coin: string]: string;
}
export interface Meta {
    universe: {
        name: string;
        szDecimals: number;
        maxLeverage: number;
        onlyIsolated: boolean;
    }[];
}
export interface ClearinghouseState {
    assetPositions: {
        position: {
            coin: string;
            cumFunding: {
                allTime: string;
                sinceChange: string;
                sinceOpen: string;
            };
            entryPx: string;
            leverage: {
                rawUsd: string;
                type: string;
                value: number;
            };
            liquidationPx: string;
            marginUsed: string;
            maxLeverage: number;
            positionValue: string;
            returnOnEquity: string;
            szi: string;
            unrealizedPnl: string;
        };
        type: string;
    }[];
    crossMaintenanceMarginUsed: string;
    crossMarginSummary: {
        accountValue: string;
        totalMarginUsed: string;
        totalNtlPos: string;
        totalRawUsd: string;
    };
    marginSummary: {
        accountValue: string;
        totalMarginUsed: string;
        totalNtlPos: string;
        totalRawUsd: string;
    };
    time: number;
    withdrawable: string;
}
export interface UserFills {
    closedPnl: string;
    coin: string;
    crossed: boolean;
    dir: string;
    hash: string;
    oid: number;
    px: string;
    side: string;
    startPosition: string;
    sz: string;
    time: number;
}
export interface OrderResponse {
    status: string;
    response: {
        type: string;
        data: {
            statuses: Array<{
                resting?: {
                    oid: number;
                };
                filled?: {
                    oid: number;
                };
            }>;
        };
    };
}
export interface WsTrade {
    coin: string;
    side: string;
    px: string;
    sz: string;
    hash: string;
    time: number;
    tid: number;
}
export interface WsBook {
    coin: string;
    levels: [Array<WsLevel>, Array<WsLevel>];
    time: number;
}
export interface WsLevel {
    px: string;
    sz: string;
    n: number;
}
export interface WsOrder {
    order: {
        coin: string;
        side: string;
        limitPx: string;
        sz: string;
        oid: number;
        timestamp: number;
        origSz: string;
    };
    status: string;
    statusTimestamp: number;
    user: string;
}
export type WsUserEvent = (WsFill[] | WsUserFunding | WsLiquidation | WsNonUserCancel[]) & {
    user: string;
};
export interface WsFill {
    coin: string;
    px: string;
    sz: string;
    side: string;
    time: number;
    startPosition: string;
    dir: string;
    closedPnl: string;
    hash: string;
    oid: number;
    crossed: boolean;
    fee: string;
    tid: number;
}
export interface WsUserFunding {
    time: number;
    coin: string;
    usdc: string;
    szi: string;
    fundingRate: string;
}
export interface WsLiquidation {
    lid: number;
    liquidator: string;
    liquidated_user: string;
    liquidated_ntl_pos: string;
    liquidated_account_value: string;
}
export interface WsNonUserCancel {
    coin: string;
    oid: number;
}
export interface SpotClearinghouseState {
    balances: {
        coin: string;
        hold: string;
        total: string;
    }[];
}
export interface FrontendOpenOrders {
    coin: string;
    isPositionTpsl: boolean;
    isTrigger: boolean;
    limitPx: string;
    oid: number;
    orderType: string;
    origSz: string;
    reduceOnly: boolean;
    side: string;
    sz: string;
    timestamp: number;
    triggerCondition: string;
    triggerPx: string;
}
export interface UserFills {
    closedPnl: string;
    coin: string;
    crossed: boolean;
    dir: string;
    hash: string;
    oid: number;
    px: string;
    side: string;
    startPosition: string;
    sz: string;
    time: number;
}
export interface UserRateLimit {
    [key: string]: any;
}
export interface OrderStatus {
    [key: string]: any;
}
export interface L2Book {
    levels: [
        {
            px: string;
            sz: string;
            n: number;
        }[],
        {
            px: string;
            sz: string;
            n: number;
        }[]
    ];
}
export interface CandleSnapshot {
    T: number;
    c: string;
    h: string;
    i: string;
    l: string;
    n: number;
    o: string;
    s: string;
    t: number;
    v: string;
}
export interface AssetCtx {
    dayNtlVlm: string;
    funding: string;
    impactPxs: [string, string];
    markPx: string;
    midPx: string;
    openInterest: string;
    oraclePx: string;
    premium: string;
    prevDayPx: string;
}
export interface MetaAndAssetCtxs {
    meta: Meta;
    assetCtxs: AssetCtx[];
}
export interface UserFundingDelta {
    coin: string;
    fundingRate: string;
    szi: string;
    type: "funding";
    usdc: string;
}
export interface UserFundingEntry {
    delta: UserFundingDelta;
    hash: string;
    time: number;
}
export type UserFunding = UserFundingEntry[];
export interface UserNonFundingLedgerDelta {
    coin: string;
    type: "deposit" | "withdraw" | "transfer" | "liquidation";
    usdc: string;
}
export interface UserNonFundingLedgerEntry {
    delta: UserNonFundingLedgerDelta;
    hash: string;
    time: number;
}
export type UserNonFundingLedgerUpdates = UserNonFundingLedgerEntry[];
export interface FundingHistoryEntry {
    coin: string;
    fundingRate: string;
    premium: string;
    time: number;
}
export type FundingHistory = FundingHistoryEntry[];
export interface SpotToken {
    name: string;
    szDecimals: number;
    weiDecimals: number;
    index: number;
    tokenId: string;
    isCanonical: boolean;
}
export interface SpotMarket {
    name: string;
    tokens: [number, number];
    index: number;
    isCanonical: boolean;
}
export interface SpotMeta {
    tokens: SpotToken[];
    universe: SpotMarket[];
}
export interface SpotAssetCtx {
    dayNtlVlm: string;
    markPx: string;
    midPx: string;
    prevDayPx: string;
}
export interface SpotMetaAndAssetCtxs {
    meta: SpotMeta;
    assetCtxs: SpotAssetCtx[];
}
export interface UserOpenOrder {
    coin: string;
    limitPx: string;
    oid: number;
    side: string;
    sz: string;
    timestamp: number;
}
export type UserOpenOrders = UserOpenOrder[];
export interface OrderRequest {
    coin: string;
    is_buy: boolean;
    sz: number;
    limit_px: number;
    order_type: OrderType;
    reduce_only: boolean;
    cloid?: Cloid;
    vaultAddress?: string;
}
export interface OrderWire {
    a: number;
    b: boolean;
    p: string;
    s: string;
    r: boolean;
    t: OrderType;
    c?: string;
}
export interface TriggerOrderTypeWire {
    triggerPx: number | string;
    isMarket: boolean;
    tpsl: Tpsl;
}
export type OrderTypeWire = {
    limit?: LimitOrderType;
    trigger?: TriggerOrderTypeWire;
};
export interface CancelOrderRequest {
    coin: string;
    o: number;
}
export type CancelOrderRequests = {
    a: number;
    o: number;
}[];
export interface CancelByCloidRequest {
    coin: string;
    cloid: Cloid;
}
export interface ModifyRequest {
    oid: OidOrCloid;
    order: OrderRequest;
}
export interface ModifyWire {
    oid: number;
    order: OrderWire;
}
export interface ScheduleCancelAction {
    type: 'scheduleCancel';
    time?: number | null;
}
export interface Signature {
    r: string;
    s: string;
    v: number;
}
export interface Notification {
    notification: string;
    user: string;
}
export interface WebData2 {
    [key: string]: any;
}
export interface Candle {
    t: number;
    T: number;
    s: string;
    i: string;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    coin: string;
    interval: string;
}
export interface WsUserFill {
    coin: string;
    px: string;
    sz: string;
    side: string;
    time: number;
    startPosition: string;
    dir: string;
    closedPnl: string;
    hash: string;
    oid: number;
    crossed: boolean;
    fee: string;
    tid: number;
}
export type WsUserFills = {
    isSnapshot: boolean;
    fills: WsUserFill[];
    user: string;
};
export interface WsUserFunding {
    time: number;
    coin: string;
    usdc: string;
    szi: string;
    fundingRate: string;
}
export type WsUserFundings = {
    isSnapshot: boolean;
    fundings: WsUserFunding[];
    user: string;
};
export interface WsUserNonFundingLedgerUpdate {
    time: number;
    coin: string;
    usdc: string;
    type: 'deposit' | 'withdraw' | 'transfer' | 'liquidation';
}
export type WsUserNonFundingLedgerUpdates = {
    isSnapshot: boolean;
    updates: WsUserNonFundingLedgerUpdate[];
    user: string;
};
export interface CreateVaultRequest {
    name: string;
    description: string;
    initialUsd: number;
}
export interface CreateVaultResponse {
    status: string;
    response: {
        type: string;
        data: string;
    };
}
export interface VaultDistributeRequest {
    vaultAddress: string;
    usd: number;
}
export interface VaultModifyRequest {
    vaultAddress: string;
    allowDeposits: boolean | null;
    alwaysCloseOnWithdraw: boolean | null;
}
export interface VaultFollower {
    user: string;
    vaultEquity: string;
    pnl: string;
    allTimePnl: string;
    daysFollowing: number;
    vaultEntryTime: number;
    lockupUntil: number;
}
export interface PortfolioPeriodData {
    accountValueHistory: [number, string][];
    pnlHistory: [number, string][];
    vlm: string;
}
export interface VaultDetails {
    name: string;
    vaultAddress: string;
    leader: string;
    description: string;
    portfolio: [string, PortfolioPeriodData][];
    apr: number;
    followerState: any;
    leaderFraction: number;
    leaderCommission: number;
    followers: VaultFollower[];
    maxDistributable: number;
    maxWithdrawable: number;
    isClosed: boolean;
    relationship: {
        type: string;
        data: {
            childAddresses: string[];
        };
    };
    allowDeposits: boolean;
    alwaysCloseOnWithdraw: boolean;
}
export interface VaultEquity {
    vaultAddress: string;
    equity: string;
}
export interface HistoricalOrder {
    order: {
        coin: string;
        side: string;
        limitPx: string;
        sz: string;
        oid: number;
        timestamp: number;
        triggerCondition: string;
        isTrigger: boolean;
        triggerPx: string;
        children: any[];
        isPositionTpsl: boolean;
        reduceOnly: boolean;
        orderType: string;
        origSz: string;
        tif: string;
        cloid: string | null;
    };
    status: 'filled' | 'open' | 'canceled' | 'triggered' | 'rejected' | 'marginCanceled';
    statusTimestamp: number;
}
export interface TwapSliceFill {
    fill: {
        closedPnl: string;
        coin: string;
        crossed: boolean;
        dir: string;
        hash: string;
        oid: number;
        px: string;
        side: string;
        startPosition: string;
        sz: string;
        time: number;
        fee: string;
        feeToken: string;
        tid: number;
    };
    twapId: number;
}
export interface ApproveAgentRequest {
    agentAddress: string;
    agentName?: string;
}
export interface ApproveBuilderFeeRequest {
    maxFeeRate: string;
    builder: string;
}
export interface Delegation {
    validator: string;
    amount: string;
    lockedUntilTimestamp: number;
}
export interface DelegatorSummary {
    delegated: string;
    undelegated: string;
    totalPendingWithdrawal: string;
    nPendingWithdrawals: number;
}
export interface DelegatorHistoryEntry {
    time: number;
    hash: string;
    delta: {
        delegate: {
            validator: string;
            amount: string;
            isUndelegate: boolean;
        };
    };
}
export interface DelegatorReward {
    time: number;
    source: string;
    totalAmount: string;
}
export type PerpsAtOpenInterestCap = string[];
export type UserRole = "missing" | "user" | "agent" | "vault" | "subAccount";
export interface WsActiveAssetCtx {
    coin: string;
    ctx: {
        dayNtlVlm: string;
        prevDayPx: string;
        markPx: string;
        midPx?: string;
        funding?: number;
        openInterest?: number;
        oraclePx?: number;
        circulatingSupply?: number;
    };
}
export interface WsActiveSpotAssetCtx {
    coin: string;
    ctx: {
        dayNtlVlm: string;
        prevDayPx: string;
        markPx: string;
        midPx?: string;
        circulatingSupply: string;
    };
}
export interface WsTwapState {
    coin: string;
    user: string;
    side: string;
    sz: number;
    executedSz: number;
    executedNtl: number;
    minutes: number;
    reduceOnly: boolean;
    randomize: boolean;
    timestamp: number;
}
export type WsTwapStatus = "activated" | "terminated" | "finished" | "error";
export interface WsTwapHistory {
    state: WsTwapState;
    status: {
        status: WsTwapStatus;
        description: string;
    };
    time: number;
}
export interface WsTwapHistoryResponse {
    isSnapshot: boolean;
    user: string;
    history: WsTwapHistory[];
}
export interface WsTwapSliceFill {
    isSnapshot?: boolean;
    user: string;
    twapSliceFills: Array<{
        fill: {
            closedPnl: string;
            coin: string;
            crossed: boolean;
            dir: string;
            hash: string;
            oid: number;
            px: string;
            side: string;
            startPosition: string;
            sz: string;
            time: number;
            fee: string;
            feeToken: string;
            tid: number;
        };
        twapId: number;
    }>;
}
export interface ValidatorStats {
    uptimeFraction: string;
    predictedApr: string;
    nSamples: number;
}
export interface ValidatorSummary {
    validator: string;
    signer: string;
    name: string;
    description: string;
    nRecentBlocks: number;
    stake: number;
    isJailed: boolean;
    unjailableAfter: number | null;
    isActive: boolean;
    commission: string;
    stats: [
        [
            "day",
            ValidatorStats
        ],
        [
            "week",
            ValidatorStats
        ],
        [
            "month",
            ValidatorStats
        ]
    ];
}
export interface VaultRelationship {
    type: "normal" | "child" | "parent";
    data?: {
        childAddresses: string[];
    };
}
export interface VaultSummary {
    name: string;
    vaultAddress: string;
    leader: string;
    tvl: string;
    isClosed: boolean;
    relationship: VaultRelationship;
    createTimeMillis: number;
}
export interface TxDetails {
    action: {
        type: string;
        [key: string]: unknown;
    };
    block: number;
    error: string | null;
    hash: string;
    time: number;
    user: string;
}
export interface BlockDetails {
    blockTime: number;
    hash: string;
    height: number;
    numTxs: number;
    proposer: string;
    txs: TxDetails[];
}
export interface BlockDetailsResponse {
    type: "blockDetails";
    blockDetails: BlockDetails;
}
export interface TxDetailsResponse {
    type: "txDetails";
    tx: TxDetails;
}
export interface UserDetailsResponse {
    type: "userDetails";
    txs: TxDetails[];
}
export interface UserFees {
    dailyUserVlm: {
        date: string;
        userCross: string;
        userAdd: string;
        exchange: string;
    }[];
    feeSchedule: {
        cross: string;
        add: string;
        tiers: {
            vip: {
                ntlCutoff: string;
                cross: string;
                add: string;
            }[];
            mm: {
                makerFractionCutoff: string;
                add: string;
            }[];
        };
        referralDiscount: string;
    };
    userCrossRate: string;
    userAddRate: string;
    activeReferralDiscount: string;
    trial: unknown | null;
    feeTrialReward: string;
    nextTrialAvailableTimestamp: unknown | null;
}
