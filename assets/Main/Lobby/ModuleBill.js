let cache = require('Cache');
cc.Class({
    extends: cc.Component,

    properties: {
        nodeScoreZD: cc.Node,
        scoreContent:cc.Node,
        recordContent:cc.Node,
        nodeRecordZD: cc.Node
    },

    start () {
        this.showRecordZD();
    },

    showBill(){
        this.node.parent = cc.find('Canvas');
    },

    showScoreZD (event,data) {
        this.nodeScoreZD.active = true;
        this.nodeRecordZD.active = false;
        // this.scoreContent.destroyAllChildren();
    },

    showRecordZD (event,data) {
        this.nodeRecordZD.active = true;
        this.nodeScoreZD.active = false;
        // this.recordContent.destroyAllChildren();
    },

    exitZD () {
        cache.playSfx();
        this.node.removeFromParent(false);
    }
});
