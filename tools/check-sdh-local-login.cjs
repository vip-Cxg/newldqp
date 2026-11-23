const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const http = require('node:http');

const browser = { console, navigator: { appName: 'Netscape', userAgent: '' }, module: { exports: {} } };
browser.window = browser;
browser.exports = browser.module.exports;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/Main/Script/jsencrypt.js'), 'utf8'), browser);
const RSA = browser.exports.JSEncrypt;
const localHost = '192.168.1.186';
function post(route, value, encryptedToken) {
    const body = JSON.stringify(value);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
    if (encryptedToken) headers['xxx-token'] = encryptedToken;
    return new Promise((resolve, reject) => {
        const req = http.request({ host: localHost, port: 8000, path: '/' + route, method: 'POST',
            headers }, res => {
            let text = '';
            res.setEncoding('utf8');
            res.on('data', data => { text += data; });
            res.on('end', () => {
                try { resolve(JSON.parse(text)); } catch (_) { reject(new Error('Local API returned HTTP ' + res.statusCode)); }
            });
        });
        req.on('error', reject);
        req.setTimeout(7000, () => req.destroy(new Error('Local API timeout')));
        req.end(body);
    });
}
async function localAuth() {
    const { key } = await post('global/key', {});
    if (typeof key !== 'string') throw new Error('Local API did not return an RSA key');
    const server = new RSA();
    server.setPublicKey(key);
    return async function login(name) {
        const local = new RSA();
        const result = await post('game/test/login', { deviceID: server.encrypt(name), publicKey: local.getPublicKey() });
        const token = result.success && result.token && local.decrypt(result.token);
        if (!token) throw new Error(name + ': ' + (result.message || result.msg || 'login failed'));
        return () => server.encrypt(token);
    };
}
module.exports = { post, localAuth, localHost };
if (require.main === module) (async () => {
    const login = await localAuth();
    for (const name of ['sdh-local-01', 'sdh-local-02', 'sdh-local-03']) {
        const token = await login(name);
        const lobby = await post('game/info', {}, token());
        if (!lobby.success) throw new Error(name + ': logged in, but lobby API rejected session (' + (lobby.message || 'unknown error') + ')');
        console.log(name + ': login and authenticated lobby OK' +
            (process.argv.includes('--status') && lobby.connectInfo ? ' (has a resumable table)' : ''));
    }
})().catch(err => { console.error(err.message); process.exitCode = 1; });
