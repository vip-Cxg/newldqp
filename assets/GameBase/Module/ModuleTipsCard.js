
cc.Class({
    extends: cc.Component,

    properties: {
        cardItem:cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    /**更新牌 */
    refreshCard(hands){
        this.node.destroyAllChildren();
        // let middle = Math.ceil(hands.length / 2);  
        hands.forEach((card, x) => {
            let nodeCard = cc.instantiate(this.cardItem);
            let objCard = nodeCard.getComponent("ModuleCards07");
            objCard.init(card);
        
            nodeCard.parent = this.node;
            // nodeCard.name=card+"";
            // nodeCard._prior = false;
            // nodeCard._before = false;
            // nodeCard._value = card;
            // nodeCard.isZhankai = false;
            // nodeCard.setPosition(-380 + (8 - middle + x) * 53, -213);
            // nodeCard.pos0 = cc.v2(nodeCard.x, nodeCard.y);
            // nodeCard.pos1 = cc.v2(nodeCard.x, nodeCard.y + 15);
            // nodeCard.zIndex = x;
        });
    },
    removeCards(){
        this.node.destroyAllChildren();
    }
    // update (dt) {},
});
