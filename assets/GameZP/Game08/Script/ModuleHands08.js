let HANDS_POS = { x: -400, y: -273 };
let CARD_RECT = { x: 77.6, y: 80 };
let TableInfo = require('TableInfo');
let connector = require('Connector');
let PACK = require('PACK');
let ROUTE = require('ROUTE');
let cache = require('Cache');
cc.Class({
    extends: cc.Component,

    properties: {
        nodeCard: cc.Prefab,
        handsChild: cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this.handsChild.zIndex = 25;
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

    init: function (hands, reconnect) {
        //cc.log(hands);
        this.node.removeAllChildren();
        let tempHands = this.makeHands(hands);
        this._hands = [[], [], [], [], [], [], [], [], [], [], [], [], []];
        let baseIdx = 6 - Math.floor(tempHands.length / 2);
        if (baseIdx > 0)
            baseIdx--;
        tempHands.forEach((cards, x) => {
            cards.forEach((card, y) => {
                let sprCard = cc.instantiate(this.nodeCard);
                sprCard.scale = 0.8;
                sprCard.parent = this.node;
                sprCard._card = card;
                let pao = (cards.length == 3 && tempHands[x][0] == tempHands[x][1] && tempHands[x][1] == tempHands[x][2]) ? 1 : 0;
                sprCard.pao = pao;
                sprCard.getComponent('BaseCardZP').init(card, false, pao);
                sprCard._pos = { x: baseIdx, y: y };
                sprCard.setPosition(
                    HANDS_POS.x + sprCard._pos.x * CARD_RECT.x,
                    HANDS_POS.y + sprCard._pos.y * CARD_RECT.y
                );
                sprCard.opacity = reconnect ? 255 : 0;
                this._hands[baseIdx].push(sprCard);
            });
            baseIdx++;
        });
        this.sortHands();
    },

    makeHands: function (hands) {
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
        });
        // cards.sort((a,b)=> {
        //     if(a.pao == b.pao)
        //         return a[0] - b[0];
        //     else
        //         return a.pao - b.pao;
        // });
        //cc.log('++++++++++++++',cards);
        while (cards.length > 12) {
            let idx = cards.findIndex(c => c.length == 1);
            let card = cards[idx][0];
            cards.splice(idx, 1);
            let insertIdx = cards.findIndex(c => c.length < 3);
            cards[insertIdx].push(card);
        }
        return cards;
    },

    joinHands: function () {
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

    touchstart: function (event) {
        //cc.log('touchstart',this.current);
        if (this.current != null)
            return;
        if (this._hands == null)
            return;
        for (let x = 0; x < this._hands.length; x++) {
            for (let y = 0; y < this._hands[x].length; y++) {
                let sprCard = this._hands[x][y];
                let rect = this._hands[x][y].getBoundingBox();
                if (y != 0) {
                    rect.y = rect.y + 8.8;
                    rect.height = rect.height - 8.8;
                }
                //cc.log('touchstart',rect);
                let nodePosition = event.target.convertToNodeSpaceAR(event.getLocation());
                if (rect.contains(nodePosition)) {
                    if (sprCard.pao == 1)
                        return;
                    let current = cc.instantiate(sprCard);
                    current.parent = this.handsChild;
                    current.scale = 1.4;
                    current.position = sprCard.position;
                    this.current = current;
                    this.sprCard = sprCard;
                    this.current.zIndex = 200;
                    if (sprCard)
                        sprCard.opacity = 150;
                }
            }
        }
    },

    sortHands: function () {
        cc.log('soetHands');
        this.handsChild.removeAllChildren();
        this.current = null;
        this.joinHands();
        for (let x = 0; x < this._hands.length; x++) {
            if (this._hands[x].length == 3 && this._hands[x][0].pao == 0) {
                if (this._hands[x][0].value % 10 == this._hands[x][1].value % 10 && this._hands[x][1].value % 10 == this._hands[x][2].value % 10) {
                    this._hands[x].forEach(c => {
                        let count = this._hands[x].findIndex(a => c.value == a.value && c != a);
                        //cc.log('sortHands',count);
                        c.count = (count != -1) ? 2 : 1;
                    })
                    this._hands[x].sort((a, b) => b.count - a.count);
                }
            }
            for (let y = 0; y < this._hands[x].length; y++) {
                let sprCard = this._hands[x][y];
                sprCard._pos = { x: x, y: y };
                sprCard.zIndex = 100 - sprCard._pos.y;
                sprCard.setPosition(
                    HANDS_POS.x + sprCard._pos.x * CARD_RECT.x,
                    HANDS_POS.y + sprCard._pos.y * CARD_RECT.y
                );
                //cc.log(sprCard.position);
            }
        }
    },

    removeHands: function (card) {
        for (let x = 0; x < this._hands.length; x++) {
            for (let y = 0; y < this._hands[x].length; y++) {
                if (card == this._hands[x][y]._card) {
                    this._hands[x][y].destroy();
                    this._hands[x].splice(y, 1);
                    return;
                }
            }
        }
    },

    touchmove: function (event) {
        if (this.current == null)
            return;
        let loc = event.target.convertToNodeSpaceAR(event.getLocation());
        this.current.position = loc;
    },

    touchend: function (event) {
        if (this.current == null)
            return;
        let imgOutCard = cc.find('Canvas/nodeTable/bg2/imgOutCard');
        if (imgOutCard.active == true && this.current.y > 45) {
            let zhao = TableInfo.zhao.findIndex(a => a == this.sprCard.value);
            if (zhao != -1) {
                cache.showConfirm('是否放招？', () => {
                    this._hands[this.sprCard._pos.x].splice(this.sprCard._pos.y, 1);
                    this.sendPlay();
                    this.sprCard.destroy();
                    this.sprCard = null;
                    this.sortHands();
                });
                if (this.sprCard != null) {
                    this.sprCard.opacity = 255;
                    //this.sprCard = null;
                }
                this.current.destroy();
                this.current = null;
                return;
            }
            this._hands[this.sprCard._pos.x].splice(this.sprCard._pos.y, 1);
            this.sendPlay();
            this.current.destroy();
            this.current = null;
            this.sprCard.destroy();
            this.sprCard = null;
            imgOutCard.active = false;
            this.sortHands();
            return;
            // this.active(-1);
            // this.clearQuest();
            //WhzConnector.emit(PACK.CS_PLAY_CARD, this._currentCard._card);
        } else {
            let loc = this.current.getPosition();
            let row = Math.floor((loc.x - HANDS_POS.x + CARD_RECT.x / 2) / 77.6);
            row = Math.max(row, 0);
            row = Math.min(row, 12);
            //cc.log(row);
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
            //if(row != 0)
            if (row != 0 || (row == 0 && this._hands[0].length > 0)) {
                this.moveHands(this.current, row, col, isInsert && col <= 2);
            }
            this.sortHands();
        }
        this.sprCard.opacity = 255;
        this.sprCard = null;
        if (this.current != null)
            this.current.destroy();
        this.current = null;
    },

    moveHands: function (sprCard, row, col, isInsert) {
        //cc.log(this._hands);
        let loc = this.sprCard._pos;
        let totalRow = 0;
        this._hands.forEach(row => {
            if (row.length > 0) {
                totalRow++;
            }
        });
        //cc.log('moveHands',this._hands[row]);
        if (this._hands[row][0] != null) {
            if (this._hands[row][0].pao == 1)
                return;
        }
        if (totalRow < 13 && isInsert) {
            this._hands[loc.x].splice(loc.y, 1);
            this._hands.splice(row, 0, [this.sprCard]);
        } else if (this._hands[row].length < 4) {
            this._hands[loc.x].splice(loc.y, 1);
            this._hands[row].splice(this._hands[row].length, 0, this.sprCard);
        }
    },

    touchcancel: function (event) {
        if (this.current == null && this.sprCard == null)
            return;
        let imgOutCard = cc.find('Canvas/nodeTable/bg2/imgOutCard');
        cc.log(this.current.y);
        if (this.current.y > 45 && imgOutCard.active == true) {
            this.touchend();
        }
        this.current.destroy();
        this.current = null;
        this.sprCard.opacity = 255;
        this.sprCard = null;
        this.handsChild.removeAllChildren();
        this._hands.forEach(x => {
            x.forEach(y => {
                y.opacity = 255;
            })
        });
        this.sortHands();
    },

    sendPlay: function () {
        connector.gameMessage(ROUTE.CS_PLAY_CARD, this.sprCard.value);
    },

    sendAction: function () {

    },

    showLayoutAction: function () {

    },

    showLayoutBi: function () {

    },

    showLayoutChi: function () {

    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
