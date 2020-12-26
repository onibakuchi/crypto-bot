import { MongoDatastore, MongoDatastoreInterface } from './base-mongo-db';
import { BaseDatastore } from './datastore';

export class DatastoreWithMongo extends BaseDatastore {
    public readonly db: MongoDatastoreInterface;
    protected readonly COLLECTION_NAME: string = 'orders';
    constructor() {
        super();
        this.db = new MongoDatastore();
    }
    public async init(): Promise<void> {
        await this.db.connect();
        const data = (await this.db.findDocuments(this.COLLECTION_NAME, {})) as any[];
        data.forEach(el => {
            if ('orderName' in el) {
                switch (el['status']) {
                    case 'open':
                    case 'pending':
                        this.activeOrders.set(el['orderName'], el);
                        break;
                    case 'canceled':
                        break;
                    case 'closed':
                        this.contractedOrders.set(el['orderName'], el);
                        break;
                    default:
                        console.log('[Warn]: INVALID_STATUS');
                }
            }
            if ('avgOpenPrice' in el) {
                this.position = el;
            }
        });
    }
    public async saveToDb(count = 0) {
        try {
            const data = [...this.contractedOrders.values(), ...this.getExpiredOrders(), ...this.activeOrders.values()]
            return await this.db.bulkUpsert(this.COLLECTION_NAME, data);
        } catch (e) {
            console.log('[ERROR]:FAILED_DB_REQUEST', e);
            this.db.close();
            this.pushMessage(e);
            if (!(e instanceof TypeError) && count <= 5) {
                console.log('[Info]:Retry...');
                await this.db.connect();
                await this.saveToDb(count + 1);
            }
        }
    }
}