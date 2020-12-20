import { ExchangeRepositoryFactory } from '../exchanges/exchanges';
import CONFIG from '../config/config';
import { addCryptoFiatCalculator, logger, requestFiatRate, Template } from './arb';
import { pushMessage } from '../line';

const TIMEOUT = Number(process.env.TIMEOUT) || 3600 * 1000;
const target = 'USDJPY';
const symbols = ['BTC', 'ETH', 'XRP'];

const ftx = new (ExchangeRepositoryFactory.get('ftx'))();
const bb = new (ExchangeRepositoryFactory.get('bitbank'))();

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
    fiatOtherFee: 0
}
const main = async () => {
    try {
        const tckFtx = await ftx.fetchTickers(symbols.map(el => el + '/USD'))
        const tckBb = await bb.fetchTickers(symbols.map(el => el + '/JPY'));
        const USDJPY = await requestFiatRate('USD', 'JPY');
        template.usdjpy = Number(USDJPY);

        const arbXRP = Object.assign({ ...template });
        arbXRP.targetCryptoJPY = tckBb['XRP/JPY']['bid'];
        arbXRP.targetCryptoUSD = tckFtx['XRP/USD']['bid'];
        arbXRP.usdJpyFromCrypto = tckBb['XRP/JPY']['bid'] / tckFtx['XRP/USD']['bid'];

        const arbETH = Object.assign({ ...template })
        arbETH.targetCryptoJPY = tckBb['ETH/JPY']['bid'];
        arbETH.targetCryptoUSD = tckFtx['ETH/USD']['bid'];
        arbETH.usdJpyFromCrypto = arbETH.targetCryptoJPY / arbETH.targetCryptoUSD;

        const arbBTC = Object.assign({ ...template })
        arbBTC.targetCryptoJPY = tckBb['BTC/JPY']['bid'];
        arbBTC.targetCryptoUSD = tckFtx['BTC/USD']['bid'];
        arbBTC.usdJpyFromCrypto = arbBTC.targetCryptoJPY / arbBTC.targetCryptoUSD;

        const arbData = { [symbols[2]]: arbXRP,[symbols[0]]: arbBTC, [symbols[1]]: arbETH };
        addCryptoFiatCalculator(arbData);
        // console.log('arbData :>> ', arbData);
        logger(arbData, true, Number(CONFIG.ARB.BASIS));
    }
    catch (e) {
        await pushMessage(e)
        console.log('[ERROR]:', e);
    }
}


main();