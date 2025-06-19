let tbInfo = require("TableInfo");
const { GameConfig } = require("../../../GameBase/GameConfig");
cc.Class({
    extends: cc.Component,

    properties: {
        // sprNumber:cc.Sprite,
        // sprType:cc.Sprite,
        // sprFramNumberBlack:[cc.SpriteFrame],
        // sprFramNumberRed:[cc.SpriteFrame],
        // sprFramSize:[cc.SpriteFrame],
        bgCardMask: cc.Node,
        // _value:0,
        // _card:0
    },

    init(data) {
        let dataStr = data + "";
        let cards = parseInt(dataStr.slice(1));
        let flower = dataStr.slice(0, 1);
        if (cards == 15 && flower != 6 && flower != 5)
            data = parseInt(dataStr.slice(0, 1) + "16")
        // 515 小王   615 大王
        if (dataStr == '515')
            data = 65;
        if (dataStr == '615')
            data = 66;


        this.node.getComponent(cc.Sprite).spriteFrame = GameConfig.PorketAtlas.getSpriteFrame("" + data);
        this.bgCardMask.active = false;
        // let type = parseInt((data) / 100);
        // let number = data % 100;
        // this.sprType.spriteFrame = this.sprFramSize[type];
        // this.sprNumber.spriteFrame = (type == 1 || type == 3)?this.sprFramNumberBlack[number]:this.sprFramNumberRed[number]; 
        // if(number == 17 || number ==16){
        //     this.sprNumber.node.scale = 0.5;
        //     this.sprNumber.node.y = 14;
        //     this.sprType.enabled = false ;
        // }
    }
});
