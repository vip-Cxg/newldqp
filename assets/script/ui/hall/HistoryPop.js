// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { GameConfig } = require("../../../GameBase/GameConfig");
const Connector = require("../../../Main/NetWork/Connector");
const Cache = require("../../../Main/Script/Cache");
const { App } = require("./data/App");

cc.Class({
    extends: cc.Component,

    properties: {
        pageContainer: cc.Node,
        tagContainer: cc.Node,
        tagContent: cc.Node,
        tagPrefab: cc.Prefab,
        recordContent: cc.Node,
        recordItem: cc.Prefab,
        noData:cc.Node,
        lblPage:cc.Label,
        lblUserid:cc.EditBox,
        typeArr: [],
        page: 1,
        totalPage: 0,
        renderData: null
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.SELECT_TAG_HISTORY, this.addTag, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, this.removeTag, this);
    },
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.SELECT_TAG_HISTORY, this.addTag, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, this.removeTag, this);

    },
    start() {
        this.typeArr=[];
        this.renderData = {
            page: [],
            data: []
        }
        this.addEvents();
        this.tagContent.removeAllChildren();
        let tagData = GameConfig.GameInfo.logsConfig;
        for (let key in tagData) {
            let tagBtn = cc.instantiate(this.tagPrefab);
            tagBtn.getComponent('HistoryTagItem').renderUI(key, tagData[key])
            this.tagContent.addChild(tagBtn);
        }
    },

    downloadData(page) {   
        if(this.lblUserid.string=="") {
            Cache.alertTip('请输入玩家id')
            return;
        }

        this.recordContent.removeAllChildren();
        this.noData.active=false;
        
        Connector.request(GameConfig.ServerEventName.AdminHistoryLogs, { id:this.lblUserid.string,type: this.typeArr, days: 7, page, pageSize: 10 }, (data) => {
            if (data.logs && data.logs.rows && data.logs.rows.length > 0) {
                this.pageContainer.active=true;

                this.totalPage=Math.ceil(data.logs.count / 10);
                this.page = data.logs.page;
                this.lblPage.string = data.logs.page + '/' + Math.ceil(data.logs.count / 10);
                data.logs.rows.forEach(e => {
                    let recordItem = cc.instantiate(this.recordItem);
                    recordItem.getComponent('HistoryRecordItem').renderUI(e);
                    this.recordContent.addChild(recordItem);
                });
            } else {
                //暂无数据
                this.noData.active=true;
                this.pageContainer.active=false;
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

    onClickClose() {
        Cache.playSfx();
        this.removeEvents();
        this.node.destroy();
    }

    // update (dt) {},
});
