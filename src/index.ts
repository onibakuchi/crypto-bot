import { DatastoreWithMongo } from './datastore/datastore-mongo';
import { App } from './app';
import { HigeCatchStrategy } from './strategy/strategy';

const app = new App('ftx');
app.setStrategy([HigeCatchStrategy]);
app.setDatastore(DatastoreWithMongo);
app.start();

process.on('unhandledRejection', async (reason, p) => {
    console.error(reason);
    await app.stop();
    console.log('Stopped app.');
    process.exit(1);
});