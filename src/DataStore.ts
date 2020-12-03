// type Status = 'Contracted' | 'PartialContracted' | 'OpenOrder' | 'Await' | 'Error'
type Status = 'ActiveOrder' | 'Position' | 'Await' | 'Error'

export interface DataStoreInterface {
    ohlcv
    preparedOrders
    contractedOrders
    activeOrders

    getOHCV()
    getPreparedOrder()
    getActiveOrder()
    getExpiredOrder(): any
    getContractedOrder(): any
    pendingOrderCount()

    deleteActiveOrder(ord: any);

    setActiveOrder(oder): void //preparedからのぞいてActiveにする
    setPreparedOrder(order): void

    getPosition(order)
    setContractedOrder(oder): void
    setPosition(order): void
}

class DataStore implements DataStoreInterface {
    public ohlcv: number[][]
    public preparedOrders = []
    public activeOrders = [];
    public contractedOrders = [];

    public preparedOrders2 = new Map()
    public activeOrders2 = new Map();
    public positions = [{}]

    deleteActiveOrder(ord: any) {
        throw new Error("Method not implemented.");
    }
    setPreparedOrder(order): void {
        this.preparedOrders.push(order)
        this.preparedOrders2.set(key, order)
    }
    setActiveOrder(order): void {
        this.activeOrders.push(order);
    }
    getActiveOrder() { }
    setContractedOrder(order): void {
        this.positions.push(order)
    }
    getContractedOrder() { }
    getPreparedOrder() { }
    getExpiredOrder() { }
    getOHCV() { }
    setPosition(order) { }
    pendingOrderCount() { }
    getPosition() {
        // ave_open_price
    }


}
