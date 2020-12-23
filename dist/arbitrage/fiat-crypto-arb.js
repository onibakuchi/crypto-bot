"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordFiatArb = exports.fiatCryptoArb = void 0;
const exchanges_1 = require("../exchanges/exchanges");
const arb_1 = require("./arb");
const line_1 = require("../notif/line");
const record_1 = require("./record");
const config_1 = __importDefault(require("../config/config"));
const target = 'USDJPY';
const symbols = ['BTC', 'ETH', 'XRP'];
const column = ['BTC', 'XRP'];
const ftx = exchanges_1.ExchangeRepositoryFactory.get('ftx');
const bb = exchanges_1.ExchangeRepositoryFactory.get('bitbank');
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
    fiatOtherFee: 0
};
const fiatCryptoArb = async () => {
    try {
        const tckFtx = await ftx.fetchTickers(symbols.map(el => el + '/USD'));
        const tckBb = await bb.fetchTickers(symbols.map(el => el + '/JPY'));
        const USDJPY = await arb_1.requestFiatRate('USD', 'JPY');
        template.usdjpy = Number(USDJPY);
        const arbXRP = makeArbObj(tckFtx, tckBb, symbols[2]);
        const arbETH = makeArbObj(tckFtx, tckBb, symbols[1]);
        const arbBTC = makeArbObj(tckFtx, tckBb, symbols[0]);
        const arbData = { [symbols[2]]: arbXRP, [symbols[0]]: arbBTC, [symbols[1]]: arbETH };
        arb_1.addCryptoFiatCalculator(arbData);
        // console.log('arbData :>> ', arbData);
        arb_1.logger(arbData, true, Number(config_1.default.ARB.FIAT_BASIS));
        return arbData;
    }
    catch (e) {
        await line_1.pushMessage(e.message);
        console.log('[ERROR]:', e);
    }
};
exports.fiatCryptoArb = fiatCryptoArb;
const recordFiatArb = async (range, column) => {
    await record_1.record(exports.fiatCryptoArb, range, column);
};
exports.recordFiatArb = recordFiatArb;
const makeArbObj = (tckAbroad, tckJapan, symbol) => {
    const arbObj = Object.assign({ ...template });
    arbObj.targetCryptoJPY = tckJapan[symbol + '/JPY']['bid'];
    arbObj.targetCryptoUSD = tckAbroad[symbol + '/USD']['bid'];
    arbObj.usdJpyFromCrypto = tckJapan[symbol + '/JPY']['bid'] / tckAbroad[symbol + '/USD']['bid'];
    return arbObj;
};
if (require.main == module) {
    exports.fiatCryptoArb();
}
