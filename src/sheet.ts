import { google } from 'googleapis';
import CONFIG from './config';

// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request#updatecellsrequest
// https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
// https://qiita.com/vicugna-pacos/items/f7bb0d97bbaa1371edc8

async function sheetAPI(callback, data) {
    try {
        const { client_id, client_secret, redirect_uris } = CONFIG.CREDENTIALS.installed;
        if (client_id == undefined || client_id == undefined) Error('[ERROR]: CANNOT_FIND_CREDENTIALS')
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(CONFIG.TOKEN);
        return await callback(oAuth2Client, data);
    } catch (err) {
        console.log('CAN NOT FIND TOKEN');
        console.log('err :>> ', err);
    }
}
/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1vKsP0f2DpDcbJaKnBGTILVsDoELN6P84Zj786LWqgbM/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 * @param {string[]} values  The data to be written. Each item in the inner array corresponds with one cell.
 */
async function append(auth, request) {
    const sheets = google.sheets({ version: 'v4', auth });
    try {
        const response = (await sheets.spreadsheets.values.append(request)).data;
        console.log(JSON.stringify(response, null, 2));
    } catch (err) {
        console.error(err);
    }
}

async function get(auth, request) {
    const sheets = google.sheets({ version: 'v4', auth });
    try {
        return (await sheets.spreadsheets.values.get(request)).data;
    } catch (err) {
        console.error(err);
    }
}

async function batchUpdate(auth, request) {
    const sheets = google.sheets({ version: 'v4', auth });
    try {
        const response = (await sheets.spreadsheets.values.batchUpdate(request)).data;
        console.log(JSON.stringify(response, null, 2));
    } catch (err) {
        console.error(err);
    }
}
export ={ sheetAPI, append, batchUpdate, get }


