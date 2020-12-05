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
    preparedOrders
    contractedOrders: Map<string, Order>;
    activeOrders

    preparedOrders2: Map<string, Order>;
    activeOrders2: Map<string, Order>;
    position

    getOHCV(): number[][]
    getPreparedOrders()
    getActiveOrders(): Map<string, Order>;// IterableIterator<[string, Order]>
    getExpiredOrders(): Order[]
    getContractedOrder(): any
    pendingOrderCount(): number

    deleteActiveOrders(key, orders): void
    updateOrderStatus(orders): void
    setActiveOrders(orders: Order[]): void
    setPreparedOrders(orders: Order[]): void
    setOHLCV(ohlcv): void

    getPosition(orders)
    setContractedOrder(oder)
    setPosition(orders)
}

class DataStore implements DataStoreInterface {
    ohlcv: number[][]
    preparedOrders = []
    activeOrders = [];

    contractedOrders: Map<string, Order>;
    preparedOrders2 = new Map()
    activeOrders2 = new Map();
    position = {
        symbol: '',
        side: '',
        amount: 1,
        amountUSD: 1,
        avgOpenPrice: 1,
        breakEvenPrice: 1,
    }

    deleteActiveOrders(keys, orders = undefined) {
        if (keys != undefined) {
            for (const key of keys) {
                this.activeOrders2.delete(key);
            }
            return
        }
        //OR
        if (orders != undefined) {
            for (const order of orders) {
                this.activeOrders2.delete(order['orderName']);
            }
        }

        if (orders != undefined) {
            for (const order of orders) {
                this.activeOrders2.delete(order['orderName']);
            }
        }
    }
    setPreparedOrders(orders): void {
        for (const order of orders) {
            const key = order['orderName'];
            delete order.orderName;
            if (this.activeOrders2.has(key)) {
                console.log('[Error]:');
                continue;
            }
            this.preparedOrders2.set(key, order)
        }
    }
    setActiveOrders(orders): void {
        for (const order of orders) {
            const key = order['orderName'];
            if (!this.preparedOrders2.has(key)) {
                console.log('[Error]:');
                continue;
            }
            if (order.status == 'open') {
                this.activeOrders2.set(key, order);
                this.preparedOrders2.delete(key);
            }
            if (order.status == 'closed') {
                this.activeOrders2.set(key, order);
                this.setPosition
                this.preparedOrders2.delete(key);
            }
        }
        // this.activeOrders.push(order);
    }
    updateOrderStatus(fetchedOrders): void {
        const iterator: IterableIterator<[string, Order]> = this.activeOrders2.entries();
        for (const [key, order] of iterator) {
            for (const fetched of fetchedOrders) {
                if (order.id != fetched.id) continue;
                if (!this.activeOrders2.has(key)) {
                    console.log('[Error]:');
                    continue;
                }
                if (fetched['status'] == 'open') {
                    this.activeOrders2.set(key, order);
                }
                if (fetched['status'] == 'closed') {
                    this.activeOrders2.delete(key);
                }
                if (fetched['status'] == 'canceled') {
                    this.activeOrders2.delete(key);
                }
            }
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
