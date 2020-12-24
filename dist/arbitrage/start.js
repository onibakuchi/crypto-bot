"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xrp_arb_1 = require("./xrp-arb");
const fiat_crypto_arb_1 = require("./fiat-crypto-arb");
const config_1 = __importDefault(require("../config/config"));
const TIMEOUT = Number(process.env.TIMEOUT) || 480 * 1000;
const INTERVAL = Number(process.env.INTERVAL) || 120;
const expiration = Date.now() + TIMEOUT;
const column = ['BTC', 'XRP'];
const xrpColumn = ['BTC', 'ETH'];
const main = async () => {
    // repeat(recordXRPArb, INTERVAL, expiration);
    // repeat(recordXRPArb, INTERVAL, expiration, CONFIG.SPREAD_SHEET.XRP_ARB_RANGE, xrpColumn);
    // repeat(recordFiatArb, INTERVAL, expiration, CONFIG.SPREAD_SHEET.FIAT_ARB_RANGE, column);
    // recordXRPArb();
    // recordFiatArb();
    try {
        if (expiration * 1000 < Date.now())
            process.exit(0);
        console.log('[Info]:Processing...');
        await xrp_arb_1.recordXRPArb(config_1.default.SPREAD_SHEET.XRP_ARB_RANGE, xrpColumn);
        await fiat_crypto_arb_1.recordFiatArb(config_1.default.SPREAD_SHEET.FIAT_ARB_RANGE, column);
        console.log('[Info]:Await...');
    }
    catch (e) {
        console.log('[ERROR] :>> ', e);
        console.log('[Info]:EXIT(1)');
        process.exit(1);
    }
    setTimeout(async () => await main(), INTERVAL * 1000);
};
// console.log('[Info]:Start...');
// setInterval(async () => {
//     try {
//         if (expiration * 1000 < Date.now()) process.exit(0);
//         console.log('[Info]:Processing...');
//         await recordXRPArb(CONFIG.SPREAD_SHEET.XRP_ARB_RANGE, xrpColumn);
//         await recordFiatArb(CONFIG.SPREAD_SHEET.FIAT_ARB_RANGE, column);
//         console.log('[Info]:Await...');
//     } catch (e) {
//         console.log('[ERROR] :>> ', e);
//         console.log('[Info]:EXIT(1)');
//         process.exit(1)
//     }
// }, INTERVAL * 1000)
main().catch(e => {
    console.log('e :>> ', e);
    process.exit(1);
});
