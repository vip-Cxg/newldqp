let connector = require("Connector");
let ROUTE = require("ROUTE");
let TableInfo = require("../../../Main/Script/TableInfo");
let utils = require("../../../Main/Script/utils");
cc.Class({
    extends: cc.Component,

    properties: {

        //赢家icon
        winIcon: cc.Node,
        //春天
        sprCt: cc.Node,
        //打鸟
        sprDN: cc.Node,
        //名字
        lblName: cc.Label,
        //头像
        avatarSpr: require('../../../script/ui/common/Avatar'),
        //id
        lblId: cc.Label,
        //剩余牌数
        cardCount: cc.Label,
        //鸟
        lblNiao: cc.Label,
        //分数
        score: cc.Label,
        //总计分 
        totalScore:cc.Label,
        //item背景
        winBg: cc.Node,
        loseBg: cc.Node,
        winDesc:cc.Node,
        loseDesc:cc.Node,
        //炸弹
        boomCount: cc.Label,
        boomScore: cc.Label,

        winFont: cc.Font,
        loseFont: cc.Font,
    },

    initData (data, winner,ach) {
        if (data.idx == TableInfo.idx) {
            this.lblName.node.color = new cc.color(255, 217, 0, 255);
            this.lblId.node.color = new cc.color(255, 217, 0, 255);
        }

        this.boomCount.string = "x" + Math.max(data.scores.bomb, 0);

        this.boomScore.string = data.scores.add >= 0 ? "+" + utils.formatGold(data.scores.add) : utils.formatGold(data.scores.add);


        try {

            //名字
            this.lblName.string = utils.getStringByLength(TableInfo.players[data.idx].prop.name, 5);
            //头像
            this.avatarSpr.avatarUrl = TableInfo.players[data.idx].prop.head;
            //id
            this.lblId.string = "ID:" + TableInfo.players[data.idx].prop.pid;

        } catch (error) {

            //名字
            this.lblName.string = "玩家已离开";
            //头像
            // this.avatarSpr.avatarUrl=''
            //id
            this.lblId.string = "";

        }
        //是否春天
        this.sprCt.active = data.hands.length == (TableInfo.config.ext ? 16 : 15);
        //剩余牌数
        this.cardCount.string = data.hands.length + "张";
        //本局积分base: 7当局牌分数  bomb: 0炸弹分数  total: 7累计局数分数  turn: 7 当局总分数
        // if (data.scores.turn > 0) {
        //     // this.score.font = this.winFont;
        //     this.score.string = '' + utils.formatGold(data.scores.turn);
        // } else {
        //     // this.score.font = this.loseFont;
        //     this.score.string = '' + utils.formatGold(data.scores.turn);
        // }
        this.score.string = '' + utils.formatGold(data.scores.turn);

        if(utils.isNullOrEmpty(ach)){
            this.totalScore.node.active=false;
        }else{
            this.totalScore.node.active=true;
            let index=ach.findIndex(a=>a.idx==data.idx)
            this.totalScore.string='' + utils.formatGold(ach[index].total);
            
            if (ach[index].total > 0) {
                this.totalScore.font = this.winFont;
                this.winDesc.active=true;
            } else {
                this.totalScore.font = this.loseFont;
                this.loseDesc.active=true;
            }
        }

        //显示赢家
        this.winIcon.active = data.idx == winner;

        //打鸟
        this.lblNiao.string = data.scores.plus > 0 ? "+" + utils.formatGold(data.scores.plus) : utils.formatGold(data.scores.plus);
        this.sprDN.active = data.bird;

        //item背景
        this.winBg.active = winner == data.idx;
        this.loseBg.active = !this.winBg.active;
    },

});
