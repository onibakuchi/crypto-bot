// type Status = 'Contracted' | 'PartialContracted' | 'OpenOrder' | 'Await' | 'Error'
// type Status = 'ActiveOrder' | 'Position' | 'Await' | 'Error'
export interface Order {
    orderName: string;
    id: string;
    expiracy: number;
    status: string;
    symbol: string;
    type: string;
    side: 'buy' | 'sell';
    amount: number;
    price: number;
    params: {};
}
export interface DataStoreInterface {
    // ohlcv: number[][]
    // contractedOrders: Map<string, Order>;
    // preparedOrders2: Map<string, Order>;
    // activeOrders2: Map<string, Order>;
    // position
    getOHCV(): number[][]
    getPreparedOrders()
    getActiveOrders(): Map<string, Order>;
    getExpiredOrders(): Order[]

    updateOrderStatus(): void
    updatePreparedOrders(): void
    setPreparedOrders(orders: Order[]): void
    setOHLCV(ohlcv): void

    getPosition(orders)
}

abstract class AbstractDatastore implements DataStoreInterface {
    ohlcv: number[][];
    contractedOrders: Map<string, Order>;
    preparedOrders2: Map<string, Order>;
    activeOrders2: Map<string, Order>;
    position: any;

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
    public abstract getPosition()
    public abstract setPosition()
}
class Datastore implements AbstractDatastore {
    ohlcv: number[][];
    contractedOrders: Map<string, Order> = new Map();
    preparedOrders2: Map<string, Order> = new Map();
    activeOrders2: Map<string, Order> = new Map();
    position = {
        symbol: '',
        side: '',
        amount: 1,
        amountUSD: 1,
        avgOpenPrice: 1,
        breakEvenPrice: 1,
    }
    updateOrderStatus(): void {
        const iterator: IterableIterator<[string, Order]> = this.activeOrders2.entries();
        for (const [key, order] of iterator) {
            if (!this.activeOrders2.has(key)) {
                console.log('[Error]:');
                continue;
            }
            if (order['status'] == 'open') {
                // this.activeOrders2.set(key, order);
            }
            if (order['status'] == 'closed') {
                this.activeOrders2.delete(key);
                this.contractedOrders.set(key, order);
                // this.setPosition(order);
            }
            if (order['status'] == 'canceled') {
                this.activeOrders2.delete(key);
            }

        }
    }
    setPreparedOrders(orders): void {
        for (const order of orders) {
            const key = order['orderName'];
            if (this.activeOrders2.has(key)) {
                console.log(`[Info]:skipped. Order<${key}> is already open...`);
                continue;
            }
            this.preparedOrders2.set(key, order)
        }
    }
    updatePreparedOrders(): void {
        const orders = this.preparedOrders2.values()
        for (const order of orders) {
            const key = order['orderName'];
            if (order.status == 'open') {
                this.activeOrders2.set(key, order);
                this.preparedOrders2.delete(key);
            }
            if (order.status == 'closed') {
                this.contractedOrders.set(key, order);
                this.activeOrders2.delete(key);
                this.preparedOrders2.delete(key);
            }
            if (order.status == 'canceled') {
                this.activeOrders2.delete(key);
                this.preparedOrders2.delete(key);
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
    getActiveOrders() { return this.activeOrders2 }
    getExpiredOrders(): Order[] {
        const expiredOrders = [];
        for (const value of this.activeOrders2.values()) {
            console.log(` ${value}`);
            if (value['expiracy'] >= Date.now()) {
                expiredOrders.push(value);
            }
        }
        return expiredOrders;
    }
    getPreparedOrders(): Map<string, Order> { return this.preparedOrders2 }
    setPosition() {
        const orders = this.contractedOrders.values();
        for (const order of orders) {
            if (order.side == this.position.side) {
                this.position.amount += order.amount;
            }
        }
        this.contractedOrders.clear();
    }
    getPosition() {
        // ave_open_price
    }
    public getOHCV(): number[][] { return this.ohlcv }
    public pendingOrderCount(): number {
        return this.activeOrders2.size + this.preparedOrders2.size || 0;
    }
    public setOHLCV(ohlcv) {
        this.ohlcv = ohlcv;
    }
}

