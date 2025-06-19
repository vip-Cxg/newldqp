import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubProxyListPop extends cc.Component {

    @property(cc.Label)
    lblTotalCount = null;
    @property(cc.Label)
    lblPage = null;
    @property(cc.Node)
    changeBtn = null;
    @property(cc.Node)
    proxyBtn = null;
    @property(cc.Node)
    inviteBtn = null;
    @property(cc.Node)
    pageContainer = null;
    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    userItem = null;

    @property(cc.Node)
    xipaiTips = null;

    page = 1;
    totalPage = 0;
    renderData = null;
    selfUserID = 0;
    pageSize = 30;
    onLoad() {
        this.renderData = {
            page: [],
            rows: {}
        }
        this.addEvents();

        // console.log(App.Club.ShuffleLevel)
        this.xipaiTips.active = App.Club.ShuffleLevel != 0;
        this.changeBtn.active =  App.Club.CurrentClubRole == 'owner';
        this.proxyBtn.active =  App.Club.CurrentClubRole == 'owner';

    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.PROXY_LIST_UPDATE, this.handleUpdate, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.ADD_PROXY, this.updateList, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.PROXY_LEVEL_UPDATE, this.updateList, this);
    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.PROXY_LIST_UPDATE, this.handleUpdate, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.ADD_PROXY, this.updateList, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.PROXY_LEVEL_UPDATE, this.updateList, this);

    }
    updateList() {
        this.downloadList(this.page);
    }

    handleUpdate(e) {
        this.initUserID(e.data)
    }
    initUserID(userId) {
        console.log("---", userId)
        this.selfUserID = userId;
        if (userId != DataBase.player.id || App.Club.CurrentClubRole == 'manager') {
            this.inviteBtn.active = false;
        }
        this.renderData = {
            page: [],
            rows: {}
        }
        this.renderUI(1);
    }

    renderUI(page) {


        this.itemContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let userItem = cc.instantiate(this.userItem);
                userItem.getComponent('ClubProxyItem').initData(e);
                this.itemContent.addChild(userItem);
            });
            return;
        }
        // condition
        this.downloadList(page);


    }
    downloadList(page) {

        this.itemContent.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.ProxiesList, { clubID: App.Club.CurrentClubID, userID: this.selfUserID, page: page, pageSize: this.pageSize }, (res) => {

            if (res.proxies && !GameUtils.isNullOrEmpty(res.proxies.rows)) {
                if (this.renderData.page.indexOf(page) == -1)
                    this.renderData.page.push(page);
                this.renderData.rows['' + page] = [];
                this.renderData.rows['' + page] = res.proxies.rows;
                this.pageContainer.active = true;
                this.page = page;
                this.totalPage = Math.ceil(res.proxies.count / this.pageSize);
                this.lblPage.string = page + '/' + Math.ceil(res.proxies.count / this.pageSize);
                this.lblTotalCount.string = '总人数: ' + res.proxies.count;
                res.proxies.rows.forEach(e => {
                    let userItem = cc.instantiate(this.userItem);
                    userItem.getComponent('ClubProxyItem').initData(e);
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


    onInviteProxy() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ProxyInviteUser, (node) => {
            node.getComponent('ProxyInviteUser').initType('proxy')
        });

    }
    onChangeUser() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ChangeUserPop);
    }
    onChangeProxy() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ChangeProxyPop);
    }
    onSearch() {
        Cache.playSfx();
        Cache.showNumer('输入玩家ID', GameConfig.NumberType.INT, (userID) => {
            this.onSearchRes(userID);
        })

    }


    onSearchRes(userid) {
        this.itemContent.removeAllChildren();
        this.pageContainer.active = false;
        // condition
        Connector.request(GameConfig.ServerEventName.ProxiesList, { clubID: App.Club.CurrentClubID, userID: this.selfUserID, keywords: userid }, (res) => {
            if (res.proxies && !GameUtils.isNullOrEmpty(res.proxies.rows)) {
                this.lblTotalCount.string = '总人数: ' + res.proxies.count;
                res.proxies.rows.forEach(e => {
                    let userItem = cc.instantiate(this.userItem);
                    userItem.getComponent('ClubProxyItem').initData(e);
                    this.itemContent.addChild(userItem);
                });
            }

        })
    }  // GameUtils.pop(GameConfig.pop.ProxyInviteUser);

    onRemoveProxy() {
        Cache.playSfx();
        Cache.showNumer('输入代理ID', GameConfig.NumberType.INT, (userID) => {
            this.removeProxy(userID);
        })

    }
    removeProxy(userID) {
        Connector.request(GameConfig.ServerEventName.CancelProxy, { clubID: App.Club.CurrentClubID, userID: userID }, (res) => {
            Cache.alertTip("删除成功");
            this.renderUI(1);
        })
    }
    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


