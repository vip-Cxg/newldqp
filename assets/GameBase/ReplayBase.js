let ROUTE = require('ROUTE');
let db = require('DataBase');
let cache = require('Cache');
let gameInfo = require('TableInfo');
let audioCtrl = require('audio-ctrl');


cc.Class({
    extends: cc.Component,

    properties: {
        speed: 1,
        lblSpeed: cc.Label,
        lblReplayTime: cc.Label,
        imgProgress: cc.Sprite,
        lblTime: cc.Label,
        lblTurn: cc.Label,
        lblTid: cc.Label,
        lblRule: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    playManageAudio: function (msg) {
        let game = db.gameType < 10 ? ("Game0" + db.gameType) : ("Game" + db.gameType);
        if (!cc.sys.isNative) {
            return;
        }
        let url = jsb.fileUtils.getWritablePath() + "remote-asset/Audio/" + game + "/" + msg;
        cc.loader.load(url, function (err, data) {
            let audioCtrl = require("audio-ctrl");
            audioCtrl.getInstance().playSFX(data);
        });
    },

    resume: function () {
        cc.log(cc.director.getScheduler().isScheduled(this.gameMsgSchedule, this));
        cc.director.getScheduler().resumeTarget(this);
        this.btnOperate[0].active = true;
        this.btnOperate[1].active = false;
    },

    pause: function () {
        cc.director.getScheduler().pauseTarget(this);
        this.btnOperate[0].active = false;
        this.btnOperate[1].active = true;
    },

    playSpeed: function (event, data) {
        if (cc.director.getScheduler().isTargetPaused(this))
            this.resume();
        this.speed = (data == '1') ? (this.speed - 0.2) : (this.speed + 0.2);
        if (this.speed > 1.6)
            this.speed = 1.6;
        if (this.speed < 0.4)
            this.speed = 0.4;
        this.lblSpeed.string = '当前速度: x' + this.speed.toFixed(1);
        cc.director.getScheduler().setTimeScale(this.speed);
    },

    quit: function () {
        cache.replayData = null;
        cc.director.getScheduler().setTimeScale(1);
        cc.director.getScheduler().unscheduleAllForTarget(this);
        if (this.node)
            this.node.destroy();
        let nodeSelect = cc.find('Canvas/summarySelect');
        if (nodeSelect)
            nodeSelect.destroy();
    },

    gameMsgSchedule: function () {
        this.lblTime.string = new Date().format("hh:mm");
        if (this._delayTime > 0) {
            this._delayTime--;
            return;
        }
        if (this._queueGameMsg.length <= 0)
            return;
        let msg = this._queueGameMsg.shift();
        this.imgProgress.fillRange = 1 - (this._queueGameMsg.length / this.length);
        cc.log(msg.route);
        switch (msg.route) {
            case 'SC_RECORD':
                this.record(msg.data);
                cc.log(msg.data);
                break;

            case ROUTE.SC_ROUND_SUMMARY:
                cc.log(msg.data);
                this.roundSummary(msg.data);
                break;

            default:
                this.otherMsg(msg.data);
        }
    },

    otherMsg(data) {

    },

    record(data) {

    },

    roundSummary(data) {

    }

    // update (dt) {},
});
