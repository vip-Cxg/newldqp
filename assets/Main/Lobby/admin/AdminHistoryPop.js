// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { GameConfig } = require('../../../GameBase/GameConfig');
const Connector = require('../../NetWork/Connector');
const Cache = require('../../Script/Cache');
const utils = require('../../Script/utils');
const GAME_TYPE = {
    ALL: 'ALL',
    PDK: 'PDK_SOLO',
    LDZP: 'LDZP_SOLO',
    XHZD: 'XHZD',
    HZMJ: 'HZMJ_SOLO'
}
cc.Class({
    extends: require('../../Script/PopBase'),

    properties: {
        historyContainer: cc.Node,
        historyItem: cc.Prefab,
        lblPage: cc.Label,
        pageContainer: cc.Node,
        lblStartDate: cc.Label,
        lblEndDate: cc.Label,
        selectDate: cc.Prefab,
        noData: cc.Node,
        userId: 0,
        gameType: GAME_TYPE.ALL,
        startDate: null,
        endDate: null,
        page: 1,
        totalPage: 0,
        renderData: null
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    initData(id) {
        this.renderData = {
            page: [],
            rows: {}

        }
        this.userId = id;
        this.gameType = GAME_TYPE.ALL;
        let timeDate = new Date();
        let year = timeDate.getFullYear();
        let month = (timeDate.getMonth() + 1) >= 10 ? (timeDate.getMonth() + 1) : '0' + (timeDate.getMonth() + 1);
        let day = timeDate.getDate() >= 10 ? timeDate.getDate() : '0' + timeDate.getDate();

        this.startDate = '' + year + month + day
        this.endDate = '' + year + month + day;
        this.lblEndDate.string = '截止日期: ' + year + '年' + month + '月' + day + '日';
        this.lblStartDate.string = '起始日期: ' + year + '年' + month + '月' + day + '日';
        this.downloadData(1);
    },

    downloadData(page) {
        this.noData.active = false;
        if(this.renderData.page.indexOf(page)!=-1){
            this.page = page;
            this.historyContainer.removeAllChildren();
            this.lblPage.string =  this.page + '/'+this.totalPage;

            this.renderData.rows[''+page].forEach(e => {
                let historyItem = cc.instantiate(this.historyItem);
                historyItem.getComponent('ModuleHistoryDetailItem').init(e);
                this.historyContainer.addChild(historyItem);
            });
            return;
        }

        Connector.request(GameConfig.ServerEventName.ProxyUserHistory, { id: this.userId, gameType: this.gameType, startDate: this.startDate, endDate: this.endDate, page: page, limit: 10 }, (res) => {
            this.historyContainer.removeAllChildren();
            if (res.logs && !utils.isNullOrEmpty(res.logs.rows)) {
                this.renderData.page.push(res.logs.page);
                this.renderData.rows['' + res.logs.page] = res.logs.rows;
                this.pageContainer.active = true;
                this.page = res.logs.page;
                this.totalPage = Math.ceil(res.logs.count / 10);
                this.lblPage.string = res.logs.page + '/' + Math.ceil(res.logs.count / 10);
                this.historyContainer.removeAllChildren();
                res.logs.rows.forEach(e => {
                    let historyItem = cc.instantiate(this.historyItem);
                    historyItem.getComponent('ModuleHistoryDetailItem').init(e);
                    this.historyContainer.addChild(historyItem);
                });
            } else {
                this.noData.active = true;
                this.pageContainer.active = false;
            }
        })
    },

    selectGameType(e, v) {
        this.gameType = v;
        this.renderData = {
            page: [],
            rows: {}
        }
        this.downloadData(1);
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
    // selectDate(){
    //     // let startDate=this.start

    //     this.downloadData(1);
    // },
    openSelectDate(e, v) {
        let node = cc.instantiate(this.selectDate);
        this.node.addChild(node);
        let datePicker = node.getComponent("UIDatePicker");
        datePicker.setDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        datePicker.setPickDateCallback((year, month, day) => {
            month = (month + 1) > 9 ? (month + 1) : '0' + (month + 1);
            if (v == 1) {
                this.startDate = "" + year + month + day;
                this.lblStartDate.string = '起始日期: ' + year + '年' + month + '月' + day + '日';
            } else {
                this.endDate = "" + year + month + day;
                this.lblEndDate.string = '截止日期: ' + year + '年' + month + '月' + day + '日';
            }
            console.log("" + year + month + day)
        });
    },
    selectByDate() {
        let startDateNum = parseInt(this.startDate);
        let endDateNum = parseInt(this.endDate);
        if (startDateNum > endDateNum) {
            Cache.alertTip('截止日期不能早于起始日期')
            return;
        }
        this.renderData = {
            page: [],
            rows: {}
        }
        this.downloadData(1);

    }
    // update (dt) {},
});
