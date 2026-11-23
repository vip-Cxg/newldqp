// Run while Creator's preview server and the local SDH API are listening.
const path = require('node:path');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { createRequire } = require('node:module');
const base = path.resolve(process.env.SDH_SERVER_DIR || 'D:/work/ldqp');
const Socket = createRequire(path.join(base, 'package.json'))('ws');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const getPages = port => new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: '/json/list' }, res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => { try { resolve(JSON.parse(body)); } catch (error) { reject(error); } });
    }).on('error', reject);
});

async function retry(check, label, time = 22000) {
    const end = Date.now() + time;
    while (Date.now() < end) {
        const result = await check();
        if (result) return result;
        await sleep(250);
    }
    throw new Error('Timed out: ' + label);
}

async function run() {
    const temp = await fs.realpath(os.tmpdir());
    const profile = await fs.realpath(await fs.mkdtemp(path.join(temp, 'sdh-chrome-')));
    const chrome = spawn(process.env.SDH_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        ['--headless=new', '--remote-debugging-port=0', '--no-first-run', '--disable-background-networking',
            '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
            '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
            '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
    let ws;
    let spawnError;
    chrome.on('error', error => { spawnError = error; });
    try {
        const port = await retry(async () => {
            if (spawnError) throw spawnError;
            if (chrome.exitCode != null) throw new Error('Chrome exited: ' + chrome.exitCode);
            try { return (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split(/\r?\n/)[0]; }
            catch (error) { if (error.code !== 'ENOENT') throw error; }
        }, 'Chrome debugging port');
        const pages = await retry(async () => {
            try { return (await getPages(port)).find(page => page.type === 'page'); }
            catch (_) { return null; }
        }, 'Chrome page target');
        ws = new Socket(pages.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
        let id = 0;
        const pending = new Map();
        const errors = [];
        const network = [];
        let testLoginPosts = 0;
        ws.on('message', raw => {
            const msg = JSON.parse(raw);
            if (msg.id && pending.has(msg.id)) {
                const finish = pending.get(msg.id);
                pending.delete(msg.id);
                finish(msg);
            } else if (msg.method === 'Runtime.exceptionThrown') {
                const error = msg.params.exceptionDetails;
                errors.push(error.exception && error.exception.description || error.text);
            } else if (msg.method === 'Network.responseReceived') {
                const { url, status } = msg.params.response;
                if (url.startsWith('http://127.0.0.1:8000/')) network.push(status + ' ' + new URL(url).pathname);
            } else if (msg.method === 'Network.requestWillBeSent') {
                const { url, method } = msg.params.request;
                if (method === 'POST' && url === 'http://127.0.0.1:8000/game/test/login') testLoginPosts++;
            }
        });
        function call(method, params = {}, sessionId) {
            const requestId = ++id;
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => { pending.delete(requestId); reject(new Error('CDP timeout: ' + method)); }, 7000);
                pending.set(requestId, msg => { clearTimeout(timer); if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result); });
                ws.send(JSON.stringify({ id: requestId, method, params, sessionId }));
            });
        }
        async function read(expression, sessionId) {
            const result = await call('Runtime.evaluate', { expression, returnByValue: true }, sessionId);
            return !result.exceptionDetails && result.result.value;
        }
        async function clickCanvasNode(nodeExpression) {
            const clicked = await read(`(() => {
                const node=${nodeExpression};
                if (!node || !node.activeInHierarchy) return false;
                const event={currentTarget:node,stopPropagation(){}};
                node.emit(cc.Node.EventType.TOUCH_START,event);
                const button=node.getComponent(cc.Button);
                if (button && !button._pressed) return false;
                node.emit(cc.Node.EventType.TOUCH_END,event);
                return true;
            })()`);
            assert(clicked, 'Expected an active and interactive Cocos node');
        }
        await call('Runtime.enable');
        await call('Page.enable');
        await call('Network.enable');
        const origin = process.env.SDH_PREVIEW_URL || 'http://127.0.0.1:7456/';
        try {
            if (process.argv.includes('--recompile')) {
                // Creator 2.4 appends "update-db" to location.href verbatim.
                // The toolbar cannot recompile from a URL with a query string.
                await call('Page.navigate', { url: new URL('/', origin).href });
                await retry(() => read(`!!document.getElementById('btn-recompile') &&
                    typeof cc !== 'undefined' && !!cc.find('Canvas') && !!cc.find('Canvas').getComponent('SceneLogin')`), 'Creator recompile toolbar');
                const previousPage = await read('performance.timeOrigin');
                await read(`document.getElementById('btn-recompile').click(); true`);
                await retry(() => read(`performance.timeOrigin !== ${previousPage} && typeof cc !== 'undefined' && !!cc.find('Canvas') &&
                    !!cc.find('Canvas').getComponent('SceneLogin') &&
                    cc.find('Canvas').getComponent('SceneLogin').testContent.children.some(n=>
                        n._data==='sdh-local-01' && n.getComponent(cc.Button).clickEvents.length===0)`),
                    'recompiled local test login', 35000);
            }
            const press = nodePath => read(`(() => {
                const node=cc.find(${JSON.stringify(nodePath)});
                if (!node) return false;
                node.emit(cc.Node.EventType.TOUCH_END,{currentTarget:node});
                return true;
            })()`);
            await call('Page.navigate', { url: new URL('?sdh=1', origin).href });
            await retry(() => read(`typeof cc !== 'undefined' && !!cc.find('Canvas/SDH') &&
                cc.find('Canvas/SDH').getChildByName('操作').children.some(n=>n.name==='准备')`), 'direct SDH offline scene', 35000);
            if (!await press('Canvas/SDH/操作/准备')) throw new Error('Ready control is missing');
            await retry(() => read(`cc.find('Canvas/SDH/手牌').children.length === 50 &&
                !!cc.find('Canvas/SDH/操作/叫庄滑杆')`), '25 rendered cards and bid controls');
            const controlY = await read("cc.find('Canvas/SDH/操作').y");
            const controlsCentered = `(() => {
                const bar=cc.find('Canvas/SDH/操作');
                const left=Math.min(...bar.children.map(n=>n.x-n.width/2));
                const right=Math.max(...bar.children.map(n=>n.x+n.width/2));
                return bar.x===0 && bar.y===${controlY} && Math.abs(left+right)<0.5 &&
                    bar.children.every(n=>n.height>=96 && (n.name==='叫庄滑杆' ||
                        n.children[0].getComponent(cc.Label).horizontalAlign===cc.Label.HorizontalAlign.CENTER));
            })()`;
            assert.equal(await read(controlsCentered), true, 'the bid bar is centered');
            if (!await press('Canvas/SDH/操作/叫庄 90')) throw new Error('Bid action is missing');
            await retry(() => read(`(() => {
                const scene=cc.find('Canvas').getComponent('SceneTableSDH');
                return scene.bidResults[0].root.active && scene.bidResults[0].title.string==='请选择主花色' &&
                    scene.bidResults[0].root.x===0 && scene.bidResults[0].root.y<0 &&
                    scene.bidResults[1].title.string==='不叫' &&
                    [1,2].every(i=>{
                        const avatar=scene.seats[i].view.sprHead.node;
                        const y=scene.ui.convertToNodeSpaceAR(avatar.convertToWorldSpaceAR(cc.v2(0,0))).y;
                        return Math.abs(scene.bidResults[i].root.y-y)<0.5 && Math.abs(scene.trickRows[i].y-y)<0.5;
                    });
            })()`), 'bid results shown in each seat’s played-card area');
            assert.equal(await read(controlsCentered), true, 'choosing trump keeps the same centered bar');
            assert.equal(await read(`(() => {
                const buttons=cc.find('Canvas/SDH/操作').children;
                const shades=buttons.map(n=>n.getComponent(cc.Graphics).fillColor.toHEX());
                return buttons.length===4 && new Set(shades).size===4;
            })()`), true, 'trump buttons use four different colors');
            if (!await press('Canvas/SDH/操作/♠ 黑桃')) throw new Error('Suit action is missing');
            await retry(() => read(`cc.find('Canvas/SDH/手牌').children.length === 66`), '33 rendered cards after dealer takes bottom');
            assert.equal(await read(`cc.find('Canvas').getComponent('SceneTableSDH').bidResults[0].title.string`),
                '主牌：♠ 黑桃');
            assert.equal(await read(`(() => {
                const canvas=cc.find('Canvas');
                const scene=canvas.getComponent('SceneTableSDH');
                const rows=scene.handLayout.rows;
                return rows.length === 2 && rows[0].length === 16 && rows[1].length === 17 &&
                    scene.controls.y - 48 > rows[0].high &&
                    scene.trickRows[0].y - 54 > rows[0].high - scene.handLayout.lift;
            })()`), true, 'two safe rows, with buttons and played cards clear of the hand');
            assert.equal(await read(controlsCentered), true, 'bury controls stay centered and at the same height');
            assert.equal(await read(`(() => {
                const scene=cc.find('Canvas').getComponent('SceneTableSDH');
                const hits=scene.hand.children.filter(n=>n.name==='选牌').sort((a,b)=>a.handIndex-b.handIndex);
                const event={getID:()=>0,getLocation:()=>hits[18].convertToWorldSpaceAR(cc.v2(0,0))};
                hits[1].emit(cc.Node.EventType.TOUCH_START,event);
                hits[1].emit(cc.Node.EventType.TOUCH_MOVE,event);
                hits[1].emit(cc.Node.EventType.TOUCH_END,event);
                return Array.from(scene.selected).join() === '1,18' && scene.handNodes[18].y === scene.handRestY[18]+scene.handLayout.lift;
            })()`), true, 'vertical drag switches rows without selecting across the row break');
            assert(await press('Canvas/SDH/操作/清空选择'));
            await read(`(() => {
                const hand=cc.find('Canvas/SDH/手牌');
                const hits=hand.children.filter(n=>n.name==='选牌').sort((a,b)=>a.handIndex-b.handIndex);
                const event={getID:()=>0,getLocation:()=>hits[12].convertToWorldSpaceAR(cc.v2(0,0))};
                hits[0].emit(cc.Node.EventType.TOUCH_START,event);
                hits[0].emit(cc.Node.EventType.TOUCH_MOVE,event);
                hits[0].emit(cc.Node.EventType.TOUCH_END,event);
                return true;
            })()`);
            if (!await read(`(() => {
                const button=cc.find('Canvas/SDH/操作').children.find(n=>n.name==='确认扣底 8/8');
                if (!button) return false;
                button.emit(cc.Node.EventType.TOUCH_END,{currentTarget:button,stopPropagation(){}});
                return true;
            })()`)) throw new Error('Bury action is missing');
            await retry(() => read(`cc.find('Canvas/SDH/手牌').children.length === 50 &&
                !!cc.find('Canvas/SDH/操作/出牌')`), '25 rendered cards after burying');
            assert.equal(await read(`(() => {
                const scene=cc.find('Canvas').getComponent('SceneTableSDH');
                return !scene.seats[0].view.cardContainer.active &&
                    scene.seats.slice(1).every(seat=>seat.view.cardContainer.active &&
                        Math.abs(seat.view.cardContainer.x)===85 && seat.view.cardContainer.y===18) &&
                    scene.controls.children.map(n=>n.x).join() === '-222,0,222';
            })()`), true, 'hide own count, center opponents’ counts and the action bar');
            assert.equal(await read(controlsCentered), true, 'play controls stay centered at the same height');
            assert.equal(await read(`!!cc.find('Canvas/SDH/操作/投降')`), false);
            assert.equal(await read(`!!cc.find('Canvas/SDH/返回大厅')`), false);
            assert.equal(await read(`cc.find('Canvas/layerTop/btnEnd').active`), false);
            assert.equal(await read(`cc.find('Canvas').getComponent('SceneTableSDH').menuRows
                .map(n=>n.y).join() === '150,70,-10,-90'`), true, 'visible menu rows have no empty slot');
            await clickCanvasNode("cc.find('Canvas/layerTop/btnOpen')");
            await retry(() => read(`cc.find('Canvas/layerTop/btnClose').active &&
                cc.find('Canvas/layerTop').x < cc.winSize.width / 2`), 'original GameMenu slides into view');
            await clickCanvasNode("cc.find('Canvas/layerTop/autoBtn')");
            await retry(() => read(`cc.find('Canvas/btnMask').active && !cc.find('Canvas/layerTop/autoBtn').active`),
                'Game07-style autoplay mask');
            await clickCanvasNode("cc.find('Canvas/btnMask/cancelAuto')");
            await retry(() => read(`!cc.find('Canvas/btnMask').active && cc.find('Canvas/layerTop/autoBtn').active &&
                cc.find('Canvas/layerTop/btnOpen').active`), 'cancel autoplay from the mask');
            await clickCanvasNode("cc.find('Canvas/layerTop/btnOpen')");
            await retry(() => read(`cc.find('Canvas/layerTop/btnClose').active`), 'reopen original menu');
            await clickCanvasNode("cc.find('Canvas/layerTop/exitBtn')");
            await retry(() => read(`cc.find('Canvas').children.some(n=>!!n.getComponent('ModuleWinConfirm'))`),
                'standard Cocos surrender confirmation prefab');
            await clickCanvasNode("cc.find('Canvas').children.find(n=>n.getComponent('ModuleWinConfirm')).getComponent('ModuleWinConfirm').btnConfirm");
            await retry(() => read(`!!cc.find('Canvas/结算/继续准备') &&
                cc.find('Canvas/结算/nodeSummry/infoContent/loseBg').active`), 'Game07 loss background for banker surrender');
            assert.equal(await read(`(() => {
                const summary=cc.find('Canvas/结算');
                const bottom=summary.getChildByName('底牌');
                const info=summary.getChildByName('本局信息');
                const hands=summary.children.filter(n=>n.name==='结算手牌');
                return !cc.find('Canvas/SDH').active && bottom.x<0 && info.x>0 &&
                    hands.length===3 && hands.every(row=>row.y<bottom.y && row.y<info.y) &&
                    hands.some(row=>row.children.length && row.children[0].scale>0.85);
            })()`), true, 'summary corners separated from larger player cards');
            console.log('Creator browser: reused controls and autoplay, drag-to-bury, surrender dialog and PDK summary skin passed');

            if (process.argv.includes('--offline-only')) return;
            await call('Page.navigate', { url: new URL('?seat=1', origin).href });
            await retry(() => read(`typeof cc !== 'undefined' && !!cc.find('Canvas') &&
                !!cc.find('Canvas').getComponent('SceneLogin') &&
                cc.find('Canvas').getComponent('SceneLogin').testContent.children.filter(n=>n._data).length === 3`), 'Login scene with three test buttons', 35000);
            const buttonPath = "cc.find('Canvas').getComponent('SceneLogin').testContent.children.find(n=>n._data==='sdh-local-01')";
            const beforeLogin = testLoginPosts;
            await clickCanvasNode(buttonPath);
            await retry(() => read(`typeof cc !== 'undefined' && cc.director.getScene() &&
                (cc.director.getScene().name==='Lobby' || !!cc.find('Canvas').getComponent('SceneHall'))`), 'Lobby after test login');
            console.log('Creator browser: Update → local test login → Lobby passed');

            await retry(() => read(`(() => {
                const hall=cc.find('Canvas').getComponent('SceneHall');
                if (!hall || !hall.lblClubID.string.includes('新华包牌本地测试')) return false;
                if (cc.find('Canvas/SDHPlaytestEntry')) throw new Error('Playtest shortcut must not appear in the lobby');
                hall.showClub();
                return true;
            })()`), 'standard lobby club list entry');
            assert.equal(testLoginPosts - beforeLogin, 1, 'A full Cocos button press must send exactly one test login');
            await retry(() => read(`(() => {
                function findClub(n) {
                    const item=n.getComponent('ClubListItem');
                    if (item && item.lblClubName.string==='新华包牌本地测试' &&
                        item.lblClubID.string.includes('669645')) return n;
                    return n.children.map(findClub).find(Boolean);
                }
                const club=findClub(cc.director.getScene());
                if (!club) return false;
                club.emit(cc.Node.EventType.TOUCH_END,{currentTarget:club,stopPropagation(){}});
                return true;
            })()`), 'choose the test club by name and ID');
            await retry(() => read(`(() => {
                function findCreate(n) {
                    const item=n.getComponent('ModuleTableItem');
                    if (item && item.data && item.data.type==='create' && item.data.gameType==='SDH') return n;
                    return n.children.map(findCreate).find(Boolean);
                }
                const tile=findCreate(cc.director.getScene());
                if (!tile) return false;
                tile.emit(cc.Node.EventType.TOUCH_END,{currentTarget:tile,stopPropagation(){}});
                return true;
            })()`), 'normal SDH create-table tile');
            await retry(() => read(`(() => {
                function findRoom(n) {
                    const item=n.getComponent('TableRoomBtn');
                    if (item && item.roomData && item.roomData.name==='新华包牌本地桌') return n;
                    return n.children.map(findRoom).find(Boolean);
                }
                const room=findRoom(cc.director.getScene());
                if (!room) return false;
                room.emit(cc.Node.EventType.TOUCH_END,{currentTarget:room,stopPropagation(){}});
                return true;
            })()`), 'normal SDH room selection creates a table');
            await retry(() => read(`!!cc.find('Canvas/SDH/操作/准备') &&
                cc.find('Canvas').getComponent('SceneTableSDH').state.players.some(p=>p && p.prop && p.prop.name==='SDH测试1')`), 'live Cocos SDH scene receives seat snapshot');
            console.log('Creator browser: Lobby → club 669645 → SDH create table → live seat passed');
            if (process.argv.includes('--three-seats')) {
                await playBrowserRound({ call, read, origin });
            } else {
                await clickCanvasNode("cc.find('Canvas/layerTop/btnOpen')");
                await retry(() => read(`cc.find('Canvas/layerTop/btnClose').active`), 'open menu to leave waiting table');
                await clickCanvasNode("cc.find('Canvas/layerTop/exitBtn')");
                await retry(() => read(`cc.director.getScene().name==='Lobby'`), 'returned to lobby from waiting table');
            }
        } catch (error) {
            const diagnostics = await read(`typeof cc === 'undefined' ? 'no cc engine' : (cc.director.getScene() && cc.director.getScene().name)`);
            throw new Error(error.message + ' (scene=' + diagnostics + ')\n' +
                network.join(', ') + '\n' + errors.slice(0, 4).join('\n'));
        }
    } finally {
        if (ws) ws.terminate();
        chrome.kill();
        // Chrome owns this isolated temporary profile until all its helpers exit.
        if (path.dirname(profile) === temp && path.basename(profile).startsWith('sdh-chrome-')) {
            await fs.rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 300 }).catch(() => {});
        }
    }
}

async function playBrowserRound({ call, read, origin }) {
    const controller = "cc.find('Canvas').getComponent('SceneTableSDH')";
    const focus = sessionId => call('Page.bringToFront', {}, sessionId);
    let table;
    const setup = async (seat, sessionId, reconnect = false) => {
        await focus(sessionId);
        await call('Page.navigate', { url: new URL('?seat=' + seat, origin).href }, sessionId);
        await retry(() => read(`(() => {
            const login=cc.find('Canvas').getComponent('SceneLogin');
            const button=login && login.testContent.children.find(n=>n._data==='sdh-local-0${seat}');
            if (!button) return false;
            button.emit(cc.Node.EventType.TOUCH_END,{currentTarget:button,stopPropagation(){}});
            return true;
        })()`, sessionId), 'login seat ' + seat, 35000);
        if (!reconnect) {
            await retry(() => read(`(() => {
                const hall=cc.find('Canvas').getComponent('SceneHall');
                if (!hall || !hall.lblClubID.string.includes('新华包牌本地测试')) return false;
                hall.showDLM();
                return true;
            })()`, sessionId), 'lobby seat ' + seat);
            await retry(() => read(`(() => {
                function find(n) {
                    const item=n.getComponent('ModuleTableItem');
                    if (n.activeInHierarchy && item && item.data &&
                        item.data.gameType==='SDH' && String(item.data.tableID)===${JSON.stringify(String(table))}) return n;
                    return n.children.map(find).find(Boolean);
                }
                const tile=find(cc.director.getScene());
                if (!tile) return false;
                tile.emit(cc.Node.EventType.TOUCH_END,{currentTarget:tile,stopPropagation(){}});
                return true;
            })()`, sessionId), 'click the existing table tile for seat ' + seat);
        }
        await retry(() => read(`(() => {
            const c=${controller};
            return c && c.state.idx>=0 && c.state.players[c.state.idx].prop.name==='SDH测试${seat}';
        })()`, sessionId), 'live table seat ' + seat);
    };
    const state = async sessionId => {
        await focus(sessionId);
        return read(`(() => {
        const c=${controller};
        return { idx:c.state.idx, current:c.state.currentIDX, status:c.state.status, table:c.state.tableID,
            phase:c.state.callPhase, count:c.state.hands.length, cards:c.state.hands, trick:c.state.trick,
            trickNum:c.state.trickNum, target:c.state.targetScore, players:c.state.players.filter(p=>p&&p.prop).length,
            pending:!!c.pending, selected:c.selected.size, summary:c.state.summary && c.state.summary.buriedCards.length };
        })()`, sessionId);
    };
    const click = async (name, sessionId, panel = '操作') => {
        await focus(sessionId);
        return read(`(() => {
        const panel=cc.find(${JSON.stringify('Canvas/SDH' + (panel ? '/' + panel : ''))});
        const node=panel && panel.children.find(x=>x.name===${JSON.stringify(name)});
        if(!node) return false;
        node.emit(cc.Node.EventType.TOUCH_END,{currentTarget:node,stopPropagation(){}});
        return true;
        })()`, sessionId);
    };
    const tabs = [undefined];
    table = (await state()).table;
    for (let seat = 2; seat <= 3; seat++) {
        const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
        tabs.push(sessionId);
        await setup(seat, sessionId);
        assert.equal((await state(sessionId)).table, table, 'seat ' + seat + ' joined a different table');
    }
    const occupied = [];
    for (const tab of tabs) {
        occupied.push(await retry(async () => {
            const s = await state(tab);
            return s && s.players === 3 && s;
        }, 'three visible seats on tab ' + (occupied.length + 1)));
    }
    assert.equal(new Set(occupied.map(s => s.table)).size, 1);
    const tabFor = idx => tabs[occupied.findIndex(s => s.idx === idx)];
    for (const tab of tabs) assert(await click('准备', tab));
    const first = await retry(async () => {
        const s = await state();
        return s && s.status === 'CALL' && s.phase === 'bid' && s.current >= 0 && s;
    }, 'live bid stage');
    const banker = first.current;
    for (let i = 0; i < 3; i++) {
        const s = await state();
        if (s.phase === 'suit') break;
        const active = s.current;
        await retry(() => click(active === banker ? '叫庄 90' : '不叫', tabFor(active)), 'bid control');
        await retry(async () => {
            const next = await state();
            return next && next.status === 'CALL' && (next.phase === 'suit' || next.current !== active && next.current >= 0);
        }, 'next bid');
    }
    const bank = tabFor(banker);
    await retry(() => click('♥ 选主', bank), 'live trump control');
    await retry(async () => {
        const s = await state(bank);
        return s && s.status === 'BURY' && s.count === 33 && s.target === 115;
    }, '33 cards and the server target');
    for (const tab of tabs) {
        await retry(async () => {
            const s = await state(tab);
            return s && s.status === 'BURY' && s.target === 115;
        }, 'all players have the synchronized target');
    }
    await focus(bank);
    assert(await read(`(() => {
        const hits=cc.find('Canvas/SDH/手牌').children.filter(n=>n.name==='选牌').sort((a,b)=>a.handIndex-b.handIndex);
        if (hits.length !== 33) return false;
        hits.slice(0,8).forEach(n=>n.emit(cc.Node.EventType.TOUCH_END,{currentTarget:n}));
        return true;
    })()`, bank));
    assert(await click('确认扣底 8/8', bank));
    await retry(async () => { const s = await state(bank); return s && s.status === 'START' && s.count === 25; }, '25 cards after live bury');

    let reconnects = 0;
    let plays = 0;
    while (plays < 75) {
        const s = await retry(async () => {
            const data = await state();
            return data && (data.status === 'SUMMARY' || data.current >= 0) && data;
        }, 'current act or settlement');
        if (s.status === 'SUMMARY') break;
        const active = s.current;
        const tab = tabFor(active);
        if (!reconnects && s.trick.length === 1) {
            const before = await retry(async () => {
                const data = await state(tab);
                return data && data.current === active && data.trick.length === 1 && data;
            }, 'rejoining seat has drawn the lead card');
            const seat = tabs.indexOf(tab) + 1;
            await call('Page.navigate', { url: 'about:blank' }, tab);
            await setup(seat, tab, true);
            const after = await state(tab);
            assert.equal(after.table, before.table);
            assert.equal(after.current, before.current);
            assert.equal(after.target, before.target);
            assert.deepEqual(after.cards, before.cards);
            assert.deepEqual(after.trick, before.trick);
            reconnects++;
            console.log('Creator browser: reloaded mid-trick and recovered live table and private hand');
        }
        await retry(() => click('提示', tab), 'live play gets enabled');
        const outgoing = await retry(async () => {
            const current = await state(tab);
            return current && current.selected === 1 && current;
        }, 'server hint selects one card without submitting');
        assert(await click('出牌', tab));
        await retry(async () => {
            const next = await state(tab);
            return next && (next.status === 'SUMMARY' || next.count === outgoing.count - 1);
        }, 'active seat applies server play #' + (plays + 1));
        await retry(async () => {
            const next = await state();
            return next && (next.status === 'SUMMARY' || next.trickNum !== s.trickNum || next.current >= 0 && next.current !== active);
        }, 'observer applies server play #' + (plays + 1));
        plays++;
        if (plays % 15 === 0) console.log('Creator browser: confirmed ' + plays + ' live card actions');
    }
    assert.equal(reconnects, 1);
    for (const tab of tabs) {
        await retry(async () => {
            await focus(tab);
            return read(`!!cc.find('Canvas/结算/继续准备') &&
                cc.find('Canvas/结算/底牌').children.length===8`, tab);
        }, 'settlement shows all 8 bottom cards on seat ' + (tabs.indexOf(tab) + 1));
        assert.equal((await state(tab)).summary, 8);
    }
    console.log('Creator browser: three live seats completed ' + plays + ' actions and saw settlement');
    for (const tab of tabs) {
        await focus(tab);
        await read(`cc.find('Canvas').getComponent('SceneTableSDH').onExitTable(); true`, tab);
    }
}
run().catch(error => { console.error(error.message); process.exitCode = 1; });
