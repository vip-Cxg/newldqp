import { GameConfig } from "../../../GameBase/GameConfig";
import ROUTE from "../../../Main/Script/ROUTE";
import TableInfo, { players } from "../../../Main/Script/TableInfo";
import utils from "../../../Main/Script/utils";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import AudioCtrl from "../../../Main/Script/audio-ctrl";
import logic from '../../../GamePoker/Game07/Script/Logic07';
import HandsCard from "./hands-card";
import DataBase from '../../../Main/Script/DataBase';
import PACK from "../../../Main/Script/PACK";
import { Queue } from "./queue";
const { ccclass, property } = cc._decorator


const QUEUE_STATUS = {
    /**完成 */
    DONE: "DONE",
    /**处理中 */
    HANDLE: "HANDLE"
}
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

@ccclass
export default class ui extends cc.Component {

    /**牌组显示区 */
    @property(cc.Node)
    showCardContent1 = null;
    @property(cc.Node)
    showCardContent2 = null;
    @property(cc.Node)
    sprDisnable = null;
    @property(HandsCard)
    layerHandCards = null;
    @property([cc.Node])
    dropCards = [];
    @property([cc.Node])
    bgCount = [];
    @property([cc.Node])
    imgPass = [];

    @property(cc.Prefab)
    summaryPrefab = null;
    @property(cc.Prefab)
    nodeBack = null;
    @property(cc.Prefab)
    preType = null;
    @property(cc.Prefab)
    preCoin = null;
    @property([sp.SkeletonData])
    pokerSkeleton = [];
    /** --------游戏按钮------ */
    @property(cc.Node)
    btnBirdReady = null;
    @property(cc.Node)
    btnNormalReady = null;
    @property(cc.Node)
    btnExit = null;
    @property(cc.Node)
    btnTips = null;
    @property(cc.Node)
    btnPlayCards = null;
    /**------桌子信息-------- */
    @property(cc.Label)
    lblGameLevel = null;
    @property(cc.Label)
    lblClubType = null;
    @property(cc.Label)
    lblGameType = null;
    @property(cc.Label)
    lblBase = null;
    @property(cc.Label)
    lblNiao = null;
    @property(cc.Label)
    lblTurn = null;

    /**玩家 */
    @property(cc.Prefab)
    prePlayerInfo = null;

    /**玩家层 */
    @property(cc.Node)
    layerPlayer = null;

    /**所有玩家 */
    players = [];
    /**------托管显示ui---------- */
    @property(cc.Node)
    btnStartAuto = null;
    @property(cc.Node)
    maskAuto = null;
    /**托管状态 */
    _autoStatus = false;
    set autoStatus(bool) {
        if (this._autoStatus == bool) return;
        this.btnStartAuto.active = !bool;
        this.maskAuto.active = bool;
        this._autoStatus = bool;
    }

    /**是否换桌 */
    isChgTable = false;
    /**队列状态 */
    _status = QUEUE_STATUS.DONE;

    onLoad() {
        this.addEvents();
        utils.pop(GameConfig.pop.TipsCard, (node) => {
            node.setPosition(-cc.winSize.width / 2 + 200, cc.winSize.height / 2 - node.height / 2)
            this.tipsCardPrefab = node.getComponent("ModuleTipsCard");
        })
        if (DataBase.connectInfo && DataBase.connectInfo.reconnect) {
            Connector.emit(PACK.CS_REJOIN_DONE, {});
        } else {
            Connector.emit(PACK.CS_JOIN_DONE, {});
        }
    }
    addEvents() {

    }

    start() {
        if (!GameConfig.isTest)
            return;
        this.schedule(this.loop, 0.3);
    }

    loop() {
        if (this._status == QUEUE_STATUS.DONE) {
            let msg = Queue.next();
            if (!msg) return;
            console.log(msg.route + ":" + msg.data)
            this._status = QUEUE_STATUS.HANDLE;

            switch (msg.route) {
                case ROUTE.SC_JOIN_TABLE:
                    this.initTable(msg.data)
                    break;
                case ROUTE.SC_GAME_READY:
                    this.changeReady(msg.data);
                    break;
                case ROUTE.SC_PLAYER_LEAVE:
                    this.leavePlayer(msg.data.idx);
                    break;
                //其他玩家加入
                case ROUTE.SC_JOIN_GAME:
                    this.addPlayer(msg.data);
                    break;
                case ROUTE.SC_PREPARE:
                    // this.prepareReady(msg.data);
                    break;
                //重连
                case ROUTE.SC_RECONNECT:
                    this.reconnect(msg.data);
                    break;
                //游戏开始
                case ROUTE.SC_GAME_INIT:
                    this.initGame(msg.data);
                    break;
                //玩家出牌
                case ROUTE.SC_PLAY_CARD:
                    msg.data.clock = 0;
                    this.playCard(msg.data);
                    break;
                //显示玩家出牌
                case ROUTE.SC_SHOW_CARD:
                    this.showPlayCards(msg.data);
                    break;
                case ROUTE.SC_PASS_CARD:
                    this.showPass(msg.data);
                    break;
                case ROUTE.SC_REFRESH_CARD:
                    db.player.card = msg.data.card;
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
                case ROUTE.SC_GAME_VOTE:
                    this.gameVote(msg.data);
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
                    this._status = QUEUE_STATUS.DONE;
                    //cache.alertTip("必须带黑桃三");
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
                default:
                    this._status = QUEUE_STATUS.DONE;
                    break;

            }
        }
    }

    /**初始化桌子 */
    initTable(data) {
        let windowNode = cc.find("Canvas")

        this.showCardContent1.position = cc.v2(windowNode.width / 2 - 139 - 70 / 2 - GameConfig.FitScreen, 130);
        this.showCardContent2.position = cc.v2(139 - windowNode.width / 2 + 70 + GameConfig.FitScreen, 130);

        this.isChgTable = false;
        data.turn = data.turn || 0;
        TableInfo.status = data.status;
        TableInfo.idx = data.idx;
        TableInfo.options = data.options;
        customConfig.person = data.options.gameType.indexOf("SOLO") != -1 ? 2 : 3;
        TableInfo.config = customConfig;
        TableInfo.tid = data.tid;
        TableInfo.current = data.current;

        this.btnBirdReady.active = data.ready == 0 || TableInfo.status == GameConfig.GameStatus.WAIT;
        this.btnNormalReady.active = data.ready == 0 || TableInfo.status == GameConfig.GameStatus.WAIT;
        this.btnExit.active = (TableInfo.status != GameConfig.GameStatus.START) && (data.turn == 0 || data.turn >= 10);

        //显示游戏 类型 公会
        this.lblGameLevel.string = GameConfig.GameRoomLevel[data.options.level];
        this.lblClubType.string = data.options.isLeague ? "大联盟" : "亲友圈";
        this.lblGameType.string = GameConfig.GameName[data.options.gameType] + "（10小局起）";
        this.lblBase.string = "底分: ¥" + utils.formatGold(data.options.base);
        this.lblNiao.string = "打鸟: ¥" + utils.formatGold(data.options.base * 5);
        this.setTurn(data);
        this.initRealIdx(data);

        this.initPlayers(data);

        //退出托管
        this.autoStatus = false;

        this._status = QUEUE_STATUS.DONE;
    }

    /**设置桌子显示局数 */
    setTurn(data) {
        TableInfo.turn = data.turn;
        this.lblTurn.string = data.turn == 0 ? "" : data.turn + "局";//+ TableInfo.config.turn;
    }
    /**初始化玩家实际位置 */
    initRealIdx(data) {
        let idx = data.idx;
        TableInfo.idx = data.idx;
        let realIdx = [0, 0, 0];
        realIdx[idx] = 0;
        realIdx[(idx + 1) % 3] = 1;
        if (TableInfo.config.person == 2) {
            realIdx[(idx + 2) % 3] = 1;
        } else {
            realIdx[(idx + 2) % 3] = 2;
        }
        TableInfo.realIdx = realIdx;

    }

    /**初始化玩家 */
    initPlayers(data) {
        this.players = new Array(TableInfo.config.person);
        TableInfo.players = data.players;
        //距离刷新
        // this.updatePlayerDistance();
        data.players.forEach((player, i) => {
            console.log("hahahahhaha")
            if (player != null) {
                let nodePlayer = cc.instantiate(this.prePlayerInfo);
                //todo 玩家当前分数
                // if (player.idx == data.idx)
                //     GameConfig.GameCurrentScore = player.wallet;
                // nodePlayer.sex = data.players[i].prop.sex;
                this.layerPlayer.addChild(nodePlayer);
                let playerInfo = nodePlayer.getComponent("player07")
                playerInfo.playerData = player;
                playerInfo.activeReady(player.ready != 0);
                playerInfo.activeNiao(player);
                playerInfo.activeAutoPlay(player.auto);
                this.players[TableInfo.realIdx[player.idx]] = playerInfo;
                if (TableInfo.idx == data.idx)
                    this.autoStatus = player.auto;
            }
        });
    }


    initGame(data) {
        this.players.forEach((playerInfo, i) => {
            playerInfo.activeReady(false);
            //更新剩余牌数
            playerInfo.cardCount(15);
        });
        TableInfo.baodan = customConfig.person == 2 ? [false, false] : [false, false, false];
        TableInfo.zhuang = data.zhuang;
        // TableInfo.currentPlayer = data.host;
        // TableInfo.endGame = false;
        TableInfo.firstPlay = true;
        TableInfo.current = null;
        TableInfo.status = GameConfig.GameStatus.START;
        this.btnExit.active = false;

        this.setTurn(data);
        this.btnStartAuto.active = true;
        //初始化玩家手牌
        this.initHands(data, false);
    }

    addPlayer(data) {
        this._status = QUEUE_STATUS.DONE;
        if (data.idx == TableInfo.idx) return;

        if (this.players[TableInfo.realIdx[data.idx]]) {
            this.players[TableInfo.realIdx[data.idx]].playerData = data;//(data, TableInfo.realIdx[data.idx])
        } else {

            TableInfo.players[data.idx] = data;
            let nodePlayer = cc.instantiate(this.prePlayerInfo);
            nodePlayer.parent = this.layerPlayer;
            let playerInfo = nodePlayer.getComponent("player07");
            playerInfo.playerData = data;//init(data, TableInfo.realIdx[data.idx]);
            this.players[TableInfo.realIdx[data.idx]] = playerInfo;
        }
        //更新距离
        // this.updatePlayerDistance();
    }
    /**炸弹加分 */
    scoreFly(data) {
        //出牌区归零
        this.players.forEach((player, i) => {
            player.removeDropCard();
        });
        //玩家自身无能出的牌 提示 隐藏
        this.sprDisnable.active = false;
        let person = data.from.length;
        //播放加金币音效
        let url = cc.url.raw(`resources/Audio/Common/addScore.mp3`);
        AudioCtrl.getInstance().playSFX(url);

        let spawn = [];
        let playPos = [
            cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, - 63),
            cc.v2(cc.winSize.width / 2 - 139 / 2 - GameConfig.FitScreen, 130 - 63),
            cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, 110 - 63),
        ]
        //结束点位置
        let endPos = playPos[TableInfo.realIdx[data.to[0].idx]];
        try {

            //分数显示
            let playerAdd = this.players[TableInfo.realIdx[data.to[0].idx]];
            playerAdd.showBombScores(TableInfo.realIdx[data.to[0].idx], data.to[0].wallet, data.to[0].score, () => {
                for (let i = 0; i < 20; i++) {
                    let nodeCoin = cc.instantiate(this.preCoin);
                    nodeCoin.parent = this.node;
                    nodeCoin.setPosition(playPos[TableInfo.realIdx[data.from[i % person].idx]]);
                    let pos = cc.v2(Math.random() * 100 - 50, Math.random() * 100 - 50);
                    spawn.push(cc.targetedAction(nodeCoin,
                        cc.sequence(
                            cc.delayTime(0.1 * Math.random()),
                            cc.spawn(
                                cc.moveBy(0.3, pos),
                                cc.scaleTo(0.3, 0.7)
                            ),
                            cc.moveTo(0.4, endPos),
                            cc.callFunc(function () {
                                this.destroy();
                            }, nodeCoin)
                        )
                    ));
                }
                //分数隐藏后飘金币动画
                this.node.runAction(cc.spawn(spawn));
            });
            data.from.forEach((f, i) => {
                let dec = this.players[TableInfo.realIdx[f.idx]];
                dec.showBombScores(TableInfo.realIdx[f.idx], f.wallet, f.score);
            });
        } catch (ex) {
            console.log("----err", ex)
            // _social.reportError(ex)

        }

        this._status = QUEUE_STATUS.DONE;
    }

    /**一轮牌结束 */
    finish() {

        this.players.forEach((player, i) => {
            player.removeDropCard();
        });
        this.sprDisnable.active = false;
        TableInfo.current = null;
        this._status = QUEUE_STATUS.DONE;
    }


    /**初始化手牌 */
    initHands(data, bool) {
        data.hands.sort((a, b) => a % 100 - b % 100);
        if (!bool) {
            this.cutCards(data.hands.reverse());
        } else {
            this.layerHandCards.handsCard = data.hands.reverse();
        }
        this._status = QUEUE_STATUS.DONE

    }

    cutCards(data) {
        this._delayTime = 100;
        let pos = [
            cc.v2(522, 122),
            cc.v2(-522, 122)
        ];
        let url = cc.url.raw(`resources/Audio/Common/deal07.mp3`);
        let middle = Math.ceil(data.length / 2);
        for (let i = 0; i < data.length * (3 - 1); i++) {
            // for (let i = 0; i < data.length * (TableInfo.config.person - 1); i++) {
            let node = cc.instantiate(this.nodeBack);
            node.parent = this.node;
            node.setPosition(0, 0);
            node.runAction(cc.sequence(
                cc.delayTime(0.02 * i % 3),
                cc.spawn(
                    cc.rotateBy(0.3, 180),
                    cc.scaleTo(0.3, 1),
                    cc.moveTo(0.6, pos[i % 2]),//(TableInfo.config.person - 1)]),
                    // cc.moveTo(0.6, pos[i % (TableInfo.config.person - 1)]),
                    cc.sequence(
                        cc.delayTime(0.4),
                        cc.fadeOut(0.2)
                    )
                ),
                cc.delayTime(0.2),
                cc.callFunc(() => {
                    node.destroy();
                })
            ));
        }
        for (let i = 0; i < data.length; i++) {
            let node = cc.instantiate(this.nodeBack);
            node.parent = this.node;
            node.setPosition(0, 0);
            node.runAction(cc.sequence(
                cc.delayTime(0.02 * i % 3),
                cc.spawn(
                    cc.rotateBy(0.3, 180),
                    cc.scaleTo(0.3, 1),
                    cc.moveTo(0.6, -273 + (8 - middle + i) * 40, -145),
                    cc.callFunc(() => {
                        if (i % 9 == 0)
                            AudioCtrl.getInstance().playSFX(url);
                    }),
                    cc.sequence(
                        cc.delayTime(0.4),
                        cc.fadeOut(0.2)
                    )
                ),
                cc.callFunc(() => {
                    node.destroy();
                })
            ))
        }
        this.layerHandCards.cutCards(data);
    }
    playCard(data) {
        TableInfo.currentPlayer = data.idx;
        let idx = data.idx
        let realIdx = TableInfo.realIdx[idx];

        //移除上轮出牌
        this.players[realIdx].removeDropCard();

        this.showAction(idx);


        if (TableInfo.firstPlay) {
            this.players[realIdx].activeBanker(true);
        }

        let time = Math.max(TableInfo.options.clock - data.clock, 0);
        this.players[realIdx].showClock(time);
        if (idx == TableInfo.idx)
            this.layerHandCards.playCard();

        TableInfo.firstPlay = false;
        this._status = QUEUE_STATUS.DONE;
    }

    /**要不起 */
    showPass(data) {
        let realIdx = TableInfo.realIdx[data.idx];
        //移除上轮出牌
        this.players[realIdx].showPass();
        this._delayTime = 5;
        this.layerHandCards.changeBtn(false);
        this.sprDisnable.active = data.idx == TableInfo.idx;
        let voice = this.layerPlayer.getComponent("BgTableAudioCtr07");
        voice.PassVoice(TableInfo.players[data.idx].prop.sex);
        this._status = QUEUE_STATUS.DONE;
    }

    showAction(idx) {
        // this.players.forEach(player => player.activeAction(false));
        this.players[TableInfo.realIdx[idx]].activeAction(true);
    }

    readyGame(e, v) {

        if (!GameConfig.isTest)
            return
        //todo 
        // if (GameConfig.GameCurrentScore < TableInfo.options.base * LimitCount) {
        //     cache.showTipsMsg("积分不足", () => {
        //         this.backHall();
        //     })
        //     return;
        // }
        //todo 1--打鸟 -1 --正常
        Connector.gameMessage(ROUTE.CS_GAME_READY, { readyStatus: parseInt(v) });
        // Queue.push(
        //     { "route": "SC_GAME_READY", "data": { "idx": 0, "ready": -1, "auto": false } }
        // )

    }
    changeReady(data) {
        //自己准备
        if (TableInfo.idx == data.idx) {
            this.btnNormalReady.active = false;
            this.btnBirdReady.active = false;
            this.initDesk()
        }
        try {
            this.players[TableInfo.realIdx[data.idx]].activeReady(true);
            this.players[TableInfo.realIdx[data.idx]].activeNiao(data);
        } catch (error) {
        }
        this._status = QUEUE_STATUS.DONE;
    }
    exitGame() {

        if (!GameConfig.isTest)
            return
        if (this.onExitting) return;
        if (TableInfo.status == GameConfig.GameStatus.START) return;
        this.onExitting = true;
        Cache.showConfirm("是否退出房间", () => {
            this.onExitting = false;
            //todo
            Connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
        }, () => {
            this.onExitting = false;
        });
    }
    /**玩家离开 */
    leavePlayer(idx) {
        if (TableInfo.realIdx[idx] == 0 && !this.isChgTable) {
            Connector.disconnect();
            this.node.removeAllChildren();
            this.node.destroy();
            return;
        }
        TableInfo.players[idx] = null;
        TableInfo.turn = 0;

        this.btnExit.active = true;

        this.players[TableInfo.realIdx[idx]].leaveRoom();
        this.players[TableInfo.realIdx[idx]] = null;

        this._status = QUEUE_STATUS.DONE;
    }
    /**继续游戏初始化桌子 */
    initDesk() {
        this.sprDisnable.active = false;
        //移除结算界面

        if (this.node.getChildByName("roundSummary")) {
            this.node.getChildByName("roundSummary").removeFromParent();
        }

        this.players.forEach((player) => {
            if (player) 
                player.initPlayer();
            
        });
        this.layerHandCards.handsCard = [];
    }
    acBaodan(data) {
        let sex = TableInfo.players[data.idx].prop.sex;
        let sexVoice = sex //== 1 ? "male" : "famale";
        Cache.playSound(`${sexVoice}_baodan`);
        // let url = cc.url.raw();
        //    AudioCtrl.getInstance().playSFX(url);
        TableInfo.baodan[data.idx] = true;
        this.players[TableInfo.realIdx[data.idx]].activeBaodan(true);
        this._status = QUEUE_STATUS.DONE;
    }

    showPlayCards(group) {
        let cardType = ["", "", "", "", "", "五连顺", "六连顺", "七连顺", "八连顺", "九连顺", "十连顺", "十一连顺", "十二连顺",];
        //隐藏出牌按钮
        this.layerHandCards.changeBtn(false);
        //当前出牌数据
        TableInfo.current = null;
        TableInfo.current = group;
        if (TableInfo.idx == group.idx) {
            this.autoStatus = group.auto;
            this.layerHandCards.removeHandsCard(group.cards);
        }

        //玩家自身无能出的牌 提示 隐藏
        this.sprDisnable.active = false;
        this._delayTime = 7;
        this.players[TableInfo.realIdx[group.idx]].showCard(group);
        this._status = QUEUE_STATUS.DONE;
    }
    /**显示提示牌 */
    showTipsCard(data) {
        this.tipsCardPrefab.refreshCard(data.cards);
    }
    roundSummary(data) {
        //隐藏托管
        if (TableInfo.turn >= 10)
            this.autoStatus = false;
        //删除提示牌
        if (this.tipsCardPrefab)
            this.tipsCardPrefab.removeCards()

        this.players.forEach((player, i) => {
            player.removeDropCard();
        });
        TableInfo.zhuang = null;
        TableInfo.baodan = customConfig.person == 2 ? [false, false] : [false, false, false];
        // TableInfo.endGame = data.finish;

        TableInfo.status = GameConfig.GameStatus.SUMMARY;
        this.btnExit.active = TableInfo.turn == 0 || TableInfo.turn >= 10;
        // this.btnExit.active = true;
        let musicUrl = data.winner == TableInfo.idx ? "audio_win.mp3" : "audio_lose.mp3";
        if (this.playManageAudio)
            this.playManageAudio(musicUrl);

        this.node.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.callFunc(() => {
                let summary = cc.instantiate(this.summaryPrefab);
                this.node.addChild(summary, 2, "roundSummary")
                summary.getComponent("ModuleSummary07").initData(data);

                data.players.forEach((player, i) => {
                    //todo 玩家当前分数
                    // if (player.idx == TableInfo.idx)
                    //     GameConfig.GameCurrentScore = player.wallet;

                    if (this.players[TableInfo.realIdx[player.idx]]) {
                        this.players[TableInfo.realIdx[player.idx]].initPlayer();
                        this.players[TableInfo.realIdx[player.idx]].wallet = player.wallet;
                        this.players[TableInfo.realIdx[player.idx]].summaryShowCard(player.hands);
                    }
                });
            })
        ));
        this._status = QUEUE_STATUS.DONE;
        this.scheduleOnce(() => {
            Connector.gameMessage(ROUTE.CS_GAME_READY, { readyStatus: 1 });
        }, 9)

    }

    /**重连 */
    reconnect(data) {
        //TODO
        // data.currentPlayer = data.idx
        TableInfo.baodan = data.options.gameType.indexOf("SOLO") != -1 ? [false, false] : [false, false, false];
        TableInfo.zhuang = data.zhuang;
        TableInfo.firstPlay = false;
        TableInfo.status = data.status;

        this.initTable(data);
        data.players.forEach(player => {
            if (player && player.ready != null) {
                this.players[TableInfo.realIdx[player.idx]].activeReady(player.ready != 0);
                this.players[TableInfo.realIdx[player.idx]].activeNiao(player);
                this.players[TableInfo.realIdx[player.idx]].cardCount(player.hands);
            }
        });

        if (data.ready != null) {
            this.btnBirdReady.active = data.ready == 0;
            this.btnNormalReady.active = data.ready == 0;
        }
        if (data.vote) {
            this.gameVote(data);
            //this.nodeVote.getComponent("ModuleDissolve07").voteInit(data);
        }
        if (data.status == GameConfig.GameStatus.WAIT || data.status == GameConfig.GameStatus.PREPARE) {
            this.btnExit.active = TableInfo.turn == 0 || TableInfo.turn >= 10;
            return;
        }
        if (data.status == GameConfig.GameStatus.SUMMARY) {
            // this.btnExit.active = true;
            this.btnExit.active = TableInfo.turn == 0 || TableInfo.turn >= 10;

            return;
        }
        this.btnExit.active = false;
        data.players.forEach(player => {
            this.players[TableInfo.realIdx[player.idx]].activeAutoPlay(player.auto);
            //隐藏准备按钮
            this.players[TableInfo.realIdx[player.idx]].activeReady(false);
            if (TableInfo.idx == player.idx)
                this.autoStatus = player.auto;
            //报单
            if (player.alert) {
                TableInfo.baodan[player.idx] = true;
                this.players[TableInfo.realIdx[player.idx]].activeBaodan(true);
            }
            if (data.currentCard != null && player.idx == data.currentCard.idx)
                this.showPlayCards(data.currentCard);
        });
        TableInfo.current = data.current;
        this.showAction(data.currentPlayer);
        this.initHands(data, true);
        data.players.forEach((player, i) => {
            if (player != null && player.idx == data.currentPlayer) {
                this.playCard(player);
            }
        });

        this.btnBirdReady.active = false;
        this.btnNormalReady.active = false;
    }

    changeStatus(data) {
        if (TableInfo.idx < 0)
            return;
        let idx = TableInfo.realIdx[data.idx];
        if (this.players[idx]) {
            this.players[idx].activeOffline(data.offline)
        }
        this._status = QUEUE_STATUS.DONE;

    }
    /**点击取消托管 */
    cancelAuto() {
        this.autoStatus = false;
        this._status = QUEUE_STATUS.DONE;
    }
    onClickCancelAuto() {
        Connector.gameMessage(ROUTE.CS_CANCEL_AUTO, {});
    }
}
