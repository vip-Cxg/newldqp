/** Pure state model for the SDH client. Kept free of Cocos APIs for testing. */
function SDHState() {
    this.reset();
}

SDHState.prototype.reset = function () {
    this.status = 'WAIT';
    this.idx = -1;
    this.players = [null, null, null];
    this.hands = [];
    this.currentIDX = -1;
    this.callPhase = null;
    this.currentBid = 0;
    this.currentBidder = -1;
    this.minBid = 90;
    this.maxBid = 200;
    this.bidStep = 5;
    this.haIDX = -1;
    this.haBid = 0;
    this.trumpSuit = 0;
    this.trick = [];
    this.trickNum = 0;
    this.leadGroup = null;
    this.haScore = 0;
    this.opponentScore = 0;
    this.targetScore = null;
    this.bottom = [];
    this.burySelected = [];
    this.clock = 0;
    this.surrenderVote = null;
    this.summary = null;
    this.tableID = '';
    this.callPassed = [];
    this.seatBids = [];
    this.options = {};
    this.draw = false;
};

SDHState.prototype.mergeSnapshot = function (data) {
    data = data || {};
    let fields = [
        'status', 'idx', 'players', 'hands', 'currentIDX', 'callPhase',
        'currentBid', 'currentBidder', 'minBid', 'maxBid', 'bidStep',
        'haIDX', 'haBid', 'trumpSuit', 'trick', 'trickNum', 'leadGroup',
        'haScore', 'opponentScore', 'targetScore', 'bottom', 'clock',
        'surrenderVote', 'tableID', 'gameID', 'turn', 'round', 'callPassed', 'lastTrickWinner'
    ];
    fields.forEach(function (field) {
        if (data[field] !== undefined) this[field] = data[field];
    }, this);
    if (data.options) this.options = data.options;
    if (data.status === 'CALL' && data.currentBidder >= 0 && data.currentBid > 0) {
        this.seatBids[data.currentBidder] = data.currentBid;
    }
    if (data.players) {
        this.players = data.players.map((p, i) => p ? Object.assign({ idx: i }, p) : null);
        const active = this.players.find(p => p && p.idx === this.currentIDX);
        // The top-level clock in a snapshot belongs to the recipient.
        if (this.currentIDX !== this.idx) this.clock = active && active.clock || 0;
    }
    return this;
};

SDHState.prototype.apply = function (route, data) {
    data = data || {};
    switch (route) {
        case 'SC_JOIN_TABLE':
        case 'SC_GAME_DATA':
        case 'SC_RECONNECT': {
            // In single-round rooms SDH broadcasts settlement, then immediately
            // resets to WAIT. A peer syncing must not dismiss a result already shown.
            const keepSummary = this.status === 'SUMMARY' && this.summary && !data.summary &&
                data.status === 'WAIT' && data.tableID != null && data.tableID === this.tableID &&
                data.gameID != null && data.gameID === this.gameID && data.idx === this.idx &&
                Number.isInteger(this.summary.turn) && data.turn === this.summary.turn + 1;
            if (data.status === 'WAIT' && !keepSummary) this.clearRound();
            if (keepSummary) {
                this.mergeSnapshot({ players: data.players, options: data.options });
                break;
            }
            this.mergeSnapshot(data);
            if ((data.status === 'WAIT' || data.status === 'SUMMARY') && data.summary) {
                // The server's seat-private snapshot may carry the authoritative
                // result even after the table has reset to WAIT.
                this.applySummary(data.summary);
            } else if (this.status !== 'SUMMARY') {
                this.summary = null;
            }
            break;
        }
        case 'SC_JOIN_GAME':
            this.updatePlayer(data.idx, data);
            break;
        case 'SC_PLAYER_LEAVE':
            this.players[data.idx] = null;
            break;
        case 'SC_GAME_READY':
            this.updatePlayer(data.idx, { ready: data.readyStatus == null ? true : data.readyStatus, auto: !!data.auto });
            break;
        case 'SC_START_AUTO':
        case 'SC_CANCEL_AUTO':
            this.updatePlayer(data.idx, { auto: route === 'SC_START_AUTO' });
            break;
        case 'SC_CHANGE_STATUS':
            this.updatePlayer(data.idx, { offline: !!data.offline });
            break;
        case 'SC_GAME_INIT':
            this.clearRound();
            this.status = 'CALL';
            this.turn = data.turn;
            this.round = data.round;
            this.hands = (data.hands || []).slice();
            this.players.forEach((p) => { if (p && p.prop) this.updatePlayer(p.idx, { hands: this.hands.length, ready: null }); });
            break;
        case 'SC_CALL_TURN':
            this.status = 'CALL';
            this.currentIDX = data.idx;
            this.callPhase = data.phase;
            this.clock = data.clock || 0;
            ['currentBid', 'currentBidder', 'minBid', 'maxBid', 'bidStep', 'callPassed'].forEach(key => {
                if (data[key] !== undefined) this[key] = data[key];
            });
            break;
        case 'SC_CALL_HA':
            // This is the completed action, not permission to act again. Only
            // SC_CALL_TURN (or a fresh snapshot) grants another call.
            if (this.currentIDX === data.idx && (data.pass || data.bid !== undefined || data.suit)) {
                this.currentIDX = -1;
                this.clock = 0;
            }
            if (data.pass && Array.isArray(this.callPassed)) this.callPassed[data.idx] = true;
            if (data.bid !== undefined) {
                this.currentBid = data.bid;
                this.currentBidder = data.idx;
                this.seatBids[data.idx] = data.bid;
            }
            if (data.suit) this.trumpSuit = data.suit;
            if (data.auto !== undefined) this.updatePlayer(data.idx, { auto: data.auto });
            break;
        case 'SC_AUCTION_END':
            this.haIDX = data.winner;
            this.haBid = data.bid || 0;
            this.currentBid = data.bid || 0;
            this.currentBidder = data.winner;
            this.draw = !!data.draw;
            this.currentIDX = -1;
            break;
        case 'SC_TRUMP_INFO':
            this.trumpSuit = data.trumpSuit || 0;
            this.haIDX = data.haIDX;
            this.status = 'BURY';
            this.currentIDX = data.haIDX;
            this.clock = data.clock || 0;
            this.targetScore = data.targetScore == null ? null : data.targetScore;
            if (this.players[data.haIDX]) this.updatePlayer(data.haIDX, { hands: 33 });
            break;
        case 'SC_BOTTOM':
            this.status = 'BURY';
            this.bottom = (data.bottom || []).slice();
            this.hands = (data.hands || []).slice();
            this.burySelected = [];
            break;
        case 'SC_BURY_DONE':
            this.status = 'START';
            this.currentIDX = -1;
            if (this.players[data.haIDX]) this.updatePlayer(data.haIDX, { hands: 25 });
            this.burySelected = [];
            break;
        case 'SC_REFRESH_CARD':
            if (data.hands) this.hands = data.hands.slice();
            break;
        case 'SC_PLAY_CARD':
            this.status = 'START';
            this.currentIDX = data.idx;
            this.clock = data.clock || 0;
            if (data.trickNum !== undefined) this.trickNum = data.trickNum;
            this.leadGroup = data.leadGroup || null;
            break;
        case 'SC_SHOW_CARD':
            this.trick.push({ idx: data.idx, cards: (data.cards || []).slice() });
            if (data.idx === this.idx) this.removeHands(data.cards || []);
            if (this.players[data.idx]) this.updatePlayer(data.idx, {
                hands: Number.isFinite(data.hands) ? data.hands : Math.max(0, (this.players[data.idx].hands || 0) - (data.cards || []).length),
                auto: data.auto === undefined ? this.players[data.idx].auto : data.auto
            });
            this.currentIDX = -1;
            break;
        case 'SC_TRICK_END':
            this.haScore = data.haScore || 0;
            this.opponentScore = data.opponentScore || 0;
            this.trickNum = data.trickNum || this.trickNum;
            this.lastTrickWinner = data.winner;
            this.trick = [];
            this.leadGroup = null;
            break;
        case 'SC_SURRENDER':
            this.surrenderVote = data;
            break;
        case 'SC_ROUND_SUMMARY':
            this.applySummary(data);
            this.players.forEach(p => { if (p) this.updatePlayer(p.idx, { ready: null }); });
            break;
    }
    return this;
};

SDHState.prototype.applySummary = function (summary) {
    this.status = 'SUMMARY';
    this.summary = summary;
    this.currentIDX = -1;
    this.surrenderVote = null;
    ['haIDX', 'haBid', 'trumpSuit', 'haScore', 'opponentScore', 'targetScore', 'lastTrickWinner'].forEach(key => {
        if (summary[key] !== undefined) this[key] = summary[key];
    });
};

SDHState.prototype.bidLabel = function (idx) {
    if (this.status !== 'CALL') return '';
    if (this.callPhase === 'suit' && this.haIDX === idx && this.haBid > 0) return '叫 ' + this.haBid + ' 分';
    if (this.callPassed && this.callPassed[idx]) return '不叫';
    const bid = this.seatBids[idx];
    return bid > 0 ? '叫 ' + bid + ' 分' : '';
};

SDHState.prototype.updatePlayer = function (idx, data) {
    if (!Number.isInteger(idx) || idx < 0 || idx > 2) return;
    this.players[idx] = Object.assign({}, this.players[idx], data, { idx: idx });
};

SDHState.prototype.clearRound = function () {
    const fresh = new SDHState();
    ['status', 'hands', 'currentIDX', 'callPhase', 'currentBid', 'currentBidder', 'haIDX',
        'haBid', 'trumpSuit', 'trick', 'trickNum', 'leadGroup', 'haScore', 'opponentScore',
        'targetScore', 'bottom', 'burySelected', 'clock', 'surrenderVote', 'summary', 'callPassed', 'seatBids', 'draw', 'lastTrickWinner']
        .forEach(key => { this[key] = fresh[key]; });
};

SDHState.prototype.removeHands = function (cards) {
    let hands = this.hands.slice();
    (cards || []).forEach(function (card) {
        let index = hands.indexOf(card);
        if (index >= 0) hands.splice(index, 1);
    });
    this.hands = hands;
};

SDHState.prototype.toggleBury = function (card) {
    let index = this.burySelected.indexOf(card);
    if (index >= 0) {
        this.burySelected.splice(index, 1);
        return true;
    }
    if (this.burySelected.length >= 8) return false;
    this.burySelected.push(card);
    return true;
};

SDHState.prototype.canSubmitBury = function () {
    return this.status === 'BURY' && this.idx === this.haIDX && this.burySelected.length === 8;
};

module.exports = SDHState;
