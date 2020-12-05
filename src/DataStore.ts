// type Status = 'Contracted' | 'PartialContracted' | 'OpenOrder' | 'Await' | 'Error'
// type Status = 'ActiveOrder' | 'Position' | 'Await' | 'Error'

export interface Order {
    orderName: string;
    id: number
    symbol: string;
    side: 'buy' | 'sell';
    ordType: string;
    price: number;
    params: {};
    expiracy: number;
}
export interface DataStoreInterface {
    ohlcv: number[][]
    preparedOrders
    contractedOrders
    activeOrders

    preparedOrders2: Map<string, Order>;
    activeOrders2: Map<string, Order>;
    positions

    getOHCV(): number[][]
    getPreparedOrders()
    getActiveOrders(): IterableIterator<[string, Order]>
    getExpiredOrders(): Order[]
    getContractedOrder(): any
    pendingOrderCount(): number

    deleteActiveOrders(key, orders): void

    setActiveOrders(orders: Order[]): void 
    setPreparedOrders(orders: Order[]): void
    setOHLCV(ohlcv): void

    getPosition(orders)
    setContractedOrder(oder)
    setPosition(orders)
}

class DataStore implements DataStoreInterface {
    public ohlcv: number[][]
    public preparedOrders = []
    public activeOrders = [];
    public contractedOrders = [];

    public preparedOrders2 = new Map()
    public activeOrders2 = new Map();
    public positions = [{}]

    deleteActiveOrders(keys, orders=undefined) {
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
    }
    setPreparedOrders(orders): void {
        // this.preparedOrders.push(order)
        for (const order of orders) {
            const key = order['orderName'];
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
            if (this.preparedOrders2.has(key)) {
                console.log('[Error]:');
                continue;
            }
            this.activeOrders2.set(key, order);
        }
        // this.activeOrders.push(order);
    }
    update(orders): void {
        for (const order of orders) {
            const key = order['orderName'];
            if (this.preparedOrders2.has(key)) {
                console.log('[Error]:');
                continue;
            }
            this.activeOrders2.set(key, order);
        }
        // this.activeOrders.push(order);
    }
    setOHLCV(ohlcv) {
        this.ohlcv = ohlcv;
    }
    getActiveOrders() { return this.activeOrders2.entries() }
    setContractedOrder(order): void {
        this.positions.push(order)
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
    setPosition(order) { }
    getPosition() {
        // ave_open_price
    }


}
