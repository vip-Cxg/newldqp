const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const dataBase = require("../Script/DataBase");
const utils = require("../Script/utils");
const http = require("SceneLogin");
let { GameConfig } = require("../../GameBase/GameConfig");
const AudioCtrl = require("../Script/audio-ctrl");

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Node,
        tipsBtn: cc.Node,
        activeBtn: cc.Node,
        updateBtn: cc.Node,

        updateInfo: cc.Node,
        web: cc.WebView

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
        this.refreshUI();
    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.tipsBtn.on(cc.Node.EventType.TOUCH_END, this.onClickTips, this);
        this.activeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickActive, this);
        this.updateBtn.on(cc.Node.EventType.TOUCH_END, this.onClickUpdate, this);
    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.tipsBtn.off(cc.Node.EventType.TOUCH_END, this.onClickTips, this);
        this.activeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickActive, this);
        this.updateBtn.off(cc.Node.EventType.TOUCH_END, this.onClickUpdate, this);
    },
    /**更新UI */
    refreshUI() {
        this.web.url = GameConfig.ConfigUrl + "info/update.html";
        console.log('h5地址--- ', this.web.url)
    },
    /**公告 */
    onClickTips() {
        Cache.playSfx();
        this.web.url = GameConfig.ConfigUrl + "info/gonggao.html";
    },
    /**活动 */
    onClickActive() {
        Cache.playSfx();
        this.web.url = GameConfig.ConfigUrl + "info/huodong.html";
    },

    onClickUpdate() {
        Cache.playSfx();
        this.web.url = GameConfig.ConfigUrl + "info/update.html";
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
