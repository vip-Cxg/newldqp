const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const dataBase = require("../Script/DataBase");
const utils = require("../Script/utils");
const http = require("SceneLogin");
const { GameConfig } = require("../../GameBase/GameConfig");
const AudioCtrl = require("../Script/audio-ctrl");

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Node,
        PDKBtn: cc.Node,
        // XHZPBtn: cc.Node,
        XHZDBtn: cc.Node,
        LDZPBtn: cc.Node,
        web: cc.WebView
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
        this.refreshUI();
    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.PDKBtn.on(cc.Node.EventType.TOUCH_END, this.onClickPDK, this);
        // this.XHZPBtn.on(cc.Node.EventType.TOUCH_END, this.onClickXHZP, this);
        this.XHZDBtn.on(cc.Node.EventType.TOUCH_END, this.onClickXHZD, this);
        this.LDZPBtn.on(cc.Node.EventType.TOUCH_END, this.onClickLDZP, this);
    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.PDKBtn.off(cc.Node.EventType.TOUCH_END, this.onClickPDK, this);
        // this.XHZPBtn.off(cc.Node.EventType.TOUCH_END, this.onClickXHZP, this);
        this.XHZDBtn.off(cc.Node.EventType.TOUCH_END, this.onClickXHZD, this);
        this.LDZPBtn.off(cc.Node.EventType.TOUCH_END, this.onClickLDZP, this);
    },
    /**更新UI */
    refreshUI() {
        //默认显示跑得快
        this.web.url = GameConfig.ConfigUrl+"info/rule_pdk.HTML";//"http://www.p64sd.cn/rule/07.HTML";
    },
    /**跑的快 */
    onClickPDK() {
        Cache.playSfx();
        this.web.url = GameConfig.ConfigUrl+"info/rule_pdk.HTML";
    },
    /**新化字牌 */
    onClickXHZP() {
        Cache.playSfx();
        this.web.url = GameConfig.ConfigUrl+"info/rule_xhzp.HTML";
    },
    /**新化炸弹 */
    onClickXHZD() {
        Cache.playSfx();
        this.web.url = GameConfig.ConfigUrl+"info/rule_xhzd.HTML";
    },
    /**娄底字牌 */
    onClickLDZP() {
        Cache.playSfx();
        this.web.url = GameConfig.ConfigUrl+"info/rule_ldzp.HTML";

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
