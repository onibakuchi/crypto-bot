"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_mongo_1 = require("./datastore/datastore-mongo");
const app_1 = require("./app");
const strategy_1 = require("./strategy/strategy");
const app = new app_1.App('ftx');
app.setStrategy([strategy_1.HigeCatchStrategy]);
app.setDatastore(datastore_mongo_1.DatastoreWithMongo);
app.start();
process.on('unhandledRejection', async (reason, p) => {
    console.error(reason);
    await app.stop();
    console.log('Stopped app.');
    process.exit(1);
});
