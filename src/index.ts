import { DatastoreWithMongo } from './datastore/datastore-mongo';
import { Bot } from './bot/bot-core';
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
(async () => {
    // const FTX = ExchangeRepositoryFactory.get('ftx')
    // const BitMex = ExchangeRepositoryFactory.get('bitmex');
    // const bot = new Bot(FTX);
    const bot = new Bot('ftx');
    bot.setStrategy([HigeCatchStrategy])
    bot.setDatastore(DatastoreWithMongo)
    await bot.init();
    await bot.main();
    setTimeout(async () => {
        console.log('-------------');
        await bot.main()
        console.log('-------------');
    }, 5000);
    // const ftx = new FTX()
    // await ftx.createOrders([order])

    // curl https://api.exchangeratesapi.io/latest?base=USD
})()