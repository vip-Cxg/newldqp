const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { once } = require('node:events');
const { createRequire } = require('node:module');
const State = require('../assets/GamePoker/GameSDH/Script/SDHState');

// Validate the exact patched source, or apply the diff in memory to an
// unpatched checkout. Neither path writes to the server checkout.
const root = process.env.SDH_SERVER_DIR || 'D:/work/ldqp';
const source = fs.readFileSync(path.join(root, 'gameServer/sdh/table.js'), 'utf8').replace(/\r/g, '').split('\n');
function patchInMemory(file) {
    const patch = fs.readFileSync(path.join(__dirname, 'patches', file), 'utf8').replace(/\r/g, '');
    const hunks = patch.split(/^@@ /m).slice(1);
    const find = lines => source.findIndex((line, i) =>
        line === lines[0] && lines.every((expected, offset) => source[i + offset] === expected));
    for (const hunk of hunks) {
        const body = hunk.split('\n').slice(1);
        const before = body.filter(x => /^[ -]/.test(x)).map(x => x.slice(1));
        const after = body.filter(x => /^[ +]/.test(x)).map(x => x.slice(1));
        if (find(after) >= 0) continue;
        const index = find(before);
        assert(index >= 0, 'Server source no longer matches ' + file);
        source.splice(index, before.length, ...after);
    }
}
patchInMemory('sdh-resume-settlement.patch');
patchInMemory('sdh-auction-recovery.patch');

const constants = { TABLE_STATUS: { WAIT: 'WAIT', CALL: 'CALL', START: 'START', SUMMARY: 'SUMMARY', DESTORY: 'DESTORY' },
    ROUTE: { SC_ROUND_SUMMARY: 'SC_ROUND_SUMMARY', SC_GAME_DATA: 'SC_GAME_DATA' },
    AUTO_PLAY: { AUTO_START: 60000, AUTO_READY: 5000 }, VOTE_STATUS: { EMPTY: 'EMPTY' } };
const parent = { exports: null };
vm.runInNewContext(fs.readFileSync(path.join(root, 'gameServer/BaseTable.js'), 'utf8'), {
    module: parent,
    require(name) {
        if (name.endsWith('/constants.js')) return constants;
        if (name.endsWith('/logger.js')) return { getServerLog: () => ({ debug() {} }), getTestLogger: () => ({}) };
        return {};
    }
});
const BaseTable = parent.exports;
BaseTable.saveFileLog = async () => {};
function makePlayer(data) {
    return {
        ...data,
        sync() {},
        checkAuto() { return false; },
        prepare() { this._hands = []; },
        reset() { this._readyStatus = null; },
        getData() { return { idx: this._idx, prop: this._prop }; },
        toJSON() { return { id: this.id, _idx: this._idx, _prop: this._prop, exists: this.exists,
            _readyStatus: this._readyStatus, _hands: this._hands }; }
    };
}
const moduleObject = { exports: null };
vm.runInNewContext(source.join('\n'), {
    module: moduleObject, console,
    require(name) {
        if (name === '../BaseTable') return BaseTable;
        if (name.endsWith('/constants')) return constants;
        if (name.endsWith('/utils')) return { now: () => 1000 };
        if (name === './player') return { fromJSON: makePlayer };
        if (name === 'node-schedule') return { scheduleJob() {} };
        return {};
    }
});
const Table = moduleObject.exports;
function createFixture() {
    const players = [0, 1, 2].map(idx => makePlayer({
    id: 21 + idx, _idx: idx, _prop: { pid: 21 + idx }, exists: true, _hands: [105],
    _scores: { round: idx === 1 ? 20 : -10 }
    }));
    const sent = [];
    const table = Object.assign(Object.create(Table.prototype), {
    _status: 'START', _round: 1, _turn: 2, _gameID: 'game', _tableID: 'table',
    _rules: { turn: 1 }, _options: { person: 3 },
    _trumpSuit: 3, _haIDX: 1, _players: players, _scoreLog: [],
    refreshTableStatus() {}, roomFee() {}, error(error) { throw error; },
    async gameSummary() {}, async updateTask() {}, log() {},
    calcGameScore() { return { haWins: true, players: players.map(p => ({
        idx: p._idx, userID: p.id, hands: p._hands, scores: p._scores
    })), buriedCards: [105, 106, 107, 108, 109, 110, 111, 112] }; },
    gameMessage(idx, route, data) { sent.push({ idx, route, data }); }
    });
    return { table, sent, players };
}

function createAuction(currentIDX, currentBidder, currentBid, callPassed) {
    const fixture = createFixture();
    Object.assign(fixture.table, { _status: 'CALL', _callPhase: 'bid', _currentIDX: currentIDX,
        _currentBidder: currentBidder, _currentBid: currentBid, _callPassed: callPassed });
    return fixture;
}

const wedged = createAuction(-1, 1, 90, [true, true, true]);
wedged.table.playerCheck();
assert.equal(wedged.table._callPhase, 'suit');
assert.equal(wedged.table._currentIDX, 1);
assert.deepEqual(wedged.sent.map(packet => packet.route), ['SC_AUCTION_END', 'SC_CALL_TURN']);
const reconnectAuction = new State();
reconnectAuction.apply('SC_GAME_DATA', JSON.parse(JSON.stringify({
    ...wedged.table.getPlayerGameData(1), ...wedged.table.getTableBaseData()
})));
assert.equal(reconnectAuction.currentIDX, 1);
assert.equal(reconnectAuction.callPhase, 'suit');
assert.equal(reconnectAuction.bidLabel(1), '叫 90 分');
const voting = createAuction(1, 0, 90, [false, false, false]);
voting.table.handleCallHa(1, { bid: 95 });
assert.equal(voting.table._currentIDX, 2);
voting.table.handleCallHa(2, { pass: true });
assert.equal(voting.table._currentIDX, 0);
voting.table.handleCallHa(0, { pass: true });
assert.equal(voting.table._currentIDX, 1);
assert.equal(voting.table._callPhase, 'suit');
const missingTurn = createAuction(-1, 1, 90, [false, false, true]);
missingTurn.table.playerCheck();
assert.equal(missingTurn.table._currentIDX, 0);
assert.equal(missingTurn.sent.at(-1).data.phase, 'bid');
const noBid = createAuction(-1, -1, 0, [true, true, true]);
noBid.table.roundSummary = (_, __, options) => assert(options.draw);
noBid.table.playerCheck();
assert.equal(noBid.sent[0].data.draw, true);
console.log('SDH auction: recovered stalled snapshots, preserved bidding order, and flowed to a draw with no bids');

const { table, sent, players } = createFixture();
table.roundSummary();
const last = sent[0].data;
assert.equal(sent[0].route, 'SC_ROUND_SUMMARY');
assert.equal(last.haIDX, 1);
assert.equal(last.trumpSuit, 3);
const fresh = new State();
const syncFrom = sent.length;
assert.equal(table.syncPlayer({ id: players[1].id }), 1);
const snapshots = sent.slice(syncFrom);
assert.equal(snapshots.length, 3);
assert(snapshots.every(packet => packet.route === 'SC_GAME_DATA'));
const reconnect = snapshots.find(packet => packet.idx === 1).data;
assert.equal(reconnect.status, 'WAIT');
assert.equal(reconnect.turn, 3);
for (const other of snapshots.filter(packet => packet.idx !== 1)) {
    assert.equal(other.data.summary, undefined, 'Public table snapshot must exclude settlement');
    assert.equal(other.data.hands, undefined, 'Public table snapshot must exclude private hand');
}
assert.equal(table.syncPlayer({ id: 999 }), -1);
assert.equal(sent.length, syncFrom + 3, 'Unknown player must receive no snapshot');
fresh.apply('SC_GAME_DATA', JSON.parse(JSON.stringify(reconnect)));
assert.equal(fresh.status, 'SUMMARY');
assert.equal(fresh.haIDX, 1);
assert.equal(fresh.trumpSuit, 3);
assert.equal(fresh.summary.buriedCards.length, 8);
players[1]._hands.pop();
assert.equal(reconnect.summary.players[1].hands.length, 1, 'Snapshot must not alias mutable hands');
const revived = Table.fromJSON(JSON.parse(JSON.stringify(table)));
assert.equal(revived.getPlayerGameData(1).summary.haIDX, 1);
assert.equal(revived.getPlayerGameData(1).summary.buriedCards.length, 8);
players[1]._readyStatus = { plus: false };
assert.equal(table.getPlayerGameData(1).summary, undefined);
players[1]._readyStatus = null;
players[1].id = 99;
assert.equal(table.getPlayerGameData(1).summary, undefined);
table._gameID = 'another-game';
assert.equal(table.getPlayerGameData(0).summary, undefined);
console.log('SDH settlement proposal: real sync fan-out, post-reset and serialized reconnects, and seat isolation passed in memory');

async function wireTest() {
    const Socket = createRequire(path.resolve(root, 'package.json'))('ws');
    const server = new Socket.Server({ host: '127.0.0.1', port: 0 });
    const clients = new Set();
    const peers = new Map();
    const fixture = createFixture();
    // This transport is test-only: seat identities are fixture values. Production
    // socket authentication, database and the running lobby are not involved.
    fixture.table.gameMessage = (idx, route, data) => {
        const packet = JSON.stringify({ pack: 'SC_GAME_MESSAGE', data: { route, data } });
        const sockets = idx === -1 ? peers.values() : [peers.get(idx)];
        for (const peer of sockets) if (peer && peer.readyState === Socket.OPEN) peer.send(packet);
    };
    server.on('connection', (peer, request) => {
        const idx = Number(request.url.slice(1));
        assert([0, 1, 2].includes(idx));
        peers.set(idx, peer);
        peer.on('close', () => { if (peers.get(idx) === peer) peers.delete(idx); });
        peer.on('message', data => {
            assert.equal(JSON.parse(data).pack, 'CS_JOIN_DONE');
            fixture.table.syncPlayer({ id: fixture.players[idx].id });
        });
    });
    try {
        await once(server, 'listening');
        async function connect(idx) {
            const socket = new Socket('ws://127.0.0.1:' + server.address().port + '/' + idx);
            clients.add(socket);
            socket.on('message', data => {
                const decoded = JSON.parse(data);
                assert.equal(decoded.pack, 'SC_GAME_MESSAGE');
                socket.received.push(decoded.data);
            });
            socket.received = [];
            await once(socket, 'open');
            return socket;
        }
        async function packetFrom(socket, route) {
            for (let i = 0; i < 100; i++) {
                const packet = socket.received.find(msg => msg.route === route);
                if (packet) return packet.data;
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            throw new Error('Timed out waiting for ' + route);
        }
        const seat0 = await connect(0);
        const priorSeat1 = await connect(1);
        const disconnected = once(priorSeat1, 'close');
        priorSeat1.close();
        await disconnected;
        fixture.table.roundSummary();
        const original = await packetFrom(seat0, 'SC_ROUND_SUMMARY');
        assert.equal(priorSeat1.received.length, 0);

        const seat1 = await connect(1);
        seat1.send(JSON.stringify({ pack: 'CS_JOIN_DONE', data: {} }));
        const tableOnly = await packetFrom(seat0, 'SC_GAME_DATA');
        const reopened = await packetFrom(seat1, 'SC_GAME_DATA');
        assert.equal(tableOnly.summary, undefined);
        assert.equal(tableOnly.hands, undefined);
        assert.equal(reopened.status, 'WAIT');
        assert.deepEqual(reopened.summary, original);
        const recovered = new State();
        recovered.apply('SC_GAME_DATA', reopened);
        assert.equal(recovered.status, 'SUMMARY');
        assert.equal(recovered.haIDX, 1);
        assert.equal(recovered.summary.buriedCards.length, 8);
        console.log('Isolated WebSocket: disconnected seat missed the broadcast and restored its exact settlement on reconnect');

        Object.assign(fixture.table, { _status: 'CALL', _callPhase: 'bid', _currentIDX: -1,
            _currentBid: 90, _currentBidder: 1, _callPassed: [true, true, true] });
        seat1.received = [];
        seat1.send(JSON.stringify({ pack: 'CS_JOIN_DONE', data: {} }));
        const stalled = await packetFrom(seat1, 'SC_GAME_DATA');
        assert.equal(stalled.currentIDX, -1);
        const resumed = new State();
        resumed.apply('SC_GAME_DATA', stalled);
        fixture.table.playerCheck();
        resumed.apply('SC_AUCTION_END', await packetFrom(seat1, 'SC_AUCTION_END'));
        const next = await packetFrom(seat1, 'SC_CALL_TURN');
        resumed.apply('SC_CALL_TURN', next);
        assert.equal(resumed.currentIDX, resumed.idx);
        assert.equal(resumed.callPhase, 'suit');
        assert.equal(resumed.bidLabel(1), '叫 90 分');
        console.log('Isolated WebSocket: reconnected to the stalled auction and received the restored banker’s turn');
    } finally {
        for (const socket of clients) socket.terminate();
        for (const peer of server.clients) peer.terminate();
        await new Promise(resolve => server.close(resolve));
    }
}

if (process.argv.includes('--wire')) wireTest().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
