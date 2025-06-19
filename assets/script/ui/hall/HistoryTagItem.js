// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { GameConfig } = require("../../../GameBase/GameConfig");
const { App } = require("./data/App");

cc.Class({
    extends: cc.Component,

    properties: {
        desc: cc.Label,
        tagItem: cc.Prefab,
        tagContent: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    renderUI(key, data) {
        this.desc.string = key + ':';
        this.tagContent.removeAllChildren();
        for (let desc in data) {
            let tagBtn = cc.instantiate(this.tagItem);
            tagBtn.getChildByName('desc').getComponent(cc.Label).string = '' + desc;
            tagBtn.on(cc.Node.EventType.TOUCH_END, () => {
                let toggleBtn = tagBtn.getComponent(cc.Toggle)
                setTimeout(() => {
                    if (toggleBtn.isChecked) {
                        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.SELECT_TAG_HISTORY, data[desc])
                    } else {
                        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, data[desc])
                    }
                }, 300);

            }, this)
            this.tagContent.addChild(tagBtn);
        }

    }

    // update (dt) {},
});
