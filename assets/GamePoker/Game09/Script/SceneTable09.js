let ROUTE = require("../../../Main/Script/ROUTE");
let connector = require("../../../Main/NetWork/Connector");
let db = require("../../../Main/Script/DataBase")//require("DataBase");
let PACK = require("../../../Main/Script/PACK");
let logic = require("Logic_09");
let utils = require("../../../Main/Script/utils");
let Native = require('../../../Main/Script/native-extend');
let _social = Native.Social;
let audioCtrl = require("../../../Main/Script/audio-ctrl")//require("audio-ctrl");
let Cache = require("../../../Main/Script/Cache");
const { GameConfig } = require("../../../GameBase/GameConfig");
const TableInfo = require("../../../Main/Script/TableInfo");

let posHead = [
    cc.v2(-514, -240),
    cc.v2(508, 187),
    cc.v2(-168, 283),
    cc.v2(-515, 130)
];
const FINAL_SCORE_POS = [
    cc.v2(-490, -294),
    cc.v2(526, 121),
    cc.v2(-61, 295),
    cc.v2(-492, 70)
];

const FINAL_XI_POS = [
    cc.v2(-380, -294),
    cc.v2(526, 95),
    cc.v2(-61, 264),
    cc.v2(-492, 41)
];
const fileName = `local-0.amr`;
const CN_PERSON = ["", "一", "二", "三"];

let customConfig = {
    plus: true,
    shun: false,
    bomb: true,
    clan: true,
    turn: 10
};
cc.Class({
    extends: require('GameBase'),

    properties: {
        _delayTime: 0,

        // timeCell: 0, 语音次数
        prePlayerInfo: cc.Prefab,
        layerHandCards: cc.Node,
        hands: [],
        lblRoomId: cc.Label,
        lblJushu: cc.Label,
        lblGameType: cc.Label,
        
        lblBase: cc.Label,
        lblRules: cc.Node,
        // lblCurrentTime: cc.Label,
        btnPass: cc.Node,
        btnTips: cc.Node,
        btnPlayCards: cc.Node,
        dropCards: [cc.Layout],
        preCards: cc.Prefab,
        imgPass: [cc.Node],
        nodePlayerInfo: [],
        preCoin: cc.Prefab,
        preScore: cc.Prefab,
        btnReady: cc.Node,
        birdBtnReady: cc.Node,
        bgTable: cc.Layout,
        btnCut: cc.Node,
        aniNode: cc.Prefab,
        pokerSkeleton: [sp.SkeletonData],
        preType: cc.Prefab,//牌的类型

        preCount: cc.Prefab,
        bgCount: [cc.Layout],
        // imgReady: [cc.Node],
        // btnInviteFriend: cc.Node,
        bgSpriteFrame: [cc.SpriteFrame],
        //语音icon
        // sprHorn: [cc.Sprite],
        sprDisnable: cc.Node,
        nodeCut: cc.Node,
        nodeBtn: cc.Node,
        nodeBtnTips: cc.Node,
        sfxClip: {
            type: cc.AudioClip, // use 'type:' to define an array of Texture2D objects
            default: null
        },
        lblCurrentScore: cc.Label,
        layerRemainCard: cc.Node,
        nodeRemainCard: cc.Prefab,
        layerSelect: cc.Node,
        layerShowCards: cc.Node,
        prePlayCards: cc.Prefab,
        nodeBao: cc.Node,
        maskPos: cc.Node,
        nodeTx: cc.Node,
        action: [cc.Node],
        nodeHands: [cc.Node],
        xiHands: [],
        //-----------------------------------------
        autoBtn: cc.Node,
        exitBtn: cc.Node,
        autoMask: cc.Node,
        bgNode: cc.Sprite,
        summaryPrefab: cc.Prefab,
        gpsBtn: cc.Node,
        //积分器
        wuNode: cc.Node,
        shiNode: cc.Node,
        kNode: cc.Node,
        cutAnim: sp.SkeletonData,
        cutTips: cc.Node,
        bomb: cc.Prefab,
        lastTxTime: 0,
    },

    // use this for initialization
    onLoad() {

        //设置桌面
        // let indexBg = utils.getValue(GameConfig.StorageKey.tableBgIndex, 0)
        // this.bgNode.spriteFrame = GameConfig.tableBgSprite[indexBg];
        //初始化聊天模块
        this.initChatContent();
        //初始化游戏基础数据
        this.initGameBase();
        //添加监听事件
        this.addEvents();
        TableInfo.ready = false;
        TableInfo.idx = -1;
        connector.emit(PACK.CS_JOIN_DONE, {});
        connector.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.ENTER_SCENE, gamtype: "XHZD" });
        this.schedule(this.gameMsgSchedule, 0.1);
    },
    /**添加监听事件 */
    addEvents() {
        this.node.on(GameConfig.GameEventNames.ZD_BACK_HALL, this.onClickExit, this);
        this.node.on(GameConfig.GameEventNames.ZD_CONTINUE_GAME, this.continueGame, this);
    },
    /**移除监听事件 */
    removeEvents() {

        this.node.off(GameConfig.GameEventNames.ZD_BACK_HALL, this.onClickExit, this);
        this.node.off(GameConfig.GameEventNames.ZD_CONTINUE_GAME, this.continueGame, this);
    },


    gameMsgSchedule(dt) {
        if (this._delayTime > 0) {
            this._delayTime--;
            return;
        }

        if (connector._queueGameMsg.length <= 0)
            return;
        let msg = connector._queueGameMsg.shift();
        if (msg.route == ROUTE.SC_JOIN_TABLE || msg.route == ROUTE.SC_RECONNECT || msg.route == ROUTE.SC_GAME_DATA)
            TableInfo.ready = true;
        if (!TableInfo.ready)
            return;
        let dealCards = this.nodeCut.getComponent("ModuleDeal_09");
        console.log(msg.route + ":  ", msg)


        switch (msg.route) {
            case ROUTE.SC_GAME_DATA:

                this.resume(msg.data);
                break;
            case ROUTE.SC_JOIN_TABLE:
                this.initTable(msg.data);
                break;
            // case ROUTE.SC_JOIN_GAME:
            //     this.addPlayer(msg.data);
            //     break;
            case ROUTE.SC_GET_CARD:
                cc.log(msg.data);
                break;
            case ROUTE.SC_RECONNECT:
                this.resume(msg.data);
                break;
            case ROUTE.SC_GAME_INIT:
                this.initGame(msg.data);
                break;
            case ROUTE.SC_PLAY_CARD:
                this.playCard(msg.data);
                break;
            case ROUTE.SC_GAME_READY:
                this.changeReady(msg.data);
                break;
            case ROUTE.SC_REFRESH_CARD:
                db.player.card = msg.data.card;
                break;
            case ROUTE.SC_PLAYER_LEAVE:
                this.leavePlayer(msg.data.idx);
                break;
            case ROUTE.SC_CHANGE_STATUS:
                this.changeStatus(msg.data);
                break;

            case ROUTE.SC_ACTION:
                this.gameActon(msg.data);
                // this.addXi(msg.data);
                break;
            case ROUTE.SC_FINISH:

                break;
            case ROUTE.SC_ROUND_SUMMARY:
                this.roundSummary(msg.data);
                break;
            case ROUTE.SC_GAME_SUMMARY:
                // this.gameSummary(msg.data);
                break;
            // case ROUTE.SC_GAME_VOTE:
            //     this.gameVote(msg.data);
            //     break;
            case ROUTE.SC_PROGRESS:
                dealCards.cutHandMove(msg.data.percent);
                break;
            case ROUTE.SC_CUTE:
                this.cuteCard(msg.data);
                break;
            case ROUTE.SC_SHOW_HOST:
                this.resetPlayers(msg.data);
                break;
            case ROUTE.SC_GAME_CHAT:
                if (this.chat != null)
                    this.chat.contentFly(msg.data);
                break;
            case ROUTE.SC_SYSTEM_NOTICE:
                if (this.chat != null)
                    this.chat.systemNotice(msg.data);
                break;
            case ROUTE.SC_PLAY_ERROR:
                Cache.alertTip("请选择正确牌型");
                break;
            case ROUTE.SC_CALL:
                this.showBao(msg.data);
                break;
            case ROUTE.SC_ALERT:
                this.showBaodan(msg.data);
                break;
            case ROUTE.SC_QUICK_FINISH:
                // this.nodeTx.getComponent("ModuleTouxiang08").txInit(msg.data);
                this.nodeTx.getComponent("ModuleTouxiang_09").txInit(msg.data);
                break;
            case ROUTE.SC_CANCEL_AUTO:
                this.cancelAuto(msg.data);
                break;
            case ROUTE.SC_START_AUTO:
                this.startAuto(msg.data);
                break;
            case ROUTE.SC_GAME_DESTORY:
                this.destoryGame()
                break;
            case ROUTE.SC_TOAST:
                if (!utils.isNullOrEmpty(msg.data.message))
                    Cache.alertTip(msg.data.message);
                break;
            default:
                console.log(msg);
        }
    },

    /**初始化桌子基础信息 */
    initTable(data) {
        //显示游戏 类型 公会
        this.lblGameType.string = '' + GameConfig.GameName[data.options.gameType] + ' ' + data.options.rules.poker + '副牌';

        this.lblRules.active = data.options.rules.poker == 3;

        this.lblBase.string = "底分: " + utils.formatGold(data.options.base);


        data.turn = data.turn ? data.turn : 0;
        TableInfo.firstPlay = false;
        TableInfo.status = data.status;
        this.exitBtnStatus();

        TableInfo.idx = data.idx;
        // TableInfo.config = data.config;
        TableInfo.config = customConfig;
        TableInfo.options = data.options;
        TableInfo.current = data.current;
        this.layerHandCards.getComponent("ModuleCards_09").touchEvent();
        this.lblRoomId.string = '房间号: ' + data.options.tableID;
        // this.btnReady.active = TableInfo.status == GameConfig.GameStatus.WAIT || TableInfo.status == GameConfig.GameStatus.SUMMARY;
        // this.birdBtnReady.active = TableInfo.status == GameConfig.GameStatus.WAIT;

        let idx = data.idx;
        let realIdx = [0, 0, 0, 0];
        realIdx[idx] = 0;
        realIdx[(idx + 1) % 4] = 1;
        realIdx[(idx + 2) % 4] = 2;
        realIdx[(idx + 3) % 4] = 3;
        TableInfo.realIdx = realIdx;

        this.nodeHands.forEach(node => {
            node.destroyAllChildren();
        });
        this.setTurn(data);
        this.initPlayers(data);
    },

    showRule() {

    },

    setTurn(data) {
        TableInfo.turn = data.round;
        this.lblJushu.string = data.round == 0 ? "" : '第' + data.turn + '圈 第' + data.round + "局";
    },
    initPlayers(data) {
        if (!utils.isNullOrEmpty(this.nodePlayerInfo)) {
            this.nodePlayerInfo.forEach(player => {
                if (player)
                    player.destroyPlayer();
            })
        }
        this.nodePlayerInfo = new Array(4);
        TableInfo.players = new Array(4);
        TableInfo.players = data.players;
        data.players.forEach((player, i) => {
            if (player != null) {
                let nodePlayer = cc.instantiate(this.prePlayerInfo);

                nodePlayer.parent = this.bgTable.node;
                let playerInfo = nodePlayer.getComponent("ModulePlayerInfo_09");
                playerInfo.init(player);
                //隐藏倒计时
                playerInfo.hideClock();
                playerInfo.activeReady(player.ready != null);

                this.nodePlayerInfo[TableInfo.realIdx[player.idx]] = playerInfo;
                if (player.idx == TableInfo.idx && !player.ready && data.status != GameConfig.GameStatus.START)
                    this.btnReady.active = true;
            }
        });
        //GPS提示
        this.onGpsTwinkling();
    },
    initGame(data) {  //每局开始时调用

        TableInfo.status = GameConfig.GameStatus.START;
        this._delayTime = 50;
        this.nodeTx.active = false;
        TableInfo.currentPlayer = data.currentIDX;
        TableInfo.firstPlay = true;
        TableInfo.current = null;
        this.setTurn(data);

        //TODO
        if (data.shuffle) {
            this.cutCount = 0;
            this.cutIdx = [];
            this.shuffleData = data;
            data.shuffle.forEach((e) => {
                if (e.shuffle) {
                    this.cutCount++;
                    this.cutIdx.push(e.idx)
                };
            })
            this.handleShuffle();

        } else {
            this.initHands(data, false);
            this.nodeCut.getComponent("ModuleDeal_09").cut(data);

        }

        this.nodePlayerInfo.forEach((playerInfo, i) => {
            playerInfo.resetPlayer();
        });



        TableInfo.players.forEach(player => player.rank = -1);
    },
    handleShuffle() {
        if (this.cutCount > 0) {
            this._delayTime = 100;
            let nodeAnimation = new cc.Node();
            nodeAnimation.parent = this.node;
            nodeAnimation.addComponent(sp.Skeleton);
            let ani = nodeAnimation.getComponent(sp.Skeleton);
            ani.skeletonData = this.cutAnim;
            ani.premultipliedAlpha = false
            ani.setAnimation(1, "idle", false)
            this.cutTips.active = true;
            let idx = this.cutIdx.shift();
            this.cutTips.getChildByName("name").getComponent(cc.Label).string = "" + TableInfo.players[idx].prop.name + "正在洗牌"
            if (ani) {
                // 注册动画的结束回调
                ani.setCompleteListener((trackEntry, loopCount) => {
                    nodeAnimation.destroy();
                    this.cutTips.active = false;
                    this.cutCount--;
                    this.handleShuffle();
                });
            }
        } else {
            this.initHands(this.shuffleData, false);
            this.nodeCut.getComponent("ModuleDeal_09").cut(this.shuffleData);
        }
    },


    leavePlayer(idx) {
        connector.disconnect();
    },
    /**重连 */
    resume(obj) {
        let objStr = JSON.stringify(obj);
        let data = JSON.parse(objStr);

        this.initTable(data);

        //TODO 匹配进入 自动准备
        if (data.status == GameConfig.GameStatus.PREPARE) {
            connector.gameMessage(ROUTE.CS_GAME_READY, { plus: false });
            return;
        }

        //TODO 投降
        if (data.quickFinish) {
            this.nodeTx.getComponent("ModuleTouxiang_09").txInit(data.quickFinish);
        }
        //TODO 等待
        if (data.status == GameConfig.GameStatus.WAIT) {
            return;
        }
        //TODO  结算
        if (data.status == GameConfig.GameStatus.SUMMARY) {
            data.players.forEach(player => {
                if (player.idx == TableInfo.idx)
                    this.btnReady.active = player.ready == null;
            })
            return;
        }


        data.players.forEach(player => {
            this.nodePlayerInfo[TableInfo.realIdx[player.idx]].activeReady(false);
        });

        let showHands = data.status == GameConfig.GameStatus.CALL && data.currentIDX != data.idx && data.players[data.idx].call == null;
        this.initHands(data, !showHands);

        //TODO 包装
        if (data.status == GameConfig.GameStatus.CALL) {
            this.nodePlayerInfo.forEach(node => node.activeBao(false));
            if (data.currentIDX != null) {
                let baoData = {
                    idx: data.currentIDX,
                    clock: data.clock,
                }
                this.showBao(baoData);
                return;
            }
        }
        //TODO 切牌
        if (data.status == GameConfig.GameStatus.CUTE) {
            this.cuteCard(data);
            return;
        }



        //显示当前出牌
        if (data.currentCard)
            this.showPlayCards(data.currentCard);
        //出牌
        let playData = {
            idx: data.currentIDX,
            clock: data.clock
        }
        this.playCard(playData);

        this.baoData = { call: false, idx: 0 }
        obj.players.forEach(player => {
            this.nodePlayerInfo[TableInfo.realIdx[player.idx]].activeAuto(player.auto);
            if (TableInfo.idx == player.idx)
                this.changeAutoBtn(player.auto)
            if (player && player.rank != -1) {


                if (player.idx == TableInfo.idx)
                    TableInfo.status = GameConfig.GameStatus.FINISH;
                console.log("rank--1-", player.rank, player)
                this.nodePlayerInfo[TableInfo.realIdx[player.idx]].finishAnim(player.rank, true);
                TableInfo.players[TableInfo.realIdx[player.idx]].rank = player.rank;
            }

            if (player.hands == 1) {
                this.nodePlayerInfo[TableInfo.realIdx[player.idx]].activeBaodan(true);
            }
            if (player.call) {
                TableInfo.bao = player.idx;
                this.baoData = { call: true, idx: player.idx }

            }
        });
        if (data.scores)
            this.lblCurrentScore.string = (5 * parseInt(data.scores.F) + 10 * parseInt(data.scores.T) + 10 * parseInt(data.scores.K)) + "";
        // this.btnReady.active = false;
        this.updateScoresLayout(data.creditCards);

    },

    gameActon(data) {


        switch (data.event) {
            case GameConfig.GameAction.CALL:

                this.runBao(data);
                break;
            case GameConfig.GameAction.PLAY:

                this.showPlayCards(data);
                break;
            case GameConfig.GameAction.PASS:
                this.showPass(data);
                break;
            case GameConfig.GameAction.PLUS:
                this.initXiHands(data);
                break;
            case GameConfig.GameAction.CREDIT:
                this.scoreFly(data);
                break;
            case GameConfig.GameAction.ALERT:
                this.showBaodan(data);
                break;
            case GameConfig.GameAction.DONE:

                let idx = TableInfo.realIdx[data.idx];
                if (data.idx == TableInfo.idx)
                    TableInfo.status = GameConfig.GameStatus.FINISH;
                this.nodePlayerInfo[idx].activeBaodan(false);
                this.nodePlayerInfo[idx].finishAnim(data.rank);
                TableInfo.players[idx].rank = data.rank;
                break;
        }
    },

    changeStatus(data) {
        if (TableInfo.idx < 0)
            return;
        let idx = TableInfo.realIdx[data.idx];
        TableInfo.players[idx].offline = data.offline;
        this.nodePlayerInfo[idx].activeOffline(data.offline);
    },
    /**改变准备状态 */
    changeReady(data) {
        if (TableInfo.idx == data.idx) {
            this.btnReady.active = false;
        }
        this.nodePlayerInfo[TableInfo.realIdx[data.idx]].activeReady(true);
        // this.nodePlayerInfo[TableInfo.realIdx[data.idx]].activeBao(false);
    },
    //显示当前打牌者光环
    showPlayerLight(idx) {
        this.nodePlayerInfo.forEach(node => node.showActive(idx));
    },

    destoryGame() {
        connector._queueGameMsg = [];
        connector._queueChatMsg = [];
        connector.disconnect();
    },
    initChatContent() {
        this.node.on('chatAlready', () => {
            let data = {
                str: ["哎呀头都被你们炸晕了", "赢了钱请大家去满天红吃火锅", "不要走决战到天亮", "对家的牌还不错",
                    "跟你们打牌真是太开心了", "手气不好 建议你去趟台湾岛", "在哪个山沟沟里,信号这么差", "快点呀,头发都等白了",
                    "跟你合作真是太愉快了"],
                url: 'ChatImg/Game09',
                // aniPos: [cc.v2(-515, -235), cc.v2(510, 193), cc.v2(-171, 287), cc.v2(-515, 137)],
                aniPos: [
                    cc.v2(-cc.winSize.width / 2 + 139 / 2 + GameConfig.FitScreen, -240 + 30),
                    cc.v2(cc.winSize.width / 2 - 139 / 2 - GameConfig.FitScreen, 35 + 30),
                    cc.v2(-168, 220 + 30),
                    cc.v2(-cc.winSize.width / 2 + 139 / 2 + GameConfig.FitScreen, 35 + 30)
                ],
                msgPos: [
                    cc.v2(-cc.winSize.width / 2 + 139 / 2 + GameConfig.FitScreen + 50, -240 + 60),
                    cc.v2(cc.winSize.width / 2 - 139 / 2 - GameConfig.FitScreen - 50, 35 + 60),
                    cc.v2(-168 + 50, 220 + 60),
                    cc.v2(-cc.winSize.width / 2 + 139 / 2 + GameConfig.FitScreen + 50, 35 + 60)
                ],
                facePos: [
                    cc.v2(-cc.winSize.width / 2 + 139 / 2 + GameConfig.FitScreen + 139, -240 + 44),
                    cc.v2(cc.winSize.width / 2 - 139 / 2 - GameConfig.FitScreen - 139, 35 + 44),
                    cc.v2(-168 + 139, 220 + 44),
                    cc.v2(-cc.winSize.width / 2 + 139 / 2 + GameConfig.FitScreen + 139, 35 + 44)
                ]
                // facePos: [cc.v2(-595, -301), cc.v2(490, 155), cc.v2(-131, 252), cc.v2(-589, 62)]
            };
            this.chat.init(data);
        });
    },

    acTx() {
        let nowTime = new Date().getTime();
        if ((nowTime - this.lastTxTime) < 10000) {
            Cache.alertTip('点击过于频繁,不能少于10秒')
            return
        }
        if (TableInfo.status != GameConfig.GameStatus.START) {
            if (TableInfo.bao < 0) {
                if ((TableInfo.players[0].credit == TableInfo.players[1].credit) || (TableInfo.players.findIndex(p => p.rank != -1) < 0)) {
                    Cache.alertTip("双方分数相同且没有上游");
                    return;
                }
            } else {
                if ((TableInfo.players[TableInfo.realIdx[TableInfo.bao]].credit == TableInfo.players[3 - TableInfo.realIdx[TableInfo.bao]].credit) || (TableInfo.players.findIndex(p => p.rank != -1) < 0)) {
                    Cache.alertTip("双方分数相同且没有上游");
                    return;
                }
            }
        }
        this.lastTxTime = nowTime;
        connector.gameMessage(ROUTE.CS_QUICK_FINISH, { vote: true });
    },

    /**换位置 */
    resetPlayers(data) {
        if ((data.group[0] == data.group[1]) || (Math.abs(data.group[1] - data.group[0]) == 2))
            return;
        TableInfo.players.forEach((p, i) => p.idx = data.playerIDX[i]);
        TableInfo.idx = TableInfo.players[TableInfo.idx].idx;
        TableInfo.players.sort((a, b) => a.idx - b.idx);
        this.resetRealIdx(TableInfo.idx);
        this.nodePlayerInfo.forEach(node => node.destroyPlayer());
        this.maskPos.active = true;
        this._delayTime = 10
        setTimeout(() => {
            TableInfo.players.forEach((player, i) => {
                let nodePlayer = cc.instantiate(this.prePlayerInfo);
                nodePlayer.parent = this.bgTable.node;
                let playerInfo = nodePlayer.getComponent("ModulePlayerInfo_09");
                playerInfo.init(player);
                this.nodePlayerInfo[TableInfo.realIdx[i]] = playerInfo;
            });
            this.maskPos.active = false;
        }, 1000)

    },

    showBaodan(data) {

        let idx = TableInfo.realIdx[data.idx];
        this.nodePlayerInfo[idx].activeBaodan(true);
        let sex = TableInfo.players[idx].prop.sex;
        Cache.playSound(`${sex}_baodan`);
    },

    resetRealIdx(idx) {
        let realIdx = [0, 0, 0, 0];
        realIdx[idx] = 0;
        realIdx[(idx + 1) % 4] = 1;
        realIdx[(idx + 2) % 4] = 2;
        realIdx[(idx + 3) % 4] = 3;
        TableInfo.realIdx = realIdx;
    },

    runBao(data) {

        if (TableInfo.idx == data.idx || data.call) {
            this.layerHandCards.active = true;
        }


        this.baoData = data;
        let idxBao = TableInfo.realIdx[data.idx];
        let index = data.call ? 0 : 1;
        //显示玩家包庄icon
        if (data.call) {
            TableInfo.bao = data.idx;
            this.nodePlayerInfo[idxBao].activeBao(true);
        }
        //隐藏包庄按钮
        if (TableInfo.idx == data.idx)
            this.nodeBao.active = false;

        //隐藏倒计时
        this.nodePlayerInfo[idxBao].hideClock();

        //TODO 包庄 icon显示 需重写
        let BAO_POS = [
            cc.v2(0, 0),
            cc.v2(cc.winSize.width / 2 - 200 - GameConfig.FitScreen, 50),
            cc.v2(70, 260),
            cc.v2(-cc.winSize.width / 2 + 200 + GameConfig.FitScreen, 50)
        ]


        this.action[index].active = true;
        this.action[index].scale = 0;
        this.action[index].setPosition(BAO_POS[idxBao]);
        let seq1 = cc.scaleTo(0.01, 0);
        let seq2 = cc.scaleTo(0.1, 1.2);
        let fade1 = cc.fadeIn(0.2);
        let fade2 = cc.fadeOut(0.2);
        let action = cc.sequence(cc.spawn(cc.sequence(seq1, seq2), fade1), cc.delayTime(0.5), fade2);
        this.action[index].runAction(action);
        this.playManageAudio(`${TableInfo.players[data.idx].prop.sex}_bao_${index}.mp3`);
    },

    showBao(data) {


        let idx = data.idx;
        if (TableInfo.idx == idx) {
            this.layerHandCards.active = true;
        }
        if (!utils.isNullOrEmpty(data.auto)) {
            let realIdx = TableInfo.realIdx[idx];
            this.nodePlayerInfo[realIdx].activeAuto(data.auto);
            if (TableInfo.idx == idx)
                this.changeAutoBtn(data.auto)
        }

        //显示闹钟
        let time = Math.max((data.clock - utils.getTimeStamp()) / 1000, 0);
        this.nodePlayerInfo[TableInfo.realIdx[idx]].showClock(time);
        this.showPlayerLight(idx);
        this.nodeBao.active = idx == TableInfo.idx;
        this.btnPlayCards.active = false;
        this.btnTips.avtive = false;
    },

    acBao(event, data) {
        let num = parseInt(data);
        if (num == 0) {
            Cache.showConfirm("是否包庄", () => {
                this.nodeBao.active = false;
                connector.gameMessage(ROUTE.CS_CALL, { event: 'CALL', call: true });
            })
        } else {
            this.nodeBao.active = false;
            connector.gameMessage(ROUTE.CS_CALL, { event: 'CALL', call: false });
        }



    },

    acShowScore() {
        connector.gameMessage(ROUTE.CS_SHOW_DECK, {});
    },



    /**游戏开始 切牌 */
    cuteCard(data) {
        TableInfo.status = GameConfig.GameStatus.START;
        this.exitBtnStatus();
        this.nodeHands.forEach(node => {
            node.destroyAllChildren();
        });

        TableInfo.status = GameConfig.GameStatus.START;
        TableInfo.cuter = data.cuterIDX != null ? data.cuterIDX : data.idx;



        this.initDesk();

        if (!utils.isNullOrEmpty(data.auto)) {
            let realIdx = TableInfo.realIdx[TableInfo.cuter];
            this.nodePlayerInfo[realIdx].activeAuto(data.auto);
            if (TableInfo.idx == TableInfo.cuter)
                this.changeAutoBtn(data.auto)
        }

        let dealCards = this.nodeCut.getComponent("ModuleDeal_09");
        dealCards.showDeal();
    },

    passCard(data) {
        connector.gameMessage(ROUTE.CS_PLAY_CARD, { event: "PASS" });
        this.resetCards();
    },

    showPass(data) {
        this._delayTime = 3;
        let idx = TableInfo.realIdx[data.idx];
        this.nodePlayerInfo[idx].activeAuto(data.auto);
        this.nodePlayerInfo[idx].hideClock();

        if (TableInfo.idx == data.idx)
            this.changeAutoBtn(data.auto)
        this.changeBtn(false);
        this.sprDisnable.active = false;
        let voice = this.bgTable.node.getComponent("ModuleAudioCtr_09");
        voice.PassVoice(TableInfo.players[data.idx].prop.sex);
        let nodePass = this.imgPass[idx];
        nodePass.active = true;
        nodePass.scale = 0;
        nodePass.runAction(cc.scaleTo(0.1, 1));
    },

    initXiHands(data) {
        this.nodeBtn.active = false;

        this._delayTime = 25;
        this.layerHandCards.destroyAllChildren();
        let allResult = [[], [], [], []];
        data.players.forEach(player => {
            let realIdx = TableInfo.realIdx[player.idx];
            player.hands.sort((a, b) => a % 100 - b % 100);
            player.hands.reverse();
            let xiHands = this.nodeHands[realIdx].getComponent("ModuleHands_09");
            xiHands.refreshHandCards(player.hands, true);
        });

        data.players.forEach(player => {
            let realIdx = TableInfo.realIdx[player.idx];
            player.hands.sort((a, b) => a % 100 - b % 100);
            let tmpCards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            player.hands.forEach(card => {
                tmpCards[card % 100]++;
            });
            let card = tmpCards.findIndex((count, i) => (count >= 5) || (i == 15 && count == 4));
            if (card >= 0) {
                allResult[realIdx].push(card % 100);
            }
            let objHands = this.nodeHands[realIdx].getComponent("ModuleHands_09");
            objHands.nodeCards.forEach(card => {
                allResult[realIdx].forEach(xiCard => {
                    if ((card._value % 100) == xiCard) {
                        card.setPosition(card.pos1);
                    }
                });
            });
            if (!utils.isNullOrEmpty(player.bonus)) {
                this.addXi(player.bonus);
            }

        });
    },

    initDesk() {  //继续游戏初始化桌子
        this.sprDisnable.active = false;
        this.lblCurrentScore.string = "0";
        this.nodePlayerInfo.forEach((node) => {
            node.resetPlayer();
        });
        this.layerHandCards.destroyAllChildren();
        this.layerHandCards.getComponent("ModuleCards_09").nodeCards = [];
        this.dropCards.forEach((ground, i) => {
            ground.node.destroyAllChildren();
            this.bgCount[i].node.destroyAllChildren();
            this.imgPass[i].active = false;
        });
    },


    addXi(data) {

        if ([3, 4, 5].includes(data.bomb))
            this.bombAnim(data.bomb);
        let person = data.from.length;
        let url = cc.url.raw(`resources/Audio/Common/addScore.mp3`);
        audioCtrl.getInstance().playSFX(url);
        let coinPos = [
            cc.v2(-cc.winSize.width / 2 + 139 / 2 + GameConfig.FitScreen, -200 - 72),
            cc.v2(cc.winSize.width / 2 - 139 / 2 - GameConfig.FitScreen, 35 - 72),
            cc.v2(-168, 220 - 72),
            cc.v2(-cc.winSize.width / 2 + 139 / 2 + GameConfig.FitScreen, 35 - 72)
        ]
        let spawn = [];
        let seq = [];
        let playerDec = [];
        let endPos = coinPos[TableInfo.realIdx[data.to[0].idx]]
        let scores = data.to[0].score;
        let numCoin = scores * 5;


        try {
            spawn.push(cc.delayTime(0.1));
            for (let i = 0; i < numCoin; i++) {
                let nodeCoin = cc.instantiate(this.preCoin);
                nodeCoin.parent = this.node;

                nodeCoin.setPosition(coinPos[TableInfo.realIdx[data.from[i % person].idx]]);
                let pos = cc.v2(Math.random() * 100 - 50, Math.random() * 100 - 50);
                spawn.push(cc.targetedAction(nodeCoin,
                    cc.sequence(
                        cc.delayTime(0.5 * Math.random()),
                        cc.spawn(
                            cc.moveBy(0.3, pos),
                            cc.scaleTo(0.1, 0.7)
                        ),
                        cc.moveTo(0.3, endPos),
                        cc.callFunc(function () {
                            this.destroy();
                        }, nodeCoin)
                    )
                ));
            }
            seq.push(cc.spawn(spawn));
            let nodeScore = cc.instantiate(this.preScore);
            nodeScore.getComponent(cc.Label).string = "+" + data.to[0].score;
            nodeScore.parent = this.node;
            if (nodeScore)
                nodeScore.opacity = 0;
            nodeScore.scale = 0.2;
            nodeScore.position = endPos;
            let playerAdd = this.nodePlayerInfo[TableInfo.realIdx[data.to[0].idx]];
            data.from.forEach((f, i) => {
                let dec = this.nodePlayerInfo[TableInfo.realIdx[f.idx]];
                playerDec.push(dec);
            });

            seq.push(cc.targetedAction(nodeScore,
                cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.2, 1.2),
                        cc.fadeIn(0.2)
                    ),
                    cc.scaleTo(0.1, 1),
                    cc.delayTime(0.1),
                    cc.callFunc(() => {
                        try {
                            playerAdd.setXifen(data.to[0].bonus);
                            data.from.forEach((f, i) => {
                                playerDec[i].setXifen(f.bonus);
                            });
                        } catch (ex) {
                            _social.reportError(ex)
                        }
                    }),
                    cc.spawn(
                        cc.moveBy(0.4, 0, 40),
                        cc.fadeOut(0.4)
                    ),
                    cc.callFunc(function () {
                        this.destroy();
                    }, nodeScore)
                )
            ));
        } catch (ex) {
            _social.reportError(ex)
        }
        try {

            this.node.runAction(cc.sequence(seq));
        } catch (ex) {
            _social.reportError(ex)
        }
    },

    scoreFly(data) {

        if (data.action) {
            this.addXi(data.action)
            if ([3, 4, 5].includes(data.action.bomb))
                this.bombAnim(data.action.bomb);
        }
        // debugger
        TableInfo.current = null;
        this.dropCards.forEach((ground, i) => {
            ground.node.removeAllChildren(true);
            this.bgCount[i].node.removeAllChildren(true);
            this.imgPass[i].active = false;
        });
        this.sprDisnable.active = false;
        this.updateScoresLayout(data.creditCards)

        if (this.lblCurrentScore.string == "0")
            return;
        let url = cc.url.raw(`resources/Audio/Common/addScore.mp3`);
        audioCtrl.getInstance().playSFX(url);
        this.lblCurrentScore.string = "0";
        data.credits.forEach((v, i) => {
            this.nodePlayerInfo[TableInfo.realIdx[i]].setJifen(v);
            //TODO 不知道存这个干啥
            TableInfo.players[TableInfo.realIdx[i]].scores = v;
        });
    },
    /**更新左上角计分器 */
    updateScoresLayout(data) {
        if (utils.isNullOrEmpty(this.baoData)) return;
        if (utils.isNullOrEmpty(data)) return;

        let scores = [];
        if (this.baoData.call) {
            scores = this.baoData.idx == TableInfo.idx ? data[0] : data[1];
        } else {
            scores = data[TableInfo.idx % 2];
        }
        this.wuNode.destroyAllChildren();
        this.shiNode.destroyAllChildren();
        this.kNode.destroyAllChildren();
        console.log("--scores--", scores)
        console.log("--this.baoData--", this.baoData)
        scores.forEach((card) => {
            if (card % 100 == 5) {
                // wuNum++;
                this.wuNode.active = true;

                let nodeCard = cc.instantiate(this.preCards);
                nodeCard.parent = this.wuNode;
                nodeCard.width = 45;
                nodeCard.height = 62.5;
                nodeCard.getComponent("ModuleCardsInit_09").init(card);
            }
            if (card % 100 == 10) {
                // shiNum++;
                this.shiNode.active = true;

                let nodeCard = cc.instantiate(this.preCards);
                nodeCard.parent = this.shiNode;
                nodeCard.width = 45;
                nodeCard.height = 62.5;
                nodeCard.getComponent("ModuleCardsInit_09").init(card);
            }
            if (card % 100 == 13) {
                // kNum++
                this.kNode.active = true;

                let nodeCard = cc.instantiate(this.preCards);
                nodeCard.parent = this.kNode;
                nodeCard.width = 45;
                nodeCard.height = 62.5;
                nodeCard.getComponent("ModuleCardsInit_09").init(card);
            }
        })

    },

    ready(e, v) {
        Cache.playSfx();

        if (cc.find("Canvas/roundSummary"))
            cc.find("Canvas/roundSummary").removeFromParent();
        connector.gameMessage(ROUTE.CS_GAME_READY, { plus: false });
    },

    resetCards() {  //重选按钮
        let objHands = this.layerHandCards.getComponent("ModuleCards_09");
        objHands.nodeCards.forEach(cards => {
            cards.forEach(card => {
                let bgCardMask = card.getChildByName("bgCardMask");
                bgCardMask.active = false;
                card._prior = false;
                card.isZhankai = false;
                card.setPosition(card.pos0);
            })
        });
        this.btnPlayCards.getComponent(cc.Button).interactable = false;
    },

    initHands(data, bool) {
        this.hands = [[], [], [], [], [], [], [], [], [], [], [], [], [], []];
        let base = 3;
        data.hands.sort((a, b) => a % 100 - b % 100);
        data.hands.forEach(card => {
            this.hands[card % 100 - base].push(card);
        });
        for (let i = 0; i < this.hands.length; i++) {
            if (this.hands[i].length == 0) {
                this.hands.splice(i, 1);
                i--;
            }
        }
        this.hands.reverse();
        let layerHandCards = this.layerHandCards.getComponent("ModuleCards_09");
        console.log("选择包庄---3-", data, TableInfo.idx)
        this.layerHandCards.active = bool;
        layerHandCards.refreshHandCards(this.hands, bool);


    },

    playCard(data) {
        let idx = data.idx;
        this.layerHandCards.active = true;
        TableInfo.currentPlayer = idx;
        this.showPlayerLight(idx);

        let time = Math.max((data.clock - utils.getTimeStamp()) / 1000, 0);
        this.nodePlayerInfo[TableInfo.realIdx[idx]].showClock(time);
        if (idx == TableInfo.idx) {
            let cards = this.layerHandCards.getComponent("ModuleCards_09");
            cards.checkCurrent();
            if (TableInfo.current != null)
                logic.decode(TableInfo.current.cards, TableInfo.config.shun);
            this.changeBtn(true);
            this.btnTips.tipsTime = 0;
            this.btnTips.getComponent(cc.Button).interactable = TableInfo.current != null;
            this.btnPass.getComponent(cc.Button).interactable = TableInfo.current != null;
            if (!TableInfo.firstPlay)
                this.btnTips.getComponent("ModuleTips_09").autoTip();
        }
        TableInfo.firstPlay = false;
    },

    changeBtn(boolean) {

        this.nodeBtn.active = boolean;
        this.btnPlayCards.active = boolean;
        this.btnTips.active = boolean;
        this.btnPass.active = boolean;
        this.btnPlayCards.opacity = 255;
        this.btnPass.opacity = 255;
        this.btnTips.opacity = 255;
        this.nodeBtnTips.active = false;// boolean && !this.nodeBtn.getChildByName("btnPlayCards").active;

    },

    acChupai() {   //出牌按钮
        if (utils.isNullOrEmpty(this.btnPlayCards._last))
            this.btnPlayCards._last = 0;
        if (new Date().getTime() - this.btnPlayCards._last < 1000)
            return;
        this.btnPlayCards._last = new Date().getTime();
        let emp = JSON.parse(JSON.stringify(TableInfo.select));
        if (emp.length > 1) {
            this.layerSelect.active = true;
            this.changeBtn(false);
            this.showSelect(emp);
        } else {
            connector.gameMessage(ROUTE.CS_PLAY_CARD, emp[0], true)
        }
    },

    showSelect(data) {
        let empData = JSON.parse(JSON.stringify(data));
        this.layerShowCards.destroyAllChildren();
        empData.forEach((group, i) => {
            let nodePlayCards = cc.instantiate(this.prePlayCards);
            nodePlayCards.parent = this.layerShowCards;
            nodePlayCards.getComponent("ModuleShowCards_09").init(group, false);
            nodePlayCards.on('touchend', () => {
                connector.gameMessage(ROUTE.CS_PLAY_CARD, data[i], true);
                this.layerSelect.active = false;
            })
        });
    },
    hideSelect() {
        this.layerSelect.active = false;
        this.changeBtn(true);
    },
    refreshTableScore(data) {
        data.cards.forEach(card => {
            let score = card % 100;
            if (score == 5 || score == 10) {
                this.lblCurrentScore.node.runAction(cc.sequence(cc.scaleTo(0.3, 1.3), cc.scaleTo(0.2, 1)));
                this.lblCurrentScore.string = "" + (score + parseInt(this.lblCurrentScore.string));
            }
            if (score == 13) {
                this.lblCurrentScore.node.runAction(cc.sequence(cc.scaleTo(0.3, 1.3), cc.scaleTo(0.2, 1)));
                this.lblCurrentScore.string = "" + (10 + parseInt(this.lblCurrentScore.string));
            }
        });
    },

    continueGame(e) {
        // if (TableInfo.endGame)
        //     return;
        TableInfo.shuffle = e.detail.cut;

        connector.gameMessage(ROUTE.CS_GAME_READY, { plus: false, shuffle: TableInfo.shuffle });
    },

    showPlayCards(data) {
        if (data.action) {
            this.addXi(data.action)
            if ([3, 4, 5].includes(data.action.bomb))
                this.bombAnim(data.action.bomb);
        }
        let group = data.currentCard ? data.currentCard : data;
        this.changeBtn(false);
        TableInfo.current = null;
        TableInfo.current = group;
        this._delayTime = 7;
        let realIdx = TableInfo.realIdx[group.idx];
        let cardType = ["", "", "", "", "", "五连顺", "六连顺", "七连顺", "八连顺", "九连顺", "十连顺", "十一连顺", "十二连顺",];
        this.refreshTableScore(group);
        this.nodePlayerInfo[realIdx].activeOffline(false);
        this.nodePlayerInfo[realIdx].activeAuto(group.auto);
        this.nodePlayerInfo[realIdx].hideClock();

        if (TableInfo.idx == group.idx)
            this.changeAutoBtn(group.auto)
        let url = cc.url.raw(`resources/Audio/Common/playCard.mp3`);
        audioCtrl.getInstance().playSFX(url);
        this.dropCards.forEach((ground, i) => {
            ground.node.destroyAllChildren();
            this.bgCount[i].node.destroyAllChildren();
            this.imgPass[i].active = false;
        });
        this.sprDisnable.active = false;
        if (group.type == "BOMB" && (group.card % 100) < 16) {
            let nodeCount = cc.instantiate(this.preCount);
            let idx = TableInfo.realIdx[group.idx];
            let countPos = [
                cc.v2(0, -61),
                cc.v2(-100, -61),
                cc.v2(100, -61),
                cc.v2(100, -61)
            ];
            nodeCount.parent = this.bgCount[realIdx].node;
            nodeCount.setPosition(countPos[idx]);
            let nodelaberStr = nodeCount.getChildByName("lblCount");
            let lblStr = nodelaberStr.getComponent(cc.Label);
            lblStr.string = group.cards.length;
            nodeCount.opacity = 0;
            nodeCount.runAction(cc.fadeIn(0.3));
        }
        //--------------------------------------------------------------------------------
        // 判断出牌类型
        let idxType;

        switch (group.type) {
            case "BOMB":
                idxType = 0;
                break
            case "LIANDUI":
                idxType = 1;
                break
            case "SHUN":
                //显示牌类型
                let type = cc.instantiate(this.preType);
                type.parent = this.bgCount[realIdx].node;
                let numCard = group.cards.length;
                idxType = 2;
                type.getComponent(cc.Label).string = cardType[numCard];
                break
            case "FEIJI":
                idxType = realIdx != 0 ? 4 : 3;
                break;
            default:
                break;
        }
        //  播放出牌种类特效
        if (!utils.isNullOrEmpty(idxType)) {

            let nodeAnimation = cc.instantiate(this.aniNode);

            nodeAnimation.parent = this.bgCount[realIdx].node;

            nodeAnimation.addComponent(sp.Skeleton);

            let ani = nodeAnimation.getComponent(sp.Skeleton);

            ani.skeletonData = this.pokerSkeleton[idxType];
            ani.premultipliedAlpha = false
            ani.setAnimation(1, "animation", false)
            this.playManageAudio(`texiao_${idxType}.mp3`);
        }
        //--------------------------------------------------------------------------------




        let audioCtr = this.bgTable.node.getComponent("ModuleAudioCtr_09");
        audioCtr.playVoice(group, TableInfo.players[group.idx].prop.sex);
        this.removeHands(group);
        //显示牌
        let nodePlayCards = cc.instantiate(this.prePlayCards);
        nodePlayCards.scale = 1;
        nodePlayCards.parent = this.dropCards[realIdx].node;
        let empGroup = JSON.parse(JSON.stringify(group));
        nodePlayCards.getComponent("ModuleShowCards_09").init(empGroup, true);
    },

    removeHands(data) {
        if (data.idx == TableInfo.idx) {
            data.cards.forEach(card => {
                for (let x = 0; x < this.hands.length; x++) {
                    for (let y = 0; y < this.hands[x].length; y++) {
                        let idx = this.hands[x].findIndex(c => card == c);
                        if (idx >= 0) {
                            this.hands[x].splice(idx, 1);
                            if (this.hands[x].length == 0)
                                this.hands.splice(x, 1);
                            return;
                        }
                    }
                }
            });
            let cards = this.layerHandCards.getComponent("ModuleCards_09");
            cards.refreshHandCards(this.hands, true);
        }
    },

    roundSummary(data) {
        this.wuNode.destroyAllChildren();
        this.shiNode.destroyAllChildren();
        this.kNode.destroyAllChildren();
        this.wuNode.active = false;
        this.shiNode.active = false;
        this.kNode.active = false;

        this.btnReady.active = true;
        // this.birdBtnReady.active = true;
        TableInfo.status = data.status;
        this.exitBtnStatus();

        TableInfo.current = null;
        this.nodeTx.active = false;
        // TableInfo.endGame = data.finish;
        TableInfo.bao = data.bao;
        this._delayTime = 10;
        let num = [];
        data.players.forEach((player, i) => {
            let playerInfo = this.nodePlayerInfo[TableInfo.realIdx[i]];
            playerInfo.resetPlayer();
            playerInfo.setWallet(player.wallet)
            //当前玩家
            if (TableInfo.idx == i) {
                this.changeAutoBtn(false);
                GameConfig.ZDCurrentGroup = player.group;
            }

            //隐藏报单
            playerInfo.activeBaodan(false);
            TableInfo.players[i].bao = null;

        });
        let summary = cc.instantiate(this.summaryPrefab);
        cc.find('Canvas').addChild(summary, 0, "roundSummary")
        summary.getComponent("ModuleSummary09").initData(data);
        TableInfo.bao = -1;
    },

    Share() {
        this.showShare();
    },

    backHall() {
        GameConfig.ShowTablePop = true;
        connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
        // connector.disconnect();
    },
    /**-------------------------------------------------------------------------------------------------------------------- */
    onDebuggerBtn() {
        Cache.showTipsMsg("积分不足", () => {
        })
        // connector.emit(PACK.CS_FILL_ROBOT, {});
    },

    /**点击托管 */
    onStartAuto() {
        Cache.playSfx();
        //TODO
        if (TableInfo.status != GameConfig.GameStatus.START) {
            return;
        }
        connector.gameMessage(ROUTE.CS_START_AUTO, {});
    },
    /**取消托管 */
    onCancelAuto() {
        Cache.playSfx();
        connector.gameMessage(ROUTE.CS_CANCEL_AUTO, {});
    },
    /** 取消托管 */
    cancelAuto(data) {
        this.nodePlayerInfo[TableInfo.realIdx[data.idx]].activeAuto(false);
        if (TableInfo.idx == data.idx) {
            this.changeAutoBtn(false)
        }
    },
    /**开始托管 */
    startAuto(data) {
        this.nodePlayerInfo[TableInfo.realIdx[data.idx]].activeAuto(true);
        if (TableInfo.idx == data.idx) {
            this.changeAutoBtn(true)
        }
    },
    changeAutoBtn(bool) {
        this.autoBtn.active = !bool;
        this.autoMask.active = bool;
    },
    /**返回大厅 */
    onClickExit() {
        Cache.playSfx();
        if (this.onExitting) return;
        if (TableInfo.status == GameConfig.GameStatus.START) return;
        this.onExitting = true;
        Cache.showConfirm("是否退出房间", () => {

            GameConfig.ShowTablePop = true;
            this.onExitting = false;
            connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
            // cc.director.loadScene("Lobby");
        }, () => {
            this.onExitting = false;
        });

    },

    /**连炸动画 */
    bombAnim(data) {
        let item = cc.instantiate(this.bomb);
        item.parent = cc.find("Canvas");
        item.getComponent("BombAnim").startAnim(data);
    },

    /**四人坐满  距离有小于500m的 gps 闪烁 */
    onGpsTwinkling() {
        // if (!GameConfig.xhzdConfig.distance) {
        //     this.gpsBtn.active = false;
        //     return;
        // }
        this.gpsBtn.active = true;

        let data = [null, null, null, null];
        let ip = [null, null, null, null];
        TableInfo.players.forEach((player, i) => {
            if (utils.isNullOrEmpty(player.prop)) return;
            data[TableInfo.realIdx[player.idx]] = player;
            ip[i] = player.prop.ip;
        });


        if ((ip[0] == ip[1] && ip[0] != null && ip[1] != null)
            || (ip[0] == ip[2] && ip[0] != null && ip[2] != null)
            || (ip[1] == ip[2] && ip[1] != null && ip[2] != null)
            || (ip[0] == ip[3] && ip[0] != null && ip[3] != null)
            || (ip[1] == ip[3] && ip[1] != null && ip[3] != null)
            || (ip[3] == ip[2] && ip[3] != null && ip[2] != null)) {
            //提示ip一样
            Cache.alertTipPop("警告： 有玩家之间的ip相同！！！");
            return;
        }

        let count = 0;
        if (this.checkPlayer(data[0]) && this.checkPlayer(data[1])) {
            count += utils.judgeDistance(data[0].location, data[1].location, 500);
        }

        if (this.checkPlayer(data[0]) && this.checkPlayer(data[2])) {
            count += utils.judgeDistance(data[0].location, data[2].location, 500);
        }

        if (this.checkPlayer(data[0]) && this.checkPlayer(data[3])) {
            count += utils.judgeDistance(data[0].location, data[3].location, 500);
        }

        if (this.checkPlayer(data[1]) && this.checkPlayer(data[2])) {
            count += utils.judgeDistance(data[1].location, data[2].location, 500);
        }

        if (this.checkPlayer(data[1]) && this.checkPlayer(data[3])) {
            count += utils.judgeDistance(data[1].location, data[3].location, 500);
        }
        if (this.checkPlayer(data[2]) && this.checkPlayer(data[3])) {
            count += utils.judgeDistance(data[2].location, data[3].location, 500);
        }

        if (count > 0) {
            //提示距离小于500m
            Cache.alertTipPop("警告： 有玩家之间距离小于500米！！！");
            return;
        }

    },
    checkPlayer(data) {
        return data != null && data.prop != null && data.location != null && data.location.lat != 0 && data.location.long != 0;
    },
    onDistancePop() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.DistanceZDPop);
    },

    exitBtnStatus() {
        this.exitBtn.active = TableInfo.status == GameConfig.GameStatus.WAIT||TableInfo.status == GameConfig.GameStatus.DESTORY;

    },

    /** */
    downloadTime(times) {
        //出牌倒计时
        this.lblTime.unscheduleAllCallbacks();

        let time = 15;
        let endTime = utils.getTimeStamp(times);
        let newTime2 = utils.getTimeStamp();
        let time1 = Math.floor((endTime - newTime2) / 1000);
        if (time > 0)
            this.lblTime.string = time;
        this.lblTime.schedule(() => {
            // time--;
            let newTime1 = utils.getTimeStamp();
            let time = Math.floor((endTime - newTime1) / 1000);
            // let nowTime=new Date().children
            if (time < 0) return;
            this.lblTime.string = time;
        }, 1);
    },




    onDestroy() {
        this.removeEvents();
        this.removeGoEasyEvents();
    }

});