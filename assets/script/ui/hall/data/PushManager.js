
import { GameConfig } from "../../../../GameBase/GameConfig";
import Cache from "../../../../Main/Script/Cache";
import PACK from "../../../../Main/Script/PACK";
import GameUtils from "../../../common/GameUtils";
import { App } from "./App";

export class PushManager {
    static _instance = null;
    static getInstance() {
        if (!this._instance)
            this._instance = new PushManager();
        return this._instance;
    }
    constructor() {
        this._socket = null;
        this._status = '';
        this._times = 0;
        this._retryTime = 0;
        this._msgQueue = [];
        this._pingSchedule = null;
    }
    connect() {
        if (cc.sys.isBrowser)
            return;
        this._times = 0;
        if (this._socket != null) {
            console.log('_socket存在，断开前面的连接');
            this._socket.close();
            this._socket = null;
        }
        try {

            if (this._pingSchedule)
                clearInterval(this._pingSchedule);
            this.schedulePing();
            let userToken = GameUtils.getValue(GameConfig.StorageKey.UserToken, "")
            let encryptToken = GameUtils.encryptToken(userToken);
            if (cc.director.getScene().name == 'Lobby')
                Cache.alertTipRightBottom("推送服务连接中");

            this._socket = new WebSocket(GameConfig.NoticeUrl + "?token=" + encodeURIComponent(encryptToken));
            this._status = GameConfig.ConnectState.CONNECTING;
            //事件监听
            //socket 连接成功
            this._socket.onopen = (event) => {
                Cache.hideTipRightBottom("连接成功");
                this._status = GameConfig.ConnectState.CONNECTED;
                this._retryTime = 0;//重连次数重置

            };
            this._socket.onmessage = (event) => {
                // console.log('onmessage--1', event);

                let pack = JSON.parse(event.data).pack;
                let data = JSON.parse(event.data).data;
                if (pack != PACK.SC_PONG)
                    console.log('onmessage--', pack, data);
                let jsonData = typeof (data) == "string" ? JSON.parse(data) : data;
                switch (pack) {
                    case PACK.SC_PONG:
                        this.getPong();
                        break;
                    case 'CARD':
                        // Cache.alertTipPop('公会ID:' + jsonData.clubID + '\n' + GameUtils.formatGold(jsonData.delta) + '体力')
                        // if (jsonData.clubID == App.Club.CurrentClubID) {
                        //     console.log('赋值体力')
                        //     App.Club.ClubScore = jsonData.score;
                        // }
                        break;
                    case 'SCORE':
                        Cache.alertTipPop('公会ID:' + jsonData.clubID + '\n' + GameUtils.formatGold(jsonData.delta) + '体力')
                        if (jsonData.clubID == App.Club.CurrentClubID) {
                            console.log('赋值体力')
                            App.Club.ClubScore = jsonData.score;
                        }
                        break;
                    case 'CLUB':
                        console.log("--加入公会--", jsonData);
                        Cache.alertTipPop('\n ' + jsonData.name + '邀请您已加入\n公会:' + jsonData.clubID)
                        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_HALL_CLUB);
                        break;
                    default:
                        console.log("未知信息---" + pack + "   " + data)
                        break;
                }


                // this.gameStart = true;
                // this._queueGameMsg.push(jsonData);
            };
            this._socket.onerror = (event) => {
                this._status = GameConfig.ConnectState.CLOSED;
            };
            this._socket.onclose = (event) => {
                this._status = GameConfig.ConnectState.CLOSED;
                // this.reconnect()
                console.log('onclose--');
            };
        } catch (error) {
            console.log('--rrr--', error)
        }

    }
    reconnect() {
        if (this._retryTime >= 3) {
            this.connectError();
            return;
        }
        this._status = GameConfig.ConnectState.CONNECTING;
        this._retryTime++;
        this.connect();
    }

    connectError() {
        this._status = GameConfig.ConnectState.CLOSED;
        this._retryTime = 0;
        this.clearSchedule();

        setTimeout(() => {
            this.connect();
        }, 5000)

    }
    schedulePing() {
        this._pingSchedule = setInterval(() => {
            if (this._status != GameConfig.ConnectState.CONNECTING)
                this.sendPing();

        }, 2000)
    }
    clearSchedule() {
        if (this._pingSchedule)
            clearInterval(this._pingSchedule);
        this._times = 0;
        this._pingSchedule = null;
    }
    sendPing() {
        // console.log("-ping-" + this._times + "-")
        this._times++;
        if (this._times > 5) {
            this.reconnect();
            return;
        }
        let time = new Date().getTime();
        this.emit(PACK.CS_PING, { time: time });
    }
    getPong() {
        // console.log("-pong-")

        this._times = 0;
    }
    /**发送数据 */
    emit(route, data) {
        if (this._socket == null)
            return;
        if (this._socket.readyState == WebSocket.CLOSED)
            return;
        if (this._socket.readyState == WebSocket.CLOSING)
            return;
        let obj = { pack: route, data };
        if (route != "CS_PING")
            console.log(route, data)
        try {
            this._socket.send(JSON.stringify(obj));
        } catch (error) {

        }
    }
    gameMessage(route, data) {
        this.emit(PACK.CS_GAME_MESSAGE, { route: route, data: data });
    }
    disconnect() {
        if (this._socket)
            this._socket.close();
        this._socket = null;
        this._status = '';
        this._retryTime = 0;
        this._msgQueue = [];
        this.clearSchedule();
        Cache.hideTipRightBottom("断开推送服务");

    }
}


