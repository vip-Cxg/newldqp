let db = require("../Script/DataBase")//require("DataBase");
let ROUTE = require("../Script/ROUTE")//require("ROUTE");
let PACK = require("../Script/PACK")//require("PACK");
let cache = require("../Script/Cache");//require("Cache");
const { GameConfig } = require("../../GameBase/GameConfig");
const utils = require("../Script/utils");
const RETRY_INTERVAL = [0, 1, 3, 4, 5, 7, 7];
const AudioCtrl = require("../Script/audio-ctrl");
const { App } = require("../../script/ui/hall/data/App");
module.exports = {
    logicUrl: GameConfig.ServerUrl,
    connect_status: {
        closed: 0,
        connecting: 1,
        connected: 2,
        closing: 3
    },
    receiveTime: null,
    offline: true,
    status: null,
    _socket: null,
    disconnectStatus: false,
    gameStart: false,
    _queueGameMsg: [],
    _queueChatMsg: [],
    _pingArr: [],
    pingSchedule: null,
    _retryTime: 0,
    _retryTTL: 0,
    ts: 0,
    _status: GameConfig.ConnectState.CLOSED,
    /**发送数据 */
    emit(route, data) {
        if (this._socket == null)
            return;
        let obj = { pack: route, data };
        if (route != "CS_PING")
            console.log(route, data)
        this._socket.send(JSON.stringify(obj));
        // this._socket.emit(route, data);

    },
    /**
     * 向服务器发送游戏行为
     *  @param route  事件名 
     *  @param data  携带数据 
     *  
     * */
    gameMessage(route, data) {
        this.emit(PACK.CS_GAME_MESSAGE, { route: route, data: data });
    },
    /**post 请求 */
    request(method, data, callback, mask = 1, failCallback, proxyToken = false) {
        let reqType = data == "getJson" ? "GET" : "POST";
        let url = data == "getJson" ? method : this.logicUrl + method;
        console.log("url:  ", url)
        if (cc.sys.isBrowser) {
            console.log("data:   ", data)
        } else {
            console.log("data:   ", JSON.stringify(data))
        }
        if (mask)
            cache.showMask("正在加载...请稍后");
        try {
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.open(reqType, url, true);
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.setRequestHeader("contentType", "text/html;charset=uft-8"); //指定发送的编码
            xhr.setRequestHeader("Content-Type", "application/json");
            let userToken = utils.getValue(GameConfig.StorageKey.UserToken, "");
            data.version = cc.gameVersion || GameConfig.DefaultVersion;
            data.ts = new Date().getTime() + GameConfig.ServerTimeDiff;
            if (!utils.isNullOrEmpty(userToken) && method != GameConfig.ServerEventName.UserLogin && method != GameConfig.ServerEventName.ProxyLogin) {
                let encryptToken = utils.encryptToken(userToken);
                xhr.setRequestHeader("xxx-token", encryptToken);
                data.sign = utils.encryptData(data, userToken);
            }
            xhr.onreadystatechange = () => {
                if (xhr.status == 404) {
                    cache.hideMask();
                    cache.showTipsMsg('加载失败');
                }

                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                    let response = xhr.responseText;
                    cache.hideMask();
                    let resData;
                    try {
                        resData = JSON.parse(response);
                        if (cc.sys.isBrowser) {

                            console.log(method + ": ", resData);
                        } else {
                            console.log(method + ": ", response);

                        }
                        if (!utils.isNullOrEmpty(resData.token)) {
                            let decryptToken = GameConfig.Encrtyptor.decrypt(resData.token);
                            // let decryptToken = utils.decryptToken(resData.token);
                            utils.saveValue(GameConfig.StorageKey.UserToken, decryptToken);

                        }
                        if (resData.success && callback) {
                            if (!utils.isNullOrEmpty(resData.version) && utils.versionCompareHandle(resData.version, '1.0.0') > 0)
                                GameConfig.isNewMatch = true;
                            callback(resData);
                        } else {
                            if (resData.status && (resData.status.code == 702 || resData.status.code == 701)) {
                                App.unlockScene();
                                cache.showTipsMsg(resData.message || "登录失效,请重新登录", () => {
                                    utils.saveValue(GameConfig.StorageKey.UserToken, "");
                                    cc.director.loadScene('Login');
                                });
                                return;
                            }

                            if (failCallback) {
                                failCallback(resData)
                            } else {
                                cache.showTipsMsg(resData.message || '服务器出错', () => {

                                    if (resData.restart) {
                                        AudioCtrl.getInstance().stopAll();
                                        cc.game.restart();
                                    }
                                });
                            }
                        }
                    } catch (ex) {
                        console.log("返回处理" + method + ": ", ex)
                        if (failCallback) {
                            failCallback({ message: ex })
                        } else {
                            cache.alertTip('错误码: ' + (GameConfig.ErrorCode[method] || '1000')); //错误弹窗
                        }
                        cache.hideMask();
                    }
                } else if (xhr.readyState == 4) {
                    cache.hideMask();
                    console.log("err", xhr.responseText)
                    try {
                        cache.showTipsMsg('当前网络较差,重新选择链路', () => {
                            cc.director.loadScene('Update');//Update
                        });
                        // let resData = JSON.parse(xhr.responseText)
                        // if (failCallback) {
                        //     failCallback(resData)
                        // } else {
                        //     cache.showTipsMsg(resData.message, () => {
                        //         if (resData.restart) {
                        //             AudioCtrl.getInstance().stopAll();
                        //             cc.game.restart();
                        //         }
                        //     });
                        // }
                    } catch (error) {

                    }
                }
            };
            xhr.timeout = 20000;
            xhr.onerror = () => {
                console.log('request onerror');
                cache.hideMask();
                cache.showTipsMsg('当前网络较差,重新选择链路', () => {
                    cc.director.loadScene('Update');//Update
                });
                // if (failCallback) {
                //     failCallback({ message: "网络连接失败", type: GameConfig.ErrorType.Questerror })
                // } else {
                //     cache.showTipsMsg('网络连接失败', () => {
                //         if (cc.director.getScene().name == db.getTableScene()) {
                //             cc.director.loadScene('Update');
                //         }
                //     });
                // }
            };
            xhr.ontimeout = () => {
                console.log('request ontimeout' + method);
                cache.hideMask();
                cache.showTipsMsg('当前网络较差,重新选择链路', () => {
                    cc.director.loadScene('Update');//Update
                });
                // if (failCallback) {
                //     failCallback({ message: "当前网络较差,请稍后再试", type: GameConfig.ErrorType.Timeout })
                // } else {
                //     cache.showTipsMsg('当前网络较差,请稍后再试', () => {
                //         if (cc.director.getScene().name == db.getTableScene()) {
                //             cc.director.loadScene('Update');//Update
                //         }
                //     });
                // }
            };
            xhr.send(JSON.stringify(data));
        } catch (ex) {
            console.log("请求出错: ", JSON.stringify(ex));
            cache.hideMask();
            cache.showTipsMsg(ex.message);
        }
    },
    /**get 请求 */
    get(method, data, callback, mask, failCallback) {
        if (!mask)
            cache.showMask("正在加载...请稍后");
        try {
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.open("GET", method, true);
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.setRequestHeader("contentType", "text/html;charset=uft-8"); //指定发送的编码
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
            xhr.onreadystatechange = () => {

                if (xhr.status == 404) {
                    cache.hideMask();
                    if (failCallback)
                        failCallback()
                    // cache.alertTip('加载失败');
                }
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                    let response = xhr.responseText;
                    cache.hideMask();
                    let resData;
                    try {
                        console.log(method + "=>", response);

                        resData = JSON.parse(response);
                        if (resData && callback)
                            callback(resData);
                        else {
                            cache.showTipsMsg(resData.message, () => {
                                if (resData.restart) {
                                    AudioCtrl.getInstance().stopAll();
                                    cc.game.restart();
                                }
                            });
                        }
                    } catch (ex) {
                        if (failCallback) {
                            failCallback({ message: ex.message })
                        } else {
                            cache.showTipsMsg(ex.message);

                        }
                        //错误弹窗
                        cache.hideMask();
                    }
                }
            };
            xhr.timeout = 20000;
            xhr.onerror = () => {
                console.log('request onerror');
                cache.hideMask();
                if (failCallback) {
                    failCallback({ message: "网络连接失败" })
                }
                else {
                    if (cc.director.getScene().name == db.getTableScene()) {
                        cache.showTipsMsg('网络连接失败', () => {
                            cc.director.loadScene('Login');
                        });
                    }

                }

            };
            xhr.ontimeout = () => {
                console.log('request ontimeout get ' + method);
                cache.hideMask();
                if (failCallback) {
                    failCallback({ message: "当前网络较差" })
                } else {
                    cache.alertTip('当前网络较差');
                }

            };
            // data["version"] = cc.gameVersion;
            // data.areaCode = "00";
            xhr.send(JSON.stringify(data));
        } catch (ex) {
            cache.hideMask();
            if (failCallback) {
                failCallback({ message: ex.message })
            } else {
                cache.showTipsMsg(ex.message);

            }
        }
    },

    commitError(data, type) {
        try {
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.open("POST", this.logicUrl + type, true);
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.setRequestHeader("contentType", "text/html;charset=uft-8"); //指定发送的编码
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
            xhr.timeout = 10000;
            data.version = cc.gameVersion || GameConfig.DefaultVersion;
            data.gameType = db.gameType;
            xhr.send(JSON.stringify(data).replace("\n", "\t"));
        } catch (ex) {
            console.log(ex);
        }
    },

    connect(data, callback) {

        console.log('socket: ', this._socket, data);
        cache.showMask("正在连接..请稍后...");
        if (!utils.isNullOrEmpty(data) && !utils.isNullOrEmpty(data.data))
            data.data.location = cache.location;

        let userToken = utils.getValue(GameConfig.StorageKey.UserToken, "");
        if (!utils.isNullOrEmpty(userToken)) {
            let encryptToken = utils.encryptToken(userToken);
            data.data.token = encryptToken;
        }
        data.data.version = cc.gameVersion || GameConfig.DefaultVersion;

        //TODO 长链接传入clubID
        data.data.clubID = App.Club.CurrentClubID;

        this.gameStart = false;
        this._status = GameConfig.ConnectState.CONNECTING;
        this.offline = false;
        GameConfig.GameConnectData = data;
        try {
            if (this._socket != null) {
                console.log('_socket存在，断开前面的连接');
                this.disconnectStatus = true;
                //TODO
                this.clearSchedule();
                this._socket.close();

                this._socket = null;
            }
        } catch (ex) {
            cache.hideMask();
        }
        try {

            let userToken = utils.getValue(GameConfig.StorageKey.UserToken, "")
            let encryptToken = utils.encryptToken(userToken);
            this.ts = utils.getTimeStamp();
            this._socket = new WebSocket(data.url);
        } catch (error) {
            cache.hideMask();
            console.log("_socket new WebSocket error ", error)
        }

        if (!this._socket) {
            cache.showTipsMsg("连接异常，请重新登录", () => {
                cc.director.loadScene("Login");
            })
            return;
        }

        //socket 连接成功
        this._socket.onopen = (event) => {
            console.log("_socket connect success");
            db.connectInfo = data.data;
            if (this._socket != null) {
                console.log("_socket CS_CONNECT_INIT", data.data);
                this.emit(PACK.CS_CONNECT_INIT, data.data);
            }
            let durTime = ((utils.getTimeStamp() - this.ts) / 1000).toFixed(2);
            this.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.SOCKET_LINK_SUCCESS, times: durTime })
            this._status = GameConfig.ConnectState.CONNECTED;
            if (this.pingSchedule == null)
                this.createSchedule();
        };

        let onPong = (data) => {
            let jsonData
            if (typeof (data) == "string")
                jsonData = JSON.parse(data);
            else
                jsonData = data;
            this._pong(jsonData)
        };
        let onEnterRoom = () => {
            console.log("服务器返回进入房间")
            cache.hideMask();
            this._queueChatMsg = [];
            this._queueGameMsg = [];
            let durTime = ((utils.getTimeStamp() - this.ts) / 1000).toFixed(2);
            this.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.SOCKET_LINK_ENTER, times: durTime })
            this._retryTime = 0
            if (callback)
                callback();

        };
        let onGameDestory = () => {
            console.log("SC_GAME_DESTORY----", data);
            this._queueChatMsg = [];
            this._queueGameMsg = [];
            this.disconnect();
        };
        let onServerNotice = (data) => {
            console.log("SC_SERVER_NOTICE----", data);
            // Queue.push({ route: ROUTE.SC_SYSTEM_NOTICE, data: data });

            this._queueGameMsg.push({ route: ROUTE.SC_SYSTEM_NOTICE, data: data });

        };
        let onGameMessage = (data) => {
            // console.log("SC_GAME_MESSAGE----", data);
            let jsonData;
            if (typeof (data) == "string")
                jsonData = JSON.parse(data);
            else
                jsonData = data;
            if (data && data.route == ROUTE.SC_RECONNECT && data.data.isDone) {
                cache.showTipsMsg('房间已被解散', () => {
                    cc.director.loadScene('Lobby');
                });
            }
            if (!this.gameStart && (jsonData.route != ROUTE.SC_GAME_DATA && jsonData.route != ROUTE.SC_JOIN_TABLE && jsonData.route != ROUTE.SC_RECONNECT))
                return;
            this.gameStart = true;
            this._queueGameMsg.push(jsonData);
            // Queue.push(data);

        };
        let onGameVoice = (data) => {
            let jsonData;
            if (typeof (data) == "string")
                jsonData = JSON.parse(data);
            else
                jsonData = data;
            this._queueChatMsg.push(jsonData);
        };
        let onJoinError = (data) => {
            cache.hideMask();
            GameConfig.IsConnecting = false;
            this._queueChatMsg = [];
            this._queueGameMsg = [];
            let jsonData;
            if (typeof (data) == "string")
                jsonData = JSON.parse(data);
            else
                jsonData = data;
            console.log("长链接报错----", jsonData)
            let durTime = ((utils.getTimeStamp() - this.ts) / 1000).toFixed(2);
            this.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.SOCKET_LINK_FAIL, reson: jsonData.msg, times: durTime })

            cache.showTipsMsg(jsonData.msg, () => {
                this.disconnect();
            });
        };


        //事件监听
        this._socket.onmessage = (event) => {
            // cache.hideMask();
            let pack = JSON.parse(event.data).pack;
            let data = JSON.parse(event.data).data;
            switch (pack) {
                case PACK.SC_PONG:
                    onPong(data);
                    break;
                case PACK.SC_ENTER_ROOM:
                    onEnterRoom();
                    break;
                case PACK.SC_GAME_DESTORY:
                    onGameDestory();
                    break;
                case PACK.SC_SERVER_NOTICE:
                    onServerNotice(data);
                    break;
                case PACK.SC_GAME_MESSAGE:
                    onGameMessage(data);
                    break;
                case PACK.SC_GAME_VOICE:
                    onGameVoice(data);
                    break;
                case PACK.SC_JOIN_ERROR:
                    onJoinError(data);
                    break;
                default:
                    console.log("未知信息---" + pack + "   " + data)
                    break;
            }


        };
        this._socket.onerror = (event) => {
            cache.hideMask();
        };
        this._socket.onclose = (event) => {
            cache.hideMask();

            console.log("WebSocket instance closed", JSON.stringify(event));
            // this._socket = null;
            // cc.game.restart();
            this._status = GameConfig.ConnectState.CLOSED;

            GameConfig.IsConnecting = false;
            console.log("111",cc.director.getScene().name);
            let a=[
                'Lobby',
                'Update',
                'Login'

            ]
            if(a.indexOf(cc.director.getScene().name)==-1){
            cc.director.loadScene("Lobby");

            }

            // if (!this.disconnectStatus) {
            //     console.log("WebSocket reconnect");
            //     // cache.showTipsMsg("与服务器断开连接", () => {
            //     this._reconnect();
            // }
            this.disconnectStatus = false;
        };
    },


    /**断开连接 */
    disconnect(jumpScene = true) {
        console.log("--checkOnline-------手动断开连接,disconnect")
        if (jumpScene)
            cc.director.loadScene("Lobby");
        this.disconnectStatus = true;
        db.data = null;
        if (this._socket != null) {
            this._socket.close();
            this._socket = null;
        }

        this._status = GameConfig.ConnectState.CLOSED;
    },


    /**创建定时器 */
    createSchedule() {
        console.log("--checkOnline-------createSchedule", this._status);
        if (this.pingSchedule)
            clearInterval(this.pingSchedule);
        this.times = 0;
        this.pingSchedule = setInterval(() => {
            switch (this._status) {
                case GameConfig.ConnectState.CLOSED:
                    this.clearSchedule();
                    break;
                case GameConfig.ConnectState.CONNECTING:
                    break;
                case GameConfig.ConnectState.CONNECTED:
                    this._ping();
                    this.times++;
                    break;
                case GameConfig.ConnectState.DISCONNECTED:
                    this._reconnect();
                    break;
            }
        }, 2000)
    },

    /**清除定时器 */
    clearSchedule() {
        console.log("--checkOnline-------clearSchedule")
        if (this.pingSchedule)
            clearInterval(this.pingSchedule);
        this.pingSchedule = null;
        this.times = 0;
    },

    /**发送ping */
    _ping() {
        // console.log("ping-----", this.times)
        if (this.times > 5) {
            this._reconnect();
            return;
        }
        let time = new Date().getTime();
        this.emit(PACK.CS_PING, { time: time });
        setTimeout(()=>{

        },4000)
    },
    /**连接出错 */
    connectError() {
        console.log("--checkOnline-------conectError")

        cache.hideMask();
        this.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.SOCKET_LINK_ERROR })

        this._status = GameConfig.ConnectState.CLOSED;
        this._retryTime = 0
        this.disconnectStatus = true;
        if (this._socket) {
            this._socket.close();
        }
        let data = { time: new Date().getTime() };
        this._pong(data)
        App.unlockScene();
        cache.showTipsMsg("连接出错", () => {
            cc.director.loadScene("Update");
        });
        // (100/x)+(x-2) min x2-2x+100
    },

    _pong(data) {
        // console.log("pong-----", data)
            
        //TODO
        this.times = 0;

        let ping = 0;
        if (data.time)
            ping = new Date().getTime() - data.time;

        this._pingArr.unshift(ping);
        this._pingArr.splice(10);
        let contain = cc.find('Canvas/nodeSignal');
        let pingValue = Math.floor(this._pingArr.reduce((a, b) => a + b) / this._pingArr.length);
        if (contain) {
            if (pingValue >= 0) {
                contain.getChildByName("signal").getComponent(cc.Sprite).spriteFrame = GameConfig.WiFiSprite[3];
                contain.getChildByName("ping").color = new cc.color(130, 255, 0, 255);//绿
            }
            if (pingValue >= 100) {
                contain.getChildByName("signal").getComponent(cc.Sprite).spriteFrame = GameConfig.WiFiSprite[2];
                contain.getChildByName("ping").color = new cc.color(255, 174, 0, 255);//黄
            }
            if (pingValue >= 300) {
                contain.getChildByName("signal").getComponent(cc.Sprite).spriteFrame = GameConfig.WiFiSprite[1];
                contain.getChildByName("ping").color = new cc.color(255, 0, 0, 255);//红
            }

            contain.getChildByName("ping").getComponent(cc.Label).string = pingValue + "ms";
        }

    },
    /**重新连接 */
    _reconnect() {
        console.log('socket reconnect')
        if (this._retryTime >= RETRY_INTERVAL.length) {
            this.connectError();
            return;
        }
        this._status = GameConfig.ConnectState.CONNECTING;
        this._retryTime++;
        this.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.SOCKET_LINK_RECONNECT, retryTime: this._retryTime })
        this.connect(GameConfig.GameConnectData, () => {
            GameConfig.CurrentGameType = GameConfig.GameConnectData.data.gameType;
            db.setGameType(db.GAME_TYPE[GameConfig.GameConnectData.data.gameType]);
            let durTime = ((utils.getTimeStamp() - this.ts) / 1000).toFixed(2);
            this.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.START_ENTER_SCENE, gametype: GameConfig.GameConnectData.data.gameType, times: durTime })
            cc.director.loadScene(db.TABLE_TYPE[GameConfig.GameConnectData.data.gameType]);
        });
    },


    LogsClient(event, data) {
        if (cc.sys.isBrowser)
            return;
        let failArr = utils.getValue(GameConfig.StorageKey.LogsClientFail, []);
        let options = failArr.length > 0 ? {
            deviceID: GameConfig.DeviceID,
            id: db.player.id,
            event,
            data,
            failCount: failArr.length,
            failLogs: failArr,
        } : {
            deviceID: GameConfig.DeviceID,
            id: db.player.id,
            event,
            data
        }

        this.request(GameConfig.ServerEventName.LogsClient, options, (res) => {
            utils.saveValue(GameConfig.StorageKey.LogsClientFail, [])
        }, null, (err) => {
            let failData = { event, data };
            failArr.push(failData);
            utils.saveValue(GameConfig.StorageKey.LogsClientFail, failArr)
        })
    }
};

