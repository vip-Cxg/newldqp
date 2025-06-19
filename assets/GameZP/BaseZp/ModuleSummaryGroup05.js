let STR_TYPE = ['对', '胡', '坎', '跑', '碰', '顺', '提', '偎', '吃'];
cc.Class({
    extends: cc.Component,

    properties: {
        lblType: cc.Label,
        group: cc.Node,
        lblHuxi: cc.Label,
        light: cc.Node
    },

    // use this for initialization
    onLoad: function () {
    },

    init(data, self, hu) {
        this.group = this.group.getComponent('BaseGroupZP');

        cc.log(hu);
        if (hu)
            this.light.active = true;
        this.lblHuxi.string = data.xi;
        let typeIdx = -1;
        switch (data.type) {
            case 'dui':
                typeIdx = 0;
                break;
            case 'hu':
                typeIdx = 1;
                break;
            case 'kan':
                typeIdx = 2;
                if (self == true)
                    data.card = data.cards[0];
                break;
            case 'pao':
                typeIdx = 3;
                if (self == true)
                    data.card = data.cards[0];
                break;
            case 'peng':
                typeIdx = 4;
                if (self == true)
                    data.card = data.cards[0];
                break;
            case 'shun':
                typeIdx = 5;
                break;
            case 'ti':
                typeIdx = 6;
                if (self == true)
                    data.card = data.cards[0];
                break;
            case 'wei':
                typeIdx = 7;
                if (self == true)
                    data.card = data.cards[0];
                break;
            case 'chi':
                typeIdx = 8;
                break;
            case 'bi':
                typeIdx = 8;
                break;
        }
        if (typeIdx != -1) {
            console.log("结算item----", STR_TYPE[typeIdx]);
            this.lblType.string = STR_TYPE[typeIdx];

        }
        this.group.init(data, { bg: false, click: false }, true);
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
