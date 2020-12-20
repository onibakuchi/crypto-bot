import axios from 'axios';
import CONFIG from './config/config';

export const pushMessage = async (message: string, to = undefined) => {
    try {
        console.log('[Info]:Fired Line Notification');
        console.log('CONFIG:>> ', CONFIG.LINE.BEARER_ACCESS_TOKEN == 'Wd4/8lD/8XrDgccsKljyaJt7s4hXwrEQbGmsYNIzlv3Lr9E/ABKlu4jDLJ202wgyvLnqxmTkf2x2zbgCYFEaZQxztzxpkHCqHArn8U4XyhvsCuVTmy1Lnd1nBU699kwqQpzh0xULu9nWUChLzjHk4wdB04t89/1O/w1cDnyilFU=');
        await axios({
            method: 'POST',
            url: 'https://api.line.me/v2/bot/message/push',
            headers: {
                Authorization: `Bearer ${CONFIG.LINE.BEARER_ACCESS_TOKEN}`
            },
            data: {
                to: to || process.env.USER_ID,
                messages: [{
                    type: 'text',
                    text: message,
                }]
            }
        })
    } catch (e) {
        console.log('[ERROR]:LINE_PUSH_MESSAGE_FAILED', e);
    }
}
