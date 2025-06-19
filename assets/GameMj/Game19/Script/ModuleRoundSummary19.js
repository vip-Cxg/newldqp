let tbInfo = require('../../../Main/Script/TableInfo');
let connector = require('Connector');
let ROUTE = require('ROUTE');
let Native = require('native-extend');
let _social = Native.Social;
let utils = require("../../../Main/Script/utils");
let audioCtrl = require('audio-ctrl');
let cache = require('../../../Main/Script/Cache');
const { GameConfig } = require('../../../GameBase/GameConfig');
const { App } = require('../../../script/ui/hall/data/App');
cc.Class({
    extends: cc.Component,

    properties: {
        infoContent: cc.Node,
        bgMask: cc.Node,
        player: cc.Prefab,
        layoutPlayer: cc.Node,
        lblDeck: cc.Label,
        lblContinue: cc.Label,
        deckContent: cc.Node,
        btnExit: cc.Node,
        deckCard: cc.Prefab,
        cutCard: cc.Toggle,
        descCut: cc.Label,
        roundSummary: null,
        isReplay: false,
        interval: 0
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // update (dt) {},

    ready() {
        //大局结束 点下一局弹出大结算页面
        if (!utils.isNullOrEmpty(this.roundSummary.ach)) {
            let totalData = this.roundSummary.ach.concat();
            utils.pop(GameConfig.pop.MJGameSummary, (node) => {
                node.getComponent('ModuleGameSummaryMJ').initData(totalData, this.isReplay)
            })
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.HNMJ_GAME_SUMMARY)
            this.node.destroy();
            return;
        }
        if (this.isReplay) {
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.REPLAY_BACK_HALL)
            this.node.destroy();
            return;
        }
        connector.gameMessage(ROUTE.CS_GAME_READY, { shuffle: this.cutCard.isChecked });
        tbInfo.shuffle = this.cutCard.isChecked;
        if (this.node)
            this.node.destroy();
    },

    init(data, replay = false) {
        GameConfig.ShowTablePop = true;
        if (replay) {
            this.btnExit.active = false;
            this.cutCard.node.active = false;
        }
        this.lblContinue.string = !utils.isNullOrEmpty(data.total) ? '游戏结算' : '下一局';
        this.isReplay = replay;
        this.roundSummary = data;
        this.initPlayer(data);
        this.initDeck(data.decks);
        if (!utils.isNullOrEmpty(tbInfo.options) && !utils.isNullOrEmpty(tbInfo.options.shuffle))
            this.descCut.string = "每次" + utils.formatGold(tbInfo.options.shuffle) + "元";
    },

    initPlayer(data) {
        data.players.forEach((player, i) => {
            let node = cc.instantiate(this.player);
            node.parent = this.layoutPlayer;
            node.getComponent('ModuleRoundSummaryPlayer19').init(player, i, data);
        })
    },



    initDeck(deck) {
        this.deckContent.removeAllChildren();
        this.lblDeck.string = '剩余' + (deck.length || 0) + '张'
        deck.forEach(e => {
            let node = cc.instantiate(this.deckCard);
            node.getComponent('ModuleGroundCardsMJ').init(e, 0);
            this.deckContent.addChild(node);
        })
    },

    onExit() {
        cache.playSfx();
        cc.director.loadScene("Lobby");
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
    },

    update(dt) {
        if (!this.roundSummary.clock) return;
        if (!utils.isNullOrEmpty(this.roundSummary.total)) return;
        this.interval++;
        if (this.interval % 60 == 0) {
            this.interval = 0;
            let nowTime = utils.getTimeStamp();
            let endTime = this.roundSummary.clock;
            let time = Math.floor((endTime - nowTime) / 1000);

            this.lblContinue.string = '下一局 (' + Math.max(time, 0) + ')';
        }
    }
});
