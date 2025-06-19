let cache = require('Cache');
cc.Class({
    extends: cc.Component,

    properties: {
    	content: cc.WebView
    },

    start () {

    },

    showRule (event,data) {
        let gameIdx = parseInt(data);
        this.node.parent = cc.find('Canvas');
        let game = gameIdx<10?("0"+gameIdx):gameIdx;
        // this.content.url = "http://www.p64sd.cn/rule/"+ game + ".HTML";
    },

    exitRule () {
        cache.playSfx();
        this.node.removeFromParent(false);
    }
});
