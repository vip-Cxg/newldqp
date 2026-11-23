const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const requests = [];
const alerts = [];
let confirms = 0;
const GameConfig = {
    GameStatus: { WAIT: 'WAIT', SUMMARY: 'SUMMARY' }, GameType: { XHZD: 'XHZD' },
    TableType: { CUSTOM: '普通桌' }, GameName: { SDH: '新华包牌' },
    ServerEventName: { JoinClubGame: 'game/joinGame' }, LastSocketTime: 0
};
const App = { Club: { CurrentClubID: 669645, CurrentClubRole: 'user', IsLeague: true } };
const source = fs.readFileSync(path.join(__dirname, '../assets/script/ui/hall/ModuleTableItem.js'), 'utf8')
    .replace(/^import .+$/gm, '').replace(/^\s*@(ccclass|property\([^\r\n]*\))[^\S\r\n]*$/gm, '')
    .replace('export default class ', 'module.exports = class ');
const moduleObject = { exports: null };
vm.runInNewContext(source, {
    module: moduleObject, GameConfig, App, CompListRenderer: class {},
    cc: { _decorator: {}, Node: { EventType: { TOUCH_END: 'touchend' } } },
    Cache: { alertTip: msg => alerts.push(msg), showConfirm: () => confirms++ },
    utils: { isNullOrEmpty: value => value == null || value === '' },
    Connector: { request: (route, data) => requests.push({ route, ...data }) }
});
const handlers = new Set();
const cell = Object.assign(new moduleObject.exports(), {
    gameStatus: { node: {} }, tableBg: {}, tableName: {},
    player1: {}, player2: {}, player3: {}, player4: {}, avatar: [{}, {}, {}],
    node: {
        on: (_event, handler) => handlers.add(handler),
        off: (_event, handler) => handlers.delete(handler)
    },
    openRoomPop: () => alerts.push('open')
});
const table = { tableID: '307898', roomID: 182, mode: 'CUSTOM', gameType: 'SDH',
    status: 'WAIT', person: 3, players: [{ pid: 645493 }, {}, {}],
    roomData: { gameType: 'HALL', roomID: [182] }, roomNameDict: new Map([[182, '新华包牌本地桌']]) };
const click = () => {
    GameConfig.LastSocketTime = 0;
    GameConfig.IsConnecting = false;
    for (const handler of handlers) handler();
};
for (const role of ['user', 'owner', 'manager']) {
    App.Club.CurrentClubRole = role;
    cell.initData(table);
    cell.initData(table);
    assert.equal(handlers.size, 1);
    click();
    assert.deepEqual(requests.pop(), { route: 'game/joinGame', tableID: '307898',
        roomID: 182, gameType: 'SDH', clubID: 669645 });
    assert.equal(confirms, 0);
}
cell.initData({ ...table, status: 'START' });
click();
assert.match(alerts.pop(), /已开局/);
cell.initData({ ...table, players: [{ pid: 1 }, { pid: 2 }, { pid: 3 }] });
click();
assert.match(alerts.pop(), /已坐满/);
assert.equal(requests.length, 0);
cell.initData({ ...table, gameType: 'XHZD' });
click();
assert.equal(confirms, 1, 'Existing non-SDH owner action is unchanged');
cell.initData({ ...table, type: 'create' });
click();
assert.equal(alerts.pop(), 'open');
cell.removeEvents();
assert.equal(handlers.size, 0);
console.log('SDH lobby: existing-table clicks join by tableID for members and owners; recycled rows bind only once');
