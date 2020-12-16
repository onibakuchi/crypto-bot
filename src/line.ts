import axiosBase from 'axios';
import CONFIG from './config';

export const pushMessage = async (message: string, to = undefined) => {
    try {
        console.log('[Info]:Fired Line Notification');
        await axiosBase({
            method: 'POST',
            url: 'https://api.line.me/v2/bot/message/push',
            headers: {
                Authorization: `Bearer ${CONFIG.LINE.BEARER_ACCESS_TOKEN}`
            },
            data: {
                to: to || CONFIG.LINE.USER_ID,
                messages: {
                    type: 'text',
                    text: message,
                }
            }
        })
    } catch (e) {
        console.log('[ERROR]:LINE_PUSH_MESSAGE_FAILED');
        console.log('[ERROR]:ERROR_LINE_PUSH_MESSAGE :>> ', e);
    }
}
