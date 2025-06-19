let logic = require("Logic_09");
let tbInfo = require("TableInfo");
let audioCtrl = require("audio-ctrl");

cc.Class({
    extends: cc.Component,

    properties: {
        preCard: cc.Prefab,
        nodeCards: [],
        PreLblNumbe: cc.Prefab,
        nodeLbl: [],
        nodeBtn: cc.Node,
        btnTips:cc.Node
    },

    refreshHandCards  (hands, bool) {
        this.node.destroyAllChildren();
        this.nodeCards = [];
        this.nodeLbl = [];
        let middle = Math.floor(hands.length / 2);
        hands.forEach((cards, x) => {
            let nodeCards = [];
            cards.forEach((card, y) => {
                let nodeCard = cc.instantiate(this.preCard);
                let objCard = nodeCard.getComponent("ModuleCardsInit_09");

                objCard.init(card);
                // objCard.init(card);
                nodeCard.parent = this.node;
                nodeCard._prior = false;
                nodeCard._before = false;
                nodeCard._value = card;
                // nodeCard.active = bool;
                nodeCard.isZhankai = false;
                nodeCards.push(nodeCard);
                nodeCard.setPosition(-(hands.length / 2) * 88 - 44 + (x + 1) * 88, -228 + y * (cards.length < 4 ? 50 : 12));
                // nodeCard.setPosition(-cc.winSize.width/2+200 + (5 - middle + x) * 88, -228 + y * (cards.length < 4 ? 50 : 12));
                nodeCard.pos0 = cc.v2(nodeCard.x, nodeCard.y);
                nodeCard.pos1 = cc.v2(nodeCard.x, nodeCard.y + 35 * y);
                nodeCard.zIndex = 12 - y + 2 * x;
                if (cards.length > 3 && y == cards.length - 1) {
                    let nodeLabel = cc.instantiate(this.PreLblNumbe);
                    nodeLabel.zIndex = 12 - y + 2 * x;
                    nodeLabel.parent = this.node;
                    // nodeLabel.active = bool;
                    nodeLabel.scale = 0.7;
                    nodeLabel.setPosition(-(hands.length / 2) * 88 - 44 + (x + 1) * 88, -228 + y * 12 + 60);
                    // nodeLabel.setPosition(-cc.winSize.width/2+200 + (5 - middle + x) * 88, -228 + y*12 +60);
                    let lbStr = nodeLabel.getChildByName("lblCount").getComponent(cc.Label);
                    lbStr.string = hands[x].length;
                    this.nodeLbl.push(nodeLabel);
                }
            });
            this.nodeCards.push(nodeCards);
        });
    },


    touchEvent  () {
        this.node.on("touchstart", (event) => {
            this.onTouchBegan(event, "touchstart");
        });
        this.node.on("touchmove", (event) => {
            this.onTouchBegan(event, "touchmove");
        });
        this.node.on("touchend", () => {
            this.nodeCards.forEach(group => {
                group.forEach(card => {
                    if (card.parent != null) {
                        let cardMask = card.getChildByName("bgCardMask");
                        card._prior = cardMask.active;
                    }
                })
            });
            this.checkCurrent();
        });
        this.node.on("touchcancel", () => {
            this.checkCurrent();
        });

    },

    onTouchBegan (event, touchType) {
        tbInfo.isWai = true;
        let nodePosition = event.target.convertToNodeSpaceAR(event.getLocation());
        if (this.nodeCards.length != 0) {
            for (let x = 0; x < this.nodeCards.length; x++) {
                for (let y = 0; y < this.nodeCards[x].length; y++) {
                    let sprCard = this.nodeCards[x][y];
                    if (this.nodeCards[x][y].parent != null) {
                        let rect = this.nodeCards[x][y].getBoundingBox();
                        if (this.nodeCards[x].length < 4 && y != 0) {
                            rect.y = rect.y + 72;
                            rect.height = 50;
                        }
                        if (this.nodeCards[x].length > 3 && y != 0) {
                            if (sprCard.isZhankai) {
                                rect.y = rect.y + 77;
                                rect.height = 48;
                            }
                        }
                        let contain = rect.contains(nodePosition);
                        if (contain) {
                            tbInfo.isWai = false;
                            this.checkStatus(sprCard, x, y, touchType);
                        }
                    }
                }
            }
        }
        if (tbInfo.isWai) {
            this.nodeCards.forEach(group => {
                group.forEach(card => {
                    if (group.length > 3 && card.parent != null) {
                        card.isZhankai = false;
                        card.position = card.pos0;
                    }
                })
            })


            this.changeNodeOpacity(true,2);
        }
    },

    checkStatus  (node, x, y, touchType) {
        let bgCardMask = node.getChildByName("bgCardMask");
        if (tbInfo.tipResult != null && tbInfo.tipResult.length > 0 && tbInfo.tipResult.length != 3) {
            tbInfo.tipResult.forEach(c => {
                for (let x = 0; x < this.nodeCards.length; x++) {
                    for (let y = 0; y < this.nodeCards[x].length; y++) {
                        let card = this.nodeCards[x][y];
                        let bgCardMask = card.getChildByName("bgCardMask");
                        if (card._value == c && bgCardMask.active) {
                            bgCardMask.active = false;
                            card._prior = false;
                            tbInfo.tipResult = [];
                        }
                    }
                }
            });
        }
        if (bgCardMask.active != node._prior) {
            return;
        }
        let url = cc.url.raw(`resources/Audio/Common/cardEffect.mp3`);
        let isOpen = false;
        //audioCtrl.getInstance().playSFX(url);
        if (this.nodeCards[x].length < 4) {
            if (touchType == "touchmove" && bgCardMask.active == this.firstCheck) {
                return;
            }
            if (touchType == "touchstart")
                this.firstCheck = !bgCardMask.active;
            bgCardMask.active = !bgCardMask.active;
            audioCtrl.getInstance().playSFX(url);
            this.nodeCards.forEach(group => {
                group.forEach(card => {
                    if (group.length > 3) {
                        card.isZhankai = false;
                        card.position = card.pos0;
                    }
                })
            })
        } else {
            this.nodeCards.forEach((group, i) => {
                group.forEach((card, j) => {
                    if (i == x) {
                        isOpen = true;
                        if (!card.isZhankai) {
                            card.position = card.pos1;
                            card.isZhankai = true;
                        } else {
                            if (j == y) {
                                if (touchType == "touchmove" && bgCardMask.active == this.firstCheck) {
                                    return;
                                }
                                if (touchType == "touchstart")
                                    this.firstCheck = !bgCardMask.active;
                                bgCardMask.active = !bgCardMask.active;
                                audioCtrl.getInstance().playSFX(url);
                            }
                        }
                    } else {
                        card.position = card.pos0;
                        card.isZhankai = false;
                    }
                })
            });
        }
        this.changeNodeOpacity(!isOpen,1);
    },

    /**展开牌组隐藏出牌按钮 */
    changeNodeOpacity(isShow,indx) {
        this.btnTips.active=this.nodeBtn.active&&!isShow;
        this.nodeBtn.children.forEach((e) => {
            e.active=true;
            let ap = cc.fadeOut(0.1);
            let bp = cc.fadeIn(0.1);
            e.stopAllActions();
            let cp=cc.sequence(isShow ? bp : ap,cc.callFunc(()=>{
                e.active=isShow;
            }))
            e.runAction(cp);
        })
    },

    checkCurrent  () {
        tbInfo.select = null;
        let playCards = [];
        for (let i = 0; i < this.nodeCards.length; i++) {
            this.nodeCards[i].forEach(c => {
                if (c.parent != null) {
                    let cardMask = c.getChildByName("bgCardMask");
                    if (cardMask.active) {
                        playCards.push(c._value);
                    }
                }
            })
        }
        let btnPlay = this.nodeBtn.getChildByName("btnPlayCards").getComponent(cc.Button);
        let cardList = logic.decode(playCards, tbInfo.config.shun);
        if (cardList == null) {
            btnPlay.interactable = false;
            return;
        }
        if (tbInfo.current != null)
            cardList = cardList.filter(c => logic.compare(tbInfo.current, c));
        if (cardList.length > 0 && cardList.length < 4) {
            let sp = cardList[0];
            if (sp.card == 14 && sp.count == 2 && (sp.type == "FEIJI" || sp.type == "LIANDUI"))
                cardList = [cardList[0]];
        }
        if (cardList.length == 2) {
            let sp = cardList[0];
            if (sp.card == 13 && sp.count == 3 && (sp.type == "FEIJI"))
                cardList = [cardList[0]];
        }
        btnPlay.interactable = cardList.length > 0;
        tbInfo.select = cardList;
    },
});