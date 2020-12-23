"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordXRPArb = exports.xrpArb = void 0;
const exchanges_1 = require("../exchanges/exchanges");
const arb_1 = require("./arb");
const line_1 = require("../notif/line");
const record_1 = require("./record");
const config_1 = __importDefault(require("../config/config"));
const target = 'XRP';
const symbols = ['BTC', 'ETH', 'XRP'];
const column = ['BTC', 'ETH'];
const ftx = exchanges_1.ExchangeRepositoryFactory.get('ftx');
const bb = exchanges_1.ExchangeRepositoryFactory.get('bitbank');
const cc = exchanges_1.ExchangeRepositoryFactory.get('coincheck');
const template = {
    targetCrypto: target,
    baseCrypto: '',
    usdjpy: 0,
    usdJpyFromCrypto: 0,
    targetCryptoJPY: 0,
    targetCryptoUSD: 0,
    baseCryptoJPY: 0,
    baseCryptoUSD: 0,
    quantity: 0,
    tradeFeePercent: 0,
    sendFeeCrypto: 0,
};
const xrpArb = async () => {
    try {
        const tckFtx = await ftx.fetchTickers(symbols.map(el => el + '/USD'));
        const tckBb = await bb.fetchTickers(symbols.map(el => el + '/JPY'));
        const tckCc = await cc.fetchTickers([symbols[0] + '/JPY']);
        console.log(`現在のXRPJPY \n :>> `, tckBb['XRP/JPY']['bid']);
        console.log(`BTCレートから算出されるXRPJPY \n :>> `, tckCc['BTC/JPY']['bid'] / tckFtx['BTC/USD']['bid'] * tckFtx['XRP/USD']['bid']);
        const arbBTC = Object.assign({ ...template });
        arbBTC.targetCryptoJPY = tckBb['XRP/JPY']['bid'];
        arbBTC.targetCryptoUSD = tckFtx['XRP/USD']['bid'];
        arbBTC.baseCryptoJPY = tckCc['BTC/JPY']['bid'];
        arbBTC.baseCryptoUSD = tckFtx['BTC/USD']['bid'];
        const arbETH = Object.assign({ ...template });
        arbETH.targetCryptoJPY = tckBb['XRP/JPY']['bid'];
        arbETH.targetCryptoUSD = tckFtx['XRP/USD']['bid'];
        arbETH.baseCryptoJPY = tckBb['ETH/JPY']['bid'];
        arbETH.baseCryptoUSD = tckFtx['ETH/USD']['bid'];
        const arbData = { [symbols[0]]: arbBTC, [symbols[1]]: arbETH };
        arb_1.addCalculator(arbData);
        // console.log('arbData :>> ', arbData);
        arb_1.logger(arbData, true, Number(config_1.default.ARB.BASIS));
        return arbData;
    }
    catch (e) {
        await line_1.pushMessage(e.message);
        console.log('[ERROR]:', e);
    }
};
exports.xrpArb = xrpArb;
const recordXRPArb = async (range, column) => {
    await record_1.record(exports.xrpArb, range, column);
};
exports.recordXRPArb = recordXRPArb;
if (require.main == module) {
    exports.xrpArb();
}
