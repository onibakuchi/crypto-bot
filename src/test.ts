

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

})()
