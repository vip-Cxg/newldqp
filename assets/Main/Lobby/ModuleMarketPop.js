const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
let DataBase = require("../Script/DataBase");
const utils = require("../Script/utils")
const { GameConfig } = require("../../GameBase/GameConfig");
const Native = require("../Script/native-extend");
const { App } = require("../../script/ui/hall/data/App");
const _social = Native.Social
cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Node,
        tradeBtn: cc.Node,
        tradeRed: cc.Node,

        //页面容器
        pageContainer: cc.Node,
        //收款账户详情
        marketAccountInfo: cc.Prefab,
        //选择支付方式
        payTypePop: cc.Prefab,
        //创建订单方式
        sellSelectPop: cc.Prefab,
        //卖家markets
        marketsPage: cc.Prefab,
        //交易trades
        tradesPage: cc.Prefab,

        amountContainer: cc.Node,
        bgMask: cc.Sprite,

        lblReward: cc.Label,
        lblFrozen: cc.Label,
        lblRemain: cc.Label,
        newGuide1: cc.Node,
        newGuide2: cc.Node,
        maskBtnArr: [cc.Node],
        tradeAmount: 0,
        payType: "",
        tradeType: "fast"
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let isShow = utils.getValue(GameConfig.StorageKey.FirstOpenSlow, true);
        if (isShow) {
            this.newGuide1.active = true;

            // let timeStr= GameConfig.GameInfo.otcConfig.SLOW_BUY_TRANS_TIME >=1000*60*60? GameConfig.GameInfo.otcConfig.SLOW_BUY_TRANS_TIME /1000/60/60+"小时":GameConfig.GameInfo.otcConfig.SLOW_BUY_TRANS_TIME /1000/60+"分钟";
            // Cache.showTipsMsg("正常购买到账所需时间约" +timeStr+ "，有" + utils.toPercent(GameConfig.GameInfo.otcConfig.SLOW_BUY_REWARD) + "的补偿费", () => {
            // });
        }

        utils.saveValue(GameConfig.StorageKey.FirstOpenSlow, false);


        isShow = utils.getValue(GameConfig.StorageKey.FirstOpenMarket, false);
        if (!isShow) {
            Cache.showTipsMsg("迎新春特惠,选择加速购买免除手续费。欢迎大家体验", () => { }, GameConfig.StorageKey.FirstOpenMarket);
        }

        this.refreshUI()
        this.addEvents();


    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        cc.find("Canvas").on(GameConfig.GameEventNames.SHOW_TRADE_TIPS, this.handleTrade, this);
        this.node.on(GameConfig.GameEventNames.HIDE_TRADE_TIPS, this.hideTradeTips, this);
        this.node.on(GameConfig.GameEventNames.REFRESH_SELL_INFO, this.refreshSellAmount, this)
    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        cc.find("Canvas").off(GameConfig.GameEventNames.SHOW_TRADE_TIPS, this.handleTrade, this);
        this.node.off(GameConfig.GameEventNames.HIDE_TRADE_TIPS, this.hideTradeTips, this);
        this.node.off(GameConfig.GameEventNames.REFRESH_SELL_INFO, this.refreshSellAmount, this)
    },

    newGuide1Click() {
        Cache.playSfx();
        this.newGuide1.active = false;
        this.newGuide2.active = true;
    },
    newGuide2Click() {
        Cache.playSfx();
        this.newGuide1.active = false;
        this.newGuide2.active = false;
    },

    refreshSellAmount() {
        Connector.request(GameConfig.ServerEventName.OTCInfo, {}, (data) => {
            if (data.market) {
                this.marketData = data.market;
                this.lblFrozen.string = "冻结金额 " + utils.formatGold(data.market.frozen) + "元"
                this.lblRemain.string = "在售金额 " + utils.formatGold(data.market.remain) + "元"
            } else {
                this.lblFrozen.string = "冻结金额 0元"
                this.lblRemain.string = "在售金额 0元"
            }
            let successCount = data.buyCount || 0;
            this.maskBtnArr.forEach((e, i) => {
                e.active = i > successCount;
            })
        })
    },

    refreshUI() {
        this.handleTrade();
        this.refreshSellAmount();

        try {

            let rewardData = DataBase.player.dealInfo.rewards
            if (rewardData != null) {
                this.lblReward.string = "今日已获奖励: " + Math.floor((GameConfig.GameInfo.otcConfig.REWARD_DAILY_TOTAL - rewardData.daily.total) / 100) + "/" + Math.floor(GameConfig.GameInfo.otcConfig.REWARD_DAILY_TOTAL / 100) + " 元    本周已获奖励: " + Math.floor((GameConfig.GameInfo.otcConfig.REWARD_WEEKLY_TOTAL - rewardData.weekly.total) / 100) + "/" + Math.floor(GameConfig.GameInfo.otcConfig.REWARD_WEEKLY_TOTAL / 100) + " 元";
            } else {
                this.lblReward.string = "";
            }
        } catch (error) {
            this.lblReward.string = "";
            _social.reportError(error);
        }




        GameConfig.GameInfo.priceTag.forEach((element, index) => {
            this.amountContainer.getChildByName("toggle" + index).getChildByName("desc").getComponent(cc.Label).string = "¥" + utils.formatGold(element);
            this.amountContainer.getChildByName("toggle" + index).getChildByName("reward").getComponent(cc.Label).string = this.tradeType == "slow" ? "额外赠送 " + utils.formatGold(Math.min(element * GameConfig.GameInfo.otcConfig.SLOW_BUY_REWARD, GameConfig.GameInfo.otcConfig.REWARD_DAILY_TOTAL)) + " 元" : "额外赠送 " + utils.formatGold(Math.min(element * 0.005, GameConfig.GameInfo.otcConfig.REWARD_DAILY_TOTAL)) + " 元";// "实际到账 " +   utils.formatGold(element*(1-GameConfig.GameInfo.otcConfig.FAST_BUY_FEE))+" 元";
            // this.amountContainer.getChildByName("toggle" + index).getChildByName("icon").active = this.tradeType=="slow";
        });
    },

    openAccountInfo() {
        Cache.playSfx();
        let marketAccountInfo = cc.instantiate(this.marketAccountInfo);
        this.pageContainer.addChild(marketAccountInfo);
    },


    // selectTradeType(e) {
    //     Cache.playSfx();
    //     this.tradeType = e.isChecked ? "fast" : "slow";
    //     // let isShow = utils.getValue(GameConfig.StorageKey.FirstOpenFast, true);
    //     // if (isShow && e.isChecked)
    //     //     Cache.showTipsMsg("快速购买所需时间约为5分钟，要支付" + utils.toPercent(GameConfig.GameInfo.otcConfig.FAST_BUY_FEE) + "的手续费");
    //     // utils.saveValue(GameConfig.StorageKey.FirstOpenFast, false);

    //     this.refreshUI();
    // },
    /**选择订单金额 */
    selectOrderAmount(e, v) {
        Cache.playSfx();
        this.tradeAmount = GameConfig.GameInfo.priceTag[parseInt(v)];

        //选择支付方式 
        let payTypePop = cc.instantiate(this.payTypePop);
        payTypePop.getComponent("PayTypePop").show((data) => {
            //确认支付方式
            this.payType = data;
            this.createTrade();
        })
    },


    createTrade() {
        Connector.request(GameConfig.ServerEventName.OTCCreateTrade, { amount: this.tradeAmount, payType: this.payType, tradeType: "fast" }, (data) => {

            let isShow = utils.getValue(GameConfig.StorageKey.CreateTrade, false)

            if (!isShow) {

                Cache.showTipsMsg("仔细核对对方收款账户信息,避免转错账户,（请保留付款凭证,作为申诉依据）", () => {
                    let tradesPage = cc.instantiate(this.tradesPage);
                    this.pageContainer.addChild(tradesPage);
                }, GameConfig.StorageKey.CreateTrade)
            } else {
                let tradesPage = cc.instantiate(this.tradesPage);
                this.pageContainer.addChild(tradesPage);
            }

        })
    },


    /**点击我要卖 */
    onClickSell() {
        Cache.playSfx();
        if (utils.isNullOrEmpty(DataBase.player.alipay) && utils.isNullOrEmpty(DataBase.player.bank) && utils.isNullOrEmpty(DataBase.player.wechat)) {
            Cache.showConfirm("至少填写一种收款信息", () => {
                let marketAccountInfo = cc.instantiate(this.marketAccountInfo);
                this.pageContainer.addChild(marketAccountInfo);
            })
            return;
        }
        if (utils.isNullOrEmpty(this.marketData)) {
            Cache.alertTip("加载数据失败,请重新进入交易所")
            return;
        }
        let sellSelectPop = cc.instantiate(this.sellSelectPop);
        sellSelectPop.getComponent("SellSelectPop").show(this.marketData, (amount) => {
            Connector.request(GameConfig.ServerEventName.OTCMarket, { total: amount * 100, tradeType: "fast" }, (data) => {
                Cache.alertTip("寄售成功")
                DataBase.player.wallet = data.wallet;
                this.refreshSellAmount();
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_WALLET)
            });
        })
    },

    /**打开markets */
    openSellHistory() {
        Cache.playSfx();
        let marketsPage = cc.instantiate(this.marketsPage);
        this.pageContainer.addChild(marketsPage);
    },
    /**打开trades */
    openTradesHistory() {
        Cache.playSfx();
        let tradesPage = cc.instantiate(this.tradesPage);
        this.pageContainer.addChild(tradesPage);
    },

    /**有需要操作的交易 */
    handleTrade() {
        let tradeData = utils.getValue("" + GameConfig.StorageKey.TradeWaitting + DataBase.player.id, []);
        if (tradeData.length == 0) return;
        //红点闪烁提示
        this.tradeRed.active = true;
        this.tradeBtn.stopAllActions();
        let ap = cc.scaleTo(0.3, 1.2);
        let bp = cc.scaleTo(0.3, 1);
        let ag = cc.sequence(ap, bp).repeatForever();
        this.tradeBtn.runAction(ag);
    },

    hideTradeTips() {

        let tradeData = utils.getValue("" + GameConfig.StorageKey.TradeWaitting + DataBase.player.id, []);
        if (tradeData.length > 0) return;


        this.tradeRed.active = false;
        this.tradeBtn.stopAllActions();
        this.tradeBtn.scale = 1;
        this.tradeBtn.rotation = 0;

    },

    showRuleTips() {
        Cache.showTipsMsg("加速购买到账时间约为2分钟，要支付" + utils.toPercent(GameConfig.GameInfo.otcConfig.FAST_BUY_FEE) + "的手续费");

    },

    lockedTips(e, v) {
        Cache.playSfx();
        Cache.alertTip("成功完成" + v + "次交易后解锁");
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

});
