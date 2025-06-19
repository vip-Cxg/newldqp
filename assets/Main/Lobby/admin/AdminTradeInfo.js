// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { GameConfig } = require("../../../GameBase/GameConfig");
const Connector = require("../../NetWork/Connector");
const Cache = require("../../Script/Cache");
const utils = require('../../Script/utils');
const TRADE_STATUS = {
    wait: { desc: '等待付款', color: "#43AFFF" },
    process: { desc: '等待放行', color: "#43AFFF" },
    trans: { desc: '到账中', color: "#43AFFF" },
    done: { desc: '已完成', color: "#00d900" },//绿
    judge: { desc: '申诉', color: "#ff2d2d" },
    cancel: { desc: '取消', color: "#a6afb2" },
    release: { desc: '协议取消', color: "#ff2d2d" },
    confirm: { desc: '协议放行', color: "#ff2d2d" },//红
    service: { desc: '客服介入', color: "#ff2d2d" },//红
}
cc.Class({
    extends: require('../../Script/PopBase'),

    properties: {
        lblSellerID: cc.Label,
        lblSellerDone: cc.Label,
        lblSellerService: cc.Label,
        lblSellerSin: cc.Label,
        lblSellerPhone: cc.Label,
        lblSellerName: cc.Label,

        lblBuyerID: cc.Label,
        lblBuyerCancel: cc.Label,
        lblBuyerDone: cc.Label,
        lblBuyerGoing: cc.Label,
        lblBuyerService: cc.Label,
        lblBuyerSin: cc.Label,
        lblBuyerPhone: cc.Label,
        lblBuyerName: cc.Label,

        lblTradeID: cc.Label,
        lblAccount: cc.Label,
        lblAmount: cc.Label,
        lblCreatedAt: cc.Label,
        lblUpdateAt: cc.Label,
        lblHistory: cc.Label,
        lblSuperSeller: cc.Label,
        lblPayType: cc.Label,
        receiptSpr: cc.Sprite,
        bgSpr: cc.Node,

        remarks: cc.EditBox,
        tradeID: null,
        sellerId: null,
        buyerId: null,
        receiptUrl: null
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    downloadTrades(tradeID) {
        this.lblTradeID.string = tradeID
        this.tradeID = tradeID;

        Connector.request(GameConfig.ServerEventName.OTCAdminTradeDetail, { tradeID }, (data) => {
            if (!utils.isNullOrEmpty(data.sellerInfo)) {
                this.sellerId = data.sellerInfo.user.id;
                this.lblSellerID.string = "" + data.sellerInfo.user.id;
                this.lblSellerName.string = "" + data.sellerInfo.user.name;
                this.lblSellerPhone.string = "" + data.sellerInfo.user.phone;
                this.lblSellerDone.string = "" + data.sellerInfo.doneCount;
                this.lblSellerService.string = "" + data.sellerInfo.serviceCount;
                this.lblSellerSin.string = "" + data.sellerInfo.sinCount;
            }
            if (!utils.isNullOrEmpty(data.buyerInfo)) {
                this.buyerId = data.buyerInfo.user.id;
                this.lblBuyerID.string = "" + data.buyerInfo.user.id;
                this.lblBuyerName.string = "" + data.buyerInfo.user.name;
                this.lblBuyerPhone.string = "" + data.buyerInfo.user.phone;
                this.lblBuyerDone.string = "" + data.buyerInfo.doneCount;
                this.lblBuyerService.string = "" + data.buyerInfo.serviceCount;
                this.lblBuyerSin.string = "" + data.buyerInfo.sinCount;
                this.lblBuyerCancel.string = "" + data.buyerInfo.cancelCount;
                this.lblBuyerGoing.string = "" + data.buyerInfo.goingCount;
            }
            if (!utils.isNullOrEmpty(data.trade)) {

                this.lblAmount.string = '' + (data.trade.amount / 100) + '元';
                this.lblCreatedAt.string = '' + new Date(data.trade.createdAt).format('yyyy-MM-dd hh:mm:ss');
                this.lblUpdateAt.string = '' + new Date(data.trade.updatedAt).format('yyyy-MM-dd hh:mm:ss')
                let historyStr = '';
                data.trade.history.forEach(element => {
                    historyStr = historyStr + TRADE_STATUS[element].desc + '=>';
                });
                this.lblHistory.string = historyStr
                this.lblSuperSeller.string = data.trade.isSuperSeller ? '是' : '不是';
                this.lblPayType.string = '' + data.trade.payType;
                this.receiptUrl = data.trade.receipt
                if (!utils.isNullOrEmpty(data.trade.receipt)) {
                    utils.setHead(this.receiptSpr, GameConfig.GameInfo.resourceURL + data.trade.receipt)

                    if (this.receiptSpr.node.height > 545) {
                        let w = 545 * this.receiptSpr.node.width / this.receiptSpr.node.height;
                        let h = 545;
                        this.receiptSpr.node.width = w;
                        this.receiptSpr.node.height = h
                    }

                }
            }
        });

    },

    onJudgeTrade(e, v) {
        if (utils.isNullOrEmpty(this.remarks.string)) {
            Cache.alertTip('请输入判决理由')
            return;
        }
        let req = {
            tradeID: this.tradeID,
            sinnerID: v == 'cancel' ? this.buyerId : this.sellerId,
            remarks: this.remarks.string,
            decide: v
        };

        Connector.request(GameConfig.ServerEventName.OTCAdminTradeJudge, req, (res) => {
            Cache.alertTip(v == 'cancel' ? '取消成功' : '放行成功');
        })
    },
    hideSpr() {
        this.bgSpr.active = false;
    },
    showSpr() {
        if (utils.isNullOrEmpty(this.receiptUrl)) {
            Cache.alertTip('买家未上传付款凭证');
            return;
        }
        this.bgSpr.active = true;
    }
    // update (dt) {},
});
