cc.Class({
    extends: cc.Component,

    properties: {
        preCardsType: cc.Prefab,
        nodeCards: [],
    },

    refreshHandCards: function (hands, bool) {
        this.node.destroyAllChildren();
        this.nodeCards = [];
        let middle = Math.floor(hands.length / 2);  
        hands.forEach((card,x) => {
            let nodeCard = cc.instantiate(this.preCardsType);
            let objCard = nodeCard.getComponent("ModuleCardsInit_09");
            objCard.init(card);
            nodeCard.parent = this.node;
            nodeCard._prior = false;
            nodeCard._before = false;
            nodeCard._value = card;
            nodeCard.active = bool;
            nodeCard.setPosition(-430 + (hands.length -27)*10 + (13 - middle + x)* (35 + 27- hands.length), 7);
            nodeCard.pos0 = cc.v2(nodeCard.x, nodeCard.y);
            nodeCard.pos1 = cc.v2(nodeCard.x, nodeCard.y + 10);
            this.nodeCards.push(nodeCard);
        });
    },
});