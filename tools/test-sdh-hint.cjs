const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const server = process.env.SDH_SERVER_DIR || 'D:/work/ldqp';
const calc = require(path.join(server, 'gameServer/sdh/calc.js'));
const trump = 4;
function check(hands, leadCards, expectedForced) {
    const lead = leadCards && calc.decode(leadCards, trump);
    const hint = calc.suggestPlays(hands, lead, trump);
    assert.equal(hint.forced, expectedForced);
    assert(hint.choices.length > 0 && hint.choices.length <= 8);
    assert.equal(new Set(hint.choices.map(group => group.slice().sort().join(','))).size, hint.choices.length);
    for (const choice of hint.choices) assert(calc.canPlayGroup(choice, hands, lead, trump));
    return hint;
}
assert.deepEqual(check([115, 615, 108, 108, 107], null, false).choices[0], [107]);
assert.deepEqual(check([108, 108, 114, 114, 205, 205], [106, 106], false).choices[0], [108, 108]);
assert.deepEqual(check([108, 108, 206, 209], [107, 107], true).choices, [[108, 108]]);
assert.equal(check([108, 108, 208, 209], [107, 107], false).choices.length, 2,
    'keep the current server rule for equal-ranked cross-suit pairs');
assert.deepEqual(check([107, 107, 108, 108, 215, 515], [105, 105, 106, 106], true).choices,
    [[107, 107, 108, 108]]);
assert.deepEqual(check([108, 107, 206, 209, 615], [105, 105], false).choices[0].sort(), [107, 108]);
assert.deepEqual(check([108, 209], [105, 105], true).choices, [[108, 209]]);

const moduleObject = { exports: null };
const statuses = { START: 'START', BURY: 'BURY' };
vm.runInNewContext(fs.readFileSync(path.join(server, 'gameServer/sdh/table.js'), 'utf8'), {
    module: moduleObject,
    require(name) {
        if (name === '../BaseTable') return class {};
        if (name === './calc') return calc;
        if (name.endsWith('/constants')) return { TABLE_STATUS: statuses };
        return {};
    }
});
const table = Object.assign(Object.create(moduleObject.exports.prototype), {
    _players: [108, 209].map(card => ({ exists: true, _hands: [card, card, 110, 615, 205, 206, 207, 212, 214] })),
    _trumpSuit: trump, _status: 'START', _currentIDX: 0, _haIDX: 0,
    _leadGroup: calc.decode([107, 107], trump), _bottomCards: Array(8),
    gameMessage: (...args) => sent.push(args)
});
const sent = [];
table.customMessage('CS_SDH_HINT', 1, { requestID: 1 });
assert.equal(sent.length, 0, 'other seats cannot request the current hand hint');
const original = table._players[0]._hands.slice();
table.customMessage('CS_SDH_HINT', 0, { requestID: 2 });
assert.equal(sent[0][0], 0, 'only the requester gets suggestions');
assert.equal(sent[0][1], 'SC_SDH_HINT');
assert.equal(sent[0][2].requestID, 2);
assert.deepEqual(sent[0][2].choices, [[108, 108]]);
table.playCard = (idx, { cards }) => assert.deepEqual(cards, sent[0][2].choices[0]);
table.autoPlayCard(0);
table._status = 'BURY';
table.customMessage('CS_SDH_HINT', 1, { requestID: 3 });
assert.equal(sent.length, 1);
table.customMessage('CS_SDH_HINT', 0, { requestID: 4 });
assert.equal(sent[1][2].choices[0].length, 8);
assert(!sent[1][2].choices[0].includes(615), 'leave the strongest trump in hand');
assert.deepEqual(table._players[0]._hands, original, 'hints do not play cards or bury cards');
console.log('SDH hints: legal single/pair/tractor/fallback choices, forced detection, private delivery and auto/preview parity passed');
