// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
let tbInfo = require('TableInfo');
cc.Class({
    extends: cc.Component,

    properties: {
        lblName:cc.Label,
        lblEndScore: cc.Label,
        lblId: cc.Label,
        sprWinner: cc.Node,
        lblHupai: cc.Label,
        lblZM: cc.Label,
        lblJP: cc.Label,
        lblDP: cc.Label,
        lblAN: cc.Label,
        lblMING: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init: function (data,players,i,winScore){
        this.lblEndScore.string = players.scores[2];
        this.sprWinner.active = (players.scores[2] == winScore && winScore>0);
        this.lblName.string = tbInfo.players[i].prop.name;
        this.lblId.string = 'ID:' + tbInfo.players[i].prop.pid;
        if(!players.ach)
            players.ach = [0,0,0,0,0];
        this.lblZM.string = players.ach[0];
        this.lblJP.string = players.ach[1];
        this.lblDP.string = players.ach[2];
        this.lblAN.string = players.ach[3] || 0;
        this.lblMING.string = players.ach[4] || 0;
    }

    // update (dt) {},
});
