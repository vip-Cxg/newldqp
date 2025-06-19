const { GameConfig } = require("../../GameBase/GameConfig");
const Cache = require("./Cache");
const utils = require("./utils");

cc.Class({
    extends: cc.Component,

    properties: {
        ensureBtn: cc.Node,
        contentWord: cc.Label,
        selectSpr: cc.Node
    },

    // use this for initialization
    onLoad: function () {

    },


    show(msg, gameType, callBack) {
        this.callBack = callBack;
        this.gameType = gameType;
        this.contentWord.string = "" + msg;
    },
    onSelectShow() {
        Cache.playSfx();
        this.selectSpr.active = !this.selectSpr.active;

    },
    onClickEnsure() {
        Cache.playSfx();
        let isShow = utils.getValue(GameConfig.StorageKey.ShowAutoTips, {
            "PDK_SOLO": true,
            "XHZP_SOLO": true,
            "LDZP_SOLO": true,
            "PDK": true,
            "XHZP": true,
            "XHZD": true,
            "LDZP": true,
        });
        isShow[this.gameType] = !this.selectSpr.active;
        utils.saveValue(GameConfig.StorageKey.ShowAutoTips, isShow);
        if (this.callBack)
            this.callBack();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
});
