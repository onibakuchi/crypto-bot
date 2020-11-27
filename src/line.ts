import { AxiosStatic } from 'axios';
import CONFIG from './config';

export interface Message {
    type: 'text';
    text: string;
}

export const pushMessage = async (axiosBase: AxiosStatic, message: Message[], to = undefined) => {
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
                messages: message
            }
        })
    } catch (e) {
        console.log('[ERROR]:LINE_PUSH_MESSAGE_FAILED');
        console.log('e :>> ', e);
    }
}
