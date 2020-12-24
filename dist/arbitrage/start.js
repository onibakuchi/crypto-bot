"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const xrp_arb_1 = require("./xrp-arb");
const fiat_crypto_arb_1 = require("./fiat-crypto-arb");
const config_1 = __importDefault(require("../config/config"));
const TIMEOUT = Number(process.env.TIMEOUT) || 480 * 1000;
const INTERVAL = Number(process.env.INTERVAL) || 120;
const expiration = Date.now() + TIMEOUT;
const column = ['BTC', 'XRP'];
const xrpColumn = ['BTC', 'ETH'];
const app = express_1.default();
const main = async () => {
    try {
        if (expiration * 1000 < Date.now())
            process.exit(0);
        console.log('[Info]:Processing...');
        await fiat_crypto_arb_1.recordFiatArb(config_1.default.SPREAD_SHEET.FIAT_ARB_RANGE, column);
        await xrp_arb_1.recordXRPArb(config_1.default.SPREAD_SHEET.XRP_ARB_RANGE, xrpColumn);
        console.log('[Info]:Await...');
    }
    catch (e) {
        console.log('[ERROR] :>> ', e);
        console.log('[Info]:EXIT(1)');
        process.exit(1);
    }
    // setTimeout(async () => await main(), INTERVAL * 1000);
};
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
const port = process.env.port || 3000;
app.listen(port, () => console.log('🚀App listening on port', port));
// main().catch(e => {
//     console.log('e :>> ', e);
//     process.exit(1);
// })
