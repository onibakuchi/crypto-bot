

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

    const reserve = new Map();
    reserve.set('hofe',1);
    reserve.set('hoge',12);
    const  o = [...reserve.values()];
    console.log('e :>> ', o);
    reserve.clear();
    console.log('o :>> ', o);
    console.log('[...reserve.values()] :>> ', [...reserve.values()]);

})()
