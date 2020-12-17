import { ExchangeRepositoryFactory } from './exchanges/exchanges';
import CONFIG from './config';
import ARB_CONFIG from '../arbitrageConfig.json';
import { pushMessage } from './line';

const ftx = new (ExchangeRepositoryFactory.get('ftx'))();
const bb = new (ExchangeRepositoryFactory.get('bitbank'))();
const cc = new (ExchangeRepositoryFactory.get('coincheck'))();

const symbols = ['BTC', 'ETH', 'XRP'];
interface Template {
    fromCurrency: string,
    toCurrency: string,
    usdJpyFromCrypto: number,
    xrpjpy: number,
    xrpusd: number,
    toCryptoJPYdenomi: number,
    toCryptoUSDdenomi: number,
    quantity: number
    tradeFeePercent: number
    sendFeeCrypto: number
}
interface ArbCalculator {
    diffPercent(): number
    sendFeeJPY(): number
    totalMoney(): number
    expectedReturn(): number
    profit(): number
}
interface ArbObject extends ArbCalculator, Template {
    fromCurrency: string,
    toCurrency: string,
    usdJpyFromCrypto: number,
    xrpjpy: number,
    xrpusd: number,
    toCryptoJPYdenomi: number,
    toCryptoUSDdenomi: number,
    quantity: number
    tradeFeePercent: number
    sendFeeCrypto: number
    diffPercent(): number
    sendFeeJPY(): number
    totalMoney(): number
    expectedReturn(): number
    profit(): number
}
type ArbObjects = {
    [symbol: string]: ArbObject
}
const template: Template = {
    fromCurrency: '',
    toCurrency: '',
    usdJpyFromCrypto: 0,
    xrpjpy: 0,
    xrpusd: 0,
    toCryptoJPYdenomi: 0,
    toCryptoUSDdenomi: 0,
    quantity: 0,
    tradeFeePercent: 0,
    sendFeeCrypto: 0,
}
const main = async () => {
    try {
        const tckFtx = await ftx.fetchTickers(symbols.map(el => el + '/USD'))
        const tckBb = await bb.fetchTickers(symbols.map(el => el + '/JPY'));
        const tckCc = await cc.fetchTickers([symbols[0] + '/JPY']);

        console.log(`現在のXRPJPY \n :>> `, tckBb['XRP/JPY']['bid']);
        console.log(`BTCレートから算出されるXRPJPY \n :>> `, tckCc['BTC/JPY']['bid'] / tckFtx['BTC/USD']['bid'] * tckFtx['XRP/USD']['bid']);

        const diffXRP = tckCc['BTC/JPY']['bid'] / tckFtx['BTC/USD']['bid'] * tckFtx['XRP/USD']['bid'] / tckBb['XRP/JPY']['bid'];
        console.log(`100 * BTCJPY / BTCUSD * XRPUSD / XRPJPY = `, (100 * diffXRP)?.toFixed(2));
        const diffXRP2 = tckBb['ETH/JPY']['bid'] / tckFtx['ETH/USD']['bid'] * tckFtx['XRP/USD']['bid'] / tckBb['XRP/JPY']['bid'];
        console.log(`100 * ETHJPY / ETHUSD * XRPUSD / XRPJPY = `, (100 * diffXRP2)?.toFixed(2));

        const arbBTCXRP = Object.assign({ ...template });
        arbBTCXRP.xrpjpy = tckBb['XRP/JPY']['bid'];
        arbBTCXRP.xrpusd = tckFtx['XRP/USD']['bid'];
        arbBTCXRP.usdJpyFromCrypto = diffXRP;

        const arbETHXRP2 = Object.assign({ ...template })
        arbETHXRP2.xrpjpy = tckBb['XRP/JPY']['bid'];
        arbBTCXRP.xrpusd = tckFtx['XRP/USD']['bid'];
        arbETHXRP2.usdJpyFromCrypto = diffXRP2;
        const tickers = { [symbols[0]]: arbBTCXRP, [symbols[1]]: arbETHXRP2 };
        addCalculator(tickers, ARB_CONFIG);
        console.log('tickers :>> ', tickers);
    }
    catch (e) {
        // await pushMessage(axiosBase, [{
        // type: 'text',
        // text: `[ERROR]: ${e}`
        // }])
        console.log('[ERROR]:', e);
    }
}
const TIMEOUT = Number(process.env.TIMEOUT) || 3600 * 1000;
const expiration = Date.now() + TIMEOUT;
const arbNotif = (diffPercent, params) => {
    if (Math.abs(diffPercent - 100) > Number(CONFIG.ARB.BASIS)) {

    }
}

const addCalculator = (tickers: { [symbol: string]: Template }, arbitrageConfig): ArbObjects => {
    const calculator: ArbCalculator = {
        diffPercent: function () {
            return 100 * (this.usdJpyFromCrypto * this.xrpusd / this.xrpjpy)
        },
        sendFeeJPY: function () {
            return this.sendFeeCrypto * this.xrpjpy;
        },
        totalMoney: function () { return this.xrpjpy * this.quantity },
        profit: function () {
            return this.quantity * (Math.abs(this.diffPercent()) * this.xrpjpy - this.tradeFeePercent * this.xrpjpy) / 100 - this.sendFeeCrypto * this.xrpjpy
        },
        expectedReturn: function () {
            return 100 * this.profit() / this.totalMoney();
        }
    }
    for (const [key, value] of Object.entries(tickers)) {
        value["quantity"] = parseFloat(arbitrageConfig[key]["size"]) / value["xrpjpy"]
        value["tradeFeePercent"] = parseFloat(arbitrageConfig[key]["tradeFeePercent"]);
        value["sendFeeCrypto"] = parseFloat(arbitrageConfig[key]["sendFeeCrypto"]);
        value["toCurrency"] = key;
        Object.assign(value, calculator);
    }
    return tickers as unknown as ArbObjects
}

const logger = (dataset: ArbObjects) => {
    for (const key in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, key)) {
            const el = dataset[key];
            const message = {
                type: "text",
                text: `Currency > ${el.toCurrency}`
                    + `割高 (bitbank比) % > ${el.diffPercent().toFixed(3)}`
                    + `profit ¥ > ${el.profit().toFixed(1)}`
                    + `expectedReturn % > ${el.expectedReturn()?.toFixed(3)}`
                    + `XRPJPY ¥ > ${el.xrpjpy}`
                    + `XRPUSD  $ > ${el.xrpusd}`
                    + `裁定金額 ¥ > ${el.totalMoney().toFixed(1)}`
                    + `取引量 > ${el.quantity.toFixed(2)}`
                    + `送金手数料 ¥ > ${el.sendFeeJPY().toFixed(0)}`
            };
            console.log("[Info]:Log", message['text']);
        }
    }
}
main()
