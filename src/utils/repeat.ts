/**
 * 
 * @param func repeated function
 * @param interval interval second
 * @param expiration unix time (ms)
 */
export const repeat = async (func: { (): Promise<any>; (): any; }, interval: number, expiration: number) => {
    // await new Promise(resolve => setTimeout(resolve, 25 * 1000));
    // repeat(func);
    try {
        if (expiration * 1000 < Date.now()) process.exit(0);
        console.log('[Info]:Processing...');
        await func();
        console.log('[Info]:Await...');
    } catch (e) {
        console.log('[ERROR] :>> ', e);
        console.log('[Info]:EXIT(1)');
        process.exit(1)
    }
    setTimeout(() => {
        repeat(func, interval, expiration);
    }, interval * 1000);
}

