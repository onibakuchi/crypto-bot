// type Status = 'Contracted' | 'PartialContracted' | 'OpenOrder' | 'Await' | 'Error'
type Status = 'ActiveOrder' | 'Position' | 'Await' | 'Error'

export interface DataStoreInterface {
    ohlcv
    uncontractedOrders
    contractedOrders
    openedOrder
    status: Status
    getStatus(): Status
    
    getOHCV()
    getPreparedOrder()
    getActiveOrder()
    getExpiredOrder(): any
    getContractedOrder(): any
    pendingOrderCount()
    
    deleteActiveOrder(ord: any);

    setActiveOrder(oder): void //preparedからのぞいてActiveにする
    setPreparedOrder(order): void
    setExpiredOrder(): void

    getPosition(order)
    setStatus(status): void
    setContractedOrder(oder): void
    setPosition(order): void
}

class DataStore implements DataStoreInterface {
    public ohlcv: number[][]
    public preparedOrders = []
    public uncontractedOrders = [];
    public contractedOrders = [];
    public openedOrder = [];
    public expiredOrder = [];

    public status;
    public positions = [{}]

    getStatus(): Status { return this.status }
    setStatus(status): void { this.status = status }
    setPreparedOrder(order): void {
        this.preparedOrders.push(order)
        if (this.preparedOrders.length == 0) this.setStatus('Await')
    }
    setActiveOrder(order): void {
        this.openedOrder.push(order);
        if (this.openedOrder.length >= 1) this.setStatus('ActiveOrder')
    }
    getActiveOrder() { }
    setContractedOrder(order): void {
        this.positions.push(order)
        if (this.positions.length >= 1) this.setStatus('Position')
    }
    getContractedOrder() { }
    getPreparedOrder() { }
    setExpiredOrder() { }
    getExpiredOrder() { }
    getOHCV() { }
    setPosition(order) { }
    pendingOrderCount() { }
    getPosition() {
        // ave_open_price
    }


}
