"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseStrategy = exports.BaseComponent = void 0;
const line_1 = require("./notif/line");
class BaseComponent {
    constructor(mediator = null) {
        this.mediator = mediator;
    }
    setMediator(mediator) {
        this.mediator = mediator;
    }
    async pushMessage(message) {
        await line_1.pushMessage(message);
    }
}
exports.BaseComponent = BaseComponent;
class BaseStrategy extends BaseComponent {
}
exports.BaseStrategy = BaseStrategy;
