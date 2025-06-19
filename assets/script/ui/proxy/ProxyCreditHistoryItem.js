import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../../script/common/GameUtils";
const { ccclass, property } = cc._decorator
@ccclass
export default class ProxyCreditHistoryItem extends cc.Component {



    @property(cc.EditBox)
    creditInput = null;

    @property(cc.Label)
    lblWallet = null;
    @property(cc.Label)
    lblCredit = null;
    @property(cc.Label)
    lblProxyID = null;


    @property(cc.Node)
    btnOperate = null;
    @property(cc.Node)
    btnConfirm = null;
    @property(cc.Node)
    warnNode = null;

    itemData = null;

    onLoad() {
    }

    renderUI(data) {
        this.itemData = data;

        this.btnOperate.active = true;
        this.btnConfirm.active = false;
        this.creditInput.node.active = false;

        this.lblCredit.string = '' + GameUtils.formatGold(data.credit);
        this.creditInput.string = '' + parseInt(data.credit / 100);// GameUtils.formatGold(data.credit);
        // console.log("--------", typeof (data.score))
        this.lblWallet.string = typeof (data.score) == 'number' ? '' + GameUtils.formatGold(data.score) : '' + data.score;
        this.lblProxyID.string = '' + data.id;
        if (data.warn)
            this.startWarnningAnim();
    }


    onClickOperate() {
        Cache.playSfx();
        this.btnOperate.active = false;
        this.btnConfirm.active = true;
        this.creditInput.node.active = true;

    }

    onClickConfirm() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.creditInput.string)) {
            Cache.alertTip("请输入额度")
            return;
        }

        let reg = /^[0-9]*[0-9]*$/;
        if (!reg.test(this.creditInput.string)) {
            Cache.alertTip("请输入整数金额")
            return;
        }
        let credit = parseInt(this.creditInput.string);


        Connector.request(GameConfig.ServerEventName.ProxyCreditUpdate, { credit: credit * 100, id: this.itemData.id }, () => {
            this.itemData.credit = credit * 100;
            Cache.alertTip("提交成功");
            this.renderUI(this.itemData);

        }, true, (err) => {

            Cache.alertTip(err.message || "提交失败");
        })
    }

    startWarnningAnim() {
        this.warnNode.stopAllActions();
        this.warnNode.active = true;
        let ap = cc.scaleTo(0.5, 1.3);
        let bp = cc.callFunc(() => {

            this.warnNode.scale = 0.8;
            this.warnNode.opacity = 255;

        })
        let ep = cc.fadeOut(0.5);
        let fp = cc.spawn(ap, ep)
        let cp = cc.sequence(fp,cc.delayTime(0.5), bp);
        let dp = cc.repeatForever(cp);
        this.warnNode.runAction(dp)
    }
}


