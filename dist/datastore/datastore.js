"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDatastore = void 0;
const line_1 = require("../notif/line");
class BaseDatastore {
    constructor() {
        this.db = null;
        this.contractedOrders = new Map();
        this.preparedOrders = new Map();
        this.activeOrders = new Map();
        this.position = {
            symbol: '',
            side: '',
            amount: 0,
            amountUSD: 0,
            avgOpenPrice: null,
            breakEvenPrice: null,
        };
    }
    calcPosition() {
        console.log('[Info]: Updating position....');
        const orders = this.contractedOrders.values();
        for (const order of orders) {
            if (this.position.symbol != order.symbol)
                continue;
            const prevAmount = this.position.amount;
            this.position.amount += (order.side == this.position.side) ? order.amount : -order.amount;
            this.position.avgOpenPrice = (this.position.avgOpenPrice * prevAmount + order.price * order.amount) / this.position.amount;
            this.position.amountUSD = this.position.amount * this.position.avgOpenPrice;
        }
        console.log('[Info]: Position...\n', this.position);
        // this.contractedOrders.clear();
        console.log('[Info]: Done updating position....');
    }
    getActiveOrders() { return this.activeOrders; }
    getContractedOrders() { return this.contractedOrders; }
    getExpiredOrders() {
        const expiredOrders = [];
        for (const value of this.activeOrders.values()) {
            console.log(` ${value}`);
            if (value['expiration'] <= Date.now()) {
                expiredOrders.push(value);
            }
        }
        console.log('[Info]: Expired orders :>>', expiredOrders);
        return expiredOrders;
    }
    getOHCV() { return this.ohlcv; }
    getPosition() { return this.position; }
    getPreparedOrders() { return this.preparedOrders; }
    setOHLCV(ohlcv) {
        this.ohlcv = ohlcv;
    }
    setPosition(position) {
        console.log('[Info]: Updating position....');
        this.position = position;
        console.log('[Info]: Position...\n', this.position);
        console.log('[Info]: Done updating position....');
    }
    setPreparedOrders(orders) {
        for (const order of orders) {
            if (order) {
                const key = order['orderName'];
                if (this.activeOrders.has(key)) {
                    console.log(`[Info]:skipped... Order<${key}> is already open...`);
                    continue;
                }
                this.preparedOrders.set(key, order);
            }
            else {
                console.log('[ERROR]: Incompatible to Order Interface\n <Order> :>>', order);
            }
        }
    }
    async pushMessage(message) {
        await line_1.pushMessage(message);
    }
    updateOrderStatus() {
        console.log('[Info]:Calling function updateOrderStatus...');
        const iterator = this.activeOrders.entries();
        for (const [key, order] of iterator) {
            if (order['status'] == 'open') {
                console.log('[Info]: Open Order<Order>', order);
            }
            if (order['status'] == 'closed') {
                this.activeOrders.delete(key);
                this.contractedOrders.set(key, order);
                console.log('[Info]: Contracted Order<Order>', order);
            }
            if (order['status'] == 'canceled') {
                this.activeOrders.delete(key);
                console.log('[Info]: Canceled Order<Order>', order);
            }
            if (order['status'] == 'pending') {
                console.log('[Info]: Pending Order<Order>', order);
            }
        }
        // this.calcPosition();
    }
    updatePreparedOrders() {
        const orders = this.preparedOrders.values();
        for (const order of orders) {
            const key = order['orderName'];
            if (order.status == 'open') {
                this.activeOrders.set(key, order);
                this.preparedOrders.delete(key);
            }
            if (order.status == 'closed') {
                this.contractedOrders.set(key, order);
                this.activeOrders.delete(key);
                this.preparedOrders.delete(key);
            }
            if (order.status == 'canceled') {
                this.activeOrders.delete(key);
                this.preparedOrders.delete(key);
            }
        }
    }
}
exports.BaseDatastore = BaseDatastore;
