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
}
export interface ArbCalculator {
    diffPercent(): number
    sendFeeJPY(): number
    totalMoney(): number
    expectedReturn(): number
    profit(): number
}
export interface ArbObject extends ArbCalculator, Template {
    targetCrypto: string,
    baseCrypto: string,
    usdJpyFromCrypto: number,
    targetCryptoJPY: number,
    targetCryptoUSD: number,
    baseCryptoJPY: number,
    baseCryptoUSD: number,
    quantity: number
    tradeFeePercent: number
    sendFeeCrypto: number
    diffPercent(): number
    sendFeeJPY(): number
    totalMoney(): number
    expectedReturn(): number
    profit(): number
}
export interface ArbObjects {
    [symbol: string]: ArbObject
}