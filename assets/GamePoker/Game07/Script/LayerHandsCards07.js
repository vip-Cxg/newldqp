let logic = require("Logic07");
let TableInfo = require("TableInfo");
let audioCtrl = require("audio-ctrl");
let cache = require("../../../Main/Script/Cache");
const utils = require("../../../Main/Script/utils");
const { GameConfig } = require("../../../GameBase/GameConfig");
const CardScale = 1.3
cc.Class({
    extends: cc.Component,

    properties: {
        preCard: cc.Prefab,
        nodeCards: [],
        nodeLbl: [],
        btnPlayCard: cc.Node,
    },

    
    onLoad() {
        if (GameConfig.isTest)
            this.touchEvent();
    },
    refreshHandCards(hands, bool) {
        this.node.destroyAllChildren();
        this.nodeCards = [];
        this.nodeLbl = [];
        let middle = Math.ceil(hands.length / 2);
        hands.forEach((card, x) => {
            let nodeCard = cc.instantiate(this.preCard);
            let objCard = nodeCard.getComponent("ModuleCards07");
            objCard.init(card);
            nodeCard.width = nodeCard.width * CardScale;
            nodeCard.height = nodeCard.height * CardScale;
            nodeCard.parent = this.node;
            nodeCard.name = card + "";
            nodeCard._prior = false;
            nodeCard._before = false;
            nodeCard._value = card;
            nodeCard.active = bool;
            nodeCard.isZhankai = false;
            nodeCard.setPosition(-(hands.length / 2) * 77 - 30 + (x + 1) * 77, -this.node.height / 2 + nodeCard.height / 2);
            // nodeCard.setPosition(-380 + (8 - middle + x) * 53, -213);
            nodeCard.pos0 = cc.v2(nodeCard.x, nodeCard.y);
            nodeCard.pos1 = cc.v2(nodeCard.x, nodeCard.y + 15);
            nodeCard.zIndex = x;
            this.nodeCards.push(nodeCard);
        });
    },

    removeHandsCard(hands) {
        hands.forEach((card, index) => {

        })
    },
    touchEvent() {
        this.node.on("touchstart", (event) => {
            this.onTouchBegan(event, "touchstart");
        });
        this.node.on("touchmove", (event) => {
            this.onTouchBegan(event, "touchmove");
        });
        this.node.on("touchend", () => {
            this.nodeCards.forEach(card => {
                let cardMask = card.getChildByName("bgCardMask");
                cardMask.active = false;
            });
            this.checkCurrent();
        });
        this.node.on("touchcancel", () => {
            this.checkCurrent();
        });

    },

    onTouchBegan(event, touchType) {
        TableInfo.isWai = true;
        let nodePosition = event.target.convertToNodeSpaceAR(event.getLocation());
        if (this.nodeCards.length != 0) {
            for (let x = 0; x < this.nodeCards.length; x++) {
                let sprCard = this.nodeCards[x];
                let rect = this.nodeCards[x].getBoundingBox();
                if (x != this.nodeCards.length - 1) {
                    rect.width = this.nodeCards[x + 1].x - this.nodeCards[x].x;
                }
                let contain = rect.contains(nodePosition);
                if (contain) {
                    TableInfo.isWai = false;
                    this.checkStatus(sprCard, touchType);
                }

            }
        }
    },

    checkStatus(node, touchType) {
        let bgCardMask = node.getChildByName("bgCardMask");
        let url = cc.url.raw(`resources/Audio/Common/cardEffect.mp3`);
        if (touchType == "touchmove" && node._prior == this.firstCheck) {
            bgCardMask.active = true;
            return;
        }
        if (touchType == "touchstart") {
            this.firstCheck = !node._prior;
            bgCardMask.active = true;
        }
        node._prior = !node._prior;
        node.position = node._prior ? node.pos1 : node.pos0;
        audioCtrl.getInstance().playSFX(url);

    },


    checkCurrent() {
        TableInfo.select = null;
        let playCards = [];
        let selectNodeCard = []
        this.nodeCards.forEach(c => {
            if (c._prior) {
                playCards.push(c._value);
                selectNodeCard.push(c);
            }
        });
        let btnPlay = this.btnPlayCard.getComponent(cc.Button);
        // let cardList = logic.decode(playCards, this.nodeCards.length, TableInfo.config, TableInfo.current);
        let newCardList = logic.checkCard(playCards, this.nodeCards.length, TableInfo.config, TableInfo.current);
        let cardList = null;
        if (!utils.isNullOrEmpty(newCardList.cardList))
            cardList = newCardList.cardList;

        if (!utils.isNullOrEmpty(newCardList.otherCard)) {
            selectNodeCard.forEach((node) => {
                if (newCardList.otherCard.indexOf(node._value) != -1) {
                    node.position = node.pos0;
                    node._prior = false;
                }
            })
        }


        if (cardList == null) {
            btnPlay.interactable = false;
            return;
        }
        btnPlay.interactable = logic.compare(TableInfo.current, cardList);
        let black = this.nodeCards.findIndex(card => card._value == 103);
        if (TableInfo.currentPlayer == TableInfo.idx && this.nodeCards.length == (TableInfo.config.ext ? 16 : 15) && black > 0 && TableInfo.config.black && TableInfo.turn == 1) {
            let idx = cardList.cards.findIndex(card => card == 103);
            if (idx < 0) {
                btnPlay.interactable = false;
                cache.alertTip("必须带黑桃三");
            }
        }
        TableInfo.select = cardList;

        let idxNext;
        if (TableInfo.options.person == 2) {
            idxNext = (TableInfo.currentPlayer + 1) % 2;
        } else {
            idxNext = (TableInfo.currentPlayer + 1) % 3;
        }
        if (TableInfo.currentPlayer == TableInfo.idx && btnPlay.interactable == true && cardList.type == "DAN" && TableInfo.baodan[idxNext] == true) {
            let myCards = [];
            let danCards = [];
            let maxCard = 0;
            this.nodeCards.forEach(c => myCards.push(c._value));
            let hands = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
            myCards.forEach(card => {
                hands[card % 100].push(card);
            });
            hands.forEach((cards, c) => {
                if (cards.length > 0)
                    danCards.push(cards[0] % 100);
            });
            danCards.forEach((card, i) => {
                maxCard = Math.max(card, maxCard);
            });
            if (cardList.card != maxCard) {
                btnPlay.interactable = false;
                cache.alertTip("下家已报单,出单牌必须出手中最大的");
            }
        }
    },
});