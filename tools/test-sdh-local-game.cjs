// End-to-end smoke test against the dedicated local test room; no production traffic.
const assert = require('node:assert/strict');
const path = require('node:path');
const { createRequire } = require('node:module');
const { localAuth, post } = require('./check-sdh-local-login.cjs');
const State = require('../assets/GamePoker/GameSDH/Script/SDHState');
const base = path.resolve(process.env.SDH_SERVER_DIR || 'D:/work/ldqp');
const load = createRequire(path.join(base, 'package.json'));
const Socket = load('ws');
const Calc = load('./gameServer/sdh/calc');
const sockets = new Set();
const [clubID, roomID] = process.argv.slice(2).map(Number);

function waitFor(label, predicate) {
    return new Promise((resolve, reject) => {
        const end = Date.now() + 6000;
        function poll() {
            try {
                if (predicate()) return resolve();
                if (Date.now() >= end) return reject(new Error('Timed out: ' + label));
                setTimeout(poll, 20);
            } catch (error) { reject(error); }
        }
        poll();
    });
}

class Seat {
    constructor(token) {
        this.token = token;
        this.events = [];
        this.state = new State();
    }
    async connect(info) {
        assert.equal(new URL(info.url).origin, 'ws://127.0.0.1:8204', 'Refusing non-local socket');
        this.error = null;
        this.events = [];
        this.ws = new Socket(info.url);
        sockets.add(this.ws);
        this.ws.on('error', err => { this.error = err.message; });
        this.ws.on('message', body => {
            const { pack, data } = JSON.parse(body);
            if (pack === 'SC_ENTER_ROOM') this.send('CS_JOIN_DONE', {});
            else if (pack === 'SC_JOIN_ERROR') this.error = data.msg;
            else if (pack === 'SC_GAME_MESSAGE') {
                this.events.push(data);
                this.state.apply(data.route, data.data);
            }
        });
        await this.runUntil(() => this.ws.readyState === Socket.OPEN, 'open socket');
        this.send('CS_CONNECT_INIT', { ...info.data, token: this.token(), location: { lat: 0, long: 0 } });
        await this.route('SC_GAME_DATA');
    }
    send(pack, data) { this.ws.send(JSON.stringify({ pack, data })); }
    game(route, data) { this.send('CS_GAME_MESSAGE', { route, data }); }
    runUntil(predicate, label) {
        return waitFor(label, () => {
            if (this.error) throw new Error(this.error);
            return predicate();
        });
    }
    async route(route, from = 0) {
        await this.runUntil(() => this.events.slice(from).some(event => event.route === route), route);
        return this.events.slice(from).find(event => event.route === route).data;
    }
    async close() {
        if (this.ws.readyState < Socket.CLOSING) this.ws.close();
        await waitFor('socket close', () => this.ws.readyState === Socket.CLOSED);
    }
}

async function run() {
    assert(Number.isInteger(clubID) && clubID > 0 && Number.isInteger(roomID) && roomID > 0,
        'Pass the clubID and roomID printed by seed-sdh-local.cjs');
    const login = await localAuth();
    const seats = [];
    const finishAborted = process.argv.includes('--finish-aborted');
    const join = async (token, tableID) => {
        const response = await post('game/joinGame', { clubID, roomID, gameType: 'SDH', tableID }, token());
        if (!response.success) throw new Error('Join API: ' + (response.message || 'failed'));
        return { url: response.url, data: response.data };
    };
    for (const name of ['sdh-local-01', 'sdh-local-02', 'sdh-local-03']) {
        const seat = new Seat(await login(name));
        if (finishAborted) {
            const lobby = await post('game/info', {}, seat.token());
            const info = lobby.connectInfo;
            const data = info && info.data;
            assert(data && data.gameType === 'SDH' && data.clubID == clubID && data.roomID == roomID,
                'Refusing to clean up a table outside the dedicated SDH test room');
            if (seats.length) assert.equal(String(data.tableID), String(seats[0].state.tableID));
            await seat.connect(info);
        } else {
            await seat.connect(await join(seat.token, seats.length ? seats[0].state.tableID : ''));
        }
        seats.push(seat);
    }
    const observer = seats[0];
    const tableID = observer.state.tableID;
    const byIndex = idx => seats.find(seat => seat.state.idx === idx);
    assert.equal(new Set(seats.map(seat => seat.state.idx)).size, 3);
    assert(seats.every(seat => seat.state.tableID === tableID));
    if (finishAborted) {
        if (observer.state.status === 'CALL' && observer.state.haIDX < 0 && observer.state.currentBid === 0) {
            for (let i = 0; i < 3; i++) {
                const active = byIndex(observer.state.currentIDX);
                const from = observer.events.length;
                active.game('CS_CALL_HA', { pass: true });
                await observer.runUntil(() => observer.events.slice(from).some(e =>
                    e.route === 'SC_CALL_TURN' || e.route === 'SC_ROUND_SUMMARY'), 'aborted auction closes');
                if (observer.state.summary) break;
            }
            await Promise.all(seats.map(seat => seat.route('SC_ROUND_SUMMARY')));
            assert.equal(observer.state.summary.draw, true);
            console.log('Closed the aborted test auction with three passes');
        } else if (['CALL', 'BURY', 'START'].includes(observer.state.status)) {
            const banker = byIndex(observer.state.haIDX);
            assert(banker, 'No banker on the aborted test table');
            banker.game('CS_SURRENDER', { allow: true });
            await Promise.all(seats.map(seat => seat.route('SC_ROUND_SUMMARY')));
            assert.equal(observer.state.summary.haWins, false);
            console.log('Closed the aborted test game via banker surrender');
        } else {
            assert.equal(observer.state.status, 'WAIT', 'Unexpected phase; will not alter table');
        }
        for (const seat of seats) {
            seat.game('CS_PLAYER_LEAVE', {});
            await seat.close();
        }
        return;
    }
    seats.forEach(seat => seat.game('CS_GAME_READY', { plus: false, shuffle: false }));
    const bid = await observer.route('SC_CALL_TURN');
    await Promise.all(seats.map(seat => seat.route('SC_GAME_INIT')));
    assert(seats.every(seat => seat.state.hands.length === 25));
    const banker = byIndex(bid.idx);
    for (let i = 0; i < 3; i++) {
        const s = observer.state;
        if (s.callPhase === 'suit') break;
        const active = byIndex(s.currentIDX);
        const from = observer.events.length;
        active.game('CS_CALL_HA', active === banker ? { bid: 95 } : { pass: true });
        await observer.route('SC_CALL_TURN', from);
    }
    assert.equal(observer.state.callPhase, 'suit');
    assert.equal(observer.state.haIDX, banker.state.idx);
    banker.game('CS_CALL_HA', { suit: 2 });
    await banker.route('SC_BOTTOM');
    assert.equal(banker.state.hands.length, 33);
    const syncAt = banker.events.length;
    banker.send('CS_JOIN_DONE', {});
    await banker.route('SC_GAME_DATA', syncAt);
    assert.equal(banker.state.targetScore, 110);
    banker.game('CS_BURY', { cards: banker.state.hands.slice(0, 8) });
    await observer.route('SC_PLAY_CARD');
    assert.equal(banker.state.hands.length, 25);
    console.log('Three seats, readiness, bidding, trump selection and 33→25 cards verified');

    const [idleA, idleB] = seats.filter(seat => seat !== banker);
    if (process.argv.includes('--miss-settlement')) {
        await idleA.close();
        banker.game('CS_SURRENDER', { allow: true });
        const original = await banker.route('SC_ROUND_SUMMARY');
        await idleB.route('SC_ROUND_SUMMARY');
        idleA.state = new State();
        await idleA.connect(await join(idleA.token, tableID));
        const restored = idleA.state.summary;
        assert(restored, 'Reconnect snapshot did not include the missed result');
        assert.equal(idleA.state.status, 'SUMMARY');
        assert.equal(restored.turn, original.turn);
        assert.equal(restored.haWins, original.haWins);
        assert.deepEqual(restored.buriedCards, original.buriedCards);
        assert.deepEqual(restored.players, original.players);
        console.log('Local server recovered the missed settlement after disconnect');
        for (const seat of seats) {
            seat.game('CS_PLAYER_LEAVE', {});
            await seat.close();
        }
        return;
    }
    idleA.game('CS_START_AUTO', {});
    await observer.route('SC_START_AUTO');
    assert.equal(observer.state.players[idleA.state.idx].auto, true);
    idleA.game('CS_CANCEL_AUTO', {});
    await observer.route('SC_CANCEL_AUTO');
    assert.equal(observer.state.players[idleA.state.idx].auto, false);
    idleA.game('CS_SURRENDER', { allow: true });
    await idleB.route('SC_SURRENDER');
    assert.equal(idleB.state.surrenderVote.data[idleB.state.idx], 'wait');
    idleB.game('CS_SURRENDER', { allow: false });
    await observer.runUntil(() => observer.state.surrenderVote && observer.state.surrenderVote.status === 'REFUSE', 'surrender refusal');
    assert.equal(observer.state.status, 'START');
    console.log('Auto-play toggle and rejected two-seat surrender vote verified');

    let reconnects = 0;
    let actions = 0;
    while (!observer.state.summary && actions < 75) {
        const turn = observer.state.currentIDX;
        assert(turn >= 0);
        const active = byIndex(turn);
        let s = active.state;
        if (!reconnects && s.trick.length === 1) {
            const before = { hands: s.hands.slice(), trick: JSON.stringify(s.trick), idx: s.idx };
            await active.close();
            active.state = new State();
            await active.connect(await join(active.token, tableID));
            s = active.state;
            assert.equal(s.status, 'START');
            assert.equal(s.idx, before.idx);
            assert.deepEqual(s.hands, before.hands);
            assert.equal(JSON.stringify(s.trick), before.trick);
            assert.equal(s.currentIDX, before.idx);
            assert.equal(s.targetScore, 110);
            reconnects++;
            console.log('Mid-trick reconnect preserved hand, active seat, score target and public trick');
        }
        const card = s.hands.find(value => Calc.canPlayGroup([value], s.hands, s.leadGroup, s.trumpSuit));
        assert(card, 'Expected a legal single-card action');
        const before = active.events.length;
        active.game('CS_PLAY_CARD', { cards: [card] });
        const decisive = () => active.events.slice(before).find(e =>
            ['SC_PLAY_CARD', 'SC_PLAY_ERROR', 'SC_ROUND_SUMMARY'].includes(e.route));
        await active.runUntil(decisive, 'server confirms play');
        const event = decisive();
        if (event.route === 'SC_PLAY_ERROR') throw new Error(event.data.msg);
        await observer.runUntil(() => observer.state.summary || observer.state.currentIDX === active.state.currentIDX, 'observer catches up');
        actions++;
    }
    assert.equal(reconnects, 1);
    await Promise.all(seats.map(seat => seat.route('SC_ROUND_SUMMARY')));
    assert.equal(observer.state.summary.players.length, 3);
    assert.equal(observer.state.summary.buriedCards.length, 8);
    assert(observer.state.trickNum > 0);
    console.log('Real SDH settlement verified: ' + actions + ' actions, ' + observer.state.trickNum + ' tricks');
    await Promise.all(seats.map(seat => {
        seat.game('CS_PLAYER_LEAVE', {});
        return seat.close();
    }));
}
run().catch(error => { console.error(error.message); process.exitCode = 1; })
    .finally(() => sockets.forEach(socket => socket.terminate()));
