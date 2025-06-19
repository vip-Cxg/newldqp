const { App } = require('../../script/ui/hall/data/App');
const Cache = require('./Cache');
const utils = require('./utils');
cc.Class({
    extends: cc.Component,

    properties: {
        btnConfirm: cc.Node,
        btnCancel: cc.Node,
        showTips: cc.Node,
        lblMessage: cc.Label
    },



    cancel() {
        Cache.playSfx();
        if (this.callback2 != null)
            this.callback2();
        if (this.node)
            this.node.destroy();
    },

    confirm() {
        Cache.playSfx();
        if (this.callback1 != null)
            this.callback1();
        if (this.node)
            this.node.destroy();
    },

    saveStorageKey(e) {
        Cache.playSfx();
        utils.saveValue(this.key, e.isChecked);
    },

    show(winType, message, callback1, callback2, key, zIndex = 500) {
        if (key) {
            this.key = key;
            this.showTips.active = true;
        }
        App.unlockScene();
        this.btnCancel.active = winType == 'showConfirm';
        this.btnConfirm.position = winType == 'showConfirm' ? cc.v2(-125, -98) : cc.v2(-1, -111);
        this.btnCancel.position = cc.v2(124, -98);
        this.lblMessage.string = "   " + message;
        this.callback1 = callback1;
        this.callback2 = callback2;
        // cc.find("Canvas").addChild(this.node, zIndex, 'winConfirm');
        this.node.parent = cc.find("Canvas")

        this.node.zIndex = zIndex;
        this.node.active = true;
        this.node.getChildByName("content").scale = 0;
        this.node.getChildByName("content").runAction(cc.sequence(cc.scaleTo(0.2, 1), cc.callFunc(() => {

        })));
    }
});
