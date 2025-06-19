// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
let config = require('./MJGameConfig');
let TableInfo = require('TableInfo');
let connector = require('Connector');
let ROUTE = require('ROUTE');
const { GameConfig } = require('../../../GameBase/GameConfig');
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
    /**重制 */
    reset() {
        this._hands = [];
        this.node.destroyAllChildren();
    },
    /**出牌 */
    outCard(card) {
        this.resetSameCard();
        cc.playCard = false;
        connector.gameMessage(ROUTE.CS_OUT_CARD, { card: card, serialID: TableInfo.serialID });
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
        cc.find('Canvas/nodeTable').getComponent('SceneTable16').ground.forEach((g, i) => {
            if (i < TableInfo.options.person) {
                g.showSameCard(this.current._card);
            }
        })
    },

    resetSameCard() {
        cc.find('Canvas/nodeTable').getComponent('SceneTable16').ground.forEach((g, i) => {
            if (i < TableInfo.options.person) {
                g.resetSameCard(this.current);
            }
        })
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
                    this.outCard(this.current._card);
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
            cc.find('Canvas/nodeTable').getComponent('SceneTable16').checkHu(data, true);
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
        if (this.current.y > 160) {
            console.log("1111");
            this.outCard(this.current._card);
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
            if (nodeCard.getCard) {
                nodeCard.setPosition(cc.v2(cc.winSize.width / 2 - nodeCard.width / 2, (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2));
            } else {
                nodeCard.setPosition(cc.v2(cc.winSize.width / 2 - nodeCard.width - (nodeCard.width) * (cardCount - i), (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2));
            }
            this._hands.push(nodeCard);
        });
    },

    newCard(value, parent) {
        let nodeCard = cc.instantiate(this.selfCard);
        this.node.addChild(nodeCard);
        nodeCard._card = value;
        nodeCard.ting = false;
        nodeCard.getComponent('ModuleCards16').init(value, GameConfig.FitScreen == 0 ? 0.96 : 1.16, true);

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
        cc.find('Canvas/nodeTable').getComponent('SceneTable16').checkHu(data);
    },

    sortCards(get) {

        if (this.moveTime > 5) {
            this.checkedCard = null;
            cc.find('Canvas/nodeTable').getComponent('SceneTable16').bgTing.active = false;

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
            // nodeCard.setPosition(-cc.winSize.width / 2 + (nodeCard.width - 7) * (i + 1) + (nodeCard.getCard ? 0 : -20), (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2);
            // if (nodeCard.getCard) {
            //     nodeCard.setPosition(cc.v2(cc.winSize.width / 2 - nodeCard.width, (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2));
            // } else {
            //     nodeCard.setPosition(cc.v2(cc.winSize.width / 2  - nodeCard.width - (nodeCard.width ) * (cardCount - i), (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2));
            // }
            if (nodeCard.getCard) {
                nodeCard.setPosition(cc.v2(cc.winSize.width / 2 - nodeCard.width / 2, (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2));
            } else {
                nodeCard.setPosition(cc.v2(cc.winSize.width / 2 - nodeCard.width - (nodeCard.width) * (cardCount - i), (nodeCard == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + nodeCard.height / 2 + 20 : -this.node.height / 2 + nodeCard.height / 2));
            }
            // node.setPosition(-cc.winSize.width/2+20+ i * (node.width - 7) + (node.getCard ? 0 : -20) + deviation, (node == this.checkedCard && this.moveTime < 5) ? -this.node.height / 2 + node.height / 2+20 : -this.node.height / 2 + node.height / 2);
            // node.setPosition(config.GAME_HZMJ.FIRST_CARD_POS.x + i * config.GAME_HZMJ.CARD_RECT + (node.getCard ? 0 : -20) + deviation, (node == this.checkedCard && this.moveTime < 5) ? config.GAME_HZMJ.FIRST_CARD_POS.y + 20 : config.GAME_HZMJ.FIRST_CARD_POS.y);
            if (nodeCard.getCard && !nodeCard.allGet && get) {
                nodeCard.allGet = true;
                nodeCard.runAction(
                    cc.sequence(
                        cc.callFunc(() => {
                            nodeCard.setPosition(nodeCard.x, nodeCard.y + 50);
                        }),
                        cc.delayTime(0.2),
                        cc.moveBy(0.2, 0, -50),
                        cc.moveBy(0.1, 0, 10),
                        cc.moveBy(0.1, 0, -10),
                        cc.moveBy(0.1, 0, 1.5),
                        cc.moveBy(0.1, 0, -1.5),
                    )
                )
            }
        })
    },

    getCard(card) {
        this.checkedCard = null;
        let node = this.newCard(card, this.node);
        //node.opacity = 150;
        node.getCard = true;
        node.allGet = false;
        this._hands.push(node);
        this.sortCards(true);
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

//自己前后 上5下4
//显示流水
//每日不提醒
//


// 1.结算流水时间由1小时改为10分钟
// 2.总排行榜只显示自身排名和上5下4的代理排名
// 3.总排行榜新增显示流水
// 4.玩家每次进入大厅弹出活动界面,新增今日不再提示功能
// 5.每天奖励发放后会弹出提示语: 当前只需多拉"1"个用户，您的流水会增加"300"分！每天即可领取超"20"元的活动奖励
// 6.代理无需进入代理页面即可查看到自身排名





// 一.每个用户在活动界面都有自己专属的推广二维码, 通过二维码下载的新用户绑定到该用户账号下;

// 二.新增用户在规定时间内完成指定游戏局数或者达到一定流水, 推广者即可获得相应奖励
// 一阶段: 用户拉取两个或以上用户才可进入二阶段
// 二阶段(六个指标 每个指标只可领一次奖励 连续中断重新计时)
// 1.新用户   当日流水达到500元       上级用户奖励 2元;
// 2.连续三日 每日流水达到500元       上级用户奖励 10元;
// 3.连续五日 每日流水达到500元       上级用户奖励 20元;
// 4.连续一周 每日流水达到500元       上级用户奖励 50元;
// 5.连续两周 每日流水达到500元       上级用户奖励 100元;
// 6.连续一月 每日流水达到500元       上级用户奖励 200元; 总共 15000元流水

// 三阶段
// 1.累计3个新用户完成阶段二的六个任务     奖励 30元;
// 2.累计5个新用户完成阶段二的六个任务     奖励 50元;
// 3.累计10个新用户完成阶段二的六个任务    奖励 100元;
// 4.累计20个新用户完成阶段二的六个任务     奖励 500元;
// 4.累计50个新用户完成阶段二的六个任务     奖励 1500元;

// 特殊奖励
// 1.当月2个用户完成阶段二的六个任务  奖励 2000元;
// 2.当月5个用户完成阶段二的六个任务  奖励 5000元;
// 3.当月10个用户完成阶段二的六个任务  奖励 15000元;


// 三.用户可以在活动页面查看自己下级用户具体对要求的完成进度

// 四.新增用户达成指定条件, 系统自动将对应奖励发放至用户的幸运积分中, 并会发邮件提醒.



//     每日活跃 

//     活跃度达到每档要求即可领取奖励
//     第一档   30分   1元
//     第二档   60分   3元
//     第三档   80分   5元
//     第四档   100分  10元
//     第五档   120分  20元
//     第六档   150分  50元
//     第七档   200分  100元

//     活跃度任务
//     交易所交易一次  10分;
//     20小局游戏 10分;
//     80小局游戏 20分
//     // 200小局游戏 50分
//     与5个不同玩家完成对局  10分;
//     当日流水达到500元  10分
//     当日流水达到3000元  20分
//     // 当日流水达到2000元  50分
//     邀请一个新玩家 20分   限制3人    60
//     新玩家每完成上述任务一个 奖上级用户10分     最多70分



//     成就
//     自身累计完成 30个任务  奖 20元
//     自身累计完成 60个任务  奖 50元
//     自身累计完成 90个任务  奖 80元
//     自身累计完成 200个任务  奖 300元
//     自身累计完成 400个任务  奖 800元
//     自身累计完成 1000个任务  奖 2000元

//     下级用户累计完成 100个任务  奖 20元
//     下级用户累计完成 200个任务  奖 50元
//     下级用户累计完成 500个任务  奖 150元
//     下级用户累计完成 1000个任务  奖 330元
//     下级用户累计完成 3000个任务  奖 1100元
//     下级用户累计完成 5000个任务  奖 2000元




//系统生成的分:交易所奖励分和交易所活动,    bug打出负分(2万  杰哥转3万)   安全性不够 代理偷分(一笔一万多的  对半分)
