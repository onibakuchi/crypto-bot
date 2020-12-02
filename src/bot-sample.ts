import { ConcreteMediator2 } from './Mediator';
import { AbstractClassExchange, ExchangeRepositoryFactory } from './Exchanges';

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

const mediater = new ConcreteMediator2()
console.log('Same client code can work with different subclasses:');
const ftxInstance = new (ExchangeRepositoryFactory.get('ftx'))()
mediater.setComponent(ftxInstance);

function bot(abstractClass: AbstractClassExchange) {
    let symbol, timeframe, since, limit, params;
    abstractClass.fetchOHLCV(symbol, timeframe, since, limit, params);
}

// bot(new ConcreteExchange11());
// console.log('');
// console.log('Same client code can work with different subclasses:');
// bot(new ConcreteExchange22());