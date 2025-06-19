const { GameConfig } = require("../../GameBase/GameConfig");
const { App } = require("../../script/ui/hall/data/App");
const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const utils = require("../Script/utils");

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Node,

        roomsContainer: cc.Node,
        roomItem: cc.Prefab,

        oneClickBox: cc.EditBox,
        lblUnit: cc.Label,

        typeContainer: cc.Node,
        setBtn: cc.Node,
        saveBtn: cc.Node,
        childTag: cc.Node,

        gameType: "PDK",
        profitType: "ratio",//默认按比例  quota---定额  ratio--比值

        PDKData: [],
        LDZPData: [],
        XHZDData: [],
        HZMJData: [],

        changeId: -1,
    },
    onLoad() {
        this.addEvents();
    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        cc.find("Canvas").on(GameConfig.GameEventNames.PROXY_CHANGE_PROFIT, this.resetData, this);
    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        cc.find("Canvas").off(GameConfig.GameEventNames.PROXY_CHANGE_PROFIT, this.resetData, this);
    },

    /**显示自己分成 */
    showSelfProfit() {
        this._isChange = false;
        this.typeContainer.active = false;
        this.setBtn.active = false;
        this.saveBtn.active = false;
        this.childTag.active = false;
        this.lblUnit.node.active = false;
        this.oneClickBox.node.active = false;
        this.showSelf = true;

        let res = utils.deepcopyArr(GameConfig.ProxyIsLeague ? GameConfig.ProxyProfitData : GameConfig.ProxyClubProfitData);
        res.forEach((e) => {
            switch (e.room.gameType) {
                case GameConfig.GameType.PDK_SOLO:
                    this.PDKData.push(e);
                    break;
                case GameConfig.GameType.LDZP_SOLO:
                    this.LDZPData.push(e);
                    break;
                case GameConfig.GameType.XHZD:
                    this.XHZDData.push(e);
                    break;
                case GameConfig.GameType.HZMJ_SOLO:
                    this.HZMJData.push(e);
                    break;
            }
        });

        this.refreshUI();
    },

    /**下载新增分成数据 */
    downloadProfitData() {
        this._isChange = false;
        let res = utils.deepcopyArr(GameConfig.ProxyIsLeague ? GameConfig.ProxyProfitData : GameConfig.ProxyClubProfitData);
        res.forEach((e) => {
            switch (e.room.gameType) {
                case GameConfig.GameType.PDK_SOLO:
                    this.PDKData.push(e);
                    break;
                case GameConfig.GameType.LDZP_SOLO:
                    this.LDZPData.push(e);
                    break;
                case GameConfig.GameType.XHZD:
                    this.XHZDData.push(e);
                    break;
                case GameConfig.GameType.HZMJ_SOLO:
                    this.HZMJData.push(e);
                    break;
            }
        })
        this.refreshUI();
    },

    /**下载下级代理分成数据 */
    downloadChildData(id) {
        this._isChange = true;
        this.changeId = id;

        Connector.request(GameConfig.ServerEventName.ProxyProfit, { id: id, isLeague: GameConfig.ProxyIsLeague }, (data) => {
            if (data.profits) {
                let res = utils.deepcopyArr(data.profits);
                let parentFit = utils.deepcopyArr(GameConfig.ProxyIsLeague ? GameConfig.ProxyProfitData : GameConfig.ProxyClubProfitData);
                res.forEach((e, i) => {
                    e.changed = false;
                    e.price = parentFit[i].price;
                    e.parentProfit = parentFit[i].profit;
                    switch (e.room.gameType) {
                        case GameConfig.GameType.PDK_SOLO:
                            this.PDKData.push(e);
                            break;
                        case GameConfig.GameType.LDZP_SOLO:
                            this.LDZPData.push(e);
                            break;
                        case GameConfig.GameType.XHZD:
                            this.XHZDData.push(e);
                            break;
                        case GameConfig.GameType.HZMJ_SOLO:
                            this.HZMJData.push(e);
                            break;
                    }
                })

                this.refreshUI();
            }
        })
    },


    /**更新ui显示 */
    refreshUI() {
        this.roomsContainer.removeAllChildren();
        let data = [];
        switch (this.gameType) {
            case "PDK":
                data = this.PDKData;
                break;
            case "LDZP":
                data = this.LDZPData;
                break;
            case "XHZD":
                data = this.XHZDData;
                break;
            case "HZMJ":
                data = this.HZMJData;
                break;
        }

        data.forEach(element => {
            let roomItem = cc.instantiate(this.roomItem);
            roomItem.getComponent("ModuleProfitRoomItem").init(element, this.showSelf);
            this.roomsContainer.addChild(roomItem);
        });
    },

    /**选择游戏类型 */
    selectGameType(e, v) {
        Cache.playSfx();
        if (this.gameType == v) return;
        this.gameType = v
        this.refreshUI();
    },

    /**选择分成类型 */
    selectProfitType(e, v) {
        // quota---定额  ratio--比值

        Cache.playSfx();
        if (this.profitType == v) return;
        this.profitType = v
        this.lblUnit.string = v == "ratio" ? "%" : "元";
    },


    /**一键设置 */
    oneClickSetting() {
        Cache.playSfx();
        let reg = /^[0-9]+([.]{1}[0-9]+){0,1}$/

        // let reg2= /^[0]+(.[0-9]{1,2})?$/;
        if (!reg.test(this.oneClickBox.string)) {
            Cache.alertTip("请输入整数或小数");
            return;
        }
        let count = parseFloat(this.oneClickBox.string);
        switch (this.gameType) {
            case "PDK":
                this.PDKData.forEach(element => {
                    element.changed = true;
                    let key1 = utils.isNullOrEmpty(element.parentProfit) ? "childProfit" : "profit";
                    let key2 = utils.isNullOrEmpty(element.parentProfit) ? "profit" : "parentProfit";
                    element[key1] = this.profitType == "ratio" ? (element[key2] * count / 100).toFixed(2) : (element[key2] - count * 100).toFixed(2);
                });
                break;
            case "LDZP":
                this.LDZPData.forEach(element => {
                    element.changed = true;
                    let key1 = utils.isNullOrEmpty(element.parentProfit) ? "childProfit" : "profit";
                    let key2 = utils.isNullOrEmpty(element.parentProfit) ? "profit" : "parentProfit";
                    element[key1] = this.profitType == "ratio" ? (element[key2] * count / 100).toFixed(2) : (element[key2] - count * 100).toFixed(2);
                });
                break;
            case "XHZD":
                this.XHZDData.forEach(element => {
                    element.changed = true;
                    let key1 = utils.isNullOrEmpty(element.parentProfit) ? "childProfit" : "profit";
                    let key2 = utils.isNullOrEmpty(element.parentProfit) ? "profit" : "parentProfit";
                    element[key1] = this.profitType == "ratio" ? (element[key2] * count / 100).toFixed(2) : (element[key2] - count * 100).toFixed(2);
                });
                break;
            case "HZMJ":
                this.HZMJData.forEach(element => {
                    element.changed = true;
                    let key1 = utils.isNullOrEmpty(element.parentProfit) ? "childProfit" : "profit";
                    let key2 = utils.isNullOrEmpty(element.parentProfit) ? "profit" : "parentProfit";
                    element[key1] = this.profitType == "ratio" ? (element[key2] * count / 100).toFixed(2) : (element[key2] - count * 100).toFixed(2);
                });
                break;
        }


        this.refreshUI();

    },

    /**重置数据 */
    resetData(e) {

        switch (this.gameType) {
            case "PDK":
                this.PDKData.forEach(element => {
                    if (element.id == e.detail.id) {
                        element = e.detail;
                    }
                });
                break;
            case "LDZP":
                this.LDZPData.forEach(element => {
                    if (element.id == e.detail.id) {
                        element = e.detail;
                    }
                });
                break;
            case "XHZD":
                this.XHZDData.forEach(element => {
                    if (element.id == e.detail.id) {
                        element = e.detail;
                    }
                });
                break;
            case "HZMJ":
                this.HZMJData.forEach(element => {
                    if (element.id == e.detail.id) {
                        element = e.detail;
                    }
                });
                break;
        }
    },

    /**保存设置 */
    saveProfitSetting() {
        Cache.playSfx();

        let data = this.PDKData.concat(this.LDZPData).concat(this.XHZDData).concat(this.HZMJData);

        let isError = false;
        data.forEach((item) => {
            if (this._isChange) {
                isError = parseInt(item.profit) <= 0;
                item.profit = parseInt(item.profit)
                return;
            }

            if (utils.isNullOrEmpty(item.childProfit) || parseInt(item.childProfit) <= 0) {
                isError = true;
                return;
            }
            item.childProfit = parseInt(item.childProfit)

        })

        if (isError) {
            Cache.alertTip("游戏分成需大于0")
            return;
        }

        if (this._isChange) {
            //修改
            Connector.request(GameConfig.ServerEventName.ProxyChangeProfit, { profits: data, id: this.changeId, isLeague: GameConfig.ProxyIsLeague }, (data) => {
                Cache.alertTip("修改成功");
                this.onClickClose();
            })
        } else {
            //添加
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.PROXY_PROFIT_DATA, data)
            this.onClickClose()

        }
    },

    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        this.removeEvents();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
    // update (dt) {},
});
