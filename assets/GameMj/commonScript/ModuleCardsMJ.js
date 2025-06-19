// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
let TableInfo = require('TableInfo');
cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Sprite,
    },
    init(card, scale = 1,showLai=false) {

        if (card == 0) //红中 
            card = 35;
        this.content.spriteFrame = TableInfo.cardsSpriteFrame[card];
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
