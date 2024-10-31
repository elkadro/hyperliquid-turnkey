import type { OrderType, Signature, OrderRequest, CancelOrderRequest, OrderWire } from '../types';
export declare function orderTypeToWire(orderType: OrderType): OrderType;
export declare function signL1Action(turnkeySigner: any, action: unknown, activePool: string | null, nonce: number, isMainnet: boolean): Promise<Signature>;
export declare function signUserSignedAction(turnkeySigner: any, action: any, payloadTypes: Array<{
    name: string;
    type: string;
}>, primaryType: string, isMainnet: boolean): Promise<Signature>;
export declare function signUsdTransferAction(turnkeySigner: any, action: any, isMainnet: boolean): Promise<Signature>;
export declare function signWithdrawFromBridgeAction(turnkeySigner: any, action: any, isMainnet: boolean): Promise<Signature>;
export declare function signAgent(turnkeySigner: any, action: any, isMainnet: boolean): Promise<Signature>;
export declare function floatToWire(x: number): string;
export declare function floatToIntForHashing(x: number): number;
export declare function floatToUsdInt(x: number): number;
export declare function getTimestampMs(): number;
export declare function orderRequestToOrderWire(order: OrderRequest, asset: number): OrderWire;
export interface CancelOrderResponse {
    status: string;
    response: {
        type: string;
        data: {
            statuses: string[];
        };
    };
}
export declare function cancelOrderToAction(cancelRequest: CancelOrderRequest): any;
export declare function orderWiresToOrderAction(orderWires: OrderWire[]): any;
