const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const utilsSource = fs.readFileSync('assets/Main/Script/utils.js', 'utf8');
const testConnectSource = utilsSource.slice(utilsSource.indexOf('var testConnect ='), utilsSource.indexOf('/**格式化时间戳', utilsSource.indexOf('var testConnect =')));
const xhr = { open() {}, send() {}, abort() { this.onabort(); } };
const timers = new Map();
let timerID = 0;
const clock = { setTimeout(fn) { timers.set(++timerID, fn); return timerID; }, clearTimeout(id) { timers.delete(id); } };
const cc = { loader: { getXMLHttpRequest: () => xhr }, game: { on() {} } };
const requestScope = { cc, ...clock };
vm.runInNewContext(testConnectSource, requestScope);
const primary = 'https://pku.hbrtyu.com/hlconfig/release_first.json';
const fallback = 'https://qty.krtqyh.com/hlconfig/release_first.json';
const data = { servers: ['https://api.example/'], update: ['https://update.example/'] };
const xhrResults = [];
requestScope.testConnect(primary, err => xhrResults.push(err));
xhr.readyState = 2;
xhr.status = 200;
xhr.onreadystatechange();
assert.deepEqual(xhrResults, []);
Object.assign(xhr, { readyState: 4, responseText: JSON.stringify(data) });
xhr.onreadystatechange();
xhr.onerror();
assert.deepEqual(xhrResults, [null]);
requestScope.testConnect(undefined, err => xhrResults.push(err));
assert.equal(xhrResults.at(-1), 'invalid_url');
requestScope.testConnect(primary, err => xhrResults.push(err));
timers.values().next().value();
assert.equal(xhrResults.filter(err => err === 'timeout').length, 1);

const source = fs.readFileSync('assets/Main/Script/SelectLink.js', 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replace('export class SelectLink', 'this.SelectLink = class SelectLink');
const requests = [];
const saved = {};
let ready = 0, failures = 0;
const scope = {
    cc, ...clock, Http: {}, Connector: {},
    GameConfig: { DefaultUrl: primary, StorageKey: { ServerUrlObj: 'config', LinkJson: 'source' },
        LogsEvents: {}, LogsActions: {} },
    utils: { getValue: () => ({}), saveValue: (key, value) => { saved[key] = value; },
        testConnect(url, callback) { requests.push({ url, callback }); } },
    GameUtils: { getTimeStamp: Date.now, LogsClient() {} },
    Cache: { showTipsMsg() { failures++; } }
};
vm.runInNewContext(source, scope);
new scope.SelectLink(() => { ready++; });
assert.equal(requests[0].url, primary);
requests[0].callback('timeout');
assert.equal(requests[1].url, fallback);
requests[1].callback(null, { ...data, servers: [null, 'https://api.example'] });
assert.equal(requests[2].url, 'https://api.example/CONFIG');
requests[2].callback(null);
assert.equal(saved.source, fallback);
assert.equal(ready, 1);
assert.equal(failures, 0);
requests.length = 0;
new scope.SelectLink();
requests[0].callback(null, data);
requests[1].callback('timeout'); // Primary config loads but its API probe fails.
assert.equal(requests[2].url, fallback);
requests[2].callback('timeout');
assert.equal(failures, 1);
assert.equal(requests.length, 3, 'must not request a missing address or repeat indefinitely');
console.log('SelectLink tests passed: XHR completion, single callback, fallback, and terminal error');
