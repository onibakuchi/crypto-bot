import { Bot } from './botCore';
import { AbstractExchange, ExchangeRepositoryFactory } from './exchanges';

const event = {
    event: '',
    method: '',
    res: {},
}
const states = {
    fetchOHLCV: 'setPositionStatus',
    setPositionStatus: 'prepareOrder',
    openOrder: 'end',
    events: [
        { state: 'fetchOHLCV', to: 'setPositionStatus' },
        { state: 'setPositionStatus', to: 'prepareOrder' },
        { state: 'openOrder', to: 'end' },
    ]
}
const transite = state => states[state]

// const mediater = new Bot()
// console.log('Same client code can work with different subclasses:');
// const ftxInstance = new (ExchangeRepositoryFactory.get('ftx'))()
// mediater.setExchange(ftxInstance);

function bot(abstractClass: AbstractExchange) {
    let symbol, timeframe, since, limit, params;
    abstractClass.fetchOHLCV(symbol, timeframe, since, limit, params);
}

// bot(new ConcreteExchange11());
// console.log('');
// console.log('Same client code can work with different subclasses:');
// bot(new ConcreteExchange22());