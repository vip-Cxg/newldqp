let logic = require("Logic07");
const TableInfo = require("../../../Main/Script/TableInfo");
cc.Class({
    extends: cc.Component,

    properties: {
        preCards: cc.Prefab,
        nodeFirst: cc.Node,
        nodeDan: cc.Node,
    },

    /**出牌动作 */
    action(card, i) {
        if (card)
            card.opacity = 0;
        card.scale = 1.4;
        card.runAction(cc.spawn(
            cc.scaleTo(0.02, 1),
            cc.fadeIn(0.02)
        ));
    },

    // use this for initialization
    init(data) {
        let newCards = logic.sortPlayedCard(data);
        let card = data.card;
        let firstCards = data.count * 3;
        let dan = data.cards.length - firstCards;
        let count = data.count;
        let cards0 = [], cards1 = [];
        if (data.type == "SAN" || data.type == "FEIJI") {
            for (let i = 0; i < data.cards.length; i++) {
                if (data.cards[i] % 100 >= card && data.cards[i] % 100 < (card + count) && cards0.filter(value => value % 100 == data.cards[i] % 100).length < 3) {
                    cards0.push(data.cards[i]);
                } else
                    cards1.push(data.cards[i]);
            }
            cards0.sort(logic.sortCard);
            cards1.sort(logic.sortCard);
            for (let i = 0; i < cards0.length; i++) {
                let nodePlayCards = cc.instantiate(this.preCards);
                nodePlayCards.parent = this.nodeFirst;
                this.action(nodePlayCards, i);
                let cardsInit = nodePlayCards.getComponent("ModuleCards07");
                cardsInit.init(cards0[i]);
            }
            for (let i = 0; i < cards1.length; i++) {
                let nodePlayCards = cc.instantiate(this.preCards);
                this.nodeDan.active = true;
                nodePlayCards.parent = this.nodeDan;
                this.action(nodePlayCards, i);
                let cardsInit = nodePlayCards.getComponent("ModuleCards07");
                cardsInit.init(cards1[i]);
            }
        } else if (data.type == "DUI" || data.type == "DAN") {

            for (let i = 0; i < newCards.length; i++) {
                let nodePlayCards = cc.instantiate(this.preCards);
                nodePlayCards.parent = this.nodeFirst;
                // if (TableInfo.currentPlayer == data.idx) {
                //     nodePlayCards.scale = 1.5;
                //     let ep = cc.scaleTo(0.03, 1);
                //     nodePlayCards.runAction(ep);

                // } else {
                //     this.action(nodePlayCards, i);
                // }
                    this.action(nodePlayCards, i);

                let cardsInit = nodePlayCards.getComponent("ModuleCards07");
                cardsInit.init(newCards[i]);
            }

            // newCards.forEach((c, i) => {

            // })
        } else {
            newCards.forEach((c, i) => {
                let nodePlayCards = cc.instantiate(this.preCards);
                nodePlayCards.y += 30;
                if (nodePlayCards)
                    nodePlayCards.opacity = 0;
                nodePlayCards.parent = this.nodeFirst;

                let ap = cc.moveBy(0.02, cc.v2(0, -30));//.easing(cc.easeSineInOut());
                let bp = cc.fadeIn(0.02);
                let cp = cc.spawn(ap, bp);
                let dp = cc.delayTime(0.02 * (i + 1));
                nodePlayCards.runAction(cc.sequence(dp, cp));

                let cardsInit = nodePlayCards.getComponent("ModuleCards07");
                cardsInit.init(c);
            })

        }
    },

    initRemainCard(data) {
        data.forEach(card => {
            let nodePlayCards = cc.instantiate(this.preCards);
            nodePlayCards.parent = this.nodeFirst;
            let cardsInit = nodePlayCards.getComponent("ModuleCards07");
            cardsInit.init(card);
        })
    },

    showCardAnim() {

    }
});
