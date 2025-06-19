let calc = require('../Game19/Hulib/calc19');
const config = require('../Game16/Script/MJGameConfig');
const CN_PERSON = ["", "一", "二", "三"];
let TableInfo = require('../../Main/Script/TableInfo');
let connector = require('../../Main/NetWork/Connector');
let db = require('DataBase');
let PACK = require('PACK');
let ROUTE = require('../../Main/Script/ROUTE');
let audioCtrl = require('audio-ctrl');
let Native = require('native-extend');
let _social = Native.Social;
let utils = require("../../Main/Script/utils");
let VoiceCtrl = require("voice-ctrl");
const Cache = require("../../Main/Script/Cache");
const { GameConfig } = require("../../GameBase/GameConfig");
const { App } = require('../../script/ui/hall/data/App');


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
    extends: cc.Component,

    properties: {
        btnOperate: [cc.Node],
        lblSpeed: cc.Label,

        nodeDirection: cc.Node,
        sprFlag: cc.Node,
        layoutDirection: cc.Node,
        // nodeSet: cc.Node,
        player: cc.Prefab,
        lblCombo: cc.Label,
        lblPhoneTime: cc.Label,
        lblTid: cc.Label,
        lblTurn: cc.Label,
        lblDeck: cc.Label,
        lblWind: cc.Label,
        card: cc.Prefab,


        nodePlayCard: [cc.Node],
        hands: [require('../../GameMj/commonScript/ModuleHandsMJ')],
        layoutHands: [require('../../GameMj/commonScript/ModuleReplayHandsMJ')],
        ground: [require('../../GameMj/commonScript/ModuleGroundMJ')],
        selfHandGround: require('../../GameMj/commonScript/ModuleHandGroundMJ'),
        selfHandFlower: require('../../GameMj/commonScript/ModuleFlowerMJ'),
        preRoundSummary: cc.Prefab,
        imgQuest: cc.Node,
        spriteFrameQuest: [cc.SpriteFrame],
        texturee: cc.SpriteAtlas,
        dtCount: 0,
        lastTxTime: 0
    },
    playManageAudio(msg) {
        let game = db.gameType < 10 ? ("Game0" + db.gameType) : ("Game" + db.gameType);
        if (!cc.sys.isNative) {
            return;
        }
        let url = jsb.fileUtils.getWritablePath() + "remote-asset/Audio/" + game + "/" + msg;
        cc.loader.load(url, function (err, data) {
            if (!err) {
                let audioCtrl = require("audio-ctrl");
                audioCtrl.getInstance().playSFX(data);
            }
        });
    },
    onLoad() {
        this.addEvents();
        this.speed = 1;
        this._queueGameMsg = Cache.replayData;
        this.length = this._queueGameMsg.length;
        cc.sprFlag = this.sprFlag;
        for (let key in this.texturee._spriteFrames) {
            TableInfo.cardsSpriteFrame[key] = this.texturee._spriteFrames[key];
        }

        //初始化存储玩家头像和玩家脚本的数组
        TableInfo.playerHead = [null, null, null, null];
        TableInfo.players = [null, null, null, null];

        //是否可以接受服务器消息的状态
        this.alReady = true;

        //TODO
        this._status = QUEUE_STATUS.DONE
        cc.director.getScheduler().schedule(this.gameMsgSchedule, this, 0.2);
        cc.director.getScheduler().setTimeScale(this.speed);


        //关闭遮罩
        Cache.hideMask();

    },
    addEvents() {
        // App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_SHOW_SAME_CARD, this.showSameCard, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_RESET_SAME_CARD, this.resetSameCard, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.REPLAY_BACK_HALL, this.quit, this);
        // App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_HIDE_TING, this.hideTingUI, this)
        // App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_QUEST_CALL, this.questCall, this)
        // App.EventManager.addEventListener(GameConfig.GameEventNames.HNMJ_GAME_SUMMARY, this.roundReset, this)
    },
    removeEvents() {
        // App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_SHOW_SAME_CARD, this.showSameCard, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_RESET_SAME_CARD, this.resetSameCard, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.REPLAY_BACK_HALL, this.quit, this);
        // App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_HIDE_TING, this.hideTingUI, this)
        // App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_QUEST_CALL, this.questCall, this)
        // App.EventManager.removeEventListener(GameConfig.GameEventNames.HNMJ_GAME_SUMMARY, this.roundReset, this)
    },


    gameMsgSchedule() {

        if (this._delayTime > 0) {
            this._delayTime--;
            return;
        }
        if (this._queueGameMsg.length <= 0)
            return;
        let msg = this._queueGameMsg.shift();
        let logs = cc.sys.isBrowser ? msg : JSON.stringify(msg)
        console.log(logs)




        switch (msg.route) {
            case 'SC_RECORD':
                this.joinTable(msg.data);
                break;


            case ROUTE.SC_PLAY_CARD: // action  
                this.playCard(msg.data);
                break;
            case ROUTE.SC_OUT_CARD:
                this.outCard(msg.data);
                break;
            case ROUTE.SC_ACTION:
                this.action(msg.data);
                break;
            case ROUTE.SC_ROUND_SUMMARY:
                cc.log(msg.data);
                this.roundSummary(msg.data);
                break;

            case ROUTE.SC_REFRESH_CARD:
                db.player.card = msg.data.card;
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
            case ROUTE.SC_GAME_DESTORY:
                this.playerLeave(msg.data);
                break;
            default:
                console.log(logs)
                break;
        }
    },

    joinTable(data) {
        this.nodeDirection.active = true;
        TableInfo.zhuang = null;
        TableInfo.wind = null;
        let idx = data.idx || 0;
        TableInfo.idx = data.idx || 0;
        TableInfo.options = data.options;
        TableInfo.config = data.options;
        // mode: "CUSTOM"
        if (TableInfo.options.person == 4) { //四人麻将
            this.realIdx = [0, 0, 0, 0];
            this.realIdx[idx] = 0;
            this.realIdx[(idx + 1) % 4] = 1;
            this.realIdx[(idx + 2) % 4] = 2;
            this.realIdx[(idx + 3) % 4] = 3;


        } else if (TableInfo.options.person == 3) {//三人麻将
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


        // 放置Player脚本
        this.players = new Array(4);



        //初始化玩家状态显示
        this.initPlayer(data);
        /**初始化房间信息显示 */
        this.initTableMsg(data);
        this.resetPlayStatus(data);


    },
    /**初始化玩家状态显示 */
    initPlayer(data) {
        data.players.forEach(player => {
            if (player != null) {
                let idx = TableInfo.realIdx[player.idx];
                let nodePlayer = cc.instantiate(this.player);
                //TODO  playerContainer
                this.node.addChild(nodePlayer);
                this.players[idx] = nodePlayer.getComponent('ModulePlayer19');
                this.players[idx].playerInit(player);
                console.log("初始化手牌-----", idx)
                if (player.idx == TableInfo.idx) {
                    this.hands.init(player, false);
                } else {
                    this.layoutHands[idx].init(player, idx)
                }

            }
        })
        this.selfHandGround.resetGround();
        this.selfHandFlower.resetFlower();
        this.players.forEach(player => {
            if (player != null) {
                player.roundReset();
                player.showGa();
            }
        });
        this.ground.forEach((g, i) => {
            g.reset(i);
        });


    },
    /**初始化房间信息显示 */
    initTableMsg(data) {
        this.lblTurn.string = (data.turn || '0') + '/' + TableInfo.options.maxTurn;
        this.lblTid.string = '房号:' + data.options.tableID;
    },
    resume() {
        //cc.log(cc.director.getScheduler().isScheduled(this.gameMsgSchedule,this));
        cc.director.getScheduler().resumeTarget(this);
        this.btnOperate[0].active = true;
        this.btnOperate[1].active = false;
    },

    pause() {
        cc.director.getScheduler().pauseTarget(this);
        this.btnOperate[0].active = false;
        this.btnOperate[1].active = true;
    },

    playSpeed(event, data) {
        if (cc.director.getScheduler().isTargetPaused(this))
            this.resume();
        this.speed = (data == '1') ? (this.speed - 0.2) : (this.speed + 0.2);
        if (this.speed > 1.6)
            this.speed = 1.6;
        if (this.speed < 0.4)
            this.speed = 0.4;
        this.lblSpeed.string = '当前速度: x' + this.speed.toFixed(1);
        cc.director.getScheduler().setTimeScale(this.speed);
    },
    quit: function () {
        Cache.replayData = null;
        cc.director.getScheduler().setTimeScale(1);
        cc.director.getScheduler().unscheduleAllForTarget(this);
        let nodeSelect = cc.find('Canvas/summarySelect16');
        if (nodeSelect)
            nodeSelect.destroy();
        if (this.node)
            this.node.destroy();

    },
    joinGame(data) {
        let idx = TableInfo.realIdx[data.idx];
        if (idx == 0)
            return;
        let nodePlayer = cc.instantiate(this.player);
        nodePlayer.parent = cc.find('Canvas/nodeTable');
        this.players[idx] = nodePlayer.getComponent('ModulePlayer19');
        this.players[idx].playerInit(data);

        // this.gps.checkIP();/
        //cc.log(this.players);
    },

    gameInit(data) {
        TableInfo.status = GameConfig.GameStatus.START;
        if (data.combo && data.combo > 0) {
            this.lblCombo.node.active = true;
            this.lblCombo.string = '+' + data.combo;
        } else {
            this.lblCombo.node.active = false;

        }

        this.lblDeck.string = data.decks + '';
        TableInfo.zhuang = data.banker;
        TableInfo.wind = data.wind;
        TableInfo.status = GameConfig.GameStatus.START;
        TableInfo.currentPlayer = null;
        this.lblTurn.string = (data.turn == 0 ? 1 : data.turn) + "/" + TableInfo.options.maxTurn;


        TableInfo.turn = data.turn;
        this.players.forEach(player => {
            let msg = TableInfo.players[player.idx];
            player.playerInit(msg);

        })


        this.hands.init(data, false);
        this.selfHandGround.resetGround();
        this.selfHandFlower.resetFlower();
        this.players.forEach(player => {
            if (player != null) {
                player.roundReset();
                player.showGa();
            }
        });
        this.ground.forEach((g, i) => {
            g.reset(i);
        });
        //初始化手牌
        this.layoutHands.forEach((lay, i) => {
            if (TableInfo.options.person == 2) {
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
        //重置东南西北
        this.resetPlayStatus(data);
    },





    playCard(data, reconnect) {
        TableInfo.serialID = data.serialID;
        if (data.idx == TableInfo.idx) {
            this.hands._hands[this.hands._hands.length - 1].getCard = true;
            this.hands.sortCards();
        }

        //gound 牌显示
        this.hands.resetSameCard();
        //是否为自己出牌
        cc.playCard = data.idx == TableInfo.idx;
        //牌桌显示c
        this.playCardLight(data);

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
            player.active(data.idx);
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
        if (data.card == -1 || (data.cards && data.cards.length > 0 && data.cards.includes(-1)))
            return;
        this._delayTime = 5;
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

            if (data.event == GameConfig.GameAction.DRAW_MULTI) {
                data.cards.forEach(element => {
                    let msg = {
                        "event": "DRAW_MULTI",
                        "idx": data.idx,
                        "card": element,
                        "hands": data.hands,
                        "decks": data.decks,
                        "auto": data.auto
                    }
                    this.layoutHands[idx].getCard(msg, idx);

                });

            } else {
                this.layoutHands[idx].getCard(data, idx);

            }

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
        // this.syncCard(data);;
    },
    //出牌
    outCard(data) {

        //隐藏离线icon
        let msg = { idx: data.idx, status: false };
        this.changeStatus(msg);

        let idx = TableInfo.realIdx[data.idx];
        if (idx != 0) {
            //隐藏抓牌显示
            this.layoutHands[idx].outCard(data.card);
        } else {
            this.hands.autoSortCard(data.card);
        }
        //出牌放入弃牌区

        this.changeAutoState(data);
        console.log('出牌-----', data.card, idx);
        this.ground[idx].outCard(data.card, idx, true);

        console.log('出牌--1---', this.ground[idx]);


        // let sex = TableInfo.players[data.idx].prop.sex == "male" ? 'male' : 'female';
        let audio = `MELD_${data.card}.mp3`;
        this.playManageAudio(audio);
    },

    action(data) {
        this._delayTime = 5
        if (data.event == GameConfig.GameAction.DRAW || data.event == GameConfig.GameAction.DRAW_MULTI) { //抓牌
            this.getCard(data);
            return
        }
        if (data.event == GameConfig.GameAction.PLAY) { //出牌

            this.outCard(data);
            return
        }

        let idx = TableInfo.realIdx[data.idx];


        let audio = '';


        let imgIdx;
        if (data.idx == TableInfo.idx) {
            this.hands._hands.forEach(node => node.getCard = false);
            switch (data.event) {
                case GameConfig.GameAction.PONG: //碰
                    audio = 'PONG_0.mp3'
                    imgIdx = 0;
                    this.selfHandGround.addGround(data, 0);
                    this.hands.removeCard(data.card, 2);
                    this.hands.checkedCard = null;
                    this.hands.sortCards();
                    break;
                case GameConfig.GameAction.CHOW: //吃
                    audio = 'CHOW_0.mp3'
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
                    audio = 'KONG_0.mp3';

                    imgIdx = 1;
                    this.selfHandGround.addGround(data, 0);
                    this.hands.removeCard(data.card, 3);
                    this.hands.checkedCard = null;
                    this.hands.sortCards();
                    break;
                case GameConfig.GameAction.SHOW: // 补杠2
                    // case GameConfig.GameAction.BU: //补杠杠1
                    imgIdx = 1;
                    this.selfHandGround.addGround(data, 0);
                    this.hands.removeCard(data.card);
                    this.hands.checkedCard = null;
                    this.hands.sortCards();
                    audio = 'KONG_3.mp3';
                    break;
                case GameConfig.GameAction.KONG: //暗杠
                    audio = 'KONG_0.mp3';
                    imgIdx = 1;
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
                    audio = 'FLOWER.mp3';
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
                    audio = 'FLOWER.mp3';
                    imgIdx = 3;
                    // this.selfHandGround.addGround(data, 0);
                    this.selfHandFlower.addFlower(data, 0)
                    this.hands.removeCard(data.card);
                    this.hands.sortCards();
                    break;

                case GameConfig.GameAction.WIN://胡
                    console.log("胡牌--data---", data);
                    //TODO 胡牌动画
                    imgIdx = data.from == data.idx ? 4 : 2;
                    audio = data.from == data.idx ? 'WIN_DRAW_1.mp3' : 'WIN_NODRAW_2.mp3';
                    break;
            }
        } else {
            //TODO 动画
            switch (data.event) {
                case GameConfig.GameAction.PONG:
                    imgIdx = 0;
                    audio = 'PONG_1.mp3'
                    this.layoutHands[idx].action(data, idx);
                    break;
                case GameConfig.GameAction.CHOW:
                    audio = 'CHOW_3.mp3'
                    imgIdx = 5;
                    this.layoutHands[idx].action(data, idx);
                    break;
                case GameConfig.GameAction.WIN://胡
                    imgIdx = data.from == data.idx ? 4 : 2;
                    audio = data.from == data.idx ? 'WIN_DRAW_0.mp3' : 'WIN_NODRAW_0.mp3';
                    break;
                case GameConfig.GameAction.FLOWER_MULTI: //补花
                    this._delayTime = 5;
                    audio = 'FLOWER.mp3';
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
                    audio = 'FLOWER.mp3';
                    imgIdx = 3;
                    this.layoutHands[idx].actionflower(data, idx);
                    break;
                case GameConfig.GameAction.SHOW: // 补杠2
                    // case GameConfig.GameAction.BU: //补杠杠1
                    imgIdx = 1;
                    this.layoutHands[idx].action(data, idx);
                    audio = 'KONG_3.mp3';
                    break;
                default:
                    audio = 'KONG_1.mp3';
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

        // let sex = TableInfo.players[data.idx].prop.sex == "male" ? 'male' : 'female';
        // let type = (data.type == 'fang' || data.type == 'suo' || data.type == 'an') ? 'gang' : data.type;
        // let audio = `${sex}_p_${type}.mp3`;


        this.playManageAudio(audio);
    },


    roundSummary(data) {
        if (data.destory) {
            return;
        }
        this.hands.hideTing();
        cc.sprFlag.removeFromParent();
        cc.playCard = false;
        let node = cc.instantiate(this.preRoundSummary);
        node.parent = cc.find("Canvas");
        node.getComponent('ModuleRoundSummary19').init(data, true);
        node.active = true;
        data.players.forEach((p, i) => {
            let idx = TableInfo.realIdx[i];
            this.players[idx].roundReset();
            if (!utils.isNullOrEmpty(p.total))
                this.players[idx].setScore(p.total);
        })

    },

    /**重制各种区域数据 */
    roundReset() {
        this.hands.reset();
        this.selfHandGround.resetGround();
        this.selfHandFlower.resetFlower();
        this.ground.forEach((g, i) => {
            g.reset(i)
        });
        this.layoutHands.forEach((l, i) => {
            if (i != 0)
                l.reset()
        });
    },



    changeStatus(data) {
        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].imgOffline.active = data.status;
    },

    onExitGame() {
        Cache.playSfx();
        //TODO
        // this.node.de
    },



    /** 取消托管 */
    cancelAuto(data) {

        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].activeAutoPlay(false);

    },
    /**开始托管 */
    startAuto(data) {

        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].activeAutoPlay(true);

    },


    changeAutoState(data) {
        let idx = TableInfo.realIdx[data.idx];
        this.players[idx].activeAutoPlay(data.auto);

    },

    /**同步手牌 */
    syncCard(data) {
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
            g.showSameCard(card);
        })
    },

    /**重置相同手牌 */
    resetSameCard() {
        return;
        this.ground.forEach((g, i) => {
            g.resetSameCard();
        })
    },

    update(dt) {

        this.dtCount++;
        if (this.dtCount % 60) {
            this.dtCount = 0;
            let date = new Date();

            let h = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ':';

            let m = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
            this.lblPhoneTime.string = h + m;
        }


    }

});
