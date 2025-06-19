import { Dict } from "./Dict";
import { EventCall } from "./EventCall";
import { EventDatas } from "./EventDatas";

export class EventManager {
    static _instance = null;
    static getInstance() {
        if (!this._instance)
            this._instance = new EventManager();
        return this._instance;
    }
    constructor() {
        this._callbackMaps = new Dict();
        this._sendBuffer = [];
    }
    addEventListener(type, callback, thisObj, priority = 0, once = false) {
        if (callback && thisObj) {
            let data = new EventCall(callback, thisObj);
            data.type = type;
            data.index = priority;
            data.once = once;
            let callbacks = this._callbackMaps.get(type);
            if (callbacks) {
                let hasSame = false;
                for (let i = callbacks.length - 1; i >= 0; i--) {
                    let theCB = callbacks[i];
                    if (theCB.thisObj === thisObj && theCB.callback === callback) {
                        theCB.once = once;
                        theCB.index = priority;
                        hasSame = true;
                        break;
                    }
                }
                if (!hasSame) {
                    callbacks.push(data);
                    callbacks.sort(this.sortPriority);
                }
            } else {
                this._callbackMaps.add(type, [data]);

            }
        }
    }
    sortPriority(a, b) {
        return b.index - a.index;
    }
    hasEventListener(type, callback = null, thisObj = null) {
        let callbacks = this._callbackMaps.get(type);
        if (callbacks) {
            if (callback && thisObj) {
                for (let i = 0, iLen = callbacks.length; i < iLen; i++) {
                    let data = callbacks[i];
                    if (data.callback === callback && data.thisObj === thisObj) {
                        return true;
                    }
                }
            }
            else {
                return true;
            }
        }
        return false;
    }
    removeEventListener(type, callback, thisObj) {
        let callbacks = this._callbackMaps.get(type);
        if (callbacks) {
            for (let i = 0, iLen = callbacks.length; i < iLen; i++) {
                let data = callbacks[i];
                if (data.callback === callback && data.thisObj === thisObj) {
                    callbacks.splice(i, 1);
                    iLen--;
                    i--;
                }
            }
        }
    }
    dispatchEvent(event) {

        event.target = this;
        this._sendBuffer.push(event);
        while (this._sendBuffer.length > 0) {
            event = this._sendBuffer.shift();
            let dataList = this._callbackMaps.get(event.type);
            if (dataList) {
                let copyList = dataList.concat();
                for (let i = 0, iLen = copyList.length; i < iLen; i++) {
                    let data = copyList[i];
                    if (dataList.indexOf(data) == -1)
                        continue;
                    data.callback.call(data.thisObj, event);
                    if (data.once)
                        this.removeEventListener(event.type, data.callback, data.thisObj);
                    if (event.isStopedPropagation) {
                        break;
                    }
                }
            } else {
                console.log("事件ID:" + event.type + "无监听回调");
            }
        }
    }
    dispatchEventWith(eventName, data = null) {
        let eventData = new EventDatas(eventName, data);
        this.dispatchEvent(eventData);
    }
    destroy() {
        this._callbackMaps = new Dict();
        this._sendBuffer = [];
    }
}


