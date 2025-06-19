
export class EventCall {
    constructor(callback, thisObj) {
        this.callback = callback;
        this.thisObj = thisObj;
        this.once = false;
    }
    clone() {
        let data = new EventCall(this.callback, this.thisObj);
        data.index = this.index;
        data.type = this.type;
        return data;
    }
   
}


