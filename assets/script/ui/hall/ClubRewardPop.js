import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import DataBase from "../../../Main/Script/DataBase";
import Connector from "../../../Main/NetWork/Connector";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubRewardPop extends cc.Component {


    @property(cc.Label)
    lblReward = null;
    @property(cc.Label)
    lblLevel = null;

    @property(cc.Label)
    tips1 = null;
    @property(cc.Label)
    tips2 = null;
    @property(cc.Label)
    tips3 = null;
    @property(cc.Label)
    tips4 = null;


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

    currentFun = null
    onLoad() {

        this.addEvents();
        this.showList();
        this.renderReward();
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.renderReward, this);
    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.renderReward, this);

    }
    renderReward() {
        console.log('App.', App.Club.ClubReward);
        this.lblLevel.string = '当前等级: ' + App.Club.ClubLevel;
        this.lblReward.string = '当前奖励: ' + GameUtils.formatGold(App.Club.ClubReward);
    }
    getReward() {
        Cache.playSfx();
        if (App.Club.ClubReward == 0)
            return;
        Cache.showNumer('请输入提取奖励', GameConfig.NumberType.FLOAT, (reward) => {
            if (parseInt(reward * 100) > parseInt(App.Club.ClubReward)) {
                Cache.alertTip('无效数值');
                return;
            }
            Connector.request(GameConfig.ServerEventName.DrawReward, { clubID: App.Club.CurrentClubID, userID: DataBase.player.id, reward: parseInt(reward * 100) }, (data) => {
                Cache.alertTip('提取成功');
                App.Club.ClubReward = data.reward;
                App.Club.ClubScore = data.score;
                this.currentFun(1);
            })
        })
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
        this.renderList(1)
    }

    renderList(page) {
        this.tips1.string = '时间';
        this.tips2.string = '';
        this.tips3.string = '事件';
        this.tips4.string = '';

        // /game/scoreLog
        this.itemContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let item = cc.instantiate(this.baseInfoItem);
                item.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                item.getChildByName('score').getComponent(cc.Label).string = (e.reward < 0 ? '领取' : '获得') + GameUtils.formatGold(Math.abs(e.reward)) + '体力';
                item.getChildByName('total').getComponent(cc.Label).string = '';
                item.getChildByName('event').getComponent(cc.Label).string = '';
                this.itemContent.addChild(item);
            });
            return;
        }

        Connector.request(GameConfig.ServerEventName.RewardLog, { clubID: App.Club.CurrentClubID, userID: DataBase.player.id, page: page, pageSize: 10 }, (res) => {
            if (res.logs && !GameUtils.isNullOrEmpty(res.logs.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.logs.rows;
                this.pageContainer.active = true;
                this.page = page;
                let count = typeof (res.logs.count) == 'number' ? res.logs.count : res.logs.count.length;
                this.totalPage = Math.ceil(count / 10);
                this.lblPage.string = page + '/' + Math.ceil(count / 10);
                res.logs.rows.forEach((e) => {
                    let item = cc.instantiate(this.baseInfoItem);
                    item.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                    item.getChildByName('score').getComponent(cc.Label).string = (e.reward < 0 ? '领取' : '获得') + GameUtils.formatGold(Math.abs(e.reward)) + '体力';
                    item.getChildByName('event').getComponent(cc.Label).string = '';
                    item.getChildByName('total').getComponent(cc.Label).string = '';
                    this.itemContent.addChild(item);
                });
            } else {
                this.pageContainer.active = false;
            }
        })
    }
    showShuffle() {
        Cache.playSfx();
        this.renderData = {
            page: [],
            rows: {}
        }
        this.page = 1;
        this.pageContainer.active = false;
        this.currentFun = this.renderShuffle;
        this.renderShuffle(1)
    }

    renderShuffle(page) {
        this.tips1.string = '时间';
        this.tips2.string = '';
        this.tips3.string = '事件';
        this.tips4.string = '';
        console.log('00000',page);
        // /game/scoreLog
        this.itemContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let item = cc.instantiate(this.baseInfoItem);
                item.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                item.getChildByName('score').getComponent(cc.Label).string = '获得洗牌 ' + GameUtils.formatGold(Math.abs(e.reward)) + '体力';
                item.getChildByName('total').getComponent(cc.Label).string = '';
                item.getChildByName('event').getComponent(cc.Label).string = '';
                this.itemContent.addChild(item);
            });
            return;
        }
        console.log('11111',page);

        Connector.request(GameConfig.ServerEventName.ShuffleLog, { clubID: App.Club.CurrentClubID, userID: DataBase.player.id, page: page, pageSize: 10 }, (res) => {
            if (res.log && !GameUtils.isNullOrEmpty(res.log.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.log.rows;
                this.pageContainer.active = true;
                this.page = page;
                let count = typeof (res.log.count) == 'number' ? res.log.count : res.log.count.length;
                this.totalPage = Math.ceil(count / 10);
                this.lblPage.string = page + '/' + Math.ceil(count / 10);
                res.log.rows.forEach((e) => {
                    let item = cc.instantiate(this.baseInfoItem);
                    item.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                    item.getChildByName('score').getComponent(cc.Label).string = '获得洗牌 ' + GameUtils.formatGold(Math.abs(e.reward)) + '体力';
                    item.getChildByName('event').getComponent(cc.Label).string = '';
                    item.getChildByName('total').getComponent(cc.Label).string = '';
                    this.itemContent.addChild(item);
                });
            } else {
                this.pageContainer.active = false;
            }
        })
    }

    showDetail() {
        Cache.playSfx();
        this.renderData = {
            page: [],
            rows: {}
        }
        this.page = 1;
        this.pageContainer.active = false;
        this.currentFun = this.renderDetail;
        this.renderDetail(1)
    }

    renderDetail(page) {
        this.tips1.string = '时间';
        this.tips2.string = '游戏';
        this.tips3.string = '来源玩家';
        this.tips4.string = '奖励';

        // /game/scoreLog
        this.itemContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let item = cc.instantiate(this.baseInfoItem);
                item.getChildByName('time').getComponent(cc.Label).string = new Date(e.createdAt).format("yyyy-MM-dd hh:mm");
                item.getChildByName('event').getComponent(cc.Label).string = e.remarks;
                item.getChildByName('score').getComponent(cc.Label).string = e.source;
                item.getChildByName('total').getComponent(cc.Label).string = GameUtils.formatGold(e.reward);
                this.itemContent.addChild(item);
            });
            return;
        }

        Connector.request(GameConfig.ServerEventName.RewardDetail, { clubID: App.Club.CurrentClubID, userID: DataBase.player.id, page: page, pageSize: 10 }, (res) => {
            if (res.log && !GameUtils.isNullOrEmpty(res.log.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.log.rows;
                this.pageContainer.active = true;
                this.page = page;
                let count = typeof (res.log.count) == 'number' ? res.log.count : res.log.count.length;
                this.totalPage = Math.ceil(count / 10);
                this.lblPage.string = page + '/' + Math.ceil(count / 10);
                res.log.rows.forEach((e) => {
                    let item = cc.instantiate(this.baseInfoItem);
                    item.getChildByName('time').getComponent(cc.Label).string = new Date(e.createdAt).format("yyyy-MM-dd hh:mm");
                    item.getChildByName('event').getComponent(cc.Label).string = e.remarks;
                    item.getChildByName('score').getComponent(cc.Label).string = e.source;
                    item.getChildByName('total').getComponent(cc.Label).string = GameUtils.formatGold(e.reward);
                    this.itemContent.addChild(item);
                });
            } else {
                this.pageContainer.active = false;
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
        this.renderTotal(1)
    }
    renderTotal(page) {
        this.tips1.string = '时间';
        this.tips2.string = '总奖励';
        this.tips3.string = '总活跃';
        this.tips4.string = '总体力';

        this.itemContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let item = cc.instantiate(this.baseInfoItem);
                item.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                item.getChildByName('event').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.reward);
                item.getChildByName('score').getComponent(cc.Label).string = '' + e.activity;
                item.getChildByName('total').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.sumScore);
                this.itemContent.addChild(item);
            });
            return;
        }
        Connector.request(GameConfig.ServerEventName.RewardSummary, { clubID: App.Club.CurrentClubID, page: page, pageSize: 8 }, (res) => {
            if ( !GameUtils.isNullOrEmpty(res.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.rows;
                this.pageContainer.active = true;
                this.page = page;
                let count = typeof (res.count) == 'number' ? res.count : res.count.length;
                this.totalPage = Math.ceil(count / 10);
                this.lblPage.string = page + '/' + Math.ceil(count / 10);
                res.rows.forEach((e) => {
                    let item = cc.instantiate(this.baseInfoItem);
                    item.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                    item.getChildByName('event').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.reward);
                    item.getChildByName('score').getComponent(cc.Label).string = '' + e.activity;
                    item.getChildByName('total').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.sumScore);
                    // item.getChildByName('event').getComponent(cc.Label).string = '' + e.reward;//总奖励
                    // item.getChildByName('score').getComponent(cc.Label).string = '' + e.activity;//总活跃
                    // item.getChildByName('total').getComponent(cc.Label).string = '' + e.sumScore;//总体力
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



    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


