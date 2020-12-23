"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(async () => {
    const test = (c = 0) => {
        const hoge = Error('hoge');
        if (hoge instanceof Error) {
            if (c > 2)
                return 'hogemaru';
            return test(c + 1);
        }
    };
    const promise2 = test();
    const promise1 = await Promise.resolve('resolve');
    const prom = await Promise.resolve('hoge');
    const prom1 = await new Promise(resolve => setTimeout(() => {
        resolve(1);
    }, 100));
    const timer = setInterval(() => console.log('hoge'), 5000);
    // timer.refresh();
    timer.refresh();
    // setInterval(() => timer.refresh(), 500);
    // https://www.freeforexapi.com/api/live?pairs=USDJPY
    // http://www.gaitameonline.com/rateaj/getrate
})();
