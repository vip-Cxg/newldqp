
const { GameConfig } = require("../../GameBase/GameConfig");
const Cache = require("../Script/Cache");
const utils = require("../Script/utils");

cc.Class({
    extends: cc.Component,

    properties: {
        lblName: cc.Label,
        lblTotal: cc.Label,
        lblProfit: cc.Label,
        newProfit: cc.EditBox,
        itemData: null
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(data,self=false) {
        this.itemData = data;
        this.lblName.string = "" + data.room.name;
        this.lblTotal.string = "" +utils.formatGold(data.price, 2) ;
        if(self){
            this.lblProfit.string = "" + utils.formatGold(data.profit, 2);
            this.newProfit.node.active=false;
            return;
        }

        if (utils.isNullOrEmpty(data.parentProfit)) {
            this.lblProfit.string = "" + utils.formatGold(data.profit, 2);
            this.newProfit.string = utils.isNullOrEmpty(data.childProfit) ? "0" : "" + utils.formatGold(data.childProfit, 2);
        } else {
            this.lblProfit.string = "" + utils.formatGold(data.parentProfit, 2);
            this.newProfit.string = "" + utils.formatGold(data.profit, 2);
        }

    },

    editedProfit(e) {
        let reg = /^[0-9]+.?[0-9]*$/;
        if (!reg.test(e.string)) {
            Cache.alertTip("请输入数字");
            return;
        }
        this.itemData.changed=true;

        if (utils.isNullOrEmpty(this.itemData.parentProfit)) {
            this.itemData.childProfit = parseInt(parseFloat(e.string) * 100)
        } else {
            this.itemData.profit = parseInt(parseFloat(e.string) * 100)

        }
        utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.PROXY_CHANGE_PROFIT, this.itemData)
    },


    // update (dt) {},
});
