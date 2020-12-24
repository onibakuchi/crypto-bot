import { recordXRPArb } from './xrp-arb';
import { recordFiatArb } from './fiat-crypto-arb';
import CONFIG from '../config/config';

const TIMEOUT = Number(process.env.TIMEOUT) || 480 * 1000
const INTERVAL = Number(process.env.INTERVAL) || 120
const expiration = Date.now() + TIMEOUT;

const column = ['BTC', 'XRP'];
const xrpColumn = ['BTC', 'ETH'];

const main = async () => {
    try {
        if (expiration * 1000 < Date.now()) process.exit(0);
        console.log('[Info]:Processing...');
        await recordFiatArb(CONFIG.SPREAD_SHEET.FIAT_ARB_RANGE, column);
        await recordXRPArb(CONFIG.SPREAD_SHEET.XRP_ARB_RANGE, xrpColumn);
        console.log('[Info]:Await...');
    } catch (e) {
        console.log('[ERROR] :>> ', e);
        console.log('[Info]:EXIT(1)');
        process.exit(1)
    }
    setTimeout(async () => await main(), INTERVAL * 1000);
}

main().catch(e => {
    console.log('e :>> ', e);
    process.exit(1);
})