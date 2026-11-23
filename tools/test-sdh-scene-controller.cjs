const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cards = require('../assets/GamePoker/GameSDH/Script/LogicSDH');

// Exercise the real controller with substitutes for the engine and socket.
const script = path.resolve(__dirname, '../assets/GamePoker/GameSDH/Script/SceneTableSDH.js');
const messages = [];
const alerts = [];
const storage = new Map();
let prototype;
const connector = {
    _queueGameMsg: [],
    emit: (...args) => messages.push(args),
    gameMessage: (...args) => messages.push(args),
    disconnect: (...args) => messages.push(['disconnect', ...args])
};
const cc = {
    color: (...rgb) => rgb,
    sys: { isBrowser: false },
    director: { loadScene: name => messages.push(['loadScene', name]) },
    Node: { EventType: {} },
    Label: { HorizontalAlign: { LEFT: 0 }, Overflow: { SHRINK: 2 } },
    Class: value => { prototype = value; }
};
vm.runInNewContext(fs.readFileSync(script, 'utf8'), {
    cc,
    require(name) {
        if (name.endsWith('/Connector')) return connector;
        if (name.endsWith('/PACK')) return { CS_JOIN_DONE: 'CS_JOIN_DONE' };
        if (name.endsWith('/Cache')) return { alertTip: msg => alerts.push(msg) };
        if (name.endsWith('/utils')) return {
            getValue: (key, fallback) => storage.get(key) || fallback,
            saveValue: (key, value) => storage.set(key, value)
        };
        if (name.endsWith('/GameConfig')) return { GameConfig: {} };
        return name.startsWith('./') ? require(path.resolve(path.dirname(script), name)) : {};
    }
});
const node = () => ({
    children: [], setContentSize() {}, setPosition(x, y) { this.x = x; this.y = y; },
    addComponent() { return {}; }, getChildByName() {}, destroyAllChildren() {}, on() {},
    removeAllChildren() { this.children = []; }
});
const makeController = () => Object.assign(Object.create(prototype), {
    node: node(), initGameBase() {}, panel: node, label: () => ({ node: node() }),
    schedule() {}, scheduleOnce() {}, render() {}, cardNode: node,
    button(parent, x, y, name, fn, width, skin) {
        const button = { x, name, fn, width: width || (skin ? 150 : 132), children: [{ getComponent: () => ({}) }] };
        parent.children.push(button);
        return button;
    }
});
const controller = makeController();
controller.onLoad();
assert.equal(messages.shift()[0], 'CS_JOIN_DONE');
controller.receive('SC_GAME_DATA', { idx: 2, status: 'CALL', haIDX: 0,
    players: [{ idx: 0, prop: { name: '庄' }, hands: 25 }, { idx: 1 }, { idx: 2 }] });
controller.receive('SC_CALL_HA', { idx: 0, suit: 1, phase: 'suit', auto: true });
assert.equal(alerts.pop(), '系统自动选主');
controller.receive('SC_TRUMP_INFO', { trumpSuit: 1, haIDX: 0 });
assert.equal(messages.shift()[0], 'CS_JOIN_DONE');
assert.equal(controller.state.targetScore, null);
controller.receive('SC_GAME_DATA', { idx: 2, status: 'BURY', haIDX: 0,
    currentIDX: 0, targetScore: 110, clock: 1000,
    players: [{ idx: 0, clock: 9000, hands: 33 }, { idx: 1, hands: 25 }, { idx: 2, hands: 25 }] });
assert.equal(controller.state.targetScore, 110);
assert.equal(controller.state.clock, 9000);
controller.receive('SC_BURY_DONE', { haIDX: 0 });
controller.state.status = 'START';
let dialog;
controller.confirm = (message, yes, no, vote) => { dialog = { message, yes, no }; controller.confirmVote = vote; };
controller.receive('SC_SURRENDER', { idx: 1, status: 'VOTE', clock: Date.now() + 15000, data: ['skip', 'allow', 'wait'] });
controller.syncSurrenderVote();
assert.match(dialog.message, /发起投降.*是否同意/);
dialog.no();
assert.equal(messages[0][0], 'CS_SURRENDER');
assert.equal(messages[0][1].allow, false);
controller.receive('SC_SURRENDER', { idx: 1, status: 'REFUSE' });
controller.syncSurrenderVote();
assert.equal(controller.confirmVote, null);
dialog.yes();
assert.equal(messages.length, 1, 'a dismissed vote must not send a stale approval');
controller.pending = null;
controller.state.idx = controller.state.currentIDX = 2;
controller.state.status = 'CALL';
controller.state.callPhase = 'bid';
controller.send('CS_CALL_HA', { bid: 115 });
assert.equal(messages.at(-1)[1].bid, 115);
controller.receive('SC_CALL_HA', { idx: 2, bid: 115 });
controller.renderControls();
assert.equal(controller.pending, null);
assert.equal(controller.state.currentIDX, -1);
assert.equal(controller.controls.children.length, 0);
controller.send('CS_CALL_HA', { bid: 120 });
assert.equal(messages.length, 2);
controller.receive('SC_CALL_TURN', { idx: 0, phase: 'bid', currentBid: 115, minBid: 120 });
controller.send('CS_CALL_HA', { bid: 120 });
assert.equal(messages.length, 2);
controller.state.status = 'START';
controller.state.currentIDX = 2;
controller.renderControls();
assert.deepEqual(controller.controls.children.map(b => b.x), [-222, 0, 222]);
const trumpView = Object.assign(Object.create(prototype), { state: new (require('../assets/GamePoker/GameSDH/Script/SDHState'))() });
trumpView.state.apply('SC_GAME_DATA', { idx: 2, haIDX: 0, status: 'CALL', currentIDX: 0, callPhase: 'suit' });
assert.equal(trumpView.trumpNotice(0), '庄家正在选主');
assert.equal(trumpView.trumpNotice(1), '');
trumpView.state.idx = 0;
assert.equal(trumpView.trumpNotice(0), '请选择主花色');
trumpView.state.apply('SC_TRUMP_INFO', { haIDX: 0, trumpSuit: 2 });
assert.equal(trumpView.trumpNotice(0), '主牌：♥ 红桃');
trumpView.state.apply('SC_PLAY_CARD', { idx: 0 });
assert.equal(trumpView.trumpNotice(0), '');
controller.onStartAuto();
assert.equal(messages.at(-1)[0], 'CS_START_AUTO');
controller.receive('SC_START_AUTO', { idx: 2 });
controller.cancelAuto();
assert.equal(messages.at(-1)[0], 'CS_CANCEL_AUTO');
controller.receive('SC_CANCEL_AUTO', { idx: 2 });
controller.state.trumpSuit = 2;
controller.state.hands = [108, 209, 305];
controller.renderHand();
controller.state.trick = [{ idx: 0, cards: [107, 107] }];
controller.requestHint(false);
const hintID = messages.at(-1)[1].requestID;
assert.equal(messages.at(-1)[0], 'CS_SDH_HINT');
controller.receive('SC_SDH_HINT', { requestID: hintID + 1, choices: [[108, 305]], forced: true });
assert.equal(controller.selected.size, 0);
controller.receive('SC_SDH_HINT', { requestID: hintID, choices: [[108, 305], [209, 305]] });
assert.equal(controller.selected.size, 0);
controller.requestHint(true);
assert.deepEqual(Array.from(controller.selected, i => controller.sorted[i]), [108, 305]);
controller.requestHint(true);
assert.deepEqual(Array.from(controller.selected, i => controller.sorted[i]), [209, 305]);
assert(!messages.some(([route]) => route === 'CS_PLAY_CARD'), 'hint should not submit a play');
controller.state.clock = 1234;
controller.selected.clear();
controller.requestHint(false);
controller.receive('SC_SDH_HINT', { requestID: messages.at(-1)[1].requestID, choices: [[108, 305]], forced: true });
assert.equal(controller.selected.size, 2, 'server-certified unique follow is preselected');
controller.state.trick = [];
controller.state.status = 'BURY';
controller.state.haIDX = 2;
controller.state.hands = Array(33).fill(105);
controller.selected.clear();
controller.renderHand();
controller.requestHint(true);
controller.receive('SC_SDH_HINT', { requestID: messages.at(-1)[1].requestID, choices: [Array(8).fill(105)] });
assert.equal(controller.selected.size, 8, 'hint resolves duplicate cards to eight distinct hand slots');
assert(!messages.some(([route]) => route === 'CS_BURY'));
controller.selected.clear();
for (const width of [960, 1136, 1386]) {
    const full = cards.handLayout(33, width, 640);
    for (const [count, breaks] of [[33, [16, 17]], [25, [8, 17]], [18, [1, 17]], [17, [17]], [9, [9]], [1, [1]]]) {
        const layout = cards.handLayout(count, width, 640);
        assert.deepEqual(layout.rows.map(row => row.length), breaks);
        assert.equal(layout.rows.at(-1).start, 0);
        assert.equal(layout.rows.at(-1).y, full.rows.at(-1).y);
        if (count > 17) assert.equal(layout.left, full.left);
        assert.equal(layout.gap, full.gap, 'centering must not change the gap across the two-to-one row transition');
        assert.equal(layout.scale, full.scale);
        assert.equal(layout.controlsY, full.controlsY);
        for (const row of layout.rows) {
            const right = layout.left + (row.length - 1) * layout.gap + layout.cardWidth;
            if (count > 17) {
                assert(layout.left >= -width / 2 + 190 - 0.001 && right <= width / 2 - 26 + 0.001);
            } else {
                assert(Math.abs(layout.left + right) < 0.001, 'single row should be centered');
                assert(layout.left >= -width / 2 && right <= width / 2, 'centered cards stay in the viewport');
            }
            assert(layout.controlsY - 48 > row.high, 'buttons should not cover raised cards');
            const y = (row.low + row.high) / 2;
            assert.equal(cards.handIndexAt(layout, layout.left + 1, y), row.start);
            assert.equal(cards.handIndexAt(layout, right - 1, y), row.start + row.length - 1);
            assert.equal(cards.handIndexAt(layout, right + 1, y), -1);
        }
    }
}
for (const widths of [[220], [184, 88, 220, 88, 184], [168, 168, 168, 168], [238, 238], [180, 208, 180]]) {
    const x = cards.centeredActions(widths, 28);
    assert.equal(x[0] - widths[0] / 2, -(x.at(-1) + widths.at(-1) / 2));
}
for (const width of [960, 1136, 1386]) {
    const layout = cards.summaryLayout(width, 640);
    const halfCard = 125 * layout.scale / 2;
    assert(layout.scale > 0.85 && layout.handWidth >= 720);
    assert(layout.handY[0] + halfCard < layout.bottomY - 125 * 0.72 / 2);
    assert(layout.handY[0] + halfCard < layout.infoY - 101 - 16);
    assert(layout.handY[0] - layout.handY[1] > 2 * halfCard);
    assert(layout.handY[1] - layout.handY[2] > 2 * halfCard);
    assert(layout.handY[2] - halfCard > layout.nextY + 35);
    assert.equal(layout.handLeft + layout.handWidth, layout.edge);
}
controller.beginHandGesture(1);
controller.sweepHandGesture(18);
controller.sweepHandGesture(20);
controller.endHandGesture(20);
assert.deepEqual(Array.from(controller.selected), [1, 18, 19, 20], 'crossing rows must not select intervening cards');
controller.selected.clear();
controller.renderHand();
controller.beginHandGesture(0);
controller.sweepHandGesture(12);
assert.deepEqual(Array.from(controller.selected), [0, 1, 2, 3, 4, 5, 6, 7]);
controller.endHandGesture(0);
controller.beginHandGesture(5);
controller.sweepHandGesture(2);
controller.sweepHandGesture(5);
controller.endHandGesture(5);
assert.deepEqual(Array.from(controller.selected), [0, 1, 6, 7]);
let returns = 0;
let surrenders = 0;
controller.leave = () => returns++;
controller.surrender = () => surrenders++;
controller.state.haIDX = -1;
controller.state.status = 'CALL';
controller.onExitTable();
assert.match(alerts.pop(), /确定庄家/);
assert.equal(returns + surrenders, 0);
controller.state.haIDX = 2;
for (const status of ['CALL', 'BURY', 'START']) {
    controller.state.status = status;
    controller.onExitTable();
}
assert.equal(surrenders, 3);
for (const status of ['WAIT', 'SUMMARY']) {
    controller.state.status = status;
    controller.onExitTable();
}
assert.equal(returns, 2);
const scene = JSON.parse(fs.readFileSync(path.join(path.dirname(script), '../Scene/GameSDH.fire'), 'utf8'));
assert.equal(scene.find(entry => entry._name === 'audioManage')._active, false,
    'native SDH entry must not start the legacy voice-pack downloader');
const scope = { idx: 0, tableID: '12345', gameID: 'sdh-1' };
const summary = { turn: 1, round: 1, draw: true };
const snapshot = { ...scope, status: 'WAIT', turn: 2, summary };
const ended = makeController();
ended.onLoad();
ended.receive('SC_GAME_DATA', { ...scope, status: 'START', turn: 1 });
ended.receive('SC_ROUND_SUMMARY', summary);
assert.equal(ended.state.summary, summary);
ended.renderSummary();
const messagesBeforeExit = messages.length;
ended.summaryPanel.children.find(button => button.name === '退出房间').fn();
assert.deepEqual(messages.slice(messagesBeforeExit).map(entry => entry[0]), ['CS_PLAYER_LEAVE', 'disconnect', 'loadScene']);
assert.equal(messages[messagesBeforeExit + 1][1], false);
const reopened = makeController();
reopened.onLoad();
reopened.receive('SC_GAME_DATA', snapshot);
assert.equal(reopened.state.status, 'WAIT');
assert.equal(reopened.state.summary, null, 'the same result must not reopen after voluntary exit');
reopened.receive('SC_ROUND_SUMMARY', summary);
assert.equal(reopened.state.summary, null, 'a duplicate push must not reopen a dismissed result');
const newResult = { ...summary, turn: 2 };
const missedSnapshot = { ...snapshot, turn: 3, summary: newResult };
reopened.receive('SC_RECONNECT', missedSnapshot);
assert.equal(reopened.state.summary, newResult, 'reconnect still recovers a result the player did not dismiss');
reopened.renderSummary();
reopened.summaryPanel.children.find(button => button.name === '继续准备').fn();
assert.equal(messages.at(-1)[0], 'CS_GAME_READY');
reopened.receive('SC_GAME_DATA', missedSnapshot);
assert.equal(reopened.state.summary, null, 'a snapshot arriving after Continue must not reopen the result');
reopened.receive('SC_GAME_DATA', { ...snapshot, gameID: 'sdh-2' });
assert.equal(reopened.state.summary, summary, 'a different game is not suppressed');
console.log('SDH scene controller: server values, snapshot clocks, vote packets, and drag selection verified');
