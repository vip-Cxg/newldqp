let Cache = require("../Script/Cache"); // require("Cache");
const Connector = require("../NetWork/Connector"); //require("Connector");
let db = require("../Script/DataBase") //require("DataBase");
// let utils = require("utils");
const utils = require('../Script/utils');

//let calc = require("ModuleCalc27");
let audioCtrl = require("audio-ctrl");
const TABLE_TYPE = ["Game00", "Game01", "Game02", 'Game03', 'Game04', 'Game05', 'Game06', 'Game07', 'Game08', 'Game09', 'Game10', 'Game11', 'Game12', 'Game13', 'Game14', '', 'Game16', 'Game17', '', 'Game19', 'Game20', 'Game21', 'Game22', 'Game23', 'Game24', 'Game25', 'Game26', 'Game27', 'Game28', 'Game29'];
let TableInfo = require('TableInfo');
let { GameConfig } = require("../../GameBase/GameConfig");
let Native = require("../Script/native-extend"); // require('native-extend');
let _social = Native.Social;
let logic = require("Logic07");
const ROUTE = require("./ROUTE");
const { SelectLink } = require("./SelectLink");
const { App } = require("../../script/ui/hall/data/App");

let loginSuccessCallback = function (data) {
    if (utils.isNullOrEmpty(data.token)) {
        Cache.alertTip("登录失败")
        return;
    }
    db.player = data.player;
    db.connectInfo = data.connectInfo;
    if ((utils.isNullOrEmpty(data.version) || utils.versionCompareHandle(data.version, '1.0.0') <= 0) && data.connectInfo) {
        Connector.connect(data, () => {
            GameConfig.CurrentGameType = data.connectInfo.gameType;
            db.setGameType(db.GAME_TYPE[data.connectInfo.gameType]);
            cc.director.loadScene(db.TABLE_TYPE[data.connectInfo.gameType]);
        });
        return;
    }
    if ((utils.isNullOrEmpty(data.version) || utils.versionCompareHandle(data.version, '1.0.0') <= 0) && data.matchInfo) {
        utils.pop(GameConfig.pop.MatchPop, (node) => {
            node.getComponent("ModuleMatchPop").resumeMatch(data);
        });
        return;
    }
};


module.exports = {
    loginSuccessCallback
}

cc.Class({
    extends: cc.Component,

    properties: {
        lblVersion: cc.Label,
        winTips: cc.Prefab,
        testbtn: cc.Node,
        testContent: cc.Node
    },

    onLoad() {
        utils.fitScreen();

        GameConfig.DeviceID = "" + _social.getUUID();
        GameConfig.DeviceIDFA = "" + _social.getIDFA();

        this.loadPrefab(); // 加载游戏中的tips弹窗
        this.init();
        this.audioInit(); //ssssssss 初始化游戏音乐
        this.initGameType();
        cc.director.preloadScene('Lobby');
        cc.find("lblSchedule").getComponent(cc.Label).unscheduleAllCallbacks();
        let inviterStr = _social.getInviter();
        GameConfig.InviteCode = utils.decodeInviter(inviterStr)
        GameConfig.ShowTablePop = false;

        // new SelectLink(() => {
        //     Connector.request(GameConfig.ServerEventName.GetPublicKey, {}, (data) => {
        //         utils.saveValue(GameConfig.StorageKey.TokenPKey, data.key);
        //     }, false, () => { });

        // });
        App.Club.clear(); 
        // App.PushManager.disconnect();
        // this.createTestAccount();

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

    initGameType: function () {
        cc.game.addPersistRootNode(cc.find('winMask'));
        cc.game.addPersistRootNode(cc.find('lblSchedule'));
    },

    init() {
        if (cc.sys.os != cc.sys.OS_IOS && cc.sys.os != cc.sys.OS_ANDROID) {
            cc.gameVersion = GameConfig.DefaultVersion;
        }
        if (cc.gameVersion == null)
            cc.gameVersion = GameConfig.DefaultVersion;

        this.lblVersion.string = "版本号: " + cc.gameVersion;


    },


    loadPrefab() {
        let preTips = cc.instantiate(this.winTips);
        Cache.winTips = preTips.getComponent('ModuleWinTips');
    },

    audioInit: function () {
        // let bgmVolume = utils.getValue(GameConfig.StorageKey.MusicVolume, 1)
        // let SFXVolume = utils.getValue(GameConfig.StorageKey.SoundVolume, 1)
        // audioCtrl.getInstance().setBGMVolume(bgmVolume);
        // audioCtrl.getInstance().setSFXVolume(SFXVolume);
    },

    /**登录 */
    showLogin() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.LoginPop)
    },
    /**游客登录 */
    otherLogin() {
        // Cache.playSfx();
        // let self = this;
        // let encryptDevices = utils.encryptToken(GameConfig.DeviceID);
        // Connector.request(GameConfig.ServerEventName.UserLogin, { publicKey: GameConfig.Encrtyptor.getPublicKey(), deviceID: encryptDevices, install: GameConfig.InviteCode }, (data) => {
        //     if (data.success && data.token) {
        //         utils.saveValue(GameConfig.StorageKey.UserLoginTime, parseInt(new Date().getTime() / 1000));
        //         cc.director.loadScene("Lobby");

        //     }
        // }, null, (err) => {
        //     if (err.status.code == 502) {
        //         Cache.inputInviterPop("邀请码错误", (data) => {
        //             GameConfig.InviteCode = {
        //                 inviter: "" + data
        //             }
        //             self.wechatLogin();
        //         })
        //     } else {
        //         Cache.showTipsMsg(err.message);
        //     }
        // })
    },
    /**微信登录 */
    wechatLogin() {
        Cache.playSfx();
        let self = this;
        _social.wechatAuth();
        _social.wxLoginCallBack = (code) => {
            let encryptDevices = utils.encryptToken(GameConfig.DeviceID);
            // let encryptIdfa = utils.encryptToken(GameConfig.DeviceIDFA);
            Connector.request(GameConfig.ServerEventName.UserLogin, { publicKey: GameConfig.Encrtyptor.getPublicKey(), deviceID: encryptDevices, wechatCode: code }, (data) => {
                if (data.success && data.token) {
                    utils.saveValue(GameConfig.StorageKey.UserLoginTime, parseInt(new Date().getTime() / 1000));
                    cc.director.loadScene("Lobby");
                }
            }, true, (err) => {
                Cache.showTipsMsg(err.message || '登录失败');
            })
        }
        // _social.wxLoginCallBack = (res) => {
        //     let encryptDevices = utils.encryptToken(GameConfig.DeviceID);
        //     let encryptIdfa = utils.encryptToken(GameConfig.DeviceIDFA);
        //     Connector.request(GameConfig.ServerEventName.UserLogin, { publicKey: GameConfig.Encrtyptor.getPublicKey(), idfa: encryptIdfa, deviceID: encryptDevices, info: res }, (data) => {
        //         if (data.success && data.token) {
        //             utils.saveValue(GameConfig.StorageKey.UserLoginTime, parseInt(new Date().getTime() / 1000));
        //             cc.director.loadScene("Lobby");
        //         }
        //     }, null, (err) => {
        //         Cache.showTipsMsg(err.message||'登录失败');
        //     })
        // }
    },

    createTestAccount() {

        for (let i = 1; i <= 30; i++) {
            let btnNode = cc.instantiate(this.testbtn);
            // new cc.Node().active
            btnNode.active = true;
            btnNode.getChildByName('name').getComponent(cc.Label).string = '玩家' + i;
            btnNode._data ='2580ca9f-ac2e-4704-bac2-5d09dcab6571';//'test' + i;
            btnNode.on(cc.Node.EventType.TOUCH_END, this.ontestLogin, this);
            this.testContent.addChild(btnNode);
        }

    },

    ontestLogin(e, v) {
        // console.log('eeee',e);
        // console.log('vvvv',v);
        // let encryptDevices = utils.encryptToken('eb55be116c46cc41');
        // let encryptDevices = utils.encryptToken('7611e4d2-eb39-48a0-abba-ca7c5754600c');
        console.log('1231231',e.currentTarget)
        let encryptDevices = utils.encryptToken(e.currentTarget._data);
        Connector.request('game/test/login', { publicKey: GameConfig.Encrtyptor.getPublicKey(), deviceID:encryptDevices  }, (data) => {

        // Connector.request(GameConfig.ServerEventName.UserLogin, { deviceID: encryptDevices, publicKey: GameConfig.Encrtyptor.getPublicKey() }, (data) => {
            if (data.success && data.token) {
                utils.saveValue(GameConfig.StorageKey.UserLoginTime, parseInt(new Date().getTime() / 1000));
                cc.director.loadScene("Lobby");
            }
        }, true, (err) => {
            Cache.showTipsMsg(err.message || '登录失败');
        })
    },
    /**本机登录 */
    devicesLogin() {
        Cache.playSfx();
        let encryptDevices = utils.encryptToken(GameConfig.DeviceID);
        Connector.request(GameConfig.ServerEventName.UserLogin, { publicKey: GameConfig.Encrtyptor.getPublicKey(), deviceID: encryptDevices }, (data) => {
            if (data.success && data.token) {
                utils.saveValue(GameConfig.StorageKey.UserLoginTime, parseInt(new Date().getTime() / 1000));
                cc.director.loadScene("Lobby");
            }
        }, true, (err) => {
            Cache.showTipsMsg(err.message || '登录失败');
        })
    },

    /**清除本地存储数据 */
    onClearStorage() {
        Cache.playSfx();
        cc.sys.localStorage.clear();

        Connector.request(GameConfig.ServerEventName.GetPublicKey, {}, (data) => {
            Cache.alertTip("清除成功");
            utils.saveValue(GameConfig.StorageKey.TokenPKey, data.key);
        });
        // cc.game.restart();
    },
    onTestLocal() {
        // Cache.alertTip('地址换为 http://192.168.1.100:8000/')
        // Connector.logicUrl = 'http://192.168.1.100:8000/';
        let a = 'https://chatlink-new.meiqia.cn/widget/standalone.html?eid=9feccffbe0ea723a7ab49215e59a6c75'
        _social.openUrl(`${a}&metadata={"tel":"${DataBase.player.phone}","name":"${DataBase.player.name}","qq":"${DataBase.player.id}","addr":"xyqp"}`)
    },
    onTestOnline() {
        Cache.alertTip('地址换为 http://120.77.220.32:8000/')
        Connector.logicUrl = 'http://120.77.220.32:8000/';
    },

});

