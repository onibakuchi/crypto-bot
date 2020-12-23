"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.record = void 0;
const sheet_1 = require("../sheet/sheet");
const config_1 = __importDefault(require("../config/config"));
const record = async (func, range, column) => {
    const appendRequest = {
        spreadsheetId: config_1.default.SPREAD_SHEET.SHEET_ID,
        range: '',
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: []
        }
    };
    const arbData = await func();
    appendRequest.range = range;
    const values = column.reduce((prev, current) => {
        prev.push(arbData[current].targetCryptoJPY);
        prev.push(arbData[current].targetCryptoUSD);
        prev.push(arbData[current].usdjpy);
        prev.push(arbData[current].usdJpyFromCrypto);
        prev.push(arbData[current].diffPercent());
        return prev;
    }, []);
    values.unshift((new Date).toISOString());
    appendRequest.resource.values.push(values);
    await sheet_1.sheetAPI(sheet_1.append, appendRequest);
};
exports.record = record;
