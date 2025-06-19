let fs = require('fs');
let path = require('path');
let crypto = require('crypto');
const BASE_URL = "https://pku.qzhagy.com/update_media/";

let dest = './media/Audio';
let src = './media/Audio';
let GAME = process.argv[2];

let manifest = {
    packageUrl: BASE_URL,
    remoteUrl: BASE_URL + 'media' + GAME + '.json',
    version: process.argv[3],
    assets: {},
    searchPaths: []
};

function readDir (dir, obj) {
    let stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    let subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
    for (let i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        subpath = path.join(dir, subpaths[i]);
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            readDir(subpath, obj);
        }
        else if (stat.isFile()) {
            // Size in Bytes
            size = stat['size'];
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(src, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);
            obj[relative] = {
                'size' : size,
                'md5' : md5
            };
            if (compressed) {
                obj[relative].compressed = true;
            }
        }
    }
}

let mkdirSync = function (path) {
    try {
        fs.mkdirSync(path);
    } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
    }
};

// Iterate res and src folder
readDir(path.join(src, 'Game' + GAME), manifest.assets);

let destMedia = path.join(dest, 'media' + GAME + '.json');

mkdirSync(dest);

fs.writeFile(destMedia, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Manifest successfully generated');
});