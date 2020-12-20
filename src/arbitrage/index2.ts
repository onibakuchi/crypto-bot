import CCXT from 'ccxt';
import { initExchange } from './exchange';
import { Prices } from './interfaces/arbitrageInterfaces';


const ftx = initExchange(CCXT, 'ftx');
const bb = new CCXT['bitbank']();
const cc = new CCXT['coincheck']();
// const kraken = new CCXT['kraken']();
const symbols = ['BTC', 'ETH', 'XRP'];

const main = async () => {
    try {
        const tckFtx = await ftx.fetchTickers(symbols.map(el => el + '/USD')) as Prices;
        const tckBb = await fetchTickers(bb, symbols.map(el => el + '/JPY'));
        const tckCc = await fetchTickers(cc, [symbols[0] + '/JPY']);
        // const tckKraken = await fetchTickers(kraken, [symbols[2] + '/JPY']);
        // console.log('tckKraken :>> ', tckKraken['XRP/JPY']['bid']);

        console.log(`BTCから算出されるドルレート :>> `, tckCc['BTC/JPY']['bid'] / tckFtx['BTC/USD']['bid']);
        console.log(`XRPから算出されるドルレート:>> `, tckBb['XRP/JPY']['bid'] / tckFtx['XRP/USD']['bid']);

        console.log(`BTCレートから計算されるXRPJPY \n :>> `, tckCc['BTC/JPY']['bid'] / tckFtx['BTC/USD']['bid'] * tckFtx['XRP/USD']['bid']);
        console.log(`現在のXRPJPY  :>> `, tckBb['XRP/JPY']['bid']);
        // const diffXRP0 = tckCc['BTC/JPY']['bid'] / tckFtx['BTC/USD']['bid'] * tckFtx['XRP/USD']['bid'] / tckKraken['XRP/JPY']['bid'];
        // console.log(`BTCレートから算出されるXRPJPYの割高率(bb比)\n:>> `,
        //     ((diffXRP0 - 1) * 100)?.toFixed(4)
        // );

        // XRPJPYを購入しXRPUSDで売り，残ったドルでBTCを買ってJ国内に送zz金して換金した場合
        const diffXRP = tckCc['BTC/JPY']['bid'] / tckFtx['BTC/USD']['bid'] * tckFtx['XRP/USD']['bid'] / tckBb['XRP/JPY']['bid'];
        console.log(`100 * BTCJPY / BTCUSD * XRPUSD / XRPJPY \n= `, (100 * diffXRP)?.toFixed(2));
        const diffXRP2 = tckBb['ETH/JPY']['bid'] / tckFtx['ETH/USD']['bid'] * tckFtx['XRP/USD']['bid'] / tckBb['XRP/JPY']['bid'];
        console.log(`100 * ETHJPY / ETHUSD * XRPUSD / XRPJPY \n= `, (100 * diffXRP2)?.toFixed(2));
        // let tickers = assignTickers(tckFtx, {});
        // await addCPrices(tickers, 'USD', 'JPY');
        // tickers = await addBPrices(tickers, bb, symbols.map(el => el + '/JPY'), 'USD');
        // const dataset = expectedReturn(tickers, arbitrageConfig);
        // logger(dataset);
        // const data = await judgeOp(Number(config.BASIS), dataset, false);
        // console.log('data :>> ', data);
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

const fetchTickers = async (exchange: CCXT.Exchange, symbols: any[]) => {
    const tickers = {};
    for (const symbol of symbols) {
        await new Promise<void>(resolve => {
            setTimeout(resolve, 1000)
        });
        const tckFtx = await exchange.fetchTicker(symbol);
        tickers[symbol] = tckFtx;
    }
    return tickers;
}
main()
