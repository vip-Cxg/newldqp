let db = require('DataBase');
let HANDS_POS = { x: -500, y: -273 };//{ x: -400, y: -273 };
let CARD_RECT = { x: 97, y: 100 };//{ x: 77.6, y: 80 };
let gameInfo = require('TableInfo');
let connector = require('Connector');
let PACK = require('PACK');
let ROUTE = require('ROUTE');
let cache = require('Cache');
const { SC_SYNC_CARD } = require('../../Main/Script/ROUTE');
let GAME = [0, 0, 0, 0, 0, '05', 0, 0, 0, 0, '10'];

const cardScale = 1;

cc.Class({
    extends: cc.Component,

    properties: {
        // layoutHandCards: cc.Layout,
        // layoutAction: cc.Layout,
        // layoutChi: cc.Layout,
        // btnAction: [cc.Button],
        // layoutBi: cc.Layout,
        nodeCard: cc.Prefab,
    },

    // use this for initialization
    onLoad() {
        this.scirpt = [];
        for (let i = 0; i < 26; i++) {
            if (i == 5) {
                this.scirpt.push('SceneTable05');
            } else if (i == 25) {
                this.scirpt.push('ModuleScene25');
            } else if (i == 10) {
                this.scirpt.push('ModuleScene10');
            } else if (i == 6) {
                this.scirpt.push('SceneTable06');
            } else if (i == 22) {
                this.scirpt.push('SceneTable08');
            } else if (i == 8) {
                this.scirpt.push('SceneTable08');
            } else {
                this.scirpt.push('0');
            }
        }
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
            this.touchcancel(event);
        });
    },
    /**初始化手牌 */
    init(hands, reconnect) {
        this.dealCards = [];
        this.node.removeAllChildren();
        let tempHands = this.makeHands(hands, reconnect);
        this._hands = [[], [], [], [], [], [], [], [], [], [], [], [], []];
        let baseIdx = 6 - Math.floor(tempHands.length / 2);
        if (baseIdx > 0)
            baseIdx--;
        tempHands.forEach((cards, x) => {
            let pao = ((cards.filter(c => c != cards[0]).length == 0) && cards.length > 2) ? 1 : 0;
            cards.forEach((card, y) => {
                let sprCard = cc.instantiate(this.nodeCard);
                sprCard.scale = cardScale;//0.8
                sprCard.parent = this.node;
                sprCard._card = card;
                sprCard.ban = false;
                //let pao = (cards.length == 3 && tempHands[x][0] == tempHands[x][1] && tempHands[x][1] == tempHands[x][2])? 1:0;
                sprCard.pao = pao;
                sprCard.getComponent('BaseCardZP').init(card, false, pao);
                if (sprCard.pao > 0 && db.gameType != 3 && db.gameType != 10)
                    sprCard.getChildByName('shadow').active = true;
                sprCard._pos = { x: baseIdx, y: y };
                sprCard.setPosition(
                    HANDS_POS.x + sprCard._pos.x * CARD_RECT.x,
                    HANDS_POS.y + sprCard._pos.y * CARD_RECT.y
                );
                // sprCard.opacity = reconnect ? 255 : 0;
                this._hands[baseIdx].push(sprCard);
                this.dealCards.push(sprCard);
            });
            baseIdx++;
        });
        this.sortHands(true);
    },

    makeHands(hands) {
        let cards = [];
        let remain = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        hands.forEach((count, card) => {
            if (count > 1) {
                let data = [];
                for (let i = 0; i < count; i++) {
                    data.push(card);
                }
                cards.push(data);
            } else {
                remain[card] += count;
            }
        });
        remain.forEach((count, card) => {
            if (count > 0) {
                if (card % 10 < 8 && remain[card] > 0 && remain[card + 1] > 0 && remain[card + 2] > 0) {
                    cards.push([card + 2, card + 1, card]);
                    remain[card + 2]--;
                    remain[card + 1]--;
                    remain[card]--;
                }
            }
        });
        if (remain[9] > 0 && remain[6] > 0 && remain[1] > 0) {
            cards.push([9, 6, 1]);
            remain[9]--;
            remain[6]--;
            remain[1]--;
        }
        if (remain[19] > 0 && remain[16] > 0 && remain[11] > 0) {
            cards.push([19, 16, 11]);
            remain[19]--;
            remain[16]--;
            remain[11]--;
        }
        remain.forEach((count, card) => {  // （小一、小一、大一） 这种排序
            let dui = cards.findIndex(c => c[0] % 10 == card % 10 && c.length == 2 && c[0] == c[1]);
            if (dui > -1 && count > 0) {
                cards[dui].push(card);
                remain[card]--;
            }
        });
        if (remain[0] > 0 && remain[1] > 0) {
            cards.push([0, 1]);
            remain[0]--;
            remain[1]--;
        }
        if (remain[0] > 0 && remain[2] > 0) {
            cards.push([0, 2]);
            remain[0]--;
            remain[2]--;
        }
        if (remain[1] > 0 && remain[2] > 0) {
            cards.push([1, 2]);
            remain[1]--;
            remain[2]--;
        }
        if (remain[10] > 0 && remain[11] > 0) {
            cards.push([10, 11]);
            remain[10]--;
            remain[11]--;
        }
        if (remain[10] > 0 && remain[12] > 0) {
            cards.push([10, 12]);
            remain[10]--;
            remain[12]--;
        }
        if (remain[11] > 0 && remain[12] > 0) {
            cards.push([12, 11]);
            remain[11]--;
            remain[12]--;
        }
        if (remain[9] > 0 && remain[6] > 0) {
            cards.push([9, 6]);
            remain[9]--;
            remain[6]--;
        }
        if (remain[9] > 0 && remain[1] > 0) {
            cards.push([9, 1]);
            remain[9]--;
            remain[1]--;
        }
        if (remain[6] > 0 && remain[1] > 0) {
            cards.push([6, 1]);
            remain[6]--;
            remain[1]--;
        }
        if (remain[19] > 0 && remain[16] > 0) {
            cards.push([19, 16]);
            remain[19]--;
            remain[16]--;
        }
        if (remain[19] > 0 && remain[11] > 0) {
            cards.push([19, 11]);
            remain[19]--;
            remain[11]--;
        }
        if (remain[16] > 0 && remain[11] > 0) {
            cards.push([16, 11]);
            remain[16]--;
            remain[11]--;
        }
        remain.forEach((count, card) => {
            if (count > 0) {
                if (card % 10 < 9 && remain[card] > 0 && remain[card + 1] > 0) {
                    cards.push([card + 1, card]);
                    remain[card + 1]--;
                    remain[card]--;
                }
            }
        });
        remain.forEach((count, card) => {
            if (count > 0) {
                if (card % 10 < 8 && remain[card] > 0 && remain[card + 2] > 0) {
                    cards.push([card + 2, card]);
                    remain[card + 2]--;
                    remain[card]--;
                }
            }
        });
        // remain.forEach((count,card)=>{
        //     if(count>0){
        //         let dan = remain.findIndex((c,d)=> c > 0 && d%10 == card%10 && d != card);
        //         if(dan != -1){
        //             cards.push([dan, card]);
        //             remain[dan]--;
        //             remain[card]--;

        //     }
        //         }
        // }); 
        remain.forEach((count, card) => {
            if (count > 0)
                cards.push([card]);
        });
        cards.forEach(c => {
            c.sort((a, b) => a - b);
        });
        cards.sort((a, b) => a[0] % 10 - b[0] % 10);
        cards.forEach(c => {
            c.dan = c.length == 1;
            c.pao = (c[0] % 10 + 1) * ((c.length == 3 && c[0] == c[1] && c[1] == c[2]) ? -20 : 1);
        });
        if (db.gameType == 3 || db.gameType == 10) {
            cards.sort((a, b) => {
                if (a.pao == b.pao)
                    return a[0] - b[0];
                else
                    return a.pao - b.pao;
            });
        }

        while (cards.length > 11) {
            let idx = cards.findIndex(c => c.length == 1);
            let card = cards[idx][0];
            cc.log('card', card);
            cards.splice(idx, 1);
            let insertIdx = cards.findIndex(c => c.length < 3);
            cards[insertIdx].push(card);
        }

        return cards;
    },


    touchstart(event) {
        if (this.current != null)
            return;
        if (!this._hands)
            return;
        if (this.node.children.length == 0)
            return;
        this.checkTing = true;
        for (let x = 0; x < this._hands.length; x++) {
            for (let y = 0; y < this._hands[x].length; y++) {
                let sprCard = this._hands[x][y];
                let rect = this._hands[x][y].getBoundingBox();
                if (y != 0) {
                    rect.y = rect.y + 8.8;
                    rect.height = rect.height - 8.8;
                }
                let nodePosition = event.target.convertToNodeSpaceAR(event.getLocation());
                if (rect.contains(nodePosition)) {
                    if (sprCard.pao == 1)
                        return;
                    this.current = sprCard;
                
                    if (db.gameType == 3 || db.gameType == 10)
                        this.current.scale = 1.1;
                    this.current.zIndex = 200;

                }
            }
        }
    },
    joinHands() {
        let length = 0;
        this._hands.forEach(cards => length += (cards.length > 0 ? 1 : 0));
        let baseIdx = 6 - Math.floor(length / 2);
        if (baseIdx > 0)
            baseIdx--;
        let hands = this._hands.slice();
        this._hands = [[], [], [], [], [], [], [], [], [], [], [], [], []];
        hands.forEach(cards => {
            if (cards.length > 0) {
                this._hands[baseIdx] = cards;
                baseIdx++;
            }
        });

    },
    sortHands(opacity) {
        //this.current = null;
        this.joinHands();
        for (let x = 0; x < this._hands.length; x++) {
            if (this._hands[x].length == 3 && this._hands[x][0].pao == 0) {
                if (this._hands[x][0].value % 10 == this._hands[x][1].value % 10 && this._hands[x][1].value % 10 == this._hands[x][2].value % 10) {
                    this._hands[x].forEach(c => {
                        let count = this._hands[x].findIndex(a => c.value == a.value && c != a);
                        c.count = (count != -1) ? 2 : 1;
                    });
                    this._hands[x].sort((a, b) => b.count - a.count);
                }
            }
            for (let y = 0; y < this._hands[x].length; y++) {
                let sprCard = this._hands[x][y];
                sprCard.scale = cardScale;
                // if (!opacity && sprCard) {
                //     sprCard.opacity = 255;
                // }
                sprCard._pos = { x: x, y: y };
                sprCard.zIndex = 100 - sprCard._pos.y;
                sprCard.stopAllActions();
                sprCard.runAction(cc.moveTo(0.15, HANDS_POS.x + sprCard._pos.x * CARD_RECT.x,
                    HANDS_POS.y + sprCard._pos.y * CARD_RECT.y
                ));
            }
        }
    },

    removeHands(card) {
        for (let x = 0; x < this._hands.length; x++) {
            for (let y = 0; y < this._hands[x].length; y++) {
                if (card == this._hands[x][y]._card) {

                    this._hands[x][y].opacity = 0;
                    this._hands[x][y].removeFromParent();
                    this._hands[x][y].destroy();
                    this._hands[x].splice(y, 1);
                    return;
                }
            }
        }
    },

    touchmove(event) {
        if (this.current == null)
            return;
        let loc = event.target.convertToNodeSpaceAR(event.getLocation());
        try {
            if (loc)
                this.current.position = loc;
        } catch (error) {

        }
        if (this.checkTing && (db.gameType == 5 || db.gameType == 25 || db.gameType == 6 || db.gameType == 22 || db.gameType == 8)) {
            cc.find('Canvas/nodeTable').getComponent(this.scirpt[db.gameType]).checkTing(this.current._card, this.current._card);
            this.checkTing = false;
        }
    },

    touchend(event) {

        if (this.current == null)
            return;
        let imgOutCard = cc.find('Canvas/nodeTable/bg2/imgOutCard');
        if (imgOutCard.active == true && this.current.y > 45 && !this.current.ban) {
            let zhao = gameInfo.zhao.findIndex(a => a == this.current.value);
            if (zhao != -1 && !gameInfo.config.mask) {
                cache.showConfirm('接下来不可以吃和碰，是否出牌？', () => {
                    this._hands[this.current._pos.x].splice(this.current._pos.y, 1);
                    this.current.opacity = 0;
                    try {
                        this.current.removeFromParent();
                        this.current.destroy();
                    } catch (error) {
                        console.log(error)
                    }
                    this.sendPlay();
                    this.current = null;
                    this.sortHands();
                }, () => {
                    this.current = null;
                    this.sortHands();
                });
                return;
            }
            this._hands[this.current._pos.x].splice(this.current._pos.y, 1);
            this.sendPlay();
            if (this.current && this.current.position)
                cc.outCardPosition = this.current.position;

            this.current.opacity = 0;
            try {
                this.current.removeFromParent();
                this.current.destroy();
            } catch (error) {
                console.log(error)
            }

            imgOutCard.active = false;
            this.current = null;
            this.sortHands();
            return;
        } else {
            let loc = this.current.getPosition();
            // let row = Math.floor((loc.x - HANDS_POS.x + CARD_RECT.x / 2) / 77.6);
            let row = Math.floor((loc.x - HANDS_POS.x + CARD_RECT.x / 2) / CARD_RECT.x);
            row = Math.max(row, 0);
            row = Math.min(row, 12);
            let totalRow = 0;
            this._hands.forEach(cards => {
                if (cards.length > 0)
                    totalRow++;
            });
            let baseIdx = 6 - Math.floor(totalRow / 2);
            let finalIdx = totalRow + baseIdx - 1;
            let isInsert = loc.x < this._hands[baseIdx][0] - 30 || loc.x < this._hands[finalIdx][0] + 30;
            let col = Math.round(((loc.y + 100) / 100));
            col = Math.min(col, 4);
            col = Math.max(col, 0);
            //if(row != 0 || (row == 0 && this._hands[0].length > 0)){
            this.moveHands(this.current, row, col, isInsert && col <= 2);
            //}
            this.current = null;
            this.sortHands();
            if (db.gameType == 5 || db.gameType == 10 || db.gameType == 25 || db.gameType == 6 || db.gameType == 22 || db.gameType == 8) {
                cc.find('Canvas/nodeTable').getComponent(this.scirpt[db.gameType]).checkTing();
            }
        }
    },

    moveHands(sprCard, row, col, isInsert) {
        let loc = this.current._pos;
        let totalRow = 0;
        this._hands.forEach(row => {
            if (row.length > 0) {
                totalRow++;
            }
        });
        if (this._hands[row][0] != null) {
            if (this._hands[row][0].pao == 1)
                return;
        }
        if (totalRow < 12 && isInsert) {
            this._hands[loc.x].splice(loc.y, 1);
            this._hands.splice(row, 0, [this.current]);
        } else if (this._hands[row].length < 4) {
            this._hands[loc.x].splice(loc.y, 1);
            this._hands[row].splice(this._hands[row].length, 0, this.current);
        }
    },

    touchcancel(event) {
        if (this.current == null)
            return;

        let imgOutCard = cc.find('Canvas/nodeTable/bg2/imgOutCard');
        if (imgOutCard.active == true && this.current.y > 45 && !this.current.ban) {
            this.touchend();
        } else {
            this.current = null;
            this.sortHands();
            if (this.checkTing && (db.gameType == 5 || db.gameType == 10 || db.gameType == 25 || db.gameType == 6 || db.gameType == 22 || db.gameType == 8)) {
                cc.find('Canvas/nodeTable').getComponent(this.scirpt[db.gameType]).checkTing();
            }
        }

    },

    sendPlay(card) {
        connector.gameMessage(ROUTE.CS_PLAY_CARD, card ? card : this.current.value);
    },

    sendAction() {

    },

    showLayoutAction() {

    },

    showLayoutBi() {

    },

    showLayoutChi() {

    },

    /**同步手牌 */
    syncCard(data) {
        // this.init(data,true)
        // return;
        let locationHands = new Array(20).fill(0);
        for (let x = 0; x < this._hands.length; x++) {
            for (let y = 0; y < this._hands[x].length; y++) {
                locationHands[this._hands[x][y]._card]++;
            }
        }
        let changeHands = false;
        for (let x = 0; x < data.length; x++) {
            //同种牌相差数
            let diffCount = data[x] - locationHands[x];
            if (diffCount == 0) continue;
            changeHands = true;
            // diffCount > 0 ? this.addHands(x, diffCount) : this.reduceHands(x, Math.abs(diffCount));
        }
        if (changeHands) {
            this.init(data, true)

        } else {

            for (let x = 0; x < this._hands.length; x++) {
                for (let y = 0; y < this._hands[x].length; y++) {
                    if (this._hands[x][y])
                        this._hands[x][y].getComponent('BaseCardZP').changeLoad(this._hands[x][y]._card)
                }
            }

        }

    },
    /** 增加手牌  (本地比服务器少牌)
     * @param card  牌的种类
     * @param count  增加数量
     */
    addHands(card, count) {
        for (let i = this._hands.length - 1; i >= 0; i--) {
            if (this._hands[i].length <= (4 - count)) {
                //TODO:默认添加的牌不会跑和禁止拖动 pao---0  ban---false
                let pao = 0;// ((this._hands[i].filter(c => c._card !=card ).length == 0) && (this._hands[i].length+count) == 4) ? 1 : 0;
                for (let j = 0; j < count; j++) {
                    let sprCard = cc.instantiate(this.nodeCard);
                    sprCard.scale = 0.8;
                    sprCard.parent = this.node;
                    sprCard._card = card;
                    sprCard.ban = false;
                    //let pao = (cards.length == 3 && tempHands[x][0] == tempHands[x][1] && tempHands[x][1] == tempHands[x][2])? 1:0;
                    sprCard.pao = pao;
                    sprCard.getComponent('BaseCardZP').init(card, false, pao);
                    // if (sprCard.pao > 0 && db.gameType != 3 && db.gameType != 10)
                    //     sprCard.getChildByName('shadow').active = true;
                    sprCard._pos = { x: i, y: this._hands[i].length };
                    sprCard.setPosition(
                        HANDS_POS.x + sprCard._pos.x * CARD_RECT.x,
                        HANDS_POS.y + sprCard._pos.y * CARD_RECT.y
                    );
                    // sprCard.opacity = reconnect ? 255 : 0;
                    //sprCard.opacity = 0;
                    this._hands[i].push(sprCard);
                }

                this.sortHands()

                return;
            }
        }

        // }
    },
    /** 减少手牌  (本地比服务器多牌)  
     * @param card  牌的种类
     * @param count  减少数量
     */
    reduceHands(card, count) {
        for (let x = 0; x < count; x++) {
            this.removeHands(card);
            this.sortHands()
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update   (dt) {

    // },
});



