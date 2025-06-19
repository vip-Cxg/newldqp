// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { GameConfig } = require("../../GameBase/GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

    },
    onTouchStart(e) {
        this.touchPos = e.getLocation();

    },
    onTouchMove(e) {
        let pos = e.getLocation();
        let a = cc.find("Canvas").convertToNodeSpaceAR(pos)
        // let xDis=pos.x-this.touchPos.x;
        // let yDis=pos.y-this.touchPos.y;
        GameConfig.BtnIsMoving=true;
        this.node.x = parseInt(a.x)
        this.node.y = parseInt(a.y)
    },
    onTouchEnd() {
        if (this.node.x >= 460)
            this.node.x = 460;
        if (this.node.x <= -460)
            this.node.x = -460;
        if (this.node.y <= -140)
            this.node.y = -140;
        if (this.node.y >= 140)
            this.node.y = 140;

        GameConfig.BtnIsMoving=false;

    }

    // update (dt) {},
});
