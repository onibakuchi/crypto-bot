import { xrpArb } from './xrp-arb';
import { fiatCryptoArb } from './fiat-crypto-arb';
import { repeat } from '../utils/repeat';

const TIMEOUT = Number(process.env.TIMEOUT) || 3600 * 1000
const INTERVAL = Number(process.env.INTERVAL) || 180
const expiration = Date.now() + TIMEOUT;
(async () => {
    repeat(xrpArb, INTERVAL, expiration);
    // await new Promise(resolve => setTimeout(resolve, 5 * 1000));
    repeat(fiatCryptoArb, INTERVAL, expiration);
})().catch(e => {
    console.log('e :>> ', e);
    process.exit(1);
})