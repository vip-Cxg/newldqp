var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
const BASE_URL = "http://pku.qzhagy.com/newupdate/";
let manifest = {
    packageUrl: '',
    remoteManifestUrl: '',
    remoteVersionUrl: '',
    version: '1.0.0',
    assets: {},
    searchPaths: []
};

let dest = './build/autoupdate/';
let src = './build/jsb-link/';
// Parse arguments
let i = 2;
while (i < process.argv.length) {
    let arg = process.argv[i];
    switch (arg) {
        case '-a':
            // let area = process.argv[i+1];
            i += 2;
            break;
        case '-v':
            
            manifest.packageUrl = BASE_URL;// + area + "/";
            manifest.remoteManifestUrl = manifest.packageUrl + 'project.manifest';
            manifest.remoteVersionUrl = manifest.packageUrl + 'version.manifest';
            manifest.version = process.argv[i + 1];
            i += 2;
            break;
        default:
            i++;
            break;
    }
}


function readDir (dir, obj) {
    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
    for (var i = 0; i < subpaths.length; ++i) {
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




var stat = fs.stat;

var copy = function (src, dst) {
    //读取目录
    fs.readdir(src, function (err, paths) {
        console.log(paths)
        if (err) {
            throw err;
        }
        paths.forEach(function (path) {
            var _src = src + '/' + path;
            var _dst = dst + '/' + path;
            var readable;
            var writable;
            stat(_src, function (err, st) {
                if (err) {
                    throw err;
                }

                if (st.isFile()) {
                    readable = fs.createReadStream(_src);//创建读取流
                    writable = fs.createWriteStream(_dst);//创建写入流
                    readable.pipe(writable);
                } else if (st.isDirectory()) {
                    exists(_src, _dst, copy);
                }
            });
        });
    });
}

var exists = function (src, dst, callback) {
    //测试某个路径下文件是否存在
    fs.exists(dst, function (exists) {
        if (exists) {//不存在
            callback(src, dst);
        } else {//存在
            fs.mkdir(dst, function () {//创建目录
                callback(src, dst)
            })
        }
    })
}








var mkdirSync = function (path) {
    try {
        fs.mkdirSync(path);
    } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
    }
}

// Iterate assets and src folder
readDir(path.join(src, 'src'), manifest.assets);
readDir(path.join(src, 'assets'), manifest.assets);

var destManifest = path.join(dest, 'project.manifest');
var destVersion = path.join(dest, 'version.manifest');

mkdirSync(dest);

fs.writeFile(destManifest, JSON.stringify(manifest), (err) => {
  if (err) throw err;
  console.log('Manifest successfully generated');
});

delete manifest.assets;
delete manifest.searchPaths;
fs.writeFile(destVersion, JSON.stringify(manifest), (err) => {
  if (err) throw err;
  console.log('Version successfully generated');
});


exists(src + "src", dest + "src", copy);
exists(src + "assets", dest + "assets", copy);
