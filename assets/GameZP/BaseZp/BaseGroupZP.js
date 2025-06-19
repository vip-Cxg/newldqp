let connector = require('Connector');
let PACK = require('PACK');
let ROUTE = require('ROUTE');
let cache = require('Cache');
let gameInfo = require('TableInfo');
let db = require('DataBase');
cc.Class({
    extends: cc.Component,

    properties: {
        card: [cc.Node],
        bg: cc.Sprite,
        bgSf: cc.SpriteFrame
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (data, quest, summary, specialWai) {
        //cc.log('BaseGroupZp',data);
        switch (data.type) {
            case 'wai':
                for (let i = 0; i < 3; i++) {
                    let sprBack = this.card[i].getChildByName('back');
                    if (data.type == 'wai') {
                        if (!summary) {
                            sprBack.active = (i != 0 || (data.idx != gameInfo.idx && db.gameType != 6 && db.gameType != 25));
                        } else {
                            sprBack.active = i != 0;
                        }
                    }
                    this.card[i].active = true;
                    this.card[i].getComponent('BaseCardZP').init(data.type == 'wai' ? data.card : data.cards[i]);
                    if (specialWai && data.type == 'wai')
                        this.card[2].active = false;
                }
                break;
            case 'dui':
            case 'men':
            case 'shun':
            case 'bi':
            case 'dan':
            case 'chi':
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
                    if (db.gameType == 17 || db.gameType == 19) {
                        if (data.type == 'wei') {
                            if (!summary) {
                                sprBack.active = (i != 0 || (data.idx != gameInfo.idx));
                            } else {
                                sprBack.active = i != 0;
                            }
                        }
                    } else {
                        sprBack.active = (data.type == 'wei' && i != 0 && !summary);
                        if (i == 0) {
                            sprBack.active = (data.type == 'wei' && !summary && data.idx != gameInfo.idx && data.mask);
                        }
                    }
                    this.card[i].active = true;
                    this.card[i].getComponent('BaseCardZP').init(data.cards ? data.cards[i] : data.card);
                }
                break;
            case 'ti':
            case 'piao':
            case 'pao':
            case 'liu':
                if ((data.type == 'liu' && summary) || (data.type == 'piao' && summary)) {
                    if (data.cards)
                        data.card = data.cards[0];
                }
                for (let i = 0; i < 4; i++) {
                    let sprBack = this.card[i].getChildByName('back');
                    if (data.type == 'liu') {
                        if (db.gameType == '17') {
                            if (!summary) {
                                sprBack.active = (i != 0 || (data.idx != gameInfo.idx));
                            } else {
                                sprBack.active = i != 0;
                            }
                        } else {
                            sprBack.active = (i != 0 || (data.src == 'HANDS' && data.idx != gameInfo.idx));
                            if (summary)
                                sprBack.active = i != 0;
                        }
                    } else {
                        if (i == 0) {
                            sprBack.active = (data.type == 'ti' && !summary && data.idx != gameInfo.idx && data.mask);
                            // sprBack.active = (data.type == 'ti' && i != 0 && !summary);
                        } else {
                            sprBack.active = (data.type == 'ti' || data.type == 'liu');
                        }
                    }
                    this.card[i].active = true;
                    this.card[i].getComponent('BaseCardZP').init(data.card);

                }
                break;
            default:
            //cc.log(data.type);
        }
        this.type = data.type;
        this.cardValue = data.card;
        this.xi = data.xi;
        this.src = data.src;
        this.cards = data.cards || null;

        if (quest.bg)
            this.bg.spriteFrame = this.bgSf;

        if (quest.click) {
            this.node.on('touchend', () => {
                if (db.gameType == 6) {
                    connector.gameMessage(ROUTE.CS_ANSWER, { serialID: gameInfo.serialID, answer: data.idx, card: gameInfo.currentCard, tag: data.tag || null });
                } else {
                    connector.gameMessage(ROUTE.CS_ANSWER, { serialID: gameInfo.serialID, answer: data.idx, card: gameInfo.currentCard });
                }

                this.node.parent.parent.active = false;
            })
        }
    },

    resetStatus: function () {
        //cc.log('resetStatus',this.type);
        if (this.type != 'pao' || this.type != 'ti')
            return;
        this.card.forEach((c, i) => {
            //cc.log('resetStatus=========',this.type);
            let sprBack = c.getChildByName("back");
            // sprBack.active = false;
            sprBack.active = this.type != pao || (this.type == 'ti' && i == 0);
        })
    },

    remove: function () {

        if(this.node){
            this.node.destroy();
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
})
