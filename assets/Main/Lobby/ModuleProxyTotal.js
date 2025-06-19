const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const dataBase = require("../Script/DataBase");
const utils = require("../Script/utils")
const { GameConfig } = require("../../GameBase/GameConfig");
let http = require("SceneLogin");
const Native = require("../Script/native-extend");
const { App } = require("../../script/ui/hall/data/App");
const _social = Native.Social
cc.Class({
    extends: cc.Component,

    properties: {

        lblName: cc.Label,
        lblId: cc.Label,
        lblEarn: cc.Label,
        lblWallet: cc.Label,
        lblPhone: cc.Label,
        profitPage: cc.Prefab,

        lblCount: cc.Label,
        lblProxyCount: cc.Label,
        lblUserCount: cc.Label,
        lblWallets: cc.Label,
        lblProxyWallet: cc.Label,
        lblUserWallet: cc.Label,
        lblRewardWin: cc.Label,
        btnReward: cc.Node,

        userItem: cc.Prefab,
        earnItem: cc.Prefab,
        gameItem: cc.Prefab,
        rechargeItem: cc.Prefab,
        historyItem: cc.Prefab,
        creditItem: cc.Prefab,
        recordItem: cc.Prefab,

        btnCredit: cc.Node,

        itemContainer: cc.Node,

        btnSetting: cc.Node,
        animTips: cc.Node,
        animDesc: cc.Label,
        btnActive: cc.Node,

        lastClickTime: 0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
        this.downloadProxyData();
    },
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.EXCHANGE_LEAGUE_UPDATEDATA, this.downloadProxyData, this);

    },
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.EXCHANGE_LEAGUE_UPDATEDATA, this.downloadProxyData, this);
    },
    downloadProxyData() {

        Connector.request(GameConfig.ServerEventName.ProxyInfo, { isLeague: GameConfig.ProxyIsLeague }, (data) => {

            // data={"success":true,"status":0,"message":null,"detail":null,"version":"1.0.1","proxy":{"password":"******","levelCluster":[1000,1001,1002],"channel":1001,"id":1184,"phone":"17763775220","name":"贤军","status":"normal","inviter":"YEYKCQ","league":"public","role":"proxy","credit":0,"parent":1002,"wallet":43,"level":3,"rewardWin":0,"activityReward":0,"shuffle":0,"bank":null,"alipay":null,"wechat":null,"createdAt":"2021-01-08T16:47:22.000Z","updatedAt":"2021-10-11T13:03:36.000Z"},"total":992,"profits":[{"id":3646,"roomID":10000,"profit":150,"room":{"name":"0.20","gameType":"PDK_SOLO","fee":"10"},"price":200},{"id":3647,"roomID":10001,"profit":250,"room":{"name":"0.50","gameType":"PDK_SOLO","fee":"15"},"price":300},{"id":3648,"roomID":10002,"profit":350,"room":{"name":"1.00","gameType":"PDK_SOLO","fee":"20"},"price":400},{"id":3649,"roomID":10003,"profit":450,"room":{"name":"2.00","gameType":"PDK_SOLO","fee":"25"},"price":500},{"id":3650,"roomID":10004,"profit":950,"room":{"name":"5.00","gameType":"PDK_SOLO","fee":"50"},"price":1000},{"id":3652,"roomID":10006,"profit":250,"room":{"name":"0.20","gameType":"LDZP_SOLO","fee":"150"},"price":300},{"id":3653,"roomID":10007,"profit":350,"room":{"name":"0.50","gameType":"LDZP_SOLO","fee":"200"},"price":400},{"id":3654,"roomID":10008,"profit":450,"room":{"name":"1.00","gameType":"LDZP_SOLO","fee":"250"},"price":500},{"id":3655,"roomID":10009,"profit":550,"room":{"name":"2.00","gameType":"LDZP_SOLO","fee":"300"},"price":600},{"id":3658,"roomID":10012,"profit":150,"room":{"name":"2.00","gameType":"XHZD","fee":"5"},"price":200},{"id":3659,"roomID":10013,"profit":470,"room":{"name":"5.00","gameType":"XHZD","fee":"13"},"price":520},{"id":3660,"roomID":10014,"profit":1012,"room":{"name":"10.0","gameType":"XHZD","fee":"40"},"price":1600},{"id":3661,"roomID":10015,"profit":1950,"room":{"name":"20.0","gameType":"XHZD","fee":"50"},"price":2000},{"id":15454,"roomID":10018,"profit":150,"room":{"name":"1.00","gameType":"HZMJ_SOLO","fee":"10"},"price":200},{"id":15455,"roomID":10019,"profit":250,"room":{"name":"2.00","gameType":"HZMJ_SOLO","fee":"15"},"price":300},{"id":15456,"roomID":10020,"profit":350,"room":{"name":"3.00","gameType":"HZMJ_SOLO","fee":"20"},"price":400},{"id":15457,"roomID":10021,"profit":450,"room":{"name":"5.00","gameType":"HZMJ_SOLO","fee":"25"},"price":500},{"id":15458,"roomID":10022,"profit":950,"room":{"name":"10.00","gameType":"HZMJ_SOLO","fee":"50"},"price":1000},{"id":15459,"roomID":10023,"profit":1450,"room":{"name":"20.00","gameType":"HZMJ_SOLO","fee":"75"},"price":1500}],"notice":"1.0.3","activity":false};
            GameConfig.ProxyMarketConfig = [
                { amount: 100000, reward: 1000, tradeType: 'fast' },
                { amount: 200000, reward: 2000, tradeType: 'fast' },
                { amount: 300000, reward: 3000, tradeType: 'fast' },
                { amount: 500000, reward: 5000, tradeType: 'fast' },
                { amount: 1000000, reward: 10000, tradeType: 'fast' }
            ]

            if (data.proxy) {
                GameConfig.ProxyData = data.proxy;
                utils.saveValue(GameConfig.StorageKey.ProxyData, data.proxy)
                // this.settingBtn.active = data.proxy.role == "admin";
                // this.activityBtn.active = data.proxy.role != "admin";
                GameConfig.ProxyProfitData = data.profits;
                // this.btnActive.active = data.activity;

                // GameConfig.ProxyClubProfitData = data.profitsClan;
                this.refreshUI(data.total);
            }
            if (!utils.isNullOrEmpty(data.notice)) {
                let localVersion = utils.getValue(GameConfig.StorageKey.ProxyNoticeVersion, '1.0.0');
                let a = this.versionCompareHandle(data.notice, localVersion);
                if (a != 0) {
                    utils.pop(GameConfig.pop.ProxyActivityPop);
                    utils.saveValue(GameConfig.StorageKey.ProxyNoticeVersion, data.notice);
                    return;
                }
            }
            //TODO
            // let zpTips = utils.getValue(GameConfig.StorageKey.ProxyZPTips, true);
            // let lastBetTime = utils.getValue(GameConfig.StorageKey.LastProxyZPTime, 1000);
            // let nowTime = utils.getTimeStamp();
            // if (!utils.judgeDate(nowTime, lastBetTime)) {
            //     zpTips = true;
            //     utils.saveValue(GameConfig.StorageKey.LastProxyZPTime, utils.getTimeStamp())
            //     utils.saveValue(GameConfig.StorageKey.ProxyZPTips, zpTips)
            // }
            // if (zpTips) {
            //     utils.pop(GameConfig.pop.ProxyZPRankPop);
            // }

        }, true, (err) => {
            Cache.showTipsMsg(err.message || "登录信息失效", () => {
                utils.pop(GameConfig.pop.ProxyLoginPop);

                if (this.node) {
                    this.onClickClose();
                }
                console.log("shaskldjakl", cc.find("Canvas/MainPrefabProxyManagePop"))
                if (cc.find("Canvas/MainPrefabProxyManagePop")) {
                    cc.find("Canvas/MainPrefabProxyManagePop").destroy();
                }
            })
        })
    },


    /**更新ui显示 */
    refreshUI(data) {

        this.lblEarn.string = "" + (data / 100).toFixed(2) + '元';

        this.lblName.string = "" + utils.getStringByLength(GameConfig.ProxyData.name, 5);
        this.lblId.string = "ID: " + GameConfig.ProxyData.id;
        this.lblPhone.string = "" + GameConfig.ProxyData.phone;
        this.btnSetting.active = GameConfig.ProxyData.role == "admin" || GameConfig.ProxyData.role == "manager";
        this.lblWallet.string = "" + utils.formatGold(GameConfig.ProxyData.wallet, 2) + "元"
        this.lblRewardWin.string = "" + utils.formatGold(GameConfig.ProxyData.rewardWin) + "元";
        this.btnReward.active = GameConfig.ProxyData.rewardWin > 0;

        // if (GameConfig.ProxyData.rewardWin > 0 && !cc.find('Canvas/ProxyActivityPop'))
        //     Cache.showTipsMsg("累计收益" + utils.formatGold(GameConfig.ProxyData.rewardWin) + "元,点击收益金额换取奖励")


        if (utils.isNullOrEmpty(GameConfig.ProxyData.credit) || GameConfig.ProxyData.credit == 0) {
           this.btnCredit.active = false;
            this.onClickUser();
        } else {
        
            this.btnCredit.active = true;
            this.onClickCredit();
        }
        this.startAnim();

        Connector.request(GameConfig.ServerEventName.ProxyDetail, { id: GameConfig.ProxyData.id, isLeague: GameConfig.ProxyIsLeague }, (res) => {
            try {

                this.lblCount.string = "直属用户总数: " + res.count;
                this.lblUserCount.string = "下级用户总数: " + res.userCount;
                this.lblProxyCount.string = "下级代理总数: " + res.proxyCount;
                this.lblWallets.string = "直属用户余额: " + utils.formatGold(res.wallet);
                this.lblUserWallet.string = "下级用户余额: " + utils.formatGold(res.userWallet);
                this.lblProxyWallet.string = "下级代理余额: " + utils.formatGold(res.proxyWallet);
            } catch (error) {

            }
        })

    },

    /**查看自己分成信息 */
    onSelfProfit() {

        Cache.playSfx();
        let profitPage = cc.instantiate(this.profitPage);
        profitPage.getComponent("ModuleProxyProfit").showSelfProfit();
        cc.find("Canvas").addChild(profitPage);
    },


    /**修改信息 */
    onChangeData() {
        // Cache.playSfx();
        // utils.pop(GameConfig.pop.ProxyDataPop)
    },
    /**查看邀请二维码 */
    onShareInviter() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.SharePop, (node) => {
            node.getComponent("ModuleSharePop").refreshProxyUI();
        })
    },

    /**查看玩家记录 */
    onClickRecord() {

       
        Cache.playSfx();
        // let nowTime = new Date().getTime();
        // if (nowTime - this.lastClickTime <= 1000) return;
        // this.lastClickTime = nowTime;
        this.itemContainer.removeAllChildren();
        let item = cc.instantiate(this.recordItem);
        this.itemContainer.addChild(item);
    },
    /**查看用户 */
    onClickUser() {

       
        Cache.playSfx();
        // let nowTime = new Date().getTime();
        // if (nowTime - this.lastClickTime <= 1000) return;
        // this.lastClickTime = nowTime;
        this.itemContainer.removeAllChildren();
        let item = cc.instantiate(this.userItem);
        this.itemContainer.addChild(item);
    },
    /**查看收益 */
    onClickEarn() {
        Cache.playSfx();
        // let nowTime = new Date().getTime();
        // if (nowTime - this.lastClickTime <= 1000) return;
        // this.lastClickTime = nowTime;
        this.itemContainer.removeAllChildren();
        let item = cc.instantiate(this.earnItem);
        this.itemContainer.addChild(item);
    },
    /**查看对局 */
    onClickGame() {
        Cache.playSfx();
        // let nowTime = new Date().getTime();
        // if (nowTime - this.lastClickTime <= 1000) return;
        // this.lastClickTime = nowTime;
        this.itemContainer.removeAllChildren();
        let item = cc.instantiate(this.gameItem);
        this.itemContainer.addChild(item);
    },
    /**查看充值 */
    onClickRecharge() {
        Cache.playSfx();
        // let nowTime = new Date().getTime();
        // if (nowTime - this.lastClickTime <= 1000) return;
        // this.lastClickTime = nowTime;
        this.itemContainer.removeAllChildren();
        let item = cc.instantiate(this.rechargeItem);
        this.itemContainer.addChild(item);
        console.log("----", this.itemContainer)
    },
    /**查看钱包变动 */
    onClickHistory() {
        Cache.playSfx();
        // let nowTime = new Date().getTime();
        // if (nowTime - this.lastClickTime <= 1000) return;
        // this.lastClickTime = nowTime;
        this.itemContainer.removeAllChildren();
        let item = cc.instantiate(this.historyItem);
        this.itemContainer.addChild(item);
    },
    /**查看信用额度 */
    onClickCredit() {
        Cache.playSfx();
        // let nowTime = new Date().getTime();
        // if (nowTime - this.lastClickTime <= 1000) return;
        // this.lastClickTime = nowTime;
        this.itemContainer.removeAllChildren();
        let item = cc.instantiate(this.creditItem);
        this.itemContainer.addChild(item);
    },
    /**注销 */
    onLogout() {
        Cache.playSfx();
        utils.saveValue(GameConfig.StorageKey.ProxyToken, "");
        utils.pop(GameConfig.pop.ProxyLoginPop);
        if (cc.find("Canvas/MainPrefabProxyManagePop")) {
            cc.find("Canvas/MainPrefabProxyManagePop").destroy();
        }

        this.onClickClose();
    },
    /**查看代理活动 */
    onClickActive() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.ProxyActivePop);
    },
    /**查看代理活动 */
    onClickZPRank() {
        Cache.playSfx();
        if (GameConfig.BtnIsMoving) return;
        utils.pop(GameConfig.pop.ProxyZPRankPop);
    },

    /**admin 设置  */
    onClickSetting() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.AdminSettingPop);
    },

    /**公告 */
    onClickActivity() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.ProxyActivityPop);
    },
    /**邀请玩家 */
    onClickActivity() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.ProxyInviteUser);
    },

    onGetReward() {
        if (GameConfig.ProxyData.rewardWin == 0) {
            Cache.alertTip("暂无奖励可领取");
            return;
        }

        Cache.playSfx();
        Connector.request(GameConfig.ServerEventName.ProxyAdminReward, {}, (data) => {
            Cache.alertTip("领取成功");
            this.refreshProxyData();
        });
    },

    refreshProxyData() {
        Connector.request(GameConfig.ServerEventName.ProxyInfo, { isLeague: GameConfig.ProxyIsLeague }, (data) => {
            if (data.proxy) {
                GameConfig.ProxyData = data.proxy;
                GameConfig.ProxyProfitData = data.profits;
                // GameConfig.ProxyClubProfitData = data.profitsClan;
                this.refreshUI(data.total);
            }
        }, true, (err) => {
            Cache.showTipsMsg(err.message || "登录信息失效", () => {
                utils.pop(GameConfig.pop.ProxyLoginPop);
                this.onClickClose();
            })
        })
    },
    versionCompareHandle(versionA, versionB) {

        // cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
        let vA = versionA.split('.');
        let vB = versionB.split('.');
        for (let i = 0; i < vA.length; ++i) {
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i] || 0);
            if (a === b) {
                continue;
            } else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        } else {
            return 0;
        }
    },
    openMarketPop() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.ProxyMarketPop);
    },

    startAnim() {
        this.animTips.stopAllActions();
        this.animTips.scale = 0;
        let ap = cc.scaleTo(0.5, 1.1).easing(cc.easeBackInOut());
        let bp = cc.scaleTo(0.5, 0).easing(cc.easeBackInOut());

        let dp = cc.sequence(ap, cc.delayTime(4), bp, cc.callFunc(() => {
            this.animDesc.string = this.animDesc.string == '优惠' ? '省钱' : '优惠';
        }));
        let ep = cc.repeatForever(dp);
        this.animTips.runAction(ep);
    },
    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        this.removeEvents();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
    onDestroy() {
        this.removeEvents();
    }

});
