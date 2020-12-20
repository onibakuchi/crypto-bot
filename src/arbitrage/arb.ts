import axiosBase from 'axios';
import ARB_CONFIG from '../config/arbitrageConfig.json';
import { pushMessage } from '../line';

export interface Template {
    targetCrypto: string;
    baseCrypto: string;
    usdjpy: number;
    usdJpyFromCrypto: number;
    targetCryptoJPY: number;
    targetCryptoUSD: number;
    baseCryptoJPY: number;
    baseCryptoUSD: number;
    quantity: number;
    tradeFeePercent: number;
    sendFeeCrypto: number;
    fiatOtherFee?: number;
}
export interface ArbCalculator {
    diffPercent(): number
    sendFeeJPY(): number
    totalMoney(): number
    expectedReturn(): number
    profit(): number
    totalFee?(): number;
}
export interface ArbObject extends ArbCalculator, Template {
    targetCrypto: string;
    baseCrypto: string;
    usdJpyFromCrypto: number;
    targetCryptoJPY: number;
    targetCryptoUSD: number;
    baseCryptoJPY: number;
    baseCryptoUSD: number;
    quantity: number;
    tradeFeePercent: number;
    sendFeeCrypto: number;
    fiatOtherFee?: number;
    diffPercent(): number;
    sendFeeJPY(): number;
    totalMoney(): number;
    expectedReturn(): number;
    profit(): number;
    totalFee?(): number;
}
export interface ArbObjects {
    [symbol: string]: ArbObject
}

export const addCalculator = (tickers: { [symbol: string]: Template }): ArbObjects => {
    const calculator: ArbCalculator = {
        diffPercent: function () {
            return 100 * (this.usdJpyFromCrypto * this.targetCryptoUSD / this.targetCryptoJPY)
        },
        sendFeeJPY: function () {
            return this.sendFeeCrypto * this.targetCryptoJPY;
        },
        totalMoney: function () { return this.targetCryptoJPY * this.quantity },
        profit: function () {
            return this.quantity * (Math.abs(this.diffPercent() - 100) * this.targetCryptoJPY - this.tradeFeePercent * this.targetCryptoJPY) / 100 - this.sendFeeCrypto * this.targetCryptoJPY
        },
        expectedReturn: function () {
            return this.profit() / this.totalMoney();
        }
    }
    for (const [key, value] of Object.entries(tickers)) {
        value["quantity"] = parseFloat(ARB_CONFIG[key]["size"]) / value["targetCryptoJPY"]
        value["tradeFeePercent"] = parseFloat(ARB_CONFIG[key]["tradeFeePercent"]);
        value["sendFeeCrypto"] = parseFloat(ARB_CONFIG[key]["sendFeeCrypto"]);
        value["baseCrypto"] = key;
        value["usdJpyFromCrypto"] = value.baseCryptoJPY / value.baseCryptoUSD;
        Object.assign(value, calculator);
    }
    return tickers as unknown as ArbObjects
}
export const addCryptoFiatCalculator = (tickers: { [symbol: string]: Template }): ArbObjects => {
    const calculator: ArbCalculator = {
        diffPercent: function () {
            return 100 * this.usdjpy / this.usdJpyFromCrypto;
        },
        sendFeeJPY: function () {
            return this.sendFeeCrypto * this.targetCryptoJPY;
        },
        totalMoney: function () { return this.targetCryptoJPY * this.quantity },
        profit: function () {
            return this.quantity * (Math.abs(this.diffPercent() - 100) * this.targetCryptoJPY - this.tradeFeePercent * this.targetCryptoJPY) / 100 - this.sendFeeCrypto * this.targetCryptoJPY - this.fiatOtherFee;
        },
        expectedReturn: function () {
            return this.profit() / this.totalMoney();
        },
        totalFee: function () {
            return this.tradeFeePercent * this.targetCryptoJPY + this.sendFeeCrypto * this.targetCryptoJPY + (this.fiatOtherFee ?? 0);
        }
    }
    for (const [key, value] of Object.entries(tickers)) {
        value["quantity"] = parseFloat(ARB_CONFIG[key]["size"]) / value["targetCryptoJPY"]
        value["tradeFeePercent"] = parseFloat(ARB_CONFIG[key]["tradeFeePercent"]);
        value["sendFeeCrypto"] = parseFloat(ARB_CONFIG[key]["sendFeeCrypto"]);
        value["baseCrypto"] = key;
        Object.assign(value, calculator);
    }
    return tickers as unknown as ArbObjects
}

export const logger = async (dataset: ArbObjects, push: Boolean, basis: number) => {
    for (const key in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, key)) {
            const el = dataset[key];
            const message = `ベース通貨 > ${el.baseCrypto}\n`
                + `ターゲット通貨 > ${el.targetCrypto}\n`
                + `国外/国内比率 % > ${el.diffPercent()?.toFixed(2)}\n`
                + `粗利益 ¥ > ${el.profit().toFixed(1)}\n`
                + `収益率 % > ${el.expectedReturn()?.toFixed(3)}\n`
                + `ターゲットJPY建 ¥ > ${el.targetCryptoJPY}\n`
                + `ターゲットUSD建 $ > ${el.targetCryptoUSD}\n`
                + `裁定金額 ¥ > ${el.totalMoney().toFixed(1)}\n`
                + `取引量 > ${el.quantity.toFixed(2)}\n`
                + `送金手数料 ¥ > ${el.sendFeeJPY().toFixed(0)}\n`
                + `その他手数料 ¥ > ${el.fiatOtherFee?.toFixed(0)}\n`
            console.log("[Info]:Log\n", message);
            if (push && Math.abs(el.diffPercent() - 100) > basis) {
                await pushMessage(message);
            }
        }
    }
}

export const requestFiatRate = async (base: string, target: string): Promise<any> => {
    const rate = (await axiosBase.get('https://api.exchangeratesapi.io/latest?base=' + base.toUpperCase())).data.rates[target.toUpperCase()]
    // https://www.freeforexapi.com/api/live?pairs=USDJPY
    console.log(`${base.toUpperCase()}/${target.toUpperCase()}:${rate?.toFixed(3)}`);
    return rate;
}
