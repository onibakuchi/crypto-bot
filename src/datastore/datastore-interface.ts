export interface MinimalOrder { id: string, orderName: string };
export interface Order extends MinimalOrder {
    orderName: string;
    id: string;
    expiration: number;
    status: string;
    symbol: string;
    type: string;
    side: 'buy' | 'sell';
    timestamp: number;
    amount: number;
    price: number;
    params: {};
}
export interface Position {
    symbol: string
    side: string
    amount: number
    amountUSD: number
    avgOpenPrice: number | undefined,
    breakEvenPrice: number | undefined,
}
export interface DbDatastore {
    close(): void
    connect(): Promise<void>
}
export interface DatastoreInterface {
    getActiveOrders(): Map<string, Order>;
    getContractedOrders(): Map<string, Order>;
    getOHCV(): number[][];
    getExpiredOrders(): Order[];
    getPosition(): Position;
    getPreparedOrders(): Map<string, Order>;
    init(): Promise<void>
    saveToDb(): Promise<void>;
    setOHLCV(ohlcv: number[][]): void;
    setPreparedOrders(orders: Order[]): void;
    updateOrderStatus(): void;
    updatePreparedOrders(): void;
}