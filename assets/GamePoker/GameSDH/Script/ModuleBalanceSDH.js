let tbInfo = require("TableInfo");
cc.Class({
    extends: cc.Component,

    properties: {
        imgWinner:cc.Node,
        lblName:cc.Label,
        lblZongjifen:cc.Label,
        lblZhadan:cc.Label,
        lblTurnWin:cc.Label,
        lblTurnLose:cc.Label,
        lblMaxscore:cc.Label,
        sprHead:cc.Sprite,
        nodeHost: cc.Node,
        lblId:cc.Label
    },

    // use this for initialization
    init: function (data,idx ,extData) {
        this.imgWinner.active = extData[idx].winner;
        this.lblName.string = tbInfo.players[idx].prop.name;
        if(this.lblName.node.width > 120){
            let width = this.lblName.node.width;
            this.lblName.node.runAction(cc.repeatForever(cc.sequence(
                cc.delayTime(1),
                cc.moveBy(4,(114-width)/2,0),
                cc.delayTime(1),
                cc.moveBy(4,(width-114)/2,0)
            )))
        }
        this.lblZongjifen.string = data.score;
        this.lblZhadan.string = data.ach[0];
        this.lblTurnWin.string = data.ach[2];
        this.lblTurnLose.string = data.ach[3];
        this.lblMaxscore.string = data.ach[1];
        this.nodeHost.active = idx == 0;
        this.lblId.string = tbInfo.players[idx].prop.pid;
        this.sprHead.spriteFrame = tbInfo.playerHead[idx];
    },

});
