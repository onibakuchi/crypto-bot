"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xrp_arb_1 = require("./xrp-arb");
const fiat_crypto_arb_1 = require("./fiat-crypto-arb");
const repeat_1 = require("../utils/repeat");
const config_1 = __importDefault(require("../config/config"));
const TIMEOUT = Number(process.env.TIMEOUT) || 240 * 1000;
const INTERVAL = Number(process.env.INTERVAL) || 120;
const expiration = Date.now() + TIMEOUT;
const column = ['BTC', 'XRP'];
const xrpColumn = ['BTC', 'ETH'];
(async () => {
    // repeat(recordXRPArb, INTERVAL, expiration);
    repeat_1.repeat(xrp_arb_1.recordXRPArb, INTERVAL, expiration, config_1.default.SPREAD_SHEET.XRP_ARB_RANGE, xrpColumn);
    repeat_1.repeat(fiat_crypto_arb_1.recordFiatArb, INTERVAL, expiration, config_1.default.SPREAD_SHEET.FIAT_ARB_RANGE, column);
    // recordXRPArb();
    // recordFiatArb();
})().catch(e => {
    console.log('e :>> ', e);
    process.exit(1);
});
