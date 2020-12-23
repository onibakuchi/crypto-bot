"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repeat = void 0;
/**
 *
 * @param func repeated function
 * @param interval interval second
 * @param expiration unix time (ms)
 */
const repeat = async (func, interval, expiration, ...args) => {
    // await new Promise(resolve => setTimeout(resolve, 25 * 1000));
    // repeat(func);
    try {
        if (expiration * 1000 < Date.now())
            process.exit(0);
        console.log('[Info]:Processing...');
        await func(...args);
        console.log('[Info]:Await...');
    }
    catch (e) {
        console.log('[ERROR] :>> ', e);
        console.log('[Info]:EXIT(1)');
        process.exit(1);
    }
    setTimeout(() => {
        exports.repeat(func, interval, expiration);
    }, interval * 1000);
};
exports.repeat = repeat;
