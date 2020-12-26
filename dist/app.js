"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const exchanges_1 = require("./exchanges/exchanges");
const line_1 = require("./notif/line");
const config_1 = __importDefault(require("./config/config"));
class App {
    constructor(exchangeId, _strategies) {
        this.MODE = config_1.default.TRADE.MODE;
        this.symbol = config_1.default.TRADE.SYMBOL;
        this.second = 300;
        this.timeframe = config_1.default.TRADE.TIMEFRAME;
        this.strategies = [];
        this.exchangeapi = exchanges_1.ExchangeRepositoryFactory.get(exchangeId);
        this.exchangeapi.setMediator(this);
        this.setStrategy(_strategies);
        console.log('[Info]: Launched...[mode]=', this.MODE);
    }
    execute() {
        console.log(`[Info]: Excute strategies....`);
        if (this.datastore.getOHCV()) {
            for (const strategy of this.strategies) {
                try {
                    const orders = strategy.strategy();
                    this.datastore.setPreparedOrders(orders);
                    console.log('[Info]: Done excuting a strategy...');
                }
                catch (e) {
                    console.log('[ERROR]:ERROR_WHILE_EXCUTING_STRATEGY', e);
                }
            }
        }
        else {
            console.log('[ERROR]:OHLCV_IS_EMPATY');
            console.log('[Info]:Skipped executing strategies');
        }
        console.log('[Info]: Done Excuting all strategies...');
    }
    async setOHLCV() {
        const ohlcv = await this.exchangeapi.fetchOHLCV(this.symbol, this.timeframe, Date.now() - this.second * 1000);
        this.datastore.setOHLCV(ohlcv);
        console.log('[Info] OHLCV :>> ', ohlcv);
    }
    async updatePosition() {
        console.log('[Info]:Updating position...');
        const position = await this.exchangeapi.fetchPosition(this.symbol, {});
        this.datastore.setPosition(position);
        console.log('[Info]:Updating position.. Done...');
    }
    async updateStatus() {
        console.log('[Info]:Process: Updating order status...');
        const values = this.datastore.getActiveOrders().values();
        await this.exchangeapi.fetchOrders(values);
        this.datastore.updateOrderStatus();
        console.log('[Info]:Process: Done updating order status...');
    }
    async cancel() {
        try {
            console.log('[Info]: Try to cancel order...');
            const expiredOrders = this.datastore.getExpiredOrders();
            if (expiredOrders.length > 0) {
                await this.exchangeapi.cancelOrders(expiredOrders);
            }
            else
                console.log('[Info]: No expired order...');
            console.log('[Info]: Done canceling expired orders...');
        }
        catch (e) {
            console.log('e :>> ', e);
        }
    }
    async order() {
        try {
            console.log('[Info]: Try to order...');
            const values = this.datastore.getPreparedOrders().values();
            await this.exchangeapi.createOrders(values);
            this.datastore.updatePreparedOrders();
            console.log('[Info]: Done order...');
        }
        catch (e) {
            console.log('e :>> ', e);
        }
    }
    getDatastore() { return this.datastore; }
    getOrders(kind) {
        if (kind == 'prepared')
            return this.datastore.getPreparedOrders().values();
        if (kind == 'active')
            return this.datastore.getActiveOrders().values();
        if (kind == 'contracted')
            return this.datastore.getContractedOrders().values();
        else
            console.log('[Warning]:NOT_MATCHED');
    }
    async init() {
        await this.datastore.init();
        this.strategies.forEach(el => el.init(config_1.default.TRADE));
    }
    pushMessage(message) { line_1.pushMessage(message); }
    async main() {
        if (this.datastore == undefined
            || this.exchangeapi == undefined
            || this.strategies.length == 0)
            throw Error('[ERROR]: UNDEFINED_EXCHANGE_API_OR_DARASTORE_OR_STRATEGY');
        // this.setActiveOrders();//FOR TEST
        await this.setOHLCV();
        await this.updateStatus();
        await this.updatePosition();
        this.execute();
        await this.order();
        await this.cancel();
        await this.saveToDb();
        const contractedOrders = [...this.getDatastore().getContractedOrders().values()];
        this.getDatastore().getContractedOrders().clear();
        return contractedOrders;
    }
    async saveToDb() { await this.datastore.saveToDb(); }
    async start() {
        await this.init();
        // await this.main();
        this.timer = setInterval(async () => await this.main(), Number(config_1.default.INTERVAL));
    }
    async stop() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    setExchange(ExchangeAPI) {
        this.exchangeapi = new ExchangeAPI();
    }
    setDatastore(Datastore) {
        this.datastore = new Datastore();
    }
    setStrategy(_strategies) {
        if (_strategies instanceof Array) {
            _strategies.forEach(el => this.strategies.push(new el(this)));
        }
    }
}
exports.App = App;
