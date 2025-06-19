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
        usersContainer: cc.Node,
        usersItem: cc.Prefab,
        selectName: cc.Label,
        selectId: cc.Label,
        selectProxyID: cc.Label,
        selectWallet: cc.Label,
        selectAvatar: cc.Sprite,
        count: cc.EditBox,
        searchBox: cc.EditBox,
        historyContainer: cc.Node,
        historyItem: cc.Prefab,
        noData: cc.Node,
        historyNodata: cc.Node,
        userNodata: cc.Node,
        userData: []
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        this.addEvents();
        this.refreshUsersData()
    },
    addEvents() {
        try {
            cc.find("Canvas").on(GameConfig.GameEventNames.PROXY_SELECT_USER, this.refreshSelectInfo, this);
            // App.EventManager.addEventListener(GameConfig.GameEventNames.PROXY_SELECT_USER, this.refreshSelectInfo, this);
            App.EventManager.addEventListener(GameConfig.GameEventNames.EXCHANGE_LEAGUE_UPDATEDATA, this.refreshUsersData, this);
        } catch (error) {

        }
    },
    removeEvents() {
        try {

            cc.find("Canvas").off(GameConfig.GameEventNames.PROXY_SELECT_USER, this.refreshSelectInfo, this);
            // App.EventManager.removeEventListener(GameConfig.GameEventNames.PROXY_SELECT_USER, this.refreshSelectInfo, this);
            App.EventManager.removeEventListener(GameConfig.GameEventNames.EXCHANGE_LEAGUE_UPDATEDATA, this.refreshUsersData, this);
        } catch (error) {

        }

    },
    /**更新直属用户数据 */
    refreshUsersData() {
        Connector.request(GameConfig.ServerEventName.ProxyUsers, { isLeague: GameConfig.ProxyIsLeague }, (data) => {

            if (data.users) {
                this.proxyUsersData = data.users.concat();
                this.initData(this.proxyUsersData);
            }
        })
    },
    /**部分用户更新 */
    refreshUsersItemData(data) {
        if (!utils.isNullOrEmpty(data.proxy))
            GameConfig.ProxyData = data.proxy;
        if (!utils.isNullOrEmpty(data.user)) {
            this.proxyUsersData.forEach((element, index) => {
                if (element.id == data.user.id) {
                    this.proxyUsersData[index] = data.user;
                }
            });
        }
        console.log("-----", this.proxyUsersData)
        this.initData(this.proxyUsersData);

    },



    /**初始化 */
    initData(data) {
        this.userData = data.concat();
        this.usersContainer.removeAllChildren();
        if (utils.isNullOrEmpty(data)) {
            this.noData.active = true;
            this.userNodata.active = true;
            return;
        }
        this.noData.active = false;
        this.userNodata.active = false;
        data.forEach(element => {
            let usersItem = cc.instantiate(this.usersItem);
            usersItem.getComponent("ModuleProxyUserItem").initData(element);
            this.usersContainer.addChild(usersItem);
        });

        this.refreshSelectInfo({ detail: data[0] });
    },


    refreshSelectInfo(e, v) {

        this.selectUserInfo = e.detail;
        this.selectName.string = "" + utils.getStringByLength(e.detail.name, 6);
        this.selectId.string = "ID: " + e.detail.id;

        this.selectProxyID.node.active = GameConfig.ProxyData.role == "admin";
        this.selectProxyID.string = "代理ID: " + e.detail.proxyID;
        this.selectWallet.string = "" + utils.formatGold(e.detail.wallet);
        utils.setHead(this.selectAvatar, e.detail.head);
        this.downloadHistoryData()
    },

    addWellet() {
        Cache.playSfx();
        if (utils.isNullOrEmpty(this.selectUserInfo)) {
            Cache.alertTip("请选择用户")
            return;
        }
        let reg = /^[0-9]*[1-9][0-9]*$/;
        if (!reg.test(this.count.string)) {
            Cache.alertTip("请输入整数金额")
            return;
        }
        Cache.showConfirm("确认充值金额：" + this.count.string, () => {
            Connector.request(GameConfig.ServerEventName.ProxyUserWallet, { id: this.selectUserInfo.id, wallet: parseFloat(this.count.string) * 100, isLeague: GameConfig.ProxyIsLeague }, (data) => {
                Cache.alertTip("上分成功");
                this.refreshUsersItemData(data)

            })
        })



    },
    reduceWellet() {
        Cache.playSfx();
        if (utils.isNullOrEmpty(this.selectUserInfo)) {
            Cache.alertTip("请选择用户")
            return;
        }
        let reg = /^[0-9]*[1-9][0-9]*$/;
        if (!reg.test(this.count.string)) {
            Cache.alertTip("请输入整数金额")
            return;
        }
        Cache.showConfirm("确认下分金额：" + this.count.string, () => {
            Connector.request(GameConfig.ServerEventName.ProxyUserWallet, { id: this.selectUserInfo.id, wallet: parseFloat("-" + this.count.string) * 100, isLeague: GameConfig.ProxyIsLeague }, (data) => {
                Cache.alertTip("下分成功");
                this.refreshUsersItemData(data)

            })
        })
    },

    /**查找用户 */
    onClickSearch() {
        Cache.playSfx();
        let self = this;
        Connector.request(GameConfig.ServerEventName.ProxyUsers, { keywords: this.searchBox.string, isLeague: GameConfig.ProxyIsLeague }, (data) => {
            if (data.users) {
                let proxyUsersData = data.users.concat();
                self.initData(proxyUsersData)
            }
        })
    },
    /**重置搜索 */
    resetSearch() {
        Cache.playSfx();
        this.refreshUsersData();

    },


    /**下载历史记录 */
    downloadHistoryData() {
        if (utils.isNullOrEmpty(this.selectUserInfo)) {
            return;
        }
        Connector.request(GameConfig.ServerEventName.ProxyHistory, { id: this.selectUserInfo.id, logType: "user", isLeague: GameConfig.ProxyIsLeague }, (data) => {
            if (this.historyContainer) {
                this.historyContainer.removeAllChildren();
                this.historyNodata.active = data.logs.length == 0;
                data.logs.forEach(element => {
                    let historyItem = cc.instantiate(this.historyItem);
                    let time = utils.timestampToTime(new Date(element.createdAt).getTime());
                    historyItem.getChildByName("time").getComponent(cc.Label).string = "" + time;
                    historyItem.getChildByName("desc").getComponent(cc.Label).string = element.wallet >= 0 ? "充值" + utils.formatGold(element.wallet, 2) + "元" : "下分" + utils.formatGold(Math.abs(element.wallet), 2) + "元";
                    this.historyContainer.addChild(historyItem);
                });
            }
        })
    },

    openHistoryPage() {
        if (utils.isNullOrEmpty(this.selectUserInfo)) {
            Cache.alertTip("请选择用户")
            return;
        }
        utils.pop(GameConfig.pop.AdminHistoryPop, (node) => {
            node.getComponent('AdminHistoryPop').initData(this.selectUserInfo.id);
        })
    },

    openProfitDetail(){
        Cache.playSfx();
        utils.pop(GameConfig.pop.ProxyProfitDetail)
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
