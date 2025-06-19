import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubUserListPop extends cc.Component {

    @property(cc.Label)
    lblTotalCount = null;
    @property(cc.Label)
    lblPage = null;

    @property(cc.Node)
    pageContainer = null;
    @property(cc.Node)
    inviteBtn = null;
    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    userItem = null;

    page = 1;
    totalPage = 0;
    renderData = null;

    onLoad() {
        this.renderData = {
            page: [],
            rows: {}
        }
        this.addEvents();
        if (App.Club.CurrentClubRole == 'manager') {
            this.inviteBtn.active = false;
        }
        this.renderUI(1);
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.ADD_USER, this.updateList, this);

    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.ADD_USER, this.updateList, this);
    }
    updateList() {
        this.downloadList(this.page);

    }
    renderUI(page) {
        this.itemContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let userItem = cc.instantiate(this.userItem);
                userItem.getComponent('ClubUserItem').initData(e);
                this.itemContent.addChild(userItem);
            });
            return;
        }
        // condition
        this.downloadList(page);
    }
    downloadList(page) {
        this.itemContent.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.UserList, { clubID: App.Club.CurrentClubID, userID: DataBase.player.id, page: page, pageSize: 12,whole:true }, (res) => {
            if (res.users && !GameUtils.isNullOrEmpty(res.users.rows)) {
                if (this.renderData.page.indexOf(page) == -1)
                    this.renderData.page.push(page);
                this.renderData.rows['' + page] = [];
                this.renderData.rows['' + page] = res.users.rows;
                this.pageContainer.active = true;
                this.page = page;
                this.totalPage = Math.ceil(res.users.count / 12);
                this.lblPage.string = page + '/' + Math.ceil(res.users.count / 12);
                this.lblTotalCount.string = '总人数: ' + res.users.count;
                res.users.rows.forEach(e => {
                    let userItem = cc.instantiate(this.userItem);
                    userItem.getComponent('ClubUserItem').initData(e);
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
        Cache.showNumer('输入玩家ID',GameConfig.NumberType.INT, (userID) => {
            this.onSearchRes(userID);
        })

    }

    onSearchRes(userid) {
        this.itemContent.removeAllChildren();
        this.pageContainer.active = false;
        // condition
        Connector.request(GameConfig.ServerEventName.UserList, { clubID: App.Club.CurrentClubID, userID: DataBase.player.id, keywords: userid }, (res) => {
            if (res.users && !GameUtils.isNullOrEmpty(res.users.rows)) {
                this.lblTotalCount.string = '总人数: ' + res.users.count;
                res.users.rows.forEach(e => {
                    let userItem = cc.instantiate(this.userItem);
                    userItem.getComponent('ClubUserItem').initData(e);
                    this.itemContent.addChild(userItem);
                });
            }

        })
    }

    onInviteUser() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ProxyInviteUser);
    }

    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


