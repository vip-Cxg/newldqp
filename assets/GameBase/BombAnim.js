// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        bombArr: [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    startAnim(data) {
        this.node.getComponent(cc.Sprite).spriteFrame = this.bombArr[data - 3];
        this.node.scale = 7;
        let ap = cc.scaleTo(0.3, 1);
        let bp = cc.moveBy(0.3, cc.v2(0, 100));
        let cp = cc.fadeOut(0.3);
        let ep = cc.spawn(bp, cp);
        let dp = cc.sequence(ap, cc.delayTime(0.3), ep, cc.callFunc(() => {
            if (this.node) {

                this.node.removeFromParent();

                this.node.destroy();
            }
        }))

        this.node.runAction(dp)
    }
    // update (dt) {},
});
