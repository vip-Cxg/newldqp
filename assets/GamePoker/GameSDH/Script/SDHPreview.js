// Offline protocol fixture. The live game never uses these rules or scores.
const logic = require('./LogicSDH');
const score = cards => cards.reduce((sum, card) => sum + ({ 5: 5, 10: 10, 13: 10 }[card % 100] || 0), 0);
const copy = value => JSON.parse(JSON.stringify(value));

module.exports = class SDHPreview {
    constructor(receive) {
        this.receive = receive;
        this.reset();
    }
    reset() {
        this.table = {
            idx: 0, status: 'WAIT', tableID: '离线预览', haIDX: -1, currentIDX: -1,
            players: ['自己', '电脑甲', '电脑乙'].map((name, idx) => ({ idx, prop: { name }, hands: 0, ready: null })),
            hands: [], trick: [], trickNum: 0, leadGroup: null,
            haScore: 0, opponentScore: 0, targetScore: null, surrenderVote: null
        };
        this.reconnect();
    }
    reconnect() { this.emit('SC_GAME_DATA', this.table); }
    emit(route, data) { this.receive(route, copy(data)); }
    turn(idx, route, data) {
        this.table.currentIDX = idx;
        this.table.clock = Date.now() + 60000;
        this.emit(route, Object.assign({ idx, clock: this.table.clock }, data));
    }
    error(msg) { this.emit('SC_PLAY_ERROR', { msg }); }
    send(route, data) {
        const t = this.table;
        switch (route) {
            case 'CS_GAME_READY': {
                if (t.status === 'SUMMARY') this.reset();
                const live = this.table;
                if (live.status !== 'WAIT') return;
                const deck = [];
                for (let n = 0; n < 2; n++) {
                    for (let suit = 1; suit <= 4; suit++) {
                        for (let rank = 5; rank <= 15; rank++) deck.push(suit * 100 + rank);
                    }
                    deck.push(515, 615);
                }
                // Stable nontrivial deal: duplicate ranks, mixed suits, and jokers.
                const deal = deck.map((_, i) => deck[(23 + i * 17) % deck.length]);
                this.allHands = [deal.slice(0, 25), deal.slice(25, 50), deal.slice(50, 75)];
                this.bottom = deal.slice(75, 83);
                this.buried = [];
                this.lastWinner = -1;
                live.players.forEach(p => {
                    this.emit('SC_GAME_READY', { idx: p.idx, readyStatus: { plus: false } });
                    p.hands = 25;
                });
                live.hands = this.allHands[0];
                live.status = 'CALL';
                live.callPhase = 'bid';
                live.currentBid = 0;
                live.currentBidder = -1;
                live.minBid = 90; live.maxBid = 200; live.bidStep = 5;
                this.emit('SC_GAME_INIT', { hands: live.hands });
                this.turn(0, 'SC_CALL_TURN', { phase: 'bid', minBid: 90, maxBid: 200, bidStep: 5, currentBid: 0 });
                break;
            }
            case 'CS_CALL_HA':
                if (t.status !== 'CALL' || t.currentIDX !== 0) return;
                if (t.callPhase === 'bid') {
                    if (!data.pass && (!Number.isInteger(data.bid) || data.bid < 90 || data.bid > 200 || data.bid % 5)) return this.error('叫庄分无效');
                    this.emit('SC_CALL_HA', Object.assign({ idx: 0 }, data));
                    // In the preview the computer seats always pass.
                    [1, 2].forEach(idx => this.emit('SC_CALL_HA', { idx, pass: true }));
                    if (data.pass) {
                        this.emit('SC_AUCTION_END', { winner: -1, bid: 0, draw: true });
                        return this.finish(null, true);
                    }
                    t.haIDX = 0;
                    t.haBid = t.currentBid = data.bid;
                    t.currentBidder = 0;
                    t.callPhase = 'suit';
                    this.emit('SC_AUCTION_END', { winner: 0, bid: data.bid });
                    return this.turn(0, 'SC_CALL_TURN', { phase: 'suit' });
                }
                if (![1, 2, 3, 4].includes(data.suit)) return this.error('请选择主花色');
                t.trumpSuit = data.suit;
                t.status = 'BURY';
                t.targetScore = 205 - t.haBid;
                t.clock = Date.now() + 60000;
                this.allHands[0].push(...this.bottom);
                t.players[0].hands = 33;
                this.emit('SC_TRUMP_INFO', { haIDX: 0, trumpSuit: data.suit, targetScore: t.targetScore, clock: t.clock });
                this.emit('SC_BOTTOM', { hands: t.hands, bottom: this.bottom });
                break;
            case 'CS_BURY':
                if (t.status !== 'BURY') return;
                if (!data.cards || data.cards.length !== 8 || !this.remove(0, data.cards)) return this.error('请选择 8 张手牌扣底');
                this.buried = data.cards.slice();
                t.status = 'START';
                this.emit('SC_BURY_DONE', { haIDX: 0 });
                this.emit('SC_REFRESH_CARD', { hands: t.hands });
                this.turn(0, 'SC_PLAY_CARD', { trickNum: 0 });
                break;
            case 'CS_PLAY_CARD':
                if (t.status !== 'START' || t.currentIDX !== 0) return;
                this.play(data.cards);
                break;
            case 'CS_SDH_HINT': {
                // Offline fixture only; live suggestions come from the server.
                const rank = card => logic.trumpWeight(card, t.trumpSuit);
                const ordered = t.hands.slice().sort((a, b) =>
                    (logic.isTrump(a, t.trumpSuit) - logic.isTrump(b, t.trumpSuit)) * 2e4 +
                    (score([a]) - score([b])) * 100 + rank(a) - rank(b));
                const choices = t.status === 'BURY' ? [ordered.slice(0, 8)] :
                    [...new Set(ordered)].slice(0, 8).map(card => [card]);
                this.emit('SC_SDH_HINT', { requestID: data.requestID, choices, forced: false });
                break;
            }
            case 'CS_START_AUTO':
            case 'CS_CANCEL_AUTO':
                t.players[0].auto = route === 'CS_START_AUTO';
                this.emit(t.players[0].auto ? 'SC_START_AUTO' : 'SC_CANCEL_AUTO', { idx: 0 });
                if (t.players[0].auto && t.status === 'START') this.play([t.hands[t.hands.length - 1]]);
                break;
            case 'CS_SURRENDER':
                if (t.haIDX !== 0 || !data.allow) return;
                this.emit('SC_SURRENDER', { idx: 0, status: 'CONFIRM', direct: true, role: 'banker' });
                this.finish('banker');
                break;
        }
    }
    remove(idx, cards) {
        const remaining = this.allHands[idx].slice();
        for (const card of cards) {
            const i = remaining.indexOf(card);
            if (i < 0) return false;
            remaining.splice(i, 1);
        }
        this.allHands[idx] = remaining;
        this.table.players[idx].hands = remaining.length;
        if (idx === 0) this.table.hands = remaining;
        return true;
    }
    play(chosen) {
        const t = this.table;
        if (!Array.isArray(chosen) || !chosen.length || !this.remove(0, chosen)) return this.error('请选择手牌');
        const group = card => logic.isTrump(card, t.trumpSuit) ? 0 : logic.cardSuit(card);
        const lead = group(chosen[0]);
        const plays = [{ idx: 0, cards: chosen }];
        for (let idx = 1; idx < 3; idx++) {
            const hand = this.allHands[idx];
            const response = hand.filter(card => group(card) === lead)
                .concat(hand.filter(card => group(card) !== lead)).slice(0, chosen.length);
            this.remove(idx, response);
            plays.push({ idx, cards: response });
        }
        const weight = card => group(card) === 0 ? logic.trumpWeight(card, t.trumpSuit) :
            group(card) === lead ? card % 100 : -1;
        t.trick = plays;
        const winner = plays.reduce((best, p) => weight(p.cards[0]) > weight(best.cards[0]) ? p : best);
        plays.forEach(p => this.emit('SC_SHOW_CARD', { idx: p.idx, cards: p.cards, hands: t.players[p.idx].hands, trickNum: t.trickNum }));
        const trickCards = plays.reduce((all, p) => all.concat(p.cards), []);
        const trickScore = score(trickCards);
        this.lastWinner = winner.idx;
        if (winner.idx === 0) t.haScore += trickScore;
        else t.opponentScore += trickScore;
        t.trickNum++;
        t.trick = [];
        this.emit('SC_TRICK_END', { winner: winner.idx, trickNum: t.trickNum, trickScore, haScore: t.haScore, opponentScore: t.opponentScore });
        if (!t.hands.length || t.opponentScore >= t.targetScore) this.finish(null);
        else this.turn(0, 'SC_PLAY_CARD', { trickNum: t.trickNum });
    }
    finish(surrenderSide, draw) {
        const t = this.table;
        const bottomScore = score(this.buried);
        const opponentScore = t.opponentScore + (!draw && this.lastWinner > 0 ? bottomScore * 2 : 0);
        const haWins = !surrenderSide && opponentScore < t.targetScore;
        t.status = 'SUMMARY';
        t.currentIDX = -1;
        t.summary = {
            draw: !!draw, haWins, surrenderSide, haBid: t.haBid,
            opponentScore, targetScore: t.targetScore, bottomScore,
            buriedCards: this.buried, lastTrickWinner: this.lastWinner,
            players: this.allHands.map((hands, idx) => ({ idx, hands, scores: { round: draw ? 0 : (idx === 0 ? 2 : -1) * (haWins ? 10 : -10) } }))
        };
        this.emit('SC_ROUND_SUMMARY', t.summary);
    }
};
