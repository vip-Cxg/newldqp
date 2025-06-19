import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubActivePop extends cc.Component {

    @property(cc.Label)
    lblTodayTurns = null;
    @property(cc.Label)
    lblYesTurns = null;
    @property(cc.Label)
    lblunTodayTurns = null;
    @property(cc.Label)
    lblunYesTurns = null;
    @property(cc.Label)
    lblRewards = null;
    @property(cc.Label)
    lblTips1 = null;
    @property(cc.Label)
    lblTips2 = null;
    @property(cc.Label)
    lblTips3 = null;
    @property(cc.Label)
    lblTips4 = null;
    @property(cc.Label)
    lblTips5 = null;
    @property(cc.Label)
    time = null;

    @property(cc.Node)
    rewardBtn = null;

    onLoad() {
        this.renderUI();

    }
    addEvents() {

    }
    removeEvents() {

    }
    renderUI() {
        // let res = {
        //     yesterdayData:{
        //         validSumTurn:23,
        //         invalidSumTurn:10
        //     },
        //     todayData:{
        //         validSumTurn:20,
        //         invalidSumTurn:10
        //     },
        //     rewardStatus:{
        //         canReceive:true,
        //         reward:18.88
        //     },
        //     tasks:[
        //         {turn:20,reward:18.88},
        //         {turn:30,reward:28.88},
        //         {turn:60,reward:68.88},
        //         {turn:80,reward:88.88},
        //         {turn:120,reward:128.88},
        //     ],
        //     dates:[
        //         '2024-04-23 00:00:00',
        //         '2024-04-26 00:00:00',
        //     ]
        // };

        Connector.request(GameConfig.ServerEventName.ClubActive, { clubID: App.Club.CurrentClubID }, (respons) => {
            let res = respons.data;

            this.rewardBtn.active= res.rewardStatus.canReceive;
            this.lblYesTurns.string =  res.yesterdayData.validSumTurn;
            this.lblTodayTurns.string = res.todayData.validSumTurn;
            this.lblunYesTurns.string = res.yesterdayData.invalidSumTurn;
            this.lblunTodayTurns.string = res.todayData.invalidSumTurn;
            this.lblRewards.string = res.rewardStatus.reward || 0;


            this.lblTips1.string = '参与' + res.tasks[0].turn + '局 奖' + res.tasks[0].reward;
            this.lblTips2.string = '参与' + res.tasks[1].turn + '局 奖' + res.tasks[1].reward;
            this.lblTips3.string = '参与' + res.tasks[2].turn + '局 奖' + res.tasks[2].reward;
            this.lblTips4.string = '参与' + res.tasks[3].turn + '局 奖' + res.tasks[3].reward;
            this.lblTips5.string = '参与' + res.tasks[4].turn + '局 奖' + res.tasks[4].reward;
            this.time.string = new Date(res.dates[0]).format("MM-dd hh:mm") + ' 至 ' + new Date(res.dates[1]).format("MM-dd hh:mm");

        }, true, (err) => {

        })

    }

    getReward() {
        // App.Club.ClubScore += 1888;
        // Cache.alertTip('领取成功');
        // App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_DATA_CHANGE)
        // this.rewardBtn.active=false;
        // return;
        Connector.request(GameConfig.ServerEventName.GetTaskReward, { clubID: App.Club.CurrentClubID }, (res) => {
            console.log(res)
            App.Club.ClubScore = res.score;
            Cache.alertTip('领取成功');
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_DATA_CHANGE)
            this.renderUI()
        })
    }


    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}