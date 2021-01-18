"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestFiatRate = exports.logger = exports.addCryptoFiatCalculator = exports.addCalculator = void 0;
const axios_1 = __importDefault(require("axios"));
const arbitrageConfig_json_1 = __importDefault(require("../config/arbitrageConfig.json"));
const line_1 = require("../notif/line");
const addCalculator = (tickers) => {
    const calculator = {
        diffPercent: function () {
            return 100 * (this.usdJpyFromCrypto * this.targetCryptoUSD / this.targetCryptoJPY);
        },
        sendFeeJPY: function () {
            return this.sendFeeCrypto * this.targetCryptoJPY;
        },
        totalMoney: function () { return this.targetCryptoJPY * this.quantity; },
        profit: function () {
            return this.quantity * (Math.abs(this.diffPercent() - 100) * this.targetCryptoJPY - this.tradeFeePercent * this.targetCryptoJPY) / 100 - this.sendFeeCrypto * this.targetCryptoJPY;
        },
        expectedReturn: function () {
            return this.profit() / this.totalMoney();
        }
    };
    for (const [key, value] of Object.entries(tickers)) {
        value["quantity"] = parseFloat(arbitrageConfig_json_1.default[key]["size"]) / value["targetCryptoJPY"];
        value["tradeFeePercent"] = parseFloat(arbitrageConfig_json_1.default[key]["tradeFeePercent"]);
        value["sendFeeCrypto"] = parseFloat(arbitrageConfig_json_1.default[key]["sendFeeCrypto"]);
        value["baseCrypto"] = key;
        value["usdJpyFromCrypto"] = value.baseCryptoJPY / value.baseCryptoUSD;
        Object.assign(value, calculator);
    }
    return tickers;
};
exports.addCalculator = addCalculator;
const addCryptoFiatCalculator = (tickers) => {
    const calculator = {
        diffPercent: function () {
            return 100 * this.usdjpy / this.usdJpyFromCrypto;
        },
        sendFeeJPY: function () {
            return this.sendFeeCrypto * this.targetCryptoJPY;
        },
        totalMoney: function () { return this.targetCryptoJPY * this.quantity; },
        profit: function () {
            const pureProfit = this.quantity * (Math.abs(this.diffPercent() - 100) * this.targetCryptoJPY - this.tradeFeePercent * this.targetCryptoJPY) / 100;
            const fee = this.sendFeeCrypto * this.targetCryptoJPY - this.fiatOtherFee;
            return pureProfit - fee;
        },
        expectedReturn: function () {
            return 100 * this.profit() / this.totalMoney();
        },
        totalFee: function () {
            var _a;
            return this.tradeFeePercent * this.targetCryptoJPY + this.sendFeeCrypto * this.targetCryptoJPY + ((_a = this.fiatOtherFee) !== null && _a !== void 0 ? _a : 0);
        }
    };
    for (const [key, value] of Object.entries(tickers)) {
        value["quantity"] = parseFloat(arbitrageConfig_json_1.default[key]["size"]) / value["targetCryptoJPY"];
        value["tradeFeePercent"] = parseFloat(arbitrageConfig_json_1.default[key]["tradeFeePercent"]);
        value["sendFeeCrypto"] = parseFloat(arbitrageConfig_json_1.default[key]["sendFeeCrypto"]);
        value["baseCrypto"] = key;
        Object.assign(value, calculator);
    }
    return tickers;
};
exports.addCryptoFiatCalculator = addCryptoFiatCalculator;
const logger = async (dataset, push, basis) => {
    var _a, _b, _c, _d, _e, _f;
    for (const key in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, key)) {
            const el = dataset[key];
            const option = el.usdJpyFromCrypto ? `換算USDJPY:${(_a = el.usdJpyFromCrypto) === null || _a === void 0 ? void 0 : _a.toFixed(2)}\n` : ``;
            const message = `ベース通貨:${el.baseCrypto}\n`
                + `ターゲット通貨:${el.targetCrypto}\n`
                + `国外/国内比率 %:${(_b = el.diffPercent()) === null || _b === void 0 ? void 0 : _b.toFixed(3)}\n`
                + `鞘 %:${(_c = (100 - el.diffPercent())) === null || _c === void 0 ? void 0 : _c.toFixed(3)}\n`
                + `利益 ¥:${el.profit().toFixed(1)}\n`
                + `収益率 %:${(_d = el.expectedReturn()) === null || _d === void 0 ? void 0 : _d.toFixed(3)}\n`
                + `ターゲットJPY建 ¥:${el.targetCryptoJPY}\n`
                + `ターゲットUSD建 $:${el.targetCryptoUSD}\n`
                + `USDJPY:${(_e = el.usdjpy) === null || _e === void 0 ? void 0 : _e.toFixed(2)}\n`
                + option
                + `裁定金額 ¥:${el.totalMoney().toFixed(0)}\n`
                + `取引量:${el.quantity.toFixed(3)}\n`
                + `送金手数料 ¥:${el.sendFeeJPY().toFixed(0)}\n`
                + `その他手数料 ¥:${(_f = el.fiatOtherFee) === null || _f === void 0 ? void 0 : _f.toFixed(0)}\n`;
            console.log("[Info]:Log\n", message);
            if (push && Math.abs(el.diffPercent() - 100) > basis) {
                await line_1.pushMessage(message);
            }
        }
    }
};
exports.logger = logger;
const requestFiatRate = async (base, target) => {
    // const rate = (await axiosBase.get('https://api.exchangeratesapi.io/latest?base=' + base.toUpperCase())).data.rates[target.toUpperCase()]
    // https://www.freeforexapi.com/api/live?pairs=USDJPY
    // http://www.gaitameonline.com/rateaj/getrate
    const data = (await axios_1.default.get('http://www.gaitameonline.com/rateaj/getrate')).data;
    for (const rate of data.quotes) {
        if (rate.currencyPairCode == `${base}${target}`.toUpperCase()) {
            console.log('rate :>> ', (Number(rate.ask) + Number(rate.bid)) / 2);
            return (Number(rate.ask) + Number(rate.bid)) / 2;
        }
    }
    // console.log(`${base.toUpperCase()}/${target.toUpperCase()}:${rate?.toFixed(3)}`);
};
exports.requestFiatRate = requestFiatRate;
