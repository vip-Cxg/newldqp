let cache = require('Cache');
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    start () {
    },

    showPay(){
        this.node.parent = cc.find('Canvas');
    },

    exitPay () {
        cache.playSfx();
        this.node.removeFromParent(false);
    }
});
