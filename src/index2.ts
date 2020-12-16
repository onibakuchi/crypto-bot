import { ExchangeRepositoryFactory } from './exchanges/exchanges';

const ftx = new (ExchangeRepositoryFactory.get('ftx'))();
const bb = new (ExchangeRepositoryFactory.get('bitbank'))();
const cc = new (ExchangeRepositoryFactory.get('coincheck'))();

const symbols = ['BTC', 'ETH', 'XRP'];

const main = async () => {
    try {
        const tckFtx = await ftx.fetchTickers(symbols.map(el => el + '/USD'))
        const tckBb = await bb.fetchTickers(symbols.map(el => el + '/JPY'));
        const tckCc = await cc.fetchTickers([symbols[0] + '/JPY']);

        console.log(`現在のXRPJPY \n :>> `, tckBb['XRP/JPY']['bid']);
        console.log(`BTCレートから算出されるXRPJPY \n :>> `, tckCc['BTC/JPY']['bid'] / tckFtx['BTC/USD']['bid'] * tckFtx['XRP/USD']['bid']);

        // XRPJPYを購入しXRPUSDで売り，残ったドルでBTCを買ってJ国内に送zz金して換金した場合
        const diffXRP = tckCc['BTC/JPY']['bid'] / tckFtx['BTC/USD']['bid'] * tckFtx['XRP/USD']['bid'] / tckBb['XRP/JPY']['bid'];
        console.log(`100 * BTCJPY / BTCUSD * XRPUSD / XRPJPY = `, (100 * diffXRP)?.toFixed(2));
        const diffXRP2 = tckBb['ETH/JPY']['bid'] / tckFtx['ETH/USD']['bid'] * tckFtx['XRP/USD']['bid'] / tckBb['XRP/JPY']['bid'];
        console.log(`100 * ETHJPY / ETHUSD * XRPUSD / XRPJPY = `, (100 * diffXRP2)?.toFixed(2));
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
const estimateXRPArb = (dollDenomiTickers, yenDenomiTickers, yenExitDenomiTickers) => {
    const diffXRP = yenExitDenomiTickers['BTC/JPY']['bid'] / dollDenomiTickers['BTC/USD']['bid'] * dollDenomiTickers['XRP/USD']['bid'] / yenDenomiTickers['XRP/JPY']['bid'];
    console.log(`100 * BTCJPY / BTCUSD * XRPUSD / XRPJPY (%) = `, (100 * diffXRP)?.toFixed(2));
    const diffXRP2 = yenExitDenomiTickers['ETH/JPY']['bid'] / dollDenomiTickers['/USD']['bid'] * dollDenomiTickers['XRP/USD']['bid'] / yenDenomiTickers['XRP/JPY']['bid'];
    console.log(`100 * ETHJPY / ETHUSD * XRPUSD / XRPJPY \n= `, (100 * diffXRP2)?.toFixed(2));

}
main()
