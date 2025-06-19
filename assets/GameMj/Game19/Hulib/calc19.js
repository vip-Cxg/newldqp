let calc = module.exports;

let eyeTable = {};
let table = {};

// 初始化资源加载（返回 Promise）
function initTables() {
    return Promise.all([
        new Promise((resolve, reject) => {
            cc.resources.load("hnmj/tbl_eye", (err, res) => {
                if (err) {
                    cc.error("加载 eyeTable 失败:", err);
                    reject(err);
                    return;
                }
                eyeTable = res.json;
                cc.log("eyeTable 加载成功");
                resolve();
            });
        }),
        new Promise((resolve, reject) => {
            cc.resources.load("hnmj/tbl", (err, res) => {
                if (err) {
                    cc.error("加载 table 失败:", err);
                    reject(err);
                    return;
                }
                table = res.json;
                cc.log("table 加载成功");
                resolve();
            });
        })
    ]);
}

calc.array2vect = function (arr) {
    let cards = new Array(40).fill(0);
    arr.forEach(card => {
        cards[card] += 1;
    });
    return cards;
};

calc.isSingle = function (hands, cards) {
    if (hands.length != 14) {
        return false;
    }
    for (let card of SINGLE_CARDS) {
        if (cards[card] < 1) {
            return false;
        }
    }
    return cards.indexOf(2) >= 0;
};

calc.sum = function (arr) {
    return arr.reduce((p, a) => p += a);
};

calc.encodeKey = function (colorID, cards) {
    let key = 0;
    for (let card = 1; card < 10; card++) {
        key = key * 10 + cards[colorID * 10 + card];
    }
    return key;
};

const SINGLE_CARDS = [1, 9, 11, 19, 21, 29, 31, 32, 33, 34, 35, 36, 37];

calc.checkHu = function (hands) {
    if (!eyeTable || !table) {
        cc.error("胡牌表未初始化，请先调用 initTables");
        return false;
    }

    let cards = calc.array2vect(hands);
    if (calc.isSingle(hands, cards)) {
        return true;
    }

    let count = [
        calc.sum(cards.slice(1, 10)),
        calc.sum(cards.slice(11, 20)),
        calc.sum(cards.slice(21, 30)),
        calc.sum(cards.slice(31, 38))
    ];

    let pair = 0, triplet = [];
    cards.forEach((cnt, card) => {
        switch (cnt) {
            case 2:
                pair += 1;
                break;
            case 3:
                triplet.push(card);
                break;
            case 4:
                pair += 2;
                break;
        }
    });

    if ((triplet.length * 3 + 2 == hands.length && pair == 1) || pair == 7) {
        return true;
    }

    let eyeIDX = count.findIndex(cnt => cnt % 3 == 2);
    for (let card = 31; card < 38; card++) {
        let key = cards[card] % 3;
        switch (key) {
            case 1:
                return false;
            case 2:
                if (eyeIDX != 3) {
                    return false;
                }
                break;
        }
    }

    for (let colorID = 0; colorID < 3; colorID++) {
        if (colorID == eyeIDX) {
            if (count[colorID] % 3 != 2) {
                return false;
            }
            let key = calc.encodeKey(colorID, cards);
            if (key > 0 && eyeTable[`${key}`] == null) {
                return false;
            }
        } else if (count[colorID] % 3 != 0) {
            return false;
        } else {
            let key = calc.encodeKey(colorID, cards);
            if (key > 0 && table[`${key}`] == null) {
                return false;
            }
        }
    }

    return true;
};

// 导出初始化方法和模块
module.exports = {
    initTables, // 导出初始化方法
    ...calc // 导出原有方法
};