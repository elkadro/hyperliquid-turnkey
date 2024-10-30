import { encode } from '@msgpack/msgpack';
import { ethers, getBytes, HDNodeWallet, keccak256, type Wallet } from 'ethers';

import type { OrderType, Signature, OrderRequest, CancelOrderRequest, OrderWire } from '../types';
import { TurnkeySigner } from '@alchemy/aa-signers';

const phantomDomain = {
    name: 'Exchange',
    version: '1',
    chainId: 1337,
    verifyingContract: '0x0000000000000000000000000000000000000000',
};

const agentTypes = {
    Agent: [
        { name: 'source', type: 'string' },
        { name: 'connectionId', type: 'bytes32' },
    ],
} as const;

export function orderTypeToWire(orderType: OrderType): OrderType {
    if (orderType.limit) {
        return { limit: orderType.limit };
    } else if (orderType.trigger) {
        return {
            trigger: {
                triggerPx: floatToWire(Number(orderType.trigger.triggerPx)),
                isMarket: orderType.trigger.isMarket,
                tpsl: orderType.trigger.tpsl,
            },
        };
    }
    throw new Error('Invalid order type');
}

function addressToBytes(address: string): Uint8Array {
    return getBytes(address);
}

function actionHash(action: unknown, vaultAddress: string | null, nonce: number): string {
    const msgPackBytes = encode(action);
    const additionalBytesLength = vaultAddress === null ? 9 : 29;
    const data = new Uint8Array(msgPackBytes.length + additionalBytesLength);
    data.set(msgPackBytes);
    const view = new DataView(data.buffer);
    view.setBigUint64(msgPackBytes.length, BigInt(nonce), false);
    if (vaultAddress === null) {
        view.setUint8(msgPackBytes.length + 8, 0);
    } else {
        view.setUint8(msgPackBytes.length + 8, 1);
        data.set(addressToBytes(vaultAddress), msgPackBytes.length + 9);
    }
    return keccak256(data);
}

function constructPhantomAgent(hash: string, isMainnet: boolean) {
    return { source: isMainnet ? 'a' : 'b', connectionId: hash };
}

export async function signL1Action(
    turnkeySigner: TurnkeySigner,
    action: unknown,
    activePool: string | null,
    nonce: number,
    isMainnet: boolean,
): Promise<Signature> {
    const hash = actionHash(action, activePool, nonce);
    const phantomAgent = constructPhantomAgent(hash, isMainnet);
    const data = {
        domain: phantomDomain,
        types: agentTypes,
        primaryType: 'Agent',
        message: phantomAgent,
    };
    return signInner(turnkeySigner, data);
}

export async function signUserSignedAction(
    turnkeySigner: TurnkeySigner,
    action: any,
    payloadTypes: Array<{ name: string; type: string }>,
    primaryType: string,
    isMainnet: boolean
): Promise<Signature> {
    action.signatureChainId = '0x66eee';
    action.hyperliquidChain = isMainnet ? 'Mainnet' : 'Testnet';
    const data = {
        domain: {
            name: 'HyperliquidSignTransaction',
            version: '1',
            chainId: 421614,
            verifyingContract: '0x0000000000000000000000000000000000000000',
        },
        types: {
            [primaryType]: payloadTypes,
        },
        primaryType: primaryType,
        message: action,
    };
    return signInner(turnkeySigner, data);
}

export async function signUsdTransferAction(
    turnkeySigner: TurnkeySigner, action: any, isMainnet: boolean): Promise<Signature> {
    return signUserSignedAction(
        turnkeySigner,
        action,
        [
            { name: 'hyperliquidChain', type: 'string' },
            { name: 'destination', type: 'string' },
            { name: 'amount', type: 'string' },
            { name: 'time', type: 'uint64' },
        ],
        'HyperliquidTransaction:UsdSend',
        isMainnet
    );
}

export async function signWithdrawFromBridgeAction(
    turnkeySigner: TurnkeySigner, action: any, isMainnet: boolean): Promise<Signature> {
    return signUserSignedAction(
        turnkeySigner,
        action,
        [
            { name: 'hyperliquidChain', type: 'string' },
            { name: 'destination', type: 'string' },
            { name: 'amount', type: 'string' },
            { name: 'time', type: 'uint64' },
        ],
        'HyperliquidTransaction:Withdraw',
        isMainnet
    );
}

export async function signAgent(
    turnkeySigner: TurnkeySigner, action: any, isMainnet: boolean): Promise<Signature> {
    return signUserSignedAction(
        turnkeySigner,
        action,
        [
            { name: 'hyperliquidChain', type: 'string' },
            { name: 'agentAddress', type: 'address' },
            { name: 'agentName', type: 'string' },
            { name: 'nonce', type: 'uint64' },
        ],
        'HyperliquidTransaction:ApproveAgent',
        isMainnet
    );
}

async function signInner(
    turnkeySigner: TurnkeySigner, data: any): Promise<Signature> {
    const signature = await turnkeySigner.signTypedData(data);
    return splitSig(signature);
}

function splitSig(sig: string): Signature {
    const { r, s, v } = ethers.Signature.from(sig);
    return { r, s, v };
}

export function floatToWire(x: number): string {
    const rounded = x.toFixed(8);
    if (Math.abs(parseFloat(rounded) - x) >= 1e-12) {
        throw new Error(`floatToWire causes rounding: ${x}`);
    }
    let normalized = rounded.replace(/\.?0+$/, '');
    if (normalized === '-0') normalized = '0';
    return normalized;
}

export function floatToIntForHashing(x: number): number {
    return floatToInt(x, 8);
}

export function floatToUsdInt(x: number): number {
    return floatToInt(x, 6);
}

function floatToInt(x: number, power: number): number {
    const withDecimals = x * Math.pow(10, power);
    if (Math.abs(Math.round(withDecimals) - withDecimals) >= 1e-3) {
        throw new Error(`floatToInt causes rounding: ${x}`);
    }
    return Math.round(withDecimals);
}

export function getTimestampMs(): number {
    return Date.now();
}

export function orderRequestToOrderWire(order: OrderRequest, asset: number): OrderWire {
    const orderWire: OrderWire = {
        a: asset,
        b: order.is_buy,
        p: floatToWire(order.limit_px),
        s: floatToWire(order.sz),
        r: order.reduce_only,
        t: orderTypeToWire(order.order_type),
    };
    if (order.cloid !== undefined) {
        orderWire.c = order.cloid;
    }
    return orderWire;
}

export interface CancelOrderResponse {
    status: string;
    response: {
        type: string;
        data: {
            statuses: string[];
        };
    };
}

export function cancelOrderToAction(cancelRequest: CancelOrderRequest): any {
    return {
        type: 'cancel',
        cancels: [cancelRequest],
    };
}

export function orderWiresToOrderAction(orderWires: OrderWire[]): any {
    return {
        type: 'order',
        orders: orderWires,
        grouping: 'na',
    };
}