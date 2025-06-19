let tips = module.exports;

const SP_CARDS = [1, 6, 9, 11, 16, 19];
const SRC = {
    PLAY: 'PLAY',
    DECK: 'DECK',
    HANDS: 'HANDS',
    GROUND: 'GROUND',
    ACTION: 'ACTION'
};
tips.sumCount = function (cards) {
    let total = 0;
    cards.forEach(c => total += c);
    return total;
};

tips.testHu = function (category, requireMen, groundXi) {
    let count = tips.sumCount(category.cards);
    if (count == 0) {//有胡
        let arr = category.temp.slice().sort();
        let str = arr.join('.');
        if (str.length > 0) {
            category.data.add(str);
        }
        return;
    }
    if (count == 1) {
        return;
    }
    let i = category.cards.findIndex(c => c > 0);
    if (requireMen && category.cards[i] >= 2) {
        category.cards[i] -= 2;
        let str = `D${i < 10 ? 0 : 1}${i % 10}0`;
        category.temp.push(str);
        tips.testHu(category, false, groundXi);
        category.temp.splice(category.temp.indexOf(str), 1);
        category.cards[i] += 2;
    }
    if (category.cards[i] == 3) {
        category.cards[i] -= 3;
        let str = `P${i < 10 ? 0 : 1}${i % 10}${i < 10 ? 1 : 3}`;
        category.temp.push(str);
        tips.testHu(category, requireMen, groundXi);
        category.temp.splice(category.temp.indexOf(str), 1);
        category.cards[i] += 3;
    }
    if (category.cards[i] > 0 && category.cards[i + 1] > 0 && category.cards[i + 2] > 0 && (i < 8 || (i > 9 && i < 18))) {// 顺
        category.cards[i]--;
        category.cards[i + 1]--;
        category.cards[i + 2]--;
        let str = `S${i < 10 ? 0 : 1}${i % 10}${i % 10 == 0 ? (i < 10 ? 3 : 6) : 0}`;
        category.temp.push(str);
        tips.testHu(category, requireMen, groundXi);
        category.temp.splice(category.temp.indexOf(str), 1);
        category.cards[i]++;
        category.cards[i + 1]++;
        category.cards[i + 2]++;
    }
    if (category.cards[1] > 0 && category.cards[6] > 0 && category.cards[9] > 0) {// 二七十
        category.cards[1]--;
        category.cards[6]--;
        category.cards[9]--;
        category.temp.push('H013');
        tips.testHu(category, requireMen, groundXi);
        category.temp.splice(category.temp.indexOf('H013'), 1);
        category.cards[1]++;
        category.cards[6]++;
        category.cards[9]++;
    }
    if (category.cards[11] > 0 && category.cards[16] > 0 && category.cards[19] > 0) {// 二七十
        category.cards[11]--;
        category.cards[16]--;
        category.cards[19]--;
        category.temp.push('H116');
        tips.testHu(category, requireMen, groundXi);
        category.temp.splice(category.temp.indexOf('H116'), 1);
        category.cards[11]++;
        category.cards[16]++;
        category.cards[19]++;
    }
    if (category.cards[i] > 0 && i < 10 && category.cards[i + 10] > 1) {// Aaa
        category.cards[i]--;
        category.cards[i + 10] -= 2;
        category.temp.push(`B0${i}0`);
        tips.testHu(category, requireMen, groundXi);
        category.temp.splice(category.temp.indexOf(`B0${i}0`), 1);
        category.cards[i]++;
        category.cards[i + 10] += 2;
    }
    if (category.cards[i] > 1 && i < 10 && category.cards[i + 10] > 0) {// AAa
        category.cards[i] -= 2;
        category.cards[i + 10]--;
        category.temp.push(`B1${i}0`);
        tips.testHu(category, requireMen, groundXi);
        category.temp.splice(category.temp.indexOf(`B1${i}0`), 1);
        category.cards[i] += 2;
        category.cards[i + 10]++;
    }
};


/**
 *
 * @param {[Number]} cards
 * @param {boolean} men
 * @returns {boolean}
 */
tips.canHu = function (cards, men) {
    let count = tips.sumCount(cards);
    if (count === 0) {//有胡
        return true;
    }
    if (count === 1) {
        return false;
    }
    let i = cards.findIndex(c => c > 0);
    if (!men && cards[i] == 2) {
        cards[i] -= 2;
        if (tips.canHu(cards, true))
            return true;
        cards[i] += 2;
    }
    if (!men && i <= 8 && cards[i + 1] > 0) {
        cards[i]--;
        cards[i + 1]--;
        if (tips.canHu(cards, true))
            return true;
        cards[i]++;
        cards[i + 1]++;
    }
    if (!men && i < 8 && cards[i + 2] > 0) {
        cards[i]--;
        cards[i + 2]--;
        if (tips.canHu(cards, true))
            return true;
        cards[i]++;
        cards[i + 2]++;
    }
    if (!men && i === 1 && cards[6] > 0) {
        cards[1]--;
        cards[6]--;
        if (tips.canHu(cards, true))
            return true;
        cards[1]++;
        cards[6]++;
    }
    if (!men && i === 1 && cards[9] > 0) {
        cards[1]--;
        cards[9]--;
        if (tips.canHu(cards, true))
            return true;
        cards[1]++;
        cards[9]++;
    }
    if (!men && i === 6 && cards[9] > 0) {
        cards[6]--;
        cards[9]--;
        if (tips.canHu(cards, true))
            return true;
        cards[6]++;
        cards[9]++;
    }
    if (cards[i] > 2) {//坎
        cards[i] -= 3;
        if (tips.canHu(cards, men))
            return true;
        cards[i] += 3;
    }
    if (cards[i] > 0 && cards[i + 1] > 0 && cards[i + 2] > 0 && i < 8) {// 顺
        cards[i]--;
        cards[i + 1]--;
        cards[i + 2]--;
        if (tips.canHu(cards, men))
            return true;
        cards[i]++;
        cards[i + 1]++;
        cards[i + 2]++;
    }
    if (cards[1] > 0 && cards[6] > 0 && cards[9] > 0) {// 二七十
        cards[1]--;
        cards[6]--;
        cards[9]--;
        if (tips.canHu(cards, men))
            return true;
        cards[1]++;
        cards[6]++;
        cards[9]++;
    }
    return false;
};

/**
 * @param {Set} data 拆牌集合
 * @param {Array} grounds 下坎
 * @param {{xi:Number, cards:[], plus:Number}} max
 * @param {boolean} wh
 */
tips.maxHu = function (data, grounds, max) {
    data.forEach(strCards => {
        let cards = strCards.split('.');
        let temp = [];
        cards.forEach(str => {
            let type = str[0];
            let base = parseInt(str[1]) * 10;
            let num = parseInt(str[2]);
            let xi = parseInt(str[3]);
            switch (type) {
                case 'S':
                    temp.push({ type: 'shun', xi: xi, cards: [num + base, num + base + 1, num + base + 2] });
                    break;
                case 'H':
                    temp.push({ type: 'shun', xi: xi, cards: [1 + base, 6 + base, 9 + base] });
                    break;
                case 'D':
                    temp.push({ type: 'dui', xi: xi, cards: [num + base, num + base] });
                    break;
                case 'P':
                    temp.push({ type: 'peng', xi: xi, cards: [num + base, num + base, num + base] });
                    break;
                case 'B':
                    if (base == 0)
                        temp.push({ type: 'shun', xi: xi, cards: [num, num + 10, num + 10] });
                    else
                        temp.push({ type: 'shun', xi: xi, cards: [num, num, num + 10] });
                    break;
            }
        });
        grounds.forEach(ground => {
            let data = { type: ground.type, xi: ground.xi };
            switch (ground.type) {
                case 'pao':
                    data.cards = [ground.card, ground.card, ground.card, ground.card];
                    break;
                case 'ti':
                    data.cards = [ground.card, ground.card, ground.card, ground.card];
                    break;
                case 'wei':
                    data.cards = [ground.card, ground.card, ground.card];
                    break;
                case 'kan':
                    data.cards = [ground.card, ground.card, ground.card];
                    break;
                case 'peng':
                    data.cards = [ground.card, ground.card, ground.card];
                    break;
                case 'chi':
                case 'bi':
                    data.cards = ground.cards;
                    break;

            }
            temp.push(data);
        });
        let xi = 0;
        temp.forEach(t => xi += t.xi);
        let hu = xi;
        if (xi == 20) {
            hu *= 2;
        } else if (xi == 30) {
            hu = 100;
        }
        if (hu >= max.hu && temp.length == 7) {
            max.xi = xi;
            max.hu = hu;
            max.cards = temp;
        }
    });
    if (data.size == 0) {
        let temp = [];
        grounds.forEach(ground => {
            let data = { type: ground.type, xi: ground.xi };
            switch (ground.type) {
                case 'pao':
                    data.cards = [ground.card, ground.card, ground.card, ground.card];
                    break;
                case 'ti':
                    data.cards = [ground.card, ground.card, ground.card, ground.card];
                    break;
                case 'wei':
                    data.cards = [ground.card, ground.card, ground.card];
                    break;
                case 'kan':
                    data.cards = [ground.card, ground.card, ground.card];
                    break;
                case 'peng':
                    data.cards = [ground.card, ground.card, ground.card];
                    break;
                case 'chi':
                case 'bi':
                    data.cards = ground.cards;
                    break;

            }
            temp.push(data);
        });
        let xi = 0;
        temp.forEach(t => xi += t.xi);
        let hu = xi;
        if (xi == 20) {
            hu *= 2;
        } else if (xi == 30) {
            hu = 100;
        }
        if (hu >= max.hu && temp.length == 7) {
            max.xi = xi;
            max.hu = hu;
            max.cards = temp;
        }
    }
};

tips.countCard = function (cards, card) {
    let count = 0;
    cards.forEach(c => {
        c.cards.forEach(c => {
            if (c == card)
                count++;
        });
    });
    return count;
};
/**
 * 最大胡法
 * @param {[number]} hands 手牌
 * @param {[]} grounds 放子
 * @param {{src:SRC,idx:number,card:number,active:boolean}} currentCard
 * @returns {{hu: number, cards: [], xi:number, score:number}}
 */
tips.makeHu = function (cards, grounds, currentCard,config) {
    let hands = cards.slice();
    hands[currentCard]++;
    let hu = 0;
    let pengIdx = grounds.findIndex(ground => ground.type == 'peng' && ground.card == currentCard);//手里跑
    if (pengIdx >= 0 && hands[currentCard] == 1) {
        grounds[pengIdx].type = 'pao';
        grounds[pengIdx].xi = currentCard < 10 ? 6 : 9;
        grounds[pengIdx].src = SRC.DECK;
        grounds[pengIdx].before = 'peng';
        hands[currentCard] = 0;
    }

    let weiIdx = grounds.findIndex(ground => ground.type == 'wei' && ground.card == currentCard);//偎后跑
    if (weiIdx >= 0 && hands[currentCard] == 1) {
        grounds[weiIdx].type = 'pao';
        grounds[weiIdx].xi = currentCard < 10 ? 6 : 9;
        grounds[weiIdx].src = SRC.GROUND;
        grounds[weiIdx].before = 'wei';
        hands[currentCard] = 0;
    }

    if (hands[currentCard] == 4) {
        grounds.push({
            type: 'pao',
            card: currentCard,
            xi: currentCard < 10 ? 6 : 9,
            src: SRC.PLAY,
            before: 'kan'
        });//手里跑
        hands[currentCard] = 0;
    }
    hands.forEach((count, card) => {
        if (count == 3 && card != currentCard) {
            grounds.push({ type: 'kan', card: card, xi: card < 10 ? 3 : 6 });
            hands[card] = 0;
        }
    });
    let category = { cards: hands.slice(), temp: [], data: new Set() };
    let result = { xi: 0, cards: [], hu: 0 };
    let requireMen = grounds.findIndex(ground => ground.type == 'ti' || ground.type == 'pao') >= 0;
    let groundXi = 0;
    grounds.forEach(g => groundXi += g.xi);
    tips.testHu(category, requireMen, groundXi);
    tips.maxHu(category.data, grounds, result);
    //尝试破跑胡
    let paoIdx = grounds.findIndex(ground => ground.card == currentCard && ground.type == 'pao');
    if (paoIdx >= 0) {
        let paoGround = JSON.parse(JSON.stringify(grounds));
        category = { cards: hands.slice(), temp: [], data: new Set() };
        let ground = paoGround[paoIdx];
        switch (ground.src) {
            case SRC.DECK:
                ground.type = 'peng';
                ground.xi = currentCard < 10 ? 1 : 3;
                delete ground.src;
                category.cards[currentCard] = 1;
                break;
            case SRC.GROUND://偎后跑
                ground.type = 'wei';
                ground.xi = currentCard < 10 ? 3 : 6;
                delete ground.src;
                category.cards[currentCard] = 1;
                break;
            case SRC.PLAY://手里跑
                ground.type = 'kan';
                ground.xi = currentCard < 10 ? 3 : 6;
                delete ground.src;
                category.cards[currentCard] = 1;
                break;
        }
        requireMen = paoGround.findIndex(ground => ground.type == 'ti' || ground.type == 'pao') >= 0;
        groundXi += ground.xi;
        tips.testHu(category, requireMen, groundXi);
        tips.maxHu(category.data, paoGround, result);
    }
    return result.xi >= 15 && result.cards.length >= 7;
};