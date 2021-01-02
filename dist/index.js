"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_1 = require("./app");
const datastore_mongo_1 = require("./datastore/datastore-mongo");
const strategy_1 = require("./strategy/strategy");
const TIMEOUT = Number(process.env.TIMEOUT) || 480 * 1000;
const PORT = process.env.PORT || 3000;
const bot = new app_1.App('ftx');
bot.setStrategy([strategy_1.HigeCatchStrategy]);
bot.setDatastore(datastore_mongo_1.DatastoreWithMongo);
// bot.start();
const app = express_1.default();
app.get('/', (req, res) => {
    res.status(200).send('Hello, world!').end();
});
app.get('/cron/start/bot', (req, res) => {
    console.log('req.headers :>> ', req.headers);
    console.log('req.ip :>> ', req.ip);
    if (req.headers['X-Appengine-Cron']) {
        console.log('This reqest is from GAE');
        setImmediate(async () => await bot.start());
    }
    res.status(200).send('Hello world!').end();
});
app.listen(PORT, () => console.log('🚀App listening on PORT', PORT));
process.on('unhandledRejection', async (reason, p) => {
    console.error(reason);
    await bot.stop();
    console.log('Stopped app.');
    process.exit(1);
});
