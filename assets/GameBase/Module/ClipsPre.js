let tbInfo = require("TableInfo");

const playerPosArr = [cc.v2(-506, -229), cc.v2(513, 200), cc.v2(-506, 200)];
cc.Class({
    extends: cc.Component,

    properties: {
        SpriteNode: cc.Sprite,
        clipsSpriteFrame: [cc.SpriteFrame],
        spineAnimArr: [sp.SkeletonData]
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    initData(data) {

        //设置位置
        // let startPos = playerPosArr[tbInfo.realIdx[data.idx]];
        // let endPos = playerPosArr[tbInfo.realIdx[data.target]];
        // let ap = cc.place(0,0)//cc.place(startPos);
        // let hp = cc.place(0,200)//cc.place(endPos);
        // console.log("111111111",this.clipsSpriteFrame[data.content])
        // this.node.addComponent(cc.Sprite).SpriteFrame = this.clipsSpriteFrame[data.content];

        // ,this.spineAnimArr[data.content],
        // let bezier = (data.target == 2 && data.idx == 0) || (data.target == 0 && data.idx == 2) ? [startPos, cc.v2(endPos.x, endPos.y + 200), endPos] : [startPos, cc.v2(0, 600), endPos];
        // let ep = cc.callFunc(() => {
        //     this.SpriteNode.SpriteFrame = SpriteFrame;
        //     // clipsNode.getComponent(cc.Sprite).spriteFrame = this.clipsSpriteFrame[data.content];

        // })
        // let bp = cc.bezierTo(2, bezier).easing(cc.easeSineInOut())
        // let gp = cc.rotateBy(2, -1080)
        // let cp = cc.callFunc(() => {
        //     this.node.removeAllChildren();
        //     let spNode = this.node.getComponent(sp.Skeleton);
        //     spNode.SkeletonData = SkeletonData;
        //     spNode.setAnimation(1,"1",false);
        //     debugger

        // });
        // let dp = cc.delayTime(2.3);
        // let fp = cc.removeSelf();
        // switch (data.content) {
        //     case "0":
        //         this.node.runAction(cc.sequence(hp, cp, dp, cc.fadeOut(0.3), fp))
        //         break;
        //     default:
        //         this.node.runAction(cc.sequence(ap, ep, cc.spawn(bp, gp), cp, dp, cc.fadeOut(0.3), fp))
        //         break;
        // }
        // this.node.removeFromParent();
        // this.node.destroy();
    }
    // update (dt) {},
});
