// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
const DOWNLOAD_STATUS = {
    WAIT: 0,
    START: 1,
    SUCCESS: 2,
    FAIL: 3
};
let DOWNLOAD_URL = "https://xyqp.online/update_media";
let db = require("../../Main/Script/DataBase") //require('DataBase');
let connector = require('Connector');
let cache = require('../../Main/Script/Cache');
let audioCtrl = require('audio-ctrl');
const { GameConfig } = require("../GameConfig");
cc.Class({
    extends: cc.Component,

    properties: {
        //toggleDialects: cc.Toggle,
        //btnDownLoad: cc.Node,
        //bgDownLoad: cc.Node,
        //imgProgressBar: cc.Sprite,
        preAudioLoad: cc.Prefab,
        downloadQueue: []
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    onLoad() {
        if (cc.sys.isNative)
            this.checkDownLoad();
        // db.setString(db.STORAGE_KEY.AUDIO[db.gameType],null);
        // db.setString(db.STORAGE_KEY.AUDIO_VERSION[db.gameType],null);
    },

    compareVersion(versionA, versionB) {
        if ('' == versionA)
            return -1;
        let vA = versionA.split('.');
        let vB = versionB.split('.');
        for (let i = 0; i < vA.length; ++i) {
            let a = parseInt(vA[i]);
            let b = parseInt(vB[i] || 0);
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    },

    checkDownLoad() {
        this.audioVersion = db.getString(db.STORAGE_KEY.AUDIO[db.gameType]);
        let localVersion = db.getString(db.STORAGE_KEY.AUDIO_VERSION[db.gameType]);
        let result = this.compareVersion(this.audioVersion, localVersion);

        if (result == 0 || result > 0) {
            return;
        }

        let game = db.gameType < 10 ? ("media0" + db.gameType) : ("media" + db.gameType);
        // let url = GameConfig.GameInfo.resourceURL+"update_media/" + game + ".json";
        let url = GameConfig.ConfigUrl + "update_media/" + game + ".json";
        console.log("下载地址: ", url);
        connector.get(url, "getJson", (resData) => {
            console.log("下载数据:", JSON.stringify(resData));
            resData.packageUrl = GameConfig.ConfigUrl + "update_media/";
            // resData.packageUrl=GameConfig.GameInfo.resourceURL+"update_media/";
            resData.remoteUrl = url;
            this.resData = resData;
            this.arrAssets = (Object).keys(this.resData.assets);
            this.startDownLoad();
        },false,(err)=>{
            cache.alertTip('音效下载失败');
        });

    },

    startDownLoad() {
        //this.countVoice = 0;
        this.bgAudioDownload = cc.instantiate(this.preAudioLoad);
        this.bgAudioDownload.parent = cc.find('Canvas');
        let bgProgress = this.bgAudioDownload.getChildByName('bgProgress');
        this.imgProgressBar = bgProgress.getChildByName('imgProgress').getComponent(cc.Sprite);
        this.imgProgressBar.fillRange = 0;
        this.lblProgress = this.bgAudioDownload.getChildByName('lbl').getComponent(cc.Label);
        this.lblProgress.string = '';
        let game = db.gameType < 10 ? ("Game0" + db.gameType) : ("Game" + db.gameType);
        console.log("下载音效  游戏名:", game)
        this.downloadQueue = [];
        for (let i = 0; i < this.arrAssets.length; i++) {
            this.arrAssets[i] = this.arrAssets[i].substring(7);
            let downloadInfo = {
                // url: GameConfig.ConfigUrl + 'update_media/' + game + '/' + this.arrAssets[i],
                url:  GameConfig.ConfigUrl+'update_media/' + game + '/' + this.arrAssets[i],
                path: this.arrAssets[i],
                count: 0
            };
            this.downloadQueue.push(downloadInfo);
            // this.download(downloadInfo);
        }
        this.downloadCounter = {
            total: this.downloadQueue.length,
            finish: 0
        };
        this.isStarted = true;
        try {
            this.downloadSchedule = this.schedule(function () {
                while (this.downloadQueue.length > 0) {
                    this.downLoad(this.downloadQueue.pop());
                }
                if (this.downloadCounter.total == this.downloadCounter.finish) {
                    this.unscheduleAllCallbacks(this.downloadSchedule);
                    //this.downloadSchedule = null;
                    this.isStarted = null;
                    this.success();
                }
                this.imgProgressBar.fillRange = this.downloadCounter.finish / this.downloadCounter.total;
                this.lblProgress.string = '正在下载语音包  ' + this.downloadCounter.finish + '/' + this.downloadCounter.total;
            }.bind(this), 0.1);
        } catch (error) {
            this.unscheduleAllCallbacks(this.downloadSchedule);
        }

    },

    success() {
        if (this.bgAudioDownload)
            this.bgAudioDownload.destroy();
        cache.alertTip("下载语音包完成");
        // cache.showTipsMsg('下载语音包完成',()=>{
        //     cc.log("asdkahkfhaskhfkashkfahsklhfaskhasfkhkasfhkfsahkfhfsah")    
        // });
        db.setString(db.STORAGE_KEY.AUDIO[db.gameType], this.resData.version);
    },

    failed(info, self) {
        // if(self.downloadSchedule == null)
        //     return;
        if (this.isStarted == null)
            return;
        if (!self.downloadQueue)
            return;
        if (info.count <= 4) {
            info.count++;
            self.downloadQueue.push(info);
            return;
        }
        info.count = 0;
        self.downloadQueue.push(info);
        self.downloadCounter = {
            total: self.downloadQueue.length,
            finish: 0
        };
        self.unscheduleAllCallbacks();
        this.isStarted = null;
        //self.downloadSchedule = null;
        if (self.bgAudioDownload)
            self.bgAudioDownload.destroy();
        cache.showConfirm('部分音效文件下载失败，需重新下载', () => {
            cc.log("重新下载");
            self.reLoad(self.downloadQueue, self);
        }, null);
        //this.btnDownLoad.active = true;
    },

    reLoad(failArr, self) {
        try {
            this.schedule(function () {
                while (failArr.length > 0) {
                    self.downLoad(failArr.pop());
                }
                if (self.downloadCounter.total == self.downloadCounter.finish) {
                    this.unscheduleAllCallbacks(self.downloadSchedule);
                    //this.downloadSchedule = null;
                    self.isStarted = null;
                    self.success();
                }
                // this.imgProgressBar.fillRange = this.downloadCounter.finish/this.downloadCounter.total;
                // this.lblProgress.string = '正在下载语音包  ' +  this.downloadCounter.finish + '/' + this.downloadCounter.total;
            }.bind(this), 0.1);
        } catch (error) {

        }

    },

    downLoad(info) {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.open("GET", info.url, true);
        xhr.responseType = "arraybuffer";
        cc.log(info.path, info.url);

        let game = db.gameType < 10 ? ("Game0" + db.gameType) : ("Game" + db.gameType);
        xhr.onreadystatechange = () => {
            cc.log(xhr.status);
            try {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                    let httpStatus = xhr.statusText;
                    let response = (xhr.response);
                    // cc.log('length');
                    // cc.log('length');
                    // cc.log('length');
                    cc.log(new Uint8Array(response).length);
                    cc.log(JSON.stringify(jsb.fileUtils));
                    if (!jsb.fileUtils.isDirectoryExist(jsb.fileUtils.getWritablePath() + "remote-asset"))
                        jsb.fileUtils.createDirectory(jsb.fileUtils.getWritablePath() + "remote-asset");
                    if (!jsb.fileUtils.isDirectoryExist(jsb.fileUtils.getWritablePath() + "remote-asset/Audio"))
                        jsb.fileUtils.createDirectory(jsb.fileUtils.getWritablePath() + "remote-asset/Audio");
                    if (!jsb.fileUtils.isDirectoryExist(jsb.fileUtils.getWritablePath() + "remote-asset/Audio/" + game))
                        jsb.fileUtils.createDirectory(jsb.fileUtils.getWritablePath() + "remote-asset/Audio/" + game);

                    jsb.fileUtils.writeDataToFile(new Uint8Array(response), jsb.fileUtils.getWritablePath() + "remote-asset/Audio/" + game + "/" + info.path);
                    cc.log(jsb.fileUtils.getWritablePath());
                    this.downloadCounter.finish++;
                } else {
                    // cc.log(this);
                    this.failed(info, this);
                }
            } catch (error) {
                this.failed(info, this);
            }

        };
        xhr.timeout = 10000;
        xhr.onerror = () => {
            cc.log('request onerror');
            this.failed(info, this);
        };
        xhr.ontimeout = () => {
            cc.log('request ontimeout');
            this.failed(info, this);
        };
        xhr.send(null);
    }
});
