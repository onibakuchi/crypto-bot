import { ExchangeRepositoryFactory } from '../exchanges/exchanges';
import { addCryptoFiatCalculator, ArbObjects, logger, requestFiatRate, Template } from './arb';
import { pushMessage } from '../notif/line';
import { record } from './record';
import CONFIG from '../config/config';

const target = 'USDJPY';
const symbols = ['BTC', 'ETH', 'XRP'];
const column = ['BTC', 'XRP'];

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
export const fiatCryptoArb = async (): Promise<ArbObjects> => {
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
        return arbData;
    }
    catch (e) {
        await pushMessage(e.message)
        console.log('[ERROR]:', e);
    }
}

export const recordFiatArb = async (range: string,column: any[]) => {
    await record(fiatCryptoArb, range, column);
}

const makeArbObj = (tckAbroad, tckJapan, symbol: string) => {
    const arbObj = Object.assign({ ...template });
    arbObj.targetCryptoJPY = tckJapan[symbol + '/JPY']['bid'];
    arbObj.targetCryptoUSD = tckAbroad[symbol + '/USD']['bid'];
    arbObj.usdJpyFromCrypto = tckJapan[symbol + '/JPY']['bid'] / tckAbroad[symbol + '/USD']['bid'];
    return arbObj
}

if (require.main == module) {
    fiatCryptoArb();
}

