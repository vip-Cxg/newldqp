let connector = require("Connector");
let ROUTE = require("ROUTE");
const { GameConfig } = require("../../../GameBase/GameConfig");
const TableInfo = require("../../../Main/Script/TableInfo");
const utils = require("../../../Main/Script/utils");
cc.Class({
    extends: cc.Component,

    properties: {
        lblZhua: cc.Label,
        lblJifen: cc.Label,
        lblXifen: cc.Label,
        lblWinScore: cc.Label,
        lblLoseScore: cc.Label,
        lblNiao: cc.Label,
        lblBet: cc.Label,
        rankSpr: cc.Sprite,
        avatarSpr: require('../../../script/ui/common/Avatar'),
        lblName: cc.Label,
        lblBetReward: cc.Label,
        lblID: cc.Label,
        sprQG: cc.Node,
        sprBG: cc.Node,
        sprBZ: cc.Node,
        sprDN: cc.Node,
        winBg: cc.Node,
        loseBg: cc.Node,
        rankSprArr: [cc.SpriteFrame]
    },



    initData(data, winner, idx, replay) {
        // {
        //     "credit": 110,
        //     "reward": 0,
        //     "bet": 1,
        //     "group": 1,
        //     "rank": 0,
        //     "wallet": 7207,
        //     "bonus": 4,
        //     "call": true,
        //     "turn": 490,
        //     "fee": 10,
        //     "ext": 0
        // }
        if (idx == TableInfo.idx) {
            this.lblName.node.color = new cc.color(255, 217, 0, 255);
            this.lblID.node.color = new cc.color(255, 217, 0, 255);

        }

        this.winBg.active = data.group == winner;
        this.loseBg.active = !this.winBg.active;
        this.rankSpr.spriteFrame = this.rankSprArr[data.rank];

        try {
            if (TableInfo.options?.mode == 'CUSTOM') {//自选
                this.lblName.string = utils.getStringByLength(TableInfo.players[idx].prop.name, 5);
                this.avatarSpr.avatarUrl = TableInfo.players[idx].prop.head;
            } else {
                this.lblName.string = idx == TableInfo.idx || replay ? utils.getStringByLength(TableInfo.players[idx].prop.name, 5) : '玩家' + (idx + 1);
                this.avatarSpr.avatarUrl = idx == TableInfo.idx || replay ? TableInfo.players[idx].prop.head : '';

            }
            if (replay)
                this.lblID.string = "ID:" + TableInfo.players[idx].prop.pid;

        } catch (error) {
            this.lblName.string = "玩家已离开";

        }

        this.sprBZ.active = data.call;//TODO call
        // this.sprDN.active = data.bird;


        this.lblZhua.string = "" + data.credit;//TODO  credit
        this.lblBet.string = data.bet > 0 ? "+" + data.bet : data.bet;
        this.lblJifen.string = data.reward > 0 ? "+" + data.reward : data.reward; //TODO reward
        this.lblXifen.string = data.bonus > 0 ? "+" + data.bonus : data.bonus;//TODO bonus
        // this.lblNiao.string = data.plus > 0 ? "+" + utils.formatGold(data.plus) : utils.formatGold(data.plus);
        if (data.turn > 0) {
            this.lblWinScore.node.active = true;
            this.lblLoseScore.node.active = false;
            this.lblWinScore.string = "+" + utils.formatGold(data.turn);//TODO 当局输赢
        } else {
            this.lblWinScore.node.active = false;
            this.lblLoseScore.node.active = true;
            this.lblLoseScore.string = "" + utils.formatGold(data.turn);
        }

        // 炸弹 plus 改成 ext 全干/半干   plus为鸟
        //0 hide  1 半 2 全
        switch (data.ext) {
            case 0:
                this.sprQG.active = false;
                this.sprBG.active = false;
                break;
            case 1:
                this.sprQG.active = false;
                this.sprBG.active = true;
                break;
            case 2:
                this.sprQG.active = true;
                this.sprBG.active = false;
                break;
        }

    },
});
