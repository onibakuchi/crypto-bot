
interface Prices {
    symbol: {
        symbol?: string;
        ask: number;
        bid: number;
        info?: any;
        [excessProperty: string]: any;
    }
    [excessProperty: string]: any;
}

/**
 * @interface Ticker
 * @property  {number} ask intermediate fiat-based ask,mainly USD-based
 * @property  {number} bid intermediate fiat-based bid,mainly USD-based
 * @property  {number|null}  cask converted fiat-based ask,mainly convertd JPY
 * @property  {number|null}  cbid converted fiat-based bid,mainly convertd JPY
 * @property  {number|null}  bask target fiat-based ask,mainly JPY
 * @property  {number|null}  bbid target fiat-based bid,mainly JPY
 */
interface Ticker {
    symbol?: string;
    ask: number;
    bid: number;
    cask: number | null;
    cbid: number | null;
    bask: number | null;
    bbid: number | null;
    rate: number | null;
    [excessProperty: string]: any;
}
/**
 * @interface Tickers
 * @inheritdoc Ticker
 * @property  {number} ask intermediate fiat-based ask,mainly USD-based
 * @property  {number} bid intermediate fiat-based bid,mainly USD-based
 * @property  {number|null}  cask converted fiat-based ask,mainly convertd JPY
 * @property  {number|null}  cbid converted fiat-based bid,mainly convertd JPY
 * @property  {number|null}  bask target fiat-based ask,mainly JPY
 * @property  {number|null}  bbid target fiat-based bid,mainly JPY
 */
interface Tickers extends Prices {
    symbol: Ticker;
    [symbols: string]: Ticker;
}

interface ArbitrageData extends Ticker {
    buy: number;
    sellBasedUSD: number;
    sellBasedJPY: number;
    quantity: number;
    tradeFeePercent: number;
    sendFeeCrypto: number;
    high?:string;
}
interface ArbitrageCalculator extends ArbitrageData {
    diffPercent: () => number;
    sendFeeJPY: () => number;
    totalMoney: () => number;
    profit: () => number;
    expectedReturn: () => number;
}

interface ArbitrageSet {
    symbol: ArbitrageCalculator
    [symbols: string]: ArbitrageCalculator
}

export { Prices, Tickers, ArbitrageData, ArbitrageCalculator, ArbitrageSet };