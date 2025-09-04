let DataBase = require("../Script/DataBase")//require("DataBase");
let audioCtrl = require("audio-ctrl");
let Cache = require("../Script/Cache")//require('Cache');
let connector = require("../NetWork/Connector"); //require("Connector");
let Native = require('native-extend');
const utils = require("../Script/utils");

const { GameConfig } = require("../../GameBase/GameConfig");
const Connector = require("../NetWork/Connector");
const { PopupManager } = require("../../script/base/pop/PopupManager");
const { App } = require("../../script/ui/hall/data/App");
const { default: GameUtils } = require("../../script/common/GameUtils");
const { Social } = require("./native-extend");
let _social = Native.Social;
const TABLE_TYPE = [
    "Game00", "Game01", "Game02", 'Game03', 'Game04', 'Game05', 'Game06', 'Game07', 'Game08', 'Game09', 'Game10',
    'Game11', 'Game12', 'Game13', 'Game14', '', 'Game16', 'Game17', '', 'Game19', 'Game20', 'Game21', 'Game22', 'Game23',
    'Game24', 'Game25', 'Game27', 'Game28', 'Game29'
];

cc.Class({
    extends: require('HallBase'),

    properties: {
        lblVersion:cc.Label,
        sprHead: require('../../script/ui/common/Avatar'),//cc.Sprite,
        lblName: cc.Label,

        //大联盟积分
        lblLeagueScore: cc.Label,
        lblClubScore: cc.Label,
        lblId: cc.Label,
        lblNotice: cc.Label,
        speed: {
            default: 100,
            tips: '广播的速度'
        },
        DLMBtn: cc.Node,
        clubBtn: cc.Node,
        noClubInfo: cc.Node,
        clubInfo: cc.Node,
        lblClubName: cc.Label,
        lblClubID: cc.Label,
        lblClubRole: cc.Label,
        lblClubUserCount: cc.Label,
        lblClubOLCount: cc.Label,
        infoNode: cc.Node,

        adminNode: cc.Node,

        tradeBtn: cc.Node,

        updateBtn: cc.Node,
        settingBtn: cc.Node,

        infoBtn: cc.Node,
        noticeNode: cc.Node,

        updateWalletTime: 0,

    },
    onLoad() {
        // utils.fitScreen();   
        this.addEvents();
    },

    start() {
        DataBase.loadGameType();
        this.init();
        this.initHallBase();
    },

    init() {
        App.lockScene();
        GameConfig.IsConnecting = false;
        this.refreshPlayerData();  //玩家信息初始化
        this.initBGM(); //大厅音乐初始化
        this.initNotice(); // 大厅信息初始化
        let schedule = cc.find("lblSchedule");
        if (schedule) {
            schedule.getComponent(cc.Label).unscheduleAllCallbacks();
        }

        if (cc.sys.os != cc.sys.OS_IOS && cc.sys.os != cc.sys.OS_ANDROID) {
            cc.gameVersion = GameConfig.DefaultVersion;
        }
        if (cc.gameVersion == null)
            cc.gameVersion = GameConfig.DefaultVersion;

        this.lblVersion.string = "版本号: " + cc.gameVersion;


    },


    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_CHANGE, this.changeClubInfo, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.UPDATE_HALL_CLUB, this.updateClubInfo, this);
        // App.EventManager.addEventListener(GameConfig.GameEventNames.GOEASY_UPDATE_SERVICE, this.handleService, this);



        this.DLMBtn.on(cc.Node.EventType.TOUCH_END, this.showDLM, this);
        this.settingBtn.on(cc.Node.EventType.TOUCH_END, this.onClickSetting, this);
        this.infoBtn.on(cc.Node.EventType.TOUCH_END, this.onClickInfo, this);
        this.updateBtn.on(cc.Node.EventType.TOUCH_END, this.onClickRefresh, this);

        this.lblId.node.on(cc.Node.EventType.TOUCH_END, this.copyId, this);

        App.EventManager.addEventListener(GameConfig.GameEventNames.PLAYER_DATA_UPDATE, this.refreshPlayerData, this);






    },
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_CHANGE, this.changeClubInfo, this);

        App.EventManager.removeEventListener(GameConfig.GameEventNames.UPDATE_HALL_CLUB, this.updateClubInfo, this);

        this.DLMBtn.off(cc.Node.EventType.TOUCH_END, this.showDLM, this);
        this.settingBtn.off(cc.Node.EventType.TOUCH_END, this.onClickSetting, this);
        this.infoBtn.off(cc.Node.EventType.TOUCH_END, this.onClickInfo, this);
        this.updateBtn.off(cc.Node.EventType.TOUCH_END, this.onClickRefresh, this);

        App.EventManager.removeEventListener(GameConfig.GameEventNames.PLAYER_DATA_UPDATE, this.refreshPlayerData, this);

    },



    showBill() {
        this.bill.showBill();
    },


    exitGame() {
        Cache.showConfirm("是否退出游戏", () => {
            cc.game.end();
        });
    },



    initNotice() {
        if (utils.isNullOrEmpty(GameConfig.GameInfo.gameNotice)) return;
        this.noticeNode.active = true;
        this.lblNotice.string = GameConfig.GameInfo.gameNotice;
        setTimeout(() => {
            if (this.lblNotice) {
                this.lblNotice.node.stopAllActions();
                let distance = this.lblNotice.node.width + this.lblNotice.node.parent.width;
                let ap = cc.place(cc.v2(this.lblNotice.node.parent.width / 2, 0));
                let bp = cc.moveBy(distance / this.speed, cc.v2(-distance, 0));
                let cp = cc.sequence(ap, bp);
                let dp = cc.repeatForever(cp);
                this.lblNotice.node.runAction(dp);
            }
        }, 100)
    },

    initBGM() {
        let url = cc.url.raw(`resources/Audio/Common/HallMusi.mp3`);
        audioCtrl.getInstance().playBGM(url);
    },
    /**更新玩家数据 */
    refreshPlayerData() {
        Connector.request(GameConfig.ServerEventName.GetPlayerInfo, {}, (data) => {
            Cache.hideMask();
            if (data.ts)
                GameConfig.ServerTimeDiff = data.ts - new Date().getTime();
            if (data.player.hasBind)
                utils.saveValue(GameConfig.StorageKey.UserAccount, data.player.phone);
            utils.saveValue(GameConfig.StorageKey.UserLoginTime, parseInt(new Date().getTime() / 1000));
     
            if (!utils.isNullOrEmpty(data.xhzdConfig)) {
                GameConfig.xhzdConfig = data.xhzdConfig;
            }

            GameConfig.RewardConfig = utils.isNullOrEmpty(data.rewardConfig) ? [] : data.rewardConfig;
            // //TODO 
            // data.ad={
            //     matchTopAd:{adUrl:"BettingPop",imgUrl:'http://xh.kejiaoxy.com/active/ad_1.png',jumpType:'pop'},
            //     PDKSummaryAd:{},
            //     XHZDSummaryAd:{},
            //     LDZPGameSummaryAd:{},
            //     LDZPSummaryAd:{}
            // }
            this.adminNode.active = data.isSuperUser;
            data.player['isSuperUser']=data.isSuperUser;
            //广告数据
            if (!utils.isNullOrEmpty(data.ad)) {
                GameConfig.AdData = data.ad;
            } else {
                GameConfig.AdData = {};
            }

            //代理邀请
            if (!utils.isNullOrEmpty(data.inviteData)) {
                GameConfig.InviteList = data.inviteData;
            } else {
                GameConfig.InviteList = [];
            }

            //问卷调查 //TODO
            if (!utils.isNullOrEmpty(data.questionnaire)) {
                GameConfig.QuestData = data.questionnaire;
            } else {
                GameConfig.QuestData = {};
            }

            //公会信息
            if (!utils.isNullOrEmpty(data.clubs)) {
                App.Club.initClubData(data.clubs);
            }

            //有奖专区 //TODO
            // this.clubBtn.getComponent(cc.Button).interactable = !utils.isNullOrEmpty(data.fullMatch) && data.fullMatch;

            DataBase.player = data.player;


            DataBase.connectInfo = data.connectInfo;

            this.initPlayer();

            if (!utils.isNullOrEmpty(data.connectInfo)) {
                Connector.connect(data.connectInfo, () => {
                    GameConfig.CurrentGameType = data.connectInfo.data.gameType;
                    DataBase.setGameType(DataBase.GAME_TYPE[data.connectInfo.data.gameType]);
                    cc.director.loadScene(DataBase.TABLE_TYPE[data.connectInfo.data.gameType]);
                });
                return;
            }



            if(GameConfig.IsQuickStart){
      GameConfig.IsQuickStart = false;
                this.newMatchEnter();

                return;
            }



            App.unlockScene();

            if (data.matchInfo) {
                utils.pop(GameConfig.pop.MatchPop, (node) => {
                    node.getComponent("ModuleMatchPop").resumeMatch(data);
                });
                return;
            }
            
            if (GameConfig.ShowTablePop && App.Club.CurrentClubID != -1) {
                GameConfig.ShowTablePop = false;
                utils.pop(GameConfig.pop.TablePop)
            }
    
        }, true, (data) => {
            App.unlockScene();
            if (!utils.isNullOrEmpty(data.status) && data.status.code == 700) {
                Cache.showTipsMsg(utils.isNullOrEmpty(data.message) ? "版本号错误" : data.message, () => {
                    cc.director.loadScene("Update");
                });
                return;
            }

            //登录失败  跳转登陆界面
            Cache.showTipsMsg(utils.isNullOrEmpty(data.message) ? "长时间未登录，密码失效，请重新登录" : data.message, () => {
                cc.director.loadScene("Login");
            });
        });

    },

    /**初始化玩家信息 */
    initPlayer() {
        //昵称
        this.lblName.string = utils.getStringByLength(DataBase.player.name, 8);
        this.lblId.string = 'ID: ' + DataBase.player.id;
        //头像
        this.sprHead.avatarUrl = DataBase.player.head;
        //积分
        this.lblLeagueScore.string = "" + DataBase.player.card;
        //积分
        this.lblClubScore.string = "" + DataBase.player.diamond;

 
        this.changeClubInfo();
        // App.PushManager.connect();

    },
    
    newMatchEnter() {
        // let questData = { isAgain: true, roomID: [], gameType: 'LDZP', tableID: "", clubID: App.Club.CurrentClubID, isQuick: true };
        let questData = { isAgain: true, roomID: '', gameType: '', tableID: "", clubID: App.Club.CurrentClubID, isQuick: true };
        Connector.request(GameConfig.ServerEventName.JoinClubGame, questData, (data) => {
            GameConfig.ShowTablePop = true;
            Connector.connect(data, () => {
                GameConfig.CurrentGameType = data.data.gameType;
                DataBase.setGameType(DataBase.GAME_TYPE[data.data.gameType]);
                // Connector.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.START_ENTER_SCENE, gametype: data.data.gameType })
                cc.director.loadScene(DataBase.TABLE_TYPE[data.data.gameType]);
            });
        }, true, (err) => {
            Cache.showTipsMsg(err.message || "进入游戏失败");

        })
    },
    /**打开设置 */
    onClickSetting() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.SettingPop);
    },
    /**绑定手机 */
    onBindPhone() {
        Cache.playSfx();
           utils.pop(GameConfig.pop.ChangeDataPop, (pop) => {
            pop.getComponent("ModuleChangePop").refreshUIData("phone");
        })
    },
    onClickShare() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.SharePop);
    },

    /**会长上分 */
    onClickAdmin() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.AdminManagerPop);
    },

    /**转账积分 */
    ShowGiveScore() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.GiveScorePop);

    },

    /**打开个人中心 */
    onClickInfo() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.SettingPop);
    },
    // 

    /**活动的公会 */
    onClickActive() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.ClubListPop, (node) => {
            node.getComponent('ClubListPop').renderClub();
        });
    },

    onClickUpdate() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.ActivePop);
    },
    /**创建公会 */
    onClickCreate() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.CreateClubPop);

    },
   
    /**打开战绩 */
    onClickHistory() {

        //TODO 本地调试回放
        let gameid = '16';
        let url = "Main/HZMJ_146841_YH362QN5_1_1";
        cc.loader.loadRes(url, (err, res) => {
            console.log("本地链接", JSON.stringify(res.json))
            let resData = res.json;
            Cache.replayData = resData.concat();
            console.log('回放数据: ', resData)
            if (resData == null) {
                Cache.alertTip("暂无回放");
                return;
            }
            if (gameid == "") {
                Cache.alertTip("暂时无法播放");
                return
            }
            // 
            GameConfig.CurrentReplayData = '20240325/HZMJ_146841_YH362QN5_1_1'

            cc.loader.loadRes(`Main/Prefab/replay${gameid}`, (err, prefab) => {
                if (!err) {
                    let nodeReplay = cc.instantiate(prefab);
                    nodeReplay.parent = cc.find('Canvas');
                } else {
                    cc.log('error to load replay');
                }
            });
        })

        return;
        Cache.playSfx();
        utils.pop(GameConfig.pop.ClubHistoryListPop, (node) => {
            node.getComponent('ClubHistoryListPop').initUserID(DataBase.player.id);
        });
    },
    /**大联盟列表 */
    showClub() {
        // GameConfig.IsLeague = true;
        Cache.playSfx();
        utils.pop(GameConfig.pop.ClubListPop, (node) => {
            node.getComponent('ClubListPop').renderLeague();
        });
        // utils.pop(GameConfig.pop.RewardGameTable);

    },
    onClickFund() {
        Cache.playSfx();
        PopupManager.show(GameConfig.pop.ActiveCenterPop)

    },
    /**进入大联盟大厅大厅 */
    showDLM() {
        Cache.playSfx();
        if (App.Club.CurrentClubID == -1) {
            Cache.alertTip('没有加入公会');
            return;
        }

        utils.pop(GameConfig.pop.TablePop);
    },
    changeClubInfo() {
        if (App.Club.CurrentClubID == -1 || utils.isNullOrEmpty(App.Club.CurrentClubData)) {
            this.noClubInfo.active = true;
            this.clubInfo.active = false;
        } else {
            console.log('App.Club.CurrentClubData: ', App.Club.CurrentClubData)
            this.noClubInfo.active = false;
            this.clubInfo.active = true;
            this.lblClubName.string = '类型: ' + (App.Club.CurrentClubData.club.isLeague==1 ? '联盟' : '公会');
            this.lblClubID.string = '' + App.Club.CurrentClubData.club.name;
            this.lblClubRole.string = 'ID: ' + App.Club.CurrentClubID;
            this.lblClubUserCount.string = '' + GameConfig.ROLE_DESC[App.Club.CurrentClubData.role];
            this.lblClubOLCount.string = '人数: ' + App.Club.CurrentClubData.peoples;
        }
    },

    /**刷新用户数据 */
    onClickRefresh() {
        Cache.playSfx();
        let nowTime = utils.getTimeStamp();
        if (nowTime - this.updateWalletTime < 3000) {
            return;
        }
        this.updateWalletTime = nowTime;
        this.refreshPlayerData();
    },
    /**复制id */
    copyId() {
        Cache.playSfx();
        Cache.alertTip("id复制成功");
        _social.setCopy("" + DataBase.player.id);
    },

  
   

    //TODO
    updateClubInfo() {
        console.log('---刷新公会----')
        Connector.request(GameConfig.ServerEventName.GetPlayerInfo, {}, (data) => {
            if (data.ts)
                GameConfig.ServerTimeDiff = data.ts - new Date().getTime();
            if (data.player.hasBind)
                utils.saveValue(GameConfig.StorageKey.UserAccount, data.player.phone);
            utils.saveValue(GameConfig.StorageKey.UserLoginTime, parseInt(new Date().getTime() / 1000));
      
            if (!utils.isNullOrEmpty(data.xhzdConfig)) {
                GameConfig.xhzdConfig = data.xhzdConfig;
            }

  
            GameConfig.RewardConfig = utils.isNullOrEmpty(data.rewardConfig) ? [] : data.rewardConfig;
            //广告数据
            if (!utils.isNullOrEmpty(data.ad)) {
                GameConfig.AdData = data.ad;
            } else {
                GameConfig.AdData = {};
            }

            //代理邀请
            if (!utils.isNullOrEmpty(data.inviteData)) {
                GameConfig.InviteList = data.inviteData;
            } else {
                GameConfig.InviteList = [];
            }

            //问卷调查 //TODO
            if (!utils.isNullOrEmpty(data.questionnaire)) {
                GameConfig.QuestData = data.questionnaire;
            } else {
                GameConfig.QuestData = {};
            }

            //公会信息
            if (!utils.isNullOrEmpty(data.clubs)) {
                App.Club.initClubData(data.clubs);
            }

            DataBase.player = data.player;


            DataBase.connectInfo = data.connectInfo;

            this.initPlayer();

        });
    },


    onDestroy() {
        this.removeEvents();
    }
});




