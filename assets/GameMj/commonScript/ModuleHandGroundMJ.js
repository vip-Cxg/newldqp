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
        groundItem: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:
    /**重制牌区 */
    resetGround() {
        this.node.removeAllChildren();
    },
    /**初始化牌区 */
    initGround(ground, realIdx) {
        this.resetGround();
        ground.forEach(element => {
            let groundItem = cc.instantiate(this.groundItem);
            groundItem.msg = element;
            if (realIdx == 0)
                groundItem.scale = 1.1;
            groundItem.getComponent('ModuleGroundDetailMJ').init(element, realIdx);
            this.node.addChild(groundItem);
        });
    },
    addGround(data, realIdx) {
        // let data ={ event: 'PONG', idx: 0, card: 2, from: 0 }

        let childIndex = this.node.children.findIndex(node => node.msg.card == data.card);
        if (childIndex == -1 || data.event == GameConfig.GameAction.CHOW) {
            let groundItem = cc.instantiate(this.groundItem);
            groundItem.msg = data;
            if (realIdx == 0)
                groundItem.scale = 1.1;
            groundItem.getComponent('ModuleGroundDetailMJ').init(data, realIdx);
            this.node.addChild(groundItem);
            console.log("1")
        } else {
            this.node.children[childIndex].msg = data;
            this.node.children[childIndex].getComponent('ModuleGroundDetailMJ').init(data, realIdx);
        }
    },

    // update (dt) {},
});
