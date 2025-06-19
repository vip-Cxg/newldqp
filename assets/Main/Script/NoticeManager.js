import { GameConfig } from "../../GameBase/GameConfig.js";
import { App } from "../../script/ui/hall/data/App.js";
import Cache from "../Script/Cache.js";
import utils from "../Script/utils.js";


export class NoticeManager {

    static _instance = null;

    static getInstance() {
        if (this._instance == null)
            this._instance = new NoticeManager();
        return this._instance;
    }

    showStartTips = false;
    tipsNode = null
    constructor() {
        console.log('实例化')
        this.showStartTips = false;
        this.removeTips();
        this.startInterval();
    }

    startInterval() {
        this.timeInterval = setInterval(() => {

        let startTime = utils.getTimeStamp(GameConfig.TaskStartTime);
        let endTime = utils.getTimeStamp(GameConfig.TaskEndTime);
            let nowTime = utils.getTimeStamp();
            // if (nowTime <= (endTime + 3 * 60 * 1000) && nowTime >= endTime) {
            if (nowTime <= (endTime + 3 * 60 * 1000)&&nowTime >= endTime) {
                this.alertNotice("今日活动结束,奖励请在0点前领取,明天记得准时参加喔")
                clearInterval(this.timeInterval);
                return;
            }


            // console.log("----",startTime,nowTime)
            if (nowTime >= startTime && nowTime < endTime && !this.showStartTips) {
                //活动开始  弹出提示
                this.alertNotice("每日流水活动正在进行!");
                this.showStartTips = true;
                return;
            }
            let durTime = Math.floor((startTime - nowTime) / 1000);

            if (durTime == 60) {
                this.alertNotice("活动开始倒计时: 1分钟");
            }
            if (durTime == 300) {
                this.alertNotice("活动开始倒计时: 5分钟");
            }
            if (durTime == 600) {
                this.alertNotice("活动开始倒计时: 10分钟");
            }
        }, 1000);
    }

    alertNotice(str) {
        cc.loader.loadRes(GameConfig.pop.NoticePop, (err, prefab) => {
            if (!err) {
                let popNode = cc.instantiate(prefab);
                popNode.parent = cc.find("Canvas");
                this.tipsNode = popNode.getComponent('ModuleNotice');
                
                this.tipsNode.showTips(str, this.resetTips.bind(this));
            }
            console.log(err)

        });
    }

    resetTips() {
        console.log("123123123123",this);
        this.showStartTips = false;
    }

    removeTips() {
        if (this.tipsNode) {
            this.tipsNode.nodeDestroy(0);
            this.tipsNode = null;
        }
    }
}








































































































































































































































































