import { ExchangeRepositoryFactory } from '../exchanges/exchanges';
import { addCalculator, logger, Template, } from './arb';
import { pushMessage } from '../notif/line';
import CONFIG from '../config/config';

const target = 'XRP';
const symbols = ['BTC', 'ETH', 'XRP'];
const TIMEOUT = Number(process.env.TIMEOUT) || 3600 * 1000;
const expiration = Date.now() + TIMEOUT;

const ftx = ExchangeRepositoryFactory.get('ftx');
const bb = ExchangeRepositoryFactory.get('bitbank');
const cc = ExchangeRepositoryFactory.get('coincheck');

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
export const xrpArb = async () => {
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
        addCalculator(arbData);
        // console.log('arbData :>> ', arbData);
        logger(arbData, true, Number(CONFIG.ARB.BASIS));
    }
    catch (e) {
        await pushMessage(e.message)
        console.log('[ERROR]:', e);
    }
}

if (require.main == module) {
    xrpArb();
}

