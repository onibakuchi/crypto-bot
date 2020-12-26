import { DatastoreInterface, DbDatastore, Order, Position, } from './datastore-interface';
import { pushMessage } from '../notif/line';

export abstract class BaseDatastore implements DatastoreInterface {
    db: DbDatastore = null;
    ohlcv: number[][];
    contractedOrders: Map<string, Order> = new Map();
    preparedOrders: Map<string, Order> = new Map();
    activeOrders: Map<string, Order> = new Map();
    position: Position = {
        symbol: '',
        side: '',
        amount: 0,
        amountUSD: 0,
        avgOpenPrice: null,
        breakEvenPrice: null,
    }
    public abstract init(): Promise<void>;
    public abstract saveToDb();

    protected calcPosition(): void {
        console.log('[Info]: Updating position....');
        const orders = this.contractedOrders.values();
        for (const order of orders) {
            if (this.position.symbol != order.symbol) continue;
            const prevAmount = this.position.amount;
            this.position.amount += (order.side == this.position.side) ? order.amount : -order.amount;
            this.position.avgOpenPrice = (this.position.avgOpenPrice * prevAmount + order.price * order.amount) / this.position.amount;
            this.position.amountUSD = this.position.amount * this.position.avgOpenPrice;
        }
        console.log('[Info]: Position...\n', this.position);
        // this.contractedOrders.clear();
        console.log('[Info]: Done updating position....');
    }
    public getActiveOrders() { return this.activeOrders }
    public getContractedOrders() { return this.contractedOrders }
    public getExpiredOrders(): Order[] {
        const expiredOrders = [];
        for (const value of this.activeOrders.values()) {
            console.log(` ${value}`);
            if (value['expiration'] <= Date.now()) {
                expiredOrders.push(value);
            }
        }
        console.log('[Info]: Expired orders :>>', expiredOrders);
        return expiredOrders;
    }
    public getOHCV(): number[][] { return this.ohlcv }
    public getPosition() { return this.position; }
    public getPreparedOrders(): Map<string, Order> { return this.preparedOrders }
    public setOHLCV(ohlcv: number[][]) {
        this.ohlcv = ohlcv;
    }
    public setPosition(position: Position): void {
        console.log('[Info]: Updating position....');
        this.position = position;
        console.log('[Info]: Position...\n', this.position);
        console.log('[Info]: Done updating position....');
    }
    public setPreparedOrders(orders: Order[]): void {
        for (const order of orders) {
            if (order) {
                const key = order['orderName'];
                if (this.activeOrders.has(key)) {
                    console.log(`[Info]:skipped... Order<${key}> is already open...`);
                    continue;
                }
                this.preparedOrders.set(key, order)
            } else {
                console.log('[ERROR]: Incompatible to Order Interface\n <Order> :>>', order);
            }
        }
    }
    protected async pushMessage(message: string): Promise<void> {
        await pushMessage(message);
    }
    public updateOrderStatus(): void {
        console.log('[Info]:Calling function updateOrderStatus...');
        const iterator: IterableIterator<[string, Order]> = this.activeOrders.entries();
        for (const [key, order] of iterator) {
            if (order['status'] == 'open') {
                console.log('[Info]: Open Order<Order>', order);
            }
            if (order['status'] == 'closed') {
                this.activeOrders.delete(key);
                this.contractedOrders.set(key, order);
                console.log('[Info]: Contracted Order<Order>', order);
            }
            if (order['status'] == 'canceled') {
                this.activeOrders.delete(key);
                console.log('[Info]: Canceled Order<Order>', order);
            }
            if (order['status'] == 'pending') {
                console.log('[Info]: Pending Order<Order>', order);
            }
        }
        // this.calcPosition();
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
}