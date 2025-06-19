import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import GameUtils from "../../../script/common/GameUtils";
const { ccclass, property } = cc._decorator
@ccclass
export default class ProxyCreditHistoryItem extends cc.Component {



    @property(cc.Node)
    warnNode = null;
    @property(cc.Node)
    historyContent = null;
    @property(cc.Prefab)
    historyItem = null;

    @property(cc.Label)
    lblUserWallet = null;
    @property(cc.Label)
    lblProxyWallet = null;
    @property(cc.Label)
    lblCredit = null;

    onLoad() {
        this.downloadData();
    }

    downloadData() {


        // let renderData = {
        //     list: [
        //         { proxyID: 1003, wallet: 46000000, credit: 45000000 },
        //         { proxyID: 1004, wallet: 46000000, credit: 45000000 },
        //         { proxyID: 1005, wallet: 8000000, credit: 0 }
        //     ],
        //     proxyData: {
        //         userWallet: 0,
        //         credit: 90000000,
        //         proxyWallet: 100000000
        //     }
        // }
        // this.renderUI(renderData)
        Connector.request(GameConfig.ServerEventName.ProxyCredit, {}, (data) => {
            this.renderUI(data)

        })

    }

    renderUI(data) {
        if (!GameUtils.isNullOrEmpty(data.summary)) {
            this.lblCredit.string = GameUtils.formatGold(data.summary.score) + '/' + GameUtils.formatGold(GameConfig.ProxyData.credit);
            this.lblProxyWallet.string = '' + GameUtils.formatGold(data.summary.subScore);
            this.lblUserWallet.string = '' + GameUtils.formatGold(data.summary.userScore);
        }

        this.historyContent.removeAllChildren();
        if (!GameUtils.isNullOrEmpty(data.proxies)) {
            data.proxies.forEach(element => {
                let item = cc.instantiate(this.historyItem);
                item.getComponent('ProxyCreditHistoryItem').renderUI(element);
                this.historyContent.addChild(item);
            });
        }
        if (data.warn)
            this.startWarnningAnim()
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


