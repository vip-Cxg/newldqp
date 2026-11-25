const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = process.env.SDH_SERVER_DIR || 'D:/work/ldqp';
const constants = {
    TABLE_STATUS: { WAIT: 'WAIT', START: 'START', SUMMARY: 'SUMMARY', DESTORY: 'DESTORY' },
    ROUTE: { SC_PLAY_ERROR: 'SC_PLAY_ERROR', SC_PLAYER_LEAVE: 'SC_PLAYER_LEAVE',
        SC_GAME_DESTORY: 'SC_GAME_DESTORY', SC_ROUND_SUMMARY: 'SC_ROUND_SUMMARY' },
    PACK: { SC_JOIN_ERROR: 'SC_JOIN_ERROR', SC_ENTER_ROOM: 'SC_ENTER_ROOM' },
    VOTE_STATUS: { EMPTY: 'EMPTY' },
    AUTO_PLAY: { AUTO_READY: 45000 },
    REDIS_KEY: { PLAYER: 'PLAYER', ROOM: 'ROOM' }, GAME_MODE: { CUSTOM: 'CUSTOM' }, GAME_TYPE: { SDH: 'SDH', PDK: 'PDK' }
};
let deleteBinding;
let removeTableRow;
const writes = [];
const redisHelper = { delPlayerGameInfo: (...args) => deleteBinding(...args) };
function load(file, base) {
    const module = { exports: null };
    vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), {
        module,
        process: { on() {} },
        setTimeout: callback => queueMicrotask(callback),
        require(name) {
            if (name === '../BaseTable') return base;
            if (name.includes('/constants')) return constants;
            if (name.includes('/redisHelper')) return redisHelper;
            if (name.includes('/ioredis')) return { ioredis: {
                async set(...args) { writes.push(args); },
                hdel: (...args) => removeTableRow(...args)
            } };
            if (name.includes('/common/utils')) return { now: () => 1000 };
            if (name.includes('/logger.js')) return { getServerLog: () => ({}), getTestLogger: () => ({}) };
            return {};
        }
    }, { filename: file });
    return module.exports;
}

const BaseTable = load('gameServer/BaseTable.js');
BaseTable.saveFileLog = async () => {};
const SdhTable = load('gameServer/sdh/table.js', BaseTable);
const BaseServer = load('gameServer/BaseServer.js');
function fixture(type) {
    const packets = [];
    const player = { exists: true, id: 21, _prop: { pid: 21 }, clear() { this.exists = false; } };
    const table = Object.assign(Object.create(SdhTable.prototype), {
        _status: 'WAIT', _mode: 'CUSTOM', _gameType: type, _scoreLog: [],
        _players: [player, { exists: true }], _tableID: 'T1', _clubID: 1, _roomID: 2,
        gameMessage(idx, route, data) { packets.push({ idx, route, msg: data.msg }); },
        refreshTableStatus() {}, broadcastGameData() {}
    });
    return { table, player, packets };
}

(async () => {
    const blocked = fixture('SDH');
    blocked.table._scoreLog.push({});
    deleteBinding = () => assert.fail('A scored game must not clear the seat');
    await blocked.table.leave(0);
    assert.deepEqual(blocked.packets, [{ idx: 0, route: 'SC_PLAY_ERROR', msg: '本局尚未结束，当前无法退出' }]);

    for (const type of ['SDH', 'PDK']) {
        const racing = fixture(type);
        deleteBinding = async () => {
            racing.table._status = 'START'; // the game starts while Redis removes the binding
            return 1;
        };
        await racing.table.leave(0);
        const [key, binding, mode] = writes.pop();
        assert.equal(key, 'PLAYER:21');
        assert.equal(JSON.parse(binding).tableID, 'T1');
        assert.equal(mode, 'NX');
        assert.equal(racing.player.exists, true);
        assert.deepEqual(racing.packets, type === 'SDH'
            ? [{ idx: 0, route: 'SC_PLAY_ERROR', msg: '牌局已开始，当前无法退出' }] : []);
    }

    const normal = fixture('SDH');
    let confirmDelete;
    deleteBinding = () => new Promise(resolve => { confirmDelete = resolve; });
    const leaving = normal.table.leave(0);
    assert.equal(normal.packets.length, 0, 'No success before clearing the reconnect binding');
    confirmDelete(1);
    await leaving;
    assert.deepEqual(normal.packets, [{ idx: 0, route: 'SC_PLAYER_LEAVE', msg: undefined }]);
    assert.equal(normal.player.exists, false);
    console.log('SDH leave: scored and concurrent-start rejections, normal acknowledgement, and other game isolation passed');

    const waiting = fixture('SDH');
    waiting.table._players[1] = { exists: true, id: 22, _prop: { pid: 22 } };
    const bindings = new Map([[21, 'T1'], [22, 'NEW-TABLE']]);
    const pendingDeletes = [];
    deleteBinding = (id, tableID) => new Promise(resolve => pendingDeletes.push(() => {
        if (bindings.get(id) !== tableID) return resolve(0);
        bindings.delete(id);
        resolve(1);
    }));
    let roomRemoved = false;
    removeTableRow = async (key, id) => {
        assert.equal(key, 'ROOM:1:2');
        assert.equal(id, 'T1');
        assert.equal(bindings.has(21), false);
        roomRemoved = true;
    };
    const destroying = waiting.table.roundSummary(null, true);
    assert.equal(waiting.table._status, 'DESTORY', 'Closing table must immediately reject entry');
    assert.equal(waiting.table.destroy(), destroying, 'Duplicate disband shares cleanup');
    assert.equal(waiting.packets.length, 0, 'No exit packet until Redis cleanup finishes');
    const server = Object.assign(Object.create(BaseServer.prototype), {
        _gameType: 'SDH', _tables: new Map([['T1', waiting.table]])
    });
    const reconnectPackets = [];
    const client = { _prop: {}, sendPack: pack => reconnectPackets.push(pack) };
    assert.equal(await server.reconnect(client, { tableID: 'T1', gameType: 'SDH', clubID: 1 }, 21), false);
    assert.deepEqual(reconnectPackets, ['SC_JOIN_ERROR']);
    assert.equal(waiting.table.syncPlayer({ id: 21 }), -1, 'A prior connection must not sync the closing table');
    pendingDeletes.forEach(complete => complete());
    await destroying;
    assert.equal(roomRemoved, true);
    assert.equal(bindings.has(21), false);
    assert.equal(bindings.get(22), 'NEW-TABLE');
    assert.deepEqual(waiting.packets, [{ idx: -1, route: 'SC_GAME_DESTORY', msg: undefined }]);

    const playing = fixture('SDH');
    playing.table._players[1] = { exists: false };
    const saved = [];
    Object.assign(playing.table, {
        _status: 'START', _turn: 1, _round: 1, _rules: { turn: 1 }, _haIDX: 0,
        resetClock() {}, roomFee() {}, async gameSummary() { saved.push('settlement'); },
        reset() { assert.fail('A disbanded game must not reopen the table'); },
        calcGameScore() { return { draw: true, players: [{ scores: { turn: 0 } }] }; },
        error(error) { saved.push(error.message); }
    });
    let attempts = 0;
    deleteBinding = async () => {
        if (++attempts === 1) throw new Error('temporary Redis failure');
        return 1;
    };
    removeTableRow = async () => {};
    await playing.table.roundSummary(null, true);
    assert.equal(attempts, 2);
    assert.deepEqual(saved, ['settlement', 'temporary Redis failure']);
    assert.deepEqual(playing.packets.map(packet => packet.route), ['SC_ROUND_SUMMARY', 'SC_GAME_DESTORY']);
    assert.equal(playing.table._status, 'DESTORY');
    console.log('SDH disband: waits for cleanup, rejects concurrent reconnect/sync, retries Redis, and settles active tables');
})().catch(error => { console.error(error); process.exitCode = 1; });
