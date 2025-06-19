let poker = module.exports;

poker.CARD_TYPE = {
    DAN: "DAN",
    DUI: "DUI",
    SAN: "SAN",
    SHUN: "SHUN",
    LIANDUI: "LIANDUI",
    FEIJI: "FEIJI",
    BOMB: "BOMB",
    SI: "SI"
};


/**
 * 解码牌型
 * @param cards
 * @param length
 */
poker.decode = function (cards, length, config, current) {
    let tmpCards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    cards.forEach(card => {
        tmpCards[card % 100]++;
    });
    let card = tmpCards.findIndex(count => count >= 4);
    if (card >= 0 && tmpCards[card] == cards.length) {
        return { type: poker.CARD_TYPE.BOMB, count: cards.length, card: card % 100, cards: cards };
    }
    if (cards.length == 1) {
        return { type: poker.CARD_TYPE.DAN, card: cards[0] % 100, cards: cards };
    }
    if (cards.length == 2 && cards[0] % 100 == cards[1] % 100) {
        return { type: poker.CARD_TYPE.DUI, card: cards[0] % 100, cards: cards };
    }
    let formatCards = [[], [], [], [], []];
    tmpCards.forEach((count, card) => {
        formatCards[count].push(card % 100);
        if (count == 4)
            formatCards[3].push(card % 100);
    });

    if ((current == null || current.type == poker.CARD_TYPE.SI) && formatCards[4].length == 1 && cards.length <= 7 && cards.length > 4) {
        let card = tmpCards.findIndex(count => count == 4);
        return { type: poker.CARD_TYPE.SI, count: 1, card: card, cards: cards };
    }
    if ((current == null || current.type == poker.CARD_TYPE.SAN) && formatCards[3].length == 1 && (cards.length == 5 || (length <= 5 && length == cards.length))) {
        let card = tmpCards.findIndex(count => count == 3);
        return { type: poker.CARD_TYPE.SAN, count: 1, card: card, cards: cards };
    }

    if ((current == null || current.type == poker.CARD_TYPE.FEIJI) && formatCards[3].length >= 2) {
        if (cards.length % 5 == 0 || (length <= formatCards[3].length * 5 && cards.length == length)) {
            let count = Math.ceil(cards.length / 5);
            let base = formatCards[3][formatCards[3].length - 1];
            let tmpCount = 1;
            for (let i = formatCards[3].length - 1; i > 0 && tmpCount < count; i--) {
                if (formatCards[3][i] - formatCards[3][i - 1] != 1) {
                    base = -1;
                    tmpCount = 1;
                } else {
                    tmpCount++;
                    base = formatCards[3][i - 1];
                }
                if (tmpCount >= count)
                    break;
            }
            if (base > 0 && count == tmpCount) {//飞机成立
                return { type: poker.CARD_TYPE.FEIJI, count: count, card: base, cards: cards };
            } else {
                return null;
            }
        }
        return null;
    } else if (formatCards[2].length >= 2) {
        if (cards.length % 2 != 0)
            return null;
        let count = Math.floor(cards.length / 2);
        let base = formatCards[2][formatCards[2].length - 1];
        let tmpCount = 1;
        for (let i = formatCards[2].length - 1; i > 0 && tmpCount < count; i--) {
            if (formatCards[2][i] - formatCards[2][i - 1] != 1) {
                base = -1;
                tmpCount = 1;
            } else {
                tmpCount++;
                base = formatCards[2][i - 1];
            }
            if (tmpCount >= count)
                break;
        }
        if (base > 0 && count == tmpCount) {//连对成立
            return { type: poker.CARD_TYPE.LIANDUI, count: count, card: base, cards: cards };
        } else {
            return null;
        }
    } else if (formatCards[1].length >= 5) {
        let count = cards.length;
        let base = formatCards[1][formatCards[1].length - 1];
        let tmpCount = 1;
        for (let i = formatCards[1].length - 1; i > 0 && tmpCount < count; i--) {
            if (formatCards[1][i] - formatCards[1][i - 1] != 1) {
                base = -1;
                tmpCount = 1;
            } else {
                tmpCount++;
                base = formatCards[1][i - 1];
            }
        }
        if (base > 0 && count == tmpCount) {//顺成立
            return { type: poker.CARD_TYPE.SHUN, count: count, card: base, cards: cards };
        } else {
            return null;
        }
    }
    return null;
};

poker.compare = function (group0, group1) {
    if (group0 == null)
        return true;
    if (group0.type == group1.type) {
        switch (group0.type) {
            case poker.CARD_TYPE.DAN:
            case poker.CARD_TYPE.DUI:
            case poker.CARD_TYPE.SAN:
            case poker.CARD_TYPE.SI:
                return group1.card > group0.card;
            case poker.CARD_TYPE.SHUN:
            case poker.CARD_TYPE.LIANDUI:
            case poker.CARD_TYPE.FEIJI:
                return group1.card > group0.card && group1.count == group0.count;
            case poker.CARD_TYPE.BOMB:
                return group1.card > group0.card

        }
    }
    return group0.type != poker.CARD_TYPE.BOMB && group1.type == poker.CARD_TYPE.BOMB;
};

poker.sumHands = function (hands) {
    let total = 0;
    hands.forEach(count => total += count.length);
    //cc.log("total",total);
    return total;
};

poker.sortCard = function (a, b) {
    if (a % 100 == b % 100)
        return a - b;
    else
        return a % 100 - b % 100;
};

poker.sortPlayedCard = function (group) {
    let sortedCards;
    switch (group.type) {
        case poker.CARD_TYPE.DAN:
        case poker.CARD_TYPE.DUI:
        case poker.CARD_TYPE.SHUN:
        case poker.CARD_TYPE.LIANDUI:
        case poker.CARD_TYPE.BOMB:
            sortedCards = group.cards.sort(poker.sortCard);
            break;
        case poker.CARD_TYPE.SAN:
        case poker.CARD_TYPE.SI:
        case poker.CARD_TYPE.FEIJI:
            let card = group.card;
            let count = group.count;
            let cards0 = [], cards1 = [];
            group.cards.forEach(c => (c % 100 >= card && c % 100 < card + count) ? cards0.push(c) : cards1.push(c));
            cards0.sort(poker.sortCard);
            cards1.sort(poker.sortCard);
            sortedCards = cards0.concat(cards1);
            break;
    }
    return sortedCards;
};


poker.autoplay = function (currentHands, current, tipsTime, config) {

    if (current == null) {
        // let res = newAutoPlay(currentHands, config)
        return null;
    }
    let hands = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    currentHands.forEach(card => {
        hands[card % 100].push(card);
    });
    let matchs = [];
    let bombs = [];
    let card, count, results = [];
    hands.forEach((cards, card) => {
        if (cards.length >= 4 || (config.aaa && cards.length == 3 && card == 14)) {
            bombs.push({ type: poker.CARD_TYPE.BOMB, card: card, count: cards.length, cards: hands[card].slice() })
            hands[card] = [];
        }
    });
    let findTime = 0;
    let matchCount = 0;
    switch (current.type) {
        case poker.CARD_TYPE.DAN:
            hands.forEach((cards, c) => {
                if (cards.length > 0 && c > current.card % 100) {
                    matchs.push([cards[0]]);
                }
            });
            break;
        case poker.CARD_TYPE.DUI:
            hands.forEach((cards, c) => {
                if (cards.length > 1 && c > current.card % 100) {
                    matchs.push(cards.slice(0, 2));
                }
            });
            break;
        case poker.CARD_TYPE.SAN:
            card = hands.findIndex((cards, c) => (cards.length > 2 && c > current.card % 100));
            if (card >= 0 && (poker.sumHands(hands) >= 5 || (poker.sumHands(hands) < 5 && config.limit))) {
                results = hands[card].slice(0, 3);
                hands.forEach((cards, c) => {
                    if (c != card) {
                        cards.forEach(cd => {
                            if (results.length < 5)
                                results.push(cd);
                        });
                    }
                });
                matchs.push(results);
            }
            break;
        /////
        case poker.CARD_TYPE.SI:
            card = hands.findIndex((cards, c) => ((cards.length > 3 || (cards.length == 3 && c == 14 && config.aaa)) && c > current.card % 100));
            if (card >= 0) {
                results = hands[card].slice(0, 4);
                matchs.push(results);
            }
            break;
        //////
        case poker.CARD_TYPE.SHUN:
            count = current.count;
            for (let i = current.card + 1; i < hands.length - count; i++) {
                let tmp = 0;
                let c;
                results = [];
                for (c = i; c < i + count; c++) {
                    if (hands[c].length > 0) {
                        tmp++;
                        results.push(hands[c][0])
                    }
                }
                if (tmp == count)
                    matchs.push(results);
            }
            break;
        case poker.CARD_TYPE.LIANDUI:
            count = current.count;
            for (let i = current.card + 1; i < hands.length - count; i++) {
                let tmp = 0;
                let c;
                results = [];
                for (c = i; c < i + count; c++) {
                    if (hands[c].length > 1) {
                        tmp++;
                        results.push(hands[c][0]);
                        results.push(hands[c][1]);
                    }
                }
                if (tmp == count)
                    matchs.push(results);
            }
            break;
        case poker.CARD_TYPE.FEIJI:
            count = current.count;
            for (let i = current.card + 1; i < hands.length - count; i++) {
                let tmp = 0;
                let c;
                results = [];
                for (c = i; c < i + count; c++) {
                    if (hands[c].length > 2) {
                        tmp++;
                        results.push(hands[c][0]);
                        results.push(hands[c][1]);
                        results.push(hands[c][2]);
                    }
                }
                if (tmp == count && poker.sumHands(hands) >= count * 5) {
                    hands.forEach((cards, c) => {
                        cards.forEach(cd => {
                            if (results.indexOf(cd) < 0 && results.length < count * 5) {
                                results.push(cd);
                            }
                        });
                    });
                    matchs.push(results);
                }
            }
            break;
    }
    for (let i = 0; i < bombs.length; i++) {
        if (poker.compare(current, bombs[i]))
            matchs.push(bombs[i].cards);
    }
    //cc.log(matchs);
    if (matchs.length == 0)
        return [];
    return matchs;
    //return matchs[tipsTime%matchs.length];
};

/**
 * 检查选中牌
 * @param currentCards
 * @param length
 */
poker.checkCard = function (currentCards, length, config, current) {
    let result = {
        cardList: {},
        otherCard: []
    }
    let tmpCards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    currentCards.forEach(card => {
        tmpCards[card % 100]++;
    });
    let formatCards = [[], [], [], [], []];
    tmpCards.forEach((count, card) => {
        formatCards[count].push(card % 100);
    });

    let hands = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    currentCards.forEach(card => {
        hands[card % 100].push(card);
    });
    if (current) { //上家出牌 自己要
        let cardList = poker.autoplay(currentCards, current, 0, config);
        //TODO cardList=[];
        if (cardList.length > 0) {
            result.cardList = poker.decode(cardList[0], length, config, current)
            currentCards.forEach((e) => {
                if (cardList[0].indexOf(e) != -1) return;
                result.otherCard.push(e);
            })

        }
        return result;

    } else {   //自己出牌

        let SANList = [];//三张
        let SANCardIndex = [];

        let FEIJICombo = 0;
        let FEIJIComboIndex = [];
        let FEIJICardIndex = [];
        let FEIJIList = [];//飞机

        let DUIList = [];//对子
        let DUICardIndex = [];

        let LIANDUIList = [];//连对
        let LIANDUICombo = 0;
        let LIANDUIComboIndex = [];
        let LIANDUICardIndex = [];

        let DANList = [];//单张
        let DANCardIndex = [];

        let SHUNCombo = 0;//顺牌数量
        let SHUNComboList = [];
        let SHUNList = [];//顺子牌


        let BOMBList=[]//炸弹
        let BOMBCardIndex=[]


        hands.forEach((e, i) => {
            // if(e.length>=4) {//炸弹
            // }
            //单张
            if (e.length == 1) {
                DANCardIndex.push(i)
            }

            //炸弹
            if(e.length==4){
                BOMBCardIndex.push(i);
            }
            //顺子
            if (e.length >= 1) {
                SHUNCombo++;
                SHUNComboList.push(e[0]);
                if (SHUNCombo >= 5) {
                    SHUNList = SHUNComboList.concat();
                }

            } else {
                SHUNCombo = 0;
                SHUNComboList = [];
            }


            //对子
            if (e.length >= 2) {
                LIANDUICombo++;
                DUICardIndex.push(i);
                LIANDUIComboIndex.push(i);
                if (LIANDUICombo >= 2) {//连对
                    LIANDUICardIndex = LIANDUIComboIndex.concat();
                }

            } else {
                LIANDUICombo = 0;
                LIANDUIComboIndex = [];
            }

            //三张 
            if (e.length >= 3) {
                SANCardIndex.push(i);

                FEIJICombo++;
                FEIJIComboIndex.push(i);
                if (FEIJICombo >= 2) {//飞机
                    FEIJICardIndex = FEIJIComboIndex.concat();
                }
            } else {
                FEIJIComboIndex = [];
                FEIJICombo = 0
            }


        })

        // 飞机
        if (FEIJICardIndex.length > 0) {
            FEIJICardIndex.forEach((e) => {
                FEIJIList = FEIJIList.concat(hands[e]);
            })
            let FEIJICardCount = 0;//带牌数
            let MaxFEIJICardCount = FEIJICardIndex.length * 2;//带牌数
            DANCardIndex.forEach((e) => {
                if (FEIJICardCount == MaxFEIJICardCount) return;
                FEIJIList.push(hands[e][0]);
                FEIJICardCount++;
            })
            DUICardIndex.forEach((e) => {
                if (FEIJICardCount == MaxFEIJICardCount) return;
                if (FEIJICardIndex.indexOf(e) != -1) return;
                

                if (MaxFEIJICardCount - FEIJICardCount >= hands[e].length) {
                    FEIJIList=FEIJIList.concat(hands[e])
                    FEIJICardCount += hands[e].length;
                } else {
                    FEIJIList=FEIJIList.concat(hands[e].slice(0,MaxFEIJICardCount - FEIJICardCount));
                    FEIJICardCount=MaxFEIJICardCount;
                }
                // if (MaxFEIJICardCount - FEIJICardCount >= 2) {
                //     FEIJIList.push(hands[e][0]);
                //     FEIJIList.push(hands[e][1]);
                //     FEIJICardCount += 2;
                // } else {
                //     FEIJIList.push(hands[e][0]);
                //     FEIJICardCount++;
                // }
            })

        }



        //三张 
        if (SANCardIndex.length > 0) {
            SANList = SANList.concat(hands[SANCardIndex[0]].slice(0,3));
            let SANCardCount = 0;//带牌数
            DANCardIndex.forEach((e) => {
                if (SANCardCount == 2) return;
                SANList.push(hands[e][0]);
                SANCardCount++;
            })
            DUICardIndex.forEach((e) => {
                if (SANCardCount == 2) return;
                if (SANCardIndex.indexOf(e) != -1) return;
                if (2 - SANCardCount >= 2) {
                    SANList.push(hands[e][0]);
                    SANList.push(hands[e][1]);
                    SANCardCount += 2;
                } else {
                    SANList.push(hands[e][0]);
                    SANCardCount++;
                }
            })
        }



        //连对
        LIANDUICardIndex.forEach((e) => {
            LIANDUIList.push(hands[e][0]);
            LIANDUIList.push(hands[e][1]);
        })

        //对子
        if (DUICardIndex.length > 0) {
            DUIList.push(hands[DUICardIndex[0]][0]);
            DUIList.push(hands[DUICardIndex[0]][1]);

        }
        //单张
        if (DANCardIndex.length > 0) {
            DANList.push(hands[DANCardIndex[0]][0]);
        }
        //炸弹
        if (BOMBCardIndex.length > 0) {
            BOMBList=hands[BOMBCardIndex[0]];
            let BOMBCardCount = 0;//带牌数
            DANCardIndex.forEach((e) => {
                if (BOMBCardCount == 3) return;
                BOMBList.push(hands[e][0]);
                BOMBCardCount++;
            })
            DUICardIndex.forEach((e) => {
                if (BOMBCardCount == 3) return;
                if (BOMBCardIndex.indexOf(e) != -1) return;

                if (3 - BOMBCardCount >= hands[e].length) {
                    BOMBList=BOMBList.concat(hands[e])
                    BOMBCardCount += hands[e].length;
                } else {
                    FEIJIList=BOMBList.concat(hands[e].slice(0,3 - BOMBCardCount));
                    BOMBCardCount=3;
                }

                // if (3 - BOMBCardCount >= 2) {
                //     BOMBList.push(hands[e][0]);
                //     BOMBList.push(hands[e][1]);
                //     BOMBCardCount += 2;
                // } else {
                //     BOMBList.push(hands[e][0]);
                //     BOMBCardCount++;
                // }
            })
        }

        if (DUICardIndex.length == 0 && SANCardIndex.length == 0 && LIANDUICardIndex.length == 0 && FEIJICardIndex.length == 0) {

            if (SHUNList.length > 0) {
                result.cardList = { type: poker.CARD_TYPE.SHUN, count: SHUNList.length, card: SHUNList[0] % 100, cards: SHUNList };
                currentCards.forEach((e) => {
                    if (SHUNList.indexOf(e) != -1) return;
                    result.otherCard.push(e);
                })
            }
            if (SHUNList.length == 0 && DANCardIndex.length == 1) {
                result.cardList = { type: poker.CARD_TYPE.DAN, card: DANList[0] % 100, cards: DANList };

            }
            return result;
        }
        //输出牌数最多的
        let total = [
            DANList,
            DUIList,
            SANList,
            FEIJIList,
            LIANDUIList,
            SHUNList,
            BOMBList,
        ]

        let max = total[0].length;
        let res = 0;
        for (let i = 1; i < total.length; i++) {
            if (max < total[i].length) {
                max = total[i].length;
                res = i; //total[i].concat();
            }
        }
        let cards = total[res].concat();

        switch (res) {
            case 0:
                result.cardList = { type: poker.CARD_TYPE.DAN, card: cards[0] % 100, cards: cards };
                break;
            case 1:
                result.cardList = { type: poker.CARD_TYPE.DUI, card: cards[0] % 100, cards: cards };
                break;
            case 2:
                result.cardList = { type: poker.CARD_TYPE.SAN, count: 1, card: cards[0] % 100, cards: cards };
                break;
            case 3:
                result.cardList = { type: poker.CARD_TYPE.FEIJI, count: FEIJICardIndex.length, card: cards[0] % 100, cards: cards };
                break;
            case 4:
                result.cardList = { type: poker.CARD_TYPE.LIANDUI, count: LIANDUICardIndex.length, card: cards[0] % 100, cards: cards };
                break;
            case 5:
                result.cardList = { type: poker.CARD_TYPE.SHUN, count: SHUNList.length, card: cards[0] % 100, cards: cards };
                break;
            case 6:
                result.cardList =cards.length==4? { type: poker.CARD_TYPE.BOMB, count: cards.length, card: cards[0]  % 100, cards: cards }:{ type: poker.CARD_TYPE.SI, count: 1, card: cards[0]  % 100, cards: cards };;
                break;
        }

        currentCards.forEach((e) => {
            if (cards.indexOf(e) != -1) return;
            result.otherCard.push(e);
        })

        return result;

    }
};





Date.prototype.format = function (format) {
    let o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                    ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

let reduceArr = function (oldArr) {
    let newArr = oldArr.reduce((newArr, value) => {
        if (newArr.length && (value - newArr[0][0]) === 1) {
            newArr[0].unshift(value);
        } else {
            newArr.unshift([value]);
        }
        return newArr;
    }, []).reverse().map(a => a.reverse());
    return newArr.sort((a, b) => b.length - a.length)[0];
};
