let ROUTE = require('ROUTE');
let db = require('DataBase');
let cache = require('Cache');
let tbInfo = require('TableInfo');
let utils = require('../../Script/utils');
let audioCtrl = require("audio-ctrl");
const { GameConfig } = require('../../../GameBase/GameConfig');
const FINAL_SCORE_POS = [
    cc.v2(-490, -294),
    cc.v2(526, 121),
    cc.v2(-61, 295),
    cc.v2(-492, 70)
];
cc.Class({
    extends: cc.Component,

    properties: {
        _delayTime: 0,
        lblCurrentScore: cc.Label,
        bgCount: [cc.Layout],
        btnOperate: [cc.Button],
        sprProgress: cc.Sprite,
        lblSpeed: cc.Label,
        lblTurn: cc.Label,
        lblRule: cc.Label,
        nodeRule: cc.Node,
        prePlayerInfo: cc.Prefab,
        bgTable: cc.Node,
        nodePlayerInfo: [],
        imgPass: [cc.Node],
        nodeHands: [cc.Node],
        dropCards: [cc.Node],
        prePlayCards: cc.Prefab,
        hands: [],
        preCoin: cc.Prefab,
        preScore: cc.Prefab,
        // nodeSummaryItem:cc.Prefab,
        layerRemainCard: cc.Node,
        nodeRemainCard: cc.Prefab,
        lblReDate: cc.Label,
        summaryPrefab: cc.Prefab,
        replayID: null,
        userID: null,
    },
    initData(data, replayID, userID) {
        console.log('--------------', data, replayID, userID)
        GameConfig.CurrentGameType = data;
        this.replayID = replayID;
        this.userID = userID;
    },
    // use this for initialization
    onLoad() {
        this.hands = [null, null, null, null];
        this.addEvents()
        this.initChat()
        this.speed = 1;
        this._queueGameMsg = [];
        this._queueGameMsg = cache.replayData;
        this.msgCount = this._queueGameMsg.length;
        this.btnOperate[1].node.active = false;
        cc.director.getScheduler().schedule(this.gameMsgSchedule, this, 0.2);
        cc.director.getScheduler().setTimeScale(this.speed);
    },
    /**添加监听事件 */
    addEvents() {
        this.node.on(GameConfig.GameEventNames.ZD_BACK_HALL, this.quit, this);
    },
    /**移除监听事件 */
    removeEvents() {

        this.node.off(GameConfig.GameEventNames.ZD_BACK_HALL, this.quit, this);
    },
    resume() {
        cc.director.getScheduler().resumeTarget(this);
        this.btnOperate[0].node.active = true;
        this.btnOperate[1].node.active = false;
    },

    pause() {
        cc.director.getScheduler().pauseTarget(this);
        this.btnOperate[0].node.active = false;
        this.btnOperate[1].node.active = true;
    },

    quit() {
        cache.replayData = [];
        cc.director.getScheduler().setTimeScale(1);
        cc.director.getScheduler().unscheduleAllForTarget(this);
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },

    playSpeed(event, data) {
        if (cc.director.getScheduler().isTargetPaused(this))
            this.resume();
        this.speed = (data == 1) ? (this.speed - 0.2) : (this.speed + 0.2);
        if (this.speed > 1.6)
            this.speed = 1.6;
        if (this.speed < 0.4)
            this.speed = 0.4;
        this.lblSpeed.string = '当前速度: x' + this.speed.toFixed(1);
        cc.director.getScheduler().setTimeScale(this.speed);
    },

    gameMsgSchedule(dt) {
        if (this._delayTime > 0) {
            this._delayTime--;
            return;
        }
        this.sprProgress.fillRange = 1 - (this._queueGameMsg.length / this.msgCount);
        if (this._queueGameMsg.length <= 0)
            return;
        let msg = this._queueGameMsg.shift();
        let voice = this.node.getComponent("ModuleAudioCtr_09");
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
            case ROUTE.SC_ACTION:
                this.addXi(msg.data)
                break;
            case ROUTE.SC_SCORE:
                this.scoreFly(msg.data);
                break;
            case ROUTE.SC_FINISH:

                let idx = tbInfo.realIdx[msg.data.idx];
                if (msg.data.idx == tbInfo.idx)
                    tbInfo.status = GameConfig.GameStatus.FINISH;
                this.nodePlayerInfo[idx].getComponent("AdminHead09").activeBaodan(false);
                this.nodePlayerInfo[idx].getComponent("AdminHead09").finishAnim(msg.data.finish);
                tbInfo.players[idx].finish = msg.data.finish;
                break;
            case ROUTE.SC_ROUND_SUMMARY:
                this.roundSummary(msg.data);
                break;
            case ROUTE.SC_GAME_CHAT:
                if (this.chat != null) {
                    this.chat.contentFly(msg.data);
                    this._delayTime = 10

                }
                break;
        }

    },

    roundSummary(data) {
        this._delayTime = 10;
        let num = [];
        data.players.forEach((player) => {
            let playerInfo = this.nodePlayerInfo[tbInfo.realIdx[player.idx]].getComponent("AdminHead09");
            // playerInfo.lblZongjifen.string = "" + (player.scores[4] + player.scores[3]);
            playerInfo.lblJifen.string = "0";
            playerInfo.lblXifen.string = "0";
        });
        let summary = cc.instantiate(this.summaryPrefab);
        this.node.addChild(summary, 2, "roundSummary")
        summary.getComponent("ModuleSummary09").initData(data, true);
        tbInfo.bao = -1;
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

    showPlayCards(data) {
        if (data.action) {
            this.addXi(data.action)
            // if ([3, 4, 5].includes(data.action.bomb))
            //     this.bombAnim(data.action.bomb);
        }
        let group = data.currentCard ? data.currentCard : data;
        let realIdx = tbInfo.realIdx[group.idx];
        tbInfo.current = null;
        tbInfo.current = group;
        this._delayTime = 4;
        this.refreshTableScore(group);
        let url = cc.url.raw(`resources/Audio/Common/playCard.mp3`);
        audioCtrl.getInstance().playSFX(url);
        this.dropCards.forEach((ground, i) => {
            ground.destroyAllChildren();
            this.imgPass[i].active = false;


            // this.nodePlayerInfo[i].getComponent("AdminHead09").activeAuto(false);
        });
        let nodePlayCards = cc.instantiate(this.prePlayCards);
        nodePlayCards.parent = this.dropCards[realIdx];
        nodePlayCards.getComponent("ModuleShowCards_09").init(group, true);

        //显示是否为托管状态打出
        this.nodePlayerInfo[realIdx].getComponent("AdminHead09").activeAuto(group.auto);


        let audioCtr = this.bgTable.getComponent("ModuleAudioCtr_09");
        audioCtr.playVoice(group, tbInfo.players[group.idx].prop.sex);


        this.removeHands(group);
    },

    removeHands(data) {
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
        let cards = this.nodeHands[realIdx].getComponent("ModuleHands_09");
        cards.refreshHandCards(this.hands[realIdx], true);
    },

    showPass(data) {
        this.nodePlayerInfo[tbInfo.realIdx[data.idx]].getComponent("AdminHead09").activeAuto(data.auto);
        this._delayTime = 3;
        let voice = this.bgTable.getComponent("ModuleAudioCtr_09");
        voice.PassVoice(this.nodePlayerInfo[tbInfo.realIdx[data.idx]].sex);
        let nodePass = this.imgPass[tbInfo.realIdx[data.idx]];
        nodePass.active = true;
        nodePass.scale = 0;
        nodePass.runAction(cc.scaleTo(0.2, 1));
    },

    showBln(idx) {
        this.nodePlayerInfo.forEach(node => node.getComponent("AdminHead09").nodeBln.active = false);
        this.nodePlayerInfo[tbInfo.realIdx[idx]].getComponent("AdminHead09").activeBln(true);
    },

    initRealIdx(data) {
        let idx = null;
        data.players.forEach((player, i) => {
            //test
            if (player.prop.pid == db.player.id)
                idx = player.idx;
        });
        if (idx == null) {
            idx = 0;
        }
        tbInfo.idx = idx; //data.idx;
        let realIdx = [0, 0, 0, 0];
        realIdx[idx] = 0;
        realIdx[(idx + 1) % 4] = 1;
        realIdx[(idx + 2) % 4] = 2;
        realIdx[(idx + 3) % 4] = 3;
        tbInfo.realIdx = realIdx;
    },

    initTable(data) {
        data.turn = data.turn ? data.turn : 0;
        tbInfo.idx = data.idx;
        tbInfo.config = data.config;
        tbInfo.tid = data.tid;
        tbInfo.current = data.current;
        // this.lblReDate.string = db.gameDate;
        this.setTurn(data);
        this.initRealIdx(data);
        // this.initRule(data);
        this.initPlayers(data);
        data.players.forEach(player => {
            if (player.bao == true) {
                tbInfo.bao = player.idx;
            }
        })
    },

    initPlayers(data) {
        this.nodePlayerInfo = new Array(4);
        tbInfo.players = new Array(4);
        tbInfo.playerHead = new Array(4);
        tbInfo.players = data.players;
        let self = this;
        data.players.forEach((player, i) => {
            cc.log(player);
            if (player != null) {
                let nodePlayer = cc.instantiate(this.prePlayerInfo);
                nodePlayer.parent = this.bgTable;
                nodePlayer.sex = data.players[i].prop.sex;
                let playerInfo = nodePlayer.getComponent("AdminHead09");
                nodePlayer.on(cc.Node.EventType.TOUCH_END, () => {
                    utils.pop(GameConfig.pop.AdminPunishPage, (node) => {
                        node.getComponent('AdminPunishPage').renderUI(self.replayID, self.userID);
                    });
                }, this)
                playerInfo.init(data.players[player.idx], true);
                this.nodePlayerInfo[tbInfo.realIdx[player.idx]] = nodePlayer;
                this.initHands(player);
            }
        });
    },

    initHands(data) {
        let realIdx = tbInfo.realIdx[data.idx];
        data.hands.sort((a, b) => a % 100 - b % 100);
        this.hands[realIdx] = data.hands;
        this.hands[realIdx].reverse();
        let hands = this.nodeHands[realIdx].getComponent("ModuleHands_09");
        hands.refreshHandCards(this.hands[realIdx], true);
    },

    showRule() {
        this.nodeRule.active = !this.nodeRule.active;
    },

    initRule(data) {
        let config = data.config;
        let strUrl = '';
        strUrl += tbInfo.config.turn + '局\n';
        if (tbInfo.config.plus)
            strUrl += '喜分算加分\n';
        else
            strUrl += '喜分算乘分\n';
        if (tbInfo.config.shun)
            strUrl += '可打顺子\n';
        if (tbInfo.config.bomb)
            strUrl += '三个炸弹算一个喜分';
        this.lblRule.string = strUrl;
    },

    addXi(data) {

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
        let endPos = coinPos[tbInfo.realIdx[data.to[0].idx]]
        let scores = data.to[0].score;
        let numCoin = scores * 5;


        try {
            spawn.push(cc.delayTime(0.1));
            for (let i = 0; i < numCoin; i++) {
                let nodeCoin = cc.instantiate(this.preCoin);
                nodeCoin.parent = this.node;

                nodeCoin.setPosition(coinPos[tbInfo.realIdx[data.from[i % person].idx]]);
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
            nodeScore.opacity = 0;
            nodeScore.scale = 0.2;
            nodeScore.position = endPos;
            let playerAdd = this.nodePlayerInfo[tbInfo.realIdx[data.to[0].idx]].getComponent("AdminHead09");
            data.from.forEach((f, i) => {
                let dec = this.nodePlayerInfo[tbInfo.realIdx[f.idx]].getComponent("AdminHead09");
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
                            playerAdd.lblXifen.string = "" + data.to[0].bomb;//(parseInt(playerAdd.lblXifen.string) + scores);
                            data.from.forEach((f, i) => {
                                playerDec[i].lblXifen.string = "" + f.bomb;
                            });
                        } catch (ex) {

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

        }
        try {
            this.node.runAction(cc.sequence(seq));
        } catch (ex) {

        }
    },

    scoreFly(data) {

        if (data.action) {
            this.addXi(data.action)
        }
        tbInfo.current = null;
        this.dropCards.forEach((ground, i) => {
            ground.removeAllChildren(true);
            this.bgCount[i].node.removeAllChildren(true);
            this.imgPass[i].active = false;
        });
        if (this.lblCurrentScore.string == "0")
            return;
        let url = cc.url.raw(`resources/Audio/Common/addScore.mp3`);
        audioCtrl.getInstance().playSFX(url);
        this.lblCurrentScore.string = "0";
        data.scores.forEach((v, i) => {
            this.nodePlayerInfo[tbInfo.realIdx[i]].getComponent("AdminHead09").lblJifen.string = "" + v.base;
            tbInfo.players[tbInfo.realIdx[i]].scores = v;
        });

    },
    initChat() {
        cc.loader.loadRes("GameBase/preChat", (err, prefab) => {
            if (!err) {
                this.chat = cc.instantiate(prefab).getComponent('ModuleChat');
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
            } else {
                this.initChat();
            }
        });
    },

    setTurn(data) {
        tbInfo.turn = data.turn;
        this.lblTurn.string = data.turn + " 局";
    },
    onDestroy() {
        this.removeEvents();
    }

});

