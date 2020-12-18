import { ExchangeRepositoryFactory } from './exchanges/exchanges';
import CONFIG from './config/config';
import ARB_CONFIG from './config/arbitrageConfig.json';
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

        const arbBTC = Object.assign({ ...template });
        arbBTC.xrpjpy = tckBb['XRP/JPY']['bid'];
        arbBTC.xrpusd = tckFtx['XRP/USD']['bid'];
        arbBTC.toCryptoJPYdenomi = tckCc['BTC/JPY']['bid'];
        arbBTC.toCryptoUSDdenomi = tckFtx['BTC/USD']['bid'];

        const arbETH = Object.assign({ ...template })
        arbETH.xrpjpy = tckBb['XRP/JPY']['bid'];
        arbETH.xrpusd = tckFtx['XRP/USD']['bid'];
        arbETH.toCryptoJPYdenomi = tckBb['ETH/JPY']['bid'];
        arbETH.toCryptoUSDdenomi = tckFtx['ETH/USD']['bid'];

        const arbData = { [symbols[0]]: arbBTC, [symbols[1]]: arbETH };
        addCalculator(arbData, ARB_CONFIG);
        // console.log('arbData :>> ', arbData);
        logger(arbData, true)
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
            return this.quantity * (Math.abs(this.diffPercent() - 100) * this.xrpjpy - this.tradeFeePercent * this.xrpjpy) / 100 - this.sendFeeCrypto * this.xrpjpy
        },
        expectedReturn: function () {
            return this.profit() / this.totalMoney();
        }
    }
    for (const [key, value] of Object.entries(tickers)) {
        value["quantity"] = parseFloat(arbitrageConfig[key]["size"]) / value["xrpjpy"]
        value["tradeFeePercent"] = parseFloat(arbitrageConfig[key]["tradeFeePercent"]);
        value["sendFeeCrypto"] = parseFloat(arbitrageConfig[key]["sendFeeCrypto"]);
        value["toCurrency"] = key;
        value["usdJpyFromCrypto"] = value.toCryptoJPYdenomi / value.toCryptoUSDdenomi;
        Object.assign(value, calculator);
    }
    return tickers as unknown as ArbObjects
}

const logger = async (dataset: ArbObjects, push: Boolean) => {
    for (const key in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, key)) {
            const el = dataset[key];
            const message = `Currency > ${el.toCurrency}\n`
                + `裁定金額 ¥ > ${el.totalMoney().toFixed(1)}\n`
                + `国外/国内比率 (bitbank比) % > ${el.diffPercent().toFixed(2)}\n`
                + `profit ¥ > ${el.profit().toFixed(1)}\n`
                + `expectedReturn % > ${el.expectedReturn()?.toFixed(3)}\n`
                + `XRPJPY ¥ > ${el.xrpjpy}\n`
                + `XRPUSD  $ > ${el.xrpusd}\n`
                + `取引量 > ${el.quantity.toFixed(2)}\n`
                + `送金手数料 ¥ > ${el.sendFeeJPY().toFixed(0)}\n`

            console.log("[Info]:Log\n", message);
            if (push && Math.abs(el.diffPercent() - 100) > Number(CONFIG.ARB.BASIS)) {
                await pushMessage(message);
            }
        }
    }
}
main()
