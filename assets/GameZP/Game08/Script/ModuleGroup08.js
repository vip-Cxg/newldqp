let connector = require('Connector');
let PACK = require('PACK');
let ROUTE = require('ROUTE');
let cache = require('Cache');
let TableInfo = require('TableInfo');
cc.Class({
    extends: cc.Component,

    properties: {
        card: [cc.Node]
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (data, quest, summary) {
        cc.log(data);
        switch (data.type) {
            case 'dui':
            case 'men':
            case 'shun':
            case 'bi':
            case 'chi':
                cc.log(data);
                data.cards.forEach((c, i) => {
                    this.card[i].active = true;
                    this.card[i].getComponent('BaseCardZP').init(c);
                });
                break;
            case 'peng':
            case 'wei':
            case 'kan':
                for (let i = 0; i < 3; i++) {
                    let sprBack = this.card[i].getChildByName('back');
                    cc.log(sprBack);
                    sprBack.active = (data.type == 'wei' && i != 0 && !summary);
                    this.card[i].active = true;
                    this.card[i].getComponent('BaseCardZP').init(data.card);
                }
                break;
            case 'ti':
            case 'piao':
            case 'pao':
            case 'liu':
                for (let i = 0; i < 4; i++) {
                    let sprBack = this.card[i].getChildByName('back');
                    cc.log(sprBack);
                    sprBack.active = (data.type == 'ti' && i != 0 && !summary);
                    this.card[i].active = true;
                    this.card[i].getComponent('BaseCardZP').init(data.card);
                }
                break;
            default:
                cc.log(data.type);
        }
        cc.log('Group => init()', data.card);
        this.type = data.type;
        cc.log('GROUP+++++++++++++_______________', data);
        this.cardValue = data.card;
        this.xi = data.xi;
        if (quest) {
            this.node.on('touchend', () => {
                connector.gameMessage(ROUTE.CS_ANSWER, { serialID: TableInfo.serialID, answer: data.idx, card: TableInfo.currentCard });
                this.node.parent.parent.active = false;
            })
        }
    },

    resetStatus: function () {
        cc.log('resetStatus', this.type);
        if (this.type != 'pao' || this.type != 'ti')
            return;
        this.card.forEach((c, i) => {
            cc.log('resetStatus=========', this.type);
            let sprBack = c.getChildByName("back");
            // sprBack.active = false;
            sprBack.active = this.type != pao || (this.type == 'ti' && i == 0);
        })
    },

    remove: function () {
        if (this.node)
            this.node.destroy();
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
})
