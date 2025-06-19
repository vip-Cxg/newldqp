import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator
@ccclass
export default class ChildUserListPop extends cc.Component {

    @property(cc.Label)
    lblTotalCount = null;
    @property(cc.Label)
    lblPage = null;

    @property(cc.Label)
    lblTotalTurn = null;
    @property(cc.Label)
    lblTotalFee = null;
    @property(cc.Label)
    lblTotalPage = null;

    @property(cc.EditBox)
    lblGoPage = null;

    @property(cc.Label)
    turnTips = null;
    @property(cc.Label)
    scoreTips = null;

    @property(cc.Node)
    pageContainer = null;
    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    userItem = null;



    page = 1;
    totalPage = 0;
    selfUserID = 0;


    pageSize = 4;

    searchUser = '';


    isYesToday = 0
    onLoad() {

        this.addEvents();
        this.renderUI(1);

    }
    addEvents() {

    }
    removeEvents() {
    }

    onSearchToday() {
        this.isYesToday = 0;
        this.renderUI(1);
    }
    onSearchYestoday() {
        this.isYesToday = 1;
        this.renderUI(1);
    }
    renderUI(page) {
        this.itemContent.removeAllChildren();
        this.downloadList(page);
    }
    downloadList(page, userid = '') {
        if (userid == '')
            userid = this.searchUser;

        this.itemContent.removeAllChildren();
        this.searchUser = userid;

        this.turnTips.string = this.isYesToday == 0 ? '今日局数' : '昨日局数';
        this.scoreTips.string = this.isYesToday == 0 ? '今日输赢' : '昨日输赢';
        Connector.request(GameConfig.ServerEventName.UserScore, { clubID: App.Club.CurrentClubID, isYesToday: this.isYesToday, page: page, pageSize: this.pageSize, keywords: userid }, (res) => {
            if (res.users && !GameUtils.isNullOrEmpty(res.users.rows)) {

                this.pageContainer.active = true;
                this.page = page;
                this.totalPage = Math.ceil(res.users.count / this.pageSize);
                this.lblPage.string = page + '/' + Math.ceil(res.users.count / this.pageSize);
                this.lblTotalCount.string = '总人数: ' + res.users.count;
                this.lblTotalTurn.string = '' + (res.users.sumData?.turn || 0);
                this.lblTotalFee.string = '' + (GameUtils.formatGold(res.users.sumData?.score) || 0);
                this.lblTotalPage.string = '共 ' + this.totalPage + ' 页';
                this.lblGoPage.string = page;

                res.users.rows.forEach(e => {
                    let userItem = cc.instantiate(this.userItem);
                    userItem.getComponent('ChildScoreItem').initData(e, this.selfUserID == DataBase.player.id);
                    this.itemContent.addChild(userItem);
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
        this.renderUI(a);
    }

    goPage() {
        let idx = this.lblGoPage.string
        if (idx > this.totalPage || idx < 1) {
            Cache.alertTip('输入有误');
            return;
        }
        this.renderUI(idx);
    }

    reducePage() {
        Cache.playSfx();
        if (this.page == 1) {
            Cache.alertTip('已经是第一页');
            return;
        }
        let a = this.page - 1;

        this.renderUI(a);
    }





    onSearch() {
        Cache.playSfx();
        Cache.showNumer('输入玩家ID', GameConfig.NumberType.INT, (userID) => {
            this.downloadList(1, userID);
        })

    }

    onSearchRes(userid) {
        this.itemContent.removeAllChildren();
        this.pageContainer.active = false;
        // condition
        Connector.request(GameConfig.ServerEventName.UserList, { clubID: App.Club.CurrentClubID, userID: this.selfUserID, keywords: userid }, (res) => {
            if (res.users && !GameUtils.isNullOrEmpty(res.users.rows)) {
                this.lblTotalCount.string = '总人数: ' + res.users.count;
                res.users.rows.forEach(e => {
                    let userItem = cc.instantiate(this.userItem);
                    userItem.getComponent('ChildUserItem').initData(e, this.selfUserID == DataBase.player.id);
                    this.itemContent.addChild(userItem);
                });
            }

        })
    }


    selectUsersTotal() {
        Cache.playSfx();
        Cache.showNumer('输入玩家ID', GameConfig.NumberType.INT, (userID) => {
            this.openDetail(userID);
        })
    }



    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}