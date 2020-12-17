import { ExchangeRepositoryFactory } from './exchanges/exchanges';
import type { Order } from './datastore/datastore-interface';
import { DatastoreWithMongo } from './datastore/datastore-mongo';
import { Bot } from './bot/bot-core';
import { Strategy } from './strategy/strategy';

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
    const FTX = ExchangeRepositoryFactory.get('ftx')
    const order: Order = {
        orderName: 'test0',
        id: '',
        symbol: 'ETH-PERP',
        timestamp: 0,
        type: 'limit',
        side: "buy",
        status: '',
        amount: 0.001,
        price: Math.random() * 30 + 450,
        params: {},
        expiration: Date.now(),
    }
    // console.log('await  ftx.fetchOHLCV() :>> ', await ftx.fetchOHLCV(symbol, timeframe, since,));
    // await ftx.fetchOrders([order])

    //
    const bot = new Bot(FTX)
    bot.setStrategy([Strategy])
    bot.setDatastore(DatastoreWithMongo)
    await bot.init();
    await bot.main();
    // setTimeout(async () => {
    //     await instance.main()
    // }, 5000);
    // const ftx = new FTX()
    // await ftx.createOrders([order])
    // instance
})()