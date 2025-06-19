import { GameConfig } from "../../GameBase/GameConfig";
import Http from "./network/Http";
const JSEncrypt = require('../../Main/Script/jsencrypt');
export default class GameUtils {
    /**判断value是否为空 */
    static isNullOrEmpty(value) {

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
    /**深拷贝数组对象 */
    static deepcopyArr(arr) {
        let res = [];
        arr.forEach((element, i) => {
            let str = JSON.stringify(element);
            res[i] = JSON.parse(str);
        });
        return res;
    }
    /**排序 */
    static sortByProps(item1, item2) {
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
    /**md5 加密数据 */
    static encryptData(data, token) {
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
    static encryptToken(token) {
        // let encryptor = new JSEncryptrypt();
        let encryptor = new JSEncrypt.JSEncrypt()
        let pubkey = GameUtils.getValue(GameConfig.StorageKey.TokenPKey)
        encryptor.setPublicKey(pubkey);
        let tkn = encryptor.encrypt(token);
        return tkn
    }
    /**储存本地
 * @param 仅支持 arr str num obj
 */
    static saveValue(key, value = "") {
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
        console.log('saveValue', res)
        cc.sys.localStorage.setItem(GameConfig.ApkName + key, res)
    }
    /**获取本地 */
    static getValue(key, defaultValue = "") {
        let value = cc.sys.localStorage.getItem(GameConfig.ApkName + key)
        if (GameUtils.isNullOrEmpty(value))
            return defaultValue;
        let data = JSON.parse(value);
        let res = data.value;
        return res;
    }

    /**获取时间戳 ms */
    static getTimeStamp(dataStr = "") {
        if (dataStr == "")
            return new Date().getTime() + GameConfig.ServerTimeDiff;

        return new Date(dataStr).getTime() + GameConfig.ServerTimeDiff || 0;
    }
    /**
     * 格式化点数,以万为单位
     * @param  {Number} gold    点数
     * @param  {Number} precision 精度
     */
    static formatGold(gold=0, precision, limit) {
        
        return (parseFloat(gold) / 100).toFixed(2)||0;
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
    }
    /**格式化时间戳 ms yy:mm:dd:hh:mm:ss */
    static timestampToTime(timestamp) {

        let date = new Date(timestamp);

        let Y = date.getFullYear() + '-';

        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';

        let D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + ' ';

        let h = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ':';

        let m = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ':';

        let s = (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds())

        return Y + M + D + h + m + s;
    }

    /**获取指定长度字符串 */
    static getStringByLength(str, num) {
        if (str) {
            let str_1 = str.replace(/[\u4e00-\u9fa5]/g, "aa");
            let len = str_1.replace(/[A-Z]/g, "aa").length;
            if (len > num * 2) {
                str = str.substr(0, num) + "...";
            }
        }
        return str;
    };
    /**格式化时间戳 s 天时分 */

    static timeToString(second) {
        if (second == 0)
            return "";
        let duration;
        let days = Math.floor(second / 86400);
        let hours = Math.floor((second % 86400) / 3600);
        let minutes = Math.floor(((second % 86400) % 3600) / 60);
        let seconds = Math.floor(((second % 86400) % 3600) % 60);

        let daysStr = days > 9 ? days : '0' + days;
        let hoursStr = hours > 9 ? hours : '0' + hours;
        let minStr = minutes > 9 ? minutes : '0' + minutes;
        let secStr = seconds > 9 ? seconds : '0' + seconds;

        if (days > 0) duration = daysStr + "天" + hoursStr + "小时" + minStr + "分";
        else if (hours > 0) duration = hoursStr + "小时" + minStr + "分" + secStr + "秒";
        else if (minutes > 0) duration = minStr + "分" + secStr + "秒";
        else if (seconds > 0) duration = secStr + "秒";
        return duration;

    }

    /**获取时间戳 ms */
    static getTimeStamp(dataStr = "") {
        if (dataStr == "")
            return new Date().getTime() + GameConfig.ServerTimeDiff;

        return (new Date(dataStr).getTime() + GameConfig.ServerTimeDiff) || 0;
    }

    /**保存到本地 */
    static SaveToLocal(ImgUrl, callBack) {

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

        };
        xhr.responseType = 'arraybuffer';
        xhr.open("GET", ImgUrl, true);
        xhr.send();

    }
    /**弹出弹窗 */
    static pop(popName, callback) {
        if (this.isNullOrEmpty(popName))
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
                cc.find('Canvas').addChild(popNode, 0, nodeName)
                if (callback)
                    callback(popNode)
            }
        });
    };
    static loadImg(url) {
        return new Promise((res, rej) => {
            // let imgCache = cc.sys.localStorage.getItem(GameConfig.StorageKey.ImgCache)
            // if (GameUtils.isNullOrEmpty(imgCache))
            //     imgCache = '{}';
            // console.log("imgCache", imgCache)
            // let index = imgCache.findIndex(a => a.url == url);
            // if (index != -1) {
            //     res(imgCache[index].tex)
            //     return;
            // }
            // let imgCacheObj=JSON.parse(imgCache)
            // if (!GameUtils.isNullOrEmpty(imgCacheObj[url])) {
            //     res(imgCacheObj[url])
            //     return;
            // }

            let urlType = url.split("://")[0];
            let imgUrl = url.split("://")[1];
            let finalUrl = url;
            switch (urlType) {
                case "remote":
                    finalUrl = GameConfig.ConfigUrl + imgUrl;

                    break;

                    break;
                case "https":
                case "http":
                    finalUrl = url;
                    break;
            }

            if (urlType == 'file') {
                res(GameConfig.AvatartAtlas.getSpriteFrame("mj_face" + imgUrl));
                return;
            }
            cc.loader.load(finalUrl + '?file=a.png', (err, tex) => {
                if (err) {
                    rej(err);
                } else {
                    // let obj = {
                    //     url,
                    //     tex
                    // }
                    // imgCache.push(obj);
                    // if (imgCache.length > 30)
                    //     imgCache.shift();
                    // imgCacheObj[url]=tex;

                    // cc.sys.localStorage.setItem(GameConfig.StorageKey.ImgCache, JSON.stringify(imgCacheObj))
                    // GameUtils.saveValue(GameConfig.StorageKey.ImgCache, imgCache);
                    res(new cc.SpriteFrame(tex));
                }
            });
        })
    }

    /**打点
     * @param event 打点事件
     * @param data 打点携带参数
     */
    static LogsClient(event, data) {
        if (cc.sys.isBrowser)
            return;
        console.log("打点----", event)
        let failArr = this.getValue(GameConfig.StorageKey.LogsClientFail, []);
        let options = failArr.length > 0 ? {
            url: GameConfig.ServerEventName.LogsClient,
            data: {
                deviceID: GameConfig.DeviceID,
                event,
                data,
                failCount: failArr.length,
                failLogs: failArr,
            }
        } : {
            url: GameConfig.ServerEventName.LogsClient,
            data: {
                deviceID: GameConfig.DeviceID,
                event,
                data
            }
        }
        Http.post(options).then((data) => {
            this.saveValue(GameConfig.StorageKey.LogsClientFail, [])
            console.log(data.action, "-打点成功-", JSON.stringify(options));
        }).catch((err) => {
            let failData = { event, data };
            failArr.push(failData);
            this.saveValue(GameConfig.StorageKey.LogsClientFail, failArr)
            console.log(data.action, "-打点失败-", err.strack);
        });
    }
}

