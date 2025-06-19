// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        angle: 15
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        let animTime = 0.05;
        let ap = cc.rotateBy(animTime, 5);
        let bp = cc.rotateBy(animTime * 2, -10);
        let cp = cc.rotateBy(animTime * 2, 10);
        let dp = cc.rotateBy(animTime, -5);


        let ep = cc.sequence(bp, cp).repeat(3);
        let fp = cc.sequence(ap, ep, dp, cc.callFunc(() => {
            this.node.angle=0;
        }), cc.delayTime(5)).repeatForever();
        this.node.runAction(fp);


    },

    // update (dt) {},
});
