const assert = require('node:assert/strict');
const path = '../assets/GamePoker/GameSDH/Script/';
const State = require(path + 'SDHState');
const Preview = require(path + 'SDHPreview');

function setup() {
    let client = new State();
    const events = [];
    const preview = new Preview((route, data) => {
        events.push(route);
        client.apply(route, data);
    });
    function restore() {
        const keys = ['idx', 'status', 'hands', 'haIDX', 'trumpSuit', 'opponentScore', 'targetScore', 'trickNum', 'currentIDX'];
        const expected = keys.map(key => client[key]);
        client = new State();
        preview.reconnect();
        assert.deepEqual(keys.map(key => client[key]), expected);
    }
    return { preview, events, restore, state: () => client };
}

const game = setup();
const { preview, restore, state, events } = game;
assert.equal(state().players.length, 3);
preview.send('CS_GAME_READY', {});
assert.equal(state().hands.length, 25);
assert.equal(state().callPhase, 'bid');
restore();
preview.send('CS_CALL_HA', { bid: 95 });
assert.equal(state().callPhase, 'suit');
restore();
preview.send('CS_CALL_HA', { suit: 4 });
assert.equal(state().hands.length, 33);
assert.equal(state().targetScore, 110);
restore();
preview.send('CS_BURY', { cards: state().hands.slice(0, 7) });
assert.equal(events.at(-1), 'SC_PLAY_ERROR');
assert.equal(state().hands.length, 33);
preview.send('CS_BURY', { cards: state().hands.slice(0, 8) });
assert.equal(state().hands.length, 25);
assert.equal(state().status, 'START');
restore();
preview.send('CS_START_AUTO', {});
assert.equal(state().players[0].auto, true);
assert.equal(state().trickNum, 1);
preview.send('CS_CANCEL_AUTO', {});
assert.equal(state().players[0].auto, false);
restore();
for (let i = 0; i < 25 && state().status === 'START'; i++) {
    preview.send('CS_PLAY_CARD', { cards: state().hands.slice(0, 1) });
}
assert.equal(state().status, 'SUMMARY');
assert.equal(state().summary.buriedCards.length, 8);
assert.equal(state().summary.players.length, 3);
assert(events.includes('SC_TRICK_END'));
restore();
assert.equal(state().summary.buriedCards.length, 8);
preview.send('CS_GAME_READY', {});
assert.equal(state().status, 'CALL');
preview.send('CS_CALL_HA', { pass: true });
assert.equal(state().summary.draw, true);
preview.send('CS_GAME_READY', {});
preview.send('CS_CALL_HA', { bid: 95 });
preview.send('CS_CALL_HA', { suit: 4 });
preview.send('CS_SURRENDER', { allow: true });
assert.equal(state().summary.surrenderSide, 'banker');
console.log('SDH offline protocol flow, reconnects and alternate endings verified');
