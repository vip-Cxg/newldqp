import PopupBase from "../../base/pop/PopupBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";


const { ccclass, property } = cc._decorator
@ccclass
export default class ProxyTotal extends PopupBase {
    @property(cc.Label)
    lblEarn = null;
    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblPhone = null;
    @property(cc.Label)
    lblId = null;
    @property(cc.Label)
    lblEarn = null;
    @property(cc.Label)
    lblWallet = null;
    @property(cc.Label)
    lblRewardWin = null;
    @property(cc.Node)
    btnReward = null;

    @property(cc.Label)
    lblCount = null;
    @property(cc.Label)
    lblUserCount = null;
    @property(cc.Label)
    lblProxyCount = null;
    @property(cc.Label)
    lblWallets = null;
    @property(cc.Label)
    lblUserWallet = null;
    @property(cc.Label)
    lblProxyWallet = null;


    codeCoolDown = true;



    start() {
        this.renderUI();
    };

    renderUI() {
        this.lblEarn.string = "" + GameUtils.formatGold(App.Proxy.proxyEarn, 2) + '元';

        this.lblName.string = "" + GameUtils.getStringByLength(App.Proxy.proxyData.name, 5);
        this.lblId.string = "ID: " + App.Proxy.proxyData.id;
        this.lblPhone.string = "" + App.Proxy.proxyData.phone;
        // this.btnSetting.active = App.Proxy.proxyData.role == "admin" || App.Proxy.proxyData.role == "manager";
        this.lblWallet.string = "" + GameUtils.formatGold(App.Proxy.proxyData.wallet, 2) + "元"
        this.lblRewardWin.string = "" + GameUtils.formatGold(App.Proxy.proxyData.rewardWin) + "元";
        this.btnReward.active = App.Proxy.proxyData.rewardWin > 0;
        // if (App.Proxy.proxyData.rewardWin > 0 && !cc.find('Canvas/ProxyActivityPop'))
        //     Cache.showTipsMsg("累计收益" + GameUtils.formatGold(App.Proxy.proxyData.rewardWin) + "元,点击收益金额换取奖励")
        App.Proxy.getDetailInfo().then(() => {
            this.renderTotalUI()
        })
    };
    renderTotalUI() {
        this.lblCount.string = "直属用户总数: " + App.Proxy.proxyDetail.count;
        this.lblUserCount.string = "下级用户总数: " + App.Proxy.proxyDetail.userCount;
        this.lblProxyCount.string = "下级代理总数: " + App.Proxy.proxyDetail.proxyCount;
        this.lblWallets.string = "直属用户余额: " + GameUtils.formatGold(App.Proxy.proxyDetail.wallet);
        this.lblUserWallet.string = "下级用户余额: " + GameUtils.formatGold(App.Proxy.proxyDetail.userWallet);
        this.lblProxyWallet.string = "下级代理余额: " + GameUtils.formatGold(App.Proxy.proxyDetail.proxyWallet);
    };




}


