// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Layout,
        card: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init (decks) {
        this.content.node.destroyAllChildren();
        this.show = true;
        decks.forEach(c => {
            let node = cc.instantiate(this.card);
            node.getComponent('BaseCardZP').init(c);
            node.width = 50;
            node.height = 57;
            node.parent = this.content.node;
        })
    },

    btnHandleCall () {
        this.content.node.active = !this.show;
        this.show = !this.show;
    }

    // update (dt) {},
});
