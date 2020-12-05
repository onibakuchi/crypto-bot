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
export interface PreparedOrder {
    symbol: string;
    side: 'buy' | 'sell';
    ordType: string;
    price: number;
    params: {};
    expiracy: number;
}
export interface EffectiveOrder extends PreparedOrder {
    id: number;
}
export interface DataStoreInterface {
    ohlcv: number[][]
    contractedOrders: Map<string, Order>;
    preparedOrders2: Map<string, Order>;
    activeOrders2: Map<string, Order>;
    position

    getOHCV(): number[][]
    getPreparedOrders()
    getActiveOrders(): Map<string, Order>;
    getExpiredOrders(): Order[]
    getContractedOrder(): any
    pendingOrderCount(): number

    deleteActiveOrders(): void
    updateOrderStatus(): void
    updatePreparedOrders(): void
    setPreparedOrders(orders: Order[]): void
    setOHLCV(ohlcv): void

    getPosition(orders)
    setContractedOrder(oder)
    setPosition(orders)
}

abstract class AbstractDatastore implements DataStoreInterface {
    ohlcv: number[][];
    contractedOrders: Map<string, Order>;
    preparedOrders2: Map<string, Order>;
    activeOrders2: Map<string, Order>;
    position: any;
    getOHCV(): number[][] {
        throw new Error("Method not implemented.");
    }
    getPreparedOrders() {
        throw new Error("Method not implemented.");
    }
    getActiveOrders(): Map<string, Order> {
        throw new Error("Method not implemented.");
    }
    getExpiredOrders(): Order[] {
        throw new Error("Method not implemented.");
    }
    getContractedOrder() {
        throw new Error("Method not implemented.");
    }
    pendingOrderCount(): number {
        throw new Error("Method not implemented.");
    }
    deleteActiveOrders(): void {
        throw new Error("Method not implemented.");
    }
    updateOrderStatus(): void {
        throw new Error("Method not implemented.");
    }
    updatePreparedOrders(): void {
        throw new Error("Method not implemented.");
    }
    setPreparedOrders(orders: Order[]): void {
        throw new Error("Method not implemented.");
    }
    setOHLCV(ohlcv: any): void {
        throw new Error("Method not implemented.");
    }
    getPosition(orders: any) {
        throw new Error("Method not implemented.");
    }
    setContractedOrder(oder: any) {
        throw new Error("Method not implemented.");
    }
    setPosition(orders: any) {
        throw new Error("Method not implemented.");
    }
}

class Datastore implements DataStoreInterface {
    ohlcv: number[][]
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
                console.log(`[Info]:skipped. Order<${key}> is already prepared...`);
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
    deleteActiveOrders() {
        const orders = this.activeOrders2.values();
        for (const order of orders) {
            if (order.expiracy > Date.now()) { }
            this.activeOrders2.delete(order.orderName);
        }
    }
    setOHLCV(ohlcv) {
        this.ohlcv = ohlcv;
    }
    getActiveOrders() { return this.activeOrders2 }
    setContractedOrder(order): void {
    }
    getOHCV() { return this.ohlcv }
    pendingOrderCount() {
        return this.activeOrders2.size + this.preparedOrders2.size || 0;
    }
    getExpiredOrders() {
        const expiredOrders = [];
        for (const value of this.activeOrders2.values()) {
            console.log(` ${value}`);
            if (value['expiracy'] >= Date.now()) {
                expiredOrders.push(value);
            }
        }
        return expiredOrders;
    }
    getContractedOrder() { }
    getPreparedOrders() { }
    setPosition(orders) {
        for (const order of orders) {
            if (order.side == this.position.side) {
                this.position.amount += order.amount;
            }
        }
    }
    getPosition() {
        // ave_open_price
    }

}

