const { GameConfig } = require("../../../GameBase/GameConfig");
const Connector = require("../../NetWork/Connector");
const Cache = require("../../Script/Cache");
const utils = require("../../Script/utils");

let dataBase = require("../../Script/DataBase");
const { App } = require("../../../script/ui/hall/data/App");

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Node,
        lotteryCount: cc.Label,
        rewardIconArr: [cc.SpriteFrame],
        turnTable: cc.Node,
        listContainer: cc.Node,
        listItem: cc.Prefab,
        lotteryReward: cc.Prefab,
        rewardContainer: cc.Node,
        downTimeLbl: cc.Label,
        endTips: cc.Label,
        rewardPop: cc.Prefab,
        rewardCount: 0,
        rewardArr: [],
        listData: [],
        rewardData: null,
        endDate: ""
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
        this.refreshUI();
    },
    addEvents() {
    },
    removeEvents() {
    },
    /**更新UI */
    refreshUI() {
        //抽奖次数
        this.turnTable.rotation = 0;
        Connector.request(GameConfig.ServerEventName.LotteryData, {}, (data) => {
            this.lotteryCount.string = "" + (data.tickets || 0);
            this.rewardCount = data.tickets || 0;
            this.rewardArr = [];
            this.rewardData = data.prize;
            this.rewardContainer.removeAllChildren();
            for (let key in data.prize) {
                let e = data.prize[key];
                let rewardItem = cc.instantiate(this.lotteryReward);
                rewardItem.rotation = 15 + 30 * key;
                rewardItem.getChildByName("word").getComponent(cc.Label).string = e.prize == 0 ? "" : e.prize / 100 + "元";
                if (e.prize >= 30000) {
                    rewardItem.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = this.rewardIconArr[4];
                    rewardItem.getChildByName("star").active = true;
                } else if (e.prize >= 10000) {
                    rewardItem.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = this.rewardIconArr[3];
                } else if (e.prize >= 4000) {
                    rewardItem.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = this.rewardIconArr[2];
                } else if (e.prize > 0) {
                    rewardItem.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = this.rewardIconArr[1];
                } else {
                    rewardItem.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = this.rewardIconArr[0];
                }
                this.rewardContainer.addChild(rewardItem);
                this.rewardArr.push(rewardItem);
            }
            this.endDate = data.activityEndDate || "";
        });

        this.downloadListReward();

    },


    downloadListReward() {
        //抽奖记录
        Connector.request(GameConfig.ServerEventName.LotteryList, {}, (data) => {
            this.listData = data.public || [];
            this.initRewardList()
        });
    },

    /**点击抽奖 */
    onClickLottery() {
        if (this.rewardCount <= 0) {
            Cache.alertTip("抽奖次数不足");
            return;
        }

        let endTime = new Date(this.endDate).getTime();
        let nowTime = new Date().getTime() + GameConfig.ServerTimeDiff;
        let duration = Math.floor((endTime - nowTime) / 1000);
        if (duration <= 0) {
            Cache.alertTip("活动已结束");
            return;
        }

        App.lockScene();
        this.rewardArr.forEach((e, i) => {
            e.getChildByName("select").active = false;
        });
        Connector.request(GameConfig.ServerEventName.Lottery, {}, (data) => {
            this.rewardCount--;
            dataBase.player.ticket = this.rewardCount;
            // App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_TICKET_UI);
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_WALLET_DATA);
            this.lotteryCount.string = "" + this.rewardCount;
            this.startLotteryAnim(data.prize)
        }, null, (err) => {
            App.unlockScene();
            Cache.showTipsMsg(err.message || "请求失败,稍后再试");
        })
    },

    /**开始抽奖动画 */
    startLotteryAnim(data) {
        let endAngle = data * 30 + (Math.random() * 30) + this.turnTable.rotation % 360;
        let ap = cc.rotateBy(5.5, -360 * 4 + endAngle).easing(cc.easeExponentialOut(2));
        let ag = cc.blink(2, 5);
        let bg = cc.sequence(ag, cc.callFunc(() => {
            App.unlockScene();
            //TODO 恭喜中奖提示 
            if (this.rewardData[data].prize != 0) {
                let rewardPop = cc.instantiate(this.rewardPop);
                rewardPop.getComponent("RewardPop").initData(this.rewardData[data]);
                this.node.addChild(rewardPop);
            }
        }))
        let bp = cc.sequence(ap, cc.callFunc(() => {
            this.rewardArr[data].getChildByName("select").active = true;
            this.rewardArr[data].getChildByName("select").runAction(bg);
            Cache.playSound("reward1");
            this.downloadListReward();

        }))
        Cache.playSound("lottery2");
        this.turnTable.runAction(bp);

    },

    /**打开提示说明 */
    onShowTips(){
        Cache.playSfx();
    },

    initRewardList() {
        this.listContainer.removeAllChildren();
        this.listData.forEach((e, i) => {
            let listItem = cc.instantiate(this.listItem);
            listItem.getChildByName("name").getComponent(cc.Label).string = "恭喜" + utils.getStringByLength(e.name, 6) + "获得";
            listItem.getChildByName("reward").getComponent(cc.Label).string = e.prize / 100 + "元金币";
            listItem.x = -this.listContainer.width / 2 + 10;
            listItem.y = this.listContainer.height / 2 - listItem.height / 2 - (listItem.height + 10) * i;
            this.listContainer.addChild(listItem);
        })
    },

    update(dt) {
        // if (this.endDate != "") {
        //     let endTime = new Date(this.endDate).getTime();
        //     let nowTime = new Date().getTime() + GameConfig.ServerTimeDiff;
        //     let duration = Math.floor((endTime - nowTime) / 1000);
        //     this.downTimeLbl.string = duration <= 0 ? "" : utils.timeToString(duration);
        //     if (duration <= 0)
        //         this.endTips.string = "活动已结束";
        // }

        // if (this.listData.length < 6) return;
        // this.listContainer.children.forEach((e, i) => {
        //     if (e.y > (this.listContainer.height / 2 + e.height)) {
        //         e.y -= this.listData.length * (e.height + 10)
        //     } else {
        //         e.y += 0.5;
        //     }
        // })
    },


    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
    onDestroy() {
        this.removeEvents();
    }
});
