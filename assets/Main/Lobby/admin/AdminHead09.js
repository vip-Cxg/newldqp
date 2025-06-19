let tbInfo = require("TableInfo");
let db = require('DataBase');
let audioCtrl = require("audio-ctrl");
const utils = require("../../../Main/Script/utils");
const { GameConfig } = require("../../../GameBase/GameConfig");
const Cache = require("../../../Main/Script/Cache");
cc.Class({
    extends: cc.Component,

    properties: {
        // 头像
        sprHead: cc.Sprite,
        // 正在出牌
        nodeBln: cc.Node,
        //积分
        lblJifen: cc.Label,
        //喜风
        lblXifen: cc.Label,
        //名字
        lblName: cc.Label,
        //金币
        lblScore: cc.Label,

        scoreNode: cc.Node,
        //离线
        sprStatus: cc.Node,
        lastTime: 0,
        //包庄
        sprBZ: cc.Node,
        //准备
        readyNode: cc.Node,
        //托管
        autoIcon: cc.Node,
        //闹钟
        clock: cc.Node,
        //要不起
        imgPass: cc.Node,
        //报单
        sprBaodan: cc.Node,

        avatarMask: cc.Node,
        avatarCircle: cc.Node,
        rankSpr: cc.Sprite,
        publishPage:cc.Prefab,
        rankSfArr: [cc.SpriteFrame],
    },

    init: function (data, replay = false) {
        this.sprBaodan.active = false;

        this.imgPass.active = false;
        this.sprBZ.active = data.bao == true;
        this.nodeBln.active = false;
        this.sprStatus.active = data.offline ? data.offline : false;
        if (GameConfig.IsLeague) {
            this.lblScore.string = (replay || data.idx == tbInfo.idx) ? "" + utils.formatGold(data.wallet, 2) : "";
        } else {
            this.lblScore.string = utils.formatGold(data.wallet, 2);
        }

        this.lblJifen.string = "" + data.scores.base;
        this.lblXifen.string = "" + data.scores.bomb;
        // if (!GameConfig.IsLeague) {
        //     utils.setHead(this.sprHead, data.prop.head);
        //     this.lblName.string = utils.getStringByLength(data.prop.name, 5)
        // }
        this.showUserInfo(data, replay);
        switch (tbInfo.realIdx[data.idx]) {
            case 0:

                this.node.setPosition(-cc.winSize.width / 2 + this.node.width / 2 + GameConfig.FitScreen, -200);
                this.scoreNode.active = true;
                this.sprBaodan.setPosition(110, -60);
                break;
            case 1:
                this.node.setPosition(cc.winSize.width / 2 - this.node.width / 2 - GameConfig.FitScreen, 35);//93
                // this.lblJifen.node.parent.setPosition(-140, -38);
                // this.lblXifen.node.parent.setPosition(-140, -72);
                this.imgPass.setPosition(-140, 38);
                this.sprBaodan.setPosition(-110, -60);

                break;
            case 2:
                this.node.setPosition(-168, 220);
                this.imgPass.setPosition(197, -115);
                this.sprBaodan.setPosition(110, -60);

                break;
            case 3:
                this.node.setPosition(-cc.winSize.width / 2 + this.node.width / 2 + GameConfig.FitScreen, 35);
                this.sprBaodan.setPosition(110, -60);
                break;
        }

        // this.node.on('touchend', () => {
        //     let publishPage = cc.instantiate(this.publishPage);
        //     publishPage.getComponent("AdminOtherPage").refreshUI(data);
        //     cc.find("Canvas").addChild(publishPage);
        // })
    },

    showUserInfo(data, replay) {

        if (tbInfo.idx == data.idx) {
            this.lblName.string = utils.getStringByLength(data.prop.name, 5);
            this.scheduleOnce(() => {
                utils.setHead(this.sprHead, data.prop.head);
            }, 0.5);
        } else {
            //第0局不显示名字和头像
            let name = replay || !GameConfig.IsLeague ? data.prop.name : "玩家" + (data.idx + 1);//tbInfo.turn == 0 ? "玩家" : data.prop.name;
            // let randomIndex=Math.floor(Math.random)
            this.lblName.string = utils.getStringByLength(name, 5);

            if (!replay && GameConfig.IsLeague)
                return;

            let avatarUrl = data.prop.head;//tbInfo.turn == 0 ? "" : data.prop.head;
            // if (tbInfo.turn != 0) {
            this.scheduleOnce(() => {
                utils.setHead(this.sprHead, avatarUrl);
            }, 0.5);
            // }
        }

    },
    activeBln: function (bool) {
        this.nodeBln.active = true;
        this.nodeBln.stopAllActions();
        this.nodeBln.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(1), cc.delayTime(0.2), cc.fadeIn(1))));
    },

    showInfo: function (data) {
        let myDate = new Date();
        let currentTime = myDate.getTime();
        if (currentTime - this.lastTime < 2000) {
            this.lastTime = currentTime;
            Cache.alertTip("发言间隔需要2秒");
            return;
        }
        let idx = data.idx;
        utils.pop(GameConfig.pop.PlayerInfo, (node) => {
            node.getComponent("ModulePlayerInfo").init(idx)
        })
        // let newEvent = new cc.Event.EventCustom('playerInfo',true);
        // newEvent.detail = {idx:idx};
        // this.node.dispatchEvent(newEvent);
    },

    activeReady(bool) {
        this.readyNode.active = bool;
    },
    activeAuto(bool) {
        this.autoIcon.active = bool;
    },
    showClock(value) {
        let labelNode = this.clock.getChildByName("time").getComponent(cc.Label)
        labelNode.string = utils.isNullOrEmpty(value) ? "15" : "" + value;
        let times = utils.isNullOrEmpty(value) ? 15 : parseInt(value);
        labelNode.unscheduleAllCallbacks();
        this.clock.active = true;
        labelNode.schedule(() => {
            times--;
            this.clock.getChildByName("time").getComponent(cc.Label).string = Math.max(times, 0);
            if (times <= 5) {

            }
        }, 1);
    },
    hideClock() {
        this.clock.getChildByName("time").getComponent(cc.Label).unscheduleAllCallbacks();
        this.clock.active = false;
    },
    activeBaodan(bool) {
        this.sprBaodan.active = bool;
    },
    activeRank() {
        this.rankSpr.node.active = false;
        this.avatarCircle.runAction(cc.moveTo(0.3, cc.v2(0, 62)));
        this.avatarMask.runAction(cc.moveTo(0.3, cc.v2(0, 62)));

    },
    finishAnim(rank, resume = false) {
        this.rankSpr.spriteFrame = this.rankSfArr[rank];
        if (resume) {

            this.avatarCircle.runAction(cc.moveBy(0.3, cc.v2(-19, 0)));
            this.avatarMask.runAction(cc.moveBy(0.3, cc.v2(-19, 0)));
            this.rankSpr.node.position = cc.v2(44, 61);
            this.rankSpr.node.active = true;
            return;
        }
        let pos1 = cc.find("Canvas").convertToWorldSpaceAR(cc.v2(0, 0));
        let pos2 = this.node.convertToNodeSpaceAR(pos1);
        this.rankSpr.node.position = pos2;
        // this.rankSpr.node.opacity = 0;
        this.rankSpr.node.scale = 10;
        this.rankSpr.node.active = true;


        let ap = cc.scaleTo(0.3, 7);
        let bp = cc.scaleTo(0.3, 3);
        let cp = cc.scaleTo(0.3, 1);
        Cache.playSound("addScore");
        this.avatarCircle.runAction(cc.moveBy(0.3, cc.v2(-19, 0)));
        this.avatarMask.runAction(cc.moveBy(0.3, cc.v2(-19, 0)));
        this.rankSpr.node.runAction(cc.sequence(bp, cc.delayTime(0.3), cc.spawn(cp, cc.moveTo(0.3, cc.v2(44, 61)))));


    }
});

