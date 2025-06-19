let ROUTE = require("../../../Main/Script/ROUTE")//require("ROUTE");
let TableInfo = require("../../../Main/Script/TableInfo");
let connector = require("../../../Main/NetWork/Connector")//require('Connector');
let db = require("../../../Main/Script/DataBase")//require("DataBase");
let PACK = require("PACK");
let logic = require("Logic07");
let utils = require("../../../Main/Script/utils")//require("utils");
let Native = require('../../../Main/Script/native-extend');
let _social = Native.Social;
let audioCtrl = require("audio-ctrl");
let VoiceCtrl = require("voice-ctrl");
let Cache = require("../../../Main/Script/Cache");//require("Cache");
const { GameConfig } = require("../../../GameBase/GameConfig");
const { App } = require("../../../script/ui/hall/data/App");

let customConfig = {
    ext: false,
    show: true,
    black: false,
    bird: true,
    rand: true,
    four: true,
    aaa: false,
    limit: true,
    person: 3,
    clan: true,
    turn: 10
};

const fileName = `local-0.amr`;
const CN_PERSON = ["", "一", "二", "三"];

const LimitCount = 40;

cc.Class({
    extends: require('GameBase'),

    properties: {
        _delayTime: 0,
        lastBtnState: false,
        prePlayerInfo: cc.Prefab,
        layerHandCards: cc.Layout,
        testCards: cc.Layout,
        hands: [],
        lblRoomId: cc.Label,
        lblTurn: cc.Label,
        lblGameType: cc.Label,
        lblBase: cc.Label,
        lblNiao: cc.Label,
        lblDistance: cc.Label,
        btnTips: cc.Node,
        btnPlayCards: cc.Node,
        dropCards: [cc.Layout],
        preCards: cc.Prefab,
        imgPass: [cc.Node],
        nodePlayerInfo: [],
        preCoin: cc.Prefab,
        birdReadyBtn: cc.Node,
        normalReadyBtn: cc.Node,
        shuffleBtn: cc.Node,
        unShuffleBtn: cc.Node,
        bgTable: cc.Node,
        preType: cc.Prefab,//牌的类型
        bgCount: [cc.Layout],

        sprDisnable: cc.Node,//玩家自身无能出的牌 提示
        sfxClip: {
            type: cc.AudioClip, // use 'type:' to define an array of Texture2D objects
            default: null
        },
        summaryPrefab: cc.Prefab,
        // nodeBalanceItem: cc.Prefab,
        // nodeSummaryItem: cc.Prefab,
        prePlayCards: cc.Prefab,
        pokerSkeleton: [sp.SkeletonData],
        aniNode: cc.Prefab,
        // sprFail: cc.Node,
        // sprWin: cc.Node,
        nodeBack: cc.Prefab,
        //sprPos:[cc.Node]
        currentAutoStatus: false,
        startAutoBtn: cc.Node,//托管按钮
        cancelAutoBtn: cc.Node,//托管按钮
        /**退出按钮 */
        exitBtn: cc.Node,
        autoMask: cc.Node,//遮罩
        showCardContent1: cc.Node,
        showCardContent2: cc.Node,

        //解散
        nodeTx: cc.Node,

        cutAnim: sp.SkeletonData,
        bgNode: cc.Sprite,
        cutTips: cc.Node,
        readyData: null,
        lastAutoTime: 0
    },

    // use this for initialization
    onLoad() {

        if (GameConfig.isTest)
            return
        // let indexBg = utils.getValue(GameConfig.StorageKey.tableBgIndex, 0)
        // this.bgNode.spriteFrame = GameConfig.tableBgSprite[indexBg];
        this.initChatContent();
        this.readyData = {};
        this.initGameBase();
        //添加监听事件
        this.addEvents();
        this.alReady = false;
        TableInfo.idx = -1;
        this.layerHandCards.node.getComponent("LayerHandsCards07").touchEvent();
        connector.emit(PACK.CS_JOIN_DONE, {});
        connector.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.ENTER_SCENE, gamtype: "PDK_SOLO" });
        this.schedule(() => {
            this.gameMsgSchedule();
        }, 0.1);

        //tianjia
        utils.pop(GameConfig.pop.TipsCard, (node) => {
            node.setPosition(-cc.winSize.width / 2 + 200, cc.winSize.height / 2 - node.height / 2)
            this.tipsCardPrefab = node.getComponent("ModuleTipsCard");
        })
    },
    /**添加监听事件 */
    addEvents() {
        this.startAutoBtn.on(cc.Node.EventType.TOUCH_END, this.onStartAuto, this);
        this.cancelAutoBtn.on(cc.Node.EventType.TOUCH_END, this.onCancelAuto, this);
        this.exitBtn.on(cc.Node.EventType.TOUCH_END, this.onClickExit, this);
        this.birdReadyBtn.on(cc.Node.EventType.TOUCH_END, this.birdReady, this);
        this.normalReadyBtn.on(cc.Node.EventType.TOUCH_END, this.normalReady, this);
        this.shuffleBtn.on(cc.Node.EventType.TOUCH_END, this.shuffleCard, this);
        this.unShuffleBtn.on(cc.Node.EventType.TOUCH_END, this.unShuffleCard, this);


        this.node.on(GameConfig.GameEventNames.PDK_BACK_HALL, this.backHall, this);

        App.EventManager.addEventListener(GameConfig.GameEventNames.PDK_SHUFFLE_CARD, this.summaryHandleGame, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.PDK_CONTINUE_GAME, this.showReadyBtn, this);
    },
    /**移除监听事件 */
    removeEvents() {
        this.startAutoBtn.off(cc.Node.EventType.TOUCH_END, this.onStartAuto, this);
        this.cancelAutoBtn.off(cc.Node.EventType.TOUCH_END, this.onCancelAuto, this);
        this.exitBtn.off(cc.Node.EventType.TOUCH_END, this.onClickExit, this);

        this.node.off(GameConfig.GameEventNames.PDK_BACK_HALL, this.backHall, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.PDK_SHUFFLE_CARD, this.summaryHandleGame, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.PDK_CONTINUE_GAME, this.showReadyBtn, this);

    },
    initChatContent() {
        this.node.on('chatAlready', () => {
            let windowNode = cc.find("Canvas")
            let data = {
                str: ['快点啊,我等得花儿都谢了', '你的牌打的真是太好了', '不要走,决战到天亮', '不好意思,我得离开一会', '咱们交个朋友吧', '不要吵了,专心玩游戏吧'],
                url: 'ChatImg/Game11',
                aniPos: [
                    cc.v2(139 / 2 - windowNode.width / 2 + GameConfig.FitScreen, 29),
                    cc.v2(windowNode.width / 2 - 139 / 2 - GameConfig.FitScreen, 130 + 29),
                    // cc.v2(139 / 2 - windowNode.width / 2 + GameConfig.FitScreen, 0 + 29),
                ],
                msgPos: [
                    cc.v2(139 / 2 - windowNode.width / 2 + GameConfig.FitScreen + 50, 83),
                    cc.v2(windowNode.width / 2 - 139 / 2 - GameConfig.FitScreen - 50, 130 + 83),
                    // cc.v2(139 / 2 - windowNode.width / 2 + GameConfig.FitScreen + 50, 130 + 83),
                ],
                facePos: [
                    cc.v2(239 - windowNode.width / 2 + GameConfig.FitScreen, 0),
                    cc.v2(windowNode.width / 2 - 139 - GameConfig.FitScreen, 130),
                    // cc.v2(239 - windowNode.width / 2 + GameConfig.FitScreen, 130),
                ],
                faceAnchor: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
            };
            this.chat.init(data);
        });
    },



    playSE() {
        audioCtrl.getInstance().setSFXVolume(db.getFloat(db.STORAGE_KEY.SET_SOUND, 1));
        audioCtrl.getInstance().playSFX(this.sfxClip);
    },



    gameMsgSchedule() {
        if (this._delayTime > 0) {
            this._delayTime--;
            return;
        }
        if (connector._queueGameMsg.length <= 0)
            return;
        let msg = connector._queueGameMsg.shift();
        let logs = cc.sys.isBrowser ? msg : JSON.stringify(msg)
        console.log(logs)
        if (msg.route == ROUTE.SC_GAME_DATA || msg.route == ROUTE.SC_JOIN_TABLE || msg.route == ROUTE.SC_RECONNECT)
            this.alReady = true;
        if (!this.alReady)
            return;

        switch (msg.route) {
            case ROUTE.SC_GAME_DATA: //进桌 重连
                // let a = { "idx": 0, "hands": [], "options": { "tableID": "365063", "clubID": 580479, "gameID": "TDG43CQH", "roomID": 8, "mode": "CUSTOM", "person": 2, "base": 2, "fee": 2, "lower": 50, "gameType": "PDK", "maxRound": 8, "clock": 30 }, "turn": 1, "round": 1, "status": "DESTORY", "players": [{ "prop": { "pid": 294643, "name": "辛勤招牌", "sex": "male", "head": "avatar/m/325.jpg", "cluster": [294643], "parent": 294643 }, "wallet": 1000, "location": { "lat": 27.37237464320103, "long": 112.04149989818204 }, "ip": "110.53.7.215", "idx": 0, "auto": false, "clock": 1641367986248, "offline": false, "ready": null, "total": 0, "hands": 0 }, { "prop": null, "wallet": null, "idx": 1, "auto": false, "clock": 1641367918762, "offline": false, "ready": null, "total": 0, "hands": 0 }], "disband": { "idx": -1, "last": 0, "clock": 0, "status": "EMPTY", "data": ["wait", "wait"] }, "gameID": "TDG43CQH", "tableID": "365063", "banker": 1, "records": [], "currentCard": null, "currentIDX": 0 }
                // console.log("--a-", a)
                // this.resume(a);
                this.resume(msg.data);
                break;
            //玩家进入房间
            case ROUTE.SC_JOIN_TABLE:
                this.initTable(msg.data);
                break;
            //重连
            case ROUTE.SC_RECONNECT:
                this.resume(msg.data);
                break;
            //游戏开始
            case ROUTE.SC_GAME_INIT:
                this.initGame(msg.data);
                break;
            //玩家出牌
            case ROUTE.SC_PLAY_CARD:
                this.playCard(msg.data);
                break;
            //显示玩家出牌
            case ROUTE.SC_SHOW_CARD:
                this.showPlayCards(msg.data);
                break;
            case ROUTE.SC_GAME_READY:
                this.changeReady(msg.data);
                break;
            case ROUTE.SC_PASS_CARD:
                this.showPass(msg.data);
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
            //分数改变
            case ROUTE.SC_SCORE:
                this.scoreFly(msg.data);
                break;
            case ROUTE.SC_FINISH:
                this.finish();
                break;
            case ROUTE.SC_ROUND_SUMMARY:
                this.roundSummary(msg.data);
                break;
            case ROUTE.SC_GAME_SUMMARY:
                // this.gameSummary(msg.data);
                break;

            case ROUTE.SC_GAME_CHAT:
                if (this.chat != null)
                    this.chat.contentFly(msg.data);
                break;
            case ROUTE.SC_SYSTEM_NOTICE:
                utils.pop(GameConfig.pop.NoticePop, (node) => {
                    node.getComponent('ModuleNotice').showTips(msg.data.msg, message.data.times);
                })
                break;
            case ROUTE.SC_PLAY_ERROR:
                //Cache.alertTip("必须带黑桃三");
                break;
            case ROUTE.SC_ALERT:
                this.acBaodan(msg.data);
                break;
            case ROUTE.SC_LOCATION:
                this.refreshLoc(msg.data);
                break;
            case ROUTE.SC_CANCEL_AUTO:
                this.cancelAuto(msg.data);
                break;
            case ROUTE.SC_START_AUTO:
                this.startAuto(msg.data);
                break;
            case ROUTE.SC_TIPS:
                this.showTipsCard(msg.data);
                break;
            case ROUTE.SC_TOAST:
                if (!utils.isNullOrEmpty(msg.data.message))
                    Cache.alertTip(msg.data.message);
                break;
            case ROUTE.SC_DISBAND:
                this.nodeTx.getComponent("ModuleTouxiang08").txInit(msg.data);
                break;
            case ROUTE.SC_GAME_DESTORY:
                this.destoryGame()
                break;
            case 'SC_TEST':
                this.testCards1(msg.data)
                break;
            default:
                cc.error(msg);
        }
    },

    testCards1(data) {
        data.sort((a, b) => a % 100 - b % 100);
        let hands = data;
        hands.reverse();
        let layerHandCards = this.testCards.node.getComponent("LayerHandsCards07");
        layerHandCards.refreshHandCards(hands, true);

    },
    destoryGame() {
        connector._queueGameMsg = [];
        connector._queueChatMsg = [];
        connector.disconnect();
    },
    refreshLoc(data) {
        let idx = data.idx;
        let targetPlayer = TableInfo.players[idx];
        if (targetPlayer) {
            targetPlayer.prop.loc = data.loc;
        }
    },
    /**要不起 */
    showPass(data) {
        let realIdx = TableInfo.realIdx[data.idx];
        this.dropCards[realIdx].node.destroyAllChildren();
        this.bgCount[realIdx].node.destroyAllChildren();
        this.imgPass[realIdx].active = false;
        this._delayTime = 5;
        this.changeBtn(false);
        //闹钟
        this.sprDisnable.active = data.idx == TableInfo.idx;
        let voice = this.bgTable.getComponent("BgTableAudioCtr07");
        voice.PassVoice(TableInfo.players[data.idx].prop.sex);
        let nodePass = this.imgPass[TableInfo.realIdx[data.idx]];
        nodePass.active = true;
        // nodePass.scale = 0;
        // nodePass.runAction(cc.scaleTo(0.2, 1));
    },



    initGame(data) {
        if (this.node.getChildByName("roundSummary")) {
            this.node.getChildByName("roundSummary").removeFromParent();
        }
        this.nodePlayerInfo.forEach((playerInfo, i) => {
            playerInfo.activeReady(false);
            //更新剩余牌数
            playerInfo.changeCardCount(15);
        });
        TableInfo.baodan = TableInfo.options.person == 2 ? [false, false] : [false, false, false];
        TableInfo.zhuang = data.banker;
        TableInfo.firstPlay = true;
        TableInfo.current = null;
        TableInfo.status = GameConfig.GameStatus.START;
        this.exitBtn.active = false;
        this.setTurn(data);
        this.startAutoBtn.active = true;
        if (!utils.isNullOrEmpty(data.shuffle)) {
            this.cutCount = 0;
            this.cutIdx = [];
            this.shuffleData = data;
            data.shuffle.forEach((e) => {
                if (e.shuffle) {
                    this.cutCount++;
                    this.cutIdx.push(e.idx)
                }
                let idx = TableInfo.realIdx[e.idx];
                // this.nodePlayerInfo[idx].setScore(e.wallet);
            })
            this.handleShuffle();

        } else {
            //初始化玩家手牌
            this.initHands(data, false);
        }
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
            this.cutTips.getChildByName("name").getComponent(cc.Label).string = "" + TableInfo.players[idx].prop.name + "正在洗牌";
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
        }
    },
    /**初始化桌子 */
    initTable(data) {
        let windowNode = cc.find("Canvas")
        this.showCardContent1.position = cc.v2(windowNode.width / 2 - 139 - 70 / 2 - GameConfig.FitScreen, 130);
        this.showCardContent2.position = cc.v2(139 - windowNode.width / 2 + 70 + GameConfig.FitScreen, 130);
        TableInfo.zhuang = data.banker;
        TableInfo.firstPlay = false;
        TableInfo.status = data.status;
        this.exitBtnStatus();
        TableInfo.idx = data.idx;
        TableInfo.options = data.options;
        TableInfo.config = customConfig;
        TableInfo.current = data.current;
        //显示游戏 类型 公会
        this.lblGameType.string = "" + GameConfig.GameName[data.options.gameType] + (data.options.maxRound == 1 ? '把结' : '（8小局）');
        this.lblBase.string = "底分: " + utils.formatGold(data.options.base);
        this.lblNiao.string = "打鸟: " + utils.formatGold(data.options.bird);
        this.lblRoomId.string = '房间号: ' + data.tableID;

        //TODO 设置位置
        let idx = data.idx;
        //设置玩家座位位置方位
        if (TableInfo.options.person == 3) {
            this.realIdx = [0, 0, 0];
            this.realIdx[idx] = 0;
            this.realIdx[(idx + 1) % 3] = 1;
            this.realIdx[(idx + 2) % 3] = 2;
        } else {
            this.realIdx = [0, 0];
            this.realIdx[idx] = 0;
            this.realIdx[(idx + 1) % 2] = 1;
        }
        TableInfo.realIdx = this.realIdx;

        //建立玩家数据数组
        if (!utils.isNullOrEmpty(this.nodePlayerInfo)) {
            this.nodePlayerInfo.forEach((player) => {
                player.removePlayer();
            })
        }

        this.setTurn(data);

        this.initPlayers(data);

        //隐藏托管
        this.changeAutoBtn(false)
    },


    /**初始化玩家 */
    initPlayers(data) {
        this.nodePlayerInfo = new Array(TableInfo.options.person);
        TableInfo.players = data.players;
        data.players.forEach((player, i) => {
            let nodePlayer = cc.instantiate(this.prePlayerInfo);
            nodePlayer.parent = this.bgTable;
            let playerInfo = nodePlayer.getComponent("ModulePlayerHead07");
            playerInfo.init(player, i);
            this.nodePlayerInfo[TableInfo.realIdx[player.idx]] = playerInfo;

            if (TableInfo.idx == player.idx && (TableInfo.status == GameConfig.GameStatus.WAIT || TableInfo.status == GameConfig.GameStatus.SUMMARY)) {

                if (TableInfo.options.maxRound > 1 && data.round > 1) {
                    this.shuffleBtnStatus(!player.ready);
                } else {
                    this.readyBtnStatus(!player.ready);

                }
            }


            if (TableInfo.idx == player.idx)
                this.changeAutoState(player)
        });
    },

    leavePlayer(idx) {
        this.node.removeAllChildren();
        connector.disconnect();
    },

    /**重连 */
    resume(data) {


        this.initTable(data);
        if (data.disband) {
            this.nodeTx.getComponent("ModuleTouxiang08").txInit(data.disband);
        }
        if (data.status == GameConfig.GameStatus.WAIT || data.status == GameConfig.GameStatus.PREPARE || data.status == GameConfig.GameStatus.SUMMARY) {
            return;
        }
        this.readyBtnStatus(false);
        this.shuffleBtnStatus(false);

        data.players.forEach(player => {
            this.nodePlayerInfo[TableInfo.realIdx[player.idx]].activeAutoPlay(player.auto);
            //隐藏准备按钮
            this.nodePlayerInfo[TableInfo.realIdx[player.idx]].activeReady(false);
            if (TableInfo.idx == player.idx)
                this.changeAutoState(player)
            //报单
            console.log('---', player.hands)
            if (player.hands == 1) {
                TableInfo.baodan[player.idx] = true;
                this.nodePlayerInfo[TableInfo.realIdx[player.idx]].activeBaodan(true);
            }
            if (player.historyCard != null) {
                this.showPlayCards(player.historyCard);
            }
            if (data.currentCard != null && player.idx == data.currentCard.idx) {
                this.showPlayCards(data.currentCard);
            }
        });

        TableInfo.current = data.current;
        this.initHands(data, true);
        //TODO 

        let playCardData = {
            idx: data.currentIDX,
            clock: data.clock//new Date().getTime() + 26 * 1000
        }
        this.playCard(playCardData);

    },
    /**炸弹加分 */
    scoreFly(data) {

        //出牌区归零
        this.dropCards.forEach((ground, i) => {
            ground.node.removeAllChildren(true);
            //牌的类型 归零
            this.bgCount[i].node.removeAllChildren(true);
            //隐藏要不起
            this.imgPass[i].active = false;
        });
        //玩家自身无能出的牌 提示 隐藏
        this.sprDisnable.active = false;
        // let person = data.from.length;
        //播放加金币音效
        // let url = cc.url.raw(`resources/Audio/Common/addScore.mp3`);
        // audioCtrl.getInstance().playSFX(url);
        // let spawn = [];
        // let playPos = [
        //     cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, - 63),
        //     cc.v2(cc.winSize.width / 2 - 139 / 2 - GameConfig.FitScreen, 130 - 63),
        //     cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, 110 - 63),
        // ]
        // //结束点位置
        // let endPos = playPos[TableInfo.realIdx[data.to[0].idx]];
        // //分数显示
        // this.nodePlayerInfo[TableInfo.realIdx[data.to[0].idx]].showBombScores(TableInfo.realIdx[data.to[0].idx], data.to[0].wallet, data.to[0].score, () => {
        //     for (let i = 0; i < 20; i++) {
        //         let nodeCoin = cc.instantiate(this.preCoin);
        //         nodeCoin.parent = this.node;
        //         nodeCoin.setPosition(playPos[TableInfo.realIdx[data.from[i % person].idx]]);
        //         let pos = cc.v2(Math.random() * 100 - 50, Math.random() * 100 - 50);
        //         spawn.push(cc.targetedAction(nodeCoin,
        //             cc.sequence(
        //                 cc.delayTime(0.1 * Math.random()),
        //                 cc.spawn(
        //                     cc.moveBy(0.3, pos),
        //                     cc.scaleTo(0.3, 0.7)
        //                 ),
        //                 cc.moveTo(0.4, endPos),
        //                 cc.callFunc(function () {
        //                     this.destroy();
        //                 }, nodeCoin)
        //             )
        //         ));
        //     }
        //     //分数隐藏后飘金币动画
        //     this.node.runAction(cc.spawn(spawn));
        // });
        // data.from.forEach((f, i) => {
        //     this.nodePlayerInfo[TableInfo.realIdx[f.idx]].showBombScores(TableInfo.realIdx[f.idx], f.wallet, f.score);
        // });

    },

    finish() {
        this.dropCards.forEach((ground, i) => {
            ground.node.destroyAllChildren(true);
            this.bgCount[i].node.destroyAllChildren(true);
            this.imgPass[i].active = false;
        });
        this.sprDisnable.active = false;
        TableInfo.current = null;
    },


    resetCards() {  //重选按钮
        let objHands = this.layerHandCards.getComponent("LayerHandsCards07");
        objHands.nodeCards.forEach(card => {
            let bgCardMask = card.getChildByName("bgCardMask");
            bgCardMask.active = false;
            card._prior = false;
            card.isZhankai = false;
            card.setPosition(card.pos0);
        });
        this.btnPlayCards.getComponent(cc.Button).interactable = false;
    },

    initHands(data, bool) {
        data.hands.sort((a, b) => a % 100 - b % 100);
        this.hands = data.hands;
        this.hands.reverse();
        let layerHandCards = this.layerHandCards.node.getComponent("LayerHandsCards07");
        layerHandCards.refreshHandCards(this.hands, bool);
        if (!bool)
            this.cutCards(this.hands);
    },


    cutCards(data) {
        this._delayTime = 100;
        let pos = [
            cc.v2(522, 350),
            cc.v2(-522, 250)
        ];
        let nodeShowCard = [];
        let nodeMyCard = [];
        let seq = [];
        let spawn = [];
        let dealSpawn = [];
        let handsSeq = [];
        let url = cc.url.raw(`resources/Audio/Common/deal07.mp3`);
        let middle = Math.ceil(data.length / 2);
        for (let i = 0; i < data.length * (TableInfo.options.person - 1); i++) {
            let node = cc.instantiate(this.nodeBack);
            node.parent = this.layerHandCards.node;
            node.setPosition(0, 0);
            nodeShowCard.push(node);
        }
        for (let i = 0; i < data.length; i++) {
            let node = cc.instantiate(this.nodeBack);
            node.parent = this.layerHandCards.node;
            node.setPosition(0, 0);
            nodeMyCard.push(node);
        }
        let dealSpawn1 = [], dealSpawn2 = [];
        nodeShowCard.forEach((back, i) => {
            dealSpawn1.push(cc.targetedAction(back,
                cc.sequence(
                    cc.delayTime(0.02 * i % 3),
                    cc.spawn(
                        cc.rotateBy(0.3, 180),
                        cc.scaleTo(0.3, 1),
                        cc.moveTo(0.6, pos[i % (TableInfo.options.person - 1)]),
                        cc.sequence(
                            cc.delayTime(0.4),
                            cc.fadeOut(0.2)
                        )
                    ),
                    cc.delayTime(0.2),
                    cc.callFunc(function () {
                        this.destroy();
                    }, back)
                )));
        });
        nodeMyCard.forEach((back, i) => {
            dealSpawn2.push(cc.targetedAction(back,
                cc.sequence(
                    cc.delayTime(0.02 * i % 3),
                    cc.spawn(
                        cc.rotateBy(0.3, 180),
                        cc.scaleTo(0.3, 1),
                        cc.moveTo(0.6, -273 + (8 - middle + i) * 40, 80),
                        cc.callFunc(() => {
                            if (i % 9 == 0)
                                audioCtrl.getInstance().playSFX(url);
                        }),
                        cc.sequence(
                            cc.delayTime(0.4),
                            cc.fadeOut(0.2)
                        )
                    ),
                    cc.callFunc(function () {
                        this.destroy();
                    }, back)
                )));
        });
        let cards = this.layerHandCards.node.getComponent("LayerHandsCards07");
        cards.nodeCards.forEach((card, x) => {
            card.active = true;
            if (card)
                card.opacity = 0;
            // card.runAction(cc.sequence(cc.delayTime(x / data.length), cc.fadeIn(0.2)));
            handsSeq.push(cc.targetedAction(card, cc.sequence(cc.delayTime(x / data.length), cc.fadeIn(0.2))));
        });
        this._delayTime = 0;

        spawn.push(cc.spawn(dealSpawn1));
        spawn.push(cc.spawn(dealSpawn2));
        spawn.push(cc.spawn(handsSeq));
        seq.push(cc.spawn(spawn));
        seq.push(cc.callFunc(() => {
            this._delayTime = 0;
        }));
        try {
            this.node.runAction(cc.sequence(seq));
        } catch (ex) {
            _social.reportError(ex);
            nodeMyCard.forEach(e => {
                e.destroy();
            })
            nodeShowCard.forEach(e => {
                e.destroy();
            })
            cards.nodeCards.forEach((card, x) => {
                card.active = true;
                if (card)
                    card.opacity = 255;
            });
            this._delayTime = 0;
        }

    },


    playCard(data) {
        TableInfo.currentPlayer = data.idx;
        let idx = data.idx
        let realIdx = TableInfo.realIdx[idx];
        this.dropCards[realIdx].node.destroyAllChildren();
        this.bgCount[realIdx].node.destroyAllChildren();
        this.imgPass[realIdx].active = false;
        this.showPlayCardLight(idx);
        if (TableInfo.firstPlay) {
            this.nodePlayerInfo[TableInfo.realIdx[idx]].activeBanker(true);
        }

        //TODO 倒计时
        let time = Math.max((data.clock - utils.getTimeStamp()) / 1000, 0);


        this.nodePlayerInfo[TableInfo.realIdx[idx]].showClock(time);


        if (idx == TableInfo.idx) {
            console.log("显示出牌按钮", idx, TableInfo.idx)
            let cards = this.layerHandCards.getComponent("LayerHandsCards07");
            cards.checkCurrent();
            this.changeBtn(true);
            this.btnTips.tipsTime = 0;
            this.btnTips.getComponent(cc.Button).interactable = TableInfo.current != null;

            let hands = this.hands;  //add
            let newHands = [];
            hands.forEach(card => {
                newHands.push(card);
            });
            let results = logic.autoplay(newHands, TableInfo.current, 0, TableInfo.config);
            if (results && results.length == 1) {
                this.btnTips.getComponent("BtnTips07").tipsStart();
            }

        }
        TableInfo.firstPlay = false;
    },


    acChupai() {   //出牌按钮
        if (this.btnPlayCards._last == null)
            this.btnPlayCards._last = 0;
        if (new Date().getTime() - this.btnPlayCards._last < 1000)
            return;
        this.btnPlayCards._last = new Date().getTime();
        let emp = JSON.parse(JSON.stringify(TableInfo.select));
        connector.gameMessage(ROUTE.CS_PLAY_CARD, emp.cards, true);
    },
    birdReady() {
        Cache.playSfx();
        this.readyData.plus = true;
        this.initDesk();

        this.readyBtnStatus(false);
        this.shuffleBtnStatus(true);

        // connector.gameMessage(ROUTE.CS_GAME_READY, { plus: true });
    },
    normalReady() {
        Cache.playSfx();
        this.readyData.plus = false;
        this.initDesk();

        this.readyBtnStatus(false);
        this.shuffleBtnStatus(true);

        // connector.gameMessage(ROUTE.CS_GAME_READY, { plus: false });
    },
    showReadyBtn() {
        this.readyBtnStatus(true);
    },
    summaryHandleGame(e) {
        console.log("是否洗牌开始--", e)
        if (e.data) {
            this.shuffleCard();
        } else {
            this.unShuffleCard();
        }
    },
    shuffleCard() {
        Cache.playSfx();
        this.initDesk();

        this.readyData.shuffle = true;
        connector.gameMessage(ROUTE.CS_GAME_READY, this.readyData);
    },
    unShuffleCard() {
        Cache.playSfx();
        this.initDesk();
        this.readyData.shuffle = false;
        connector.gameMessage(ROUTE.CS_GAME_READY, this.readyData);
    },

    initDesk(index = 0) {  //继续游戏初始化桌子
        this.sprDisnable.active = false;
        //移除结算界面

        if (this.node.getChildByName("roundSummary")) {
            this.node.getChildByName("roundSummary").removeFromParent();
        }
        // this.nodePlayerInfo.forEach((player) => {
        //     player.resetPlayer();
        // });
        this.layerHandCards.node.destroyAllChildren();
        this.layerHandCards.getComponent("LayerHandsCards07").nodeCards = [];
        this.dropCards.forEach((ground, i) => {
            ground.node.destroyAllChildren();
            this.bgCount[i].node.destroyAllChildren();
            this.imgPass[i].active = false;
        });
    },
    acBaodan(data) {
        Cache.playSound(`${TableInfo.players[data.idx].prop.sex}_baodan`);
        TableInfo.baodan[data.idx] = true;
        this.nodePlayerInfo[TableInfo.realIdx[data.idx]].activeBaodan(true);
    },

    showPlayCards(group) {

        let cardType = ["", "", "", "", "", "五连顺", "六连顺", "七连顺", "八连顺", "九连顺", "十连顺", "十一连顺", "十二连顺",];
        //隐藏出牌按钮
        this.changeBtn(false);
        //当前出牌数据
        TableInfo.current = null;
        TableInfo.current = group;
        this._delayTime = 5;
        //隐藏出牌者出牌提示
        let idx = TableInfo.realIdx[group.idx];
        this.nodePlayerInfo[idx].activeOffline(false);
        this.nodePlayerInfo[idx].activeAutoPlay(group.auto);
        this.nodePlayerInfo[idx].playCardLight(false);
        this.nodePlayerInfo[idx].hideClock();
        this.nodePlayerInfo[idx].changeCardCount(group.hands);


        if (TableInfo.idx == group.idx)
            this.changeAutoState(group)
        //  播放出牌动画
        let url = cc.url.raw(`resources/Audio/Common/playCard.mp3`);
        audioCtrl.getInstance().playSFX(url);
        //  出牌者位置下标
        let realIdx = TableInfo.realIdx[group.idx];
        //清除出牌区
        if (this.dropCards[realIdx].node.children.length > 0) {
            this.dropCards[realIdx].node.destroyAllChildren();
            this.bgCount[realIdx].node.destroyAllChildren();
        }
        //玩家自身无能出的牌 提示 隐藏
        this.sprDisnable.active = false;
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
                type.getComponent("cc.Label").string = cardType[numCard];
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

        let audioCtr = this.bgTable.getComponent("BgTableAudioCtr07");
        audioCtr.playVoice(group, TableInfo.players[group.idx].prop.sex);
        //移除手牌
        this.removeHands(group);
        //显示牌
        let nodePlayCards = cc.instantiate(this.prePlayCards);
        nodePlayCards.scale = 1;
        nodePlayCards.parent = this.dropCards[realIdx].node;
        let empGroup = JSON.parse(JSON.stringify(group));
        nodePlayCards.getComponent("LayoutShowCards07").init(empGroup);
    },

    removeHands(data) {
        if (data.idx == TableInfo.idx) {
            data.cards.forEach(card => {
                for (let x = 0; x < this.hands.length; x++) {
                    let idx = this.hands.findIndex(c => card == c);
                    if (idx >= 0) {
                        this.hands.splice(idx, 1);
                        return;
                    }
                }
            });
            let cards = this.layerHandCards.getComponent("LayerHandsCards07");
            cards.refreshHandCards(this.hands, true);
        }
    },

    roundSummary(data) {
        this.nodeTx.active = false;
        //TODO //隐藏托管
        // if (TableInfo.turn >= 10)
        //     this.changeAutoBtn(false);
        //删除提示牌
        this.tipsCardPrefab.removeCards()
        this.dropCards.forEach((ground, i) => {
            ground.node.destroyAllChildren();
            this.bgCount[i].node.destroyAllChildren();
            this.imgPass[i].active = false;
        });
        TableInfo.zhuang = null;
        TableInfo.baodan = TableInfo.options.person == 2 ? [false, false] : [false, false, false];


        TableInfo.status = data.status;
        this.exitBtnStatus();

        if (data.winner == TableInfo.idx) {
            this.playManageAudio(`audio_win.mp3`);
        } else {
            this.playManageAudio(`audio_lose.mp3`);
        }
        this.node.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(() => {
                let summary = cc.instantiate(this.summaryPrefab);
                summary.getComponent("ModuleSummary07").initData(data);
                this.node.addChild(summary, 2, "roundSummary")

                data.players.forEach((player, i) => {
                    let idx = TableInfo.realIdx[player.idx]
                    this.nodePlayerInfo[idx].resetPlayer();
                    this.nodePlayerInfo[idx].setScore(player.wallet);

                    let nodePlayCards = cc.instantiate(this.prePlayCards);
                    nodePlayCards.scale = 1;
                    nodePlayCards.parent = this.dropCards[idx].node;
                    let empGroup = JSON.parse(JSON.stringify(player.hands));
                    nodePlayCards.getComponent("LayoutShowCards07").initRemainCard(empGroup);
                });
                // if (TableInfo.options.maxRound > 1||data.round>1) {
                //     this.shuffleBtnStatus(true);
                // } else {
                //     this.readyBtnStatus(true);

                // }

                this.readyBtnStatus(TableInfo.options.maxRound == 1);
            })
        ));
    },

    vote() {
        Cache.showConfirm("是否解散房间", () => {
            connector.gameMessage(ROUTE.CS_GAME_VOTE, { agree: true });
        });
    },

    backHall() {
        GameConfig.ShowTablePop = true;
        Cache.showMask("正在返回大厅...请稍后");
        connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
    },

    restartGame() {
        audioCtrl.getInstance().stopAll();
        cc.game.restart();
    },

    changeStatus(data) {
        let idx = TableInfo.realIdx[data.idx];
        let playerInfo = this.nodePlayerInfo[idx].activeOffline(data.offline);
    },

    changeReady(data) {
        if (TableInfo.idx == data.idx) {
            this.readyBtnStatus(false);
            this.shuffleBtnStatus(false);
        }
        this.nodePlayerInfo[TableInfo.realIdx[data.idx]].activeReady(true);
        this.nodePlayerInfo[TableInfo.realIdx[data.idx]].activeNiao(data);
    },
    showPlayCardLight(idx) {
        this.nodePlayerInfo.forEach(node => node.playCardLight(false));
        this.nodePlayerInfo[TableInfo.realIdx[idx]].playCardLight(true);
    },

    setTurn(data) {
        TableInfo.turn = data.round;
        this.lblTurn.string = data.round == 0 ? "" : '第' + data.turn + '圈 第' + data.round + "局";
    },

    restart(data) {
        audioCtrl.getInstance().stopAll();
        cc.game.restart();
    },

    /** 取消托管 */
    cancelAuto(data) {
        this.nodePlayerInfo[TableInfo.realIdx[data.idx]].activeAutoPlay(false);
        if (TableInfo.idx == data.idx) {
            this.changeAutoBtn(false)
        }
    },
    /**开始托管 */
    startAuto(data) {
        this.nodePlayerInfo[TableInfo.realIdx[data.idx]].activeAutoPlay(true);
        if (TableInfo.idx == data.idx) {
            this.changeAutoBtn(true)
        }
    },
    changeAutoBtn(bool) {
        this.startAutoBtn.active = !bool;
        this.autoMask.active = bool;
        this.currentAutoStatus = bool;

    },
    changeAutoState(data) {
        this.nodePlayerInfo[TableInfo.realIdx[data.idx]].activeAutoPlay(false);
        if (TableInfo.idx == data.idx)
            this.changeAutoBtn(data.auto)
    },

    /**点击开始托管 */
    onStartAuto() {

        if (TableInfo.status != GameConfig.GameStatus.START) {
            return;
        }
        this.changeAutoBtn(true)

        connector.gameMessage(ROUTE.CS_START_AUTO, {});
    },
    /**点击取消托管 */
    onCancelAuto() {
        this.changeAutoBtn(false)
        connector.gameMessage(ROUTE.CS_CANCEL_AUTO, {});
    },

    /**显示提示牌 */
    showTipsCard(data) {
        this.tipsCardPrefab.refreshCard(data.cards);

    },
    /**返回大厅 */
    onClickExit() {
        Cache.playSfx();
        if (this.onExitting) return;
        if (TableInfo.status == GameConfig.GameStatus.START) return;
        this.onExitting = true;
        Cache.showConfirm("是否退出房间", () => {
            this.onExitting = false;
            connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
        }, () => {
            this.onExitting = false;
        });

    },

    /**更新玩家距离 */
    updatePlayerDistance() {

        if (utils.isNullOrEmpty(TableInfo.players[0]) || utils.isNullOrEmpty(TableInfo.players[1])) {
            this.lblDistance.node.active = false;
            return;
        }
        this.lblDistance.node.active = true;
        if (this.checkLoc(TableInfo.players[0]) && this.checkLoc(TableInfo.players[1])) {
            this.lblDistance.string = "玩家距离: " + utils.getDistance(TableInfo.players[0].location, TableInfo.players[1].location);
        } else {
            this.lblDistance.string = "玩家距离: 未知";
        }

    },
    /**解散 */
    onQuickFinish() {
        Cache.playSfx();
        if (this.quickFinished) return;
        this.quickFinished = true;
        Cache.showConfirm('是否结束本局游戏？', () => {
            connector.gameMessage(ROUTE.CS_DISBAND, 'allow');
            this.quickFinished = false;

        }, () => {
            this.quickFinished = false;
        })
    },
    checkLoc(data) {
        return data.prop != null && data.location != null && data.location.lat != 0 && data.location.long != 0;
    },

    readyBtnStatus(bool) {
        this.birdReadyBtn.active = bool;
        this.normalReadyBtn.active = bool;
    },
    shuffleBtnStatus(bool) {
        this.shuffleBtn.active = bool;
        this.unShuffleBtn.active = bool;
    },

    changeBtn(boolean) {

        this.btnPlayCards.active = boolean;//&& !this.currentAutoStatus;
        this.btnTips.active = boolean;//&& !this.currentAutoStatus;

    },
    exitBtnStatus() {
        this.exitBtn.active = TableInfo.status == GameConfig.GameStatus.WAIT || TableInfo.status == GameConfig.GameStatus.DESTORY;

    }

});
