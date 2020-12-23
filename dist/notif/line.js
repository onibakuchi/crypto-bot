"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config/config"));
const pushMessage = async (message, to = undefined) => {
    try {
        await axios_1.default({
            method: 'POST',
            url: 'https://api.line.me/v2/bot/message/push',
            headers: {
                Authorization: `Bearer ${config_1.default.LINE.BEARER_ACCESS_TOKEN}`
            },
            data: {
                to: to || process.env.USER_ID,
                messages: [{
                        'type': 'text',
                        'text': message || 'MESSAGE_IS_UNDEFINED',
                    }]
            }
        });
    }
    catch (e) {
        console.log('[ERROR]:LINE_PUSH_MESSAGE_FAILED', e);
    }
};
exports.pushMessage = pushMessage;
