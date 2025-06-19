let tbInfo = require('TableInfo');
let cache = require('Cache');
const utils = require('../../../Main/Script/utils');
const { GameConfig } = require('../../../GameBase/GameConfig');
const { App } = require('../../../script/ui/hall/data/App');
cc.Class({
    extends: cc.Component,

    properties: {
        lblScores: cc.Label,
        gaNode: cc.Node,
        imgReady: cc.Node,
        progressBar: cc.ProgressBar,
        imgActive: cc.Node,
        sprDefaultHead: cc.SpriteFrame,
        imgOffline: cc.Node,
        imgZhuang: cc.Node,
        imgHead: require('../../../script/ui/common/Avatar'),
        betStr: cc.Label,
        lblName: cc.Label,
        autoNode: cc.Node,
        lastTime: 0
    },
    newPlayer(idx) {
        this._scores = [0, 0, 0, 0];
    },
    // PLAYER_POS_READY:[cc.v2(-493,-143),cc.v2(504,104),cc.v2(319,234),cc.v2(-493,104)],

    playerInit(data, record) {
        console.log("初始化玩家: " + data.idx + " ", data)
        this.idx = data.idx;
        this.playData = data;
        this.realIdx = tbInfo.realIdx[data.idx];



        if (!utils.isNullOrEmpty(data.prop)) {
            this.imgHead.avatarUrl = data.prop.head;// tbInfo.idx != data.idx && tbInfo.status == GameConfig.GameStatus.WAIT ? '' : data.prop.head;
            this.imgReady.active = data.ready != null;
            if (this.realIdx == 1) {
                this.imgReady.x = -this.imgReady.x;
                this.betStr.node.x = -82;
            }
            this.imgOffline.active = data.offline; // tbInfo.idx != data.idx && tbInfo.status == GameConfig.GameStatus.WAIT ? false : data.offline;
            tbInfo.players[data.idx] = data;
            this.lblName.string = utils.getStringByLength(data.prop.name, 5);// tbInfo.idx != data.idx && tbInfo.status == GameConfig.GameStatus.WAIT ? '等待加入' : utils.getStringByLength(data.prop.name, 5);
            this.imgZhuang.active = this.idx == tbInfo.zhuang;// tbInfo.idx != data.idx && tbInfo.status == GameConfig.GameStatus.WAIT ? false : this.idx == tbInfo.zhuang;
            this.lblScores.string = '' + data.total;//tbInfo.idx != data.idx && tbInfo.status == GameConfig.GameStatus.WAIT ? '0' : '' + data.total;
        } else {
            console.log('--1-')
            this.imgOffline.active = false;
        }



        let playPos = [
            cc.v2(84 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, -133),
            cc.v2(cc.winSize.width / 2 - 84 / 2 - GameConfig.FitScreen, 100),
            cc.v2(329, cc.winSize.height / 2 - 128 / 2),
            cc.v2(84 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, 100)

        ];
        if (this.realIdx == 2)
            this.gaNode.position = cc.v2(65, 42);
        this.node.position = playPos[this.realIdx];

    },

    showInfo() {
        if (!this.playData) return;
        App.lockScene();
        let idx = this.playData.idx;
        utils.pop(GameConfig.pop.PlayerInfo, (node) => {
            App.unlockScene();
            node.getComponent("ModulePlayerInfo").init(idx)
        })
        // let data=this.playData;
        // let myDate = new Date();
        // let currentTime = myDate.getTime();
        // if (currentTime - this.lastTime < 2000) {
        //     cache.alertTip("发言间隔需要2秒");
        //     return;
        // }
        // this.lastTime=currentTime;
        // let idx = this.idx;
        // let newEvent = new cc.Event.EventCustom('playerInfo', true);
        // newEvent.detail = { idx: idx };
        // this.node.dispatchEvent(newEvent);
    },


    reset() {
        this.lblName.string = '空闲';
        this.imgReady.active = false;
        this.imgOffline.active = false;
        this.imgZhuang.active = false;
        this.imgHead.spriteFrame = this.sprDefaultHead;
    },


    roundReset() {
        this.imgReady.active = false;
        this.imgActive.active = false;
        this.progressBar.node.active = false;
        this.imgOffline.active = false;

        this.gaNode.active = false;

        this.resetOther();

        this.imgZhuang.active = tbInfo.zhuang == this.idx;
    },

    //服务器idx
    active(idx) {
        if (this.idx == idx) {

            this.progressBar.node.active = true;

            this.progressBar.progress = 1;
        } else {
            this.progressBar.node.active = false;

        }
        return;
        let node = this.imgActive;
        node.active = this.idx == idx;

        node.stopAllActions();
        node.runAction(cc.repeatForever(
            cc.sequence(
                cc.delayTime(0.5),
                cc.fadeOut(1),
                cc.delayTime(0.5),
                cc.fadeIn(1)
            )
        ));
    },

    showReady() {
        this.imgReady.active = true;
    },

    hideReady() {
        this.imgReady.active = false;
    },
    activeAutoPlay(bool) {
        this.autoNode.active = bool;
    },
    resetOther() {
        //this.lblScores.string = '0';
    },
    offlineChange(bool) {

        if (utils.isNullOrEmpty(this.playData.prop)) {
            this.imgOffline.active = false;
        } else {
            this.imgOffline.active = bool;
        }

    },
    setScore(amount) {
        this.lblScores.string = amount;
    },
    showBet(str) {
        this.betStr.node.active = true;
        this.betStr.string = str;
    },
    hideBet() {
        this.betStr.node.active = false;
    },
    showGa() {
        this.gaNode.active = true;
    },
    removePlayer() {
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
    update(dt) {
        if (!this.progressBar.node.active)
            return;


        if (this.progressBar.progress <= 0)
            this.progressBar.progress = 1;
        this.progressBar.progress -= 0.00028;
    },
});
