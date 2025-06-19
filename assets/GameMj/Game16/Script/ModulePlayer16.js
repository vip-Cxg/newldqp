let tbInfo = require('TableInfo');
let cache = require('Cache');
const utils = require('../../../Main/Script/utils');
const { GameConfig } = require('../../../GameBase/GameConfig');
cc.Class({
    extends: cc.Component,

    properties: {
        lblScores: cc.Label,
        imgReady: cc.Node,
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
        console.log("初始化玩家: 1", data)
        this.idx = data.idx;
        this.playData = data;
        this.realIdx = tbInfo.realIdx[data.idx];
        let playPos = [
            cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, -80),
            cc.v2(cc.winSize.width / 2 - 139 / 2 - GameConfig.FitScreen, 60),
            cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, 110),
        ];
        this.node.position = playPos[this.realIdx];
        if (utils.isNullOrEmpty(data.prop))
        return;
       
        this.imgHead.avatarUrl=data.prop.head;
        this.imgReady.active = data.ready;
        if (this.realIdx == 1) {
            this.imgReady.x = -this.imgReady.x;
            this.betStr.node.x = -82
        }

        this.imgOffline.active = data.offline;
        tbInfo.players[data.idx] = data;
        this.lblName.string = utils.getStringByLength(data.prop.name, 5);
        this.imgZhuang.active = this.idx == tbInfo.zhuang;
        this.lblScores.string = '' + utils.formatGold(data.wallet);

        if (data.idx != tbInfo.idx && !record) {
            this.node.off(cc.Node.EventType.TOUCH_END, this.showInfo, this)
            this.node.on(cc.Node.EventType.TOUCH_END, this.showInfo, this)
        }
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
        this.lblName.string = '等待进入';
        this.imgReady.active = false;
        this.imgOffline.active = false;
        this.imgZhuang.active = false;
        this.imgHead.spriteFrame = this.sprDefaultHead;
    },


    roundReset() {
        this.imgReady.active = false;
        this.imgActive.active = false;
        this.resetOther();
        this.imgZhuang.active = tbInfo.zhuang == this.idx;
    },

    //服务器idx
    active(idx) {
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

    activeReady(bool) {
        this.imgReady.active = bool;
    },
    activeAutoPlay(bool) {
        this.autoNode.active = bool;
    },
    resetOther() {
        //this.lblScores.string = '0';
    },

    setScore(amount) {
        this.lblScores.string = utils.formatGold(amount);
    },
    showBet(str) {
        this.betStr.node.active = true;
        this.betStr.string = str;
    },
    hideBet() {
        this.betStr.node.active = false;
    },
    removePlayer() {
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
    // update (dt) {},
});
