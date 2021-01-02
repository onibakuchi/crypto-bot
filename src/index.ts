import express from 'express';
import { App } from './app';
import { DatastoreWithMongo } from './datastore/datastore-mongo';
import { HigeCatchStrategy } from './strategy/strategy';
const TIMEOUT = Number(process.env.TIMEOUT) || 480 * 1000;
const PORT = process.env.PORT || 3000;

const bot = new App('ftx');
bot.setStrategy([HigeCatchStrategy]);
bot.setDatastore(DatastoreWithMongo);
// bot.start();

const app = express();
app.get('/cron/start/bot', (req, res) => {
    console.log('req.headers :>> ', req.headers);
    console.log('req.ip :>> ', req.ip);

    if (req.headers['X-Appengine-Cron']) {
        console.log('This reqest is from GAE');
        setImmediate(async () => await bot.start());
        res.status(200).end();
    }
    res.send("Hello World!");
});

app.listen(PORT, () => console.log('🚀App listening on PORT', PORT));

process.on('unhandledRejection', async (reason, p) => {
    console.error(reason);
    await bot.stop();
    console.log('Stopped app.');
    process.exit(1);
});