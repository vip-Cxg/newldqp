const { GameConfig } = require("../../GameBase/GameConfig");
const Cache = require("./Cache");
const utils = require("./utils");
const Connector = require("../NetWork/Connector");
const { default: GameUtils } = require("../../script/common/GameUtils");

/**
 * 与原生环境做交互
 */
var Caller = {
    'ios': 'AppController',
    'android': 'org/cocos2dx/javascript/AppActivity'
};

/**
 * Social========================================
 */

var Social = function () { };

Cache.location = { lat: 0, long: 0 };

Social.shareLinkWithSG = function (url, title, description, roomId, roomToken) {
    if (!cc.sys.isNative) {
        cc.log(url, title, description, roomId);
    } else {
        if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(Caller.ios, 'shareLinkWithSG:title:description:roomId:roomToken:',
                url, title, description, roomId, roomToken);
        } else {
            jsb.reflection.callStaticMethod(Caller.android, 'shareLinkWithSG',
                '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V',
                url, title, description, roomId, roomToken);
        }
    }
};

Social.makeCall = function (phone) {
    if (!cc.sys.isNative) {

    } else {
        if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(Caller.ios, 'makeCall:', phone);
        } else {
            jsb.reflection.callStaticMethod(Caller.android, 'makeCall', '(Ljava/lang/String;)V', phone);
        }
    }
};
Social.openUrl = (url) => {
    if (!cc.sys.isNative) {
        cc.sys.openURL(url)
    } else {
        if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(Caller.ios, 'openUrl:', url);
        } else {
            try {
                jsb.reflection.callStaticMethod(Caller.android, 'openUrl', '(Ljava/lang/String;)V', url);

            } catch (error) {
                console.log("报错---", error.strack)
            }
        }
    }
}

Social.selectPicture = function () {
    if (cc.sys.isNative) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            let userToken = utils.getValue(GameConfig.StorageKey.UserToken, "");
            jsb.reflection.callStaticMethod(Caller.ios, "selectPicture:token:", Connector.logicUrl + GameConfig.ServerEventName.Upload, userToken);
        } else {
            jsb.reflection.callStaticMethod(Caller.android, "selectPicture", "()V");
        }
    }
};

Social.selectQRCode = function () {
    if (cc.sys.isNative) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            let userToken = utils.getValue(GameConfig.StorageKey.UserToken, "");
            jsb.reflection.callStaticMethod(Caller.ios, "selectQRCode:token:", Connector.logicUrl + GameConfig.ServerEventName.OTCQrCode, userToken);
        } else {
            jsb.reflection.callStaticMethod(Caller.android, "selectQRCode", "()V");
        }
    }
};
Social.selectReceipt = function () {
    if (cc.sys.isNative) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            let userToken = utils.getValue(GameConfig.StorageKey.UserToken, "");
            jsb.reflection.callStaticMethod(Caller.ios, "selectQRCode:token:", Connector.logicUrl + GameConfig.ServerEventName.OTCReceipt, userToken);
        } else {
            jsb.reflection.callStaticMethod(Caller.android, "selectQRCode", "()V");
        }
    }
};

/**
 * 获取机器uuid
 * @return {[string]} uuid
 */
Social.getUUID = function () {
    let uuid = 'testDeviceId1';
    if (cc.sys.isNative) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            uuid = jsb.reflection.callStaticMethod(Caller.ios, 'getUUID');
        } else {
            uuid = jsb.reflection.callStaticMethod(Caller.android, 'getUUID', '()Ljava/lang/String;');
        }
    }
    return uuid;
};
/**
 * 获取苹果idfa
 * @return {[string]} idfa
 */
Social.getIDFA = function () {
    if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod(Caller.ios, 'getIDFA') || "";
    }
    return "";
};

Social.getInviter = function () {
    if (!cc.sys.isNative) {
        // cc.log(path, scene);
    } else {
        let inviter, strInviter;
        if (cc.sys.os === cc.sys.OS_IOS) {
            strInviter = jsb.reflection.callStaticMethod(Caller.ios, 'getInviter');
        } else {
            strInviter = jsb.reflection.callStaticMethod(Caller.android, 'getInviter', '()Ljava/lang/String;');
        }

        try {

            inviter = strInviter;//JSON.parse(strInviter).inviter;
        } catch (ex) {
            inviter = "inviter=888888";
            cc.log(ex);
        }
        return inviter;
    }
}
Social.reportError = function (error) {
    if (cc.sys.isNative) {
        if (cc.sys.os === cc.sys.OS_IOS) {

        } else {
            jsb.reflection.callStaticMethod(Caller.android, 'postException', '(ILjava/lang/String;Ljava/lang/String;Ljava/lang/String;)V', 5, "CatchedError", error.message, error.stack);
        }
    }
}

Social.setCopy = function (text) {
    if (!cc.sys.isNative) {
        // cc.log(path, scene);
    } else {
        if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(Caller.ios, 'setCopy:', text);
        } else {
            jsb.reflection.callStaticMethod(Caller.android, 'setCopy', '(Ljava/lang/String;)V', text);
        }
    }
};

Social.showLocation = function () {
    if (!cc.sys.isNative) {
        // cc.log(path, scene);
    } else {
        if (cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(Caller.ios, 'showLocation');
        } else {
            jsb.reflection.callStaticMethod(Caller.android, 'showLocation', '()V');
        }
    }

};

Social.getCopy = function () {
    let copyText = "888888";
    if (!cc.sys.isNative) {
        // cc.log(path, scene);
    } else {
        if (cc.sys.os === cc.sys.OS_IOS) {
            copyText = jsb.reflection.callStaticMethod(Caller.ios, 'getCopy');
        } else {
            copyText = jsb.reflection.callStaticMethod(Caller.android, 'getCopy', '()Ljava/lang/String;');
        }
    }
    return copyText;

};


// 获取版本号
var getVersion = function () {
    let version = '1.0.0';
    if (cc.sys.isNative) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            version = jsb.reflection.callStaticMethod(Caller.ios, 'getVersion');
        } else {
            version = jsb.reflection.callStaticMethod(Caller.android, 'getVersion', '()Ljava/lang/String;');
        }
    }
    return version;
};

//获取电量
var getBattery = function () {
    let battery = 0;
    if (cc.sys.isNative) {
        if (cc.sys.os == cc.sys.OS_IOS) {
            battery = jsb.reflection.callStaticMethod(Caller.ios, 'getBattery');
        } else {
            battery = jsb.reflection.callStaticMethod(Caller.android, 'getBattery', '()F');
        }
    }
    return battery;
};

//获取信号
var getWifiSignal = function () {
    let signal = 0;
    if (cc.sys.isNative) {
        if (cc.sys.os == cc.sys.OS_IOS) {
            signal = jsb.reflection.callStaticMethod(Caller.ios, 'getWifiSignal');
        } else {
            signal = jsb.reflection.callStaticMethod(Caller.android, 'getWifiSignal', '()I');
        }
    }
    return signal;
};

Social.getPhotoCallback = function (strData, scope) {

    if (utils.isNullOrEmpty(strData)) {
        return;
    }
    // scope = avatar  or scope = qrcode
    let uploadUrl = scope == "avatar" ? GameConfig.ServerEventName.Upload : (GameConfig.isUpdateReceipt ? GameConfig.ServerEventName.OTCReceipt : GameConfig.ServerEventName.OTCQrCode);
    let userToken = utils.getValue(GameConfig.StorageKey.UserToken, "");
    Cache.showMask("正在上传...");
    if (cc.sys.isNative) {
        try {
            let data;
            if (cc.sys.os == cc.sys.OS_IOS) {
                data = strData;
            } else {
                data = jsb.reflection.callStaticMethod(Caller.android,
                    'uploadImage',
                    '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;',
                    Connector.logicUrl + uploadUrl, userToken, strData);
            }
            Cache.hideMask();
            if (utils.isNullOrEmpty(data)) {
                Cache.alertTip("上传图片失败，请重试");
            }
            if (this.avatarUrlCallBack)
                this.avatarUrlCallBack(data);
            if (this.wechatQrCodeCallBack)
                this.wechatQrCodeCallBack(data);
            if (this.ReceiptCallBack)
                this.ReceiptCallBack(data);
            if (this.serviceImgCallBack)
                this.serviceImgCallBack(data);
        } catch (error) {
            Cache.hideMask();
            console.log("上传", JSON.stringify(error))
            console.log("上传1", error.message)
            Cache.alertTip("上传失败")
        }
    } else {
        Cache.hideMask();
    }
};
Social.avatarUrlCallBack = null;
Social.wechatQrCodeCallBack = null;
Social.ReceiptCallBack = null;
Social.serviceImgCallBack = null;
Social.getLocationCallback = function (lat, long) {
    let location = utils.getValue(GameConfig.StorageKey.Location, { lat: 0, long: 0 });

    if (lat == 0 && long == 0) {
        lat = location.lat;
        long = location.long;
    } else if (lat != location.lat || long != location.long) {
        utils.saveValue(GameConfig.StorageKey.Location, { lat, long })
    }
    Cache.location = { lat, long };
}
Social.reCallInviter = function () {
    if (cc.sys.isNative) {
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(Caller.ios, 'reCallInviter');
        }
    }
}
// 登录前检测 access_token是否失效, 如果失效, 使用 refresh_token 重新获得access_token,   如果refresh_token失效 则调用 wechatAuth 
Social.wechatAuth = function () {
    if (cc.sys.isNative) {
        if (cc.sys.os == cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod(Caller.ios, 'sendWXAuthReq');
        } else {
            jsb.reflection.callStaticMethod(Caller.android, 'sendWXAuthReq', '()V');
        }
    }
}

Social.wechatCallback = function (code) {
    console.log('微信返回-----',code);
    if (code == null || code == "") {
        return;
    }
    if (this.wxLoginCallBack)
        this.wxLoginCallBack(code);
    // // FIXME 请求服务器 /oauth 接口, 传code 得到如下信息
    // Connector.request(GameConfig.ServerEventName.WxLogin, { code: code }, (data) => {
    //     if (data.data) {

    //         //存储微信登录信息  取出--utils.getValue(GameConfig.StorageKey.WxLoginData,{})
    //         utils.saveValue(GameConfig.StorageKey.WxLoginData, data.data);
    //         //记录refresh_token时间
    //         utils.saveValue(GameConfig.StorageKey.RefreshTokenTime, new Date().getTime());
    //         //记录access_token时间
    //         utils.saveValue(GameConfig.StorageKey.AccessTokenTime, new Date().getTime());

    //         Connector.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${data.data.access_token}&openid=${data.data.openid}`, "getJson", (res) => {
    //             if (res) {
    //                 if (this.wxLoginCallBack)
    //                     this.wxLoginCallBack(res);
    //             }
    //         })
    //     }
    // });
}
Social.wxLoginCallBack = null;

Social.refreshToken = function (appid, refreshToken) {
    let wxData = utils.getValue(GameConfig.StorageKey.WxLoginData, {});
    if (utils.isNullOrEmpty(wxData) && utils.isNullOrEmpty(wxData.refresh_token)) return;
    refreshToken = wxData.refresh_token;
    appid = GameConfig.GameInfo.appid;
    //FIXME global 里有appid 替换掉
    let url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${appid}&grant_type=${refreshToken}&refresh_token=${refreshToken}`;
    Connector.get(url, "getJson", (res) => {
        if (res) {
            wxData.access_token = res.access_token;
            wxData.refresh_token = res.refresh_token;
            //存储微信登录信息  取出--utils.getValue(GameConfig.StorageKey.WxLoginData,{})
            utils.saveValue(GameConfig.StorageKey.WxLoginData, data.data);
            //TODO  不确定是否更新 refresh_token
            utils.saveValue(GameConfig.StorageKey.RefreshTokenTime, new Date().getTime());
            //记录access_token时间
            utils.saveValue(GameConfig.StorageKey.AccessTokenTime, new Date().getTime());

        }
    });
};

Social.saveImage = function (imgPath) {
    let res = "";
    if (cc.sys.isNative) {
        try {
            if (cc.sys.os === cc.sys.OS_IOS) {
                res = jsb.reflection.callStaticMethod(Caller.ios, 'saveTextureToLocal:', imgPath);

            } else {
                //JS调用JAVA saveTextureToLocal 方法 参数为 filePath 也就是路径
                res = jsb.reflection.callStaticMethod(Caller.android, "saveTextureToLocal", "(Ljava/lang/String;)I", imgPath);
            }
        } catch (error) {
            Cache.alertTip("保存失败,请截屏保存");
        }

    }
    if (utils.isNullOrEmpty(res))
        Cache.alertTip("保存失败,请截屏保存");

};

Social.saveImageCallback = function (success) {
    Cache.alertTip(success ? "保存成功" : "保存失败,请截屏保存");
};
// if (!CC_DEBUG) {
    if (cc.sys.isNative) {
        window.__errorHandler = function (filename, lineNumber, message, stack) {
                let id = db.player.id!=null?db.player.id:"00000";
                let data = {
                    filename: filename,
                    lineNumber: lineNumber,
                    message: message,
                    stack: stack,
                    version:cc.gameVersion,
                    areaCode:"00",
                    playerId:id
                };
                cc.log('catch error in __errorHandler ' + data);
                GameUtils.LogsClient(GameConfig.LogsEvents.BUG, { action:data })

                //cc.log("++++++++++++++++++++",data);
                // connector.commitError(data,"catchedReport");
                //cc.log("error====>",filename, lineNumber, message,stack);
        };
    }
// }
module.exports = {
    Social
};
