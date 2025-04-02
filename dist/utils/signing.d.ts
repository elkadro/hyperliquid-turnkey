import type { OrderType, Signature, OrderRequest, CancelOrderRequest, OrderWire, Order, Grouping, Builder } from '../types';
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
export declare function orderToWire(order: Order, asset: number): OrderWire;
export declare function orderWireToAction(orders: OrderWire[], grouping?: Grouping, builder?: Builder): any;
export interface CancelOrderResponse {
    status: string;
    response: {
        type: string;
        data: {
            statuses: string[];
        };
    };
}
/**
 * Removes trailing zeros from a string representation of a number.
 * This is useful when working with price and size fields directly.
 *
 * Hyperliquid API requires that price ('p') and size ('s') fields do not contain trailing zeros.
 * For example, "12345.0" should be "12345" and "0.123450" should be "0.12345".
 * This function ensures that all numeric string values are properly formatted.
 *
 * @param value - The string value to normalize
 * @returns The normalized string without trailing zeros
 */
export declare function removeTrailingZeros(value: string): string;
/**
 * Normalizes an object by removing trailing zeros from price ('p') and size ('s') fields.
 * This is useful when working with actions that contain these fields.
 *
 * Hyperliquid API requires that price ('p') and size ('s') fields do not contain trailing zeros.
 * This function recursively processes an object and its nested properties to ensure all
 * price and size fields are properly formatted according to API requirements.
 *
 * This helps prevent the "L1 error: User or API Wallet 0x... does not exist" error
 * that can occur when trailing zeros are present in these fields.
 *
 * @param obj - The object to normalize
 * @returns A new object with normalized price and size fields
 */
export declare function normalizeTrailingZeros<T>(obj: T): T;
export declare function cancelOrderToAction(cancelRequest: CancelOrderRequest): any;
export declare function orderWiresToOrderAction(orderWires: OrderWire[]): any;
