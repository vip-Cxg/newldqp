import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";

const PAY_DESC={
    alipay:'支付宝',
    wechat:'微信'
}

const { ccclass, property } = cc._decorator
@ccclass
export default class RewardTradeItem extends cc.Component {
    @property(cc.Label)
    lblDesc = null;
    @property(cc.Label)
    lblAmount = null;
    @property(cc.Node)
    alipayIcon = null;
    @property(cc.Node)
    wechatIcon = null;
    @property(cc.Node)
    bankIcon = null;
    @property(cc.Node)
    animNode = null;
    @property(cc.Prefab)
    tradeInfoPop = null;
    // @property(cc.EditBox)
    // boxCode = null;



    initData(data) {
        this.startAnim();
        this.lblDesc.string = (data.reward / 100) + '元';
        this.lblAmount.string = (data.amount / 100) + '元';
        this[data.paytype + 'Icon'].active = true;
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            let str='交易金额: '+(data.amount / 100) + '元\n\n   付款方式: '+PAY_DESC[data.paytype];
            Cache.showConfirm(str, () => {
                Connector.request(GameConfig.ServerEventName.OTCCreateTrade, { tradeType: data.tradeType, payType: data.paytype, amount: data.amount }, (res) => {
                    let isShow = GameUtils.getValue(GameConfig.StorageKey.CreateTrade, false)
                    if (!isShow) {
                        Cache.showTipsMsg("仔细核对对方收款账户信息,避免转错账户,（请保留付款凭证,作为申诉依据）", () => {
                            let tradeInfoPop = cc.instantiate(this.tradeInfoPop);
                            tradeInfoPop.getComponent("TradeInfoPage").downloadTrades(res.trade.id);
                            cc.find("Canvas").addChild(tradeInfoPop);
                        }, GameConfig.StorageKey.CreateTrade)
                    } else {
                        let tradeInfoPop = cc.instantiate(this.tradeInfoPop);
                        tradeInfoPop.getComponent("TradeInfoPage").downloadTrades(res.trade.id);
                        cc.find("Canvas").addChild(tradeInfoPop);
                       
                    }
                }, true, (err) => {
                    Cache.alertTip(err.message || "购买失败")
                })
            })
        }, this)
    }

    startAnim(){
        this.animNode.stopAllActions();
        let ap=cc.scaleTo(0.8,1.1);
        let bp =cc.scaleTo(0.8,1);
        let cp=cc.sequence(ap,bp);
        let dp =cc.repeatForever(cp);
        this.animNode.runAction(dp);
    }
    // let isShow = utils.getValue(GameConfig.StorageKey.CreateTrade, false)
    // if (!isShow) {
    //     Cache.showTipsMsg("仔细核对对方收款账户信息,避免转错账户,（请保留付款凭证,作为申诉依据）", () => {
    //         let tradeInfoPop = cc.instantiate(this.tradeInfoPop);
    //         tradeInfoPop.getComponent("TradeInfoPage").downloadTrades(data.trade.id);
    //         cc.find("Canvas").addChild(tradeInfoPop);
    //         if (this.node) {
    //             this.node.removeFromParent();
    //             this.node.destroy();
    //         }
    //     }, GameConfig.StorageKey.CreateTrade)
    // } else {
    //     let tradeInfoPop = cc.instantiate(this.tradeInfoPop);
    //     tradeInfoPop.getComponent("TradeInfoPage").downloadTrades(data.trade.id);
    //     cc.find("Canvas").addChild(tradeInfoPop);
    //     if (this.node) {
    //         this.node.removeFromParent();
    //         this.node.destroy();
    //     }
    // }

}


