let db = require("DataBase");
let Connector = require("Connector");
let Cache = require('../Script/Cache');
const { GameConfig } = require("../../GameBase/GameConfig");
const utils = require("../Script/utils");
const { App } = require("../../script/ui/hall/data/App");
const subStr = function (str, n) {
    if (str == null || str.length <= 0)
        return "";
    let r = /[^\x00-\xff]/g;
    if (str.replace(r, "mm").length <= n) {
        return str;
    }
    let m = Math.floor(n / 2);
    for (let i = m; i < str.length; i++) {
        if (str.substr(0, i).replace(r, "mm").length >= n) {
            return str.substr(0, i) + "...";
        }
    }
    return str;
};

cc.Class({
    extends: cc.Component,

    properties: {
        layerContent: cc.Node,
        preHistoryItem: cc.Prefab,
        // startDate: cc.Label,
        // endDate: cc.Label,
        // searchBtn: cc.Node,
        noData: cc.Node,
        toggleContainer: cc.Node,
        DLMBtn: cc.Node,
        clubBtn: cc.Node,
        searchBox: cc.EditBox,

        replayContainer: cc.Node,
        replayTopContainer: cc.Node,
        walletContainer: cc.Node,
        walletTopContainer: cc.Node,


        pageContainer: cc.Node,
        tagContainer: cc.Node,
        tagContent: cc.Node,
        tagPrefab: cc.Prefab,
        recordContent: cc.Node,
        recordItem: cc.Prefab,
        walletNoData: cc.Node,
        lblPage: cc.Label,
        typeArr: [],
        page: 1,
        totalPage: 0,
        renderData: null
    },
    start() {
        this.addEvents();
        this.currentIdx = 1;
        this.lastClickTime = 0;
        this.isConnect = false;
        this.searchByDate();


        this.typeArr = [];
        this.renderData = {
            page: [],
            data: []
        }
        this.tagContent.removeAllChildren();
        let tagData = GameConfig.GameInfo.logsConfig;
        for (let key in tagData) {
            let tagBtn = cc.instantiate(this.tagPrefab);
            tagBtn.getComponent('HistoryTagItem').renderUI(key, tagData[key])
            this.tagContent.addChild(tagBtn);
        }
    },
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.SELECT_TAG_HISTORY, this.addTag, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, this.removeTag, this);
    },
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.SELECT_TAG_HISTORY, this.addTag, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, this.removeTag, this);

    },
    showWallet() {
        Cache.playSfx();
        this.replayContainer.active = false;
        this.replayTopContainer.active = false;
        this.walletTopContainer.active = true;
        this.walletContainer.active = true;
    },
    showHistory() {
        Cache.playSfx();
        this.replayContainer.active = true;
        this.replayTopContainer.active = true;
        this.walletTopContainer.active = false;
        this.walletContainer.active = false;
    },


    downloadData(page) {
        this.recordContent.removeAllChildren();
        this.walletNoData.active = false;

        Connector.request(GameConfig.ServerEventName.UserHistoryLogs, { type: this.typeArr, days: 7, page, pageSize: 10 }, (data) => {
            if (data.logs && data.logs.rows && data.logs.rows.length > 0) {
                this.pageContainer.active = true;

                this.totalPage = Math.ceil(data.logs.count / 10);
                this.page = data.logs.page;
                this.lblPage.string = data.logs.page + '/' + Math.ceil(data.logs.count / 10);
                data.logs.rows.forEach(e => {
                    let recordItem = cc.instantiate(this.recordItem);
                    recordItem.getComponent('HistoryRecordItem').renderUI(e);
                    this.recordContent.addChild(recordItem);
                });
            } else {
                //暂无数据
                this.walletNoData.active = true;
                this.pageContainer.active = false;
            }
            // logs:
            // count: 12
            // page: 1
            // rows: (10) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
        })
    },

    showTagContainer() {
        Cache.playSfx();
        this.tagContainer.active = true;

    },

    onClickSearch() {
        Cache.playSfx();
        this.tagContainer.active = false;
        this.downloadData(1);
    },

    addTag(e) {
        e.data.forEach(element => {

            let index = this.typeArr.findIndex(a => a == element);
            if (index == -1)
                this.typeArr.push(element);
        });
    },
    removeTag(e) {
        e.data.forEach(element => {
            let index = this.typeArr.findIndex(a => a == element);
            if (index != -1)
                this.typeArr.splice(index, 1);
        });
    },


    addPage() {
        Cache.playSfx();
        if (this.page >= this.totalPage) {
            Cache.alertTip('已经是最后一页');
            return;
        }
        let a = this.page + 1;
        this.downloadData(a);
    },
    reducePage() {
        Cache.playSfx();
        if (this.page == 1) {
            Cache.alertTip('已经是第一页');
            return;
        }
        let a = this.page - 1;

        this.downloadData(a);
    },




    searchByDate() {
        this.noData.active = false;
        this.layerContent.destroyAllChildren();
        // let res = this.judgeDate();
        // if (!res.canSearch) return

        Connector.request(GameConfig.ServerEventName.ClubLogs, { clubID:App.Club.CurrentClubID,userID: db.player.id  }, (data) => {
            // {
            //     "success": true,
            //     "status": 0,
            //     "message": null,
            //     "detail": null,
            //     "version": "1.0.1",
            //     "logs": {
            //         "count": 1,
            //         "rows": [
            //             {
            //                 "id": 10000001,
            //                 "players": "98961940,25392518",
            //                 "parents": ",",
            //                 "tableID": 811795,
            //                 "gameType": "HNMJ",
            //                 "fileID": "HNMJ_811795_HNGB7AD2",
            //                 "data": {
            //                     "details": [
            //                         [
            //                             1200,
            //                             -1200
            //                         ],
            //                         [
            //                             130,
            //                             -130
            //                         ]
            //                     ],
            //                     "players": [
            //                         {
            //                             "prop": {
            //                                 "pid": 98961940,
            //                                 "sex": "male",
            //                                 "head": null,
            //                                 "name": "游客98961940",
            //                                 "parent": 98961940,
            //                                 "cluster": [
            //                                     98961940
            //                                 ]
            //                             },
            //                             "score": 1330
            //                         },
            //                         {
            //                             "prop": {
            //                                 "pid": 25392518,
            //                                 "sex": "male",
            //                                 "head": null,
            //                                 "name": "游客25392518",
            //                                 "parent": 98961940,
            //                                 "cluster": [
            //                                     98961940
            //                                 ]
            //                             },
            //                             "score": -1330
            //                         }
            //                     ]
            //                 },
            //                 "strDate": "20211206",
            //                 "createdAt": "2021-12-06T15:55:14.000Z",
            //                 "updatedAt": "2021-12-06T15:55:14.000Z"
            //             }
            //         ]
            //     }
            // }
            return;
            if (!data.history || data.history.length == 0) {
                this.noData.active = true;
                return;
            }
            this.historyData = data.history;
            data.history.forEach((record, idx) => {
                let nodeHisItem = cc.instantiate(this.preHistoryItem);
                nodeHisItem.parent = this.layerContent;
                let hisItem = nodeHisItem.getComponent("ModuleHistoryDetailItem");
                hisItem.init(record);
            });
        });
    },


    exitHistory() {
        Cache.playSfx();
        this.removeEvents();
        this.node.destroy();
    },

    judgeDate() {

        // let startDateNum = new Date(this.startDate.string).getTime();
        // let endDateNum = new Date(this.endDate.string).getTime();

        // let date = new Date();
        // let nowDate = date.getTime();
        // let year = date.getFullYear();
        // let month = date.getMonth() + 1;
        // let day = date.getDate();
        // if (month < 10) {
        //     month = "0" + month;
        // }
        // if (day < 10) {
        //     day = "0" + day;
        // }
        // let nowYMD = year + "" + month + day
        // let startDate = this.startDate.string.replace(/-/g, "");
        // let endDate = this.endDate.string.replace(/-/g, "");

        // let augTime = new Date("2020-08-01").getTime();

        // if (augTime >= startDateNum) {
        //     startDate = "20200801";
        //     this.startDate.string = "2020-08-01";
        // }
        // if (augTime >= endDateNum) {
        //     endDate = "20200801";
        //     this.endDate.string = "2020-08-01";
        // }

        // if (parseInt(endDate) < parseInt(startDate)) {
        //     Cache.alertTip("日期错误");

        //     return { canSearch: false, end: endDate, start: startDate };
        // }
        // if (parseInt(endDate) > parseInt(nowYMD)) {
        //     Cache.alertTip("结束日期不能超过今日");
        //     return { canSearch: false, end: endDate, start: startDate };
        // }
        // if (startDateNum <= (nowDate - 31 * 24 * 60 * 60 * 1000)) {
        //     Cache.alertTip("只能查询最近30天的战绩");
        //     return { canSearch: false, end: endDate, start: startDate };
        // }

        // return { canSearch: true, end: endDate, start: startDate };
    },


    seachHistoryById() {

        Cache.playSfx();
        // data.logFlag+"/"+data.gameType+"/"+data.serialID;
        let strArr = this.searchBox.string.split("/")
        if (strArr.length < 3) {
            Cache.alertTip("信息格式不对");
            return;
        }

        let gameid = "";
        switch (strArr[1]) {
            case "PDK":
            case "PDK_SOLO":
            case "PDK_SOLO_CLAN":
                gameid = "07";
                break;
            case "XHZP":
            case "XHZP_SOLO":
            case "XHZP_SOLO_CLAN":
                gameid = "08";
                break;
            case "LDZP":
            case "LDZP_SOLO":
            case "LDZP_SOLO_CLAN":
                gameid = "08";
                break;
            case "XHZD":
            case "XHZD_CLAN":
                gameid = "09";
                break;
            default:
                this.gameType.string = "";
                gameid = "";
                break;
        };
        GameConfig.CurrentReplayData = this.searchBox.string;
        Connector.get(`${GameConfig.GameInfo.replayURL}/${strArr[0]}/${strArr[1]}_${strArr[2]}.json`, "getJson", (resData) => {
        // Connector.get(`http://xh.kejiaoxy.com/records/20210830/XHZD_SKvo0X6b.json`, "getJson", (resData) => {
            Cache.replayTime = "";
            Cache.turn = "";
            Cache.replayData = resData;
            if (resData == null) {
                Cache.alertTip("暂无回放");
                return;
            }
            if (gameid == "") {
                Cache.alertTip("信息错误，无法播放");
                return
            }
            cc.loader.loadRes(`Main/Prefab/replay${gameid}`, (err, prefab) => {
                if (!err) {
                    let nodeReplay = cc.instantiate(prefab);
                    nodeReplay.parent = cc.find('Canvas');
                    if (gameid == "08")
                        nodeReplay.getComponent("ModuleReplay" + gameid).initData(strArr[1]);
                } else {
                    cc.log('error to load replay');
                }
            });

        });

    },
    resetSearch() {
        Cache.playSfx();
        this.searchByDate()
    }

});