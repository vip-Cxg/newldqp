let ROUTE = require("ROUTE");
let db = require("DataBase");
let connector = require ('Connector');
let cache = require('Cache');
const AudioCtrl = require("./audio-ctrl");
cc.Class({
    extends: cc.Component,

    properties: {
        toggleCard: [cc.Toggle],
        imgMusicProgress: cc.Sprite,
        imgSoundProgress: cc.Sprite,
        sliderMusic: cc.Slider,
        sliderSound: cc.Slider,
        imgHandleOn: cc.Node,
        imgHandleOff: cc.Node,
        togBroadCast: cc.Toggle,
        bgContentTableSet: cc.Layout,
        bgContentSoundSet: cc.Layout,
        togSoundSet: cc.Toggle,
        togTableSet: cc.Toggle,
        bgSpriteFrame: [cc.SpriteFrame],
        togNoMusic: cc.Toggle,
        togNoSound: cc.Toggle,
        togBgSelect: [cc.Toggle],
        nodeSet: cc.Node,
        toggleLanguage: cc.Toggle,
        btnDissolve: cc.Node,
        btnLeave: cc.Node
    },

    onLoad: function () {
        this.setInit();
        cc.log('setInit');
    },

    show: function () {
        this.nodeSet.active = true;
    },

    hide: function () {
        this.nodeSet.active = false;
    },

    restart: function () {
        AudioCtrl.getInstance().stopAll();
        cc.game.restart();
    },

    setInit: function () {
        if(cc.find('Canvas/nodeTable'))
            this.btnDissolve.active = gameInfo.status > 1 ;
        let music = db.getFloat(db.STORAGE_KEY.SET_MUSIC, 1);
        let sound = db.getFloat(db.STORAGE_KEY.SET_SOUND, 1);
        let bg = db.getInt(db.STORAGE_KEY.SET_TABLE);
        this.sliderMusic.progress = music;
        this.imgMusicProgress.fillRange = this.sliderMusic.progress;
        this.togNoMusic.isChecked = music == 0;
        this.sliderSound.progress = sound;
        this.imgSoundProgress.fillRange = this.sliderSound.progress;
        this.togNoSound.isChecked = sound == 0;
        if (bg != -1) {
            this.togBgSelect.forEach((tableBg, i) => {
                tableBg.isChecked = (i == bg);
            });
        }
       

    },

    initCard: function () {
        let card = db.getInt(db.STORAGE_KEY.GAME_CARD);
        this.toggleCard.forEach((t,i)=>{
            t.isChecked = i == card;
        });
        db.card = card;
    },

    setCard: function (event,data) {
        db.card = parseInt(data);
        db.setInt(db.STORAGE_KEY.GAME_CARD,parseInt(data));
        let hands = cc.find('Canvas/nodeTable/bg2/hands').getComponent('Hands');
        hands.sortHands(true);
        let players =  cc.find('Canvas/nodeTable').getComponent('MainTable').players;
        players.forEach(player=>{
            player.sortQi();
            player.sortGroup();
        })
    },


    //音乐滑动器回调
    tableMusic: function (event) {
        cc.log(event);
        this.imgMusicProgress.fillRange = this.sliderMusic.progress;
        this.togNoMusic.isChecked = this.sliderMusic.progress == 0;
        AudioCtrl.getInstance().setBGMVolume(this.sliderMusic.progress);
        db.setFloat(db.STORAGE_KEY.SET_MUSIC, this.sliderMusic.progress);
    },

    //音效滑动器回调
    tableSound: function () {
        this.imgSoundProgress.fillRange = this.sliderSound.progress;
        this.togNoSound.isChecked = this.sliderSound.progress == 0;
        AudioCtrl.getInstance().setSFXVolume(this.sliderSound.progress);
        db.setFloat(db.STORAGE_KEY.SET_SOUND, this.sliderSound.progress);
    },
    //广播按钮回调
    broadCast: function () {
        this.imgHandleOn.active = this.togBroadCast.isChecked;
        this.imgHandleOff.active = !this.imgHandleOn.active;
    },
    //更换显示的层
    changeFrame: function () {
        this.bgContentSoundSet.node.active = this.togSoundSet.isChecked;
        this.bgContentTableSet.node.active = this.togTableSet.isChecked;
    },
    //禁音乐回调
    musicManage: function () {
        let volume = this.togNoMusic.isChecked ? 0 : 1;
        this.sliderMusic.progress = volume;
        this.imgMusicProgress.fillRange = volume;
        AudioCtrl.getInstance().setBGMVolume(volume);
        db.setFloat(db.STORAGE_KEY.SET_MUSIC, this.sliderMusic.progress);
    },
    //禁音效回调
    soundManage: function () {
        let volume = this.togNoSound.isChecked ? 0 : 1;
        this.sliderSound.progress = volume;
        this.imgSoundProgress.fillRange = volume;
        AudioCtrl.getInstance().setSFXVolume(volume);
        db.setFloat(db.STORAGE_KEY.SET_SOUND, this.sliderSound.progress);
    },
    //选择桌布，回调
    selectBgImg: function (event, data) {
        db.setInt(db.STORAGE_KEY.SET_TABLE,data);
        let node = cc.find('Canvas/nodeTable/bg2');
        if(node)
            node.getComponent(cc.Sprite).spriteFrame = this.bgSpriteFrame[parseInt(data)];
        else{
            node = cc.find('Canvas/bgTable');
            node.getComponent(cc.Sprite).spriteFrame = this.bgSpriteFrame[parseInt(data)];
        }

    },
    restartGame: function(){
        AudioCtrl.getInstance().stopAll();
        cc.game.restart();
    }
});
