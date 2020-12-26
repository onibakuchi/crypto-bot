import express from 'express';
import { recordXRPArb } from './xrp-arb';
import { recordFiatArb } from './fiat-crypto-arb';
import CONFIG from '../config/config';

const TIMEOUT = Number(process.env.TIMEOUT) || 480 * 1000
const INTERVAL = 120000

const expiration = Date.now() + TIMEOUT;

const column = ['BTC', 'XRP'];
const xrpColumn = ['BTC', 'ETH'];

const app = express();

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
    // setTimeout(async () => await main(), INTERVAL);
}

app.get('/cron/start/bot', (req, res) => {
    console.log('req.headers :>> ', req.headers);
    console.log('req.ip :>> ', req.ip);

    if (req.headers['X-Appengine-Cron']) {
        console.log('This reqest is from GAE');
        setImmediate(async () => await main());
        res.status(200).end();
    }
    res.send("Hello World!");
});

console.log('[Info]:App started...');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀App listening on PORT', PORT));


// main().catch(e => {
//     console.log('e :>> ', e);
//     process.exit(1);
// })