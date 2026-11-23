const assert = require('assert');
const logic = require('../assets/GamePoker/GameSDH/Script/LogicSDH');
const SDHState = require('../assets/GamePoker/GameSDH/Script/SDHState');

assert.strictEqual(logic.decode([105]).type, 'DAN');
assert.strictEqual(logic.decode([105, 105]).type, 'DUI');
assert.strictEqual(logic.decode([105, 105, 106, 106]).type, 'TRACTOR');
assert.deepStrictEqual(logic.sortCards([105, 615, 110, 515], 1), [615, 515, 110, 105]);

const state = new SDHState();
state.apply('SC_JOIN_TABLE', { idx: 0, status: 'WAIT', players: [0, 1, 2].map(idx => ({ idx, prop: { name: '玩家' + idx } })) });
state.apply('SC_GAME_INIT', { hands: Array(25).fill(105) });
state.apply('SC_CALL_TURN', { idx: 1, phase: 'bid', minBid: 95, clock: 2000 });
assert.strictEqual(state.idx, 0);
assert.strictEqual(state.currentIDX, 1);
assert.strictEqual(state.callPhase, 'bid');
state.apply('SC_AUCTION_END', { winner: 0, bid: 95 });
state.apply('SC_TRUMP_INFO', { haIDX: 0, trumpSuit: 2 });
assert.strictEqual(state.status, 'BURY');
assert.strictEqual(state.targetScore, null);
state.apply('SC_GAME_DATA', { status: 'BURY', idx: 0, currentIDX: 0, targetScore: 110, clock: 6000 });
assert.strictEqual(state.targetScore, 110);
state.apply('SC_BOTTOM', { bottom: Array(8).fill(205), hands: Array(33).fill(105) });
assert.strictEqual(state.hands.length, 33);
for (let i = 0; i < 8; i++) state.toggleBury(i);
assert.strictEqual(state.canSubmitBury(), true);
state.apply('SC_BURY_DONE', { haIDX: 0 });
state.apply('SC_REFRESH_CARD', { hands: Array(25).fill(105) });
state.apply('SC_PLAY_CARD', { idx: 0, trickNum: 1, leadGroup: null });
state.apply('SC_SHOW_CARD', { idx: 0, cards: [105] });
assert.strictEqual(state.hands.length, 24);
state.apply('SC_SHOW_CARD', { idx: 1, cards: [205] });
assert.strictEqual(state.players[1].hands, 24);
state.apply('SC_TRICK_END', { winner: 0, trickNum: 1, haScore: 10, opponentScore: 5 });
assert.strictEqual(state.trick.length, 0);
assert.strictEqual(state.haScore, 10);
state.apply('SC_ROUND_SUMMARY', { haWins: true });
assert.strictEqual(state.status, 'SUMMARY');

const resumed = new SDHState();
resumed.apply('SC_GAME_DATA', { idx: 2, status: 'START', currentIDX: 2, hands: [205, 205],
    targetScore: 95, leadGroup: { cards: [105, 105] }, trick: [{ idx: 0, cards: [105, 105] }],
    surrenderVote: { status: 'VOTE', data: ['skip', 'allow', 'wait'] } });
assert.strictEqual(resumed.trick.length, 1);
resumed.apply('SC_GAME_DATA', { idx: 2, status: 'START', currentIDX: 0,
    trick: [], leadGroup: null, surrenderVote: null });
assert.strictEqual(resumed.leadGroup, null);
assert.strictEqual(resumed.surrenderVote, null);
assert.strictEqual(resumed.currentIDX, 0);
resumed.apply('SC_GAME_DATA', { idx: 2, status: 'START', currentIDX: 0, clock: 1000,
    players: [{ idx: 0, clock: 9000 }, null, { idx: 2, clock: 1000 }] });
assert.strictEqual(resumed.clock, 9000);

const resultState = new SDHState();
resultState.apply('SC_GAME_DATA', { status: 'START', idx: 0, tableID: '1234', gameID: 'sdh-test', turn: 1 });
resultState.apply('SC_ROUND_SUMMARY', { turn: 1, opponentScore: 80, haWins: true });
resultState.apply('SC_GAME_DATA', { status: 'WAIT', idx: 0, tableID: '1234', gameID: 'sdh-test', turn: 2,
    players: [{ idx: 0 }, { idx: 1, ready: { plus: false } }] });
assert.strictEqual(resultState.status, 'SUMMARY');
assert.strictEqual(resultState.summary.opponentScore, 80);
resultState.apply('SC_GAME_INIT', { turn: 2, round: 1, hands: [105] });
assert.strictEqual(resultState.summary, null);
assert.strictEqual(resultState.status, 'CALL');

const missedResult = new SDHState();
const summary = { turn: 2, round: 1, haIDX: 1, trumpSuit: 2, haBid: 90, opponentScore: 55,
    targetScore: 115, buriedCards: [105, 207, 307, 409, 110, 113, 214, 415] };
missedResult.apply('SC_GAME_DATA', { status: 'WAIT', idx: 0, tableID: '1234', gameID: 'sdh-test', turn: 3,
    haIDX: -1, trumpSuit: 0, opponentScore: 0, summary });
assert.strictEqual(missedResult.status, 'SUMMARY');
assert.strictEqual(missedResult.summary, summary);
assert.strictEqual(missedResult.haIDX, 1);
assert.strictEqual(missedResult.trumpSuit, 2);
assert.strictEqual(missedResult.opponentScore, 55);
assert.strictEqual(missedResult.targetScore, 115);
missedResult.apply('SC_GAME_DATA', { status: 'START', idx: 0, turn: 3, summary });
assert.strictEqual(missedResult.summary, null);
const bids = new SDHState();
bids.apply('SC_GAME_DATA', { status: 'CALL', idx: 2, currentBidder: 0, currentBid: 90, callPassed: [false, true, false] });
assert.strictEqual(bids.bidLabel(0), '叫 90 分');
assert.strictEqual(bids.bidLabel(1), '不叫');
bids.apply('SC_CALL_TURN', { idx: 2, phase: 'bid', currentBid: 90, minBid: 95, clock: 1000 });
bids.apply('SC_CALL_HA', { idx: 2, bid: 95 });
assert.strictEqual(bids.bidLabel(2), '叫 95 分');
assert.strictEqual(bids.currentIDX, -1);
assert.strictEqual(bids.clock, 0);
bids.apply('SC_CALL_TURN', { idx: 0, phase: 'bid', currentBid: 95, minBid: 100 });
bids.apply('SC_CALL_HA', { idx: 0, bid: 100 });
bids.apply('SC_CALL_TURN', { idx: 2, phase: 'bid', currentBid: 100, minBid: 105 });
assert.strictEqual(bids.currentIDX, 2, 'another player raising can give the previous bidder a fresh turn');
bids.apply('SC_CALL_TURN', { idx: 0, phase: 'bid', currentBid: 105, minBid: 110 });
bids.apply('SC_CALL_HA', { idx: 0, pass: true });
assert.strictEqual(bids.bidLabel(0), '不叫');
assert.strictEqual(bids.currentIDX, -1);
bids.apply('SC_TRUMP_INFO', { haIDX: 2, trumpSuit: 1 });
assert.strictEqual(bids.bidLabel(2), '');
console.log('SDH client logic/state tests passed');
