import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../../script/common/GameUtils";
const GAME_TYPE = {
    ALL: 'ALL',
    PDK: 'PDK_SOLO',
    LDZP: 'LDZP_SOLO',
    XHZD: 'XHZD',
    HZMJ: 'HZMJ_SOLO'
}
const { ccclass, property } = cc._decorator
@ccclass
export default class ProxyCreditHistoryItem extends cc.Component {




    @property(cc.Label)
    lblEndDate = null;
    @property(cc.Label)
    lblStartDate = null;

    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    detailItem = null;
    @property(cc.Prefab)
    selectDate = null;

    @property(cc.Node)
    pageContainer = null;
    @property(cc.Label)
    lblPage = null;
    @property(cc.Node)
    noData = null;

    userId = 0;
    gameType = GAME_TYPE.ALL;
    startDate = null;
    endDate = null;
    page = 1;
    totalPage = 0;
    renderData = null
    onLoad() {
        this.renderData = {
            page: [],
            rows: {}

        }
        // this.userId = id;
        this.gameType = GAME_TYPE.ALL;
        let timeDate = new Date();
        let year = timeDate.getFullYear();
        let month = (timeDate.getMonth() + 1) >= 10 ? (timeDate.getMonth() + 1) : '0' + (timeDate.getMonth() + 1);
        let day = timeDate.getDate() >= 10 ? timeDate.getDate() : '0' + timeDate.getDate();

        this.startDate = '' + year + month + day
        this.endDate = '' + year + month + day;
        this.lblEndDate.string = '截止日期: ' + year + '年' + month + '月' + day + '日';
        this.lblStartDate.string = '起始日期: ' + year + '年' + month + '月' + day + '日';
        this.downloadData(1)
    }
    downloadData(page) {
        this.noData.active = false;
        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.itemContent.removeAllChildren();
            this.lblPage.string = this.page + '/' + this.totalPage;

            this.renderData.rows['' + page].forEach(e => {
                let detailItem = cc.instantiate(this.detailItem);
                detailItem.getChildByName('content').getChildByName('id').getComponent(cc.Label).string = e.userID;
                detailItem.getChildByName('content').getChildByName('amount').getComponent(cc.Label).string = e.count;
                detailItem.getChildByName('content').getChildByName('reward').getComponent(cc.Label).string = (parseInt(e.fee) / 100).toFixed(2);
                detailItem.getChildByName('content').getChildByName('name').getComponent(cc.Label).string = GameUtils.getStringByLength(e.name,5);
                // historyItem.getComponent('ModuleHistoryDetailItem').init(e);
                this.itemContent.addChild(detailItem);
            });
            return;
        }
        let confirmData = this.gameType == "ALL" ? { startDate: this.startDate, endDate: this.endDate, page: page, limit: 8 } : { startDate: this.startDate, endDate: this.endDate, gameType: this.gameType, page: page, limit: 8 };
        Connector.request(GameConfig.ServerEventName.ProxyProfitDetail, confirmData, (res) => {
            this.itemContent.removeAllChildren();
            if (res.result && !GameUtils.isNullOrEmpty(res.result.rows)) {
                this.renderData.page.push(res.result.page);
                this.renderData.rows['' + res.result.page] = res.result.rows;
                this.pageContainer.active = true;
                this.page = res.result.page;
                this.totalPage = Math.ceil(res.result.count / 8);
                this.lblPage.string = res.result.page + '/' + Math.ceil(res.result.count / 8);
                // this.itemContent.removeAllChildren();
                res.result.rows.forEach(e => {
                    let detailItem = cc.instantiate(this.detailItem);
                    detailItem.getChildByName('content').getChildByName('id').getComponent(cc.Label).string = e.userID;
                    detailItem.getChildByName('content').getChildByName('amount').getComponent(cc.Label).string = e.count;
                    detailItem.getChildByName('content').getChildByName('reward').getComponent(cc.Label).string = (parseInt(e.fee) / 100).toFixed(2);
                    detailItem.getChildByName('content').getChildByName('name').getComponent(cc.Label).string = GameUtils.getStringByLength(e.name,5);

                    // detailItem.getComponent('ModuleHistoryDetailItem').init(e);
                    this.itemContent.addChild(detailItem);
                });
            } else {
                this.noData.active = true;
                this.pageContainer.active = false;
            }
        },true)
    }
    selectGameType(e, v) {
        this.gameType = v;
        this.renderData = {
            page: [],
            rows: {}
        }
        this.downloadData(1);
    }
    addPage() {
        Cache.playSfx();
        if (this.page >= this.totalPage) {
            Cache.alertTip('已经是最后一页');
            return;
        }
        let a = this.page + 1;
        this.downloadData(a);
    }
    reducePage() {
        Cache.playSfx();
        if (this.page == 1) {
            Cache.alertTip('已经是第一页');
            return;
        }
        let a = this.page - 1;

        this.downloadData(a);
    }
    openSelectDate(e, v) {
        let node = cc.instantiate(this.selectDate);
        this.node.addChild(node);
        let datePicker = node.getComponent("UIDatePicker");
        datePicker.setDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        datePicker.setPickDateCallback((year, month, day) => {
            month = (month + 1) > 9 ? (month + 1) : '0' + (month + 1);
            day = day  > 9 ? day : '0' + day;
            if (v == 1) {
                this.startDate = "" + year + month + day;
                this.lblStartDate.string = '起始日期: ' + year + '年' + month + '月' + day + '日';
            } else {
                this.endDate = "" + year + month + day;
                this.lblEndDate.string = '截止日期: ' + year + '年' + month + '月' + day + '日';
            }
            console.log("" + year + month + day)
        });
    }
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
    onClickClose() {
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
}




