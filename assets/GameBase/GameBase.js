let db = require('DataBase');
let audioCtrl = require('audio-ctrl');
let utils = require("../Main/Script/utils");
const { GameConfig } = require('./GameConfig');
const Cache = require('../Main/Script/Cache');
const { App } = require('../script/ui/hall/data/App');
cc.Class({
    extends: cc.Component,

    properties: {
        // voiceCtrlButton: cc.Node,
        lblPhoneTime: cc.Label,
        dtCount: 0
    },

    // LIFE-CYCLE CALLBACKS:

    playManageAudio  (msg) {

        let game = db.gameType < 10 ? ("Game0" + db.gameType) : ("Game" + db.gameType);
        if (!cc.sys.isNative) {
            return;
        }
        let url = jsb.fileUtils.getWritablePath() + "remote-asset/Audio/" + game + "/" + msg;

        cc.loader.load(url, (err, data) => {
            if (!err) {
                let audioCtrl = require("audio-ctrl");
                audioCtrl.getInstance().playSFX(data);
            }
        });
    },

    reconnectGame(){
        audioCtrl.getInstance().stopAll();
        cc.game.restart();
    },

    initGameBase(hn = false) {
        utils.fitScreen();
        App.unlockScene();
        this.tableBgmInit(hn);
        this.voteStatus = false;
        //this.gps = null;
        this.chat = null;
        this.vote = null;
        this.set = null;
        this.playerInfo = null;
        this.lastClickChat = new Date().getTime();
        this.initChat();

        // this.initVote();
        // this.initVoice();
        // this.showPlayerInfo();
        // this.initPlayerInfo();
        // this.initAudioManage();
        //this.initGps();
        //TODO
        // this.handleTrade();
        
    },
    removeGoEasyEvents() {
    },
    tableBgmInit(hn = false) {
        let url = cc.url.raw(`resources/Audio/Common/TableMusic.mp3`);
        // if (hn)
        //     url = cc.url.raw(`resources/Audio/Common/hnbg.mp3`);
        audioCtrl.getInstance().playBGM(url);
        // audioCtrl.getInstance().playBGM(this.bgmClip);
    },
    removeDir  () {
        let game = db.gameType < 10 ? ("Game0" + db.gameType) : ("Game" + db.gameType);
        if (jsb.fileUtils.isDirectoryExist(jsb.fileUtils.getWritablePath() + "remote-asset")) {
            jsb.fileUtils.removeDirectory(jsb.fileUtils.getWritablePath() + "remote-asset");
            db.setString(db.STORAGE_KEY.AUDIO[db.gameType], "");
        }
    },
    // initVoice() {
    //     cc.loader.loadRes("GameBase/preVoice", (err, prefab) => {
    //         if (!err) {
    //             this.winVoice = cc.instantiate(prefab).getComponent('ModuleVoice');
    //             this.winVoice.controlBtn = this.voiceCtrlButton;
    //             this.winVoice.node.parent = cc.find('Canvas');
    //             //this.winVoice.init();
    //         } else {
    //             //cc.log('initVoice error');
    //             //this.initVoice();
    //         }
    //     });
    // },

    showGps() {

    },

    showSet () {
        Cache.playSfx();
        utils.pop(GameConfig.pop.GameSetting);
    },

    initChat  () {
        cc.loader.loadRes("GameBase/preChat", (err, prefab) => {
            if (!err) {
                this.chat = cc.instantiate(prefab).getComponent('ModuleChat');
                let newEvent = new cc.Event.EventCustom('chatAlready', true);
                if (this.node)
                    this.node.dispatchEvent(newEvent);
            } else {
                this.initChat();
            }
        });
    },

    showChat  () {
        if (this.chat == null)
            return;


        Cache.playSfx();
        let nowTime = new Date().getTime();
        if (nowTime - this.lastClickChat < 1000) {
            return;
        }
        this.lastClickChat = nowTime;

        this.chat.showChat();
        // }
    },

    restartGame  () {
        audioCtrl.getInstance().stopAll();
        cc.game.restart();
    },

    addEvents() { },
    removeEvents() { },
    update(dt) {
        this.dtCount++;
        if (this.dtCount % 60) {
            this.dtCount = 0;
            let date = new Date();
            let h = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ':';
            let m = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
            if (this.lblPhoneTime)
                this.lblPhoneTime.string = h + m;
        }
    },
    onDestroy() {
        this.removeEvents();
        this.removeGoEasyEvents();
    }

});
