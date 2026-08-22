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
poker.decode = (cards, shun, wildcard = 17, options = {}) => {
    if (typeof shun === 'object' && shun !== null) {
        options = shun;
        shun = undefined;
    }
    if (typeof wildcard === 'object' && wildcard !== null) {
        options = wildcard;
        wildcard = 17;
    }
    if (typeof shun === 'boolean' && options.allowShun == null) {
        options.allowShun = shun;
    }
    let wildcardCount = cards.filter(c => c % 100 === wildcard).length;
    if (wildcardCount === 0 || wildcardCount == cards.length) {
      return poker.decodeNormal(cards, options); // 没有癞子，直接解析
    }
    let fixedCards = cards.filter(c => c % 100 !== wildcard);

    // 癞子可以变成 5~15（点数，不含3/4），避免重复已有的点数（可按需调整）
    const candidatePoints = [];
    for (let i = 5; i <= 15; i++) {
      candidatePoints.push(i);
    }

    // 穷举所有替代组合（可重复）
    function generateCombinations(arr, n) {
      if (n === 0) return [[]];
      const result = [];
      for (let i = 0; i < arr.length; i++) {
        const rest = generateCombinations(arr, n - 1);
        for (let r of rest) {
          result.push([arr[i], ...r]);
        }
      }
      return result;
    }

    const allReplacements = generateCombinations(candidatePoints, wildcardCount);
    const resultMap = new Map(); // 记录每种类型的最大结构

    for (const replacement of allReplacements) {
      const testCards = [...fixedCards];
      for (let pt of replacement) {
        testCards.push(100 + pt); // 假设癞子变成黑桃
      }
      // console.log(testCards)
      const decodedList = poker.decodeNormal(testCards, options);
      if (!decodedList || decodedList.length === 0) continue;
      decodedList.forEach(d => {
        d.cards = cards;
      })
      const filteredList = decodedList.filter(d => {
        // 过滤炸弹张数 > 8 的组合
        if (d.type === poker.CARD_TYPE.BOMB && d.count > 8) {
          return false;
        }
        return true;
      });
      for (let d of filteredList) {
        let key = d.type;
        let exist = resultMap.get(key);
        if (!exist || poker.compare(exist, d)) {
          resultMap.set(key, d);
        }
      }
    }

    return Array.from(resultMap.values());
  };
/**
 * ½âÂëÅÆÐÍ
 * @param cards
 * @param shuner
 * @return {[]}
 */
poker.decodeNormal = function (cards, shuner) {  //cards±ä³É ÐòÁÐ»¯µÄÅÆÐÍ
    if (cards == null)
        return null;
    let allowShun = false;
    if (typeof shuner === 'object' && shuner !== null) {
        if (shuner.allowShun != null) {
            allowShun = !!shuner.allowShun;
        } else if (shuner.poker != null) {
            allowShun = Number(shuner.poker) === 2;
        }
    } else {
        allowShun = !!shuner;
    }
    cards.sort(poker.sortCard);
    let tmpCards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    cards.forEach(card => {
        tmpCards[card % 100]++;
    });
    let allResult = [];
    let card = tmpCards.findIndex(count => count >= 4);
    if (card >= 0 && tmpCards[card] == cards.length) {
        // allResult.push({ type: poker.CARD_TYPE.BOMB, count: cards.length, card: card % 100, cards: cards });
        const isWangZha =
        cards.length === 4 &&
        cards.every(c => c % 100 === 17);

      allResult.push({
        type: poker.CARD_TYPE.BOMB,
        count: isWangZha ? 8 : cards.length,
        card: card % 100,
        cards: cards
      });
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
    if (allowShun && formatCards[1].length >= 5 && formatCards[1].length == cards.length) {
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
      const originCard0 = Math.max(...group0.cards);
      const originCard1 = Math.max(...group1.cards);
      const isWangZha = group =>
        group.type === poker.CARD_TYPE.BOMB &&
        group.cards.length === 4 &&
        group.cards.every(c => c % 100 === 17);
  
      const wangZha0 = isWangZha(group0);
      const wangZha1 = isWangZha(group1);
  
      // 四鬼炸弹判断：谁是王炸，谁赢
      if (wangZha0 && wangZha1) return originCard1 > originCard0;
      if (wangZha1) return true;
      if (wangZha0) return false;
      const card0 = group0.card;
      const card1 = group1.card;
      if (group0.type == group1.type) {
        switch (group0.type) {
          case poker.CARD_TYPE.DAN:
          case poker.CARD_TYPE.DUI:
            if (card0 === 17 && card1 === 17) {
              return originCard1 > originCard0; // 大鬼胜小鬼
          }
          return group1.card > group0.card;
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
    // if (group0 == null)
    //     return true;
    // if (group0.type == group1.type) {
    //     switch (group0.type) {
    //         case poker.CARD_TYPE.DAN:
    //         case poker.CARD_TYPE.DUI:
    //         case poker.CARD_TYPE.SAN:
    //             return group1.card > group0.card;
    //         case poker.CARD_TYPE.SHUN:
    //         case poker.CARD_TYPE.LIANDUI:
    //         case poker.CARD_TYPE.FEIJI:
    //             return group1.card > group0.card && group1.count == group0.count;
    //         case poker.CARD_TYPE.BOMB:
    //             return (group1.card > group0.card && group1.count == group0.count)
    //                 || group1.count > group0.count;
    //     }
    // }
    // return group0.type != poker.CARD_TYPE.BOMB && group1.type == poker.CARD_TYPE.BOMB;
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
    const wildcardCards = hands[17];
    const minWildcardPoint = 5;
    const maxWildcardPoint = 15;

    // 自动提示生成的癞子候选仍交给统一的牌型解析和比较逻辑判断，
    // 避免提示规则与手动选牌规则不一致。
    const addDecodedCandidate = function (cards, expectedType) {
        if (cards.length === 0)
            return;
        let decoded = poker.decode(cards.slice(), shuner) || [];
        decoded.filter(group => group.type === expectedType && poker.compare(current, group)).forEach(group => {
            let cardKey = group.cards.slice().sort((a, b) => a - b).join(",");
            let duplicated = matchs.some(match =>
                match.type === group.type &&
                match.card === group.card &&
                match.count === group.count &&
                match.cards.slice().sort((a, b) => a - b).join(",") === cardKey
            );
            if (!duplicated)
                matchs.push(group);
        });
    };

    const addWildcardGroup = function (point, requiredCount, expectedType) {
        let naturalCards = hands[point];
        if (naturalCards.length === 0 || naturalCards.length >= requiredCount)
            return;
        let missingCount = requiredCount - naturalCards.length;
        if (missingCount <= wildcardCards.length) {
            addDecodedCandidate(
                naturalCards.slice().concat(wildcardCards.slice(0, missingCount)),
                expectedType
            );
        }
    };

    const addWildcardSeries = function (startPoint, seriesCount, cardsPerPoint, expectedType) {
        let candidate = [];
        let missingCount = 0;
        for (let point = startPoint; point < startPoint + seriesCount; point++) {
            let takeCount = Math.min(hands[point].length, cardsPerPoint);
            candidate = candidate.concat(hands[point].slice(0, takeCount));
            missingCount += cardsPerPoint - takeCount;
        }
        if (missingCount > 0 && missingCount <= wildcardCards.length) {
            candidate = candidate.concat(wildcardCards.slice(0, missingCount));
            addDecodedCandidate(candidate, expectedType);
        }
    };
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
            for (let point = Math.max(minWildcardPoint, current.card % 100 + 1); point <= maxWildcardPoint; point++)
                addWildcardGroup(point, 2, poker.CARD_TYPE.DUI);
            break;
        case poker.CARD_TYPE.SAN:
            hands.forEach((cards, c) => {
                if (cards.length > 2 && c > current.card % 100) {
                    let result = poker.decode(cards.slice(0, 3), shuner);
                    if (result.length > 0)
                        matchs.push(result[0]);
                }
            });
            for (let point = Math.max(minWildcardPoint, current.card % 100 + 1); point <= maxWildcardPoint; point++)
                addWildcardGroup(point, 3, poker.CARD_TYPE.SAN);
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
            for (let start = Math.max(minWildcardPoint, current.card % 100 + 1); start + count - 1 <= maxWildcardPoint; start++)
                addWildcardSeries(start, count, 1, poker.CARD_TYPE.SHUN);
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
            for (let start = Math.max(minWildcardPoint, current.card % 100 + 1); start + count - 1 <= maxWildcardPoint; start++)
                addWildcardSeries(start, count, 2, poker.CARD_TYPE.LIANDUI);
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
            for (let start = Math.max(minWildcardPoint, current.card % 100 + 1); start + count - 1 <= maxWildcardPoint; start++)
                addWildcardSeries(start, count, 3, poker.CARD_TYPE.FEIJI);
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
    for (let point = minWildcardPoint; point <= maxWildcardPoint; point++) {
        let naturalCount = hands[point].length;
        if (naturalCount === 0)
            continue;
        for (let bombCount = 4; bombCount <= 8; bombCount++) {
            if (naturalCount < bombCount && bombCount - naturalCount <= wildcardCards.length) {
                addDecodedCandidate(
                    hands[point].slice().concat(wildcardCards.slice(0, bombCount - naturalCount)),
                    poker.CARD_TYPE.BOMB
                );
            }
        }
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

