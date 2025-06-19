const CARD_POS = [
    33,0,1,2,3,4,5,6,7,8,
    0,9,10,11,12,13,14,15,16,17,
    0,18,19,20,21,22,23,24,25,26];

let calc = cc.Class({

    name: 'calc',

    properties: {
        //_instance: null
    },

    statics: {
        _instance: null,

        getInstance() {
            //cc.log('getInstance calc');
            if (!this._instance) {
                this._instance = new calc();
                this._instance.huLib = require('api');
                this._instance.huLib.Init();
            }
            // ;
            return this._instance;
        }
    },

    checkHu (hands) {
        calc._instance = this;
        let cards = [0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0];
        hands.forEach(c=>cards[CARD_POS[c]]++);
        return this.huLib.getInfo(cards);
    }
});

module.exports = calc;