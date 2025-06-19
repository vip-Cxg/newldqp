
export class EventDatas {
    constructor(type, data) {
        this._isStopedPropagation = false;
        this.type = type;
        this.data = data;
    }
    get isStopedPropagation() {
        return this._isStopedPropagation;
    }
    stopPropagation() {
        this._isStopedPropagation = true;
    }
   
}


