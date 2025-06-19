import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import DataBase from "../../../Main/Script/DataBase";
import Connector from "../../../Main/NetWork/Connector";
import { Social } from "../../../Main/Script/native-extend";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubBankPop extends cc.Component {
    @property(cc.Label)
    tips1 = null;
    @property(cc.Label)
    tips2 = null;
    @property(cc.Label)
    tips3 = null;

    @property(cc.Label)
    scoreInput = null;
    @property(cc.Label)
    bankInput = null;
    @property(cc.Node)
    bankNode = null;
    @property(cc.Node)
    listNode = null;
    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    listItem = null;


    @property(cc.Label)
    lblPage = null;

    @property(cc.Node)
    pageContainer = null;

    page = 1;
    totalPage = 0;
    renderData = null;
    currentFun = null;

    listShow = false
    totalShow = false


    onLoad() {
        this.addEvents();
        this.renderBank()
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.renderBank, this);
    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.renderBank, this);

    }
    showBankNode(bool) {
        this.bankNode.active = bool;
        this.listNode.active = !bool;

    }

    showB(){
        this.bankNode.active = true;
        this.listNode.active = false;
    }

    renderBank() {
        this.scoreInput.string = GameUtils.formatGold(App.Club.ClubScore);
        this.bankInput.string = GameUtils.formatGold(App.Club.ClubBank);
        // this.showBankNode(true);
        if( this.totalShow || this.listShow){
            return
        }else{
            this.totalShow = false
            this.listShow = false
            this.showBankNode(true);
        }
    }

    showList() {
        Cache.playSfx();
        this.renderData = {
            page: [],
            rows: {}
        }
        this.page = 1;
        this.pageContainer.active = false;
        this.currentFun = this.renderList;
        this.showBankNode(false);

        this.totalShow = false
        this.listShow = true
        this.renderList(1)

    }

    renderList(page) {
        this.tips1.string = '时间';
        this.tips2.string = '事件';
        this.tips3.string = '剩余';
        this.itemContent.removeAllChildren();
        let self=this;

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let item = cc.instantiate(this.listItem);
                item.getChildByName('time').getComponent(cc.Label).string = new Date(e.createdAt).format("yyyy-MM-dd hh:mm:ss");
                item.getChildByName('event').getComponent(cc.Label).string = e.event;
                item.getChildByName('score').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.remainScore) + (e.remainBank == 0 ? '' : '(' + GameUtils.formatGold(e.remainBank) + ')');
                this.itemContent.addChild(item);
            });
            return;
        }
        Connector.request(GameConfig.ServerEventName.UserScoreLog, { clubID: App.Club.CurrentClubID, userID: DataBase.player.id, page: page, pageSize: 10 }, (res) => {
            // Connector.request(GameConfig.ServerEventName.BankLog, { clubID: App.Club.CurrentClubID, userID: DataBase.player.id, page: page, pageSize: 10 }, (res) => {
            if (res.log && !GameUtils.isNullOrEmpty(res.log.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.log.rows;
                this.pageContainer.active = true;
                this.page = page;
                this.totalPage = Math.ceil(res.log.count / 10);
                this.lblPage.string = page + '/' + Math.ceil(res.log.count / 10);
                res.log.rows.forEach((e) => {
                    let item = cc.instantiate(this.listItem);
                    item.getChildByName('time').getComponent(cc.Label).string = new Date(e.createdAt).format("yyyy-MM-dd hh:mm:ss");
                    item.getChildByName('event').getComponent(cc.Label).string = e.event;
                    item.on(cc.Node.EventType.TOUCH_END,()=>{
                        Cache.showTipsMsg(e.remarks||"暂无详细信息");
                        Social.setCopy(e.remarks||"暂无详细信息");
                        Cache.alertTip("已复制到粘贴板")
                    },self);

                    item.getChildByName('score').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.remainScore) + (e.remainBank == 0 ? '' : '(' + GameUtils.formatGold(e.remainBank) + ')');
                    this.itemContent.addChild(item);
                });
            }
        })


    }



    showTotal() {
        Cache.playSfx();
        this.renderData = {
            page: [],
            rows: {}
        }
        this.page = 1;
        this.pageContainer.active = false;
        this.currentFun = this.renderTotal;
        this.showBankNode(false);
        this.renderTotal(1)

        this.totalShow = true
        this.listShow = false
    }

    renderTotal(page) {
        this.tips1.string = '时间';
        this.tips2.string = '总增加';
        this.tips3.string = '总减少';


        this.itemContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let item = cc.instantiate(this.listItem);
                item.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                item.getChildByName('event').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.inc);
                item.getChildByName('score').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.dec);
                this.itemContent.addChild(item);
            });
            return;
        }
        Connector.request(GameConfig.ServerEventName.ScoreSummary, { clubID: App.Club.CurrentClubID, userID: DataBase.player.id, page: page, pageSize: 8 }, (res) => {
            if (res.logs && !GameUtils.isNullOrEmpty(res.logs.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.logs.rows;
                this.pageContainer.active = true;
                this.page = page;
                let count = typeof (res.logs.count) == 'number' ? res.logs.count : res.logs.count.length;
                this.totalPage = Math.ceil(count / 10);
                this.lblPage.string = page + '/' + Math.ceil(count / 10);
                res.logs.rows.forEach((e) => {
                    let item = cc.instantiate(this.listItem);
                    item.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                    item.getChildByName('event').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.inc);
                    item.getChildByName('score').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.dec);
                    this.itemContent.addChild(item);
                });
            }
        })
    }

    addPage() {
        Cache.playSfx();
        if (this.page >= this.totalPage) {
            Cache.alertTip('已经是最后一页');
            return;
        }
        let a = this.page + 1;
        this.currentFun(a);
    }
    reducePage() {
        Cache.playSfx();
        if (this.page == 1) {
            Cache.alertTip('已经是第一页');
            return;
        }
        let a = this.page - 1;

        this.currentFun(a);
    }



    onClickSave() {
        Cache.playSfx();
        Cache.showNumer('存储体力', GameConfig.NumberType.FLOAT, (count) => {
            this.onUpdateBank(parseFloat('-' + count).toFixed(2))
        })
    }
    onClickAllSave() {
        Cache.playSfx();
        this.onUpdateBank(GameUtils.formatGold('-' + (App.Club.ClubScore)))


    }
    onClickGet() {
        Cache.playSfx();
        Cache.showNumer('提取体力', GameConfig.NumberType.FLOAT, (count) => {
            this.onUpdateBank(count)
        })

    }
    onClickAllGet() {
        Cache.playSfx();
        this.onUpdateBank(GameUtils.formatGold(App.Club.ClubBank))

    }
    onUpdateBank(amount) {
        if (amount == 0) {
            Cache.alertTip('请输入正确数据')
            return;
        }
        Connector.request(GameConfig.ServerEventName.UpdateClubBank, { score: parseInt(amount * 100), userID: DataBase.player.id, clubID: App.Club.CurrentClubID }, (data) => {
            Cache.alertTip('修改成功');
            App.Club.ClubBank = data.bank;
            App.Club.ClubScore = data.score;
        })

    }


    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


