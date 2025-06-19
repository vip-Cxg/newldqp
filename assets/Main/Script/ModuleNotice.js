// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        lblNotice: cc.Label,
        speed: {
            default: 100,
            tips: '广播的速度'
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },

    start() {

    },

    showTips(msg, times = 3) {
        this.node.zIndex = 504;
        this.node.position = cc.v2(0, 235)
        this.lblNotice.string = msg;
        this.lblNotice.node.stopAllActions();
        setTimeout(() => {
            if (this.lblNotice) {

                let distance = this.lblNotice.node.width + this.lblNotice.node.parent.width;
                let ap = cc.place(cc.v2(this.lblNotice.node.parent.width / 2, 0));
                let bp = cc.moveBy(distance / this.speed, cc.v2(-distance, 0));

                let count = 0;
                let cp = cc.sequence(cc.callFunc(() => {
                    count++;
                }), ap, bp, cc.callFunc(() => {
                    if (count == times)
                        this.node.destroy();
                }));

                // let dp = cc.repeatForever(cp);


                let dp = cc.repeat(cp, times);

                this.lblNotice.node.runAction(dp);
            }
        }, 100)
    },
    // update (dt) {},
});
