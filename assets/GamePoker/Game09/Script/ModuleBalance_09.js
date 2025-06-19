let tbInfo = require("TableInfo");
cc.Class({
    extends: cc.Component,

    properties: {
        imgWinner:cc.Node,
        lblName:cc.Label,
        lblZongjifenAdd:cc.Label,
        lblXiAdd:cc.Label,
        lblXitongAdd:cc.Label,
        lblXitongJian:cc.Label,
        sprHead:cc.Sprite,
        nodeHost: cc.Node,
        lblId:cc.Label
    },

    // use this for initialization
    init: function (score,idx ,extData) {
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
        this.nodeHost.active = tbInfo.players[idx].host;
        this.lblId.string = tbInfo.players[idx].prop.pid;

        this.lblXitongAdd.node.active = (score[3]+score[4])>=0;
        this.lblXitongJian.node.active = (score[3]+score[4])<0;

        this.lblZongjifenAdd.string = ""+ score[4];
        
        this.lblXiAdd.string =""+score[3];

        this.lblXitongAdd.string =""+(score[3]+score[4]);
        this.lblXitongJian.string = ""+(score[3]+score[4]);

        this.sprHead.spriteFrame = tbInfo.playerHead[idx];
    },

});
