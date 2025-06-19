let { GameConfig } = require("../../GameBase/GameConfig");
const Connector = require("../NetWork/Connector");
const utils = require("./utils");
const Cache = require("./Cache");
let Native = require("../Script/native-extend"); // require('native-extend');
let _social = Native.Social;
let db = require("../Script/DataBase") //require("DataBase");
const connector = require("../NetWork/Connector");
const JSEncrypt = require('./jsencrypt');

// const JSEncrypt = require("./jsencrypt");
const { SelectLink } = require("./SelectLink");
const { App } = require("../../script/ui/hall/data/App");
cc.Class({
    extends: cc.Component,

    properties: {

        manifestUrl: {
            default: null,
            type: cc.Asset
        },
        bar: cc.Sprite,
        lblMsg: cc.Label,
        inputContent:cc.Node,
        urlInput:cc.EditBox,

        btnRestart: cc.Node,
        _updating: false,
        _canRetry: false,
        _storagePath: '',
        spriteProgress: 0,
        serverProgress: 0,
    },
    onLoad() {
        // 第二步：场景加载之后，隐藏原生纯色背景View
        // 这里延迟1秒是为了更好的体验，实际可以不用 
        // utils.saveValue(GameConfig.StorageKey.UserToken, this.getQueryVariable('token'));
        GameConfig.enableLog = cc.sys.isBrowser;
        this.scheduleOnce(() => {
            this._hideNativeSplash();
            // let inviterStr = _social.getInviter();
            // GameConfig.InviteCode = utils.decodeInviter(inviterStr)
            // console.log("decodeInviter: ", JSON.stringify(GameConfig.InviteCode))

            GameConfig.DeviceID = "" + _social.getUUID();
            GameConfig.DeviceIDFA = "" + _social.getIDFA();

            this.lblMsg.string = "正在选择最优线路";
            this.selectLink = new SelectLink(this.onLoadSprite.bind(this), this.changeHotUrl.bind(this));


        }, 1);

        this.loadInfoTimes = 0;
        // GameConfig.ConfigUrl = 'http://hnmj.dfv0.com/';// data.resourceURL;

        if (cc.sys.isNative) {
            this.mainAudioVersion();
        }

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
            } else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        } else {
            return 0;
        }
    },

    mainAudioVersion() {
        // http://xy.shukecoffee.com/update_media/mediaMain.json
        // let audioVersion = db.getString(db.STORAGE_KEY.AUDIO_VERSION[db.gameType]);
        let url = GameConfig.ConfigUrl + "update_media/mediaMain.json";
        connector.get(url, 'getJson', (resData) => {
            // let [{"game":0,"version":"1.0.0"},{"game":2,"version":"1.0.0"},{"game":3,"version":"1.0.0"},{"game":4,"version":"1.0.0"},{"game":5,"version":"1.0.0"},{"game":6,"version":"1.0.0"},{"game":7,"version":"1.0.0"},{"game":8,"version":"1.0.0"},{"game":9,"version":"1.0.0"},{"game":10,"version":"1.0.0"},{"game":11,"version":"1.0.0"},{"game":12,"version":"1.0.0"},{"game":13,"version":"1.0.0"},{"game":16,"version":"1.0.0"},{"game":17,"version":"1.0.0"},{"game":18,"version":"1.0.0"},{"game":19,"version":"1.0.0"},{"game":20,"version":"1.0.0"},{"game":21,"version":"1.0.0"},{"game":22,"version":"1.0.0"},{"game":23,"version":"1.0.0"},{"game":25,"version":"1.0.0"},{"game":26,"version":"1.0.0"},{"game":27,"version":"1.0.0"},{"game":28,"version":"1.0.0"}]
            for (let i = 0; i < resData.length; i++) {
                let audioVersion = db.getString(db.STORAGE_KEY.AUDIO_VERSION[resData[i].game]);

                console.log('cse audioVersion', audioVersion)
                console.log('cse resData[i].game', resData[i].game)
                console.log('cse db.STORAGE_KEY.AUDIO_VERSION[resData[i].game]', db.STORAGE_KEY.AUDIO_VERSION[resData[i].game])
                let result = this.compareVersion(audioVersion, resData[i].version);
                if (result == 0 || result > 0) {

                } else {
                    db.setString(db.STORAGE_KEY.AUDIO_VERSION[resData[i].game], resData[i].version);
                }
            }
        }, true, null);
    },


    /**隐藏初始化默认背景 */
    _hideNativeSplash() {
        if (CC_JSB) {
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                // 反射调用原生的隐藏方法
                jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",
                    "hideSplash",
                    "()V"
                );
            }
        }
    },


    /**预加载图片资源 */
    onLoadSprite() {
        cc.director.preloadScene('Login');
        cc.director.preloadScene('Lobby');
        // _social.setCopy("测试复制粘贴")

        //加载资源进程归零
        this.lblMsg.string = "正在加载资源";

        this.spriteProgress = 0;
        this.bar.fillRange = 0;
        let preProgress = 1 / 7;
        //错误码
        let code = 1001;
        for (let key in GameConfig.ServerEventName) {
            GameConfig.ErrorCode[GameConfig.ServerEventName[key]] = '' + code;
            code++;
        }
        console.log("GameConfig.ErrorCode", GameConfig.ErrorCode)

        //牌桌背景
        for (let i = 0; i < 2; i++) {
            cc.loader.loadResDir('hallBg/bgTable' + i, cc.SpriteFrame, (err, SpriteFrame) => {
                if (!err) {
                    GameConfig.tableBgSprite[i] = SpriteFrame[0];
                    this.onLoadSpriteProgress(preProgress);
                }
            });
        }
        //头像图集
        cc.loader.loadResDir('head/touxiang', cc.SpriteAtlas, (err, SpriteAtlas) => {
            if (!err) {
                GameConfig.AvatartAtlas = SpriteAtlas[0];
                this.onLoadSpriteProgress(preProgress);
            }
        });
        //扑克牌图集
        cc.loader.loadResDir('Audio/porket_card', cc.SpriteAtlas, (err, SpriteAtlas) => {
            // cc.loader.loadResDir('card/porket_card', cc.SpriteAtlas, (err, SpriteAtlas) => {
            if (!err) {
                GameConfig.PorketAtlas = SpriteAtlas[0];
                this.onLoadSpriteProgress(preProgress);
            }
        });
        //wifi
        for (let i = 1; i <= 3; i++) {
            cc.loader.loadResDir('GameBase/0' + i, cc.SpriteFrame, (err, SpriteFrame) => {
                if (!err) {
                    GameConfig.WiFiSprite[i] = SpriteFrame[0];
                    this.onLoadSpriteProgress(preProgress);
                }
            });
        }

    },
    /**资源加载进度 */
    onLoadSpriteProgress(value) {

        this.spriteProgress += value;

        this.bar.fillRange = this.spriteProgress;

        if (this.spriteProgress >= 0.99) {
            this.scheduleOnce(() => {
                this.lblMsg.string = "正在选择更新线路";
                /**本地包 开关 */
                // this.inputContent.active=true;
                // return;
                if (cc.sys.isBrowser) {
                    this.onUpdateProgress();
                } else {
                    //TODO  选择最快更新地址
                    this.selectLink.selectHot();
                }
            }, 1);
        }

    },

    selectLinkUrl(){
        Connector.logicUrl = "http://"+this.urlInput.string+"/"
        this.getGameInfo();
    },

    changeHotUrl(url) {
        if (url == '') {
            this.onUpdateProgress('')
        } else {
            this.handleUpdateFail(url)
        }
    },

    /**热更新失败 修改热更新地址 */
    handleUpdateFail(newUrl) {
        if (GameConfig.IsDebug || cc.sys.isBrowser) {
            this.onUpdateProgress('')
            return;
        }
        var url = this.manifestUrl.nativeUrl;
        if (cc.loader.md5Pipe) {
            url = cc.loader.md5Pipe.transformURL(url);
        }
        this.modifyAppLoadUrlForManifestFile(newUrl, url, (path) => {
            this.onUpdateProgress(path);
        })

    },

    /**
         * 修改.manifest文件
         * @param {新的升级包地址} newAppHotUpdateUrl 
         * @param {本地project.manifest文件地址} localManifestPath 
         * @param {修改manifest文件后回调} resultCallback 
         */
    modifyAppLoadUrlForManifestFile(newAppHotUpdateUrl, localManifestPath, resultCallback) {
        try {
            this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset');

            if (jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath() + 'remote-asset/project.manifest')) {
                console.log("有下载的manifest文件");
                let storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset');
                let loadManifest = jsb.fileUtils.getStringFromFile(storagePath + '/project.manifest');
                let manifestObject = JSON.parse(loadManifest);
                manifestObject.packageUrl = newAppHotUpdateUrl;
                manifestObject.remoteManifestUrl = manifestObject.packageUrl + 'project.manifest';
                manifestObject.remoteVersionUrl = manifestObject.packageUrl + 'version.manifest';
                let afterString = JSON.stringify(manifestObject);
                let isWritten = jsb.fileUtils.writeStringToFile(afterString, storagePath + '/project.manifest');

                //更新数据库中的新请求地址，下次如果检测到不一致就重新修改 manifest 文件
                if (isWritten) {
                    cc.sys.localStorage.setItem("appHotUpdateUrl", newAppHotUpdateUrl);
                }
                resultCallback(storagePath + '/project.manifest');

            } else {
                console.log('不存在project.manifest');

                let initializedManifestPath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset');
                if (!jsb.fileUtils.isDirectoryExist(initializedManifestPath)) jsb.fileUtils.createDirectory(initializedManifestPath);
                //修改原始manifest文件
                let originManifestPath = localManifestPath;
                let originManifest = jsb.fileUtils.getStringFromFile(originManifestPath);
                let originManifestObject = JSON.parse(originManifest);
                originManifestObject.packageUrl = newAppHotUpdateUrl;
                originManifestObject.remoteManifestUrl = originManifestObject.packageUrl + 'project.manifest';
                originManifestObject.remoteVersionUrl = originManifestObject.packageUrl + 'version.manifest';
                let afterString = JSON.stringify(originManifestObject);
                let isWritten = jsb.fileUtils.writeStringToFile(afterString, initializedManifestPath + '/project.manifest');
                if (isWritten) {
                    cc.sys.localStorage.setItem("appHotUpdateUrl", newAppHotUpdateUrl);
                }
                resultCallback(initializedManifestPath + '/project.manifest');

            }

        } catch (error) {
            console.log("读写manifest文件错误!!!(请看错误详情-->) ", error);
        }

    },

    /**开始热更新进度 */
    onUpdateProgress(path) {


        this.btnRestart.active = false;
        this.lblMsg.string = "正在检测版本更新";

        // let inviterStr = _social.getInviter();
        // GameConfig.InviteCode = utils.decodeInviter(inviterStr)
        // console.log("decodeInviter: ", JSON.stringify(GameConfig.InviteCode))

        // Hot update is only available in Native build
        if (!cc.sys.isNative) {
            console.log("设备id: ", GameConfig.DeviceID)
            this.getGameInfo();
            return;
        }

        //获取设备id
        //TODO

        // if (CC_DEBUG) {
        //     this.getGameInfo();
        //     return;
        // }
        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset');
        // cc.log('Storage path for remote asset : ' + this._storagePath);
        // this.getGameInfo();
        // return
        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        let versionCompareHandle = function (versionA, versionB) {
            cc.gameVersion = versionA;
            // cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            let vA = versionA.split('.');
            let vB = versionB.split('.');
            for (let i = 0; i < vA.length; ++i) {
                let a = parseInt(vA[i]);
                let b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                } else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            } else {
                return 0;
            }
        };
        // Init with empty manifest url for testing custom manifest
        if (this._am)
            this._am = null;
        this._am = new jsb.AssetsManager(path, this._storagePath, versionCompareHandle);


        // let panel = this.panel;
        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this._am.setVerifyCallback((path, asset) => {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            let compressed = asset.compressed;
            // Retrieve the correct md5 value.
            let expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            let relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            // let size = asset.size;
            if (compressed) {
                // this.lblMsg.string = "Verification passed : " + relativePath;
                return true;
            } else {
                // this.lblMsg.string = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        });
        // for(let key in this){
        //     cc.log(key);
        // }
        // this.lblMessagec.log(cc.find("Canvas/bgLogin/lblMessage"));
        this.lblMsg.string = '检测更新';
        //
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._am.setMaxConcurrentTask(2);
            // this.lblMsg.string = "Max concurrent tasks count have been limited to 2";
        }
        this.bar.fillRange = 0;
        this.checkUpdate();
    },

    checkUpdate() {

        // this.btnRestart.active = false;
        if (this._updating) {

            this.lblMsg.string = '正在检测版本';
            return;
        }
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            // Resolve md5 url
            var url = this.manifestUrl.nativeUrl;
            if (cc.loader.md5Pipe) {
                url = cc.loader.md5Pipe.transformURL(url);
            }
            this._am.loadLocalManifest(url);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            this.lblMsg.string = '下载更新文件失败';
            this.btnRestart.active = true;
            return;
        }
        this._am.setEventCallback(null);
        this._am.setEventCallback(this.checkCb.bind(this));
        this._am.checkUpdate();
        this._updating = true;
    },

    restartGame() {
        cc.audioEngine.stopAll();
        cc.game.restart();
    },
    loadGame() {

        _social.openUrl('http://down.xyhldqp.com/download/index.html');
    },

    checkCb(event) {
        console.log('checkCode--------------: ' + event.getEventCode());
        let isCan = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST://0
                this.lblMsg.string = "本地文件读取失败";
                this.btnRestart.active = true;
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST://1
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST://2
                this.lblMsg.string = "下载版本文件失败";
                this.btnRestart.active = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE://4
                this.lblMsg.string = "已更新至最新版本";
                this.getGameInfo();

                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND://3
                this.lblMsg.string = '发现新版本,正在更新';
                this.bar.fillRange = 0;
                isCan = true;
                // setTimeout(() => {
                //     this.hotUpdate();
                // }, 200);
                break;
            default:
                return;
        }

        this._am.setEventCallback(null);
        this._checkListener = null;
        this._updating = false;

        if (isCan) {
            this.hotUpdate();
        }
    },

    hotUpdate() {
        if (this._am && !this._updating) {
            this._am.setEventCallback(this.updateCb.bind(this));

            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                // Resolve md5 url
                var url = this.manifestUrl.nativeUrl;
                if (cc.loader.md5Pipe) {
                    url = cc.loader.md5Pipe.transformURL(url);
                }
                this._am.loadLocalManifest(url);
            }

            this._failCount = 0;
            this._am.update();
            // this.panel.updateBtn.active = false;
            this._updating = true;
        }
    },
    updateCb(event) {
        console.log('updateCb--------------: ' + event.getEventCode());
        console.log('updateCb-------1-------: ' + event.getMessage());
        for (let key in event) {
            console.log('event key', key)
        }
        // event key getAssetsManagerEx
        // getDownloadedFiles
        // getTotalFiles
        // getAssetId
        // getTotalBytes
        // getCURLECode
        // getMessage
        // getCURLMCode
        // getDownloadedBytes
        // getPercentByFile
        // getEventCode
        // getPercent
        // isResuming

        let needRestart = false;
        let failed = false;
        let skip = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST://0
                try {
                    if (this.lblMsg)
                        this.lblMsg.string = '读取本地版本文件失败';
                } catch (error) {

                }
                this.btnRestart.active = true;
                failed = true;
                skip = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION://5
                this.bar.fillRange = event.getPercent();
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST://1
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST://2
                try {

                    if (this.lblMsg)
                        this.lblMsg.string = '读取远程版本文件失败';
                } catch (error) {

                }
                this.btnRestart.active = true;

                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE://4
                try {

                    if (this.lblMsg)
                        this.lblMsg.string = '已经是最新版本';
                } catch (error) {

                }
                failed = true;
                skip = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED://8

                try {

                    if (this.lblMsg)
                        this.lblMsg.string = '更新完成 ';
                } catch (error) {

                }
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED://9
                try {

                    if (this.lblMsg)
                        this.lblMsg.string = '更新失败 '; // + event.getMessage();
                } catch (error) {

                }
                this.btnRestart.active = true;

                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING://7
                try {
                    if (this.lblMsg)
                        this.lblMsg.string = '更新失败'; // + event.getAssetId() + ', ' + event.getMessage();
                } catch (error) {

                }
                this.btnRestart.active = true;
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS://10
                try {
                    if (this.lblMsg)
                        this.lblMsg.string = '解压缩失败'; // + event.getMessage();
                } catch (error) {

                }
                this.btnRestart.active = true;
                break;
            default:
                break;
        }

        if (skip) {

            this.getGameInfo();
            return;
        }
        if (failed) {
            this._am.setEventCallback(null);
            this._updateListener = null;
            this._updating = false;
            this.btnRestart.active = true;
        }

        if (needRestart) {
            this._am.setEventCallback(null);
            this._updateListener = null;
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            Array.prototype.unshift.apply(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            cc.audioEngine.stopAll();
            cc.game.restart();
        }
    },

    loadCustomManifest() {

        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            let manifest = new jsb.Manifest(customManifestStr, this._storagePath);
            this._am.loadLocalManifest(manifest, this._storagePath);
            // this.lblMsg.string = 'Using custom manifest';
        }
    },

    retry() {
        if (!this._updating && this._canRetry) {
            this._canRetry = false;

            this.lblMsg.string = 'Retry failed Assets...';
            this._am.downloadFailedAssets();
        }
    },


    /**获取游戏配置信息 */
    getGameInfo() {
  
        if (this.loadInfoTimes > 2) {
            Cache.showTipsMsg("无法连接服务器", () => {
                cc.game.end();
            });
            return;
        }
        GameConfig.ShowTablePop = false;
        if (this.loadInfoTimes == 0)
            this.lblMsg.string = "正在获取游戏配置";
        GameConfig.Encrtyptor = new JSEncrypt.JSEncrypt();
        GameConfig.Encrtyptor.getKey();
        connector.request(GameConfig.ServerEventName.GetPublicKey, {}, (data) => {
            utils.saveValue(GameConfig.StorageKey.TokenPKey, data.key);
        }, null, (err) => { });


        Connector.request(GameConfig.ServerEventName.GetGameInfo, {}, (data) => {

            if (data.data) {
                GameConfig.ConfigUrl = data.data.resourceUrl;
                GameConfig.NoticeUrl = data.data.noticeUrl;
                GameConfig.RecordUrl = data.data.recordUrl;
                GameConfig.HeadUrl = data.data.headUrl;
                GameConfig.DownloadUrl = data.data.download;
                GameConfig.RoomConfig = data.data.gameConfig;
                GameConfig.ShareUrl = data.data.shareUrl;
                for (let key in data.data) {
                    GameConfig.GameInfo[key] = data[key];

                }
            }

            this.judgeToken();
        }, null, (data) => {
            Cache.showTipsMsg(utils.isNullOrEmpty(data.message) ? "未获取到游戏配置" : data.message, () => {
                this.lblMsg.string = "重新获取游戏配置";
                this.loadInfoTimes++;
                this.getGameInfo();
            });
        });

    },


    /**判断token 是否自动登陆 */
    judgeToken() {
        // reCallInviter
        _social.reCallInviter();
        let userToken = utils.getValue(GameConfig.StorageKey.UserToken, "");
        if (utils.isNullOrEmpty(userToken)) {
            //本地没有token 跳转登陆界面
            cc.director.loadScene("Login");

        } else {
            //本地有token  自动登陆 跳转大厅界面
            this.lblMsg.string = "正在登陆";
            cc.director.loadScene("Lobby");
        }

    },
    // getQueryVariable(variable) {
    //     var query = window.location.search.substring(1);
    //     var vars = query.split("&");
    //     for (var i = 0; i < vars.length; i++) {
    //         var pair = vars[i].split("=");
    //         if (pair[0] == variable) { return pair[1]; }
    //     }
    //     return (false);
    // },
    onDestroy() {
        if (this._updateListener) {
            this._am.setEventCallback(null);
            this._updateListener = null;
        }
    }
});



