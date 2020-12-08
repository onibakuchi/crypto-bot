import { ExchangeRepositoryFactory } from './Exchanges';
import { Order, Datastore } from './Datastore';
import { Bot } from './Mediator';
import { Strategy } from './Strategy';

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
        orderName: 'testIndex.ts',
        id: '16962050770',
        symbol: 'ETH-PERP',
        timestamp: 0,
        type: 'limit',
        side: "buy",
        status: '',
        amount: 0.001,
        price: Math.random() * 30 + 450,
        params: {},
        expiracy: Date.now(),
    }
    // console.log('await  ftx.fetchOHLCV() :>> ', await ftx.fetchOHLCV(symbol, timeframe, since,));
    // await ftx.fetchOrders([order])

    //
    const instance = new Bot(FTX)
    instance.setStrategy([Strategy])
    instance.setDatastore(Datastore)
    await instance.main()
    // const ftx = new FTX()
    // await ftx.createOrders([order])
    // instance
})()