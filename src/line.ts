import axios from 'axios';
import CONFIG from './config/config';

export const pushMessage = async (message: string, to = undefined) => {
    try {
        await axios({
            method: 'POST',
            url: 'https://api.line.me/v2/bot/message/push',
            headers: {
                Authorization: `Bearer ${CONFIG.LINE.BEARER_ACCESS_TOKEN}`
            },
            data: {
                to: to || process.env.USER_ID,
                messages: [{
                    'type': 'text',
                    'text': message || 'MESSAGE_IS_UNDEFINED',
                }]
            }
        })
    } catch (e) {
        console.log('[ERROR]:LINE_PUSH_MESSAGE_FAILED', e);
    }
}
