let db = require("DataBase");
let ROUTE = require("ROUTE");
let PACK = require("PACK");
let cache = require("Cache");
let connect_status = {
    closed:0,
    connecting:1,
    connected:2,
    closing:3
};
let SocketCtrl = cc.Class({
    name: 'SocketCtrl',

    properties: {
        logicUrl : "http://test.lalazvu.cn:8000/",
  
        status:null,
        _socket: null,
        _queueGameMsg:[],
        _queueChatMsg:[],
    },

    statics: {
        _instance: null,

        getInstance() {
            //cc.log('getInstance AudioCtrl');
            if (!this._instance) {
                this._instance = new SocketCtrl();
            }
            return this._instance;
        }
    },

    emit(route, data){
        cc.log(route, data);
        if(this._socket == null)
            return;
        this._socket.emit(route,data);
    },

    gameMessage (route,data) {
        this.emit(PACK.CS_GAME_MESSAGE, {route: route, data: data});
    },

    connect(data,callback){
        cc.log('调用长连接CONNECTING',data);
        this.status = connect_status.connecting;
        cache.showMask("正在连接..请稍后...");
        try{
            if(this._socket != null){
                cc.log('_socket存在，断开前面的连接');
                this._socket.disconnect();
                this._socket = null;
            }
        } catch (ex){
            cc.log(ex);
        }
        
        if (cc.sys.isNative){
            this._socket = SocketIO.connect(data.url, {
                "force new connection": true,
                "reconnection": false
            });
        }else{
            this._socket = io(data.url, {
                "force new connection": true,
                "reconnection": false
            });
        }

        this._socket.on("connect",()=>{
            db.connectInfo = data.connectInfo;
            cc.log("_socket connect success",db.connectInfo);
            if(this._socket!=null){
                this._socket.emit(PACK.CS_CONNECT_INIT,data.connectInfo);    
            }
        });

        this._socket.on("error",()=>{
            this.status = connect_status.closed;
            cache.showTipsMsg("网络连接失败",()=>{
                if(cc.director.getScene().name == db.getTableScene()){
                    console.log("跳转登陆---------------2")
                    cc.director.loadScene("Login");       
                }
            })
        });

        this._socket.on(PACK.SC_PONG,(msg)=>{
            
        });

        this._socket.on("disconnect",()=>{
            this._socket = null;
            this.status = connect_status.closed;
            cc.log('disconnect closed');
        });

        this._socket.on(PACK.SC_ENTER_ROOM,()=>{
                cc.log('connected');
                this._queueChatMsg = [];
                this._queueGameMsg = [];
                callback();
            if(this.status == connect_status.connected)
                return;
            this._socket.on(PACK.SC_GAME_DESTORY,()=>{
                cc.log("PACK.SC_GAME_DESTORY");
                this._queueChatMsg = [];
                this._queueGameMsg = [];
                this.disconnect();
            });

            this._socket.on(PACK.SC_SERVER_NOTICE,data=>{
                this._queueGameMsg.push({route:ROUTE.SC_SYSTEM_NOTICE, data:data});
            });

            this._socket.on(PACK.SC_GAME_MESSAGE,(data)=>{
                cc.log("PACK.SC_GAME_MESSAGE",data);
                let jsonData;
                if (typeof(data) == "string")
                    jsonData = JSON.parse(data);
                else
                    jsonData = data;
                if(data && data.route == ROUTE.SC_RECONNECT && data.data.isDone){
                    cache.showTipsMsg('房间已被解散',()=>{
                        cc.director.loadScene('Lobby');
                    });
                }
                this._queueGameMsg.push(jsonData);
                cc.log(this._queueGameMsg);
            });

            this._socket.on(PACK.SC_GAME_VOICE,(data)=>{
                cc.log("PACK.SC_GAME_VOICE",data);
                let jsonData;
                if (typeof(data) == "string")
                    jsonData = JSON.parse(data);
                else
                    jsonData = data;
                this._queueChatMsg.push(jsonData);
            });
                
            this.status = connect_status.connected;
        });

        this._socket.on(PACK.SC_JOIN_ERROR,(data)=>{
            this._queueChatMsg = [];
            this._queueGameMsg = [];
            let jsonData;
            if (typeof(data) == "string")
                jsonData = JSON.parse(data);
            else
                jsonData = data;
            cache.showConfirm(jsonData.msg, ()=>{
                this.disconnect();
            });
            cache.hideMask();
        });

    },

    disconnect(){
        cc.log('手动断开连接,disconnect');
        this.status = connect_status.closing;
        cc.director.loadScene("Lobby");
        db.connectInfo = null;
        if(this._socket!=null){
	        this._socket.disconnect();
	        this._socket = null;
	    }
        this.status = connect_status.closed;
    },

    request  (method, data, callback, mask) {
        cc.log('调用短连接',this.logicUrl + method);
        let reqType = data=="getJson"?"GET":"POST";
        if (!mask)
            cache.showMask("正在加载...请稍后");
        try {
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.open(reqType, this.logicUrl + method, true);
            xhr.setRequestHeader("cache-control", "no-cache");
            xhr.setRequestHeader("contentType", "text/html;charset=uft-8"); //指定发送的编码
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
            xhr.onreadystatechange = () => {
                if(xhr.status == 404){
                    cache.hideMask();
                    cache.showTipsMsg('加载失败');
                }
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                    let response = xhr.responseText;
                    cache.hideMask();
                    let resData;
                    try {
                        cc.log("response=>" + response);
                        resData = JSON.parse(response);
                        if (resData.success && callback)
                            callback(resData);
                        else {
                            cache.showTipsMsg(resData.message, () => {
                                if (resData.restart)
                                    cc.game.restart();
                            });
                        }
                    } catch (ex) {
                        cc.error(ex);
                        cc.error(ex.message); //错误弹窗
                        cache.showTipsMsg(ex.message);
                        cache.hideMask();
                    }
                }
            };
            xhr.timeout = 10000;
            xhr.onerror = () => {
                cc.log('request onerror');
                cache.hideMask();
                cache.showTipsMsg('网络连接失败', () => {
                    if (cc.director.getScene().name == db.getTableScene()) {
                        console.log("跳转登陆---------------10")
                        cc.director.loadScene('Login');
                    }
                });
            };
            xhr.ontimeout = () => {
                cc.log('request ontimeout');
                cache.hideMask();
                cache.showTipsMsg('网络连接超时', () => {
                    if (cc.director.getScene().name == db.getTableScene()) {
                        console.log("跳转登陆---------------11")
                        cc.director.loadScene('Login');
                    }
                });
            };
            data.version = cc.gameVersion;
            data.areaCode = "00";
            xhr.send(JSON.stringify(data));
        } catch (ex) {
            cc.log(ex);
            cache.hideMask();
            cache.showTipsMsg(ex.message);
        }
    },
});

module.exports = SocketCtrl.getInstance();