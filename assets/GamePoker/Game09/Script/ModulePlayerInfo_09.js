let TableInfo = require("TableInfo");
let db = require('DataBase');
let audioCtrl = require("audio-ctrl");
const utils = require("../../../Main/Script/utils");
const { GameConfig } = require("../../../GameBase/GameConfig");
const Cache = require("../../../Main/Script/Cache");
cc.Class({
    extends: cc.Component,

    properties: {
        // 头像
        sprHead: require('../../../script/ui/common/Avatar'),
        // 正在出牌
        imgActive: cc.Node,
        //积分
        lblJifen: cc.Label,
        //喜风
        lblXifen: cc.Label,
        //名字
        lblName: cc.Label,
        //金币
        lblScore: cc.Label,
        //举报描述
        lblAdminDesc: cc.Label,

        //离线
        offlineNode: cc.Node,
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

        // avatarMask: cc.Node,
        // avatarCircle: cc.Node,
        rankSpr: cc.Sprite,
        rankSfArr: [cc.SpriteFrame],
        rankPos: null,
        currentData: null
    },

    init(data, replay = false,reportData=false) {
        console.log("---初始化玩家数据---", data);
        this.currentData = data;
        switch (TableInfo.realIdx[data.idx]) {
            case 0:
                this.node.setPosition(-cc.winSize.width / 2 + this.node.width / 2 + GameConfig.FitScreen, -200);
                this.sprBaodan.setPosition(75, -50);
                this.rankPos = cc.v2(60, 45);
                break;
            case 1:
                this.node.setPosition(cc.winSize.width / 2 - this.node.width / 2 - GameConfig.FitScreen, 35);
                this.imgPass.setPosition(-140, 35);
                this.sprBaodan.setPosition(-75, -50);
                this.rankPos = cc.v2(-60, 45);

                break;
            case 2:
                this.node.setPosition(-168, 220);
                this.imgPass.setPosition(0, -115);
                this.sprBaodan.setPosition(75, -50);
                this.rankPos = cc.v2(60, 45);
                break;
            case 3:
                this.node.setPosition(-cc.winSize.width / 2 + this.node.width / 2 + GameConfig.FitScreen, 35);
                this.sprBaodan.setPosition(75, -50);
                this.rankPos = cc.v2(60, 45);
                break;
        }
        if (utils.isNullOrEmpty(data.prop)) return;

            this.sprBaodan.active = false;

            this.imgPass.active = false;
            this.sprBZ.active = data.call;
            this.imgActive.active = false;
            this.offlineNode.active = data.offline;


            this.setJifen(data.credit);
            this.setXifen(data.bonus);

            if (TableInfo.options?.mode == 'CUSTOM' || replay) {//自选
                this.sprHead.avatarUrl = data.prop.head;
                this.lblName.string = utils.getStringByLength(data.prop.name, 5)
                this.lblScore.string = utils.formatGold(data.wallet);
            } else {
                this.lblName.string = '玩家' + (data.idx + 1);
                this.lblScore.node.active = false;
                this.lblScore.string = '';
            }


        if(reportData.reporterID==TableInfo.players[data.idx].prop.pid){
          
            this.lblAdminDesc.string='举报人';
        }else if(reportData.suspectID==TableInfo.players[data.idx].prop.pid){
            this.lblAdminDesc.string='被举报者';

        }else{
            this.lblAdminDesc.string='';
        }

        this.node.on('touchend', () => {
            Cache.playSfx();
            if(reportData){
                utils.pop(GameConfig.pop.AdminPunishPop, (node) => {
                    node.getComponent("AdminPunishPop").initData( TableInfo.players[data.idx].prop,reportData)
                })
                return;
            }
            if (replay) {
                utils.pop(GameConfig.pop.ReportPop, (node) => {
                    node.getComponent("ReportPop").initData(data)
                })
                return;
            }
            if (TableInfo.idx != data.idx) {
                this.showInfo(data);
            }
        })
    },

    resetPlayer() {
        this.sprBaodan.active = false;
        this.imgPass.active = false;
        this.sprBZ.active = false;
        this.imgActive.active = false;
        this.offlineNode.active = false;
        this.readyNode.active = false;
        this.setJifen(0);
        this.setXifen(0);

        this.rankSpr.node.active = false;

    },

    showInfo(data) {
        let myDate = new Date();
        let currentTime = myDate.getTime();
        if (currentTime - this.lastTime < 2000) {
            this.lastTime = currentTime;
            Cache.alertTip("间隔需要2秒");
            return;
        }
        let idx = data.idx;
        utils.pop(GameConfig.pop.PlayerInfo, (node) => {
            node.getComponent("ModulePlayerInfo").init(idx)
        })
    },

    //服务器idx
    // nodeBln
    showActive(idx) {
        if (idx == this.currentData.idx) {
            this.imgActive.active = true;
            this.imgActive.stopAllActions();
            this.imgActive.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(1), cc.delayTime(0.2), cc.fadeIn(1))));
        } else {

            this.imgActive.active = false;
        }
    },

    activeBao(bool) {
        this.sprBZ.active = bool;
    },

    activeOffline(bool) {
        this.offlineNode.active = bool && !utils.isNullOrEmpty(this.currentData.prop);
    },
    activeReady(bool) {
        this.readyNode.active = bool;
    },
    activeAuto(bool) {
        this.autoIcon.active = bool;
    },
    setJifen(value) {
        this.lblJifen.string = '' + value;
    },
    setXifen(value) {
        this.lblXifen.string = '' + value;
    },
    setWallet(value) {
        this.lblScore.string = '' + utils.formatGold(value);

    },
    showClock(value) {
        let labelNode = this.clock.getChildByName("time").getComponent(cc.Label)
        labelNode.string = utils.isNullOrEmpty(value) ? "15" : "" + parseInt(value);
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
    },
    finishAnim(rank, resume = false) {
        console.log("rank--2-", rank, resume)
        this.rankSpr.spriteFrame = this.rankSfArr[rank];
        if (resume) {
            this.rankSpr.node.position = this.rankPos;
            this.rankSpr.node.active = true;
            return;
        }
        let pos1 = cc.find("Canvas").convertToWorldSpaceAR(cc.v2(0, 0));
        let pos2 = this.node.convertToNodeSpaceAR(pos1);
        this.rankSpr.node.position = pos2;
        this.rankSpr.node.scale = 10;
        this.rankSpr.node.active = true;


        let bp = cc.scaleTo(0.3, 3);
        let cp = cc.scaleTo(0.3, 1);
        Cache.playSound("addScore");
        this.rankSpr.node.runAction(cc.sequence(bp, cc.delayTime(0.3), cc.spawn(cp, cc.moveTo(0.3, this.rankPos))));


    },
    destroyPlayer() {
        this.node.destroy();
    }
});

