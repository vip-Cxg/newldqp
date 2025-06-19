import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import Avatar from "../common/Avatar";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubRankPop extends cc.Component {

    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    userItem = null;

    @property(cc.Label)
    lblStartDate = null;
    // @property(cc.Label)
    // lblEndDate = null;
    
    @property(cc.Prefab)
    selectDate = null;


    @property(cc.Label)
    lblTotalCount = null;
    @property(cc.Label)
    lblPage = null;

    @property(cc.Node)
    pageContainer = null;
    page = 1;
    totalPage = 0;
    renderData = null;
    selfUserID = 0;
    onLoad() {
        this.initRank()
    }
 
    initRank() {
        this.renderData = {
            page: [],
            rows: {}
        }
        let timeDate = new Date();
        let year = timeDate.getFullYear();
        let month = (timeDate.getMonth() + 1) >= 10 ? (timeDate.getMonth() + 1) : '0' + (timeDate.getMonth() + 1);
        let day = timeDate.getDate() >= 10 ? timeDate.getDate() : '0' + timeDate.getDate();

        this.startDate = '' + year + month + day
        // this.endDate = '' + year + month + day;
        // this.lblEndDate.string = '日期: ' + year + '年' + month + '月' + day + '日';
        this.lblStartDate.string = '日期: ' + year + '年' + month + '月' + day + '日';
        this.renderUI(1);
    }
    renderUI(page) {
        this.itemContent.removeAllChildren();

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach((e ,i)=> {
                let userItem = cc.instantiate(this.userItem);
                // {
                //     "userID": 236245,
                //     "turn": 5,
                //     "win": 2,
                //     "user": {
                //         "name": "玩家2",
                //         "head": "avatar/77897cf0-3f41-4293-9573-a8040ba3e45f.jpg"
                //     }
                // }
                userItem.getChildByName('rank').getComponent(cc.Label).string=(i+1)+(this.page-1)*10;
                // userItem.getChildByName('role').getComponent(cc.Label).string=e.rank;
                userItem.getChildByName('avatar').getComponent(Avatar).avatarUrl=e.user.head;
                userItem.getChildByName('name').getComponent(cc.Label).string=e.user.name;
                userItem.getChildByName('ID').getComponent(cc.Label).string=e.userID;
                userItem.getChildByName('turn').getComponent(cc.Label).string=e.turn;
                userItem.getChildByName('win').getComponent(cc.Label).string=e.win;


                this.itemContent.addChild(userItem);
            });
            return;
        }
        // condition
        this.downloadList(page);
    }
    downloadList(page) {
        this.itemContent.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.DailyRank, { clubID: App.Club.CurrentClubID,strDate:this.startDate,  page: page, pageSize: 10 }, (res) => {
            if (res.log && !GameUtils.isNullOrEmpty(res.log.rows)) {
                if (this.renderData.page.indexOf(page) == -1)
                    this.renderData.page.push(page);
                this.renderData.rows['' + page] = [];
                this.renderData.rows['' + page] = res.log.rows;
                this.pageContainer.active = true;
                this.page = page;
                this.totalPage = Math.ceil(res.log.count / 10);
                this.lblPage.string = page + '/' + Math.ceil(res.log.count / 10);
                this.lblTotalCount.string = '总人数: ' + res.log.count;
                res.log.rows.forEach((e,i) => {
                    let userItem = cc.instantiate(this.userItem);

                    userItem.getChildByName('rank').getComponent(cc.Label).string= (i+1)+(this.page-1)*10;
                    // userItem.getChildByName('role').getComponent(cc.Label).string=e.rank;
                    userItem.getChildByName('avatar').getComponent(Avatar).avatarUrl=e.user.head;
                    userItem.getChildByName('name').getComponent(cc.Label).string=e.user.name;
                    userItem.getChildByName('ID').getComponent(cc.Label).string=e.userID;
                    userItem.getChildByName('turn').getComponent(cc.Label).string=e.turn;
                    userItem.getChildByName('win').getComponent(cc.Label).string=e.win;

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


    openSelectDate(e, v) {
        let node = cc.instantiate(this.selectDate);
        this.node.addChild(node);
        let datePicker = node.getComponent("UIDatePicker");
        datePicker.setDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        datePicker.setPickDateCallback((year, month, day) => {
            month = (month + 1) > 9 ? (month + 1) : '0' + (month + 1);
            day = day  > 9 ? day : '0' + day;
            // if (v == 1) {
                this.startDate = "" + year + month + day;
                this.lblStartDate.string = '日期: ' + year + '年' + month + '月' + day + '日';
            // } else {
            //     this.endDate = "" + year + month + day;
            //     this.lblEndDate.string = '截止日期: ' + year + '年' + month + '月' + day + '日';
            // }
            console.log("" + year + month + day)
        });
    }
    selectByDate() {
        let startDateNum = parseInt(this.startDate);
        let timeDate = new Date();
        let year = timeDate.getFullYear();
        let month = (timeDate.getMonth() + 1) >= 10 ? (timeDate.getMonth() + 1) : '0' + (timeDate.getMonth() + 1);
        let day = timeDate.getDate() >= 10 ? timeDate.getDate() : '0' + timeDate.getDate();
        let nowTime = '' + year + month + day
        if (startDateNum > nowTime) {
            Cache.alertTip('日期不能早于今天')
            return;
        }
        this.renderData = {
            page: [],
            rows: {}
        }
        this.renderUI(1);
    }
    onClickClose() {
        Cache.playSfx();
        this.node.destroy();
    }



}


