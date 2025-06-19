import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
import { App } from "../hall/data/App";
const { ccclass, property } = cc._decorator
@ccclass
export default class ProxyCreateSellPage extends cc.Component {



    @property(cc.Prefab)
    codePre = null;
    @property(cc.Node)
    btnConfirm = null;
    @property(cc.Node)
    btnCancel = null;


    @property(cc.Slider)
    amountSlider = null;

    @property(cc.ProgressBar)
    amountProgress = null;

    @property(cc.Sprite)
    amountFrozen = null;

    @property(cc.Node)
    handNode = null;
    @property(cc.Node)
    lastAmount = null;
    @property(cc.Label)
    lblAmount = null;
    @property(cc.Label)
    lblMax = null;
    @property(cc.Label)
    lblMin = null;
    @property(cc.Label)
    lblRemain = null;
    @property(cc.Label)
    lblFrozen = null;

    amount = 0;
    marketData = null;
    maxAmount = 0;


    // use this for initialization
    onLoad() {
        this.amountSlider.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onMoveEnd, this);
        this.amountSlider.node.on(cc.Node.EventType.TOUCH_END, this.onMoveEnd, this);
        this.handNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onMoveEnd, this);
        this.handNode.on(cc.Node.EventType.TOUCH_END, this.onMoveEnd, this);
        this.refreshUI();
    }

    refreshUI() {
        Connector.request(GameConfig.ServerEventName.POTCInfo, {}, (data) => {
            if (data.market) {
                if (data.market.status == 'frozen')
                    Cache.showTipsMsg('该店铺已封禁,解封时间为' + new Date(parseInt(data.marketRight)).format('yyyy-MM-dd hh:mm:ss'));
                this.marketData = data.market;
                this.maxAmount = Math.min(1000000, Math.floor((this.marketData.frozen + GameConfig.ProxyData.wallet + this.marketData.remain) / 100000) * 100000);
                this.lblMax.string = GameUtils.formatGold(this.maxAmount) + "元";
                this.lblMin.string = GameUtils.formatGold(0) + "元";
                this.lblAmount.string = "当前售卖的金额: " + GameUtils.formatGold(this.marketData.frozen + this.marketData.remain) + "元";

                this.amount = this.marketData.frozen + this.marketData.remain
                this.lblFrozen.string = "冻结的金额：" + GameUtils.formatGold(this.marketData.frozen) + "元";
                this.lblRemain.string = "剩余可售金额：" + GameUtils.formatGold(this.maxAmount - this.marketData.frozen - this.marketData.remain) + "元";

                this.amountFrozen.fillRange = this.marketData.frozen / this.maxAmount;
                this.amountSlider.progress = (this.marketData.frozen + this.marketData.remain) / this.maxAmount;
                this.amountProgress.progress = (this.marketData.frozen + this.marketData.remain) / this.maxAmount;
                if (this.marketData.remain != 0 || this.marketData.frozen != 0) {
                    this.lastAmount.active = true;
                    this.lastAmount.position = cc.v2(-this.amountSlider.node.width / 2 + this.amountSlider.node.width * this.amountProgress.progress, 0)
                } else {
                    this.lastAmount.active = false;
                }
            }
        }, true, (err) => {
            Cache.showTipsMsg(err.message || '网络连接失败,请稍后再试')
        })
    }




    confirm() {
        Cache.playSfx();
        let storageKey = "sellFastTips"
        let msg = "需要在对方付款后" + Math.floor(GameConfig.GameInfo.otcConfig.FAST_SELL_CONFIRM_TIMEOUT / 1000 / 60) + "分钟内放行"; //this.tradeType == "slow" ? "普通寄卖需要在对方付款后" + Math.floor(GameConfig.GameInfo.otcConfig.SLOW_SELL_CONFIRM_TIMEOUT / 1000 / 60 / 60) + "小时内放行" : "快速寄卖需要在对方付款后" + Math.floor(GameConfig.GameInfo.otcConfig.FAST_SELL_CONFIRM_TIMEOUT / 1000 / 60) + "分钟内放行";

        let isShow = GameUtils.getValue(storageKey, false);
        if (isShow) {
            if (this.callback1 != null && this.marketData != null)
                this.callback1(this.amount);
            if (this.node)
                this.node.destroy();
            return;
        }
        Cache.showConfirm(msg, () => {
            if (this.callback1 != null && this.marketData != null)
                this.callback1(this.amount);
            if (this.node)
                this.node.destroy();
        }, () => {
        }, storageKey);



    }
    selectAmount(e) {
        this.amountProgress.progress = e.progress;
        let amount = e.progress * this.maxAmount;
        amount = Math.ceil((amount) / 100000) * 100000;
        this.amount = amount / 100;
        this.lblAmount.string = "当前售卖的金额: " + GameUtils.formatGold(amount) + "元";
        this.lblRemain.string = "剩余可售金额：" + GameUtils.formatGold(this.maxAmount - amount) + "元";
    }

    onMoveEnd() {
        if (this.amountSlider.progress < this.amountFrozen.fillRange)
            this.amountSlider.progress = this.amountFrozen.fillRange;
        let amount = this.amountSlider.progress * this.maxAmount;
        amount = Math.ceil((amount) / 100000) * 100000;
        this.amount = amount / 100;
        this.lblAmount.string = "当前售卖的金额: " + GameUtils.formatGold(amount) + "元";
        this.lblRemain.string = "剩余可售金额：" + GameUtils.formatGold(this.maxAmount - amount) + "元";
        this.amountProgress.progress = this.amountSlider.progress;
    }



    /**上架金币 */
    onClickEnsure() {
        Cache.playSfx();
        var self = this;
        // let codePre = cc.instantiate(this.codePre);
        // codePre.getComponent("MarketAccountCode").initData("请输入验证码,确保为本人操作", (codeStr) => {
        Connector.request(GameConfig.ServerEventName.POTCMarket, { total: self.amount * 100, tradeType: "fast" }, (data) => {
            Cache.alertTip("寄售成功")
            self.refreshUI();
            //TODO
            GameConfig.ProxyData.wallet = data.wallet;
            // App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_WALLET)
        }, true, (err) => {
            Cache.alertTip(err.message || "寄售失败");
        });
        // }, null, 'proxyMarket');

        // GameUtils.pop(GameConfig.pop.CheckTradePwd, (node) => {
        //     node.getComponent("CheckTradePwd").show("showConfirm", "请输入交易密码,确保为本人操作", (tradePwd) => {
        //         let encryptPwd = GameUtils.encryptToken(tradePwd);
        //         Connector.request(GameConfig.ServerEventName.POTCMarket, { total: self.amount * 100, tradeType: "fast", password: encryptPwd }, (data) => {
        //             Cache.alertTip("寄售成功")
        //             self.refreshUI();
        //             DataBase.player.wallet = data.wallet;
        //             App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_WALLET)
        //         });
        //     })
        // })
    }
    /**下架金币 */
    onClickCancel() {
        Cache.playSfx();
        var self = this;
        let codePre = cc.instantiate(this.codePre);
        codePre.getComponent("MarketAccountCode").initData("请输入验证码,确保为本人操作", (codeStr) => {
            Connector.request(GameConfig.ServerEventName.POTCMarket, { total: 0 + (this.marketData.frozen || 0), tradeType: "fast", code: codeStr }, (data) => {
                Cache.alertTip("下架成功")
                self.refreshUI();
                //TODO
                GameConfig.ProxyData.wallet = data.wallet;
                // App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_WALLET)
            }, true, (err) => {
                Cache.alertTip(err.message || "下架失败");
            });
        }, null, 'proxyMarket');
        // GameUtils.pop(GameConfig.pop.CheckTradePwd, (node) => {
        //     node.getComponent("CheckTradePwd").show("showConfirm", "请输入交易密码,确保为本人操作", (tradePwd) => {
        //         let encryptPwd = GameUtils.encryptToken(tradePwd);
        //         Connector.request(GameConfig.ServerEventName.OTCMarket, { total: 0 + (this.marketData.frozen || 0), tradeType: "fast", password: encryptPwd }, (data) => {
        //             Cache.alertTip("下架成功")
        //             this.refreshUI();
        //             DataBase.player.wallet = data.wallet;
        //             App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_WALLET)
        //         });
        //     })
        // })


    }

}


