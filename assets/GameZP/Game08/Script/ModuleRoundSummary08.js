let TableInfo = require('../../../Main/Script/TableInfo');
let connector = require('Connector');
let ROUTE = require('../../../Main/Script/ROUTE');
let Native = require('native-extend');
let _social = Native.Social;
let utils = require("../../../Main/Script/utils");//require("utils");
let audioCtrl = require("audio-ctrl");
let cache = require('../../../Main/Script/Cache');
const { GameConfig } = require('../../../GameBase/GameConfig');
const { App } = require('../../../script/ui/hall/data/App');
let FAN = {
    TH: 0x1,//天胡
    DH: 0x2,//地胡
    ZM: 0x4,//自摸
    BH: 0x8,//十三红
    SH: 0x10,//红胡
    YD: 0x20,//一点红
    HH: 0x40,//黑胡
    YKB: 0x80,//一块匾
    HD: 0x100,//海底胡
    DK: 0x200,//大卡
    XK: 0x400,//中卡
    FP: 0x800//接炮
};
let STR_MT = ['天胡', '地胡', '自摸', '十三红', '红胡', '一点红', '一块匾', '海底胡', '大卡', '中卡', '接炮'];
cc.Class({
    extends: cc.Component,

    properties: {
        infoContent: cc.Node,
        bgMask: cc.Node,
        winNode: cc.Node,
        loseNode: cc.Node,
        dataContent: cc.Node,
        drawContent: cc.Node,
        preMingTang: cc.Prefab,
        sprHead: [cc.Sprite],
        lblXi: cc.Label,
        //    lblTid: cc.Label,
        //    lblTurn: cc.Label,
        //    lblTime: cc.Label,
        groundContent: cc.Node,
        deckContent: cc.Node,
        playerContent: cc.Node,
        playerWinBg: cc.SpriteFrame,
        playerLoseBg: cc.SpriteFrame,
        leftPlayerWin: cc.SpriteFrame,
        rightPlayerWin: cc.SpriteFrame,
        card: cc.Prefab,
        roundSummaryGroup: cc.Prefab,
        // lblRoundStatus: cc.Label,
        lblWinScore: cc.Label,
        // nodeSelect: cc.Prefab,
        layoutHu: cc.Layout,
        playerDrawContent: cc.Node,
        playerItem: cc.Node,
        drawPlayerItem: cc.Node,

        // lblContinue: cc.Label,
        // lblContinueDraw: cc.Label,
        downloadTime: cc.Label,
        preGameSummary: cc.Prefab,
        avatarContent: [require('../../../script/ui/common/Avatar')],
        avatarDrawContent: [require('../../../script/ui/common/Avatar')],
        isReplay: false,
        cutCard: cc.Toggle,
        adComponent: require('../../../script/ui/ad/AdComponent'),
        descCut: cc.Label,
        summaryData: null
    },
    onLoad() {
        if (!utils.isNullOrEmpty(GameConfig.AdData) && !utils.isNullOrEmpty(GameConfig.AdData.LDZPSummaryAd)) {
            this.adComponent.showAd();
            this.adComponent.initAd(GameConfig.AdData.LDZPSummaryAd);
        } else {
            this.adComponent.hideAd();
        }
    },

    checkHu(data) {
        if (data.draw)
            return;
        let huList = [];
        let hu = data.action.hu;
        if ((hu & FAN.TH) > 0)
            huList.push(0);
        if ((hu & FAN.DH) > 0)
            huList.push(1);
        if ((hu & FAN.ZM) > 0)
            huList.push(2);
        if ((hu & FAN.BH) > 0)
            huList.push(3);
        if ((hu & FAN.SH) > 0)
            huList.push(4);
        if ((hu & FAN.YD) > 0)
            huList.push(5);
        if ((hu & FAN.YKB) > 0)
            huList.push(6);
        if ((hu & FAN.HD) > 0)
            huList.push(7);
        if ((hu & FAN.DK) > 0)
            huList.push(8);
        if ((hu & FAN.XK) > 0)
            huList.push(9);
        if ((hu & FAN.FP) > 0)
            huList.push(10);
        huList.forEach(h => {
            let nodeHu = cc.instantiate(this.preMingTang);
            nodeHu.parent = this.layoutHu.node;
            nodeHu.getChildByName('lblMT').getComponent(cc.Label).string = STR_MT[h];
            nodeHu.getChildByName('lblScore').active = false;
        })
    },

    init(data, replay = false) {
        this.summaryData = data;
        this.checkHu(data);
        if (!replay)
            this.readyDownload();


        this.isReplay = replay;
        // this.cutCard.node.active = !replay;
        // if (!utils.isNullOrEmpty(TableInfo.options) && !utils.isNullOrEmpty(TableInfo.options.shuffle) && TableInfo.options.shuffle > 0) {
        //     this.cutCard.node.active = true;
        //     this.descCut.string = "每次" + utils.formatGold(TableInfo.options.shuffle);
        // } else {
        //     this.cutCard.node.active = false;
        // }
        //两人 隐藏
        // if (TableInfo.options.person == 2) {
            this.playerItem.active = false;
            this.drawPlayerItem.active = false;
        // }
        // //继续按钮 文本显示 
        // if (this.replay) {//回放
        //     this.lblContinue.string = '关闭';
        //     this.lblContinueDraw.string = '关闭';

        // } else if (utils.isNullOrEmpty(data.ach)) { //小局结束

        //     this.lblContinue.string = '下一局';
        //     this.lblContinueDraw.string = '下一局';
        // } else {//大结算
        //     this.lblContinue.string = '继续游戏';
        //     this.lblContinueDraw.string = '继续游戏';
        // }

        if (data.draw) {
            this.drawContent.active = true;
            this.winNode.active = false;
            this.loseNode.active = false;
            this.dataContent.active = false;
            this.playerDrawContent.active = true;
            data.players.forEach((player, i) => {
                let playerNode = this.playerDrawContent.getChildByName("player" + i);
                //玩家头像
                this.avatarDrawContent[i].avatarUrl = TableInfo.players[player.idx].prop.head;
                //显示玩家名字
                playerNode.getChildByName("name").getComponent(cc.Label).string = utils.getStringByLength(TableInfo.players[player.idx].prop.name, 7)//;
                //显示玩家输赢分数 TODO
                playerNode.getChildByName("score").getComponent(cc.Label).string = "" + player.scores.turn;
            })

            return
        }
        if (!data.draw) {
            this.lblWinScore.string = "总得分：" + data.action.score;
        }
        this.initRemain(data);
        this.initPlayer(data);
    },

    initPlayer(data) {
        //TODO
        if (!data.draw) {
            this.lblXi.string = '' + data.action.xi;
            data.players.forEach(player => {
                player.win = player.idx == data.action.idx ? 1 : 0;
                player.pao = data.action.src == 'PLAY' && data.action.from == player.idx
            });
            data.players.sort((a, b) => b.win - a.win);
        }
        data.players.forEach((player, i) => {
            let playerNode = this.playerContent.getChildByName("player" + i);
            if (player.idx == TableInfo.idx) {
                if (data.draw) {
                    // this.lblRoundStatus.string = '黄庄';
                } else if (!data.draw && data.action.idx == TableInfo.idx) {
                    // this.lblRoundStatus.string = '胜利';
                    this.winNode.active = true;
                    this.loseNode.active = false;
                    this.playerContent.getChildByName("player0").getComponent(cc.Sprite).spriteFrame = this.playerWinBg;
                } else {
                    // this.lblRoundStatus.string = '失败';
                    this.winNode.active = false;
                    this.loseNode.active = true;
                    this.playerContent.getChildByName("player0").getComponent(cc.Sprite).spriteFrame = this.playerLoseBg;
                }
            }
            //玩家头像
            this.avatarContent[i].avatarUrl = TableInfo.players[player.idx].prop.head;
            //显示胡
            playerNode.getChildByName("win").active = (player.win == 1 && data.draw != true);
            //显示放炮
            playerNode.getChildByName("pao").active = (player.pao && data.draw != true);
            if (i == 0)
                this.initGround(data, i, player);
            //TODO id
            // this.lblId[i].string = TableInfo.players[player.idx].prop.pid;
            //显示玩家名字
            playerNode.getChildByName("name").getComponent(cc.Label).string = utils.getStringByLength(TableInfo.players[player.idx].prop.name, 7)//;
            //显示玩家输赢分数 TODO
            playerNode.getChildByName("zonghuxi").active = true;
            playerNode.getChildByName("goldIcon").active = false;
            playerNode.getChildByName("zonghuxi").getChildByName("huxi").getComponent(cc.Label).string = "" + player.scores.turn;


        })
    },

    initRemain(data) {
        data.decks.forEach(card => {
            let nodeCard = cc.instantiate(this.card);
            nodeCard.width = 34;
            nodeCard.height = 34;
            nodeCard.parent = this.deckContent;
            // nodeCard.scale = 0.4;
            nodeCard.getComponent('BaseCardZP').init(card);
        })
    },

    initGround(data, i, player) {


        if (data.draw)
            return;
        let idxHu = null;
        let huCards;
        data.action.cards.forEach((group, j) => {
            group.cards.forEach(c => {
                if (c == data.action.card) {
                    if (idxHu == null) {
                        idxHu = j;
                        huCards = c;
                    }
                }
            })
        });
        // console
        if(idxHu!=null){

            data.action.cards[idxHu].cards.sort((a, b) => {
                if (a == huCards && b != huCards) {
                    return -1;
                } else if (a != huCards && b == huCards) {
                    return 1;
                } else
                    return 0;
                //return b-a;
            });
        }
        data.action.cards.forEach((group, j) => {
            let nodeGroup = cc.instantiate(this.roundSummaryGroup);
            nodeGroup.parent = this.groundContent;
            let hu;
            hu = (idxHu == j);
            nodeGroup.getComponent('ModuleSummaryGroup05').init(group, true, hu);
        })
    },

    makeHands(hands) {
        let cards = [];
        hands.forEach((count, card) => {
            if (count == 3) {
                hands[card] -= 3;
                cards.push({ type: "kan", cards: [card, card, card] });
            }
        });
        let dui = [];
        hands.forEach((count, card) => {
            if (count == 2) {
                hands[card] -= 2;
                //cards.push({type:"kan",cards:[card,card,card]});
                dui.push(card);
                dui.push(card);
            }
            if (dui.length == 4) {
                cards.push({ type: "dui", cards: dui });
                dui = [];
            }
        });
        if (dui.length > 0)
            cards.push({ type: "dui", cards: dui });
        if (hands[1] > 0 && hands[6] > 0 && hands[9] > 0) {// 二七十
            hands[1]--;
            hands[6]--;
            hands[9]--;
            cards.push({ type: "shun", cards: [1, 6, 9] });
        }
        if (hands[11] > 0 && hands[16] > 0 && hands[19] > 0) {// 二七十
            hands[11]--;
            hands[16]--;
            hands[19]--;
            cards.push({ type: "shun", cards: [11, 16, 19] });
        }
        hands.forEach((count, card) => {
            if (card % 10 < 8 && hands[card] > 0 && hands[card + 1] > 0 && hands[card + 2] > 0) {// 二七十
                hands[card]--;
                hands[card + 1]--;
                hands[card + 2]--;
                cards.push({ type: "shun", cards: [card, card + 1, card + 2] });
            }
        });
        let arr = [];
        hands.forEach((count, card) => {
            for (let i = 0; i < count; i++) {
                arr.push(card);
                if (arr.length >= 4) {
                    cards.push({ cards: arr.slice() });
                    arr = [];
                }
            }
        });
        if (arr.length > 0) {
            cards.push({ cards: arr.slice() });
        }
        return cards;
    },
    sendReady(e,v) {
        // if (this.isReplay) {
        //         utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.REPLAY_CONTINUE);
        // }
        // this.remove();


        //继续按钮 文本显示 
        if (this.isReplay) {//回放
            // TODO 关闭回放

        } else if (utils.isNullOrEmpty(this.summaryData.ach)) { //小局继续 

            // TableInfo.shuffle = this.cutCard.isChecked;
            // connector.gameMessage(ROUTE.CS_GAME_READY, { shuffle: this.cutCard.isChecked });
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.LDZP_SHUFFLE_CARD, v=='1')
      
        } else {//大结算
            //TODO 打开大结算
            let nodeGameSummary = cc.instantiate(this.preGameSummary);
            nodeGameSummary.getComponent('ModuleGameSummary08').init(this.summaryData.ach);
            nodeGameSummary.parent = cc.find('Canvas');
        }
        this.remove();

     
    },
    remove() {
        if (this.downInterval)
            clearInterval(this.downInterval);
        if (this.node)
            this.node.destroy();
    },
    readyDownload() {
        this.downloadTime.node.active = true;
        let times = 30//TableInfo.options.clock;
        this.downloadTime.string = '30';// TableInfo.options.clock;
        this.downloadTime.unscheduleAllCallbacks();
        this.downloadTime.schedule(() => {
            times--;
            this.downloadTime.string = Math.max(times, 0);
            if (times < 0)
                this.downloadTime.unscheduleAllCallbacks();
        }, 1);
    },
    /**显示结算 */
    onShowSummary() {
        cache.playSfx();
        this.infoContent.active = true;
        this.bgMask.active = true;
    },
    /**显示桌面 */
    onShowTable() {
        cache.playSfx();

        this.infoContent.active = false;
        this.bgMask.active = false;
    }
});
