// const table = {};
// const table = require('../Hulib/lib/');
const table = {}; // 使用 const 防止意外修改

// 初始化资源加载（返回 Promise）
function initTable() {
    return new Promise((resolve, reject) => {
        cc.resources.load("hnmj/tbl_16", (err, res) => {
            if (err) {
                cc.error("加载胡牌表失败:", err);
                reject(err);
                return;
            }
            Object.assign(table, res.json); // 合并数据到 table
            resolve();
        });
    });
}


class Calc {
    static sum(arr) {
        return arr.reduce((p, a) => p += a);
    }
    static find(allCards, wild, color, eye) {
        if (color >= 3) {
            return eye;
        }
        let cards = allCards[color];

        for (let i = 0; i <= wild; i++) {
            cards[0] = i;
            const key = cards.join('');
            // if (table.includes(key)) {
            if (table['' + key]) {
                let hasEye = Calc.sum(cards) % 3 == 2;
                if (eye && hasEye) {
                    continue;
                }
                if (Calc.find(allCards, wild - i, color + 1, eye || hasEye)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     *
     * @param {*} hands
     * @param {*} ground
     */
    static checkHu(hands, lai = 0) {
        if (hands.length == 14) {
            let zhong = 0, dan = 0;
            let tempHands = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            hands.forEach(c => tempHands[c]++);
            tempHands.forEach((cnt, card) => {
                if (card == 0)
                    zhong += cnt;
                else if (cnt % 2 != 0)
                    dan++;
            });
            if (dan == 0 || dan == zhong)
                return true;
        }

        let allCards = [];
        let wild = 0;
        for (let color = 0; color < 3; color++) {
            allCards.push(Array(10).fill(0));
        }
        if (hands.some(c => Math.floor(c / 10) == 3 || c < 0)) {
            return;
        }
        hands.forEach(card => {
            if (card == lai) {
                wild += 1;
                return;
            }
            allCards[Math.floor(card / 10)][card % 10] += 1;
        });
        // if (wild >= 4) {
        //     return true;
        // }
        return Calc.find(allCards, wild, 0, false);
    }

    static array2vect(hands) {
        let cards = Array(30).fill(0);
        hands.forEach(card => {
            if (card > 0)
                cards[card] += 1;
        });
        return cards;
    }
}

const CONSTANT = {
    EVENT: {
        INIT: 'INIT',
        PASS: 'PASS',
        PLAY: 'PLAY',
        CHOW: 'CHOW',
        PONG: 'PONG',
        GANG: 'GANG',
        BU: 'BU',
        ZHI: 'ZHI',
        FLOWER: 'FLOWER',
        HU: 'HU'
    }
};

module.exports = {
    initTable,
    Calc, CONSTANT
};
