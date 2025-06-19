let ROUTE = require("ROUTE");
let db = require("../../Main/Script/DataBase");
let gameInfo = require("TableInfo");
let connector = require('Connector');
const Cache = require("../../Main/Script/Cache");
const { GameConfig } = require("../GameConfig");
const utils = require("../../Main/Script/utils");
const AudioCtrl = require("../../Main/Script/audio-ctrl");
let bgUrl = ['', '', '', '', '', '', '', '', '', '', '', '', '', 'Canvas/nodeTable/bg2', ''];
cc.Class({
    extends: cc.Component,

    properties: {
        musicOff: cc.Node,
        musicOpen: cc.Node,
        soundOpen: cc.Node,
        soundOff: cc.Node,

        closeBtn: cc.Node,
        connectBtn: cc.Node,
        togBgSelect: [cc.Toggle]
    },
    onLoad: function () {
        this.addEvents();
        this.setInit();
    },


    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.connectBtn.on(cc.Node.EventType.TOUCH_END, this.onClickReconnect, this);
    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.connectBtn.off(cc.Node.EventType.TOUCH_END, this.onClickReconnect, this);
    },

    setInit: function () {

        let musicVolume = utils.getValue(GameConfig.StorageKey.MusicVolume, 1);
        this.musicOff.active = musicVolume == 0;
        this.musicOpen.active = musicVolume == 1;

        let soundeVolume = utils.getValue(GameConfig.StorageKey.SoundVolume, 1);
        this.soundOff.active = soundeVolume == 0;
        this.soundOpen.active = soundeVolume == 1;
        let tableBgIndex = utils.getValue(GameConfig.StorageKey.tableBgIndex, 0);
        this.togBgSelect[tableBgIndex].isChecked = true;
    },
    //选择桌布，回调
    selectBgImg: function (event, data) {
        Cache.playSfx();
        utils.saveValue(GameConfig.StorageKey.tableBgIndex, parseInt(data))
        let node = cc.find('Canvas/nodeTable/bg2');
        if (node) {
            node.getComponent(cc.Sprite).spriteFrame = GameConfig.tableBgSprite[parseInt(data)];
        }
    },

    closeMusic() {
        Cache.playSfx();
        this.musicOff.active = true;
        this.musicOpen.active = false;
        AudioCtrl.getInstance().setBGMVolume(0);
        utils.saveValue(GameConfig.StorageKey.MusicVolume, 0);
    },
    openMusic() {
        Cache.playSfx();
        this.musicOff.active = false;
        this.musicOpen.active = true;
        AudioCtrl.getInstance().setBGMVolume(1);
        utils.saveValue(GameConfig.StorageKey.MusicVolume, 1);
    },
    closeSound() {
        Cache.playSfx();
        this.soundOff.active = true;
        this.soundOpen.active = false;
        AudioCtrl.getInstance().setSFXVolume(0);
        utils.saveValue(GameConfig.StorageKey.SoundVolume, 0);
    },
    openSound() {
        Cache.playSfx();
        this.soundOff.active = false;
        this.soundOpen.active = true;
        AudioCtrl.getInstance().setSFXVolume(1);
        utils.saveValue(GameConfig.StorageKey.SoundVolume, 1);
    },
    /**重连 */
    onClickReconnect() {
        Cache.playSfx();
        AudioCtrl.getInstance().stopAll();
        cc.game.restart();
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
