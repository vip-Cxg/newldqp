
let tbInfo = require('TableInfo');
cc.Class({
    extends: cc.Component,

    properties: {
        // content: cc.Sprite,
    },
    init(card, realIdx) {
        //自己手牌

        if (card == 0) //红中 
            card = 35;
        this.node.getComponent(cc.Sprite).spriteFrame = tbInfo.cardsSpriteFrame['p' + (realIdx + 1) + 's' + card];
        this.node.height *= scale;
        this.node.width *= scale;
        // this.content.node.height *= scale;
        // this.content.node.width *= scale;
        if (this.node.getChildByName("ting")) {
            this.node.getChildByName("ting").height *= scale;
            this.node.getChildByName("ting").width *= scale;
        }
        if (this.node.getChildByName("lai") && showLai) {
            this.node.getChildByName("lai").active = card == 0;
        }
        if (this.node.getChildByName("back")) {
            this.node.getChildByName("back").height *= scale;
            this.node.getChildByName("back").width *= scale;
        }

    }


    // update (dt) {},
});
