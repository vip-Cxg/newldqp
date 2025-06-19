let tbInfo = require("TableInfo");
cc.Class({
    extends: cc.Component,

    properties: {
        preCard: cc.Prefab,
        nodeCards: [],
        bgTable: cc.Layout,
        search: [],
    },

    refreshHandCards: function (hands, bool) {
        this.node.destroyAllChildren();
        this.nodeCards = [];
        let middle = Math.floor(hands.length / 2);  
        hands.forEach((card,x) => {
            let nodeCard = cc.instantiate(this.preCard);
            let objCard = nodeCard.getComponent("ModuleCards07");
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