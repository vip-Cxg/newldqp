const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '../assets/GamePoker');
const src = path.join(base, 'Game07', 'Script');
const dest = path.join(base, 'GameSDH');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function compress(uuid, prefix) {
    const hex = uuid.replace(/-/g, '');
    let output = hex.slice(0, prefix);
    for (let i = prefix; i < hex.length; i += 3) {
        const n = parseInt(hex.slice(i, i + 3), 16);
        output += alphabet[n >> 6] + alphabet[n & 63];
    }
    return output;
}
const mapping = new Map();
const verify = process.argv.includes('--check');
let sceneBound = false;
for (const file of fs.readdirSync(src).filter(f => f.endsWith('07.js.meta'))) {
    const before = JSON.parse(fs.readFileSync(path.join(src, file), 'utf8')).uuid;
    const after = JSON.parse(fs.readFileSync(path.join(dest, 'Script', file.replace('07.js', 'SDH.js')), 'utf8')).uuid;
    for (const prefix of [2, 5]) mapping.set(compress(before, prefix), compress(after, prefix));
}
for (const folder of ['Scene', 'Prefab']) {
    for (const file of fs.readdirSync(path.join(dest, folder)).filter(f => /\.(fire|prefab)$/.test(f))) {
        const filename = path.join(dest, folder, file);
        const before = fs.readFileSync(filename, 'utf8');
        const objects = JSON.parse(before);
        if (file === 'GameSDH.fire') {
            const id = JSON.parse(fs.readFileSync(path.join(dest, 'Script/SceneTableSDH.js.meta'), 'utf8')).uuid;
            sceneBound = objects.some(entry => entry.__type__ === compress(id, 5) && entry.preCards && entry.preCards.__uuid__);
        }
        const after = before.replace(/"(__type__|_componentId)": "([^"]+)"/g, (original, key, id) =>
            mapping.has(id) ? '"' + key + '": "' + mapping.get(id) + '"' : original);
        if (before !== after) {
            if (verify) {
                console.error(file + ' still references a Game07 script');
                process.exitCode = 1;
            } else {
                fs.writeFileSync(filename, after);
                console.log(file);
            }
        }
    }
}
if (verify) {
    if (!sceneBound) throw new Error('GameSDH.fire has no bound SDH controller with the card prefab');
    if (!process.exitCode) console.log('SDH scene/prefab script bindings verified');
}
