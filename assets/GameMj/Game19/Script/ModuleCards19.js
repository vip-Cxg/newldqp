
let tbInfo = require('TableInfo');
cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {
    //
    // },

    init(card, scale = 1,showLai=false) {
        this.content.spriteFrame = tbInfo.cardsSpriteFrame[card];
        this.node.height *= scale;
        this.node.width *= scale;
        this.content.node.height *= scale;
        this.content.node.width *= scale;
        if (this.node.getChildByName("ting")) {
            this.node.getChildByName("ting").height *= scale;
            this.node.getChildByName("ting").width *= scale;
        }
        if (this.node.getChildByName("lai")&&showLai) {
            this.node.getChildByName("lai").active = card == 0;
        }
        if (this.node.getChildByName("back")) {
            this.node.getChildByName("back").height *= scale;
            this.node.getChildByName("back").width *= scale;
        }

    }


    // update (dt) {},
});
