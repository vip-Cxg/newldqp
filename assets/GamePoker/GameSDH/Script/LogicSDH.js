/**
 * 新华包牌客户端基础牌组工具。
 *
 * 这里只负责选择数量、基础牌组形状和排序。跟牌合法性、牌组大小、
 * 本墩赢家及结算必须以 SDH 服务端返回为准。
 */
let poker = module.exports;

// Keep the original poker face size, but don't compress an entire 25/33-card
// SDH hand into a single strip. Reserve the left edge for the local avatar.
poker.handLayout = function (count, width, height) {
    const scale = 1.3;
    const cardWidth = 90 * scale;
    const halfHeight = 125 * scale / 2;
    const lift = 22;
    const rowStep = 90;
    const bottom = -height / 2 + 15;
    const lowerY = bottom + halfHeight;
    const columns = 17;
    const split = count > columns;
    // Use the two-row table spacing in both modes. Centering moves the
    // whole single row without compressing the cards.
    const leftInset = 190;
    const rightInset = 26;
    const available = Math.max(cardWidth, width - leftInset - rightInset);
    const gap = Math.max(0, Math.min(66, (available - cardWidth) / Math.max(1, columns - 1)));
    const usedColumns = split ? columns : count;
    const offset = split ? leftInset - rightInset : 0;
    const left = (offset - (Math.max(0, usedColumns - 1) * gap + cardWidth)) / 2;
    const seam = lowerY + halfHeight + lift;
    const row = (start, length, y, low, high) => ({ start, length, y, low, high });
    const rows = [];
    // Draw the overflow first. Once it disappears, the lower row stays at
    // the same height but centers itself horizontally.
    if (split) rows.push(row(columns, count - columns, lowerY + rowStep, seam, seam + rowStep));
    if (count) rows.push(row(0, Math.min(count, columns), lowerY, bottom, seam));
    const highest = seam + rowStep;
    return { rows, scale, cardWidth, lift, left, gap, highest, controlsY: highest + 80 };
};

poker.centeredActions = function (widths, gap) {
    const total = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, widths.length - 1);
    let left = -total / 2;
    return widths.map(width => {
        const center = left + width / 2;
        left += width + gap;
        return center;
    });
};

poker.hintIndices = function (hand, suggestion) {
    if (!Array.isArray(suggestion) || !suggestion.length) return null;
    const selected = new Set();
    for (const card of suggestion) {
        const idx = hand.findIndex((value, i) => value === card && !selected.has(i));
        if (idx < 0) return null;
        selected.add(idx);
    }
    return selected;
};

poker.summaryLayout = function (width, height) {
    const edge = Math.min(width, 1334) / 2 - 32;
    const top = height / 2;
    const handTop = top - 184;
    const handBottom = -top + 104;
    const spacing = 10;
    const scale = Math.min(0.92, (handTop - handBottom - 2 * spacing) / (3 * 125));
    const cardHeight = 125 * scale;
    return {
        edge, top, scale,
        bottomWidth: 300, bottomY: top - 120,
        infoWidth: 300, infoY: top - 45,
        handLeft: -edge + 176, handWidth: 2 * edge - 176,
        handY: [0, 1, 2].map(i => handTop - cardHeight / 2 - i * (cardHeight + spacing)),
        nextY: -top + 52
    };
};

poker.handIndexAt = function (layout, x, y) {
    const row = layout.rows.find(row => y >= row.low && y < row.high);
    const delta = x - layout.left;
    if (!row || delta < 0 || delta >= (row.length - 1) * layout.gap + layout.cardWidth) return -1;
    return row.start + (layout.gap ? Math.min(row.length - 1, Math.floor(delta / layout.gap)) : row.length - 1);
};

// A drag has one intent: select or deselect all cards swept by the finger.
// Work by hand index so the two copies of a card remain individually selectable.
poker.sweepSelection = function (selected, from, to, selecting, limit) {
    const visited = [];
    const step = to < from ? -1 : 1;
    for (let i = from; ; i += step) {
        if (selecting) {
            if (selected.has(i) || selected.size < limit) {
                selected.add(i);
                visited.push(i);
            }
        } else {
            selected.delete(i);
            visited.push(i);
        }
        if (i === to) break;
    }
    return visited;
};

poker.CARD_TYPE = {
    DAN: 'DAN',
    DUI: 'DUI',
    LIANDUI: 'LIANDUI',
    TRACTOR: 'TRACTOR',
    UNKNOWN: 'UNKNOWN'
};

poker.cardSuit = function (card) {
    if (card === 515 || card === 615) return 5;
    return Math.floor(card / 100);
};

poker.cardValue = function (card) {
    if (card === 515) return 16;
    if (card === 615) return 17;
    return card % 100;
};

poker.isTrump = function (card, trumpSuit) {
    let value = card % 100;
    return card === 515 || card === 615 || value === 10 || value === 15 || poker.cardSuit(card) === trumpSuit;
};

poker.trumpWeight = function (card, trumpSuit) {
    if (card === 615) return 1000;
    if (card === 515) return 990;
    let suit = poker.cardSuit(card);
    let value = card % 100;
    if (value === 10) return suit === trumpSuit ? 980 : 970 + suit;
    if (value === 15) return suit === trumpSuit ? 960 : 950 + suit;
    if (suit === trumpSuit) return 900 + value;
    return value;
};

poker.sortCards = function (cards, trumpSuit) {
    return (cards || []).slice().sort(function (a, b) {
        let aTrump = poker.isTrump(a, trumpSuit);
        let bTrump = poker.isTrump(b, trumpSuit);
        if (aTrump !== bTrump) return aTrump ? -1 : 1;
        if (!aTrump && poker.cardSuit(a) !== poker.cardSuit(b)) {
            return poker.cardSuit(a) - poker.cardSuit(b);
        }
        let weight = poker.trumpWeight(b, trumpSuit) - poker.trumpWeight(a, trumpSuit);
        return weight || a - b;
    });
};

// Compatibility helpers used by the copied visual-only card layout component.
poker.sortCard = function (a, b) {
    return poker.cardValue(a) - poker.cardValue(b) || a - b;
};

poker.sortPlayedCard = function (group) {
    let cards = group && group.cards ? group.cards : group || [];
    return cards.slice().sort(poker.sortCard);
};

poker.decode = function (cards) {
    cards = (cards || []).slice();
    if (!cards.length) return null;
    if (cards.length === 1) {
        return { type: poker.CARD_TYPE.DAN, cards: cards, card: cards[0], count: 1 };
    }

    let counts = {};
    cards.forEach(function (card) { counts[card] = (counts[card] || 0) + 1; });
    let keys = Object.keys(counts).map(Number);
    if (cards.length === 2 && keys.length === 1) {
        return { type: poker.CARD_TYPE.DUI, cards: cards, card: keys[0], count: 2 };
    }

    if (cards.length >= 4 && cards.length % 2 === 0 && keys.every(function (card) { return counts[card] === 2; })) {
        let sameSuit = keys.every(function (card) { return poker.cardSuit(card) === poker.cardSuit(keys[0]); });
        let values = keys.map(poker.cardValue).sort(function (a, b) { return a - b; });
        let consecutive = values.every(function (value, index) { return index === 0 || value === values[index - 1] + 1; });
        if (sameSuit && consecutive) {
            return { type: poker.CARD_TYPE.TRACTOR, cards: cards, card: keys[0], count: cards.length };
        }
    }
    return { type: poker.CARD_TYPE.UNKNOWN, cards: cards, card: cards[0], count: cards.length };
};

poker.compare = function (leadGroup, selectedGroup) {
    if (!selectedGroup) return false;
    if (!leadGroup) return selectedGroup.type !== poker.CARD_TYPE.UNKNOWN;
    let leadCount = leadGroup.count || (leadGroup.cards && leadGroup.cards.length) || 0;
    return selectedGroup.cards.length === leadCount;
};

poker.checkCard = function (cards, length, config, leadGroup) {
    let group = poker.decode(cards);
    if (!group || !poker.compare(leadGroup, group)) {
        return { cardList: null, otherCard: [] };
    }
    return { cardList: group, otherCard: [] };
};

poker.autoplay = function (hands, leadGroup) {
    hands = hands || [];
    if (!hands.length) return [];
    let count = leadGroup ? (leadGroup.count || (leadGroup.cards && leadGroup.cards.length) || 1) : 1;
    if (count > hands.length) return [];
    return [hands.slice(hands.length - count)];
};
