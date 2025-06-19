// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

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
    initGround(ground) {
        this.resetGround();
        ground.forEach(element => {
            let groundItem = cc.instantiate(this.groundItem);
            groundItem.msg = element;
            groundItem.getComponent('ModuleGroundDetail16').init(element);
            this.node.addChild(groundItem);
        });
    },
    addGround(data) {
        console.log("1", this.node.active);
        let childIndex = this.node.children.findIndex(node => node.msg.card == data.card);
        if (childIndex == -1) {
            let groundItem = cc.instantiate(this.groundItem);
            groundItem.msg = data;
            groundItem.getComponent('ModuleGroundDetail16').init(data);
            this.node.addChild(groundItem);
            console.log("1")
        } else {
            this.node.children[childIndex].msg = data;
            this.node.children[childIndex].getComponent('ModuleGroundDetail16').init(data);
        }
    },

    // update (dt) {},
});
