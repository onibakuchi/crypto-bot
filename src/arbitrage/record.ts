import { sheetAPI, append } from '../sheet/sheet';
import CONFIG from '../config/config';
import type { ArbObjects } from './arb';

const appendRequest = {
    spreadsheetId: CONFIG.SPREAD_SHEET.SHEET_ID,
    range: '',
    insertDataOption: 'INSERT_ROWS',
    valueInputOption: 'USER_ENTERED',
    resource: {
        values: []
    }
};

export const record = async (func: () => Promise<ArbObjects>, range: string, column) => {
    const arbData = await func();
    appendRequest.range = range;
    const values = column.reduce((prev, current) => {
        prev.push(arbData[current].targetCryptoJPY);
        prev.push(arbData[current].targetCryptoUSD);
        prev.push(arbData[current].diffPercent());
        return prev;
    }, []);
    appendRequest.resource.values = [(new Date()).toISOString()];
    appendRequest.resource.values = values;
    await sheetAPI(append, appendRequest);
}