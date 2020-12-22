import { MongoDatastore, MongoDatastoreInterface } from './base-mongo-db';
import { Order } from './datastore-interface';
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
        const data = (await this.db.findDocuments(this.COLLECTION_NAME, {})) as Order[]
        data.forEach(order => {
            if (('orderName' in order) && ('id' in order)) {
                switch (order['orderName']) {
                    case 'open':
                    case 'pending':
                        this.activeOrders.set(order['orderName'], order);
                        break;
                    case 'closed':
                        this.contractedOrders.set(order['orderName'], order);
                        break;
                    default:
                        console.log('[Warn]: NO_MATCH_STATUS');
                }
            }
        });
        this.setPosition();
    }
    public saveToDb = async (count = 0) => {
        try {
            const data = [...this.contractedOrders.values(), ...this.getExpiredOrders(), ...this.activeOrders.values()]
            await this.db.bulkUpsert(this.COLLECTION_NAME, data);
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