import { ExchangeRepositoryFactory } from '../exchanges/exchanges';
import { repeat } from '../utils/repeat';
import { addCryptoFiatCalculator, logger, requestFiatRate, Template } from './arb';
import { pushMessage } from '../notif/line';
import CONFIG from '../config/config';

const TIMEOUT = Number(process.env.TIMEOUT) || 3600 * 1000;
const expiration = Date.now() + TIMEOUT;
const target = 'USDJPY';
const symbols = ['BTC', 'ETH', 'XRP'];

const ftx = ExchangeRepositoryFactory.get('ftx');
const bb = ExchangeRepositoryFactory.get('bitbank');

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
export const fiatCryptoArb = async () => {
    try {
        const tckFtx = await ftx.fetchTickers(symbols.map(el => el + '/USD'))
        const tckBb = await bb.fetchTickers(symbols.map(el => el + '/JPY'));
        const USDJPY = await requestFiatRate('USD', 'JPY');
        template.usdjpy = Number(USDJPY);

        const arbXRP = makeArbObj(tckFtx, tckBb, symbols[2]);
        const arbETH = makeArbObj(tckFtx, tckBb, symbols[1]);
        const arbBTC = makeArbObj(tckFtx, tckBb, symbols[0]);

        const arbData = { [symbols[2]]: arbXRP, [symbols[0]]: arbBTC, [symbols[1]]: arbETH };
        addCryptoFiatCalculator(arbData);
        // console.log('arbData :>> ', arbData);
        logger(arbData, true, Number(CONFIG.ARB.FIAT_BASIS));
    }
    catch (e) {
        await pushMessage(e.message)
        console.log('[ERROR]:', e);
    }
}

const makeArbObj = (tckAbroad, tckJapan, symbol: string) => {
    const arbObj = Object.assign({ ...template });
    arbObj.targetCryptoJPY = tckJapan[symbol + '/JPY']['bid'];
    arbObj.targetCryptoUSD = tckAbroad[symbol + '/USD']['bid'];
    arbObj.usdJpyFromCrypto = tckJapan[symbol + '/JPY']['bid'] / tckAbroad[symbol + '/USD']['bid'];
    return arbObj
}


if (require.main != module) {
    repeat(fiatCryptoArb, 120, expiration)
}

