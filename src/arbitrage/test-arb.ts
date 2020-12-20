import CCXT from 'ccxt';
import { pushMessage } from '../line';
import axiosBase from 'axios';
import { Prices, Tickers, ArbitrageCalculator, ArbitrageSet } from '../interfaces/arbitrageInterfaces';

const assignTickers = (prices: Prices, target: any): Tickers => {
    const tickers = {};
    for (const [key, value] of Object.entries(prices)) {
        tickers[key] = {
            symbol: key,
            ask: value["ask"],
            bid: value["bid"],
            cask: null,
            cbid: null,
            bask: null,
            bbid: null,
            rate: null
        }
    }
    return Object.assign(target || {}, tickers)
}

const addCPrices = async (tickers: Tickers, base: string, target: string): Promise<Tickers> => {
    const rate = (await axiosBase.get('https://api.exchangeratesapi.io/latest?base=' + base.toUpperCase())).data.rates[target.toUpperCase()]
    console.log(`${base.toUpperCase()}/${target.toUpperCase()}:${rate?.toFixed(3)}`);

    for (const [, value] of Object.entries(tickers)) {
        value["cask"] = value["ask"] * rate;
        value["cbid"] = value["bid"] * rate;
        value["rate"] = rate;
    }
    return tickers;
}

const addBPrices = async (tickers: Tickers, exchange: CCXT.Exchange, symbols: string[], base): Promise<Tickers> => {
    for (const symbol of symbols) {
        const res = await new Promise((resolve, rejects) => {
            setTimeout(async () => {
                try {
                    const res = await exchange.fetchTicker(symbol);
                    resolve(res);
                } catch (e) {
                    rejects(e);
                }
            }, 1500);
        });
        tickers[symbol.replace('/JPY', '/USD')]["bask"] = res["ask"];
        tickers[symbol.replace('/JPY', '/USD')]["bbid"] = res["bid"];

    }
    return tickers;
}

const expectedReturn = (tickers: Tickers, arbitrageConfig): ArbitrageSet => {
    const calculator = {
        diffPercent: function () {
            return (typeof this.sellBasedJPY == 'number' && !isNaN(this.sellBasedJPY)) ? 100 * (this.sellBasedJPY / this.buy - 1) : NaN
        },
        sendFeeJPY: function () {
            return this.sendFeeCrypto * this.buy;
        },
        totalMoney: function () { return this.buy * this.quantity },
        profit: function () {
            return this.quantity * (Math.abs(this.diffPercent()) * this.buy - this.tradeFeePercent * this.sellBasedJPY) / 100 - this.sendFeeCrypto * this.buy
        },
        expectedReturn: function () {
            return 100 * this.profit() / this.totalMoney();
        }
    } as ArbitrageCalculator
    for (const [key, value] of Object.entries(tickers)) {
        // if (value['cask'] > value['bbid']) {
        //     value["buy"] = value["bbid"]
        //     value["high"] = 'USD'
        //     value["sellBasedUSD"] = value["bid"]
        //     value["sellBasedJPY"] = value["cbid"]
        // } else {
        //     value["buy"] = value["ask"]
        //     value["high"] = 'JPY'
        //     value["sellBasedUSD"] = value["bid"] / value['rate']
        //     value["sellBasedJPY"] = value["bid"]
        // }
        value["buy"] = value["bbid"]
        value["sellBasedUSD"] = value["bid"]
        value["sellBasedJPY"] = value["cbid"]
        // value["buy"] = value["cask"] > value["bbid"] ? value["bbid"] : null
        // value["sellBasedUSD"] = value["cbid"] > value["bbid"] ? value["bid"] : null
        // value["sellBasedJPY"] = value["cask"] > value["bbid"] ? value["cbid"] : null
        value["quantity"] = arbitrageConfig[key]["fixedSize"]
            ? parseFloat(arbitrageConfig[key]["size"]) / value["bbid"]
            : parseFloat(arbitrageConfig[key]["quantity"]);
        value["tradeFeePercent"] = parseFloat(arbitrageConfig[key]["tradeFeePercent"]);
        value["sendFeeCrypto"] = parseFloat(arbitrageConfig[key]["sendFeeCrypto"]);
        Object.assign(value, calculator);
    }
    return tickers as ArbitrageSet
}

const logger = (dataset: ArbitrageSet) => {
    for (const key in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, key)) {
            const el = dataset[key];
            const message = {
                type: "text",
                text: `
    symbol > ${el.symbol}
    Buy  [bitbank] ¥ > ${el.buy}
    Sell [FTX] $ > ${el.sellBasedUSD}
    Sell [FTX] ¥ > ${el.sellBasedJPY?.toFixed(2)}
    割高 (bitbank比) % > ${el.diffPercent().toFixed(3)}
    裁定金額 ¥ > ${el.totalMoney().toFixed(1)}
    取引量 > ${el.quantity.toFixed(2)}
    profit ¥ > ${el.profit().toFixed(1)}
    expectedReturn % > ${el.expectedReturn()?.toFixed(3)}
    送金手数料 ¥ > ${el.sendFeeJPY().toFixed(0)}
    `
            } as Message;
            console.log("[Info]:Log", message['text']);
        }
    }
}

const judgeOp = async (basis = 1, dataset: ArbitrageSet, log: Boolean): Promise<ArbitrageCalculator[]> => {
    const satisfiedData: ArbitrageCalculator[] = [];
    for (const [key, data] of Object.entries(dataset)) {
        if (Math.abs(data?.diffPercent()) > basis) {
            satisfiedData.push(data);
            const message = {
                type: "text",
                text: `symbol > ${data.symbol}
Buy [bitbank] ¥ > ${data.buy}\nSell [FTX] $ > ${data.sellBasedUSD}
Sell [FTX] ¥ > ${data.sellBasedJPY?.toFixed(2)}
割高 (bitbank比) % > ${data.diffPercent().toFixed(3)}
裁定金額 ¥ > ${data.totalMoney().toFixed(1)}
取引量 > ${data.quantity.toFixed(2)}
profit ¥ > ${data.profit()?.toFixed(1)}
expectedReturn % > ${data.expectedReturn()?.toFixed(3)}
送金手数料 ¥ > ${data.sendFeeJPY()?.toFixed(0)}
                `
            } as Message;
            await pushMessage(axiosBase, [message]);
        }
    }
    log && logger(dataset);

    // if ((Math.abs(tmp.diff) > basis) && (tmp?.diff != undefined)) {
    //     log && logger(dataset);
    //     const el = dataset[tmp.symbol];
    //     const message = {
    //         type: "text",
    //         text: `
    // symbol > ${el.symbol}
    // Buy  [bitbank] ¥ > ${el.buy}
    // Sell [FTX] $ > ${el.sellBasedUSD}
    // Sell [FTX] ¥ > ${el.sellBasedJPY?.toFixed(2)}
    // 割高 (bitbank比) % > ${el.diffPercent().toFixed(3)}
    // 裁定金額 ¥ > ${el.totalMoney().toFixed(1)}
    // 取引量 > ${el.quantity.toFixed(2)}
    // profit ¥ > ${el.profit().toFixed(1)}
    // expectedReturn % > ${el.expectedReturn().toFixed(3)}
    // 送金手数料 ¥ > ${el.sendFeeJPY().toFixed(0)}
    // `
    //     } as Message;
    // await pushMessage(axiosBase, [message]);
    return satisfiedData;
}

export { assignTickers, addBPrices, addCPrices, expectedReturn, logger, judgeOp };
