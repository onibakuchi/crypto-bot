import { pushMessage } from './notif/line';
import axios from 'axios';
(async () => {
    const test = (c = 0) => {
        const hoge = Error('hoge')
        if (hoge instanceof Error) {
            if (c > 2) return 'hogemaru'
            return test(c + 1)
        }
    }
    const promise2 = test();
    const promise1 = await Promise.resolve('resolve');

    const prom = await Promise.resolve('hoge')
    const prom1 = await new Promise(resolve => setTimeout(() => {
        resolve(1)
    }, 100))

    const data = (await axios.get('http://www.gaitameonline.com/rateaj/getrate')).data
    for (const value of data.quotes) {
        if (value.currencyPairCode == 'USDJPY') {
            console.log((Number(value.ask) + Number(value.bid)) / 2);
            return (Number(value.ask) + Number(value.bid)) / 2
        }
    }
    // https://www.freeforexapi.com/api/live?pairs=USDJPY
    // http://www.gaitameonline.com/rateaj/getrate


})()
