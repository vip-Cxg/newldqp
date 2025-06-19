const TableInfo = require("../../../Main/Script/TableInfo");
let logic = require("Logic_09");
cc.Class({
    extends: cc.Component,

    properties: {
        preCards: cc.Prefab,
        nodeFirst: cc.Node,
        nodeDan: cc.Node,
    },


    action(card, i) {
        if (card)
            card.opacity = 0;
        card.scale = 1.3;
        card.runAction(cc.spawn(
            cc.scaleTo(0.05, 1),
            cc.fadeIn(0.05)
        ));
    },

    // use this for initialization
    init: function (data, bool) {
        let newCards = logic.sortPlayedCard(data);
        let card = data.card;
        let firstCards = data.count * 3;
        let dan = data.cards.length - firstCards;
        let count = data.count;
        let cards0 = [], cards1 = [];
        cc.log(newCards);
        if (data.type == "SAN" || data.type == "FEIJI") {
            for (let i = 0; i < data.cards.length; i++) {
                if (data.cards[i] % 100 >= card && data.cards[i] % 100 < (card + count) && cards0.filter(value => value % 100 == data.cards[i] % 100).length < 3) {
                    cards0.push(data.cards[i]);
                } else
                    cards1.push(data.cards[i]);
            }
            cards0.sort(logic.sortCard);
            cards1.sort(logic.sortCard);
            cc.log(cards0, cards1);
            for (let i = 0; i < cards0.length; i++) {
                let nodePlayCards = cc.instantiate(this.preCards);
                nodePlayCards.parent = this.nodeFirst;
                if (bool) {
                    this.action(nodePlayCards, i);
                }
                let cardsInit = nodePlayCards.getComponent("ModuleCardsInit_09");
                cardsInit.init(cards0[i]);
            }
            for (let i = 0; i < cards1.length; i++) {
                let nodePlayCards = cc.instantiate(this.preCards);
                this.nodeDan.active = true;
                nodePlayCards.parent = this.nodeDan;
                if (bool) {
                    this.action(nodePlayCards, i);

                }
                let cardsInit = nodePlayCards.getComponent("ModuleCardsInit_09");
                cardsInit.init(cards1[i]);
                // cardsInit.init(cards1[i]);
            }
        } else if (data.type == "DUI" || data.type == "DAN") {

            for (let i = 0; i < newCards.length; i++) {
                let nodePlayCards = cc.instantiate(this.preCards);
                nodePlayCards.parent = this.nodeFirst;


                // if (TableInfo.currentPlayer == data.idx) {
                //     nodePlayCards.scale = 1.3;
                //     let ep = cc.scaleTo(0.03, 1);
                //     nodePlayCards.runAction(ep);
                // } else {
                this.action(nodePlayCards, i);
                // }

                let cardsInit = nodePlayCards.getComponent("ModuleCardsInit_09");
                cardsInit.init(newCards[i]);
            }
        } else {
            newCards.forEach((c, i) => {
                let nodePlayCards = cc.instantiate(this.preCards);
                nodePlayCards.y += 30;
                if (nodePlayCards)
                    nodePlayCards.opacity = 0;
                nodePlayCards.parent = this.nodeFirst;

                let ap = cc.moveBy(0.1, cc.v2(0, -30));//.easing(cc.easeSineInOut());
                let bp = cc.fadeIn(0.1);
                let cp = cc.spawn(ap, bp);
                let dp = cc.delayTime(0.02 * (i + 1));
                nodePlayCards.runAction(cc.sequence(dp, cp));

                let cardsInit = nodePlayCards.getComponent("ModuleCardsInit_09");
                cardsInit.init(c);
            })
        }
    },
});
