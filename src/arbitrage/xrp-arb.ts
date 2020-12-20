import { ExchangeRepositoryFactory } from '../exchanges/exchanges';
import { pushMessage } from '../line';
import { ArbCalculator, ArbObjects, Template, } from './arb-interface';
import CONFIG from '../config/config';
import ARB_CONFIG from '../config/arbitrageConfig.json';

const ftx = new (ExchangeRepositoryFactory.get('ftx'))();
const bb = new (ExchangeRepositoryFactory.get('bitbank'))();
const cc = new (ExchangeRepositoryFactory.get('coincheck'))();

const target = 'XRP';
const symbols = ['BTC', 'ETH', 'XRP'];

const template: Template = {
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
        arbBTC.targetCryptoJPY = tckBb['XRP/JPY']['bid'];
        arbBTC.targetCryptoUSD = tckFtx['XRP/USD']['bid'];
        arbBTC.baseCryptoJPY = tckCc['BTC/JPY']['bid'];
        arbBTC.baseCryptoUSD = tckFtx['BTC/USD']['bid'];

        const arbETH = Object.assign({ ...template })
        arbETH.targetCryptoJPY = tckBb['XRP/JPY']['bid'];
        arbETH.targetCryptoUSD = tckFtx['XRP/USD']['bid'];
        arbETH.baseCryptoJPY = tckBb['ETH/JPY']['bid'];
        arbETH.baseCryptoUSD = tckFtx['ETH/USD']['bid'];

        const arbData = { [symbols[0]]: arbBTC, [symbols[1]]: arbETH };
        addCalculator(arbData, ARB_CONFIG);
        // console.log('arbData :>> ', arbData);
        logger(arbData, true, Number(CONFIG.ARB.BASIS));
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
            return 100 * (this.usdJpyFromCrypto * this.targetCryptoUSD / this.targetCryptoJPY)
        },
        sendFeeJPY: function () {
            return this.sendFeeCrypto * this.targetCryptoJPY;
        },
        totalMoney: function () { return this.targetCryptoJPY * this.quantity },
        profit: function () {
            return this.quantity * (Math.abs(this.diffPercent() - 100) * this.targetCryptoJPY - this.tradeFeePercent * this.targetCryptoJPY) / 100 - this.sendFeeCrypto * this.targetCryptoJPY
        },
        expectedReturn: function () {
            return this.profit() / this.totalMoney();
        }
    }
    for (const [key, value] of Object.entries(tickers)) {
        value["quantity"] = parseFloat(arbitrageConfig[key]["size"]) / value["targetCryptoJPY"]
        value["tradeFeePercent"] = parseFloat(arbitrageConfig[key]["tradeFeePercent"]);
        value["sendFeeCrypto"] = parseFloat(arbitrageConfig[key]["sendFeeCrypto"]);
        value["baseCrypto"] = key;
        value["usdJpyFromCrypto"] = value.baseCryptoJPY / value.baseCryptoUSD;
        Object.assign(value, calculator);
    }
    return tickers as unknown as ArbObjects
}

const logger = async (dataset: ArbObjects, push: Boolean,basis: number) => {
    for (const key in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, key)) {
            const el = dataset[key];
            const message = `Currency > ${el.baseCrypto}\n`
                + `裁定金額 ¥ > ${el.totalMoney().toFixed(1)}\n`
                + `国外/国内比率 (bitbank比) % > ${el.diffPercent().toFixed(2)}\n`
                + `profit ¥ > ${el.profit().toFixed(1)}\n`
                + `expectedReturn % > ${el.expectedReturn()?.toFixed(3)}\n`
                + `XRPJPY ¥ > ${el.targetCryptoJPY}\n`
                + `XRPUSD  $ > ${el.targetCryptoUSD}\n`
                + `取引量 > ${el.quantity.toFixed(2)}\n`
                + `送金手数料 ¥ > ${el.sendFeeJPY().toFixed(0)}\n`

            console.log("[Info]:Log\n", message);
            if (push && Math.abs(el.diffPercent() - 100) > basis) {
                await pushMessage(message);
            }
        }
    }
}
main()
