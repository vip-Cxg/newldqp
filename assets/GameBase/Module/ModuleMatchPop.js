
const Connector = require("../../Main/NetWork/Connector");
const Cache = require("../../Main/Script/Cache");
const ROUTE = require("../../Main/Script/ROUTE");
const utils = require("../../Main/Script/utils");
const DataBase = require("../../Main/Script/DataBase");
const { GameConfig } = require("../GameConfig");
const { App } = require("../../script/ui/hall/data/App");
const UPDATE_TIME = 5;
const MATCH_STATUS = {
    wait: { desc: '等待', color: "#43AFFF" },
    agree: { desc: '同意', color: "#00d900" },//绿
    refuse: { desc: '拒绝', color: "#ff2d2d" },//红
}
cc.Class({
    extends: cc.Component,

    properties: {
        joinTips: cc.Node,
        closeBtn: cc.Node,

        statusTips: cc.Label,
        matchTime: cc.Label,
        tipsNode: cc.Node,
        warnning: cc.Label,
        tips: cc.Label,
        lblQueue: cc.Label,
        rankNode: [cc.Node],
        rankContainer: cc.Node,
        rankAvatar: [require('../../script/ui/common/Avatar')],
        progressBar: cc.ProgressBar,
        matchInfoNode: cc.Node,
        matchQueue: [cc.Node],
        agreeBtn: cc.Node,
        refuseBtn: cc.Node,
        lblOperatime: cc.Label,
        adComponent: require('../../script/ui/ad/AdComponent'),
        matchDowntime: 0,
        interval: 0,
        /**延时 */
        _delayTime: 0,
        /**处理匹配信息ing */
        _handleData: false,
        matchID: null
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (!utils.isNullOrEmpty(GameConfig.AdData) && !utils.isNullOrEmpty(GameConfig.AdData.matchTopAd)) {
            this.adComponent.showAd();
            this.adComponent.initAd(GameConfig.AdData.matchTopAd);

        } else {
            this.adComponent.hideAd();
        }


        let strArr = [
            "公平游戏，你好我好大家好，作弊不可取，举报系统头上顶，杀完猪了就封你。",
            "游戏内设举报功能，经系统核实，被举报者会受到相应的处罚，例如罚款，严重者即封号。",
            "举报及拉黑，不用担心排一起，也不用担心被合伙。",
            "打牌不是英雄联盟，王者荣耀，请不要团队合作。",
            "合作作弊一时爽，钱号两空无处找。",
        ];
        this.warnning.string = "" + strArr[Math.floor(Math.random() * 5)];
        if (!utils.isNullOrEmpty(GameConfig.TaskData)) {
            this.tips.string = GameConfig.TaskData.word
            if (!utils.isNullOrEmpty(GameConfig.TaskData.rank)) {
                this.rankContainer.active = true;
                GameConfig.TaskData.rank.forEach((e, i) => {
                    if (e.user.head)
                        this.rankAvatar[i].avatarUrl = e.user.head
                    this.rankNode[i].getChildByName("name").getComponent(cc.Label).string = '' + utils.getStringByLength(e.user.name, 4)
                    this.rankNode[i].getChildByName("score").getComponent(cc.Label).string = '' + e.reward / 100 + "元";
                });
            }

        }
        // if (GameConfig.isNewMatch) {
        //     this.matchTiming();
        //     this.updateMatch();
        //     this.schedule(() => {
        //         this.updateMatch();
        //     }, UPDATE_TIME);
        // }

    },

    /**开始匹配 */
    startMatch(roomID) {
        // this.showMatchInfo();
        // return;
        //获取ip
        utils.getIP().then((res) => {
            if (utils.isNullOrEmpty(res))
                res = "186.186.186." + Math.floor(Math.random() * 256);
            this.JoinMatch(roomID, res)
        }).catch((err) => {
            var ip = "186.186.186." + Math.floor(Math.random() * 256);
            this.JoinMatch(roomID, ip)
        })

    },
    JoinMatch(roomID, ip) {
        //发起匹配请求
        Connector.request(GameConfig.ServerEventName.JoinMatch, { roomID: roomID,clubID:App.Club.CurrentClubID, location: Cache.location, ip: ip }, (data) => {
            if (!utils.isNullOrEmpty(data.queue))
                this.lblQueue.string = "当前队列人数: " + data.queue;
                this.matchTiming();
                this.updateMatch();
                this.schedule(() => {
                    this.updateMatch();
                }, UPDATE_TIME);


        }, true, (err) => {
            // if (err.status && err.status.code && err.status.code == 606) {

            //     this.matchTiming();
            //     this.updateMatch();
            //     this.schedule(() => {
            //         this.updateMatch();
            //     }, UPDATE_TIME);
            //     this.closeBtn.active = true;
            //     return;
            // }
            //TODO 正在排队---matchinfo   超时报错--关闭匹配界面
            Cache.showTipsMsg(utils.isNullOrEmpty(err.message) ? "匹配错误" : err.message, () => {
                if (this.node) {
                    this.node.removeFromParent();
                    this.node.destroy();
                }
            });
        })
    },

    /**重连 恢复匹配 */
    resumeMatch(data) {
        this.joinTips.active = false;
        this.matchTiming();
        this.updateMatch();
        this.schedule(() => {
            this.updateMatch();
        }, UPDATE_TIME);
    },


    /**匹配数据处理完成 删除数据 */
    handleDataSuccess() {
        this._handleData = false;
    },

    /**更新匹配信息 */
    updateMatch() {
        //获取新的匹配数据
        // DataBase.player.id=101395;
        Connector.request(GameConfig.ServerEventName.MatchInfo, {}, (data) => {
            // if ((utils.isNullOrEmpty(data.version) || utils.versionCompareHandle(data.version, '1.0.0') <= 0)) {
                // this.handleDataSuccess();
                if (!utils.isNullOrEmpty(data.queue))
                    this.lblQueue.string = "当前队列人数: " + data.queue;


                
                // if (!utils.isNullOrEmpty(data.expire))
                //     this.matchDowntime = data.expire;

                // if (!utils.isNullOrEmpty(data.refuse)) {
                //     Cache.showTipsMsg("有玩家拒绝了游戏")
                //     this.matchTime.unscheduleAllCallbacks();
                //     this.unscheduleAllCallbacks();
                //     if (this.node) {
                //         this.node.removeFromParent();
                //         this.node.destroy();
                //     }
                //     return;
                // }
                if (data.connectInfo) {
                    this.matchTime.unscheduleAllCallbacks();
                    this.unscheduleAllCallbacks();
                    GameConfig.ShowTablePop = true;
                    Connector.connect(data.connectInfo, () => {
                        try {
                            GameConfig.CurrentGameType = data.connectInfo.data.gameType;
                            DataBase.setGameType(DataBase.GAME_TYPE[data.connectInfo.data.gameType]);
                            cc.director.loadScene(DataBase.TABLE_TYPE[data.connectInfo.data.gameType]);
                        } catch (error) {
                            cc.director.loadScene('Lobby');
                        }
                    });
                    return;
                }

                if (!data.matchInfo) {
                    //移除计时器
                    Cache.alertTip("匹配已退出")
                    this.matchTime.unscheduleAllCallbacks();
                    this.unscheduleAllCallbacks();
                    if (this.node) {
                        this.node.removeFromParent();
                        this.node.destroy();
                    }
                    return;
                }
                this.joinTips.active = false;
                this.closeBtn.active = true;

                // //TODO
                // if (!utils.isNullOrEmpty(data.matchInfo.matchID)) {
                //     this.matchID = data.matchInfo.matchID;
                // }
                // if (!utils.isNullOrEmpty(data.users)) {
                //     // this.unscheduleAllCallbacks();
                //     //隐藏退出按钮
                //     this.closeBtn.active = false;
                //     this.tipsNode.active = true;
                //     this.statusTips.string = "匹配成功";
                //     this.showMatchInfo(data.users);
                // } else {
                //     this.matchInfoNode.active = false;

                // }
            // } else {
            //     if (!utils.isNullOrEmpty(data.connectInfo)) {

            //         this.matchTime.unscheduleAllCallbacks();
            //         this.unscheduleAllCallbacks();
            //     }
            // }


        }, null, (err) => {
            // this._handleData = false;
            if (err.type && err.type == GameConfig.ErrorType.Timeout ) {

                return;
            }
            
            // if()
            if (!cc.find('Canvas/WinConfirm'))
                Cache.showTipsMsg(err.message || '匹配已退出')



            if (this.node) {
                this.matchTime.unscheduleAllCallbacks();
                this.unscheduleAllCallbacks();
                this.node.removeFromParent();
                this.node.destroy();
            }
        })
    },

    handleMatchInfo(data) {
        this.joinTips.active = false;
        if (utils.isNullOrEmpty(data.matchInfo)) {
            return;
        }
        if (!utils.isNullOrEmpty(data.matchInfo.queue))
            this.lblQueue.string = "当前队列人数: " + data.matchInfo.queue;

        if (!utils.isNullOrEmpty(data.expire))
            this.matchDowntime = data.expire;
        if (!utils.isNullOrEmpty(data.matchInfo)) {
            switch (data.matchInfo.code) {
                case 1000://匹配中
                    this.closeBtn.active = true;
                    break;
                case 3000: ///匹配成功,确认中

                    if (!utils.isNullOrEmpty(data.matchResult)) {
                        //隐藏退出按钮
                        this.closeBtn.active = false;
                        this.tipsNode.active = true;
                        this.statusTips.string = "匹配成功";

                        this.matchDowntime = data.matchResult.expire;
                        this.matchID = data.matchResult.matchID;

                        this.showMatchInfo(data.matchResult.players)
                    } else {
                        this.matchInfoNode.active = false;
                    }

                    //     REJECT: 2001, //在match中匹配到了,但是修改状态失败被抛出
                    //     REFUSE: 4100, //匹配成功确认过程中主动拒绝
                    //     REFUSED: 4001, //匹配成功确认过程中其他玩家拒绝
                    //     UNRESPONSE: 4101, //匹配成功确认过程中未响应导致超时
                    //     TIMEOUT: 4002, //匹配成功确认过程中其他玩家未响应导致超时
                    //     CANCEL: 2100, //匹配中取消匹配
                    //     UNCATCH: 4102, //创建房间时出现未知错误,错误详情查看日志
                    //     MONEY: 4103  //创建房间时有玩家金币不足
                    // }

                    break;

                case 2001:
                    Cache.alertTip('加入游戏失败')
                    break;
                case 4100:
                    Cache.alertTip('已拒绝进入游戏')
                    break;
                case 4001:
                    Cache.alertTip('其他玩家拒绝进入游戏')
                    break;
                case 4101:
                    Cache.alertTip('响应超时,房间已解散')
                    break;
                case 4002:
                    Cache.alertTip('其他玩家响应超时,房间已解散')
                    break;
                case 4102:
                    Cache.alertTip('加入房间失败,请稍后再试')
                    break;
                case 4103:
                    Cache.alertTip('有玩家金币不足,无法开始游戏')
                    break;
                case 2100://取消匹配
                    break;
                default:
                    break;
            }

            if (data.matchInfo.status == 'END') {
                this.matchTime.unscheduleAllCallbacks();
                this.unscheduleAllCallbacks();
                this.node.destroy();
            }

        }


        return;
        // data={"success":true,"status":0,"message":null,"detail":null,"queue":53,"roomID":10014,"matchInfo":{"id":101395,"time":1626693919089,"exclude":[],"blackList":[100012,106484,107005,107073,107307],"status":"SUCCESS","refuse":0,"worth":-96008,"ip":"2409:8928:4c34:ad:8c0e:f305:1e0a:a611","turn":1824,"expire":1626694119089,"matchID":"4b098eef-e22c-4b56-87da-a9707b306d38"},"users":[{"id":"101395","friend":false,"status":"agree"},{"id":"107260","friend":true,"status":"agree"},{"id":"107302","friend":true,"status":"agree"},{"id":"107405","friend":true,"status":"agree"}],"url":"ws://47.119.112.8:62443/XHZD/","expire":"1626693970028"}

    },



    /**取消进入游戏 */
    cancelEnterGame() {
        Cache.playSfx();
        this.matchTime.unscheduleAllCallbacks();
        this.unscheduleAllCallbacks();
        //取消游戏
        // this.onClickClose();
    },


    /**进入游戏 */
    enterGame() {
        //获取游戏数据
        GameConfig.ShowTablePop = true;
        Connector.connect(data, () => {
            GameConfig.CurrentGameType = data.connectInfo.gameType;
            DataBase.setGameType(DataBase.GAME_TYPE[data.connectInfo.gameType]);
            cc.director.loadScene(DataBase.TABLE_TYPE[data.connectInfo.gameType]);
        });
    },


    /**匹配计时 */
    matchTiming() {
        this.matchTime.unscheduleAllCallbacks();
        //TODO
        let times = new Date().getTime();
        this.matchTime.schedule(() => {
            let res = new Date().getTime() - times;
            let min = Math.floor((res / 1000) / 60);
            let sec = Math.floor((res / 1000) % 60)

            let m = min < 10 ? "0" + min : "" + min;
            let s = sec < 10 ? "0" + sec : "" + sec;
            this.matchTime.string = m + ":" + s;
        }, 1)
    },
    /** 取消匹配*/
    onClickClose() {
        Cache.playSfx();
        this.closeBtn.getChildByName("desc").getComponent(cc.Label).string = "正在取消";
        this.closeBtn.getChildByName("desc").color = new cc.Color(255, 255, 255);

        this.closeBtn.getComponent(cc.Button).interactable = false;
        Connector.request(GameConfig.ServerEventName.CancelMatch, {}, (data) => {
            //TODO
            // if ((utils.isNullOrEmpty(data.version) || utils.versionCompareHandle(data.version, '1.0.0') <= 0)) {
            //     this.closeBtn.color = new cc.color(54, 54, 54);
            //     if (this.node) {
            //         this.node.removeFromParent();
            //         this.node.destroy();
            //     }
            // }

        }, true, (err) => {
            Cache.alertTip("取消失败");
            this.closeBtn.getComponent(cc.Button).interactable = true;
            this.closeBtn.getChildByName("desc").color = new cc.Color(187, 82, 5);
            this.closeBtn.getChildByName("desc").getComponent(cc.Label).string = "取消匹配";
        })
    },


    showMatchInfo(data) {
        // data = [
        //     { userid: 100018, friend: false, status: 'agree' },
        //     { userid: 100014, friend: true, status: 'agree' },
        //     { userid: 100012, friend: false, status: 'cancel' },
        //     { userid: 100013, friend: true, status: 'wait' },
        // ]
        this.matchInfoNode.active = true;
        let myIndex = 0
        if (!GameConfig.isNewMatch) {
            myIndex = data.findIndex(a => parseInt(a.id) == DataBase.player.id);

        } else {
            myIndex = data.findIndex(a => parseInt(a.userID) == DataBase.player.id);
        }

        this.refuseBtn.active = data[myIndex].status == 'wait';
        this.agreeBtn.active = data[myIndex].status == 'wait';
        // console.log()
        data.forEach((e, i) => {
            try {
                this.matchQueue[i].active = true;
                this.matchQueue[i].getChildByName('lblStatus').getComponent(cc.Label).string = MATCH_STATUS[e.status].desc;
                this.matchQueue[i].getChildByName('lblStatus').color = new cc.color(MATCH_STATUS[e.status].color);
                if (!data[myIndex].friend) {
                    this.matchQueue[i].getChildByName('sameTable').active = e.friend;
                }
            } catch (error) {

            }

        });


    },

    agreeJoinGame(e, v) {
        //TODO  拒绝---继续匹配   同意---进入游戏
        Connector.request(GameConfig.ServerEventName.MatchOperate, { option: v, matchID: this.matchID }, (res) => {
            this.updateMatch()
        }, 1, (err) => {
            Cache.alertTip(err.message || '网络波动,请稍后再试')
            this.updateMatch()

        })
    },

    update(dt) {

        if (this.progressBar.progress >= 1)
            this.progressBar.progress = 0;
        this.progressBar.progress += 0.002;

        if (parseInt(this.matchDowntime) == 0) return;

        this.interval++;
        if (this.interval % 60 == 0) {
            this.interval = 0;
            let nowTime = utils.getTimeStamp();
            let endTime = parseInt(this.matchDowntime);
            if (nowTime >= endTime) {
                this.lblOperatime.string = "倒计时:0秒";
                return
            }
            this.lblOperatime.string = "倒计时:" + Math.floor((endTime - nowTime) / 1000) + "秒";
        }
    },
});