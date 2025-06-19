import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";

const PAY_DESC = {
    alipay: '支付宝',
    wechat: '微信'
}

const { ccclass, property } = cc._decorator
@ccclass
export default class SelectTradeType extends cc.Component {

    @property(cc.Label)
    lblAmount = null;
    @property(cc.Prefab)
    tradeInfoPop = null;
    // amountInput: cc.EditBox,
    // amountLbl: cc.Label,
    // alipayBtn: cc.Toggle,
    // wechatBtn: cc.Toggle,
    // bankBtn: cc.Toggle,
    // tradeInfoPop: cc.Prefab,
    // payType: "",
    // tradeData: null,


    payType = null

    initData(data) {
        this.tradeData = data;
        this.lblAmount.string = "请选择支付方式";
    }
    selectPayType(e, v) {
        Cache.playSfx();
        this.payType = v;
    }

    // addAmount() {
    //     Cache.playSfx();
    //     let amount = parseInt(this.amountInput.string) || 0;

    //     amount += 100;

    //     if (amount > Math.min(this.tradeData.remain / 100,2000))
    //         amount = Math.min(this.tradeData.remain / 100,2000);
    //     this.amountInput.string = "" + amount;

    // }
    // reduceAmount() {
    //     Cache.playSfx();
    //     let amount = parseInt(this.amountInput.string) || 0;
    //     amount -= 100;
    //     if (amount <= 0)
    //         amount = 0;
    //     this.amountInput.string = "" + amount;
    // }

    onClickEnsure() {
        Cache.playSfx();
        // let amount = parseInt(this.amountInput.string) || 0;
        // if (amount <= 0 || amount > 2000) {
        //     Cache.alertTip("请输入订单范围内金额100~2000")
        //     return;
        // }

        if (GameUtils.isNullOrEmpty(this.payType)) {
            Cache.alertTip("请选择支付方式")
            return;
        }

        Connector.request(GameConfig.ServerEventName.POTCCreateTrade, { amount: this.tradeData.amount, payType: this.payType, tradeType: this.tradeData.tradeType }, (data) => {
            let isShow = GameUtils.getValue(GameConfig.StorageKey.CreateTrade, false)
            if (!isShow) {
                Cache.showTipsMsg("仔细核对对方收款账户信息,避免转错账户,（请保留付款凭证,作为申诉依据）", () => {
                    let tradeInfoPop = cc.instantiate(this.tradeInfoPop);
                    tradeInfoPop.getComponent("ProxyTradeInfoPage").initData(data.trade.id);
                    cc.find("Canvas").addChild(tradeInfoPop);
                    if (this.node) {
                        this.node.removeFromParent();
                        this.node.destroy();
                    }
                }, GameConfig.StorageKey.CreateTrade)
            } else {
                let tradeInfoPop = cc.instantiate(this.tradeInfoPop);
                tradeInfoPop.getComponent("ProxyTradeInfoPage").initData(data.trade.id);
                cc.find("Canvas").addChild(tradeInfoPop);
                if (this.node) {
                    this.node.removeFromParent();
                    this.node.destroy();
                }
            }


        }, true, (err) => {
            Cache.showTipsMsg(err.message || "购买失败", () => {
                if (this.node) {
                    this.node.removeFromParent();
                    this.node.destroy();
                }
            })
        })
    }



    onClickClose() {
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
}


