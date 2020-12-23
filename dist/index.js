"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_mongo_1 = require("./datastore/datastore-mongo");
const app_1 = require("./bot/app");
const strategy_1 = require("./strategy/strategy");
const timeout = (sec) => {
    return new Promise((resolve) => {
        setTimeout(resolve, sec * 1000);
    });
};
const run = (func, sec) => {
    func();
    const promise = new Promise((resolve) => {
        setTimeout(resolve, sec * 1000);
    });
    promise.then(() => run(func, sec));
};
const app = new app_1.App('ftx');
app.setStrategy([strategy_1.HigeCatchStrategy]);
app.setDatastore(datastore_mongo_1.DatastoreWithMongo);
app.start();
// (async () => {
//     app.setStrategy([HigeCatchStrategy])
//     app.setDatastore(DatastoreWithMongo)
//     await app.init();
//     await app.main();
//     setTimeout(async () => {
//         console.log('-------------');
//         await app.main()
//         console.log('-------------');
//     }, 5000);
//     // curl https://api.exchangeratesapi.io/latest?base=USD
//     //http://www.gaitameonline.com/rateaj/getrate
// })()
process.on('unhandledRejection', async (reason, p) => {
    console.error(reason);
    await app.stop();
    console.log('Stopped app.');
    process.exit(1);
});
