const TIMEOUT = Number(process.env.TIMEOUT) || 3600 * 1000;
const expiration = Date.now() + TIMEOUT;

const repeat = async (func: { (): Promise<void>; (): void; },) => {
    // await new Promise(resolve => setTimeout(resolve, 25 * 1000));
    // repeat(func);
    try {
        if (expiration < Date.now()) process.exit(0);
        console.log('[Info]:Processing...');
        await func();
        console.log('[Info]:Await...');
    } catch (e) {
        console.log('[ERROR] :>> ', e);
        console.log('[Info]:EXIT(1)');
        process.exit(1)
    }
    setTimeout(() => {
        repeat(func);
    }, 120 * 1000);
}

