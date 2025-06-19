import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator
@ccclass
export default class ChildUserListPop extends cc.Component {




    @property(cc.Node)
    userContainer = null;
    @property(cc.Node)
    userContent = null;
    @property(cc.Prefab)
    userItem = null;

    @property(cc.Node)
    clubContainer = null;
    @property(cc.Node)
    clubContent = null;
    @property(cc.Prefab)
    clubItem = null;


    @property(cc.Node)
    pageContainer = null;
    @property(cc.Label)
    lblTotalCount = null;
    @property(cc.Label)
    lblPage = null;
    page = 1;
    totalPage = 0;
    renderData = null;
    currentFun = null;
    currentListType = 'club';
    onLoad() {
        this.addEvents();
        this.onShowClub(1);

    }
    addEvents() {

    }
    removeEvents() {
    }


    renderClub(page) {
        this.clubContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let clubItem = cc.instantiate(this.clubItem);
                clubItem.getComponent('AdminClubItem').initData(e);
                this.clubContent.addChild(clubItem);
            });
            return;
        }
        // condition
        this.downloadClubList(page);
    }
    downloadClubList(page, searchID = null) {
        this.clubContent.removeAllChildren();
        let reqData = searchID ? { clubID: searchID, page: page, pageSize: 5 } : { page: page, pageSize: 5 };

        Connector.request(GameConfig.ServerEventName.AdminClubList, reqData, (res) => {
            if (!GameUtils.isNullOrEmpty(res.rows)) {
                if (this.renderData.page.indexOf(page) == -1)
                    this.renderData.page.push(page);
                this.renderData.rows['' + page] = [];
                this.renderData.rows['' + page] = res.rows;
                this.pageContainer.active = true;
                this.page = page;
                this.totalPage = Math.ceil(res.count / 5);
                this.lblPage.string = page + '/' + Math.ceil(res.count / 5);
                this.lblTotalCount.string = '总数: ' + res.count;
                res.rows.forEach(e => {
                    let clubItem = cc.instantiate(this.clubItem);
                    clubItem.getComponent('AdminClubItem').initData(e);
                    this.clubContent.addChild(clubItem);
                });
            }


        })
    }

    renderUser(page) {
        this.userContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let userItem = cc.instantiate(this.userItem);
                userItem.getComponent('AdminUserItem').initData(e);
                this.userContent.addChild(userItem);
            });
            return;
        }
        // condition
        this.downloadUserList(page);
    }
    downloadUserList(page, searchID = null) {
        this.userContent.removeAllChildren();
        let reqData = searchID ? { userID: searchID, page: page, pageSize: 5 } : { page: page, pageSize: 5 };
        Connector.request(GameConfig.ServerEventName.AdminUserList, reqData, (res) => {
            if (!GameUtils.isNullOrEmpty(res.rows)) {
                if (this.renderData.page.indexOf(page) == -1)
                    this.renderData.page.push(page);
                this.renderData.rows['' + page] = [];
                this.renderData.rows['' + page] = res.rows;
                this.pageContainer.active = true;
                this.page = page;
                this.totalPage = Math.ceil(res.count / 5);
                this.lblPage.string = page + '/' + Math.ceil(res.count / 5);
                this.lblTotalCount.string = '总人数: ' + res.count;
                res.rows.forEach(e => {
                    let userItem = cc.instantiate(this.userItem);
                    userItem.getComponent('AdminUserItem').initData(e);
                    this.userContent.addChild(userItem);
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
    onShowClub() {
        Cache.playSfx();
        this.renderData = {
            page: [],
            rows: {}
        }
        this.userContainer.active = false;
        this.clubContainer.active = true;
        this.renderClub(1);
        this.currentListType='club';
        this.currentFun = this.renderClub;
    }
    onShowUser() {
        Cache.playSfx();
        this.renderData = {
            page: [],
            rows: {}
        }
        this.userContainer.active = true;
        this.clubContainer.active = false;
        this.renderUser(1);
        this.currentListType='user';
        this.currentFun = this.renderUser;
    }
   
    onSearch() {
        Cache.playSfx();
        Cache.showNumer('输入查询ID',GameConfig.NumberType.INT, (searchID) => {
            this.onSearchRes(searchID);
        })

    }
    onSearchRes(searchID) {
        this.pageContainer.active = false;
        this.renderData = {
            page: [],
            rows: {}
        }
        if (this.currentListType == 'club') {
            this.downloadClubList(1, searchID);
        } else {
            this.downloadUserList(1, searchID);
        }
    }
    createLeague(){
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.CreateClubPop,(node)=>{
            node.getComponent('CreateClubPop').renderLeague();
        });
        
    }
    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


