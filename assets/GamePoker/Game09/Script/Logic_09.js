let poker = module.exports;
//cc = {log:console.log};
poker.CARD_TYPE = {
    DAN: "DAN",
    DUI: "DUI",
    SAN: "SAN",
    SHUN: "SHUN",
    LIANDUI: "LIANDUI",
    FEIJI: "FEIJI",
    BOMB: "BOMB",
};
poker.series = function (arr, min) {
    let result = [];
    for (let length = arr.length; length >= min; length--) {
        for (let start = 0; start <= arr.length - length; start++) {
            let splice = [];
            let isSerie = true;
            for (let i = start; i < start + length; i++) {
                if (i + 1 < start + length && arr[i] + 1 != arr[i + 1])
                    isSerie = false;
                splice.push(arr[i]);
            }
            if (splice.length >= min && isSerie)
                result.push(splice);
        }
    }
    return result;
};

poker.maxSeries = function (arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] + 1 != arr[i + 1])
            return false;
    }
    return true;
};

/**
 * ½âÂëÅÆÐÍ
 * @param cards
 * @param shuner
 * @return {[]}
 */
poker.decode = function (cards, shuner) {  //cards±ä³É ÐòÁÐ»¯µÄÅÆÐÍ
    if (cards == null)
        return null;
    cards.sort(poker.sortCard);
    let tmpCards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    cards.forEach(card => {
        tmpCards[card % 100]++;
    });
    let allResult = [];
    let card = tmpCards.findIndex(count => count >= 4);
    if (card >= 0 && tmpCards[card] == cards.length) {
        allResult.push({ type: poker.CARD_TYPE.BOMB, count: cards.length, card: card % 100, cards: cards });
    }
    if (cards.length == 1) {
        allResult.push({ type: poker.CARD_TYPE.DAN, card: cards[0] % 100, cards: cards });
    }
    if (cards.length == 2 && cards[0] % 100 == cards[1] % 100) {
        allResult.push({ type: poker.CARD_TYPE.DUI, card: cards[0] % 100, cards: cards });
    }

    let formatCards = [[], [], [], [], [], [], [], [], []];
    tmpCards.forEach((count, card) => {
        if (count >= 3)
            formatCards[3].push(card % 100);
        else if (count < 3 && count > 0)
            formatCards[count].push(card % 100);
    });
    for (let i = 3; i < 6; i++) {
        if (formatCards[i].length == 1 && cards.length <= 5) {
            allResult.push({ type: poker.CARD_TYPE.SAN, count: 1, card: formatCards[i][0] % 100, cards: cards });
        }
    }
    if (formatCards[1].length >= 5 && formatCards[1].length == cards.length && shuner == true) {
        let arr = formatCards[1].slice();
        poker.series(arr, cards.length).filter(a => a.length == cards.length).forEach(a => allResult.push({ type: poker.CARD_TYPE.SHUN, count: a.length, card: a[0], cards: cards }));
    } else if (formatCards[3].length >= 2) {//
        let arr = formatCards[3].slice();
        poker.series(arr, 2).filter(a => cards.length <= a.length * 5).forEach(a => allResult.push({ type: poker.CARD_TYPE.FEIJI, count: a.length, card: a[0], cards: cards }));
    } else if (formatCards[2].length >= 2 && (cards.length == formatCards[2].length * 2)) {
        let arr = formatCards[2].slice();
        poker.series(arr, arr.length).forEach(a => allResult.push({ type: poker.CARD_TYPE.LIANDUI, count: a.length, card: a[0], cards: cards }))
    }
    return allResult;
};

poker.compare = function (group0, group1) {
    if (group0 == null)
        return true;
    if (group0.type == group1.type) {
        switch (group0.type) {
            case poker.CARD_TYPE.DAN:
            case poker.CARD_TYPE.DUI:
            case poker.CARD_TYPE.SAN:
                return group1.card > group0.card;
            case poker.CARD_TYPE.SHUN:
            case poker.CARD_TYPE.LIANDUI:
            case poker.CARD_TYPE.FEIJI:
                return group1.card > group0.card && group1.count == group0.count;
            case poker.CARD_TYPE.BOMB:
                return (group1.card > group0.card && group1.count == group0.count)
                    || group1.count > group0.count;
        }
    }
    return group0.type != poker.CARD_TYPE.BOMB && group1.type == poker.CARD_TYPE.BOMB;
};

/**
 *
 * @param group0  object  {type:"STR",count:number,card:number,cards:[]}
 * @param group1  object  {type:"STR",count:number,card:number,cards:[]}
 * @returns {boolean} or array
 */


poker.sumHands = function (hands) {
    let total = 0;
    hands.forEach(count => total += count.length);
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
        case poker.CARD_TYPE.FEIJI:
            let card = group.card;
            let count = group.count;
            //cc.log(card,count);
            let cards0 = [], cards1 = [];
            group.cards.forEach(c => (c % 100 >= card && c % 100 < card + count) ? cards0.push(c) : cards1.push(c));
            cards0.sort(poker.sortCard);
            cards1.sort(poker.sortCard);
            //cc.log(cards0.join());
            //cc.log(cards1.join());
            sortedCards = cards0.concat(cards1);
            break;
    }
    return sortedCards;
};

//
poker.max = function (arr) {
    let max = arr[0][3];
    for (let i = 1; i < arr.length; i++) {
        if (max < arr[i][3]) {
            max = arr[i][3];
        }
    }
    return max;
};

poker.autoplay = function (currentHands, current, tipsTime, shuner) {
    if (current == null)
        return null;
    let hands = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    currentHands.forEach(card => {
        hands[card % 100].push(card);
    });
    let matchs = [];
    let count, results = [];
    //cc.log("230",current);
    switch (current.type) {
        case poker.CARD_TYPE.DAN:
            hands.forEach((cards, c) => {
                if (cards.length > 0 && c > current.card % 100) {
                    let result = poker.decode([cards[0]], shuner);
                    if (result.length > 0)
                        matchs.push(result[0]);
                }
            });
            break;
        case poker.CARD_TYPE.DUI:
            hands.forEach((cards, c) => {
                if (cards.length > 1 && c > current.card % 100) {
                    let result = poker.decode(cards.slice(0, 2), shuner);
                    if (result.length > 0)
                        matchs.push(result[0]);
                }
            });
            break;
        case poker.CARD_TYPE.SAN:
            hands.forEach((cards, c) => {
                if (cards.length > 2 && c > current.card % 100) {
                    let result = poker.decode(cards.slice(0, 3), shuner);
                    if (result.length > 0)
                        matchs.push(result[0]);
                }
            });
            break;
        case poker.CARD_TYPE.SHUN:
            count = current.count;
            for (let i = current.card % 100 + 1; i < hands.length - count; i++) {
                let tmp = 0;
                let c;
                results = [];
                for (c = i; c < i + count; c++) {
                    if (hands[c].length > 0) {
                        tmp++;
                        results.push(hands[c][0]);
                    }
                }
                if (tmp == count) {
                    let result2 = poker.decode(results, shuner);
                    if (result2.length > 0)
                        matchs.push(result2[0]);
                }
            }
            break;
        case poker.CARD_TYPE.LIANDUI:
            count = current.count;
            for (let i = current.card % 100 + 1; i < hands.length - count; i++) {
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
                if (tmp == count) {
                    let result2 = poker.decode(results, shuner);
                    if (result2.length > 0)
                        matchs.push(result2[0]);
                }
            }
            break;
        case poker.CARD_TYPE.FEIJI:
            count = current.count;
            for (let i = current.card % 100 + 1; i < hands.length - count; i++) {
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
                if (tmp == count) {
                    let result2 = poker.decode(results, shuner);
                    if (result2.length > 0)
                        matchs.push(result2[0]);
                }
            }
            break;
    }
    for (let i = 4; i <= 12; i++) {
        hands.forEach((cards, card) => {
            if (cards.length >= i) {
                let result = { type: poker.CARD_TYPE.BOMB, card: card, count: i, cards: hands[card].slice(0, i) };
                if (poker.compare(current, result))
                    matchs.push(result);
            }
        });
    }

    matchs.filter(formattedCards => formattedCards.type == "BOMB").forEach(formattedCards => {
        let idx = matchs.findIndex(fc => fc.type == "DUI" && fc.card == formattedCards.card);
        if (idx >= 0)
            matchs.splice(idx, 1);
    });

    matchs.filter(formattedCards => formattedCards.type == "BOMB").forEach(formattedCards => {
        let idx = matchs.findIndex(fc => fc.type == "SAN" && fc.card == formattedCards.card);
        if (idx >= 0)
            matchs.splice(idx, 1);
    });
    for (let i = 4; i < 13; i++) {
        matchs.filter(formattedCards => formattedCards.type == "BOMB" && formattedCards.count > i).forEach(formattedCards => {
            let idx = matchs.findIndex(fc => fc.card == formattedCards.card && fc.type == "BOMB" && fc.count == i);
            if (idx >= 0)
                matchs.splice(idx, 1);
        });
    }
    // 预留 飞机顺子连队不能拆炸弹
    let idxLianDui = matchs.findIndex(fc => fc.type == "LIANDUI");
    if (idxLianDui >= 0) {
        for (let i = 0; i < matchs[idxLianDui].count; i++) {
            matchs.filter(formattedCards => formattedCards.type == "BOMB").forEach(formattedCards => {
                let idx = matchs.findIndex(fc => fc.type == "LIANDUI" && (fc.card + i == formattedCards.card));
                if (idx >= 0)
                    matchs.splice(idx, 1);
            });
        }
    }
    let idxFeiJi = matchs.findIndex(fc => fc.type == "FEIJI");
    if (idxFeiJi >= 0) {
        for (let i = 0; i < matchs[idxFeiJi].count; i++) {
            matchs.filter(formattedCards => formattedCards.type == "BOMB").forEach(formattedCards => {
                let idx = matchs.findIndex(fc => fc.type == "FEIJI" && (fc.card + i == formattedCards.card));
                if (idx >= 0)
                    matchs.splice(idx, 1);
            });
        }
    }
    //cc.log(matchs);
    if (matchs.length == 0)
        return [];
    return matchs[tipsTime % matchs.length].cards;
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

