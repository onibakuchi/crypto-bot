// type Status = 'ActiveOrder' | 'Position' | 'Await' | 'Error'
export interface Order {
    orderName: string;
    id: string;
    expiracy: number;
    status: string;
    symbol: string;
    type: string;
    side: 'buy' | 'sell';
    timestamp: number;
    amount: number;
    price: number;
    params: {};
}
interface Position {
    symbol: string
    side: string
    amount: number
    amountUSD: number
    avgOpenPrice: number | undefined,
    breakEvenPrice: number | undefined,
}
export interface DatastoreInterface {
    getOHCV(): number[][]
    getPreparedOrders()
    getActiveOrders(): Map<string, Order>;
    getExpiredOrders(): Order[]

    updateOrderStatus(): void
    updatePreparedOrders(): void
    setPreparedOrders(orders: Order[]): void
    setOHLCV(ohlcv): void
    getPosition(): Position
}

abstract class AbstractDatastore implements DatastoreInterface {
    ohlcv: number[][];
    contractedOrders: Map<string, Order>;
    preparedOrders: Map<string, Order>;
    activeOrders: Map<string, Order>;
    position: Position;

    public getOHCV(): number[][] { return this.ohlcv }
    public setOHLCV(ohlcv) {
        this.ohlcv = ohlcv;
    }
    public abstract getPreparedOrders(): Map<string, Order>
    public abstract getActiveOrders(): Map<string, Order>
    public abstract getExpiredOrders(): Order[]
    // public abstract deleteActiveOrders(): void
    public abstract updateOrderStatus(): void
    public abstract updatePreparedOrders(): void
    public abstract setPreparedOrders(orders: Order[]): void
    public abstract getPosition(): Position
    public abstract setPosition(): void
}
class Datastore implements AbstractDatastore {
    ohlcv: number[][];
    contractedOrders: Map<string, Order> = new Map();
    preparedOrders: Map<string, Order> = new Map();
    activeOrders: Map<string, Order> = new Map();
    position: Position = {
        symbol: '',
        side: '',
        amount: 0,
        amountUSD: 0,
        avgOpenPrice: undefined,
        breakEvenPrice: undefined,
    }
    public updateOrderStatus(): void {
        const iterator: IterableIterator<[string, Order]> = this.activeOrders.entries();
        for (const [key, order] of iterator) {
            if (order['status'] == 'closed') {
                this.activeOrders.delete(key);
                this.contractedOrders.set(key, order);
            }
            if (order['status'] == 'canceled') {
                this.activeOrders.delete(key);
            }
        }
        this.setPosition();
    }
    public setPreparedOrders(orders): void {
        for (const order of orders) {
            const key = order['orderName'];
            if (this.activeOrders.has(key)) {
                console.log(`[Info]:skipped. Order<${key}> is already open...`);
                continue;
            }
            this.preparedOrders.set(key, order)
        }
    }
    public updatePreparedOrders(): void {
        const orders = this.preparedOrders.values()
        for (const order of orders) {
            const key = order['orderName'];
            if (order.status == 'open') {
                this.activeOrders.set(key, order);
                this.preparedOrders.delete(key);
            }
            if (order.status == 'closed') {
                this.contractedOrders.set(key, order);
                this.activeOrders.delete(key);
                this.preparedOrders.delete(key);
            }
            if (order.status == 'canceled') {
                this.activeOrders.delete(key);
                this.preparedOrders.delete(key);
            }
        }
    }
    // deleteActiveOrders() {
    //     const orders = this.activeOrders2.values();
    //     for (const order of orders) {
    //         if (order.expiracy > Date.now()) { }
    //         this.activeOrders2.delete(order.orderName);
    //     }
    // }
    public getActiveOrders() { return this.activeOrders }
    public getExpiredOrders(): Order[] {
        const expiredOrders = [];
        for (const value of this.activeOrders.values()) {
            console.log(` ${value}`);
            if (value['expiracy'] >= Date.now()) {
                expiredOrders.push(value);
            }
        }
        return expiredOrders;
    }
    public getPreparedOrders(): Map<string, Order> { return this.preparedOrders }
    public setPosition() {
        const orders = this.contractedOrders.values();
        for (const order of orders) {
            if (this.position.symbol != order.symbol) continue;
            const prevAmount = this.position.amount;
            this.position.amount += (order.side == this.position.side) ? order.amount : -order.amount;
            this.position.avgOpenPrice = (this.position.avgOpenPrice * prevAmount + order.price * order.amount) / this.position.amount;
            this.position.amountUSD = this.position.amount * this.position.avgOpenPrice;
        }
        this.contractedOrders.clear();
    }
    public getPosition() { return this.position; }
    public getOHCV(): number[][] { return this.ohlcv }
    public setOHLCV(ohlcv) {
        this.ohlcv = ohlcv;
    }
}

