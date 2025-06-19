let PLAY_POS = [
    cc.v2(-502, -150),
    cc.v2(502, 130),
    cc.v2(-502, 130)
];   //nodePlayer 坐标
let SHOW_POS = [
    { begin: cc.v2(0, -40), end: cc.v2(-1, 123) },
    // { begin: cc.v2(446, 152), end: cc.v2(195, 132) },
    { begin: cc.v2(-446, 152), end: cc.v2(-195, 160) }
];

let POS_DEAL = [
    { begain: cc.v2(-2, 183) },
    { begain: cc.v2(67, 242) },
    { begain: cc.v2(-53, 242) },
];
const moduleClock = require("../../../GameBase/Module/ModuleClock")
const posClock = [
    cc.v2(-367, -93),
    cc.v2(367, 79),
    cc.v2(-367, 79)
    // cc.v2(-292, -29),
    // cc.v2(512, 63),
    // cc.v2(-508, 63)
];
const POS_IMG_QUEST = [
    cc.v2(-10, 86),
    // cc.v2(310, 158),
    cc.v2(-310, 158)
];

const POS_GET_CARD = [
    { begin: cc.v2(0, 174), end: cc.v2(-502, -253) },
    // { begin: cc.v2(0, 174), end: cc.v2(468, 190) },
    { begin: cc.v2(0, 174), end: cc.v2(-468, 190) }
];
const POS_SHOW_DECK = {
    begin: cc.v2(0, 300), end: cc.v2(0, 0)
};
const POS_SUMMARY_HANDS = { //小结算展示玩家手牌起始那张牌的坐标
    x: -82,
    y: -54
};
const RECT_SUMMARY_HANDS = {
    x: 29,
    y: 34
};
let FAN = {
    TH: 0x1,//天胡
    DH: 0x2,//地胡
    BH: 0x4,//红胡 13+
    YD: 0x8,//一点红
    HH: 0x10,//黑胡
    ZM: 0x20,//自摸
    WH: 0x40,//无胡
    XK: 0x80,//小卡
    DK: 0x100,//大卡
};
const CN_PERSON = ["", "一", "二", "三"];
let TableInfo = require("../../../Main/Script/TableInfo");//require('TableInfo');
let connector = require("../../../Main/NetWork/Connector"); //require('Connector');
let db = require("../../../Main/Script/DataBase");// require('DataBase');
let PACK = require("../../../Main/Script/PACK");//require('PACK');
let ROUTE = require("../../../Main/Script/ROUTE");//require('ROUTE');
let Cache = require("../../../Main/Script/Cache");//require('Cache ');
let tips = require('../Script/ModuleTips08');
let audioCtrl = require('audio-ctrl');
let Native = require('../../../Main/Script/native-extend');
let _social = Native.Social;
const utils = require("../../../Main/Script/utils");
const { GameConfig } = require("../../../GameBase/GameConfig");
const { App } = require("../../../script/ui/hall/data/App");
const STATUS = {
    /**等待其他玩家加入 */
    WAIT: "WAIT",
    CUTE: 1,
    /**选择倍率 */
    START: "START",
    /**游戏结束 */
    SUMMARY: "SUMMARY",
    DESTORY: 4,
    TIAN: 5,
    XIAN_TING: 6,
    ZHUANG_GANG: 7,
    ZHUANG_TING: 8,
    GANG: 9,
    HAIDI: 10,
    bao: 11,
    /**询问是否碰吃胡之类 */
    QUEST: "QUEST",//WAIT->START->(PLAY->QUEST)*n -> SUMMARY
    /**打牌 */
    PLAY: "PLAY"
};
const fileName = `local-0.amr`;

let customConfig = {
    yhz: true,
    piao: true,
    person: 3,
    clan: true,
    turn: 10
};

cc.Class({
    extends: require('GameBase'),

    properties: {
        // sendTime: null,
        nodeDeck: cc.Node,
        imgBet: [cc.Label],
        nodePiao: cc.Node,
        // bgSpriteFrame: [cc.SpriteFrame],
        sprHorn: [cc.Sprite],
        card: cc.Prefab,
        bg: cc.Node,   // table壁纸
        layoutQuest: cc.Node,
        _delayTime: 0,


        lblGameType: cc.Label,
        lblBase: cc.Label,
        lblNiao: cc.Label,
        lblTurn: cc.Label,
        lblRoomId: cc.Label,
        normalReadyBtn: cc.Node,
        birdReadyBtn: cc.Node,
        shuffleBtn: cc.Node,
        unShuffleBtn: cc.Node,
        lblDeck: cc.Label,
        player: cc.Prefab,
        layoutShowCard: cc.Layout,
        hands: cc.Node,
        btnQuest: [cc.Node],
        show: cc.Prefab,   //showCards里牌的prefab
        group: cc.Prefab,  //一组牌的Prefab
        nodeBtn: cc.Node,  //吃碰胡按钮的容器
        layoutGroup: cc.Layout,  //选择吃什么牌的layout
        btnGuo: cc.Sprite,
        nodeQuestImg: cc.Label, //吃碰跑胡等的图片节点
        preRoundSummary: cc.Prefab,  //小结算Prefab
        layoutSummaryHands: [cc.Layout],
        layoutShowChi: cc.Layout,

        layoutBi: cc.Layout,
        chiContent1: cc.Node,
        chiContent2: cc.Node,
        chiBox: cc.Prefab,

        nodeChi: cc.Node,
        btnOutCard: cc.Node,
        longCards: cc.Prefab, //长条牌
        startAutoBtn: cc.Node,//托管按钮
        cancelAutoBtn: cc.Node,//托管按钮
        exitBtn: cc.Node,
        autoMask: cc.Node,//遮罩

        //解散
        nodeTx: cc.Node,//遮罩

        lastAutoTime: 0,
        //听牌
        tingNode: cc.Node,
        tingContent: cc.Node,
        tingItem: cc.Prefab,
        tingBtn: cc.Node,
        bgNode: cc.Sprite,
        cutAnim: sp.SkeletonData,
        cutTips: cc.Node,
        readyData: null,
        gameFinish: true
    },

    // use this for initialization
    onLoad() {
        this.tingAnim = false;
        // let indexBg = utils.getValue(GameConfig.StorageKey.tableBgIndex, 0)
        // this.bgNode.spriteFrame = GameConfig.tableBgSprite[indexBg];
        this.readyData = {};
        //添加监听事件
        this.addEvents();
        this.nodeDeck.active = false;
        this.initChatContent();
        this.initGameBase();

        TableInfo.zhuang = -1;
        this.btnQuest.forEach(btn => {
            btn.zIndex = 22;
        });
        this.nodeQuestImg.node.zIndex = 5;
        this.nodeChi.zIndex = 21;
        this.layoutShowCard.node.zIndex = 20;
        this.contentShowChi = [];
        this.layoutQuest.zIndex = 20;
        this.alReady = false;
        this.btnQuest[0].type = 'chi';
        this.btnQuest[1].type = 'peng';
        this.btnQuest[2].type = 'hu';
        TableInfo.playerHead = [null, null, null];
        TableInfo.realIdx = [null, null, null];
        TableInfo.players = [null, null, null];
        this.hands = this.hands.getComponent('BaseHandZP');
        this.cardSortFinish = true;
        this.schedule(this.gameMsgSchedule, 0.1);
        connector.emit(PACK.CS_JOIN_DONE, {});
        connector.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.ENTER_SCENE, gamtype: "LDZP_SOLO" });
    },

    /**添加监听事件 */
    addEvents() {
        this.startAutoBtn.on(cc.Node.EventType.TOUCH_END, this.onStartAuto, this);
        this.cancelAutoBtn.on(cc.Node.EventType.TOUCH_END, this.onCancelAuto, this);
        this.exitBtn.on(cc.Node.EventType.TOUCH_END, this.onClickExit, this);

        App.EventManager.addEventListener(GameConfig.GameEventNames.LDZP_SHUFFLE_CARD, this.summaryHandleGame, this);

    },
    /**移除监听事件 */
    removeEvents() {
        this.startAutoBtn.off(cc.Node.EventType.TOUCH_END, this.onStartAuto, this);
        this.cancelAutoBtn.off(cc.Node.EventType.TOUCH_END, this.onCancelAuto, this);
        this.exitBtn.off(cc.Node.EventType.TOUCH_END, this.onClickExit, this);

        App.EventManager.removeEventListener(GameConfig.GameEventNames.LDZP_SHUFFLE_CARD, this.summaryHandleGame, this);

    },
    initChatContent() {

        this.node.on('chatAlready', () => {
            let windowNode = cc.find("Canvas");
            let data = {
                str: ['赢了钱请大家去满天红吃火锅', '不要走决战到天亮', '跟你们打牌真是太开心了', '手气不好建议你去趟台湾岛', '在哪个山沟沟里，信号这么差', '烦死了又胡低章',
                    '快点啊,头发都等白了', '跟你合作真是太愉快了', '你的牌打得也太好了', '别太算死了牌都不敢跟你打了', '看牛的孩子伤不起啊', '碰到个鬼又胡坐春'
                ],
                url: 'ChatImg/Game08',
                aniPos: [
                    cc.v2(120 / 2 - windowNode.width / 2 + GameConfig.FitScreen, -191 + 46),
                    // cc.v2(windowNode.width / 2 - 139 / 2 - GameConfig.FitScreen, 110),
                    cc.v2(120 / 2 - windowNode.width / 2 + GameConfig.FitScreen, 227 + 46),
                ],

                msgPos: [
                    cc.v2(139 / 2 - windowNode.width / 2 + GameConfig.FitScreen + 50, -220 + 83),
                    // cc.v2(windowNode.width / 2 - 139 / 2 - GameConfig.FitScreen - 50, 110 + 83),
                    cc.v2(139 / 2 - windowNode.width / 2 + GameConfig.FitScreen + 50, 227 + 50),
                ],
                facePos: [
                    cc.v2(120 / 2 - windowNode.width / 2 + GameConfig.FitScreen + 50, -191),
                    // cc.v2(windowNode.width / 2 - 239 - GameConfig.FitScreen, 110),
                    cc.v2(120 / 2 - windowNode.width / 2 + GameConfig.FitScreen + 50, 227),
                ],
                faceAnchor: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
            };
            this.chat.init(data);
        });
    },

    gameMsgSchedule(dt) {
        if (!this.cardSortFinish) return;
        if (this._delayTime > 0) {
            this._delayTime--;
            return;
        }
        if (connector._queueGameMsg.length <= 0)
            return;
        let msg = connector._queueGameMsg.shift();
        if (msg.route == ROUTE.SC_JOIN_TABLE || msg.route == ROUTE.SC_RECONNECT || msg.route == ROUTE.SC_GAME_DATA)
            this.alReady = true;
        if (!this.alReady)
            return;
        console.log(msg.route + ":  ", msg)
        switch (msg.route) {
            case ROUTE.SC_RECONNECT:
                this.reconnect(msg.data);
                break;
            case ROUTE.SC_GAME_DATA:
                this.reconnect(msg.data);
                break;
            //加入桌子
            case ROUTE.SC_JOIN_TABLE:
                msg.data.turn = 0;
                TableInfo.turn = 0;
                TableInfo.gameSummary = null;
                this.initTable(msg.data);
                break;
            //其他玩家加入
            case ROUTE.SC_JOIN_GAME:
                this.joinGame(msg.data);
                break;
            //玩家准备
            case ROUTE.SC_NEXT:
            case ROUTE.SC_GAME_READY:
                this.gameReady(msg.data);
                break;

            case ROUTE.SC_CHANGE_STATUS:
                this.changeStatus(msg.data);
                break;
            //所有玩家就绪 游戏开始 
            case ROUTE.SC_GAME_INIT:
                this.gameInit(msg.data);
                break;
            //显示牌
            case ROUTE.SC_SHOW_CARD:
                this.showCard(msg.data);
                break;
            //同步手牌
            case ROUTE.SC_SYNC_HANDS:
                this.syncCard(msg.data)
                break;
            //出牌
            case ROUTE.SC_PLAY_CARD:
                this.playCard(msg.data);
                break;

            case ROUTE.SC_PASS_CARD:
                cc.log(msg.data);
                this.passCard(msg.data);
                break;
            //询问别人要牌
            case ROUTE.SC_QUEST:
                this.showQuest(msg.data);
                break;

            case ROUTE.SC_GAME_VOTE:
                break;
            //玩家离开
            case ROUTE.SC_PLAYER_LEAVE:
                this.leavePlayer(msg.data);
                break;

            case ROUTE.SC_ACTION:
                this.action(msg.data);
                break;

            case ROUTE.SC_ROUND_SUMMARY:
                this.roundSummary(msg.data);
                break;
            case ROUTE.SC_GET_CARD:
                this.newGetCard(msg.data);
                break;
            case ROUTE.SC_GAME_CHAT:
                this.chat.contentFly(msg.data);
                break;
            case ROUTE.SC_SYSTEM_NOTICE:
                this.chat.systemNotice(msg.data);
                break;
            case 'SC_DEAD':
                this.dead(msg.data);
                break;
            //选漂
            case ROUTE.SC_PIAO:
                if (TableInfo.config.person == 2) {
                    this.showClock([0, 1], TableInfo.options.clock)
                } else {
                    this.showClock([0, 1, 2], TableInfo.options.clock)
                }
                this.hideBet();

                this.showPiao();
                break;
            //玩家已选择好倍率
            case ROUTE.SC_BET:
                this.hideClock(msg.data.idx);

                this.showBet(msg.data);
                break;
            case ROUTE.SC_GAME_DRAW:
                // this.gameDraw();
                break;
            case ROUTE.SC_REFRESH_CARD:
                db.player.card = msg.data.card;
                break;

            case ROUTE.SC_CANCEL_AUTO:
                this.cancelAuto(msg.data);
                break;
            case ROUTE.SC_START_AUTO:
                this.startAuto(msg.data);
                break
            case ROUTE.SC_DISBAND:
                this.nodeTx.getComponent("ModuleTouxiang08").txInit(msg.data);
                break;
            case ROUTE.SC_TOAST:
                if (!utils.isNullOrEmpty(msg.data.message))
                    Cache.alertTip(msg.data.message);
                break;
            case ROUTE.SC_GAME_DESTORY:
                this.destoryGame()
                break;
            default:
                cc.log(msg.route);
        }
    },
    destoryGame() {
        connector._queueGameMsg = [];
        connector._queueChatMsg = [];
        connector.disconnect();
    },
    /**初始化 */
    initTable(data) {
        //player位置
        let windowNode = cc.find("Canvas")

        let palyerPos = [
            cc.v2(120 / 2 - windowNode.width / 2 + GameConfig.FitScreen, -191),
            // cc.v2(windowNode.width / 2 - 139 / 2 - GameConfig.FitScreen, 110),
            cc.v2(120 / 2 - windowNode.width / 2 + GameConfig.FitScreen, 227),
        ]

        TableInfo.zhuang = data.banker;
        TableInfo.status = data.status;
        TableInfo.options = data.options;
        //显示离开按钮
        this.exitBtnStatus();
        //当前玩家idx
        let idx = data.idx;
        TableInfo.idx = data.idx;
        //规则
        TableInfo.config = customConfig;



        //显示游戏 类型 公会
        this.lblGameType.string = GameConfig.GameName[data.options.gameType];

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

        //玩家显示位置
        TableInfo.realIdx = this.realIdx;

        //建立玩家数据数组
        if (!utils.isNullOrEmpty(this.players)) {
            this.players.forEach((player) => {
                player.removePlayer();
            })
        }
        this.players = new Array(TableInfo.options.person);
        //生成玩家信息
        for (let i = 0; i < TableInfo.options.person; i++) {
            let nodePlayer = cc.instantiate(this.player);
            nodePlayer.parent = this.bg;
            //设置玩家位置
            // nodePlayer.position = PLAY_POS[i];
            nodePlayer.position = palyerPos[i];
            nodePlayer.zIndex = 1;
            this.players[i] = nodePlayer.getComponent('ModulePlayer08');

        }

        //初始化玩家数据
        this.playerInit(data.players);
        //初始化房间基本信息
        this.initTableMsg(data);
    },
    /**初始化玩家显示信息 */
    playerInit(data) {
        data.forEach((player, i) => {
            if (player == null)
                return;
            let idx = TableInfo.realIdx[player.idx];
            this.players[idx].init(player);
            //TODO:重写准备按钮显示
            if (player.idx == TableInfo.idx && TableInfo.status == GameConfig.GameStatus.WAIT) {
                this.readyBtnStatus(!player.ready);
            }
        })
    },
    /**初始化桌子信息 */
    initTableMsg(data) {
        this.lblBase.string = "底分: " + utils.formatGold(data.options.base);
        this.lblNiao.string = "打鸟: " + utils.formatGold(data.options.bird);
        this.lblTurn.string = data.turn == 0 ? "" : data.turn + '局';// + TableInfo.config.turn;
        this.lblRoomId.string = '房间号: ' + data.tableID;
        this.lblDeck.string = '';
    },
    /**荒庄 */
    gameDraw() {
        this._delayTime = 15;
        this.nodeQuestImg.node.position = POS_IMG_QUEST[0];
        //TODO
        // this.nodeQuestImg.string = '黄庄';
        this.nodeQuestImg.node.active = true;
        this.nodeQuestImg.node.opacity = 255;
        this.nodeQuestImg.node.scale = 2.5;
        this.nodeQuestImg.node.runAction(cc.sequence(
            cc.callFunc(() => {
                this.nodeQuestImg.node.opacity = 255;
            }),
            cc.place(POS_IMG_QUEST[0]),
            cc.scaleTo(0.3, 1),
            cc.delayTime(0.5),
            cc.fadeOut(0.3)
        ));
    },

    showBet(data) {

        let str = ['不飘', '飘一', '飘二', '飘三'];
        if (data.piao == -1)
            return;
        if (TableInfo.idx == data.idx)
            this.nodePiao.active = false;
        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].showBet(str[data.piao]);
    },

    hideBet() {
        this.players.forEach(player => {
            player.hideBet();
        })
    },

    showPiao() {

        TableInfo.status = GameConfig.GameStatus.START;
        this.exitBtnStatus();

        this.tingNode.active = false;
        this.tingBtn.active = false;


        this.hands.node.destroyAllChildren();
        this.nodePiao.active = true;
        this.players.forEach((player, i) => {
            player.roundReset();
        });

        this.layoutSummaryHands.forEach(layout => {
            layout.node.removeAllChildren();
        });
    },

    btnPiaoCallBack(event, data) {
        this.nodePiao.active = false;
        switch (data) {
            case '0':
                connector.gameMessage(ROUTE.CS_PIAO, { piao: 0 });
                break;
            case '1':
                connector.gameMessage(ROUTE.CS_PIAO, { piao: 1 });
                break;
            case '2':
                connector.gameMessage(ROUTE.CS_PIAO, { piao: 2 });
                break;
            case '3':
                connector.gameMessage(ROUTE.CS_PIAO, { piao: 3 });
                break;
        }
    },

    dead(data) {
        this.players.forEach((player, i) => {
            let idx = TableInfo.realIdx[data.idx];
            if (idx == i)
                player.setQiHu(true);
        })
    },


    roundSummary(data) {
        // nodeQuestImg
        //移除倒计时
        this.hideClock();

        //TODO 碰吃按钮隐藏
        this.nodeChi.node = false;
        this.nodeBtn.active = false;

        this.nodeTx.active = false;

        this.hands.node.active = false;
        this.tingNode.active = false;
        this.tingBtn.active = false;
        TableInfo.currentPlayer = null;


        // TableInfo.status = data.finish ? GameConfig.GameStatus.SUMMARY : GameConfig.GameStatus.CHAPTER;
        TableInfo.status = data.status;
        this.exitBtnStatus();

        this.nodeDeck.runAction(cc.moveTo(0.5, cc.v2(0, 30)).easing(cc.easeBackInOut()));

        let nodeRoundSummary = cc.instantiate(this.preRoundSummary);
        nodeRoundSummary.zIndex = 15;
        nodeRoundSummary.getComponent('ModuleRoundSummary08').init(data);
        this.node.addChild(nodeRoundSummary, 2, 'roundSummary');
        data.players.forEach((player, i) => {
            let idx = TableInfo.realIdx[player.idx];
            this.players[idx].totalHuxiLabel.string = utils.isNullOrEmpty(data.ach) ? player.scores.turn : '0';//data.finish ? "0" : "" + player.scores.turn;
            this.players[idx].activeAutoPlay(false);
            this.players[idx].setQiHu(false);

            if (player.wallet)
                this.players[idx].setScore(player.wallet);
        });
        // 隐藏托管状态
        // this.onCancelAuto();

        this.readyData = {};
        if (utils.isNullOrEmpty(data.ach)) { //小局结算
            this.shuffleBtnStatus(true);
        } else {//大局结算
            this.readyBtnStatus(true);
        }

        if (!data.finish)
            this.cancelAuto({ idx: TableInfo.idx })
        this.initSummaryHands(data);
    },

    initSummaryHands(data) {
        this.layoutSummaryHands.forEach(layout => {
            layout.node.removeAllChildren();
        });
        data.players.forEach(player => {
            let idx = TableInfo.realIdx[player.idx];
            if (idx != 0) {
                let tempHands = this.hands.makeHands(player.hands);
                let _hands = [[], [], [], [], [], [], [], [], [], [], [], []];
                let baseIdx = 6 - Math.floor(tempHands.length / 2);
                if (baseIdx > 0)
                    baseIdx--;
                tempHands.forEach((cards, x) => {
                    cards.forEach((card, y) => {
                        let sprCard = cc.instantiate(this.card);
                        sprCard.scale = 0.3;
                        sprCard.parent = this.layoutSummaryHands[idx].node;
                        sprCard.getComponent('BaseCardZP').init(card);
                        sprCard._pos = { x: baseIdx, y: y };
                        sprCard.setPosition(
                            POS_SUMMARY_HANDS.x + sprCard._pos.x * RECT_SUMMARY_HANDS.x,
                            POS_SUMMARY_HANDS.y + sprCard._pos.y * RECT_SUMMARY_HANDS.y
                        );
                        _hands[baseIdx].push(sprCard);
                    });
                    baseIdx++;
                });
                //this.sortHands();
            }

        })
    },

    gameReady(data) {
        let idx = TableInfo.realIdx[data.idx];
        if (idx == 0) {
            this.readyBtnStatus(false);
            this.shuffleBtnStatus(false);

        }
        this.players[idx].showReady(data);
        //清除上局数据
        if (data.idx == TableInfo.idx) {
            this.layoutSummaryHands.forEach(layout => {
                layout.node.removeAllChildren();
            });

            //重置所有玩家信息
            this.players.forEach(player => {
                player.roundReset(1);
            });
        }
    },

    joinGame(data) {
        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].init(data);
    },

    passCard(data) {
        this.hideClock();
        //TODO 碰吃按钮隐藏
        this.nodeChi.node = false;
        this.nodeBtn.active = false;
        this._delayTime = 6;
        let idx = TableInfo.realIdx[data.idx];
        let info = {
            offline: false
        };
        this.players[idx].changeStatus(info);
        // let card = cc.instantiate(this.show);
        // card.getComponent('BaseCardZP').init(data.card,true);
        // card.parent = this.node;
        // card.position = SHOW_POS[idx].end;
        let qi = this.players[idx].newQi(data.card, false);
        let pos = this.players[idx].qi.position.add(qi)
        let endPos = this.players[idx].nodePlayer.position.add(pos);
        // this.layoutShowCard.node.removeAllChildren();
        this.currentCard.runAction(cc.sequence(
            cc.place(SHOW_POS[idx].end),
            cc.delayTime(0.3),
            cc.spawn(
                cc.moveTo(0.2, endPos),
                cc.scaleTo(0.2, 0.2)
            ),
            cc.callFunc(() => {
                qi.active = true;
            }),
            cc.callFunc(() => {
                this.currentCard.destroy();
            })
        ))
    },

    btnGuoCallBack() {
        connector.gameMessage(ROUTE.CS_ANSWER, { serialID: TableInfo.serialID, answer: -1, card: this.questCard });
        this.layoutQuest.active = false;
    },

    changeStatus(data) {

        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].changeStatus(data);
    },

    getCard(data) {
        this._delayTime = 25;
        let seq0 = [];
        let seq = this.deal(data);
        let seq1 = [];
        let showCard = null;
        let showCardPos = null;
        let showCardX = null;
        let showCardY = null;
        let insert = false;
        this.hands._hands.forEach((group, x) => {
            group.forEach((card, y) => {
                if (showCard == null && card._card == data.card && data.idx == TableInfo.idx) {
                    insert = group.length == 1;
                    showCardX = x;
                    showCardY = y;
                    showCardPos = card.position;
                    card.destroy();
                    this.hands._hands[x].splice(y, 1);
                    this.hands.sortHands();
                    showCard = data.card;
                }
            })
        });
        this.hands._hands.forEach((group, x) => {
            if (group.length > 0) {
                group.forEach((card, y) => {
                    seq1.push(cc.targetedAction(card, cc.sequence(
                        cc.delayTime(x / 10),
                        cc.callFunc(() => {
                            card.opacity = 255;
                        }),
                    )))
                })
            }
        });
        seq.push(cc.spawn(seq1));
        seq0.push(cc.spawn(seq));
        let sex = TableInfo.players[data.idx].prop.sex; //== 1 ? 'male' : 'famale';
        let audio = data.card + '.mp3';
        //let url = cc.url.raw(`Audio/Game08/${sex}_${audio}`);
        this.lblDeck.string = "" + data.deck + "";;
        TableInfo.currentCard = data.card;
        let idx = TableInfo.realIdx[data.idx];
        this.layoutShowCard.node.stopAllActions();
        this.layoutShowCard.node.removeAllChildren();
        let node = cc.instantiate(this.show);
        node.parent = this.layoutShowCard.node;
        node.position = POS_GET_CARD[idx].begin;
        node.opacity = 0;
        node.getComponent('BaseCardZP').init(data.card);
        seq0.push(cc.targetedAction(node, cc.sequence(
            cc.callFunc(() => {
                // if (GameConfig.CurrentGameType.indexOf(GameConfig.GameType.LDZP) != -1) {
                //     this.playManageAudio(`${sex}_p_${audio}`);
                // } else {
                this.playManageAudio(`${sex}_${audio}`);
                // }
                //audioCtrl.getInstance().playSFX(url);
            }),
            cc.fadeIn(0.2),
            cc.delayTime(0.5),
            cc.spawn(
                cc.moveTo(0.2, data.idx == TableInfo.idx ? this.hands.node.position.add(showCardPos) : POS_GET_CARD[idx].end),
                cc.scaleTo(0.2, 1)
            ),
            cc.callFunc(() => {
                if (data.idx == TableInfo.idx) {
                    let nodeGet = cc.instantiate(this.card);
                    nodeGet.parent = this.hands.node;
                    nodeGet._card = data.card;
                    nodeGet.scale = 0.8;
                    nodeGet._pos = { x: showCardX, y: showCardY };
                    nodeGet.getComponent('BaseCardZP').init(data.card);
                    if (insert) {
                        this.hands._hands.splice(showCardX + 1, 0, [nodeGet]);
                    } else
                        this.hands._hands[showCardX].splice(showCardY, 0, nodeGet);
                    this.hands._hands[showCardX].forEach(card => {
                        if (card.pao && nodeGet._card == card._card)
                            nodeGet.pao = true;

                    });
                    this.hands.sortHands();
                }
            }),
            cc.callFunc(() => {
                node.destroy();
            })
        )));
        this.node.runAction(cc.sequence(seq0));

    },
    //TODO
    newGetCard(data) {
        let seq = [];
        let seq0 = [];
        this._delayTime = 6; //时间由动作决定
        let nodeCard;
        if (data.idx == TableInfo.idx) {
            nodeCard = cc.instantiate(this.show);
            nodeCard.getComponent('BaseCardZP').init(data.card, true);
            nodeCard.parent = this.node;
            nodeCard.position = POS_GET_CARD[0].begin;
            let base = 0;
            let pao = 0;
            let arr = [];
            this.hands._hands.forEach((group, x) => {
                if (group.length > 0)
                    base++;
                group.forEach((card, y) => {
                    if (card._card == data.card) {
                        pao++;
                        arr.push(card);
                    }
                })
            });
            //可能有Bug
            let arrCards = [];
            let nodeHand0 = null;
            if (pao == 2) {
                for (let i = 0; i < 3; i++) {
                    let nodeHand = cc.instantiate(this.card);
                    nodeHand.scale = 0.8;
                    nodeHand.parent = this.hands.node;
                    nodeHand.pao = true;
                    nodeHand._pos = { x: 0, y: i };
                    nodeHand._card = data.card;
                    nodeHand.active = false;
                    nodeHand.getComponent('BaseCardZP').init(data.card, false, true);
                    //this.hands._hands.splice(base+1,0,[nodeGet]);

                    arrCards.push(nodeHand);
                }
                while (arr.length > 0) {
                    let node = arr.shift();
                    this.hands._hands[node._pos.x].splice(node._pos.y, 1);
                    this.hands.sortHands();
                    seq0.push(cc.targetedAction(node, cc.callFunc(() => {
                        node.destroy()
                    }
                    )));
                    cc.log('222222222222', seq0);
                }
                this.hands._hands.splice(0, 0, arrCards);

            } else {
                nodeHand0 = cc.instantiate(this.card);
                nodeHand0.scale = 0.8;
                nodeHand0.parent = this.hands.node;
                nodeHand0.getComponent('BaseCardZP').init(data.card);
                nodeHand0._card = data.card;
                nodeHand0.pao = false;
                nodeHand0.active = false;
                this.hands._hands[12].splice(0, 0, nodeHand0);
            }
            seq.push(cc.targetedAction(nodeCard, cc.sequence(
                cc.delayTime(0.3),
                cc.moveTo(0.3, SHOW_POS[0].begin),
                cc.callFunc(() => {
                    nodeCard.destroy();
                })
            )));
            if (seq0.length > 0)
                seq.push(cc.spawn(seq0));
            seq.push(cc.callFunc(() => {
                arrCards.forEach(card => {
                    card.active = true;
                })
            }));
            seq.push(cc.callFunc(() => {
                this.hands.sortHands();
            }));
            if (nodeHand0 != null) {
                seq.push(cc.callFunc(() => {
                    nodeHand0.active = true;
                }))
            }
            //seq.push(cc.delayTime(0.5)); //TEST
            this.node.runAction(cc.sequence(seq));
            cc.log(this.hands._hands[7]);
        } else {
            let idx0 = TableInfo.realIdx[data.idx];
            let nodeCard0;
            nodeCard0 = cc.instantiate(this.show);
            nodeCard0.getComponent('BaseCardZP').init(data.card, true);
            nodeCard0.parent = this.node;
            //nodeCard.scale =
            nodeCard0.position = POS_GET_CARD[idx0].begin;
            nodeCard0.runAction(cc.sequence(
                cc.delayTime(0.3),
                cc.moveTo(0.3, POS_GET_CARD[idx0].end),
                cc.delayTime(0.3),
                cc.callFunc(() => {
                    nodeCard0.destroy();
                })
            ))
        }

    },

    qihu() {
        Cache.showConfirm('是否弃胡？', () => {
            connector.gameMessage(ROUTE.CS_PLAY_CARD, -1);
            this.btnQihu.active = false;
        })
    },

    /** 
     * 所有玩家就绪 游戏开始 初始化游戏数据
     *   hands---玩家手牌  index---0--小一  value----2---2张
     *     turn----局数
     * */
    gameInit(data) {
        if (this.node.getChildByName("roundSummary")) {
            this.node.getChildByName("roundSummary").removeFromParent();
        }
        this.nodeTx.active = false;
        //牌垛显示
        this.nodeDeck.active = true;
        //当前牌垛剩余牌数
        this.lblDeck.string = '19';

        TableInfo.zhuang = data.banker;
        //TODO:修改当前游戏状态
        TableInfo.status = GameConfig.GameStatus.START;
        this.exitBtnStatus();

        //设置当前出牌玩家为null
        TableInfo.currentPlayer = null;
        //煨牌数组归零
        TableInfo.zhao = [];

        this.layoutSummaryHands.forEach(layout => {
            layout.node.removeAllChildren();
        });

        //更改当前局数显示        
        this.lblTurn.string = "" + (data.turn == 0 ? 1 : data.turn) + "局";
        TableInfo.turn = data.turn;

        //重置所有玩家信息
        this.players.forEach(player => {
            player.roundReset();
        });


        if (data.shuffle) {
            this.cutCount = 0;
            this.cutIdx = [];
            this.shuffleData = data;
            data.shuffle.forEach((e) => {
                if (e.shuffle) {
                    this.cutCount++;
                    this.cutIdx.push(e.idx)
                }

                let idx = TableInfo.realIdx[e.idx];
                // this.players[idx].lblscore.string = '' + e.wallet;
            })
            this.handleShuffle();

        } else {
            //设置当前玩家手牌  false--不是重连
            this.hands.init(data.hands, false);
            // debugger
            //执行发牌动画
            this.cardSortFinish = false;

            this.deal();
        }
        //let seq = this.node.runAction(cc.spawn(seq));
        // this.hands.sortHands();
        //检查听牌

        this.checkTing();

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
            //设置当前玩家手牌  false--不是重连
            this.hands.init(this.shuffleData.hands, false);
            //执行发牌动画
            this.cardSortFinish = false;
            this.deal();
        }
    },
    /**重连 */
    reconnect(data) {


        this.initTable(data);

        if (data.disband) {
            this.nodeTx.getComponent("ModuleTouxiang08").txInit(data.disband);
        }
        switch (data.status) {
            case GameConfig.GameStatus.WAIT:
                this.nodeDeck.position = cc.v2(0, 30);

                break;
            case GameConfig.GameStatus.START:
                this.shuffleBtnStatus(false);
                this.readyBtnStatus(false);
                data.players.forEach(player => {
                    if (player == null)
                        return;
                    if (TableInfo.config.piao) {

                        let inform = {
                            idx: player.idx,
                            piao: player.piao
                        };
                        this.showBet(inform);
                    }
                    if (player.idx == TableInfo.idx && player.piao == -1) {
                        this.showPiao();
                        this.showClock([player.idx], player.clock)
                    }
                })

                this.nodeDeck.position = cc.v2(0, 30);
                break;
            case GameConfig.GameStatus.PLAY:// STATUS.PLAY:
            case GameConfig.GameStatus.QUEST:
                this.nodeDeck.position = cc.v2(0, 270);
                this.nodeDeck.active = true;
                this.readyBtnStatus(false);
                this.shuffleBtnStatus(false);

                TableInfo.turn = data.turn;
                this.btnOutCard.active = data.currentIDX == TableInfo.idx;
                this.hands.node.active = true;
                TableInfo.zhao = [];
                this.hands.init(data.hands, true);
                this.lblDeck.string = "" + data.decks + "";
                data.players.forEach(player => {
                    if (player == null)
                        return;
                    let idx = TableInfo.realIdx[player.idx];
                    // this.players[idx].init(player);
                    this.players[idx].hideReady();
                    this.players[idx].refreshHuxi();
                    this.players[idx].activeAutoPlay(player.auto, idx);
                    if (TableInfo.idx == player.idx)
                        this.changeAutoBtn(player.auto, 1)
                });
                if (data.currentCard)
                    TableInfo.currentCard = data.currentCard.card;
                if (data.currentCard != null && data.currentCard.active != false) {
                    this.showCard(data.currentCard);
                } else {
                    this.checkTing();
                }
                if (data.currentIDX != null) {
                    TableInfo.currentPlayer = data.currentIDX;
                    let msg = {
                        idx: data.currentIDX
                    };
                    this.players.forEach((player) => {
                        player.active(msg);
                    })
                }
                if (!utils.isNullOrEmpty(data.quest)) {
                    data.quest.clock = data.clock;
                    this.showQuest(data.quest);
                }

                break;
            case GameConfig.GameStatus.SUMMARY:

            case GameConfig.GameStatus.CHAPTER:
                this.nodeDeck.position = cc.v2(0, 30);
                this.readyBtnStatus(false)
                data.players.forEach(player => {
                    if (player.idx == TableInfo.idx && !player.ready) {
                        this.shuffleBtnStatus(true);
                    }
                })
                break;
        }


    },


    leavePlayer(data) {
        // if (TableInfo.realIdx[data.idx] == 0 ) {
        this.node.removeAllChildren();
        connector.disconnect();
        // return;
        // }
        // let idx = TableInfo.realIdx[data.idx];
        // this.players[idx].reset(data);
    },


    //TODO 发牌没加
    deal(data) {

        this._delayTime = 10;
        let url = cc.url.raw('resources/Audio/Common/deal.mp3');
        let seq = [];
        let seq1 = [];
        let spawn = [];
        let rotatle = [0, -90, -90];
        let moveByX = [0, 250, -250];
        let moveByY = [-150, 0, 0];
        // 发牌动画
        // let cardNodePool = new cc.NodePool("cardNode");
        // cardNodePool.
        for (let i = 0; i < 5; i++) {
            // let cardNode = cardNodePool.get();
            // if (utils.isNullOrEmpty(cardNode))
            let cardNode = cc.instantiate(this.longCards);
            cardNode.parent = this.nodeDeck;
            cardNode.position = cc.v2(0, 6);
            let ap = cc.delayTime(0.1 * i);
            let bp = cc.moveBy(0.4, cc.v2(0, 100));
            // let ba = cc.scaleTo(0.2, 3)
            let cp = cc.fadeOut(0.4);
            let dp = cc.spawn(bp, cp);
            // let ep=cc.sequence(ap,dp);
            let ep = cc.callFunc(() => {
                cardNode.destroy();
            })
            let fp = cc.sequence(ap, gp, dp, ep);
            let gp = cc.callFunc(() => {
                audioCtrl.getInstance().playSFX(url);
            })
            // cardNode.runAction(fp)
            seq.push(cc.targetedAction(cardNode, fp))
        }
        this.nodeDeck.runAction(cc.sequence(cc.spawn(seq), cc.moveTo(0.5, cc.v2(0, 270))));
        try {


            this.hands._hands.forEach((group, x) => {
                if (group.length > 0 && group.length != 4) {
                    group.forEach((card, y) => {
                        let oldPosX = card.x;
                        seq1.push(cc.targetedAction(card, cc.sequence(
                            cc.callFunc(() => {
                                card.x = -30;
                                card.opacity = 255;
                            }),
                            cc.moveTo(0.7, cc.v2(oldPosX, card.y)).easing(cc.easeBackInOut())
                        )))
                    })
                }
            });
            this.node.runAction(cc.sequence(cc.callFunc(() => {
                //手牌节点显示 
                this.hands.node.active = true;
            }), cc.spawn(seq1), cc.callFunc(() => {
                this.hands.sortHands();
                this.cardSortFinish = true;
            })));
        } catch (error) {
            _social.reportError(error);

            this.hands.sortHands()
            this.cardSortFinish = true;

        }

        // return seq1;
    },

    //重跑
    checkCP(data) {
        let idx = TableInfo.realIdx[data.idx];
        let chongpao = 0;
        this.players[idx].ground.content.forEach(a => {
            if (a.type == 'pao' || a.type == 'ti') {
                chongpao++;
            }
        });
        cc.log('chongpao', chongpao);
        if (chongpao > 0 && (data.type == 'pao' || data.type == 'ti')) {
            cc.log('1111');
            this._delayTime = 10;
        }
    },

    action(data) {
        this.hideClock();
        // {idx: 2, auto: true, type: "pao", card: 8, xi: 6}
        //修改托管状态
        this.changeAutoState(data)
        if ((data.type == 'pao' && data.src == 'DECK') ||
            (data.type == 'ti' && data.src == 'GROUND') ||
            (data.type == 'pao' && data.src == 'GROUND')
            || (data.type == 'pao' && data.src == 'HANDS')) {
            this._delayTime = 8;
        }
        // cc.log('action++++++++++++',data);
        let piao = false;
        this._delayTime = (data.idx == TableInfo.idx && data.type != 'hu') ? 2 : 5;
        if (data.type == 'hu')
            this._delayTime = 15;
        this.layoutQuest.active = false;
        let idx = TableInfo.realIdx[data.idx];
        if (data.type == 'ti' && data.src == 'HANDS') {
        } else {
            this.layoutShowCard.node.removeAllChildren();
        }
        this.checkCP(data);
        this.nodeQuestImg.node.position = POS_IMG_QUEST[idx];
        this.nodeQuestImg.node.active = true;
        this.nodeQuestImg.node.opacity = 0;
        switch (data.type) {
            case 'chi':
                this.nodeQuestImg.string = '吃';
                break;
            case 'peng':
                this.nodeQuestImg.string = '碰';
                break;
            case 'wei':
                this.nodeQuestImg.string = '偎';
                break;
            case 'ti':
                this.nodeQuestImg.string = '提';
                break;
            case 'pao':
                this.nodeQuestImg.string = '跑';
                break;
            case 'bi':
                break;
            case 'hu':
                this.players.forEach(p => {
                    p.active(data);
                });
                //TableInfo.huCards = data.cards;
                // cc.log(TableInfo.huCards);
                if ((data.hu & FAN.ZM) > 0) {
                    this.nodeQuestImg.string = '胡';
                } else {
                    this.nodeQuestImg.string = '胡';
                }
                break;
            default:
                cc.log(data.type);
        }
        if (data.idx == TableInfo.idx) {
            switch (data.type) {
                case 'chi':
                    this.nodeQuestImg.string = '吃';
                    data.cards.forEach((card, i) => {
                        if (i != 0)
                            this.hands.removeHands(card);
                    });
                    break;
                case 'peng':
                    this.nodeQuestImg.string = '碰';
                    this.hands.removeHands(data.card);
                    this.hands.removeHands(data.card);
                    break;
                case 'wei':
                    this.nodeQuestImg.string = '偎';
                    this.hands.removeHands(data.card);
                    this.hands.removeHands(data.card);
                    break;
                case 'ti':
                    this.nodeQuestImg.string = '提';
                    this.hands.removeHands(data.card);
                    this.hands.removeHands(data.card);
                    this.hands.removeHands(data.card);
                    this.hands.removeHands(data.card);
                    break;
                case 'pao':
                    this.nodeQuestImg.string = '跑';
                    this.hands.removeHands(data.card);
                    this.hands.removeHands(data.card);
                    this.hands.removeHands(data.card);
                    break;
                case 'bi':
                    data.cards.forEach((card, i) => {
                        this.hands.removeHands(card);
                    });
                    break;
                case 'hu':
                    //this._delayTime = 9;
                    break;
                default:
                    cc.log(data.type);
            }
            this.hands.sortHands();
        }
        // if(data.type == 'bi'){
        //     this.players[idx].newGroup(data,true);
        //     return;
        // } // deck,ground,play
        let seq = [];
        let kaizhao = false;
        let fangjiao = false;
        let qing = false;
        if ((data.type == 'pao' && data.src == 'DECK') ||
            (data.type == 'ti' && data.src == 'GROUND') ||
            (data.type == 'pao' && data.src == 'GROUND') ||
            (data.type == 'pao' && data.src == 'HANDS')) {
            cc.log('welcome to the 绝对领域');
            //this._delayTime = 10;
            this.players[idx].ground.content.forEach((detail, i) => {
                // cc.log('detail',detail);
                if (data.card == detail.cardValue && (detail.type == 'peng' || detail.type == 'wei')) {
                    detail.remove();
                    //kaizhao = (detail.type == 'peng' && data.src == 'DECK');
                    fangjiao = (detail.type == 'wei' && data.src == 'HANDS'); //自己偎，别人打
                    qing = (data.type == 'ti' && data.src == 'GROUND');  //自己偎，自己摸出来
                    this.players[idx].ground.content.splice(i, 1);
                    this.players[idx].ground.length--;
                    // cc.log(this.players[idx]);
                    this.players[idx].resetGroupPos();
                }
            })
        }
        let seq0 = this.players[idx].newGroup(data, false);
        //胡牌动画
        this.nodeQuestImg.node.scale = 4;
        seq.push(cc.targetedAction(this.nodeQuestImg.node, cc.sequence(
            cc.place(POS_IMG_QUEST[idx]),
            cc.spawn(
                cc.fadeIn(0.2),
                cc.scaleTo(0.2, 1)
            ),
            cc.scaleTo(0.2, 2),
            cc.fadeOut(0.3),
        )));
        seq.push(seq0[0]);
        this.node.runAction(cc.spawn(seq));
        // if(data.type == 'ti')
        //      this.refreshScore(data);
        this.playAudio(data, kaizhao, fangjiao, qing);

        //检查听牌
        if (data.type != 'hu')
            this.checkTing();

    },

    playAudio(data, kaizhao, fangjiao, qing) {
        let idx = TableInfo.realIdx[data.idx];
        let type = data.type;
        let sex = TableInfo.players[data.idx].prop.sex;//== 1 ? 'male' : 'famale';
        if (type == 'pao' && data.src == 'PLAY') {
            type = 'kaijiao';
        }
        if (kaizhao) {
            type = 'pao';
        }
        if (fangjiao) {
            type = 'fangjiao';
        }
        if (qing) {
            type = 'ti';
        }
        let chongpao = 0;
        this.players[idx].ground.content.forEach(a => {
            if (a.type == 'pao' || a.type == 'ti') {
                chongpao++;
            }
        });
        if (chongpao > 1 && data.type == 'pao') {
            type = 'chongpao';
        }
        if (data.type == 'ti' && data.src == 'HANDS')
            type = 'long';
        if ((data.hu & FAN.ZM) > 0) {
            type = 'zimo';
        }
        let audio = type + '.mp3';
        // if (GameConfig.CurrentGameType.indexOf(GameConfig.GameType.LDZP) != -1) {
        //     this.playManageAudio(`${sex}_p_${audio}`);
        // } else {
        this.playManageAudio(`${sex}_${audio}`);
        // }
        // let url = cc.url.raw(`resources/Audio/Game08/${sex}_${audio}`);
        // audioCtrl.getInstance().playSFX(url);
    },
    /**显示出牌 */
    showCard(data) {

        this.showClock([data.idx], data.clock);

        //改变托管状态
        // if (data.src == "PLAY")
        this.changeAutoState(data);

        if (data.idx == TableInfo.idx) this.checkTing(data.card);

        let idx = TableInfo.realIdx[data.idx];
        this._delayTime = 2;
        this.players.forEach(player => {
            player.active(data);
        });
        let blin = data.src == 'DECK';
        //TODO:data.offline data.active 服务器字段统一
        if (data.src == 'PLAY') {
            data.offline = false;
            this.players[idx].changeStatus(data.offline);
        }
        this.btnOutCard.active = false;
        TableInfo.currentPlayer = null;
        let sex = TableInfo.players[data.idx].prop.sex;//== 1 ? 'male' : 'famale';
        let audio = data.card + '.mp3';
        // if (GameConfig.CurrentGameType.indexOf(GameConfig.GameType.LDZP) != -1) {
        //     this.playManageAudio(`${sex}_p_${audio}`);
        // } else {
        this.playManageAudio(`${sex}_${audio}`);
        // }
        // let url = cc.url.raw(`resources/Audio/Game08/${sex}_${audio}`);
        // audioCtrl.getInstance().playSFX(url);
        TableInfo.currentCard = data.card;
        this.layoutShowCard.node.stopAllActions();
        this.layoutShowCard.node.removeAllChildren();
        let node = cc.instantiate(this.show);
        node.zIndex = 21;
        node.parent = this.layoutShowCard.node;
        node.position = (data.src == 'DECK' ? POS_SHOW_DECK.begin : SHOW_POS[idx].begin);
        node.getComponent('BaseCardZP').init(data.card, true, false, blin);
        node.position = SHOW_POS[idx].end;
        node.runAction(
            cc.sequence(
                cc.scaleTo(0.1, 1.3),
                cc.scaleTo(0.1, 1.1)
            )
        );
        this.currentCard = node;
        if (!utils.isNullOrEmpty(data.deck))
            this.lblDeck.string = "" + data.deck + "";
    },

    playCard(data) {
        //显示倒计时


        if (typeof data.hands == Number && this.hands.node.childrenCount != data.hands) {

            Cache.showTipsMsg("网络连接不稳定", () => {
                cc.director.loadScene("Update");
            });
            return;
        }

        this.showClock([data.idx], data.clock)
        let idx = TableInfo.realIdx[data.idx];
        TableInfo.currentPlayer = data.idx;
        this.players.forEach((player) => {
            player.active(data);
        });
        this.btnOutCard.active = data.idx == TableInfo.idx;
    },
    sendContinue() {
        Cache.playSfx();
        connector.gameMessage(ROUTE.CS_GAME_READY, {});
    },

    sendReady(e, v) {
        Cache.playSfx();
        this.readyData.plus = parseInt(v) != -1
        this.shuffleBtnStatus(true);
        this.readyBtnStatus(false);
        // connector.gameMessage(ROUTE.CS_GAME_READY, { plus: parseInt(v) != -1 });
    },

    summaryHandleGame(e) {

        let v = e.data ? 1 : -1;
        this.shuffleCard('', v);
    },
    shuffleCard(e, v) {
        Cache.playSfx();
        this.readyData.shuffle = parseInt(v) != -1;
        connector.gameMessage(ROUTE.CS_GAME_READY, this.readyData);
    },

    stopSchedule() {
        cc.director.getScheduler().unscheduleAllForTarget(this);
    },

    emitVote() {
        Cache.showConfirm('是否解散游戏', () => {
            connector.gameMessage(ROUTE.CS_GAME_VOTE, { agree: true });

        })
    },

    emitLeave() {
        if (TableInfo.idx == 0) {
            Cache.showConfirm('解散游戏不扣房卡，是否解散游戏', () => {
                connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});

            })
        } else {
            connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});

        }
    },


    showQuest(data) {
        if (utils.isNullOrEmpty(data.quests)) {
            return;
        }
        if (!data.idx)
            data.idx = TableInfo.idx;
        //显示倒计时
        this.showClock([data.idx], data.clock)
        this.layoutQuest.active = true;
        this.nodeBtn.active = true;
        this.nodeChi.active = false;
        this.quest = [[], [], []];
        this.questChi = [];
        TableInfo.serialID = data.serialID;
        data.quests.forEach((data, i) => {
            // let res={};
            // res.idx=i;
            // res.card=TableInfo.currentCard;

            data.idx = i;
            data.card = TableInfo.currentCard;

            this.questCard = data.card;
            switch (data.type) {
                case 'chi':
                    TableInfo.currentCard = data.options[0].cards[0];
                    this.quest[0].push(data);
                    this.questChi.push(data);

                    break;
                case 'peng':
                    TableInfo.currentCard = data.card;
                    this.quest[1].push(data);
                    break;
                case 'hu':
                    TableInfo.currentCard = data.card;
                    this.quest[2].push(data);
            }
        });
        this.btnQuest.forEach((btn, i) => {
            btn.active = (this.quest[i].length > 0);
        })
    },
    /**回答是否吃碰胡 */
    btnQuestCallFunc(event, data) {
        switch (data) {
            case '0':
                if (this.quest[2].length > 0) {
                    //cc.log('进入弃胡判定');
                    Cache.showConfirm('您确定放弃胡牌?', () => {
                        this.showQuestChi();
                    });
                } else
                    this.showQuestChi();
                break;
            case '1':
                if (this.quest[2].length > 0) {
                    //cc.log('进入弃胡判定');
                    Cache.showConfirm('您确定放弃胡牌?', () => {
                        connector.gameMessage(ROUTE.CS_ANSWER, { serialID: TableInfo.serialID, answer: this.quest[1][0].idx, card: TableInfo.currentCard });
                        this.layoutQuest.active = false;
                    });
                } else {
                    connector.gameMessage(ROUTE.CS_ANSWER, { serialID: TableInfo.serialID, answer: this.quest[1][0].idx, card: TableInfo.currentCard });
                    this.layoutQuest.active = false;
                }
                break;
            case '2':
                connector.gameMessage(ROUTE.CS_ANSWER, { serialID: TableInfo.serialID, answer: this.quest[2][0].idx, card: TableInfo.currentCard });
                this.layoutQuest.active = false;
                break;
            case '3':
                if (this.nodeChi.active) {
                    this.nodeChi.node = false;
                    this.nodeBtn.active = true;
                }
                else {
                    //cc.log(this.quest[2].length);
                    if (this.quest[2].length > 0) {
                        //cc.log('进入弃胡判定');
                        Cache.showConfirm('您确定放弃胡牌?', () => {
                            connector.gameMessage(ROUTE.CS_ANSWER, { serialID: TableInfo.serialID, answer: -1, card: TableInfo.currentCard });
                            this.layoutQuest.active = false;
                        });
                    } else {
                        connector.gameMessage(ROUTE.CS_ANSWER, { serialID: TableInfo.serialID, answer: -1, card: TableInfo.currentCard });
                        this.layoutQuest.active = false;
                    }
                }
                break;
        }
    },

    showQuestChi() {
        this.nodeBtn.active = false;
        this.nodeChi.active = true;
        this.chiContent1.removeAllChildren();
        this.chiContent2.removeAllChildren();
        this.quest[0].forEach((e, i) => {
            let chiBox = cc.instantiate(this.chiBox);
            if (i > 3) {
                chiBox.parent = this.chiContent2;
                this.chiContent1.y = 147;
            } else {
                this.chiContent1.y = 0;
                chiBox.parent = this.chiContent1;
            }
            chiBox.getComponent('ModuleChiBoxZp').init(e);
        })
    },

    showBi(info, bi, quest, ifBi) {
        if (quest == null) {
            quest = [];
            this.quest[0].forEach(q => {
                quest.push(JSON.parse(JSON.stringify(q)));
            })
        }
        this.layoutGroup.node.active = false;
        this.layoutBi.node.active = true;
        this.chiIdx = [];
        this.layoutShowChi.node.removeAllChildren();
        this.layoutBi.node.removeAllChildren();
        let parent = this.layoutShowChi.node
        let nodeShowChi = cc.instantiate(this.group);
        nodeShowChi.parent = parent;
        nodeShowChi.scale = 0.75;
        nodeShowChi.getComponent('BaseGroupZP').init(info, { click: false, bg: true });
        this.contentShowChi.push(nodeShowChi);
        if (bi.cards != null) {
            let nodeShowChi0 = cc.instantiate(this.group);
            nodeShowChi0.parent = parent;
            nodeShowChi0.getComponent('BaseGroupZP').init(bi, { click: false, bg: true });
            this.contentShowChi.push(nodeShowChi0);
        }

        for (let i = 0; i < quest.length; i++) {
            let x;
            if (ifBi) {
                x = quest[i].options.findIndex(a => JSON.stringify(a.cards) == JSON.stringify(bi.cards));
            } else
                x = quest[i].options.findIndex(a => JSON.stringify(a.cards) == JSON.stringify(info.cards));
            let infom = { x: i, y: x };
            if (x > -1) {
                if (ifBi && this.quest[0][i].options.length == 3) {
                    this.chiIdx.push(infom);
                }
                if (!ifBi)
                    this.chiIdx.push(infom);
            }
        }



        for (let i = 0; i < quest.length; i++) {
            if (!ifBi) {
                let idChi = quest[i].options.findIndex(a => JSON.stringify(a.cards) == JSON.stringify(info.cards));

                if (idChi > -1) {
                    quest[i].options.splice(idChi, 1);
                }
            }
            if (bi.cards != null) {
                let idBi = quest[i].options.findIndex(a => JSON.stringify(a.cards) == JSON.stringify(bi.cards));
                cc.log('删除删除删除删除', idBi);
                if (idBi > -1) {
                    quest[i].options.splice(idBi, 1);
                }
            }
        }

        let questBi = [];
        this.chiIdx.forEach(c => {
            quest[c.x].options.forEach(opt => {
                let idxBi0 = questBi.findIndex(a => JSON.stringify(a) == JSON.stringify(opt.cards));
                if (idxBi0 < 0) {
                    let nodeBi = cc.instantiate(this.group);
                    nodeBi.parent = this.layoutBi.node;
                    nodeBi.scale = 0.75;
                    opt.type = 'chi';
                    opt.idx = quest[c.x].idx;
                    nodeBi.getComponent('BaseGroupZP').init(opt, { click: quest[c.x].options.length == 1 || this.contentShowChi.length == 3, bg: true });
                    if (quest[c.x].options.length > 1 && this.contentShowChi.length < 3) {
                        nodeBi.on('touchend', () => {
                            bi = {
                                type: 'chi',
                                cards: opt.cards,
                                idx: quest[c.x].idx,
                                xi: 0,
                                card: null,

                            };
                            this.showBi(info, bi, quest, true);
                        })
                    }
                    questBi.push(opt.cards);
                }
            })
        })


    },
    /**放弃吃 */
    quitChi() {
        if (this.layoutBi.node.active) {
            this.layoutBi.node.active = false;
            this.layoutBi.node.removeAllChildren();
            this.layoutGroup.node.active = true;
            this.layoutShowChi.node.removeAllChildren();
            //this.questChi = this.quest[0];
            this.showQuestChi()
        } else {
            this.nodeChi.active = false;
            this.nodeBtn.active = true;
        }



        // called every frame, uncomment this function to activate update callback
        // update  (dt) {

        // },
    },
    /** 显示倒计时
     *  posArr----[0,1,2]  显示位置 
     */
    showClock(posArr, times) {
        this.hideClock();
        if (utils.isNullOrEmpty(posArr)) return;
        this.clockSprite = [];

        //TODO 倒计时
        let time = Math.max((times - utils.getTimeStamp()) / 1000, 0);

        posArr.forEach((idx) => {
            this.players[TableInfo.realIdx[idx]].showClock(time)
            this.clockSprite.push(TableInfo.realIdx[idx]);
        })
    },
    hideClock(idx = -1) {
        if (utils.isNullOrEmpty(this.clockSprite)) return;
        if (idx == -1) {
            this.clockSprite.forEach((idx) => {
                this.players[idx].hideClock();
            })
        } else {
            this.players[TableInfo.realIdx[idx]].hideClock();
            // this.clockSprite.forEach((idx) => {
        }
    },


    /** 取消托管 */
    cancelAuto(data) {

        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].activeAutoPlay(false, idx);
        if (TableInfo.idx == data.idx) {
            this.startAutoBtn.active = true;
            this.autoMask.active = false;
        }
    },
    /**开始托管 */
    startAuto(data) {

        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].activeAutoPlay(true, idx);
        if (TableInfo.idx == data.idx) {
            this.startAutoBtn.active = false;
            this.autoMask.active = true;
        }
    },
    changeAutoBtn(bool, y) {
        this.startAutoBtn.active = !bool;
        this.autoMask.active = bool;
    },
    changeAutoState(data) {
        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].activeAutoPlay(data.auto, idx);
        if (TableInfo.idx == data.idx)
            this.changeAutoBtn(data.auto, 2)
    },
    /**点击开始托管 */
    onStartAuto() {
        if (TableInfo.status == GameConfig.GameStatus.START || TableInfo.status == GameConfig.GameStatus.QUEST || TableInfo.status == GameConfig.GameStatus.PLAY) {
            this.startAutoBtn.active = false;
            this.autoMask.active = true;
            connector.gameMessage(ROUTE.CS_START_AUTO, {});
        }
    },
    /**点击取消托管 */
    onCancelAuto() {
        this.startAutoBtn.active = true;
        this.autoMask.active = false;
        connector.gameMessage(ROUTE.CS_CANCEL_AUTO, {});
    },


    /**同步手牌 */
    syncCard(data) {
        this._delayTime = 3;
        this.hands.syncCard(data);
    },
    /**离开游戏 */
    onClickExit() {
        Cache.playSfx();
        if (TableInfo.status == GameConfig.GameStatus.START) return;
        if (this.onExitting) return;
        this.onExitting = true;

        Cache.showConfirm("是否退出游戏", () => {
            connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
            GameConfig.ShowTablePop = true;
            this.onExitting = false;
        }, () => {
            this.onExitting = false;
        });

    },
    //检查听牌
    checkTing(showCard, move) {
        //let groundCards = [];
        this.tingContent.removeAllChildren();
        let grounds = [];
        let alCards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (showCard || showCard == 0)
            alCards[showCard]++;
        this.players.forEach(player => {
            player.ground.content.forEach(c => {
                switch (c.type) {
                    case 'chi':
                        alCards[c.cards[0]]++;
                        alCards[c.cards[1]]++;
                        alCards[c.cards[2]]++;
                        break;
                    case 'bi':
                        alCards[c.cards[0]]++;
                        alCards[c.cards[1]]++;
                        alCards[c.cards[2]]++;
                        break;
                    case 'peng':
                        alCards[c.cardValue] += 3;
                        break;
                    case 'wei':
                        alCards[c.cardValue] += 3;
                        break;
                    case 'pao':
                        alCards[c.cardValue] += 4;
                        break;
                    case 'ti':
                        alCards[c.cardValue] += 4;
                        break;
                }
            })
        });
        this.players.forEach(player => {
            player.qi.content.forEach(card => {
                alCards[card]++;
            })
        });
        try {
            let hands = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.hands._hands.forEach(x => {
                x.forEach(y => {
                    hands[y._card]++;
                })
            });
            if (move || move == 0)
                hands[move]--;
            hands.forEach((count, card) => {
                if (count > 0)
                    alCards[card] = alCards[card] + count;
            });
            this.players[0].ground.content.forEach(g => {
                let data = {
                    type: g.type,
                    xi: g.xi,
                    card: g.cardValue,
                    cards: g.cards
                };
                grounds.push(data);
            });
            let result = [];
            this.showCardTing(hands, alCards, grounds)
            hands.forEach((count, card) => {
                if (alCards[card] < 4) {
                    let newGrounds = JSON.parse(JSON.stringify(grounds));
                    let hu = tips.makeHu(hands, newGrounds, card, TableInfo.config);
                    if (hu)
                        result.push(card);
                }
            });
            let word = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'];
            this.tingNode.active = (result.length > 0);
            let countResult = [];
            for (let i = 0; i < 20; i++) {
                countResult.push(0);
            }
            result.forEach(c => {
                countResult[c]++;
            });
            if (result.length > 0) {
                countResult.forEach((count, c) => {
                    if (count > 0) {
                        let card = cc.instantiate(this.tingItem);
                        card.width = 48.5;
                        card.height = 55.5
                        card.parent = this.tingContent;
                        let count = (4 - alCards[c])
                        card.getComponent('ModuleTingItem').init(c, false, count);
                    }
                })
            }
        } catch (error) {

        }


    },

    showTingNode() {
        Cache.playSfx();
        this.tingNode.active = !this.tingNode.active;
    },

    /**显示手牌听 */
    showCardTing(hands, alCards, grounds) {
        let result = [];
        hands.forEach((count, card) => {
            if (count == 0 || count == 4 || count == 3) return;
            let newHands = hands.concat();
            newHands[card]--;
            let canHu = false;

            for (let index = 0; index < newHands.length; index++) {
                if (alCards[index] < 4) {
                    let newGrounds = JSON.parse(JSON.stringify(grounds));
                    let hu = tips.makeHu(newHands, newGrounds, index, TableInfo.config);
                    if (hu) {
                        canHu = true;
                        break;
                    }
                }
            }
            if (canHu)
                result.push(card);

        });
        // result.forEach((card, index) => {

        // })
        for (let i = 0; i < this.hands._hands.length; i++) {
            if (this.hands._hands[i].length == 0) continue;
            this.hands._hands[i].forEach((e) => {
                e.getComponent("BaseCardZP").showTing(result.indexOf(e._card) != -1);
            })
        }
    },


    /**听牌框显隐动画 */
    tingNodeAnim() {
        return
        // if (this.tingAnim) return;
        // let ap = cc.moveTo(0.3, cc.v2(cc.winSize.width / 2 - this.tingNode.width / 2, 106.55));
        // let bp = cc.moveTo(0.3, cc.v2(cc.winSize.width / 2 + this.tingNode.width / 2 - 66, 106.55))
        // this.tingAnim = true;
        // if (this.tingNode.x > (cc.winSize.width / 2 - this.tingNode.width / 2) + 10) {
        //     this.tingNode.runAction(cc.sequence(ap, cc.callFunc(() => {
        //         this.tingAnim = false;
        //     })))
        // } else {
        //     this.tingNode.runAction(cc.sequence(bp, cc.callFunc(() => {
        //         this.tingAnim = false;
        //     })))
        // }

    },

    /**弃胡 */
    onGiveUpHu() {
        Cache.playSfx();

        if (this.giveUpHuing) return;
        this.giveUpHuing = true;
        Cache.showConfirm('是否弃胡？', () => {
            connector.gameMessage(ROUTE.CS_PLAY_CARD, -1);
            this.giveUpHuing = false;
        }, () => {
            this.giveUpHuing = false;
        })
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
    exitBtnStatus() {
        this.exitBtn.active = TableInfo.status == GameConfig.GameStatus.WAIT || TableInfo.status == GameConfig.GameStatus.DESTORY;

    },
    readyBtnStatus(bool) {
        this.birdReadyBtn.active = bool;
        this.normalReadyBtn.active = bool;
    },
    shuffleBtnStatus(bool) {
        this.shuffleBtn.active = bool;
        this.unShuffleBtn.active = bool;
    },

    onDestroy() {
        this.removeEvents();
        this.removeGoEasyEvents();
    }

});
