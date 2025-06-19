let connector = require("Connector");
let ROUTE = require("ROUTE");
let tbInfo = require("TableInfo");
const { turn } = require("../../../Main/Script/TableInfo");
let utils = require("../../../Main/Script/utils");
cc.Class({
    extends: cc.Component,

    properties: {
        //赢家icon
        winIcon: cc.Node,
        //打鸟
        sprDN: cc.Node,
        //鸟
        lblNiao: cc.Label,
        //名字
        lblName: cc.Label,
        //头像
        avatarSpr: require('../../../script/ui/common/Avatar'),
        //id
        lblId: cc.Label,
        //总分数
        score: cc.Label,

        //总胡次数
        lblTotalHu: cc.Label,
        //胡牌次数
        lblHu: cc.Label,
        //点炮次数
        lblBoom: cc.Label,
        //提牌次数
        lblTi: cc.Label,
        //跑牌次数
        lblPao: cc.Label,



        //item背景
        winBg: cc.Node,
        loseBg: cc.Node,
        winFont: cc.Font,
        loseFont: cc.Font,
    },

    initData: function (data, winner) {
        if (data.idx == tbInfo.idx) {
            this.lblName.node.color = new cc.color(255, 217, 0, 255);
            this.lblId.node.color = new cc.color(255, 217, 0, 255);
        }
        try {
            //名字
            this.lblName.string = utils.getStringByLength(tbInfo.players[data.idx].prop.name, 5);
            //头像
            this.avatarSpr.avatarUrl = tbInfo.players[data.idx].prop.head;

            //id
            this.lblId.string = "ID:" + tbInfo.players[data.idx].prop.pid;
        } catch (error) {
            //名字
            this.lblName.string = "玩家已离开";
            //头像
            // this.avatarSpr.avatarUrl='';
            //id
            this.lblId.string = "";
        }


        //总胡息
        this.lblTotalHu.string = "总胡息：" + data.scores.turn;;

        //胡牌
        this.lblHu.string = "" + data.scores.win;
        //接炮
        this.lblBoom.string = "" + data.scores.lose;
        //提牌
        this.lblTi.string = "" + data.scores.ti;
        //跑牌
        this.lblPao.string = "" + data.scores.pao;

        //本局积分base: 7当局牌分数  bomb: 0炸弹分数  total: 7累计局数分数  turn: 7 当局总分数
        if (data.scores.total > 0) {
            this.score.font = this.winFont;
            this.winBg.active = true;
            this.loseBg.active = false;
            this.score.string = "+" + utils.formatGold(data.scores.total);
        } else {
            this.score.font = this.loseFont;
            this.score.string = "" + utils.formatGold(data.scores.total);
            this.winBg.active = false;
            this.loseBg.active = true;
        }

        //显示赢家
        this.winIcon.active = false;//data.idx == winner;

        //打鸟
        this.lblNiao.string = data.scores.plus > 0 ? "+" + utils.formatGold(data.scores.plus) : utils.formatGold(data.scores.plus);
        this.sprDN.active = data.bird;

        //item背景
    },

});
