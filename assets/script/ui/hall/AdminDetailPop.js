import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import Avatar from "../common/Avatar";

const { ccclass, property } = cc._decorator
@ccclass
export default class AdminDetailPop extends cc.Component {


    @property(Avatar)
    avatar = null;
    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblId = null;
    @property(cc.Label)
    lblCount = null;
    @property(cc.Label)
    lblCost = null;
    @property(cc.Label)
    lblCreatedAt = null;
    @property(cc.Label)
    lblUpdatedAt = null;

    @property(cc.Label)
    tips1 = null;
    @property(cc.Label)
    tips2 = null;
    @property(cc.Label)
    tips3 = null;


    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    listItem = null;

    @property(cc.Node)
    pageContainer = null;
    @property(cc.Label)
    lblPage = null;
    page = 1;
    totalPage = 0;
    renderData = null;

    currentData = null;

    addEvents() {
        // App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.updateScore, this);
    }
    removeEvents() {
        // App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.updateScore, this);
    }
    renderClub(data) {
        this.renderData = {
            page: [],
            rows: {}
        }
        this.tips1.string = '日期';
        this.tips2.string = '局数';
        this.tips3.node.active = false;

        this.currentData = data;


        this.lblCreatedAt.string = '总人数: ' + data.persons;
        // this.lblUpdatedAt.string='创建时间: '+new Date(data.club.createdAt).format("yyyy-MM-dd hh:mm:ss");

        this.downloadClubList(1);
        this.currentFun = this.downloadClubList;
    }

    downloadClubList(page) {
        this.itemContent.removeAllChildren();
        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let listItem = cc.instantiate(this.listItem);
                listItem.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                listItem.getChildByName('turn').getComponent(cc.Label).string = e.turn;
                listItem.getChildByName('count').active = false;
                this.itemContent.addChild(listItem);
            });
            return;
        }
        Connector.request(GameConfig.ServerEventName.AdminClubInfo, { clubID: this.currentData.id, page: page, pageSize: 8 }, (res) => {
            this.avatar.avatarUrl = res.club.user.head;
            this.lblName.string = '会长名: ' + res.club.user.name;
            this.lblId.string = '会长ID: ' + res.club.user.id;
            this.lblCount.string = '公会名: ' + res.club.name;
            this.lblCost.string = '公会ID: ' + res.club.id;

            this.lblUpdatedAt.string = '总局数: ' + res.total;

            if (!GameUtils.isNullOrEmpty(res.rows)) {
                if (this.renderData.page.indexOf(page) == -1)
                    this.renderData.page.push(page);
                this.renderData.rows['' + page] = [];
                this.renderData.rows['' + page] = res.rows;
                this.pageContainer.active = true;
                this.page = page;
                this.totalPage = Math.ceil(res.count / 8);
                this.lblPage.string = page + '/' + Math.ceil(res.count / 8);
                res.rows.forEach(e => {
                    let listItem = cc.instantiate(this.listItem);
                    listItem.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                    listItem.getChildByName('turn').getComponent(cc.Label).string = e.turn;
                    listItem.getChildByName('count').active = false;
                    this.itemContent.addChild(listItem);
                });
            }

        })
    }
    renderUser(data) {
        this.renderData = {
            page: [],
            rows: {}
        }
        this.tips1.string = '日期';
        this.tips2.string = '消耗';
        this.tips3.string = '充值';

        this.currentData = data;
        this.avatar.avatarUrl = data.head;
        this.lblName.string = '玩家名: ' + data.name;
        this.lblId.string = '玩家ID: ' + data.id;
        this.lblCount.string = '金币: ' + GameUtils.formatGold(data.wallet);
        this.downloadUserList(1);
        this.currentFun = this.downloadUserList;


    }
    downloadUserList(page) {
        this.itemContent.removeAllChildren();
        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let listItem = cc.instantiate(this.listItem);
                listItem.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                listItem.getChildByName('turn').getComponent(cc.Label).string = GameUtils.formatGold(e.dec);
                listItem.getChildByName('count').getComponent(cc.Label).string = GameUtils.formatGold(e.inc);
                this.itemContent.addChild(listItem);
            });
            return;
        }
        Connector.request(GameConfig.ServerEventName.AdminUserInfo, { userID: this.currentData.id, page: page, pageSize: 8 }, (res) => {
            this.lblCost.string = '总消耗: ' + GameUtils.formatGold(res.total);

        this.lblCreatedAt.string='创建时间:'+new Date(res.user.createdAt).format("yyyy-MM-dd hh:mm:ss");
        this.lblUpdatedAt.string='更新时间:'+new Date(res.user.updatedAt).format("yyyy-MM-dd hh:mm:ss");

            if (!GameUtils.isNullOrEmpty(res.rows)) {
                if (this.renderData.page.indexOf(page) == -1)
                    this.renderData.page.push(page);
                this.renderData.rows['' + page] = [];
                this.renderData.rows['' + page] = res.rows;
                this.pageContainer.active = true;
                this.page = page;
                this.totalPage = Math.ceil(res.count / 8);
                this.lblPage.string = page + '/' + Math.ceil(res.count / 8);
                res.rows.forEach(e => {
                    let listItem = cc.instantiate(this.listItem);
                    listItem.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                    listItem.getChildByName('turn').getComponent(cc.Label).string = GameUtils.formatGold(e.dec);
                    listItem.getChildByName('count').getComponent(cc.Label).string = GameUtils.formatGold(e.inc);
                    this.itemContent.addChild(listItem);
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
    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }

    onDestroy() {
        this.removeEvents()
    }


}


