import { DatastoreInterface, DbDatastore, Order, Position, } from './datastoreInterface';

// abstract class AbstractDatastore implements DatastoreInterface {
//     db: any = null;
//     ohlcv: number[][];
//     contractedOrders: Map<string, Order>;
//     preparedOrders: Map<string, Order>;
//     activeOrders: Map<string, Order>;
//     position: Position;

//     public getOHCV(): number[][] { return this.ohlcv }
//     public getContractedOrders() { return this.contractedOrders }
//     public setOHLCV(ohlcv: number[][]) { this.ohlcv = ohlcv; }
//     public abstract getPreparedOrders(): Map<string, Order>
//     public abstract getActiveOrders(): Map<string, Order>
//     public abstract getExpiredOrders(): Order[]
//     public abstract updateOrderStatus(): void
//     public abstract updatePreparedOrders(): void
//     public abstract setPreparedOrders(orders: Order[]): void
//     public abstract getPosition(): Position

//     public abstract setPosition(): void
//     public abstract hook()
//     public abstract init()
//     public abstract setDb()
// }
// //motomoのdatastoreの直のインターフェースの実装
// export class Datastore implements DatastoreInterface {
//     db: any = null;
//     ohlcv: number[][];
//     contractedOrders: Map<string, Order> = new Map();
//     preparedOrders: Map<string, Order> = new Map();
//     activeOrders: Map<string, Order> = new Map();
//     position: Position = {
//         symbol: '',
//         side: '',
//         amount: 0,
//         amountUSD: 0,
//         avgOpenPrice: null,
//         breakEvenPrice: null,
//     }
//     public init<T extends { id: string }>(): Promise<T[]>;
//     public hook() { }
//     public setDb() { }

//     public getActiveOrders() { return this.activeOrders }
//     public getExpiredOrders(): Order[] {
//         const expiredOrders = [];
//         for (const value of this.activeOrders.values()) {
//             console.log(` ${value}`);
//             if (value['expiration'] <= Date.now()) {
//                 expiredOrders.push(value);
//             }
//         }
//         console.log('[Info]: Expired orders :>>', expiredOrders);
//         return expiredOrders;
//     }
//     public getOHCV(): number[][] { return this.ohlcv }
//     public getPosition() { return this.position; }
//     public getPreparedOrders(): Map<string, Order> { return this.preparedOrders }
//     public setOHLCV(ohlcv: number[][]) {
//         this.ohlcv = ohlcv;
//     }
//     public setPosition(): void {
//         console.log('[Info]: Updating position....');
//         const orders = this.contractedOrders.values();
//         for (const order of orders) {
//             if (this.position.symbol != order.symbol) continue;
//             const prevAmount = this.position.amount;
//             this.position.amount += (order.side == this.position.side) ? order.amount : -order.amount;
//             this.position.avgOpenPrice = (this.position.avgOpenPrice * prevAmount + order.price * order.amount) / this.position.amount;
//             this.position.amountUSD = this.position.amount * this.position.avgOpenPrice;
//         }
//         console.log('[Info]: Position...\n', this.getPosition());
//         this.contractedOrders.clear();
//         console.log('[Info]: Done updating position....');
//     }
//     public setPreparedOrders(orders: Order[]): void {
//         for (const order of orders) {
//             if (order) {
//                 const key = order['orderName'];
//                 if (this.activeOrders.has(key)) {
//                     console.log(`[Info]:skipped... Order<${key}> is already open...`);
//                     continue;
//                 }
//                 this.preparedOrders.set(key, order)
//             } else {
//                 console.log('[ERROR]: Incompatible to Order Interface\n <Order> :>>', order);
//             }
//         }
//     }
//     public updateOrderStatus(): void {
//         console.log('[Info]:Calling function updateOrderStatus...');
//         const iterator: IterableIterator<[string, Order]> = this.activeOrders.entries();
//         for (const [key, order] of iterator) {
//             if (order['status'] == 'closed') {
//                 this.activeOrders.delete(key);
//                 this.contractedOrders.set(key, order);
//                 console.log('[Info]: Contracted Order<Order>', order);
//             }
//             if (order['status'] == 'canceled') {
//                 this.activeOrders.delete(key);
//                 console.log('[Info]: Canceled Order<Order>', order);
//             }
//         }
//         this.setPosition();
//     }
//     public updatePreparedOrders(): void {
//         const orders = this.preparedOrders.values()
//         for (const order of orders) {
//             const key = order['orderName'];
//             if (order.status == 'open') {
//                 this.activeOrders.set(key, order);
//                 this.preparedOrders.delete(key);
//             }
//             if (order.status == 'closed') {
//                 this.contractedOrders.set(key, order);
//                 this.activeOrders.delete(key);
//                 this.preparedOrders.delete(key);
//             }
//             if (order.status == 'canceled') {
//                 this.activeOrders.delete(key);
//                 this.preparedOrders.delete(key);
//             }
//         }
//     }
// }
//dbようにアブストラクトした
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
    public setPosition(): void {
        console.log('[Info]: Updating position....');
        const orders = this.contractedOrders.values();
        for (const order of orders) {
            if (this.position.symbol != order.symbol) continue;
            const prevAmount = this.position.amount;
            this.position.amount += (order.side == this.position.side) ? order.amount : -order.amount;
            this.position.avgOpenPrice = (this.position.avgOpenPrice * prevAmount + order.price * order.amount) / this.position.amount;
            this.position.amountUSD = this.position.amount * this.position.avgOpenPrice;
        }
        console.log('[Info]: Position...\n', this.getPosition());
        this.contractedOrders.clear();
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
    public updateOrderStatus(): void {
        console.log('[Info]:Calling function updateOrderStatus...');
        const iterator: IterableIterator<[string, Order]> = this.activeOrders.entries();
        for (const [key, order] of iterator) {
            if (order['status'] == 'closed') {
                this.activeOrders.delete(key);
                this.contractedOrders.set(key, order);
                console.log('[Info]: Contracted Order<Order>', order);
            }
            if (order['status'] == 'canceled') {
                this.activeOrders.delete(key);
                console.log('[Info]: Canceled Order<Order>', order);
            }
        }
        this.setPosition();
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