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
        updateBtn: cc.Node,
        exitBtn: cc.Node,
        changeUserBtn: cc.Node,
        musicOff:cc.Node,
        musicOpen:cc.Node,
        soundOff:cc.Node,
        soundOpen:cc.Node,
        soundPage:cc.Node,
        infoPage:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
        this.refreshUI();
    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.updateBtn.on(cc.Node.EventType.TOUCH_END, this.onClickUpdate, this);
        this.exitBtn.on(cc.Node.EventType.TOUCH_END, this.onClickExit, this);
        this.changeUserBtn.on(cc.Node.EventType.TOUCH_END, this.onClickChange, this);
       
    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.updateBtn.off(cc.Node.EventType.TOUCH_END, this.onClickUpdate, this);
        this.exitBtn.off(cc.Node.EventType.TOUCH_END, this.onClickExit, this);
        this.changeUserBtn.off(cc.Node.EventType.TOUCH_END, this.onClickChange, this);
       
    },
    /**更新UI */
    refreshUI() {
        let musicVolume = utils.getValue(GameConfig.StorageKey.MusicVolume, 1);
        this.musicOff.active = musicVolume == 0;
        this.musicOpen.active = musicVolume == 1;

        let soundeVolume = utils.getValue(GameConfig.StorageKey.SoundVolume, 1);
        this.soundOff.active = soundeVolume == 0;
        this.soundOpen.active = soundeVolume == 1;

    },

    showSoundPage(){
        Cache.playSfx();
        this.soundPage.active=true;
        this.infoPage.active=false;
    },
    showInfoPage(){
        Cache.playSfx();
        this.soundPage.active=false;
        this.infoPage.active=true;
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
    closeSound(){
        Cache.playSfx();
        this.closeMusic();
        this.soundOff.active = true;
        this.soundOpen.active = false;
        AudioCtrl.getInstance().setSFXVolume(0);
        utils.saveValue(GameConfig.StorageKey.SoundVolume, 0);
    },
    openSound(){
        Cache.playSfx();
        this.openMusic();
        this.soundOff.active = false;
        this.soundOpen.active = true;
        AudioCtrl.getInstance().setSFXVolume(1);
        utils.saveValue(GameConfig.StorageKey.SoundVolume, 1);
    },
    /**切换用户 */
    onClickChange() {
        Cache.playSfx();
        // utils.pop(GameConfig.pop.ProblemPop);
        cc.director.loadScene("Login");
    },
    /**退出游戏 */
    onClickExit() {
        Cache.playSfx();
        Cache.showConfirm("是否退出游戏", () => {
            cc.game.end();
        })
    },
    /**检查更新 */
    onClickUpdate() {
        Cache.playSfx();
        cc.director.loadScene("Update");

    },
  
    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        this.removeEvents();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
});
