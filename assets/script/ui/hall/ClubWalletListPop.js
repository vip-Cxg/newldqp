import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import DataBase from "../../../Main/Script/DataBase";
import Connector from "../../../Main/NetWork/Connector";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubWalletListPop extends cc.Component {




    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    baseInfoItem = null;


    @property(cc.Label)
    lblPage = null;

    @property(cc.Node)
    pageContainer = null;

    page = 1;
    totalPage = 0;
    renderData = null;

    onLoad() {

        this.addEvents();
        this.showList();
    }
    addEvents() {
    }
    removeEvents() {

    }

    showList() {
        Cache.playSfx();
        this.renderData = {
            page: [],
            rows: {}
        }
        this.page = 1;
        this.pageContainer.active = false;
        this.renderList(1)
    }

    renderList(page) {
        // // /game/scoreLog
        this.itemContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let item = cc.instantiate(this.baseInfoItem);
                // item.getChildByName('time').getComponent(cc.Label).string = new Date(e.strDate).format("yyyy-MM-dd hh:mm:ss");
                item.getChildByName('time').getComponent(cc.Label).string = e.strDate;//new Date(e.strDate).format("yyyy-MM-dd hh:mm:ss");//日期 ‘2021-12-11T09:50:44.000Z‘
                item.getChildByName('event').getComponent(cc.Label).string = App.Club.IsLeague? (e.card+'房卡'):(e.diamond+'钻石');//总消耗量 2钻   
                item.getChildByName('score').active = false;
                this.itemContent.addChild(item);
            });
            return;
        }

        Connector.request(GameConfig.ServerEventName.CardSummary, { clubID: App.Club.CurrentClubID, userID: DataBase.player.id, page: 1, pageSize: 10 }, (res) => {
            // if ( !GameUtils.isNullOrEmpty(res.data)) {
            if (res.data && !GameUtils.isNullOrEmpty(res.data.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.data.rows;
                this.pageContainer.active = true;
                this.page = page;
                let count = typeof (res.data.count) == 'number' ? res.data.count : res.data.count.length;
                this.totalPage = Math.ceil(count / 10);
                this.lblPage.string = page + '/' + Math.ceil(count / 10);
                res.data.rows.forEach((e) => {
                    let item = cc.instantiate(this.baseInfoItem);
                    item.getChildByName('time').getComponent(cc.Label).string = e.strDate;//new Date(e.strDate).format("yyyy-MM-dd hh:mm:ss");//日期 ‘2021-12-11T09:50:44.000Z‘
                    item.getChildByName('event').getComponent(cc.Label).string =App.Club.IsLeague? (e.card+'房卡'):(e.diamond+'钻石');//总消耗量 2钻  
                    item.getChildByName('score').active = false;
                    this.itemContent.addChild(item);
                });
            } else {
                this.pageContainer.active = false;
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
        this.renderList(a);
    }
    reducePage() {
        Cache.playSfx();
        if (this.page == 1) {
            Cache.alertTip('已经是第一页');
            return;
        }
        let a = this.page - 1;

        this.renderList(a);
    }



    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


