// let Calc = require('../../Game19/Hulib/calc19');//require("../Hulib/calc19");
const { Calc } = require('../Hulib/calc16');

const config = require('../../Game16/Script/MJGameConfig');
const CN_PERSON = ["", "一", "二", "三"];
let TableInfo = require('../../../Main/Script/TableInfo');
let connector = require('../../../Main/NetWork/Connector');
let db = require('DataBase');
let PACK = require('PACK');
let ROUTE = require('../../../Main/Script/ROUTE');
let audioCtrl = require('audio-ctrl');
let Native = require('native-extend');
let _social = Native.Social;
let utils = require("../../../Main/Script/utils");
const Cache = require("../../../Main/Script/Cache");
const { GameConfig } = require("../../../GameBase/GameConfig");
const { Queue } = require("../../Game16/demo/queue");
const { App } = require('../../../script/ui/hall/data/App');

const QUEUE_STATUS = {
    /**完成 */
    DONE: "DONE",
    /**处理中 */
    HANDLE: "HANDLE"
}

const WIND_DESC = ['东', '南', '西', '北'];

const customConfig = {
    ext: false,
    show: true,
    black: false,
    bird: true,
    rand: true,
    four: true,
    aaa: false,
    limit: true,
    person: 4,
    clan: true,
    turn: 8
};
cc.Class({
    extends: require('GameBase'),

    properties: {
        //bgBird:
        // sprkuang: [cc.SpriteFrame],
        // actionKuang: [cc.Node],
        // playCardMask: cc.Node,
        nodeDirection: cc.Node,
        layoutDirection: cc.Node,
        // nodeSet: cc.Node,
        player: cc.Prefab,
        lblCombo: cc.Label,
        lblTime: cc.Label,
        btnDestory: cc.Node,
        btnReady: cc.Node,
        lblTid: cc.Label,
        lblBase: cc.Label,
        lblGametype: cc.Label,
        lblTurn: cc.Label,
        lblDeck: cc.Label,
        lblWind: cc.Label,
        card: cc.Prefab,
        nodePlayCard: [cc.Node],
        hands: require('../../commonScript/ModuleHandsMJ'),
        layoutHands: [require('../../commonScript/ModuleOtherHandsMJ')],
        ground: [require('../../commonScript/ModuleGroundMJ')],
        selfHandGround: require('../../commonScript/ModuleHandGroundMJ'),
        selfHandFlower: require('../../commonScript/ModuleFlowerMJ'),
        nodeQuest: cc.Node,
        nodeSelectQuest: cc.Node,
        preRoundSummary: cc.Prefab,
        showSummaryNiao: cc.Prefab,
        imgQuest: cc.Node,

        spriteFrameQuest: [cc.SpriteFrame],
        // gps: cc.Node,
        preShowCard: cc.Prefab,
        bgTing: cc.Node,
        btnTing: cc.Node,
        preTingCard: cc.Prefab,
        lblTing: cc.Label,
        texturee: cc.SpriteAtlas,
        btnExit: cc.Node,
        bgNode: cc.Node,
        autoMask: cc.Node,
        btnAuto: cc.Node,
        cutAnim: sp.SkeletonData,
        cutTips: cc.Node,

        nodeTx: cc.Node,
        lastTxTime: 0
    },

    onLoad() {
        // let indexBg = utils.getValue(GameConfig.StorageKey.tableBgIndex, 0)
        // this.bgNode.spriteFrame = GameConfig.tableBgSprite[indexBg];
        //初始化父类 true  播放海南麻将背景
        this.initGameBase(true);
        this.addEvents();
        //cc.log(TableInfo.cardsSpriteFrame);
        //TODO

        // this.gps = this.gps.getComponent('ModuleGPS11');
        cc.sprFlag = cc.find('Canvas/nodeTable/sprFlag');
        for (let key in this.texturee._spriteFrames) {
            TableInfo.cardsSpriteFrame[key] = this.texturee._spriteFrames[key];
        }

        //初始化存储玩家头像和玩家脚本的数组
        TableInfo.playerHead = [null, null, null, null];
        TableInfo.players = [null, null, null, null];
        //初始化聊天模块
        this.initChatContent();
        //是否可以接受服务器消息的状态
        this.alReady = false;
        //开启消息队列
        // setTimeout(()=>{
        //TODO
        this._status = QUEUE_STATUS.DONE
        this.schedule(this.gameMsgSchedule, 0.1);
        // },cc.sys.isNative ? 0 : 2000);
        //cc.log(this.lblTime);
        //回复服务器表示客户端初始化完毕 
        //TODO 只有JOINDONE
        connector.emit(PACK.CS_JOIN_DONE, {});
        // }
        //TODO
        // connector.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.ENTER_SCENE, gamtype: "HZMJ_SOLO" });

        //关闭遮罩
        Cache.hideMask();

    },
    addEvents() {
        this.btnExit.on(cc.Node.EventType.TOUCH_END, this.onExitGame, this);
        // this.btnTing.on(cc.Node.EventType.TOUCH_START, this.showTingUI, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_SHOW_SAME_CARD, this.showSameCard, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_RESET_SAME_CARD, this.resetSameCard, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_CHECK_HU, this.handleCheckHu, this)
        App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_HIDE_TING, this.hideTingUI, this)
        App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_QUEST_CALL, this.questCall, this)
        App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_GAME_SUMMARY, this.roundReset, this)
    },
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_SHOW_SAME_CARD, this.showSameCard, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_RESET_SAME_CARD, this.resetSameCard, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_CHECK_HU, this.handleCheckHu, this)
        App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_HIDE_TING, this.hideTingUI, this)
        App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_QUEST_CALL, this.questCall, this)
        App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_GAME_SUMMARY, this.roundReset, this)


    },
    initChatContent() {
        this.node.on('chatAlready', () => {
            let data = {
                str: ['快点啊,我等得花儿都谢了', '你的牌打的真是太好了', '不要走,决战到天亮', '不好意思,我得离开一会', '咱们交个朋友吧', '不要吵了,专心玩游戏吧'],
                url: 'ChatImg/Game11',
                aniPos: [
                    cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, -100 + 46),
                    cc.v2(-139 / 2 + cc.winSize.width / 2 - GameConfig.FitScreen, 50 + 46),
                    cc.v2(329, cc.winSize.height / 2 - 128 / 2),
                    cc.v2(-139 / 2 + cc.winSize.width / 2 - GameConfig.FitScreen, 50 + 46),
                ],
                msgPos: [
                    cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen + 50, -140),
                    cc.v2(-139 / 2 + cc.winSize.width / 2 - GameConfig.FitScreen - 50, 50 + 50),
                    // cc.v2(329, 150 + 50),
                    cc.v2(329, cc.winSize.height / 2 - 128 / 2),
                    cc.v2(-139 / 2 + cc.winSize.width / 2 - GameConfig.FitScreen - 50, 50 + 50),
                ],
                facePos: [
                    cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen + 50, -100),
                    cc.v2(-139 / 2 + cc.winSize.width / 2 - GameConfig.FitScreen + 50, 50),
                    cc.v2(329, cc.winSize.height / 2 - 128 / 2),
                    cc.v2(-139 / 2 + cc.winSize.width / 2 - GameConfig.FitScreen + 50, 50),
                ],
                faceAnchor: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
            };
            this.chat.init(data);
        });
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


        // if (this._status != QUEUE_STATUS.DONE) return;
        // let msg = Queue.next();
        // if (!msg) return;
        // console.log(msg.route + ":", msg.data)
        // this._status = QUEUE_STATUS.HANDLE;
        // this.scheduleOnce(() => {
        //     this._status = QUEUE_STATUS.DONE;
        // }, 1)


        switch (msg.route) {
            case ROUTE.SC_GAME_DATA: //进桌 重连
                this.reconnect(msg.data);
                break;
            case ROUTE.SC_CHAPTER:
            case ROUTE.SC_GAME_READY:
                this.gameReady(msg.data);
                break;
            case ROUTE.SC_CHANGE_STATUS:
                this.changeStatus(msg.data);
                break;
            case ROUTE.SC_GAME_INIT:
                this.gameInit(msg.data);
                break;
            case ROUTE.SC_PLAY_CARD: // action  
                this.playCard(msg.data);
                break;
            case ROUTE.SC_GET_CARD: //action  DRAW  hands 加上摸的牌再同步手牌
                this.getCard(msg.data);
                break;
            case ROUTE.SC_OUT_CARD:
                this.outCard(msg.data);
                break;
            case ROUTE.SC_PLAYER_LEAVE:
                this.onPlayerLeave(msg.data);
                break;
            case ROUTE.SC_SCORE:
                this.score(msg.data);
                break;
            // case ROUTE.SC_GAME_VOTE:
            //     this.gameVote(msg.data);
            //     break;
            case ROUTE.SC_GAME_CHAT:
                this.chat.contentFly(msg.data);
                break;
            case ROUTE.SC_GAME_DRAW:
                this.gameDraw(msg.data);
                break;
            case ROUTE.SC_QUEST:
                this.quest(msg.data);
                break;
            case ROUTE.SC_ACTION:
                this.action(msg.data);
                break;
            case ROUTE.SC_ROUND_SUMMARY:
                cc.log(msg.data);
                this.roundSummary(msg.data);
                break;
            case ROUTE.SC_GAME_SUMMARY:
                //TODO
                // this.roundSummary(msg.data);

                break;
            case ROUTE.SC_REFRESH_CARD:
                db.player.card = msg.data.card;
                break;
            case ROUTE.SC_DEAD:
                this.dead(msg.data);
                break;
            case ROUTE.SC_SYSTEM_NOTICE:
                //TODO
                utils.pop(GameConfig.pop.NoticePop, (node) => {
                    node.getComponent('ModuleNotice').showTips(msg.data.message, msg.data.times);
                })
                break;
            case ROUTE.SC_CANCEL_AUTO:
                this.cancelAuto(msg.data);
                break;
            case ROUTE.SC_START_AUTO:
                this.startAuto(msg.data);
                break;
            //同步手牌
            case ROUTE.SC_SYNC_HANDS:
                this.syncCard(msg.data)
                break;
            // case ROUTE.SC_QUICK_FINISH:
            case ROUTE.SC_DISBAND:
                this.nodeTx.getComponent("ModuleTouxiang19").txInit(msg.data);
                break;
            case ROUTE.SC_GAME_DESTORY:
                this.playerLeave(msg.data);
                break;
            case ROUTE.SC_TOAST:
                if (!utils.isNullOrEmpty(msg.data.message))
                    Cache.alertTip(msg.data.message);
                break;
            default:
                console.log('default------', logs)
                break;
        }
    },

    joinTable(data) {
        TableInfo.status = data.status;
        TableInfo.zhuang = null;
        TableInfo.wind = null;
        TableInfo.tid = data.tid;
        let idx = data.idx;
        TableInfo.idx = data.idx;
        TableInfo.options = data.options;
        TableInfo.config = data.options;
        // mode: "CUSTOM"
        if (TableInfo.config.person == 4) { //四人麻将
            this.realIdx = [0, 0, 0, 0];
            this.realIdx[idx] = 0;
            this.realIdx[(idx + 1) % 4] = 1;
            this.realIdx[(idx + 2) % 4] = 2;
            this.realIdx[(idx + 3) % 4] = 3;


        } else if (TableInfo.config.person == 3) {//三人麻将
            this.realIdx = [0, 0, 0];
            this.realIdx[idx] = 0;
            this.realIdx[(idx + 1) % 3] = 1;
            this.realIdx[(idx + 2) % 3] = 2;
        } else { //TODO 二人麻将 
            this.realIdx = [0, 0];
            this.realIdx[idx] = 0;
            this.realIdx[(idx + 1) % 2] = 2;
        }
        TableInfo.realIdx = this.realIdx;

        if (!utils.isNullOrEmpty(this.players)) {
            this.players.forEach(player => {
                if (player)
                    player.node.destroy();
            })
        }

        // 放置Player脚本
        this.players = new Array(4);
        // this.players = new Array(TableInfo.config.person);

        //初始化玩家状态显示
        this.initPlayer(data);
        /**初始化房间信息显示 */
        this.initTableMsg(data);
    },
    /**初始化玩家状态显示 */
    initPlayer(data) {
        console.log("initPlayer----", this.players)
        data.players.forEach(player => {
            if (player != null) {
                let idx = TableInfo.realIdx[player.idx];
                let nodePlayer = cc.instantiate(this.player);
                //TODO  playerContainer
                this.node.addChild(nodePlayer);
                this.players[idx] = nodePlayer.getComponent('PlayerMJ');
                this.players[idx].playerInit(player);
                if (((player.idx == TableInfo.idx) && !player.ready && data.status != GameConfig.GameStatus.START))
                    this.btnReady.active = true;
            }
        })
    },
    /**初始化房间信息显示 */
    initTableMsg(data) {
        this.lblBase.string = "底分: " + utils.formatGold(data.options.base);//utils.formatGold(data.options.base);
        this.lblGametype.string = "红中麻将 " + (data.options.maxRound == 1 ? '把结' : '（8小局）');//utils.formatGold(data.options.base);
        this.lblTurn.string = data.round == 0 ? "" : '第' + data.turn + '圈 第' + data.round + "局";
        this.lblTid.string = '房号:' + data.options.tableID;
    },

    gameInit(data) {
        TableInfo.status = GameConfig.GameStatus.START;
        this.nodeDirection.active = true;

        this.nodeTx.active = false;
        this.btnDestory.active = false;
        TableInfo.outCards = [];

        this.bgTing.getChildByName("cardContainer").removeAllChildren();
        this.btnTing.getChildByName("cardContainer").removeAllChildren();

        this.btnTing.active = false;
        this.lblTing.node.active = false;
        let roundSummary = cc.find('Canvas/roundSummary');
        if (roundSummary) {
            roundSummary.destroy();
        }

        if (data.combo && data.combo > 0) {
            this.lblCombo.node.active = true;
            this.lblCombo.string = '+' + data.combo;
        } else {
            this.lblCombo.node.active = false;

        }

        // cc.find('Canvas/nodeTable/nodeHands').children.forEach((node, i) => {
        //     node.position = config.GAME_HZMJ.ELSE_HANDS_POS[i];
        // });

        this.lblDeck.string = data.decks + '';
        TableInfo.zhuang = data.banker;
        TableInfo.wind = data.wind;
        TableInfo.status = GameConfig.GameStatus.START;
        TableInfo.currentPlayer = null;
        this.btnReady.active = false;
        this.lblTurn.string = data.round == 0 ? "" : '第' + data.turn + '圈 第' + data.round + "局";
        this.exitBtnStatus();


        TableInfo.turn = data.turn;
        //洗牌

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
                // this.players[idx].ssetScore(e.wallet)
            })

            this.handleShuffle();

        } else {
            this.hands.init(data, false);
        }

        this.selfHandGround.resetGround();
        this.selfHandFlower.resetFlower();



        this.ground.forEach((g, i) => {
            g.reset(i);
        });

        this.layoutHands.forEach((lay, i) => {
            if (TableInfo.config.person == 2) {
                if (i == 2) {
                    let msg = {
                        hands: 13
                    };
                    lay.reset();
                    lay.init(msg, i);
                }
                return;
            }
            if (i != 0) {
                let msg = {
                    hands: 13
                };
                lay.reset();
                lay.init(msg, i);
            }
        })
        this.players.forEach(e => {
            e.hideReady();
        })
        //重置东南西北
        this.resetPlayStatus(data);
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
            this._delayTime = 0;
            this.hands.init(this.shuffleData, false);

        }
    },

    showBtnQuest() {
        let node = cc.find('Canvas/nodeTable/btnQuest');
        if (!node)
            return;
        node.active = true;
        node.getChildByName('layout').children.forEach(node => {
            //cc.log(node._name);
        })
    },



    playCard(data) {
        TableInfo.serialID = data.serialID;
        if (!utils.isNullOrEmpty(data.hands))
            this.nodeQuest.active = false;
        if (data.idx == TableInfo.idx) {
            //todo 手牌不同步  退出重连
            if (this.hands._hands.length % 3 != 2) {
                // connector.disconnect();// disconnect
            }
            this.checkOutCard();
            this.hands._hands[this.hands._hands.length - 1].getCard = true;
            this.hands.sortCards();

        }
        //显示出牌提醒 海南麻将傻逼代理说不要
        // this.playCardMask.active = data.idx == TableInfo.idx;
        console.log("轮到出牌----", data);
        this.hideTingUI();
        //gound 牌显示
        this.hands.resetSameCard();
        this.downloadTime(data);
        //是否为自己出牌
        cc.playCard = data.idx == TableInfo.idx;
        //牌桌显示c
        this.playCardLight(data);

    },

    /**检查听牌 显示手牌里的牌ting */
    checkOutCard() {
        let hasFlower = false;
        let out = TableInfo.outCards.slice();
        let hands = [];
        let alOut = [];
        for (let i = 0; i < 38; i++) {
            alOut.push(0);
        }
        this.hands._hands.forEach(node => {
            if (node) {
                hands.push(node._card);

                alOut[node._card]++;
                node.ting = false;
                hasFlower = node._card > 40;//花牌不检测胡牌
            }
        });

        if (hasFlower)
            return;
        // this.ground.forEach(ground => {
        //     ground.content.forEach(node => {
        //         out.push(node._card);
        //     })
        // });
        out.forEach(card => alOut[card]++);
        //cc.log(alOut);
        // console.log("听牌--alOut--", alOut); 

        for (let i = 0; i < hands.length; i++) {
            let play = hands.slice();
            play.splice(i, 1);
            for (let k = 0; k < 38; k++) {
                if (k == 0 || k == 10 || k == 20 || k == 30)
                    continue;
                // if (alOut[k] < 4) {
                let newHands = play.slice();
                newHands.push(k);
                if (Calc.checkHu(newHands.slice())) {
                    this.hands._hands[i].ting = true;
                }
                // }
            }
        }

        this.hands.showTing();
    },

    checkHu(moveCard, showTing = false) {
        let hasFlower = false;
        let out = TableInfo.outCards.slice();
        this.lblTing.node.active = false;
        this.bgTing.getChildByName("cardContainer").removeAllChildren();
        this.btnTing.getChildByName("cardContainer").removeAllChildren();
        let alOut = [];
        for (let i = 0; i < 38; i++) {
            alOut.push(0);
        }
        // this.ground.forEach(ground => {
        //     ground.content.forEach(node => {
        //         out.push(node._card);
        //     })
        // });
        out.forEach(card => alOut[card]++);
        let hands = [];
        this.hands._hands.forEach(node => {
            if (node) {
                hands.push(node._card);
                alOut[node._card]++;
                hasFlower = node._card > 40;//花牌不检测胡牌
            }
        });

        if (hasFlower)
            return;
        let huCard = 0;
        for (let i = 0; i < 38; i++) {
            if (i == 0 || i == 10 || i == 20 || i == 30)
                continue;
            let arr = hands.slice();
            arr.push(i);
            if (moveCard)
                arr.splice(arr.indexOf(moveCard), 1);

            if (Calc.checkHu(arr.slice())) {
                huCard++;

            }
        }

        if (huCard >= 34) {
            this.lblTing.node.active = true;
            return;
        }

        this.btnTing.active = false;
        for (let i = 0; i < 38; i++) {
            if (i == 0 || i == 10 || i == 20 || i == 30)
                continue;
            // if (alOut[i] < 4) {
            let newHands = hands.slice();
            newHands.push(i);
            if (moveCard) {
                newHands.splice(newHands.indexOf(moveCard), 1);
            }
            if (Calc.checkHu(newHands.slice())) {
                this.btnTing.active = true;
                if (showTing) {
                    this.btnTing.active = false;
                    this.bgTing.active = true;

                }


                let node = cc.instantiate(this.preTingCard);
                // node.scale = 0.8;
                node.parent = this.bgTing.getChildByName("cardContainer");
                node.y = 10;
                node.getChildByName('count').getComponent(cc.Label).string = '剩' + (4 - alOut[i]) + '张';
                node.getComponent('ModuleSelfCardsMJ').init(i, 0.7);


                let snode = cc.instantiate(this.preTingCard);
                // node.scale = 0.8;
                snode.parent = this.btnTing.getChildByName("cardContainer");
                snode.y = 0;
                // snode.getChildByName('count').getComponent(cc.Label).string = '剩' + (4 - alOut[i]) + '张';
                snode.getComponent('ModuleSelfCardsMJ').init(i, 0.45);
            }
            // }
        }
    },

    showTingUI() {
        this.bgTing.active = true;
    },
    hideTingUI() {
        this.bgTing.active = false;
    },


    playCardLight(data) {
        this.nodePlayCard.forEach(node => {
            node.active = false;
        });
        let node = this.nodePlayCard[this.directionIdx[TableInfo.realIdx[data.idx]]];
        node.active = true;
        node.stopAllActions();

        node.runAction(cc.repeatForever(cc.sequence(cc.fadeTo(0.8, 100), cc.fadeTo(0.8, 255))));
        this.players.forEach(player => {
            player.clockAnim(data);
        });
    },

    resetPlayStatus(data) {
        //东指向庄家方向
        let zhuangRealIdx = TableInfo.realIdx[data.wind];
        this.lblWind.string = '' + WIND_DESC[data.wind];
        this.directionIdx = [0, 0, 0, 0];

        switch (zhuangRealIdx) {
            case 0:
                this.directionIdx = [0, 1, 2, 3];

                this.layoutDirection.rotation = 0

                break;
            case 1:
                this.layoutDirection.rotation = -90
                this.directionIdx = [3, 0, 1, 2];

                break;
            case 2:
                this.layoutDirection.rotation = 180
                this.directionIdx = [2, 3, 0, 1];

                break;
            case 3:
                this.layoutDirection.rotation = 90
                this.directionIdx = [1, 2, 3, 0];

                break;
        }

        this.nodePlayCard.forEach(node => {
            node.active = false;
        });

        this.players.forEach(player => {
            player.imgActive.active = false;
        })
    },

    /**抓牌 DRAW */
    getCard(data) {
        this.nodeQuest.active = false;

        this._delayTime = 3;
        let idx = TableInfo.realIdx[data.idx];
        //更新牌垛显示
        this.lblDeck.string = data.decks + '';

        if (data.idx != TableInfo.idx) {

            // if (data.event == GameConfig.GameAction.DRAW_MULTI) {
            //     console.log('多次摸排')
            //     data.cards.forEach(e => {
            //         this.layoutHands[idx].getCard(data.hands);
            //     })

            // } else {
            console.log("对面打牌-----", data)
            this.layoutHands[idx].getCard(data.hands);

            // }
            return;
        }

        if (data.event == GameConfig.GameAction.DRAW_MULTI) {
            this.hands.getCard(data.cards);
        } else {
            this.hands.getCard(data.card);
        }
        //添加牌至手牌
        // data.hands.push(data.card);
        this.syncCard(data);
        this.checkHu();
    },
    //出牌
    outCard(data) {
        // this.playCardMask.active = false;
        this.nodeQuest.active = false;
        this.lblTime.unscheduleAllCallbacks();
        // //隐藏离线icon
        // let msg = { idx: data.idx, status: false };
        // this.changeStatus(msg);
        //倒计时
        this.downloadTime(data);

        let idx = TableInfo.realIdx[data.idx];
        if (idx != 0) {
            //隐藏抓牌显示
            this.layoutHands[idx].outCard(data.card);
        } else {

            if (data.auto)
                this.hands.autoSortCard(data.card);
        }
        //出牌放入弃牌区

        this.changeAutoState(data);
        // //显示出牌
        // let node = cc.instantiate(this.preShowCard);
        // node.getComponent('ModuleGroundCardsMJ').init(data.card, 0);
        // node.parent = this.node; //cc.find('Canvas');
        // if (node)
        //     node.opacity = 255;
        // node.position = config.GAME_HZMJ.SHOW_CARD_POS[idx];
        let url = cc.url.raw('resources/Audio/Common/outCardMj.mp3');
        audioCtrl.getInstance().playSFX(url);
        // node.runAction(cc.sequence(
        //     // cc.fadeIn(0.5),
        //     cc.delayTime(1.2),
        //     // cc.fadeOut(0.5),
        //     cc.callFunc(() => {
        //         if (node)
        //             node.destroy();
        //     })
        // ));
        this.ground[idx].outCard(data.card, idx, true);

        if (idx == 0) //自己才检查胡牌
            this.checkHu();
        // let sex = TableInfo.players[data.idx].prop.sex == "male" ? 'male' : 'female';
        let sex = TableInfo.players[data.idx].prop.sex == "male" ? 'male' : 'female';

        let audioCard = 0;

        if (data.card >= 11 && data.card <= 19) {
            audioCard = data.card + 10;

        } else if (data.card >= 21 && data.card <= 29) {
            audioCard = data.card - 10;

        } else {
            audioCard = data.card;

        }
        let audio = `${sex}_p_${audioCard}.mp3`;
        this.playManageAudio(audio);
    },

    playerLeave(data) {
        //TODO  断开长链接  不退出场景  开始匹配
        if (!utils.isNullOrEmpty(data.reason)) {
            this.btnDestory.active = true;
            Cache.alertTip(data.reason)

        }
        TableInfo.status = GameConfig.GameStatus.DESTORY;
        connector.disconnect(false);
        this.exitBtnStatus();
        this.btnReady.active = false;
        this.players.forEach((e, i) => {
            if (e && i != 0) {
                e.removePlayer();
            }
        })

        // if (TableInfo.realIdx[data.idx] == 0) {
        //     connector.disconnect(false);

        //     return;
        // }
        // this.btnExit.active = true;
        // let idx = TableInfo.realIdx[data.idx];
        // this.players[idx].removePlayer();

    },

    score(data) {

    },

    gameDraw(data) {

    },

    quest(data) {
        TableInfo.serialID = data.serialID;
        //显示 胡碰按钮
        this.nodeQuest.active = true;
        let hu = this.nodeQuest.getChildByName('hu');
        let peng = this.nodeQuest.getChildByName('peng');
        let gang = this.nodeQuest.getChildByName('gang');
        let chi = this.nodeQuest.getChildByName('chi');
        this.nodeQuest.getChildByName('guo').active = true;
        hu.active = false;
        peng.active = false;
        gang.active = false;
        chi.active = false;
        let downloadData = {
            idx: TableInfo.idx,
            clock: data.clock
        }
        this.downloadTime(downloadData);

        this.chiArr = [];
        this.gangArr = [];
        data.quests.forEach((quest, i) => {
            switch (quest.event) {
                case GameConfig.GameAction.PLAY://打牌
                    let playCardData = {
                        idx: TableInfo.idx,
                        clock: data.clock,
                        serialID: data.serialID
                    }
                    this.playCard(playCardData);
                    break;
                case GameConfig.GameAction.PONG://碰
                    peng.active = true;
                    peng.card = quest.card;
                    peng.answer = i;
                    break;
                case GameConfig.GameAction.CHOW://吃
                    chi.active = true;
                    quest.index = i;
                    this.chiArr.push(quest);

                    // chi.card = quest.card;
                    // chi.answer = i;
                    break;
                case GameConfig.GameAction.WIN://胡牌
                    hu.active = true;
                    this.lblTing.node.active = false;
                    this.btnTing.active = false;
                    hu.card = quest.card;
                    hu.answer = i;
                    break;
                // case GameConfig.GameAction.ZHI://明杠
                //     this.gangArr.push(quest);
                //     gang.active = true;
                //     gang.card = quest.card;
                //     gang.answer = i;
                //     break;
                default:
                    gang.active = true;
                    quest.index = i;
                    this.gangArr.push(quest);
                // gang.active = true;
                // // gang.getChildByName('selfCards').getComponent('ModuleSelfCardsMJ').init(quest.card);
                // gang.card = quest.card;
                // gang.answer = i;
            }
        })
    },

    btnQuestCall(event, type) {
        let hu = this.nodeQuest.getChildByName('hu');

        if (hu.active && type != GameConfig.GameAction.WIN) {
            Cache.showConfirm('是否放弃胡牌', () => {
                this.handleQuestCall(type);
            });
        } else {
            this.handleQuestCall(type);
        }



    },

    handleQuestCall(type) {
        switch (type) {
            case GameConfig.GameAction.GUO: //过
                connector.gameMessage(ROUTE.CS_ANSWER, { answer: -1, serialID: TableInfo.serialID });
                this.nodeQuest.active = false;
                break;
            case GameConfig.GameAction.PONG: //碰
                connector.gameMessage(ROUTE.CS_ANSWER, { answer: this.nodeQuest.getChildByName('peng').answer, serialID: TableInfo.serialID });
                this.nodeQuest.active = false;
                break;
            case GameConfig.GameAction.CHOW: //吃
                if (this.chiArr.length > 1) {//多个选择
                    //显示所有选择
                    this.chiArr.forEach(e => {
                        this.nodeSelectQuest.getChildByName('groundContent').getComponent('ModuleHandGroundMJ').addGround(e, 0)
                    })
                    this.nodeSelectQuest.active = true;
                    return;
                }
                connector.gameMessage(ROUTE.CS_ANSWER, { answer: this.chiArr[0].index, serialID: TableInfo.serialID });
                this.nodeQuest.active = false;
                break;
            case 'GANG'://GameConfig.GameAction.ZHI: //明杠
                if (this.gangArr.length > 1) {//多个选择
                    //显示所有选择
                    this.gangArr.forEach(e => {
                        this.nodeSelectQuest.getChildByName('groundContent').getComponent('ModuleHandGroundMJ').addGround(e, 0)
                    })
                    this.nodeSelectQuest.active = true;
                    return;
                }
                connector.gameMessage(ROUTE.CS_ANSWER, { answer: this.gangArr[0].index, serialID: TableInfo.serialID });
                this.nodeQuest.active = false;
                break;
            case GameConfig.GameAction.WIN:
                connector.gameMessage(ROUTE.CS_ANSWER, { answer: this.nodeQuest.getChildByName('hu').answer, serialID: TableInfo.serialID });
                this.nodeQuest.active = false;
                break;
        }
    },
    questCall(e) {
        this.hideSelectQuest();
        connector.gameMessage(ROUTE.CS_ANSWER, { answer: e.data.index, serialID: TableInfo.serialID });
        this.nodeQuest.active = false;
    },
    hideSelectQuest() {
        this.nodeSelectQuest.getChildByName('groundContent').getComponent('ModuleHandGroundMJ').resetGround();
        this.nodeSelectQuest.active = false;

    },
    action(data) {
        if (data.event == GameConfig.GameAction.DRAW || data.event == GameConfig.GameAction.DRAW_MULTI) { //抓牌
            this.getCard(data);
            return
        }
        if (data.event == GameConfig.GameAction.PLAY) { //出牌

            this.outCard(data);
            return
        }

        let idx = TableInfo.realIdx[data.idx];



        let audioType = '';// (data.type == 'fang' || data.type == 'suo' || data.type == 'an') ? 'gang' : data.type;
        let imgIdx;
        if (data.idx == TableInfo.idx) {
            this.hands._hands.forEach(node => node.getCard = false);
            switch (data.event) {
                case GameConfig.GameAction.PONG: //碰
                    audioType = 'peng';
                    imgIdx = 0;
                    this.selfHandGround.addGround(data, 0);
                    this.hands.removeCard(data.card, 2);
                    this.hands.checkedCard = null;
                    this.hands.sortCards();
                    break;
                case GameConfig.GameAction.CHOW: //吃
                    audioType = 'chi';

                    imgIdx = 5;
                    this.selfHandGround.addGround(data, 0);

                    let a = [data.tile, data.tile + 1, data.tile + 2];// 2, 3, 4     .splice(data.card, 1, 1)
                    a.forEach(e => {
                        if (e != data.card)
                            this.hands.removeCard(e);
                    })
                    this.hands.checkedCard = null;
                    this.hands.sortCards();
                    break;
                case GameConfig.GameAction.ZHI: //明杠1
                    audioType = 'gang';

                    imgIdx = 1;
                    this.selfHandGround.addGround(data, 0);
                    this.hands.removeCard(data.card, 3);
                    this.hands.checkedCard = null;
                    this.hands.sortCards();
                    break;
                case GameConfig.GameAction.SHOW: // 补杠2
                    audioType = 'gang';
                    // case GameConfig.GameAction.BU: //补杠杠1
                    imgIdx = 1;
                    this.selfHandGround.addGround(data, 0);
                    this.hands.removeCard(data.card);
                    this.hands.checkedCard = null;
                    this.hands.sortCards();
                    break;
                case GameConfig.GameAction.KONG: //暗杠
                    imgIdx = 1;
                    audioType = 'gang';
                    this.selfHandGround.addGround(data, 0);
                    this.hands.removeCard(data.card, 4);
                    this.hands.sortCards();
                    break;

                case GameConfig.GameAction.FLOWER_MULTI: //补花

                    // auto: false
                    // cards: (3)[41, 42, 43]
                    // event: "FLOWER_MULTI"
                    // idx: 0

                    this._delayTime = 5;
                    imgIdx = 3;
                    data.cards.forEach(card => {
                        let newFLower = {
                            auto: data.auto,
                            card: card,
                            event: GameConfig.GameAction.FLOWER,
                            idx: data.idx,
                        }
                        this.selfHandFlower.addFlower(newFLower, 0)
                        this.hands.removeCard(card);
                    })

                    this.hands.sortCards();
                    break;
                case GameConfig.GameAction.FLOWER: //补花
                    this._delayTime = 5;
                    imgIdx = 3;
                    // this.selfHandGround.addGround(data, 0);
                    this.selfHandFlower.addFlower(data, 0)
                    this.hands.removeCard(data.card);
                    this.hands.sortCards();
                    break;

                case GameConfig.GameAction.WIN://胡
                    console.log("胡牌--data---", data);
                    audioType = 'hu';
                    //TODO 胡牌动画
                    imgIdx = data.from == data.idx ? 4 : 2;
                    break;
            }
        } else {
            //TODO 动画
            switch (data.event) {
                case GameConfig.GameAction.PONG:
                    audioType = 'peng';
                    imgIdx = 0;
                    this.layoutHands[idx].action(data, idx);
                    break;
                case GameConfig.GameAction.CHOW:
                    audioType = 'chi';
                    imgIdx = 5;
                    this.layoutHands[idx].action(data, idx);
                    break;
                case GameConfig.GameAction.WIN://胡
                    audioType = 'hu';
                    imgIdx = data.from == data.idx ? 4 : 2;
                    break;
                case GameConfig.GameAction.FLOWER_MULTI: //补花
                    this._delayTime = 5;
                    imgIdx = 3;
                    data.cards.forEach(card => {
                        let newFLower = {
                            auto: data.auto,
                            card: card,
                            event: GameConfig.GameAction.FLOWER,
                            idx: data.idx,
                        }
                        this.layoutHands[idx].actionflower(newFLower, idx);

                    })

                    break;
                case GameConfig.GameAction.FLOWER:
                    this._delayTime = 5;
                    imgIdx = 3;
                    this.layoutHands[idx].actionflower(data, idx);
                    break;
                case GameConfig.GameAction.SHOW: // 补杠2
                    // case GameConfig.GameAction.BU: //补杠杠1
                    audioType = 'gang';
                    imgIdx = 1;
                    this.layoutHands[idx].action(data, idx);
                    break;
                default:
                    audioType = 'gang';
                    imgIdx = 1;
                    this.layoutHands[idx].action(data, idx);
            }
        }
        if (data.event == GameConfig.GameAction.PONG || data.event == GameConfig.GameAction.CHOW || data.event == GameConfig.GameAction.ZHI) {
            this.ground[TableInfo.realIdx[data.from]].removeCard();
        }
        if (data.event == GameConfig.GameAction.WIN)
            this._delayTime = 10;

        this.imgQuest.active = true;
        this.imgQuest.scale = 0;
        // let str = ['碰', '杠', '胡'];
        this.imgQuest.getComponent(cc.Sprite).spriteFrame = this.spriteFrameQuest[imgIdx];
        this.imgQuest.stopAllActions();
        //TODO  吃碰杠花 动画位置
        let fp = cc.place(config.GAME_HZMJ.QUEST_IMG_POS[idx]);
        let ap = cc.scaleTo(0.2, 1.5);
        let bp = cc.scaleTo(0.1, 0.8);
        let cp = cc.scaleTo(0.1, 1);
        let ep = cc.delayTime(0.2);
        let dp = cc.sequence(fp, ap, bp, cp, ep, cc.callFunc(() => {
            this.imgQuest.scale = 0;
        }))
        this.imgQuest.runAction(dp);

        let sex = TableInfo.players[data.idx].prop.sex == "male" ? 'male' : 'female';
        let audio = `${sex}_p_${audioType}.mp3`;
        this.playManageAudio(audio);
    },
    roundSummary(data) {
        if (data.destory) {
            return;
        }
        TableInfo.status = data.status;
        this.onCancelAuto();
        this.exitBtnStatus();
        this.nodeQuest.active = false;
        this.bgTing.active = false;
        this.nodeTx.active = false;
        this.btnTing.active = false;
        this.stopTime();

        this.hands.hideTing();

        cc.sprFlag.removeFromParent();
        cc.playCard = false;



        if (data.birds.length == 0) {
            let node = cc.instantiate(this.preRoundSummary);
            node.parent = cc.find("Canvas");
            node.getComponent('ModuleRoundSummary16').init(data);
        } else {
            let showNiao = cc.instantiate(this.showSummaryNiao);
            showNiao.getComponent("ModuleShowNiao").renderUI(data);
            this.node.addChild(showNiao);
        }

        data.players.forEach((p, i) => {
            let idx = TableInfo.realIdx[i];
            this.players[idx].roundReset();
            this.players[idx].setScore(p.wallet);
        })

    },


    dead(data) {

    },

    sendReady(e, v) {

        this.roundReset();

        connector.gameMessage(ROUTE.CS_GAME_READY, { plus: v == '-1', shuffle: false });
    },

    /**重制各种区域数据 */
    roundReset() {
        this.hands.reset();
        this.selfHandGround.resetGround();
        this.selfHandFlower.resetFlower();
        this.ground.forEach((g, i) => {
            // if (i < TableInfo.config.person)
            g.reset(i)
        });
        this.layoutHands.forEach((l, i) => {
            // if (i != 0 && i < TableInfo.config.person)
            if (i != 0)
                l.reset()
        });
        this.lblTing.node.active = false;
        this.btnTing.active = false;
    },

    gameReady(data) {
        let idx = TableInfo.realIdx[data.idx];
        if (idx == 0) {

            this.roundReset();
            this.btnReady.active = false;
        }
        this.players[idx].imgReady.active = true;
        this.players[idx].activeNiao(data);
    },

    reconnect(data) {
        TableInfo.outCards = [];
        this.joinTable(data);
        this.roundReset();
        TableInfo.zhuang = data.banker;
        TableInfo.wind = data.wind;


        if (data.status == GameConfig.GameStatus.WAIT) {
            //TODO  匹配自动进入
            // data.players.forEach(player => {

            //     if (player.idx == TableInfo.idx && player.ready == null)
            //         connector.gameMessage(ROUTE.CS_GAME_READY, {});
            // })
        }
        if (data.disband) {
            this.nodeTx.getComponent("ModuleTouxiang19").txInit(data.disband);
        }
        if (data.status == GameConfig.GameStatus.START || data.status == GameConfig.GameStatus.PLAY || data.status == GameConfig.GameStatus.QUEST) {
            this.nodeDirection.active = true;
            this.lblDeck.string = data.decks + '';
            TableInfo.turn = data.turn;
            //TODO 东南西北  
            this.resetPlayStatus(data);

            if (data.combo && data.combo > 0) {
                this.lblCombo.node.active = true;
                this.lblCombo.string = '+' + data.combo;
            } else {
                this.lblCombo.node.active = false;

            }
            this.hands.init(data, true);
            if (data.currentIDX != null && data.currentCard == null) {
                let msg = { idx: data.currentIDX, clock: data.clock, serialID: data.serialID };
                this.playCard(msg);
                TableInfo.currentPlayer = data.currentIDX;
            }
            //自己的ground区 补花区
            if (!utils.isNullOrEmpty(data.grounds)) {
                let groundArr = data.grounds.filter(e => e.event != GameConfig.GameAction.FLOWER);
                this.selfHandGround.initGround(groundArr, 0);
                let flowerArr = data.grounds.filter(e => e.event == GameConfig.GameAction.FLOWER);
                this.selfHandFlower.initFlower(flowerArr, 0);
            }
            // 自己的弃牌区 
            if (!utils.isNullOrEmpty(data.drops)) {
                this.ground[0].init(data.drops, 0);
            }
            data.players.forEach(player => {
                if (player) {
                    if (player.auto)
                        this.startAuto(player);
                    let idx = TableInfo.realIdx[player.idx];
                    if (idx != 0) {
                        this.ground[idx].init(player.drops, idx);
                        this.layoutHands[idx].init(player, idx);
                    }   // player.drops=[1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19]
                    this.players[idx].playerInit(player);
                    this.players[idx].hideReady();
                    this.players[idx].clockAnim({ idx: data.currentIDX, clock: data.clock });

                }
            });
            // {
            //     "card": 12,
            //     "idx": 3,
            //     "src": "SHOW"
            // }
            if (data.currentCard != null && data.currentCard.src != GameConfig.GameAction.SHOW) {
                TableInfo.currentCard = data.currentCard;
                this.outCard(data.currentCard);
                // this.showCard(data.currentCard);
            }


            this.checkOutCard();

            // this.checkHu();
            if (data.quest) {
                data.quest.clock = data.clock
                this.quest(data.quest);
            }
            this.btnReady.active = false;

        }

        if (data.status == GameConfig.GameStatus.SUMMARY) {
            this.nodeDirection.active = true;
            let downloadData = {
                idx: data.currentIDX,
                clock: data.clock
            }
            this.downloadTime(downloadData);
            data.players.forEach(player => {
                if (player.idx == TableInfo.idx)
                    this.btnReady.active = player.ready == null;

            })
        }
        this.exitBtnStatus();
    },




    changeStatus(data) {
        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].offlineChange(data.offline);
        // this.players[idx].imgOffline.active = data.offline;
    },
    onExitGame() {
        Cache.playSfx();
        //选桌
        if (TableInfo.options.mode == 'CUSTOM') {

            GameConfig.ShowTablePop = true;
            Cache.showConfirm("是否退出房间", () => {
                connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
            });
        } else {
            //匹配
            if (TableInfo.status != GameConfig.GameStatus.DESTORY) return;
            //直接回到游戏大厅
            cc.director.loadScene("Lobby");
        }
    },

    /**选桌 主动返回大厅 */
    onPlayerLeave() {
        connector.disconnect();
    },

    onContinueMatch() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.MatchPop, (node) => {
            node.getComponent("ModuleMatchPop").startMatch(TableInfo.config.roomID);
        })
    },
    /** 取消托管 */
    cancelAuto(data) {

        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].activeAutoPlay(false);
        if (TableInfo.idx == data.idx) {
            this.btnAuto.active = true;
            this.autoMask.active = false;
        }
    },
    /**开始托管 */
    startAuto(data) {

        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].activeAutoPlay(true);
        if (TableInfo.idx == data.idx) {
            this.btnAuto.active = false;
            this.autoMask.active = true;
        }
    },
    /**点击开始托管 */
    onStartAuto() {
        Cache.playSfx();
        console.log("状态---:", TableInfo.status)
        if (TableInfo.status != GameConfig.GameStatus.START && TableInfo.status != GameConfig.GameStatus.QUEST && TableInfo.status != GameConfig.GameStatus.PLAY) {
            return;
        }
        this.btnAuto.active = false;
        this.autoMask.active = true;
        connector.gameMessage(ROUTE.CS_START_AUTO, {});
    },
    /**点击取消托管 */
    onCancelAuto() {
        Cache.playSfx();
        this.btnAuto.active = true;
        this.autoMask.active = false;
        connector.gameMessage(ROUTE.CS_CANCEL_AUTO, {});
    },
    changeAutoState(data) {
        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].activeAutoPlay(data.auto);
        if (TableInfo.idx == data.idx) {
            this.btnAuto.active = !data.auto;
            this.autoMask.active = data.auto;
        }
    },
    /**同步手牌 */
    syncCard(data) {

        // asdad
        // this.hands.init(data, false);



        let currentCards = [];
        data.hands.sort((a, b) => a - b);
        this.hands._hands.forEach((e, i) => {
            currentCards[i] = e._card;
        })
        currentCards.sort((a, b) => a - b);

        if (currentCards.toString() != data.hands.toString()) {
            console.log("手牌同步: ", currentCards, data.hands)
            this.hands.init(data);
        }
    },
    /**出牌时显示相同手牌 */
    showSameCard(e) {
        let card = e.data
        this.ground.forEach((g, i) => {
            // if (i < TableInfo.config.person) {
            g.showSameCard(card);
            // }
        })
    },

    /**重置相同手牌 */
    resetSameCard() {
        this.ground.forEach((g, i) => {
            // if (i < TableInfo.config.person) {
            g.resetSameCard();
            // }
        })
    },
    /**检查胡牌 */
    handleCheckHu(e) {
        this.checkHu(e.data.card, e.data.showTing)
    },
    /**解散 */
    acTx() {
        let nowTime = new Date().getTime();
        if ((nowTime - this.lastTxTime) < 10000) {
            Cache.alertTip('点击过于频繁,不能少于10秒')
            return
        }
        if (TableInfo.status == GameConfig.GameStatus.WAIT || TableInfo.status == GameConfig.GameStatus.SUMMARY) {
            Cache.alertTip('牌局未开始,无法解散');
            return;
        }
        this.lastTxTime = nowTime;
        connector.gameMessage(ROUTE.CS_DISBAND, 'allow');
    },
    onDistancePop() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.DistanceMJPop);
    },
    onRulePop() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.MJRulePop);
    },



    downloadTime(data) {
        console.log("倒计时---", data)
        //出牌倒计时

        this.lblTime.unscheduleAllCallbacks();
        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].clockAnim(data);
        let endTime = utils.getTimeStamp(data.clock);
        let newTime2 = utils.getTimeStamp();
        let time1 = Math.floor((endTime - newTime2) / 1000);
        if (time1 > 0)
            this.lblTime.string = time1;
        this.lblTime.schedule(() => {
            // time--;
            let newTime1 = utils.getTimeStamp();
            let time = Math.floor((endTime - newTime1) / 1000);
            // let nowTime=new Date().children
            if (time < 0) return;
            this.lblTime.string = time;
        }, 1);
    },

    stopTime() {
        this.lblTime.string = '';
        this.lblTime.unscheduleAllCallbacks();
    },

    exitBtnStatus() {
        this.btnExit.active = TableInfo.status == GameConfig.GameStatus.WAIT || TableInfo.status == GameConfig.GameStatus.DESTORY;

    }


});


