// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const Cache = require("../../Script/Cache");

cc.Class({
    extends: cc.Component,

    properties: {
        rewardIcon:cc.Sprite,
        rewardCount:cc.Label,
        animNode:cc.Node,
        rewardIconArr:[cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    initData(data){
        setTimeout(()=>{
            this.animNode.active=true;
        },500)
        // prize: 500, prompt: "恭喜获得5元"
        this.rewardCount.string=""+data.prize/100+"元";
        
        if (data.prize <= 30000)
            this.rewardIcon.spriteFrame = this.rewardIconArr[3];
        if (data.prize <= 10000)
            this.rewardIcon.spriteFrame = this.rewardIconArr[2];
        if (data.prize <= 5000)
            this.rewardIcon.spriteFrame = this.rewardIconArr[1];
        if (data.prize <= 1000)
            this.rewardIcon.spriteFrame = this.rewardIconArr[0];
        
    },

    onClickClose(){
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }

    // update (dt) {},
});
