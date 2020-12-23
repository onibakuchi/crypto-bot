import { recordXRPArb } from './xrp-arb';
import { recordFiatArb } from './fiat-crypto-arb';
import { repeat } from '../utils/repeat';
import CONFIG from '../config/config';

const TIMEOUT = Number(process.env.TIMEOUT) || 240 * 1000
const INTERVAL = Number(process.env.INTERVAL) || 120
const expiration = Date.now() + TIMEOUT;

const column = ['BTC', 'XRP'];
const xrpColumn = ['BTC', 'ETH'];
(async () => {
    // repeat(recordXRPArb, INTERVAL, expiration);
    repeat(recordXRPArb, INTERVAL, expiration, CONFIG.SPREAD_SHEET.XRP_ARB_RANGE, xrpColumn);
    repeat(recordFiatArb, INTERVAL, expiration, CONFIG.SPREAD_SHEET.FIAT_ARB_RANGE, column);
    // recordXRPArb();
    // recordFiatArb();
})().catch(e => {
    console.log('e :>> ', e);
    process.exit(1);
})