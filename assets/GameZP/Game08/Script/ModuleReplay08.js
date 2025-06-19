let ROUTE = require('../../../Main/Script/ROUTE');
let db = require('../../../Main/Script/DataBase')//require('DataBase');
let cache = require("../../../Main/Script/Cache")// require('Cache');
let TableInfo = require('TableInfo');
let audioCtrl = require('audio-ctrl');
const { GameConfig } = require('../../../GameBase/GameConfig');
let PLAY_POS = [
    cc.v2(-502, -150),
    cc.v2(502, 130),
    cc.v2(-502, 130)
];  //nodePlayer 坐标
let SHOW_POS = [
    { begin: cc.v2(-424, -168), end: cc.v2(-1, 143) },
    // { begin: cc.v2(446, 152), end: cc.v2(195, 132) },
    { begin: cc.v2(-446, 152), end: cc.v2(-195, 132) }
];

let customConfig = {
    yhz: true,
    piao: true,
    person: 3,
    clan: true,
    turn: 10
};
const POS_IMG_QUEST = [
    cc.v2(-10, 86),
    // cc.v2(310, 158),
    cc.v2(-310, 158)
];
const POS_GET_CARD = [
    { begin: cc.v2(0, 174), end: cc.v2(0, 0) },
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
    x: 32,
    y: 40
};
let FAN = {
    TH: 0x1,//天胡
    DH: 0x2,//地胡
    ZM: 0x4//红胡
};
cc.Class({
    extends: cc.Component,

    properties: {
        _queueGameMsg: [],
        player: cc.Prefab,
        lblTurn: cc.Label,
        lblDeck: cc.Label,
        lblTid: cc.Label,
        card: cc.Prefab,
        layoutShowCard: cc.Layout,
        show: cc.Prefab,
        nodehands: [cc.Layout],
        nodeQuestImg: cc.Label,
        spriteFrameQuest: [cc.SpriteFrame],
        btnOperate: [cc.Node],
        preRoundSummary: cc.Prefab,
        preGameSummary: cc.Prefab,
        lblSpeed: cc.Label,
        imgProgress: cc.Sprite,
        currentTurn: 0
    },

    playManageAudio(msg) {
        let game = "Game08";// db.gameType < 10 ? ("Game0" + db.gameType) : ("Game" + db.gameType);
        if (!cc.sys.isNative) {
            return;
        }
        let url = jsb.fileUtils.getWritablePath() + "remote-asset/Audio/" + game + "/" + msg;
        cc.loader.load(url, function (err, data) {
            let audioCtrl = require("audio-ctrl");
            audioCtrl.getInstance().playSFX(data);

        });
    },


    initData(data) {

        GameConfig.CurrentGameType = data;
    },

    // use this for initialization
    onLoad() {

        // return;
        this._queueGameMsg = [];
        this._queueGameMsg = cache.replayData;

        this.length = this._queueGameMsg.length;

        this.layoutShowCard.node.zIndex = 20;


        this.lblSpeed.string = '当前速度: x1';
        TableInfo.zhao = [];
        this.hands = [null, null];
        this.nodehands.forEach((layout, i) => {
            this.hands[i] = layout.node.getComponent('BaseHandZP');
        });
        this.speed = 1;
        //cache.hideMask();
        TableInfo.playerHead = [null, null];
        TableInfo.realIdx = [null, null];
        TableInfo.players = [null, null];
        this.players = [null, null];

        let windowNode = cc.find("Canvas")
        let palyerPos = [
            cc.v2(139 / 2 - windowNode.width / 2, -170),
            // cc.v2(windowNode.width / 2 - 139 / 2, 110),
            cc.v2(139 / 2 - windowNode.width / 2, 220),
        ]
        for (let i = 0; i < 2; i++) {
            let nodePlayer = cc.instantiate(this.player);
            nodePlayer.parent = this.node;
            nodePlayer.position = palyerPos[i];
            nodePlayer.zIndex = 1;
            this.players[i] = nodePlayer.getComponent('ModulePlayer08');
            // this.players[i].init(player);

        }
        this.node.on(GameConfig.GameEventNames.REPLAY_BACK_HALL, this.quit, this);
        this.node.on(GameConfig.GameEventNames.REPLAY_CONTINUE, this.onReplayNext, this);
        this.node.on(GameConfig.GameEventNames.REPLAY_SHOW_GAME_SUMMARY, this.showGameSummary, this);

        setTimeout(() => {
            this.schedule(this.gameMsgSchedule, 0.1);
        }, 500)
    },

    resume() {
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

    quit() {

        cache.replayData = null;
        this.node.off(GameConfig.GameEventNames.REPLAY_BACK_HALL, this.quit, this);
        cc.director.getScheduler().setTimeScale(1);
        cc.director.getScheduler().unscheduleAllForTarget(this);
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }

        let nodeSelect = cc.find('Canvas/gameSummary');
        if (nodeSelect) {
            nodeSelect.removeFromParent();
            nodeSelect.destroy();
        }
    },

    gameMsgSchedule() {
        // this.lblTime.string = "当前时间: " + new Date().format("hh:mm:ss");
        if (this._delayTime > 0) {
            this._delayTime--;
            return;
        }
        if (this._queueGameMsg.length <= 0)
            return;
        let msg = this._queueGameMsg.shift();
        this.imgProgress.fillRange = 1 - (this._queueGameMsg.length / this.length);
        // cc.log(msg);
        switch (msg.route) {
            case ROUTE.SC_GAME_DATA:
                TableInfo.options = msg.data.options;
                break;
            case 'SC_RECORD':
                this.record(msg.data);
                break;

            case ROUTE.SC_SHOW_CARD:
                this.showCard(msg.data);
                break;

            case ROUTE.SC_PLAY_CARD:
                this.playCard(msg.data);
                break;

            case ROUTE.SC_PASS_CARD:
                this.passCard(msg.data);
                break;

            case ROUTE.SC_ACTION:
                this.action(msg.data);
                break;
            case ROUTE.SC_DEAD:
                this.dead(msg.data);
                break;
            case ROUTE.SC_ROUND_SUMMARY:
                cc.director.getScheduler().unscheduleAllForTarget(this);
                this.roundSummary(msg.data);

                break;
            case ROUTE.SC_GAME_SUMMARY:
                cc.director.getScheduler().unscheduleAllForTarget(this);
                // this.roundSummary(msg.data);

                break;

            case ROUTE.SC_GET_CARD:
                cc.log(msg.data);
                this.getCard(msg.data);
                break;
            case ROUTE.SC_GAME_DRAW:
                this.gameDraw();
                break;
            default:
                cc.log(msg.route);
                break;
        }
    },
    record(data) {
        let idx = null;
        data.players.forEach((player, i) => {
            //TODO:TESTCOD
            if (player.prop.pid == 0)
                idx = player.idx;
        });
        if (idx == null) {
            idx = 0;
        }
        //idx = 0; //test
        TableInfo.idx = idx;
        TableInfo.zhuang = data.banker;
        // TableInfo.options = data.options;


        //设置玩家座位位置方位
        // if (TableInfo.options.person == 3) {
        //     this.realIdx = [0, 0, 0];
        //     this.realIdx[idx] = 0;
        //     this.realIdx[(idx + 1) % 3] = 1;
        //     this.realIdx[(idx + 2) % 3] = 2;
        // } else {
        this.realIdx = [0, 0];
        this.realIdx[idx] = 0;
        this.realIdx[(idx + 1) % 2] = 1;
        // }

        //玩家显示位置
        TableInfo.realIdx = this.realIdx;

        this.lblDeck.string = '19';
        this.lblTurn.string = '第' + data.round + "局";
        this.lblTid.string = '房间号: ' + data.tableID;
        data.players.forEach((player, i) => {
            let idx = TableInfo.realIdx[player.idx];
            this.players[idx].init(player, true);
            this.hands[idx].init(player.hands, true);
        });


    },

    gameDraw() {
        this._delayTime = 15;
        this.nodeQuestImg.node.position = POS_IMG_QUEST[0];
        this.nodeQuestImg.spriteFrame = this.spriteFrameQuest[6];
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

    playCard(data) {
        TableInfo.currentPlayer = data.idx;
        this.players.forEach((player) => {
            player.active(data);
        })
    },


    getCard(data) {
        let seq = [];
        let seq0 = [];
        this._delayTime = 6; //时间由动作决定
        let nodeCard;
        let idx = TableInfo.realIdx[data.idx];
        // if(data.idx == TableInfo.idx){
        nodeCard = cc.instantiate(this.show);
        nodeCard.getComponent('BaseCardZP').init(data.card, true);
        nodeCard.parent = this.node;
        //nodeCard.scale = 
        nodeCard.position = POS_GET_CARD[0].begin;
        let base = 0;
        let pao = 0;
        let arr = [];
        this.hands[idx]._hands.forEach((group, x) => {
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
                nodeHand.parent = this.hands[idx].node;
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
                this.hands[idx]._hands[node._pos.x].splice(node._pos.y, 1);
                this.hands[idx].sortHands();
                seq0.push(cc.targetedAction(node, cc.callFunc(() => {
                    node.destroy()
                }
                )));
            }
            this.hands[idx]._hands.splice(0, 0, arrCards);

        } else {
            nodeHand0 = cc.instantiate(this.card);
            nodeHand0.scale = 0.8;
            nodeHand0.parent = this.hands[idx].node;
            nodeHand0.getComponent('BaseCardZP').init(data.card);
            nodeHand0._card = data.card;
            nodeHand0.pao = false;
            nodeHand0.active = false;
            this.hands[idx]._hands[12].splice(0, 0, nodeHand0);
        }
        seq.push(cc.targetedAction(nodeCard, cc.sequence(
            cc.delayTime(0.3),
            cc.moveTo(0.3, SHOW_POS[idx].begin),
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
            this.hands[idx].sortHands();
        }));
        if (nodeHand0 != null) {
            seq.push(cc.callFunc(() => {
                nodeHand0.active = true;
            }))
        }
        //seq.push(cc.delayTime(0.5)); //TEST
        this.node.runAction(cc.sequence(seq));
        cc.log(this.hands[idx]._hands[7]);
        // } else {
        //     let idx0 = TableInfo.realIdx[data.idx];
        //     let nodeCard0;
        //     nodeCard0 = cc.instantiate(this.show);
        //     nodeCard0.getComponent('Card').init(data.card,true);
        //     nodeCard0.parent = this.node;
        //     //nodeCard.scale = 
        //     nodeCard0.position = POS_GET_CARD[idx0].begin;
        //     nodeCard0.runAction(cc.sequence(
        //         cc.delayTime(0.3),
        //         cc.moveTo(0.3,POS_GET_CARD[idx0].end),
        //         cc.delayTime(0.3),
        //         cc.callFunc(()=>{
        //             nodeCard0.destroy();   
        //         })
        //     ))
        // }

    },



    showCard(data) {
        let idx = TableInfo.realIdx[data.idx];
        this.players.forEach(player => {
            player.active(data);
        });
        this._delayTime = 4;
        let blin = data.src == 'DECK';
        if (data.src == 'PLAY') {
            this.hands[idx].removeHands(data.card);
            this.hands[idx].sortHands();
            TableInfo.currentPlayer = null;
        }
        //let sex = TableInfo.players[data.idx].prop.sex == 1 ? 'man': 'woman';
        this.players[idx].activeAutoPlay(data.auto)

        let sex = TableInfo.players[data.idx].prop.sex;// == 1 ? 'male' : 'famale';
        let audio = data.card + '.mp3';
        this.playManageAudio(`${sex}_${audio}`);
        //this._delayTime = 1;
        TableInfo.currentCard = data.card;

        this.layoutShowCard.node.stopAllActions();
        this.layoutShowCard.node.removeAllChildren();
        let node = cc.instantiate(this.show);
        node.parent = this.layoutShowCard.node;
        // node.scale = 0;
        node.position = (data.src == 'DECK' ? POS_SHOW_DECK.begin : SHOW_POS[idx].begin);
        node.getComponent('BaseCardZP').init(data.card, true, false, blin);
        node.runAction(
            //cc.place(data.src == 'DECK'?POS_SHOW_DECK.begin:SHOW_POS[idx].begin),
            cc.spawn(
                cc.moveTo(0.2, SHOW_POS[idx].end),
                cc.scaleTo(0.2, 1)
            )
        );
        this.currentCard = node;
        // this.players.forEach(player=>{ //呼吸灯
        //  player.active(data);
        // })
        if (data.deck != null)
            this.lblDeck.string = "" + data.deck + "";;
    },

    playAudio(data, kaizhao, fangjiao, qing) {
        let idx = TableInfo.realIdx[data.idx];
        let type = data.type;
        // cc.log( this.players[idx].ground.content);
        //let chongpao = this.players[idx].ground.content.findIndex(g=>g.type == 'pao' || g.type == 'ti');
        // cc.log('chongpao',chongpao);
        let sex = TableInfo.players[data.idx].prop.sex;// == 1 ? 'male' : 'famale';
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
            // cc.log('1111');
            type = 'chongpao';
        }
        // cc.log(data.type);
        // if(type == 'pao' && this.players[idx].prop.sex == 2)
        //     type = 'kaijiao';
        if ((data.hu & FAN.ZM) > 0) {
            type = 'zimo';
        }
        //cc.log('playAudioplayAudio',data.type)
        let audio = type + '.mp3';
        this.playManageAudio(`${sex}_${audio}`);
    },



    passCard(data) {
        this._delayTime = 10;
        //let idx = TableInfo.realIdx[data.idx];
        let idx = TableInfo.realIdx[data.idx];
        let card = cc.instantiate(this.show);
        card.getComponent('BaseCardZP').init(data.card, true);
        card.parent = this.node;
        card.zIndex = 20;
        card.position = SHOW_POS[idx].end;
        let qi = this.players[idx].newQi(data.card, false);
        let pos = this.players[idx].qi.position.add(qi)
        let endPos = this.players[idx].nodePlayer.position.add(pos);
        this.layoutShowCard.node.removeAllChildren();
        card.runAction(cc.sequence(
            cc.place(SHOW_POS[idx].end),
            cc.delayTime(0.5),
            cc.spawn(
                cc.moveTo(0.4, endPos),
                cc.scaleTo(0.4, 0.2)
            ),
            cc.callFunc(() => {
                qi.active = true;
            }),
            cc.callFunc(() => {
                card.destroy();
            })
        ))
    },


    action(data) {
        this._delayTime = 5;
        cc.log('action++++++++++++', data);
        let piao = false;
        //this._delayTime = data.idx == TableInfo.idx? 0 : 5;
        //this.layoutQuest.node.active = false;
        let idx = TableInfo.realIdx[data.idx];
        this.layoutShowCard.node.removeAllChildren();
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
                this.nodeQuestImg.string = '胡';
                break;
            default:
                cc.log(data.type);
        }
        switch (data.type) {
            case 'chi':
                this.nodeQuestImg.string = '吃';
                data.cards.forEach((card, i) => {
                    if (i != 0)
                        this.hands[idx].removeHands(card);
                });
                break;
            case 'peng':
                this.nodeQuestImg.string = '碰';
                this.hands[idx].removeHands(data.card);
                this.hands[idx].removeHands(data.card);
                break;
            case 'wei':
                this.nodeQuestImg.string = '偎';
                this.hands[idx].removeHands(data.card);
                this.hands[idx].removeHands(data.card);
                break;
            case 'ti':
                this.nodeQuestImg.string = '提';
                this.hands[idx].removeHands(data.card);
                this.hands[idx].removeHands(data.card);
                this.hands[idx].removeHands(data.card);
                this.hands[idx].removeHands(data.card);
                break;
            case 'pao':
                this.nodeQuestImg.string = '跑';
                this.hands[idx].removeHands(data.card);
                this.hands[idx].removeHands(data.card);
                this.hands[idx].removeHands(data.card);
                break;
            case 'bi':
                data.cards.forEach((card, i) => {
                    this.hands[idx].removeHands(card);
                });
                break;
            case 'hu':
                this._delayTime = 5;
                this.nodeQuestImg.string = '胡';
                break;
            default:
                cc.log(data.type);
        }
        this.hands[idx].sortHands();
        // if(data.type == 'bi'){
        //     this.players[idx].newGroup(data,true);
        //     return;
        // } // deck,ground,play
        let seq = [];
        let kaizhao = false;
        let fangjiao = false;
        let qing = false;
        if ((data.type == 'pao' && data.src == 'DECK') || (data.type == 'ti' && data.src == 'GROUND') || (data.type == 'pao' && data.src == 'GROUND') || (data.type == 'pao' && data.src == 'HANDS')) {
            this._delayTime = 2;
            this.players[idx].ground.content.forEach((detail, i) => {
                cc.log('detail', detail);
                if (data.card == detail.cardValue && (detail.type == 'peng' || detail.type == 'wei')) {
                    detail.remove();
                    fangjiao = (detail.type == 'wei' && data.src == 'GROUND'); //自己偎，别人打
                    qing = (data.type == 'ti' && data.src == 'GROUND');  //自己偎，自己摸出来
                    this.players[idx].ground.content.splice(i, 1);
                    this.players[idx].ground.length--;
                    cc.log(this.players[idx]);
                    this.players[idx].resetGroupPos();
                }
            })
        }
        let seq0 = this.players[idx].newGroup(data, false);
        //cc.log('seq',seq);
        this.nodeQuestImg.node.scale = 2.5;
        seq.push(cc.targetedAction(this.nodeQuestImg.node, cc.sequence(
            cc.callFunc(() => {
                this.nodeQuestImg.node.opacity = 255;
            }),
            cc.place(POS_IMG_QUEST[idx]),
            cc.scaleTo(0.3, 1),
            cc.delayTime(0.3),
            cc.fadeOut(0.2)
        )));
        seq.push(seq0[0]);
        // if(data.type == 'ti')
        //      this.refreshScore(data);
        this.node.runAction(cc.spawn(seq));
        this.playAudio(data, kaizhao, fangjiao, qing);
    },

    refreshScore(data) {
        this.players.forEach(player => {
            if (player.idx == data.idx) {
                player.lblscore.value = player.lblscore.value + (data.card > 9 ? 4 : 2);
            } else {
                player.lblscore.value = player.lblscore.value - (data.card > 9 ? 2 : 1);

            }
            player.lblscore.string = '' + player.lblscore.value;

        })
    },
    dead(data) {
        this.players.forEach((player, i) => {
            let idx = TableInfo.realIdx[data.idx];
            if (idx == i)
                player.setQiHu(true);
        })
    },

    roundSummary(data) {
        TableInfo.currentPlayer = null;

        let nodeRoundSummary = cc.instantiate(this.preRoundSummary);

        let summary = nodeRoundSummary.getComponent('ModuleRoundSummary08');
        summary.init(data, true);
        nodeRoundSummary.parent = this.node;
        this.nodeRoundSummary = nodeRoundSummary;
        nodeRoundSummary.zIndex = 10;
        // nodeBackSummary.on('touchend',()=>{
        //     this.quit();
        //     let nodeSelect = cc.find('Canvas/summarySelect');
        //     if(nodeSelect)
        //         nodeSelect.destroy();
        // });
        data.players.forEach((player, i) => {
            let idx = TableInfo.realIdx[player.idx];
            this.players[idx].totalHuxiLabel.string = data.finish ? "0" : "" + player.scores.turn;
        })
        //this.initSummaryHands(data);
    },

    gameSummary(data) {
        let nodeGameSummary = cc.instantiate(this.preGameSummary);
        nodeGameSummary.getComponent('ModuleGameSummary08').init(data, true);
        nodeGameSummary.parent = cc.find("Canvas");
        nodeGameSummary.zIndex = 10;
    },

    showGameSummary() {

    },
    onReplayNext() {
        this.schedule(this.gameMsgSchedule, 0.1);

    }
    // called every frame, uncomment this function to activate update callback
    // update (dt) {

    // },
});
