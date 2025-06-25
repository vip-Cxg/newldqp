// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
let TableInfo = require('../../../Main/Script/TableInfo');
let connector = require('Connector');
let ROUTE = require('ROUTE');
let Native = require('native-extend');
let _social = Native.Social;
let utils = require("../../../Main/Script/utils");
let audioCtrl = require('audio-ctrl');
let cache = require('../../../Main/Script/Cache');
const { GameConfig } = require('../../../GameBase/GameConfig');
cc.Class({
    extends: cc.Component,

    properties: {
        infoContent: cc.Node,
        bgMask: cc.Node,
        btnExit: cc.Node,
        player: cc.Prefab,
        layoutPlayer: cc.Node,
        titleSpr: [cc.Node],
        lblDetail: [cc.Label],
        containerBird: cc.Node,
        preBirdCard: cc.Prefab,
        cutCard: cc.Toggle,
        descCut: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // update (dt) {},

    ready() {
        // let node = cc.find('gameSummary');
        // if (node) {
        //     node.active = true;
        //     connector.disconnect();
        //     return;
        // }


        if (TableInfo.status == GameConfig.GameStatus.WAIT || TableInfo.status == GameConfig.GameStatus.DESTORY) {
            GameConfig.IsQuickStart = true;
            connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
        } else {
            connector.gameMessage(ROUTE.CS_GAME_READY, { plus: false, shuffle: this.cutCard.isChecked });
            TableInfo.shuffle = this.cutCard.isChecked;
        }

        if (this.node)
            this.node.destroy();
        // cc.find('Canvas/nodeTable').getComponent('SceneTable16').btnContinue.active = false;
        // cc.find('Canvas/nodeTable').getComponent('SceneTable16').roundReset();
    },
    birdReady() {
        if (TableInfo.status == GameConfig.GameStatus.WAIT || TableInfo.status == GameConfig.GameStatus.DESTORY) {
            GameConfig.IsQuickStart = true;
            connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
        } else {
            connector.gameMessage(ROUTE.CS_GAME_READY, { plus: true, shuffle: this.cutCard.isChecked });
            TableInfo.shuffle = this.cutCard.isChecked;
        }



        if (this.node)
            this.node.destroy();
    },
    init(data, replay = false) {
        this.btnExit.active = TableInfo.status == GameConfig.GameStatus.WAIT || TableInfo.status == GameConfig.GameStatus.DESTORY;
        if (replay) {
            this.cutCard.node.active = false;
        }

        if (data.draw) {

            this.titleSpr[2].active = true;
            this.titleSpr[0].active = false;
            this.titleSpr[1].active = false;
        } else {
            this.titleSpr[0].active = data.players.findIndex((p, idx) => p.scores.base > 0 && idx == TableInfo.idx) >= 0;
            this.titleSpr[1].active = data.players.findIndex((p, idx) => p.scores.base > 0 && idx != TableInfo.idx) >= 0;
            this.titleSpr[2].active = false;
        }
        this.initPlayer(data);
        this.initBird(data);

        if (!utils.isNullOrEmpty(TableInfo.options) && !utils.isNullOrEmpty(TableInfo.options.shuffle))
            this.descCut.string = "每次" + utils.formatGold(TableInfo.options.shuffle);
    },

    initPlayer(data) {
        data.players.forEach((player, i) => {
            let node = cc.instantiate(this.player);
            node.parent = this.layoutPlayer;
            node.getComponent('ModuleRoundSummaryPlayer16').init(player, i, data);
        })
    },

    initBird(data) {
        if (typeof (data.birds) == 'number') {
            let node = cc.instantiate(this.preBirdCard);
            node.parent = this.containerBird;
            node.getComponent('ModuleGroundCardsMJ').init(data.bird, 0);
        } else {
            data.birds.forEach(bird => {
                let node = cc.instantiate(this.preBirdCard);
                node.parent = this.containerBird;
                if (!bird.hit)
                    node.color = cc.color(142, 142, 142);
                node.getComponent('ModuleGroundCardsMJ').init(bird.card, 0);
            })
        }
    },

    onExit() {
        cache.playSfx();
        cache.showConfirm("是否退出房间", () => {
            connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
        });
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
});
