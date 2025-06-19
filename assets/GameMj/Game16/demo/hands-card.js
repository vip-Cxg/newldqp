import { GameConfig } from "../../../GameBase/GameConfig";
import ROUTE from "../../../Main/Script/ROUTE";
import TableInfo, { players } from "../../../Main/Script/TableInfo";
import Queue from "./queue";
import utils from "../../../Main/Script/utils";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import AudioCtrl from "../../../Main/Script/audio-ctrl";
import logic from '../../../GamePoker/Game07/Script/Logic07';

const { ccclass, property } = cc._decorator
const CardScale = 1.3;

@ccclass
export default class HandsCard extends cc.Component {

    /**牌组显示区 */
    @property(cc.Prefab)
    preCard = null;
    @property(cc.Node)
    btnPlayCards = null;
    @property(cc.Node)
    btnTips = null;

    nodeCards = [];
    nodeLbl = [];

    _handsCard = [];

    /**手牌 */
    get handsCard() {
        return this._handsCard;
    }
    set handsCard(v) {
        if (this._handsCard == v) return;
        this._handsCard = v;
        this.renderHandCards();
    }
    cutCards(hands) {
        this._handsCard = hands;
        this.renderHandCards(true);
    }
    onLoad() {
        if (GameConfig.isTest)
            this.touchEvent()
    }

    renderHandCards(anim = false) {
        this.node.destroyAllChildren();
        this.nodeCards = [];
        this.nodeLbl = [];
        if (this._handsCard.length == 0) return;

        let middle = Math.ceil(this._handsCard.length / 2);
        this._handsCard.forEach((card, x) => {
            let nodeCard = cc.instantiate(this.preCard);
            let objCard = nodeCard.getComponent("ModuleCards07");
            objCard.init(card);
            nodeCard.width = nodeCard.width * CardScale;
            nodeCard.height = nodeCard.height * CardScale;
            nodeCard.parent = this.node;
            nodeCard.name = card + "";
            nodeCard._prior = false;
            nodeCard._before = false;
            nodeCard.active = !anim;
            nodeCard._value = card;
            nodeCard.isZhankai = false;
            nodeCard.setPosition(-(this._handsCard.length / 2) * 70 - 30 + (x + 1) * 70, -this.node.height / 2 + nodeCard.height / 2);
            nodeCard.pos0 = cc.v2(nodeCard.x, nodeCard.y);
            nodeCard.pos1 = cc.v2(nodeCard.x, nodeCard.y + 15);
            nodeCard.zIndex = x;
            if (anim) {
                nodeCard.active = true;
                if (nodeCard)
                    nodeCard.opacity = 0;
                nodeCard.runAction(cc.sequence(cc.delayTime(x / this._handsCard.length), cc.fadeIn(0.2)));
            }
            this.nodeCards.push(nodeCard);
        });
    }

    /**移除手中该牌组 */
    removeHandsCard(hands = []) {
        if (hands.length == 0) return;
        let oldHands = this.handsCard.concat();
        hands.forEach(card => {
            for (let x = 0; x < oldHands.length; x++) {
                let idx = oldHands.findIndex(c => card == c);
                if (idx >= 0) {
                    oldHands.splice(idx, 1);
                    return;
                }
            }
        });
        this.handsCard = oldHands;

    }
    touchEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            this.onTouchBegan(event, "touchstart");
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            this.onTouchBegan(event, "touchmove");
        });
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.nodeCards.forEach(card => {
                let cardMask = card.getChildByName("bgCardMask");
                cardMask.active = false;
            });
            this.checkCurrent();
        });
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            this.checkCurrent();
        });

    }

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
    }

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
        AudioCtrl.getInstance().playSFX(url);

    }


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
        let btnPlay = this.btnPlayCards.getComponent(cc.Button);
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
                Cache.alertTip("必须带黑桃三");
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
                Cache.alertTip("下家已报单,出单牌必须出手中最大的");
            }
        }
    }

    /**提示 */
    tipsStart(autoplay) {
        let newHands = [];
        let newCurrent;
        this.handsCard.forEach(card => {
            newHands.push(card);
        });
        let results = logic.autoplay(newHands, TableInfo.current, this.node.tipsTime, TableInfo.config);

        if (results == null)
            return;
        let result = results[this.node.tipsTime % results.length]
        if (result == null || result.length == 0) {
            return;
        }
        TableInfo.tipResult = [];
        TableInfo.tipResult = result;
        this.node.tipsTime++;
        this.nodeCards.forEach(card => {
            let bgCardMask = card.getChildByName("bgCardMask");
            bgCardMask.active = false;
            card._prior = false;
            card.setPosition(card.pos0);
        });
        result.forEach(c => {
            for (let x = 0; x < this.nodeCards.length; x++) {
                let card = this.nodeCards[x];
                if (card._value == c && !card._prior) {
                    card._prior = true;
                    card.position = card.pos1;
                    return;
                }
            }
        });
        this.checkCurrent();
    }

    /**出牌 */
    acChupai() {   //出牌按钮
        if (this.btnPlayCards._last == null)
            this.btnPlayCards._last = 0;
        if (new Date().getTime() - this.btnPlayCards._last < 1000)
            return;
        this.btnPlayCards._last = new Date().getTime();
        let emp = JSON.parse(JSON.stringify(TableInfo.select));
        Connector.gameMessage(ROUTE.CS_PLAY_CARD, emp.cards, true);
    }
    changeBtn(boolean) {
        this.btnPlayCards.active = boolean;
        this.btnTips.active = boolean;
    }


    playCard() {
        this.changeBtn(true);
        this.node.tipsTime = 0;
        this.btnTips.getComponent(cc.Button).interactable = TableInfo.current != null;
        this.tipsStart();
    }

}
