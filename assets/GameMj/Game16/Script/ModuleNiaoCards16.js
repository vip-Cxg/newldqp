// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
let TableInfo = require('TableInfo');

cc.Class({
    extends: cc.Component,

    properties: {
        cardAnim: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init(card, isZhongBirds, i) {
        if (card == 0) //红中 
        card = 35;
        this.node.getComponent(cc.Sprite).spriteFrame = TableInfo.cardsSpriteFrame['p1b' + card];
        this.node.scale = 0;

        let ap = cc.scaleTo(0.2, 1.5);
        let bp = cc.scaleTo(0.1, 0.8);
        let cp = cc.scaleTo(0.1, 1);
        let ep = cc.delayTime(0.1 * i)
        let dp = cc.sequence(ep, ap, bp, cp, cc.callFunc(() => {
            if (isZhongBirds){
                this.cardAnim.active = true;
            }else{
                this.node.color = cc.color(142,142,142);
            }
        }))
        this.node.runAction(dp);



    },

    // update (dt) {},
});
