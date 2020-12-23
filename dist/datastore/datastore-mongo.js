"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatastoreWithMongo = void 0;
const base_mongo_db_1 = require("./base-mongo-db");
const datastore_1 = require("./datastore");
class DatastoreWithMongo extends datastore_1.BaseDatastore {
    constructor() {
        super();
        this.COLLECTION_NAME = 'orders';
        this.saveToDb = async (count = 0) => {
            try {
                const data = [...this.contractedOrders.values(), ...this.getExpiredOrders(), ...this.activeOrders.values()];
                await this.db.bulkUpsert(this.COLLECTION_NAME, data);
            }
            catch (e) {
                console.log('[ERROR]:FAILED_DB_REQUEST', e);
                this.db.close();
                this.pushMessage(e);
                if (!(e instanceof TypeError) && count <= 5) {
                    console.log('[Info]:Retry...');
                    await this.db.connect();
                    await this.saveToDb(count + 1);
                }
            }
        };
        this.db = new base_mongo_db_1.MongoDatastore();
    }
    async init() {
        await this.db.connect();
        const data = (await this.db.findDocuments(this.COLLECTION_NAME, {}));
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
                        console.log('[Warn]: INVALID_STATUS');
                }
            }
        });
    }
}
exports.DatastoreWithMongo = DatastoreWithMongo;
