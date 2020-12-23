import { recordXRPArb } from './xrp-arb';
import { recordFiatArb } from './fiat-crypto-arb';
import { repeat } from '../utils/repeat';

const TIMEOUT = Number(process.env.TIMEOUT) || 3600 * 1000
const INTERVAL = Number(process.env.INTERVAL) || 180
const expiration = Date.now() + TIMEOUT;
(async () => {
    repeat(recordXRPArb, INTERVAL, expiration);
    repeat(recordFiatArb, INTERVAL, expiration);
})().catch(e => {
    console.log('e :>> ', e);
    process.exit(1);
})