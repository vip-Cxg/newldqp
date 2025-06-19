let tbInfo = require('TableInfo');
let cache = require('Cache');
const utils = require('../Main/Script/utils');
cc.Class({
    extends: cc.Component,

    properties: {
        imgReady: cc.Node,
        // imgHost: cc.Node,
        imgActive: cc.Node,
        sprDefaultHead: cc.SpriteFrame,
        imgOffline: cc.Node,
        imgZhuang: cc.Node,
        imgHead: cc.Sprite,
        lblName: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    //RealIdx
    newPlayer(idx) {
        this._scores = [0, 0, 0, 0];
    },

    playerInit(data, record) {
        this._scores = [0, 0, 0, 0];
        this.idx = data.idx;
        this.realIdx = tbInfo.realIdx[data.idx];
        utils.setHead(this.imgHead, data.prop.head);
        this.imgReady.active = data.ready;
        if (this.realIdx == 1)
            this.imgReady.x = -this.imgReady.x;
        this.imgHost.active = (data.idx == 0 && !tbInfo.config.clan);
        this.imgOffline.active = data.offline;
        tbInfo.players[data.idx] = data;
        this.lblName.string = data.prop.name;
        this.imgZhuang.active = this.idx == tbInfo.zhuang;
        this.initOther(data);

        if (data.idx != tbInfo.idx && !record) {
            this.node.on('touchend', () => {
                //audioCtrl.getInstance().playSFX(this.sfxAudioClips);
                cc.log('touchend');
                this.showInfo(data)
            })
        }
    },

    showInfo: function (data) {
        let myDate = new Date();
        let currentTime = myDate.getTime();
        if (currentTime - this.lastTime < 2000) {
            cache.alertTip("发言间隔需要2秒");

            return;
        }
        let idx = this.idx;
        let newEvent = new cc.Event.EventCustom('playerInfo', true);
        newEvent.detail = { idx: idx };
        this.node.dispatchEvent(newEvent);
    },


    reset() {
        this.lblName.string = '空闲';
        this.imgReady.active = false;
        this.imgHost.active = false;
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

    showReady() {
        this.imgReady.active = true;
    },

    hideReady() {
        this.imgReady.active = false;
    },

    resetOther() {
        //子类重写
    },

    initOther(data) {
        //重写
    },

    // update (dt) {},
});
