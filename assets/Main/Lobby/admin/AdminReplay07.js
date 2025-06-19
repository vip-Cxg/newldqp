let ROUTE = require('ROUTE');
let db = require('DataBase');
let cache = require('Cache');
let tbInfo = require('TableInfo');
let audioCtrl = require("audio-ctrl");
const { GameConfig } = require('../../../GameBase/GameConfig');
const utils = require('../../../Main/Script/utils');
let posHead = [
    cc.v2(-500, -234),
    cc.v2(500, 122),
    cc.v2(-500, 122)
];
let customConfig = {
    ext: true,
    show: true,
    black: true,
    bird: true,
    rand: true,
    four: true,
    aaa: true,
    limit: true,
    person: 2,
    clan: true,
    turn: 10
};
const FINAL_XI_POS = [
    cc.v2(-522, -234),
    cc.v2(522, 122),
    cc.v2(-522, 122)
];
cc.Class({
    extends: cc.Component,

    properties: {
        _delayTime: 0,
        bgCount: [cc.Layout],
        btnOperate: [cc.Button],
        sprProgress: cc.Sprite,
        lblSpeed: cc.Label,
        lblRoomId: cc.Label,
        // lblTime: cc.Label,
        lblTurn: cc.Label,
        lblRule: cc.Label,
        nodeRule: cc.Node,
        exitBtn: cc.Node,
        prePlayerInfo: cc.Prefab,
        bgTable: cc.Node,
        nodePlayerInfo: [],
        imgPass: [cc.Node],
        nodeHands: [cc.Node],
        dropCards: [cc.Node],
        prePlayCards: cc.Prefab,
        hands: [],
        preScore: cc.Prefab,
        lblReDate: cc.Label,
        preCoin: cc.Prefab,
        summaryPrefab: cc.Prefab,

        debug: true
    },
    initData(data, replayID, userID) {
        console.log('--------------', data, replayID, userID)
        GameConfig.CurrentGameType = data;
        this.replayID = replayID;
        this.userID = userID;
    },
    // use this for initialization
    onLoad  () {
        this.hands = [null, null, null, null];
        // if (this.debug) {
        //     cc.loader.loadRes('replayData.json', (err, json) => {
        //         if (!err) {
        //             this._queueGameMsg = [];
        //             this._queueGameMsg = json.json;
        //             this.msgCount = this._queueGameMsg.length;
        //         }
        //     });
        // } else {
        this._queueGameMsg = [];
        this._queueGameMsg = cache.replayData;
        this.msgCount = this._queueGameMsg.length;
        // }
        this.speed = 1;
        this.node.on(GameConfig.GameEventNames.REPLAY_BACK_HALL,this.quit,this);

        this.btnOperate[1].node.active = false;
        this.schedule(this.gameMsgSchedule.bind(this), 0.2);
        cc.director.getScheduler().setTimeScale(this.speed);
    },

    resume  () {
        cc.director.getScheduler().resumeTarget(this);
        this.btnOperate[0].node.active = true;
        this.btnOperate[1].node.active = false;
    },

    pause  () {
        cc.director.getScheduler().pauseTarget(this);
        this.btnOperate[0].node.active = false;
        this.btnOperate[1].node.active = true;
    },

    quit  () {
        this.node.off(GameConfig.GameEventNames.REPLAY_BACK_HALL,this.quit,this);
        cache.replayData = [];
        cc.director.getScheduler().setTimeScale(1);
        cc.director.getScheduler().unscheduleAllForTarget(this);
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },

    playSpeed  (event, data) {
        let num = parseInt(data);
        // if(cc.director.getScheduler().isTargetPaused(this)){
        //     cc.log('====>3');
        //     this.resume();
        // }
        // cc.log('====>4');
        this.speed = (num == 1) ? (this.speed - 0.2) : (this.speed + 0.2);
        if (this.speed > 1.6)
            this.speed = 1.6;
        if (this.speed < 0.4)
            this.speed = 0.4;
        this.lblSpeed.string = '当前速度: x' + this.speed.toFixed(1);
        cc.director.getScheduler().setTimeScale(this.speed);
    },

    gameMsgSchedule  (dt) {
        // this.lblTime.string = new Date().format("hh:mm");
        if (this._delayTime > 0) {
            this._delayTime--;
            return;
        }
        this.sprProgress.fillRange = 1 - (this._queueGameMsg.length / this.msgCount);
        if (this._queueGameMsg.length <= 0)
            return;
        let msg = this._queueGameMsg.shift();
        let voice = this.node.getComponent("BgTableAudioCtr07");
        switch (msg.route) {
            case ROUTE.SC_RECORD:
                this.initTable(msg.data);
                break;
            case ROUTE.SC_PLAY_CARD:
                this.showBln(msg.data.idx);
                break;
            case ROUTE.SC_SHOW_CARD:
                this.showPlayCards(msg.data);
                break;
            case ROUTE.SC_PASS_CARD:
                this.showPass(msg.data);
                break;
            case ROUTE.SC_SCORE:
                this.scoreFly(msg.data);
                break;
            // case ROUTE.SC_ALERT:
            //     this.acBaodan(msg.data);
            //     break;
            case ROUTE.SC_ROUND_SUMMARY:
                this.roundSummary(msg.data);
                break;
        }

    },

    roundSummary  (data) {
        tbInfo.zhuang = null;
        if (data.winner == tbInfo.idx) {
            this.playManageAudio(`audio_win.mp3`);
        } else {
            ;
            this.playManageAudio(`audio_lose.mp3`);
        }
        this.node.runAction(cc.sequence(
            cc.delayTime(1.5),
            cc.callFunc(() => {


                let summary = cc.instantiate(this.summaryPrefab);
                this.node.addChild(summary, 2, "roundSummary")
                summary.getComponent("ModuleSummary07").initData(data,true);

                // this.summaryBtn.active = true;
                this.exitBtn.zIndex = 999;
                data.players.forEach((player, i) => {
                    this.nodePlayerInfo[tbInfo.realIdx[player.idx]].getComponent("AdminHead07").activeBaodan(false);
                    this.nodePlayerInfo[tbInfo.realIdx[player.idx]].getComponent("AdminHead07").lblZongjifen.string = utils.formatGold(player.wallet,2) ;
                    this.nodePlayerInfo[tbInfo.realIdx[player.idx]].getComponent("AdminHead07").hideClock();

                    // if (player.idx != tbInfo.idx) {
                    let nodePlayCards = cc.instantiate(this.prePlayCards);
                    nodePlayCards.scale = 1;
                    nodePlayCards.parent = this.dropCards[tbInfo.realIdx[player.idx]].node;
                    let empGroup = JSON.parse(JSON.stringify(player.hands));
                    nodePlayCards.getComponent("LayoutShowCards07").initRemainCard(empGroup);
                    // }
                });
            })
        ));
    },

    showPlayCards  (group) {
        let realIdx = tbInfo.realIdx[group.idx];
        tbInfo.current = null;
        tbInfo.current = group;
        this._delayTime = 4;
        let url = cc.url.raw(`resources/Audio/Common/playCard.mp3`);
        audioCtrl.getInstance().playSFX(url);
        this.dropCards.forEach((ground, i) => {
            ground.destroyAllChildren();
            this.imgPass[i].active = false;
        });
        this.nodePlayerInfo[realIdx].getComponent("AdminHead07").activeAutoPlay(group.auto);

        let nodePlayCards = cc.instantiate(this.prePlayCards);
        
        if (realIdx == 0)
            nodePlayCards.scale = 1;
        nodePlayCards.parent = this.dropCards[realIdx];
        nodePlayCards.getComponent("LayoutShowCards07").init(group);
        let audioCtr = this.bgTable.getComponent("BgTableAudioCtr07");
        audioCtr.playVoice(group, tbInfo.players[group.idx].prop.sex);
        this.removeHands(group);
    },

    removeHands  (data) {
        let realIdx = tbInfo.realIdx[data.idx];
        data.cards.forEach(card => {
            for (let i = 0; i < this.hands[realIdx].length; i++) {
                let idx = this.hands[realIdx].findIndex(c => card == c);
                if (idx >= 0) {
                    this.hands[realIdx].splice(idx, 1);
                    return;
                }
            }
        });
        let cards = this.nodeHands[realIdx].getComponent("ReHands07");
        cards.refreshHandCards(this.hands[realIdx], true);
    },

    showPass  (data) {
        this._delayTime = 3;
        let voice = this.bgTable.getComponent("BgTableAudioCtr07");
        voice.PassVoice(1);
        let nodePass = this.imgPass[tbInfo.realIdx[data.idx]];
        nodePass.active = true;
        nodePass.scale = 0;
        nodePass.runAction(cc.scaleTo(0.2, 1));
    },

    showBln  (idx) {
        this.nodePlayerInfo.forEach(node => node.getComponent("AdminHead07").nodeBln.active = false);
        this.nodePlayerInfo[tbInfo.realIdx[idx]].getComponent("AdminHead07").activeBln(true);
    },

    initRealIdx  (data) {
        let idx = null;
        data.players.forEach((player, i) => {
            //test
            if (player.prop.pid == db.player.id)
                //TODO:TESTCOD
                // if (player.prop.pid == 90008)
                idx = player.idx;
        });
        if (idx == null) {
            idx = data.players[0].idx;
        }
        tbInfo.idx = idx;

        let realIdx = [0, 0, 0];
        realIdx[idx] = 0;
        realIdx[(idx + 1) % 3] = 1;
        if (tbInfo.config.person == 2) {
            realIdx[(idx + 2) % 3] = 1;
        } else {
            realIdx[(idx + 2) % 3] = 2;
        }
        tbInfo.realIdx = realIdx;
    },

    initTable  (data) {
        data.turn = data.turn ? data.turn : 0;
        tbInfo.idx = data.idx;
        tbInfo.config = customConfig;
        tbInfo.tid = data.tid;
        tbInfo.current = data.current;
        tbInfo.zhuang = data.zhuang;
        this.lblReDate.string = cache.replayTime ? "当时日期：" + cache.replayTime : '';
        this.lblRoomId.string = data.tid + "";
        this.setTurn(data);
        this.initRealIdx(data);
        this.initPlayers(data);
    },

    playSE  () {
        // audioCtrl.getInstance().setSFXVolume(db.getFloat(db.STORAGE_KEY.SET_SOUND, 1));
        // audioCtrl.getInstance().playSFX(this.sfxClip);
    },

    initPlayers  (data) {
        this.nodePlayerInfo = new Array(3);
        tbInfo.players = new Array(3);
        tbInfo.playerHead = new Array(3);
        let self = this;
        tbInfo.players = data.players;
        data.players.forEach((player, i) => {
            if (player != null) {
                let nodePlayer = cc.instantiate(this.prePlayerInfo);
                nodePlayer.parent = this.bgTable;
                nodePlayer.on(cc.Node.EventType.TOUCH_END, () => {
                    utils.pop(GameConfig.pop.AdminPunishPage, (node) => {
                        node.getComponent('AdminPunishPage').renderUI(self.replayID, self.userID);
                    });
                }, this)
                let playerInfo = nodePlayer.getComponent("AdminHead07");
                playerInfo.init(data.players[player.idx], i);
                this.nodePlayerInfo[tbInfo.realIdx[player.idx]] = nodePlayer;
                this.initHands(player);
            }
        });
    },

    initHands  (data) {
        let realIdx = tbInfo.realIdx[data.idx];
        data.hands.sort((a, b) => a % 100 - b % 100);
        this.hands[realIdx] = data.hands;
        this.hands[realIdx].reverse();
        let hands = this.nodeHands[realIdx].getComponent("ReHands07");
        hands.refreshHandCards(this.hands[realIdx], true);
    },

    showRule  () {
        this.nodeRule.active = !this.nodeRule.active;
    },


    setTurn  (data) {
        tbInfo.turn = data.turn;
        this.lblTurn.string = data.turn + "局";
    },

    scoreFly  (data) {
        this.dropCards.forEach((ground, i) => {
            ground.removeAllChildren(true);
            this.bgCount[i].node.removeAllChildren(true);
            this.imgPass[i].active = false;
        });
        let person = data.from.length;
        let url = cc.url.raw(`resources/Audio/Common/addScore.mp3`);
        audioCtrl.getInstance().playSFX(url);
        let spawn = [];
        let endPos = FINAL_XI_POS[tbInfo.realIdx[data.to[0].idx]];
        try {
            let playerAdd = this.nodePlayerInfo[tbInfo.realIdx[data.to[0].idx]].getComponent("AdminHead07");
            playerAdd.showBombScores(tbInfo.realIdx[data.to[0].idx], data.to[0].wallet, data.to[0].score, () => {
                // for (let i = 0; i < 20; i++) {
                //     let nodeCoin = cc.instantiate(this.preCoin);
                //     nodeCoin.parent = this.node;
                //     nodeCoin.setPosition(posHead[tbInfo.realIdx[data.from[i % person].idx]]);
                //     let pos = cc.v2(Math.random() * 100 - 50, Math.random() * 100 - 50);
                //     spawn.push(cc.targetedAction(nodeCoin,
                //         cc.sequence(
                //             cc.delayTime(0.1 * Math.random()),
                //             cc.spawn(
                //                 cc.moveBy(0.3, pos),
                //                 cc.scaleTo(0.3, 0.7)
                //             ),
                //             cc.moveTo(0.4, endPos),
                //             cc.callFunc(function () {
                //                 this.destroy();
                //             }, nodeCoin)
                //         )
                //     ));
                // }
                // //分数隐藏后飘金币动画
                // this.node.runAction(cc.spawn(spawn));
            });
            data.from.forEach((f, i) => {
                let dec = this.nodePlayerInfo[tbInfo.realIdx[f.idx]].getComponent("AdminHead07");
                dec.showBombScores(tbInfo.realIdx[f.idx], f.wallet, f.score);
            });

        } catch (ex) {

        }
    },
    playManageAudio  (msg) {
        let game = db.gameType < 10 ? ("Game0" + db.gameType) : ("Game" + db.gameType);
        if (!cc.sys.isNative) {
            return;
        }
        let url = jsb.fileUtils.getWritablePath() + "remote-asset/Audio/" + game + "/" + msg;
        cc.loader.load(url, function (err, data) {
            // let audioCtrl = require("audio-ctrl");
            audioCtrl.getInstance().playSFX(data);
        });
    },
});

