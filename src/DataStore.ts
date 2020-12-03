// type Status = 'Contracted' | 'PartialContracted' | 'OpenOrder' | 'Await' | 'Error'
type Status = 'ActiveOrder' | 'Position' | 'Await' | 'Error'

export interface DataStoreInterface {
    ohlcv
    uncontractedOrders
    contractedOrders
    openedOrder
    status: Status
    getStatus(): Status
    getPreparedOrder()
    getOpenedOrder()
    getPosition(order)
    setPreparedOrder(order): void
    setStatus(status): void
    setOpenedOrder(oder): void
    setContractedOrder(oder): void
    // getUncontractedOrder(): void
    setPosition(order): void
    setExpiredOrder(): void
    getExpiredOrder(): any[]
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
    getPreparedOrder() { }
    setOpenedOrder(order): void {
        this.openedOrder.push(order);
        if (this.openedOrder.length >= 1) this.setStatus('ActiveOrder')
    }
    getOpenedOrder() { }
    setUncontractedOrder(order): void { }
    getUncontractedOrder() { }
    setContractedOrder(order): void {
        this.positions.push(order)
        if (this.positions.length >= 1) this.setStatus('Position')
    }
    // getContractedOrder() { }
    setExpiredOrder() { }
    getExpiredOrder() { }
    setPosition(order) {

    }
    getPosition() {
        // ave_open_price
    }

}
