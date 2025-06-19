let { GameConfig } = require('../../GameBase/GameConfig');
const { default: Http } = require('../../script/common/network/Http');
const JSEncrypt = require('./jsencrypt'); 

var loadNative = function (url, callback) {
    var dirpath = jsb.fileUtils.getWritablePath() + 'img/';
    var filepath = dirpath + CryptoJS.MD5(url).toString() + '.png';

    function loadEnd() {
        cc.loader.load(filepath, function (err, tex) {
            if (err) {
                cc.error(err);
            } else {
                var spriteFrame = new cc.SpriteFrame(tex);
                if (spriteFrame) {
                    spriteFrame.retain();
                    callback(spriteFrame);
                }
            }
        });

    }

    if (jsb.fileUtils.isFileExist(filepath)) {
        cc.log('Remote is find' + filepath);
        loadEnd();
        return;
    }

    var saveFile = function (data) {
        if (typeof data !== 'undefined') {
            if (!jsb.fileUtils.isDirectoryExist(dirpath)) {
                jsb.fileUtils.createDirectory(dirpath);
            }
            if (jsb.fileUtils.writeDataToFile(new Uint8Array(data), filepath)) {
                cc.log('Remote write file succeed.');
                loadEnd();
            } else {
                cc.log('Remote write file failed.');
            }
        } else {
            cc.log('Remote download file failed.');
        }
    };

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        cc.log("xhr.readyState  " + xhr.readyState);
        cc.log("xhr.status  " + xhr.status);
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                xhr.responseType = 'arraybuffer';
                saveFile(xhr.response);
            } else {
                saveFile(null);
            }
        }
    }.bind(this);
    xhr.open("GET", url, true);
    xhr.send();
};

Date.prototype.format = function (format) {
    let o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                    ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};
/**
 * 截屏
 * @param  {[function]} func 回调函数
 * @return
 */
var screenShoot = function (func, thumbHeight = 80) {
    if (!cc.sys.isNative) return;
    let node = new cc.Node();
    node.parent = cc.director.getScene();
    node.width = cc.view.getVisibleSize().width;
    node.x = cc.view.getVisibleSize().height;
    node.y = cc.view.getVisibleSize().width;
    node.height = cc.view.getVisibleSize().height;
    let camera = node.addComponent(cc.Camera);
    camera.cullingMask = 0xffffffff;
    let texture = new cc.RenderTexture();
    texture.initWithSize(node.width, node.height);
    camera.targetTexture = texture;
    camera.render(null);
    let data = texture.readPixels();
    let width = texture.width;
    let height = texture.height;
    // data = this.filpYImage(data, width, height)
    let fileName = "result_share.jpg";
    let fullPath = jsb.fileUtils.getWritablePath() + fileName;
    if (jsb.fileUtils.isFileExist(fullPath)) {
        jsb.fileUtils.removeFile(fullPath);
    }
    let success = jsb.saveImageData(data, width, height, fullPath);
    if (success) {
        if (func) {
            func(fullPath);
        }
        camera.destroy();
        texture.destroy();
    }
};

var SaveToLocal = function (ImgUrl, callBack) {

    let fileName = "textureName";
    let fileType = ".png";
    let filePath = null;
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if (xhr.response && cc.sys.isNative) {
                try {
                    let rootPath = jsb.fileUtils.getWritablePath();
                    filePath = rootPath + fileName + fileType;
                    let u8a = new Uint8Array(xhr.response);
                    jsb.fileUtils.writeDataToFile(u8a, filePath);
                    if (callBack)
                        callBack(filePath)
                } catch (error) {
                    if (callBack)
                        callBack("error")

                }
            }
        }

    },
        xhr.responseType = 'arraybuffer';
    xhr.open("GET", ImgUrl, true);
    xhr.send();
}

/**检查手机格式 */
var checkPhone = function (str) {

    if (str.length < 11) return false;

    let valid_rule = /^1(2|3|4|5|6|7|8|9)\d{9}$/;
    // let valid_rule = /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/;// 手机号码校验规则
    let phone = parseInt(str);
    // cc.log("num", phone);
    if (!valid_rule.test(phone)) {
        return false;
    }
    return true;
};
/**适配屏幕 */
var fitScreen = function () {
    var DesignWidth = 1136;
    var DesignHeight = 640;
    // if(cc.sys.OS_ANDROID == cc.sys.os || cc.sys.OS_IOS == cc.sys.os) {

    if ((cc.view.getFrameSize().width / cc.view.getFrameSize().height) >= ((2436 / 1125) - 0.05)) {
        this.isIphoneX = true;
        GameConfig.FitScreen = 44;

    } else {
        this.isIphoneX = false;
    }

    if ((cc.view.getFrameSize().width / cc.view.getFrameSize().height) >= (DesignWidth / DesignHeight)) {
        //宽度超出
        var width = cc.view.getFrameSize().width * (DesignHeight / cc.view.getFrameSize().height);
        cc.view.setDesignResolutionSize(width, DesignHeight, cc.ResolutionPolicy.FIXED_HEIGHT);
    } else {
        //高度超出
        var height = cc.view.getFrameSize().height * (DesignWidth / cc.view.getFrameSize().width);
        cc.view.setDesignResolutionSize(DesignWidth, height, cc.ResolutionPolicy.FIXED_WIDTH);
    }
    // }else{
    //     cc.view.setDesignResolutionSize(DesignWidth, DesignHeight, cc.ResolutionPolicy.EXACT_FIT);
    // }

    // if (this.isIphoneX) {
    // cc.find("Canvas/other/user1").getComponent(cc.Widget).left += this.node.width * (44/812);
    // cc.find("Canvas").getComponent(cc.Widget).left += cc.find("Canvas").width * (88/812);
    // var cvs = cc.find("Canvas").getComponent(cc.Canvas);
    // cvs.fitHeight = true;
    // cvs.fitWidth = true;
    // }
}
/**
 * 格式化点数,以万为单位
 * @param  {Number} gold    点数
 * @param  {Number} precision 精度
 */
var formatGold = function (gold, precision, limit) {
    return (gold / 100).toFixed(2);
    // let goldNum = Math.abs(parseInt(gold)),
    //     transMin = limit || 100000,
    //     transBase = gold >= 100000000 ? 100000000 : 10000,
    //     result = null;

    // if (goldNum < transMin) {
    //     return gold;
    // }

    // if (isNaN(precision)) {
    //     precision = 2;
    // }

    // goldNum /= transBase;

    // if (goldNum % 1 > Math.pow(0.1, precision)) {
    //     let num = goldNum * Math.pow(10, precision);
    //     result = (Number.isFinite(num) ? Math.round(num) : Math.floor(num)) / Math.pow(10, precision);
    // } else {
    //     result = parseInt(goldNum);
    // }

    // return result + (transBase === 10000 ? '万' : '亿');
};
/**转化成百分数 */
var toPercent = (point) => {
    var str = Number(point * 100).toFixed(1);
    str += "%";
    return str;
}
/**获取时间戳 ms */
var getTimeStamp = (dataStr = "") => {
    if (dataStr == "")
        return new Date().getTime() + GameConfig.ServerTimeDiff;

    return new Date(dataStr).getTime() + GameConfig.ServerTimeDiff || 0;
}
/**获取时间戳 yyyymmdd*/
var getFormatDate = (dataStr = "") => {
    let timeDate = dataStr == "" ? new Date() : new Date(dataStr);
    let year = timeDate.getFullYear();
    let month = (timeDate.getMonth() + 1) >= 10 ? (timeDate.getMonth() + 1) : '0' + (timeDate.getMonth() + 1);
    let day = timeDate.getDate() >= 10 ? timeDate.getDate() : '0' + timeDate.getDate();

    return '' + year + month + day;
}

/**
 * 计算下注筹码
 * @param  {Number} gold    下注金币
 * @param  {Array} chipOptions 筹码选择列表
 */
var getChips = function (gold, chipOptions) {
    let chips = [];
    while (gold > 0) {
        for (let i = chipOptions.length - 1; i >= 0; i--) {
            let count = Math.floor(gold / chipOptions[i].value);
            for (let j = count - 1; j >= 0; j--) {
                chips.push(chipOptions[i]);
            }
            gold -= count * chipOptions[i].value;

            if (gold > 0 && gold < chipOptions[0].value) {
                chips.push(chipOptions[i]);
                gold = 0;
            }

            if (gold <= 0) {
                break;
            }
        }
    }
    return chips;
};

var setScore = function (lbl, score) {
    let winColor = cc.color("#ffca3b");
    let failColor = cc.color("#5deeff");
    lbl.node.color = score > 0 ? winColor : failColor;
    lbl.string = score > 0 ? "+" + score : score;
};

var subName = function (str, n) {
    if (str == null || str.length <= 0)
        return "";
    let r = /[^\x00-\xff]/g;
    if (str.replace(r, "mm").length <= n) {
        return str;
    }
    let m = Math.floor(n / 2);
    for (let i = m; i < str.length; i++) {
        if (str.substr(0, i).replace(r, "mm").length >= n) {
            return str.substr(0, i) + "...";
        }
    }
    return str;
};

var generateUniqueID = function (len) {
    var rdmString = "";
    for (; rdmString.length < len; rdmString += Math.random().toString(36).substr(2));
    return rdmString.substr(0, len);
};

var getStringByteLength = function (val) {
    let len = 0;
    if (val) {
        for (var i = 0; i < val.length; i++) {
            if (val[i].match(/[^x00-xff]/ig) !== null) {
                len += 2;
            } else {
                len += 1;
            }
        }
    }
    return len;
};

/**获取指定长度字符串 */
var getStringByLength = function (str, num) {
    if (str) {
        let str_1 = str.replace(/[\u4e00-\u9fa5]/g, "aa");
        let len = str_1.replace(/[A-Z]/g, "aa").length;
        if (len > num * 2) {
            str = str.substr(0, num) + "...";
        }
    }
    return str;
};
/**添加预制体 */
var showNode = function (node, prefab) {
    if (node != null) {
        cc.log("实例化了")
        node.active = true;
    } else {
        cc.log("没实例化")
        node = cc.instantiate(prefab);
        node.parent = cc.find("Canvas");
    }
    return node;
};

/** 解析邀请码*/
var decodeInviter = function (str) {
    if (isNullOrEmpty(str)) return {};
    var ret = {},
        seg = str.replace(/^\?/, '').split('&'),
        len = seg.length, i = 0, s;
    for (; i < len; i++) {
        if (!seg[i]) { continue; }
        s = seg[i].split('=');
        ret[s[0]] = s[1];
    }
    return ret;
}

/**深拷贝数组对象 */
var deepcopyArr = function (arr) {
    let res = [];
    arr.forEach((element, i) => {
        let str = JSON.stringify(element);
        res[i] = JSON.parse(str);
    });
    return res;
}

let formatFloat = function (src, pos) {
    return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
};
/**获取距离 */
var getDistance = function (loc1, loc2) {

    let x1 = (Math.PI / 180) * loc1.lat;
    let x2 = (Math.PI / 180) * loc2.lat;
    let y1 = (Math.PI / 180) * loc1.long;
    let y2 = (Math.PI / 180) * loc2.long;
    // 地球半径
    let r = 6371;

    // 两点间距离 km，如果想要米的话，结果*1000就可以了
    let d = Math.acos(Math.sin(x1) * Math.sin(x2) + Math.cos(x1) * Math.cos(x2) * Math.cos(y1 - y2)) * r;
    if (formatFloat(d, 1) < 1) {
        return formatFloat(d * 1000, 1) + '米';
    }
    return formatFloat(d, 1) + "公里";
};
/**判断距离  
 *  @param unit 默认1000--米  1--公里
 *  @param value 判断值
 */
var judgeDistance = function (loc1, loc2, value, unit = 1000) {
    let x1 = (Math.PI / 180) * loc1.lat;
    let x2 = (Math.PI / 180) * loc2.lat;
    let y1 = (Math.PI / 180) * loc1.long;
    let y2 = (Math.PI / 180) * loc2.long;
    // 地球半径
    let r = 6371;
    // 两点间距离 km，如果想要米的话，结果*1000就可以了
    let d = Math.acos(Math.sin(x1) * Math.sin(x2) + Math.cos(x1) * Math.cos(x2) * Math.cos(y1 - y2)) * r;
    return formatFloat(d * unit, 1) <= value ? 1 : 0;
}
/**排序 */
var sortByProps = function (item1, item2) {
    var props = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        props[_i - 2] = arguments[_i];
    }

    var cps = []; // 存储排序属性比较结果。
    // 如果未指定排序属性，则按照全属性升序排序。    
    var asc = true;
    if (props.length < 1) {
        for (var p in item1) {
            if (item1[p] > item2[p]) {
                cps.push(1);
                break; // 大于时跳出循环。
            } else if (item1[p] === item2[p]) {
                cps.push(0);
            } else {
                cps.push(-1);
                break; // 小于时跳出循环。
            }
        }
    } else {
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            for (var o in prop) {
                asc = prop[o] === "asc";
                if (item1[o] > item2[o]) {
                    cps.push(asc ? 1 : -1);
                    break; // 大于时跳出循环。
                } else if (item1[o] === item2[o]) {
                    cps.push(0);
                } else {
                    cps.push(asc ? -1 : 1);
                    break; // 小于时跳出循环。
                }
            }
        }
    }

    for (var j = 0; j < cps.length; j++) {
        if (cps[j] === 1 || cps[j] === -1) {
            return cps[j];
        }
    }
    return 0;
}
var showLogger = function () {
    //cc.log('showLog');
    cc.loader.loadRes("Main/Prefab/logger", (err, prefeb) => {
        //cc.log(prefeb+'prefeb');
        let emp = cc.instantiate(prefeb);
        //cc.log(emp+'empp');
        //cc.log(emp.getComponent('Logger'));
        emp.getChildByName('logger').getComponent('Logger').init();
    });
};
/**设置头像 */
var setHead = (sprHead, urlHead) => {

    if (!isNullOrEmpty(urlHead)) {

        let urlType = urlHead.split("://")[0];
        let avatarUrl = urlHead.split("://")[1];
        switch (urlType) {
            case "remote":
                // 设置远程头像
                cc.loader.load(GameConfig.ConfigUrl + imgUrl + '?file=a.png', (err, tex) => {
                    if (err) {
                        if (cc.isValid(sprHead, true))
                            sprHead.spriteFrame = GameConfig.AvatartAtlas.getSpriteFrame("mj_face0");
                    } else {
                        try {
                            var spriteFrame = new cc.SpriteFrame(tex);
                            if (sprHead) {
                                sprHead.spriteFrame = spriteFrame;

                            }
                        } catch (error) {
                            if (cc.isValid(sprHead, true))
                                sprHead.spriteFrame = GameConfig.AvatartAtlas.getSpriteFrame("mj_face0");
                        }
                    }
                });
                break;
            case "file":
                //设置本地头像
                sprHead.spriteFrame = GameConfig.AvatartAtlas.getSpriteFrame("mj_face" + avatarUrl);
                break;
            case "https":
            case "http":
                // 设置远程头像
                cc.loader.load(urlHead + '?file=a.png', (err, tex) => {
                    if (err) {
                        if (cc.isValid(sprHead, true))
                            sprHead.spriteFrame = GameConfig.AvatartAtlas.getSpriteFrame("mj_face0");
                    } else {
                        try {
                            var spriteFrame = new cc.SpriteFrame(tex);
                            if (sprHead) {
                                sprHead.spriteFrame = spriteFrame;

                            }
                        } catch (error) {
                            if (cc.isValid(sprHead, true))
                                sprHead.spriteFrame = GameConfig.AvatartAtlas.getSpriteFrame("mj_face0");
                        }
                    }
                });
                break;
        }

    } else {
        sprHead.spriteFrame = GameConfig.AvatartAtlas.getSpriteFrame("mj_face0");
    }
};

/**数组对象排序（升序） */
var compare = (property) => {
    return (obj1, obj2) => {
        var value1 = obj1[property];
        var value2 = obj2[property];
        return value1 - value2;     // 升序
    }
};
var logInfo = function (msg) {
    //msg = JSON.stringify(msg);
    if (!cc.logInfo)
        cc.logInfo = '';
    cc.logInfo += msg + '\n';
    //let newEvent = new cc.Event.EventCustom('refreshLog',true);
    try {
        cc.director.emit('refreshLog', {
            msg: null,
        })

    } catch (ex) {

    }
};
/**判断value是否为空 */
var isNullOrEmpty = function (value) {

    // Check for undefined, null and NaN
    if (typeof value === 'undefined' || value === null ||
        (typeof value === 'number' && isNaN(value))) {
        return true;
    }

    // Numbers, booleans, functions and DOM nodes are never judged to be empty
    else if (typeof value === 'number' || typeof value === 'boolean' ||
        typeof value === 'function' || value.nodeType === 1) {
        return false;
    }

    // Check for arrays with zero length
    else if (value.constructor === Array && value.length < 1) {
        return true;
    }

    // Check for empty strings after accounting for whitespace
    else if (typeof value === 'string') {
        if (value.replace(/\s+/g, '') === '') {
            return true;
        }
        else {
            return false;
        }
    }

    // Check for objects with no properties, accounting for natives like window and XMLHttpRequest
    else if (Object.prototype.toString.call(value).slice(8, -1) === 'Object') {
        var props = 0;
        for (var prop in value) {
            if (value.hasOwnProperty(prop)) {
                props++;
            }
        }
        if (props < 1) {
            return true;
        }
    }

    // If we've got this far, the thing is not null or empty
    return false;
};

// /**判断是否为同一天 */
var judgeDate = (timestamp1, timestamp2) => {
    let date1 = new Date(timestamp1);
    let date2 = new Date(timestamp2);
    return date1.getFullYear() == date2.getFullYear()
        && date1.getMonth() == date2.getMonth()
        && date1.getDate() == date2.getDate();
}

/**弹出弹窗 */
var pop = (popName, callback) => {
    if (isNullOrEmpty(popName))
        return;
    let nodeName = popName.replace(/[/]/g, "")
    if (cc.find('Canvas').getChildByName(nodeName)) {
        if (callback)
            callback(cc.find('Canvas').getChildByName(nodeName))
        return;
    }

    cc.loader.loadRes(popName, (err, prefab) => {
        if (!err) {
            let popNode = cc.instantiate(prefab);
            if (cc.find('Canvas').getChildByName(nodeName)) {
                if (callback)
                    callback(cc.find('Canvas').getChildByName(nodeName))
                return;
            }
            cc.find('Canvas').addChild(popNode, 0, nodeName)
            if (callback)
                callback(popNode)
        }
    });
};
/**储存本地
 * @param 仅支持 arr str num obj
 */
var saveValue = (key, value = "") => {
    let data = new Object();

    switch (typeof value) {
        case "object":
            data['type'] = Array.isArray(value) ? "array" : typeof value;
            data['value'] = value;
            break;
        default:
            data['type'] = typeof value;
            data['value'] = value;
            break;
    }
    let res = JSON.stringify(data);
    cc.sys.localStorage.setItem(GameConfig.ApkName + key, res)
}
/**获取本地 */
var getValue = (key, defaultValue = "") => {
    let value = cc.sys.localStorage.getItem(GameConfig.ApkName + key)
    if (isNullOrEmpty(value))
        return defaultValue;
    let data = JSON.parse(value);
    let res = data.value;
    return res;
}

/**全局冒泡派发事件 */
var dispatchAllEvent = (node, eventName, data) => {
    if (!cc.isValid(node, true)) return;
    let event = new cc.Event.EventCustom(eventName, true);
    if (!isNullOrEmpty(data))
        event.setUserData(data);
    node.dispatchEvent(event);
}
/**创建二维码
 * @param ctx  cc.Graphics节点
 * @param str  二维码携带信息(字符串)---支持中文
 */
var QRCreate = (ctx, str) => {
    let url = eval('\'' + encodeURI(str).replace(/%/gm, '\\x') + '\'')
    var qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
    qrcode.addData(url);

    qrcode.make();

    ctx.fillColor = cc.Color.BLACK;
    //块宽高
    var tileW = ctx.node.width / qrcode.getModuleCount();
    var tileH = ctx.node.height / qrcode.getModuleCount();
    // draw in the Graphics
    for (var row = 0; row < qrcode.getModuleCount(); row++) {
        for (var col = 0; col < qrcode.getModuleCount(); col++) {
            if (qrcode.isDark(row, col)) {
                // ctx.fillColor = cc.Color.BLACK;
                var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                ctx.fill();
            }
        }
    }
}

/**版本号对比 */
var versionCompareHandle = (versionA, versionB) => {

    // cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
    let vA = versionA.split('.');
    let vB = versionB.split('.');
    for (let i = 0; i < vA.length; ++i) {
        let a = parseInt(vA[i]);
        let b = parseInt(vB[i] || 0);
        if (a === b) {
            continue;
        } else {
            return a - b;
        }
    }
    if (vB.length > vA.length) {
        return -1;
    } else {
        return 0;
    }
}

/**打点
    * @param event 打点事件
    * @param data 打点携带参数
    */
var LogsClient = (event, data) => {

    console.log("打点----", event)
    let options = {
        url: GameConfig.ServerEventName.LogsClient,
        data: {
            deviceID: GameConfig.DeviceID,
            event,
            data
        }
    }
    Http.post(options).then((data) => {
        console.log("打点成功")
    }).catch((err) => {
        console.log("打点失败")

        // Cache.alertTip(err.message || '登录失败')
    });

}
/**xml请求 */
var XMLRequest = (url, data, callback) => {
    testConnect(url + "CONFIG", (err, res) => {
        if (!err)
            callback(url, data);
    });
}

/**xml请求OSS */
var XMLRequestOSS = (url, callback) => {
    testConnect(url, (err, res) => {
        if (!err)
            callback(res);
        else{
            res = {
                "servers": [
                  "http://119.23.220.94/",
                  "http://119.23.70.124/",
                  "http://119.23.208.85/",
                  "http://112.74.61.86/",
                  "http://120.77.175.130/",
                  "http://119.23.57.214/",
                  "http://119.23.60.138/",
                  "http://120.77.202.81/",
                  "http://119.23.220.22/",
                  "http://120.77.213.170/"

                ],
                "update": [
                  "https://pku.qzhagy.com/update/"
                ]
            }
            console.log("asdasdasdad")

            callback(res);
        }
    });
}
/**xml请求OSS */
var NewXMLRequestOSS = (url, callback) => {
    testConnect(url, (err, res) => {
        if (!err)
            callback(res);
        else{
           
            callback('err');
        }
    });
}

var testConnect = (url, callback) => {
    try {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.setRequestHeader("contentType", "text/html;charset=uft-8"); //指定发送的编码
        xhr.onreadystatechange = () => {
            if (xhr.status == 404||xhr.status == 403) {
                callback("404");
                return;
            }
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                try {
                    console.log("测速: " + url, xhr.responseText)
                    let jsonStr = xhr.responseText;
                    let jsonData = JSON.parse(jsonStr);
                    if (jsonData.servers && jsonData.servers.length > 0 && jsonData.update && jsonData.update.length > 0) {
                        callback(null, jsonData);
                        return;
                    }
                } catch (ex) {
                    callback('500');
                    return;
                }
                callback('502');
            }
        };
        xhr.timeout = 5 * 1000;
        xhr.onerror = () => {
            callback("fail");
        };
        xhr.ontimeout = () => {
            callback("timeout");
        };
        xhr.send();
    } catch (ex) {
        callback(ex.message);
    }
};



/**格式化时间戳 ms yy:mm:dd:hh:mm:ss */
var timestampToTime = (timestamp) => {

    let date = new Date(timestamp);

    let Y = date.getFullYear() + '-';

    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';

    let D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + ' ';

    let h = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ':';

    let m = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ':';

    let s = (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds())

    return Y + M + D + h + m + s;

}

/**格式化时间戳 s 天时分 */
var timeToString = (second) => {
    if (second == 0)
        return "";
    var duration;
    var days = Math.floor(second / 86400);
    var hours = Math.floor((second % 86400) / 3600);
    var minutes = Math.floor(((second % 86400) % 3600) / 60);
    var seconds = Math.floor(((second % 86400) % 3600) % 60);
    if (days > 0) duration = days + "天" + hours + "小时" + minutes + "分";// + seconds + "秒";
    else if (hours > 0) duration = hours + "小时" + minutes + "分" + seconds + "秒";
    else if (minutes > 0) duration = minutes + "分" + seconds + "秒";
    else if (seconds > 0) duration = seconds + "秒";
    return duration;

}

cc.quickLaunch = function (roomToken, roomId) {
    if (roomToken == null || roomId == null)
        return;
    let [quickType, tableId] = roomId.split("|");
    if (quickType == null || tableId == null)
        return;
    quickType = parseInt(quickType);
    roomToken = parseInt(roomToken);
    if (cc.director.getScene().name == 'Lobby')
        cc.find('Canvas').getComponent('SceneHall').quickLaunch(roomToken, tableId, quickType);
    else {
        cc.roomToken = roomToken;
        cc.tableId = tableId;
        cc.quickType = quickType;
    }
};


var encryptData = (data, token) => {
    let { ts } = data;
    const ignoreKey = ['ts', 'sign'];
    let keyArray = [];
    for (let key in data) {
        keyArray.push(key);
    }
    keyArray = keyArray.sort();
    let str = '';
    for (let key of keyArray) {
        if (!ignoreKey.includes(key)) {
            str += `${key}=${JSON.stringify(data[key])}&`;
        }
    }
    let firstMd5 = md5(`${str}key=${token}`);
    firstMd5 = firstMd5.toUpperCase();
    let lastMd5 = md5(`${firstMd5}${ts}`);
    lastMd5 = lastMd5.toUpperCase();
    return lastMd5
};

/**加密token */
var encryptToken = (token) => {
    let encryptor = new JSEncrypt.JSEncrypt();
    let pubkey = getValue(GameConfig.StorageKey.TokenPKey)
    encryptor.setPublicKey(pubkey);
    let tkn = encryptor.encrypt(token);
    return tkn
}
/**解密token */
var decryptToken = (token) => {
    let encryptor = new JSEncrypt.JSEncrypt();
    let pubkey = getValue(GameConfig.StorageKey.TokenPKey)
    encryptor.setPublicKey(pubkey);
    let tkn = encryptor.decrypt(token);
    return tkn
}



var getIP = () => {
    return new Promise((resolve, reject) => {
        var url = 'https://ifconfig.co/ip';
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;

                console.log('ip===>' + response);
                resolve(response);
            } else if (xhr.readyState == 4) {
                reject("");
            }
        };
        xhr.timeout = 10000;
        xhr.onerror = () => {
            reject("");
        };
        xhr.ontimeout = () => {
            reject("");
        };
        xhr.open('GET', url, true);
        xhr.send();

    });
}
cc.refreshGPS = function (gps) {
    if (cc.location == null)
        cc.location = { x: 0, y: 0, regeo: "未知" };
    let x = gps.x.toFixed(4);
    let y = gps.y.toFixed(4);
    if ((x != 0 && x != cc.location.x.toFixed(4)) || (y != 0 && y != cc.location.y.toFixed(4))) {
        cc.needRefreshGPS = true;
        cc.location = gps;
        if (cc.hideRegeo) {
            if (cc.location.regeo)
                cc.location.regeo = '隐藏';
        }
    }
    cc.log("cc.location:" + JSON.stringify(cc.location) + ",cc.needRefreshGPS:" + cc.needRefreshGPS);
};
cc.needRefreshGPS = false;


module.exports = {
    loadNative,
    screenShoot,
    SaveToLocal,
    formatGold,
    getChips,
    generateUniqueID,
    getStringByteLength,
    getStringByLength,
    showLogger,
    logInfo,
    fitScreen,
    checkPhone,
    dispatchAllEvent,
    XMLRequest,
    XMLRequestOSS,
    NewXMLRequestOSS,
    getTimeStamp,
    testConnect,
    pop,
    saveValue,
    getValue,
    judgeDate,
    QRCreate,
    subName,
    setScore,
    showNode,
    timestampToTime,
    timeToString,
    deepcopyArr,
    setHead,
    compare,
    sortByProps,
    judgeDistance,
    getDistance,
    decodeInviter,
    toPercent,
    encryptData,
    decryptToken,
    encryptToken, getIP,
    getFormatDate,
    LogsClient,
    versionCompareHandle,
    isNullOrEmpty
};
