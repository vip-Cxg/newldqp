let tbInfo = require("TableInfo");
cc.Class({
    extends: cc.Component,

    properties: {
        remainName: cc.Label,
        remainHead: cc.Sprite,
        preCards: cc.Prefab,
    },

    init: function (player) {
        let duration;
        if (player.hands.length > 12)
            duration = -33 - player.hands.length;
        else
            duration = -33;
        this.node.getComponent("cc.Layout").spacingX = duration;
        this.remainName.string = tbInfo.players[player.idx].prop.name;
        this.remainHead.spriteFrame = tbInfo.playerHead[player.idx];
        player.hands.forEach(card => {
            let remainCards = cc.instantiate(this.preCards);
            remainCards.parent = this.node;
            let cards = remainCards.getComponent("ModuleCardsInit_09");

            cards.init(card);
        });
    },
});
