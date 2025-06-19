const { App } = require("../../script/ui/hall/data/App");
const AudioCtrl = require("./audio-ctrl");
const Cache = require("./Cache");

cc.Class({
    extends: cc.Component,

    properties: {
        lblMessage: cc.Label,
        reStartBtn: cc.Node,
    },

    // use this for initialization

    onLoad: function () {
    },

    show() {
        if (this.showBtn) 
            clearTimeout(this.showBtn);
        this.node.active = true;
        this.showBtn = setTimeout(() => {
            if (this.reStartBtn){
                App.unlockScene();
                this.reStartBtn.active = true;
            }
        }, 20000)
    },
    hide() {

        this.reStartBtn.active = false;
        this.node.active = false;
        if (this.showBtn)
            clearTimeout(this.showBtn);

    },
    restartGame() {
        Cache.playSfx();
        AudioCtrl.getInstance().stopAll();
        cc.game.restart();
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
