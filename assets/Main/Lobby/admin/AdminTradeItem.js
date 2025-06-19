// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const Cache = require("../../Script/Cache");
const utils = require("../../Script/utils");
const tradeStatus = {
    wait: { desc: '待付款', color: "#43AFFF" },
    process: { desc: '待放行', color: "#43AFFF" },
    trans: { desc: '到账中', color: "#43AFFF" },
    done: { desc: '已完成', color: "#00d900" },//绿
    judge: { desc: '申诉中', color: "#ff2d2d" },
    cancel: { desc: '已取消', color: "#a6afb2" },
    release: { desc: '协议取消', color: "#ff2d2d" },
    confirm: { desc: '协议放行', color: "#ff2d2d" },//红
    service: { desc: '客服介入', color: "#ff2d2d" },//红
}
cc.Class({
    extends: cc.Component,

    properties: {
        createTime: cc.Label,
        amount: cc.Label,
        statusLbl: cc.Label,
        lblSellerID: cc.Label,
        lblBuyerID: cc.Label,
        cancelBtn: cc.Node,

        payTypeContainer: cc.Node,

        tradeDetail: cc.Prefab,
        //    bankIcon:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    initData(data) {

        this.lblSellerID.string='卖家ID:'+data.sellerID;
        this.lblBuyerID.string='买家ID:'+data.buyerID;

        this.payTypeContainer.getChildByName("" + data.payType).active = true;
        this.statusLbl.node.color = new cc.color(tradeStatus[data.status].color);
        this.statusLbl.string = tradeStatus[data.status].desc;
        this.amount.string = "当前交易金额: " + data.amount / 100;
        this.createTime.string = "交易时间: " + utils.timestampToTime(new Date(data.createdAt).getTime());

        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            Cache.playSfx();
            let tradeDetail = cc.instantiate(this.tradeDetail);
            tradeDetail.getComponent("AdminTradeInfo").downloadTrades(data.id);
            cc.find("Canvas").addChild(tradeDetail);

        }, this)

    },

    // update (dt) {},
});
