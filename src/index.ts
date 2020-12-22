import { DatastoreWithMongo } from './datastore/datastore-mongo';
import { App } from './bot/app';
import { HigeCatchStrategy } from './strategy/strategy';

const timeout = (sec) => {
    return new Promise((resolve) => {
        setTimeout(resolve, sec * 1000);
    })
}

const run = (func, sec) => {
    func()
    const promise = new Promise((resolve) => {
        setTimeout(resolve, sec * 1000);
    });
    promise.then(() => run(func, sec))
};

const app = new App('ftx');
app.setStrategy([HigeCatchStrategy]);
app.setDatastore(DatastoreWithMongo);
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