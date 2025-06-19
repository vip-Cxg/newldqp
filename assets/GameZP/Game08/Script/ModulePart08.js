let TableInfo = require('TableInfo');
cc.Class({
    extends: cc.Component,

    properties: {
        lblName:cc.Label,
        lblEndScore: cc.Label,
        lblEndScoreNeg: cc.Label,
        lblId: cc.Label,
        sprHead:cc.Sprite,
        commonHead:cc.SpriteFrame,
        sprWinner: cc.Node,
        lblScore: [cc.Label],
        imgHost: cc.Node
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (detail,players,i,winScore){
        this.imgHost.active = (i == 0 && !TableInfo.config.clan);
    
        this.lblEndScore.node.active = players.score[1] >= 0;
        this.lblEndScoreNeg.node.active = players.score[1] < 0;
        this.lblEndScore.string = ''+players.score[1];
        this.lblEndScoreNeg.string = '+'+players.score[1];
        this.sprWinner.active = ((players.score[1] == winScore) && winScore > 0);
        this.lblName.string = TableInfo.players[i].prop.name;
    
        this.sprHead.spriteFrame = TableInfo.playerHead[i];
        this.lblId.string = TableInfo.players[i].prop.pid;

              
        detail.forEach((d,j)=>{
            if(i == 0 )
                this.lblScore[j].string = `第${j}局 ` + d.userScore0;
            if(i == 1)
                this.lblScore[j].string = `第${j}局 ` + d.userScore1;
            if(i == 2)
                this.lblScore[j].string = `第${j}局 ` + d.userScore2;
        });
        cc.log('sprHead',this.sprHead.spriteFrame)   
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
