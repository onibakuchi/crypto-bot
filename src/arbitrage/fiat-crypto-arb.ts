import CCXT from 'ccxt';
import axiosBase from 'axios';
import { ExchangeRepositoryFactory } from '../exchanges/exchanges';
import CONFIG from '../config/config';
import ARB_CONFIG from '../config/arbitrageConfig.json';
import { pushMessage } from '../line';

const ftx = new (ExchangeRepositoryFactory.get('ftx'))();
const bb = new (ExchangeRepositoryFactory.get('bitbank'))();

const main = async () => {


}

const requestFiatRate = async (base: string, target: string): Promise<any> => {
    const rate = (await axiosBase.get('https://api.exchangeratesapi.io/latest?base=' + base.toUpperCase())).data.rates[target.toUpperCase()]
    // https://www.freeforexapi.com/api/live?pairs=USDJPY
    console.log(`${base.toUpperCase()}/${target.toUpperCase()}:${rate?.toFixed(3)}`);
    return rate;
}

main();