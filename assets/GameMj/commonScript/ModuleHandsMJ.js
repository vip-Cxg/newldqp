// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
let config = require('../Game16/Script/MJGameConfig');
let tbInfo = require('TableInfo');
let connector = require('Connector');
let ROUTE = require('ROUTE');
const { GameConfig } = require('../../GameBase/GameConfig');
const { card } = require('../../Main/Script/DataBase');
const Cache = require('../../Main/Script/Cache');
const { App } = require('../../script/ui/hall/data/App');
cc.Class({
    extends: cc.Component,

    properties: {
        _hands: [],
        selfCard: cc.Prefab,
        checkedCard: null,
        touchTime: 0,
        lastCard: null
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.checkTing = false;
        this.node.on("touchstart", (event) => {
            this.touchstart(event);
        });
        this.node.on("touchmove", (event) => {
            this.touchmove(event);
        });
        this.node.on("touchend", (event) => {
            this.touchend(event);
        });
        this.node.on("touchcancel", (event) => {
            this.touchend(event);
        });
    },

    showTing() {
        this._hands.forEach(node => {
            if (node)
                node.getChildByName('ting').active = node.ting;
        })
    },
    hideTing() {
        this._hands.forEach(node => {
            if (node) {
                node.ting = false;
                node.getChildByName('ting').active = node.ting;
            }

        })
    },
    /**重制 */
    reset() {
        this._hands = [];
        this.node.destroyAllChildren();
    },
    /**出牌 */
    outCard(card) {
        if (card > 40) { //不能出花牌
            Cache.alertTip('不能出花牌');
            this.touchcancel();
            return;
        }
        this.resetSameCard();
        cc.playCard = false;
        connector.gameMessage(ROUTE.CS_OUT_CARD, { card: card, serialID: tbInfo.serialID });
        this._hands[this.current._pos] = null;
        this.current.destroy();
        this.current = null;
        this._hands.forEach(node => {
            if (node) {
                node.getCard = false;
            }
        });
        this.checkedCard = null;
        this.sortCards();
        this._hands.forEach(card => card.ting = false);
        this.showTing();
    },
    /**自动出牌 */
    autoSortCard(card) {
        this.resetSameCard();
        cc.playCard = false;
        console.log("当前打出牌---,",card, this.current)
        if (this.current) {

            this._hands[this.current._pos] = null;
            this.current.destroy();
        } else {
            let i = this._hands.findIndex(e => e._card == card);
            if(i!=-1){
                this._hands[i].destroy();
                this._hands[i] = null;
            }
        }


        this.current = null;


        this._hands.forEach(node => {
            if (node) {
                node.getCard = false;

            }
        });
        this.checkedCard = null;
        this.sortCards();
        this._hands.forEach(card => card.ting = false);
        this.showTing();
    },

    /**移除手牌
     * @param card 牌
     * @param count 数量
     */
    removeCard(card, count = 1) {

        let num = 0;
        for (let y = 0; y < this._hands.length; y++) {
            if (num >= count)
                return;
            if (card == this._hands[y]._card) {
                this._hands[y].destroy();
                this._hands.splice(y, 1);
                y--;
                num++;
            }
        }
    },
    showSameCard() {
        if (this.current == null)
            return;
        //TODO 发送事件代替
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.HNMJ_SHOW_SAME_CARD, this.current._card)
        // cc.find('Canvas/nodeTable').getComponent('SceneTable16').ground.forEach((g, i) => {
        //     if (i < tbInfo.config.person) {
        //         g.showSameCard(this.current._card);
        //     }
        // })
    },

    resetSameCard() {
        //TODO 发送事件代替 
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.HNMJ_RESET_SAME_CARD)
        // cc.find('Canvas/nodeTable').getComponent('SceneTable16').ground.forEach((g, i) => {
        //     if (i < tbInfo.config.person) {
        //         g.resetSameCard();
        //     }
        // })
    },

    touchstart(event) {
        this.moveTime = 0;

        if (this.current != null || !cc.playCard)
            return;
        this.checkTing = true;
        this._hands.forEach((cards, i) => {
            let sprCard = cards;
            let rect = cards.getBoundingBox();
            let nodePosition = event.target.convertToNodeSpaceAR(event.getLocation());
            if (rect.contains(nodePosition)) {
                this.current = sprCard;
                if (new Date().getTime() - this.touchTime < 300 && this.lastCard == this.current) {
                    this.touchTime = 0;
                    //出牌
                    this.outCard(this.current._card);
                    // connector.gameMessage(ROUTE.CS_OUT_CARD, { card: this.current._card, serialID: tbInfo.serialID });
                    this.sortCards();
                    event.stopPropagation();
                    return;
                }
                this.lastCard = this.current;
                this.touchTime = new Date().getTime();
                this.checkedCard = this.current;
                //this.calcTing();
                this.showSameCard();
            }
        });
    },

    touchmove(event) {
        if (!cc.playCard) {
            return;
        }
        if (this.current == null)
            return;
        let loc = event.target.convertToNodeSpaceAR(event.getLocation());
        let loc1 = event.target.convertToWorldSpaceAR(event.getLocation());

        // new cc.Node().convertToWorldSpaceAR //convertToNodeSpaceAR

        this.current.position = loc;
        // cc.find('Canvas/nodeTable/playCardMask').active = loc.y < 120;
        this.current.zIndex = 100;
        this.moveTime++;
        // if(this.moveTime > 5)
        //     this.calcTing(this.current);
        if (this.checkTing) {
            let data = this.current == null ? null : this.current._card;
            //TODO 发送事件代替
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.HNMJ_CHECK_HU, { card: data, showTing: true });
            // cc.find('Canvas/nodeTable').getComponent('SceneTable16').checkHu(data, true);
        }
        // this.calcTing();
        this.checkTing = false;
    },

    touchend(event) {
        if (!cc.playCard)
            return;
        if (this.checkedCard == null)
            this.resetSameCard();
        if (this.current == null)
            return;
        if (this.checkTing)
            this.calcTing();
        if (this.current.y > 80) {
            this.outCard(this.current._card);
            // connector.gameMessage(ROUTE.CS_OUT_CARD, { card: this.current._card, serialID: tbInfo.serialID });
            this.sortCards();
            return;
        }
        this.sortCards();
        this.moveTime = 0;

    },


    touchcancel(event) {
        this.moveTime = 0;
        this.resetSameCard();

        this.sortCards();
        if (this.checkTing)
            this.calcTing();
    },


    init(data, reconnect) {
        this._hands = [];
        this.node.destroyAllChildren();
        let getCard = null;
        if (data.hands.length % 3 == 2) {
            getCard = data.hands.pop();
        }
        data.hands.sort((a, b) => a - b);
        if (getCard != null) {
            data.hands.push(getCard);
        }
        let cardCount = getCard ? data.hands.length - 1 : data.hands.length;

        data.hands.forEach((card, i) => {


            let nodeCard = this.newCard(card, this.node);
            nodeCard._pos = i;
            nodeCard.getCard = getCard != null && i == data.hands.length - 1;
            nodeCard.isChecked = false;

            let totalWidth = this.node.width;//cc.winSize.width;
            // let totalWidth=cc.winSize.width;
            if (nodeCard.getCard) {
                nodeCard.setPosition(cc.v2(totalWidth / 2 - nodeCard.width / 2, (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2));
            } else {
                nodeCard.setPosition(cc.v2(totalWidth / 2 - nodeCard.width - (nodeCard.width) * (cardCount - i), (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2));
            }
            this._hands.push(nodeCard);
        });
    },

    newCard(value, parent) {
        let nodeCard = cc.instantiate(this.selfCard);
        nodeCard._card = value;
        nodeCard.ting = false;
        // nodeCard.getComponent('ModuleSelfCardsMJ').init(value, 0.9, true);
        nodeCard.getComponent('ModuleSelfCardsMJ').init(value, GameConfig.FitScreen == 0 ? 0.9 : 0.9, true);
        this.node.addChild(nodeCard);

        return nodeCard;
    },

    joinHands() {

        let length = 0;
        this._hands.forEach(card => { length += (card == null ? 0 : 1) });
        let baseIdx = 0;
        let hands = [];
        this._hands.forEach(node => {
            if (node)
                hands.push(node);
        });
        hands.sort((a, b) => {
            if (a.getCard) {
                return 1;
            } else if (b.getCard) {
                return -1;
            } else
                return a._card - b._card;
        });
        this._hands = [];
        hands.forEach(cards => {
            if (cards != null) {
                this._hands.push(cards);
                baseIdx++;
            }
        });
    },

    calcTing() {
        let data = this.current == null ? null : this.current._card;
        //TODO 发送事件代替
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.HNMJ_CHECK_HU, { card: data, showTing: false });
        // cc.find('Canvas/nodeTable').getComponent('SceneTable16').checkHu(data);
    },

    sortCards(get) {
        if (this.moveTime > 5) {
            this.checkedCard = null;
            //TODO 发送事件代替
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.HNMJ_HIDE_TING);
            // cc.find('Canvas/nodeTable').getComponent('SceneTable16').bgTing.active = false;
            this.resetSameCard();
        }
        this.current = null;
        this.joinHands();
        let length = 0;
        this._hands.forEach(card => { length += (card == null ? 0 : 1) });
        // let deviation = Math.floor((14 - length) / 3) * config.GAME_HZMJ.GROUND_RECT;
        let cardCount = this._hands[this._hands.length - 1].getCard ? this._hands.length - 1 : this._hands.length

        this._hands.forEach((nodeCard, i) => {
            nodeCard._pos = i;
            nodeCard.zIndex = 1;
            nodeCard.color = nodeCard == this.checkedCard && this.moveTime < 5 ? cc.color(227, 252, 126) : cc.color(255, 255, 255);
       
            let totalWidth = this.node.width;//cc.winSize.width;

            if (nodeCard.getCard) {
                nodeCard.setPosition(cc.v2(totalWidth / 2 - nodeCard.width / 2, (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2));
            } else {
                nodeCard.setPosition(cc.v2(totalWidth / 2 - nodeCard.width - (nodeCard.width) * (cardCount - i), (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2));
            }
            if (nodeCard.getCard && !nodeCard.allGet && get) {
                nodeCard.allGet = true;
                // nodeCard.runAction(
                //     cc.sequence(
                //         cc.callFunc(() => {
                //             nodeCard.setPosition(nodeCard.x, nodeCard.y + 50);
                //         }),
                //         cc.delayTime(0.2),
                //         cc.moveBy(0.2, 0, -50),
                //         cc.moveBy(0.1, 0, 10),
                //         cc.moveBy(0.1, 0, -10),
                //         cc.moveBy(0.1, 0, 1.5),
                //         cc.moveBy(0.1, 0, -1.5),
                //         cc.callFunc(() => {
                //             nodeCard.setPosition(nodeCard.x, nodeCard.y);
                //         })
                //     )
                // )
            }
        })
    },

    getCard(card) {
        if (typeof (card) == 'number') {
            this.checkedCard = null;
            let node = this.newCard(card, this.node);
            node.getCard = true;
            node.allGet = false;
            this._hands.push(node);
            this.sortCards(true);
        } else {
            card.forEach((e, i) => {
                this.checkedCard = null;
                let node = this.newCard(e, this.node);
                //node.opacity = 150;
                node.getCard = i == (card.length - 1);
                node.allGet = false;
                this._hands.push(node);
            })
            this.sortCards(true);

        }

    },

    // removeHands (card) {
    //     this.checkedCard = null;
    //     this._hands.forEach((cards,i)=>{
    //         cards.getCard = false;
    //         if(cards._card == card){
    //             cards.destroy();
    //             cards = null;
    //         }
    //     });
    //     this.sortCards();
    // }
    // update (dt) {},
});

