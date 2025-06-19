import { GameConfig } from "../../GameBase/GameConfig.js";
import { App } from "../../script/ui/hall/data/App.js";
import Cache from "../Script/Cache.js";
import utils from "../Script/utils.js";
import { GoEasyConfig } from "./GoEasyConfig.js";

var GoEasyIM = require("./goeasy-im-1.5.0.js");
// var GoEasyIM = require("./goeasy-1.2.0");

const OPTIONS = {

    host: "hangzhou.goeasy.io",
    appkey: "BC-4f1c9643b2024be784f7a32891755ed3"
}
const EVENT = {
    CONNECTING: "CONNECTING",
    CONNECTED: "CONNECTED",
    CONNECTING_ERROR: "CONNECTING_ERROR",
    DISCONNECTED: "DISCONNECTED",
    PRIVATE_MESSAGE: "PRIVATE_MESSAGE",
    PUBLIC_MESSAGE: "PUBLIC_MESSAGE",
    GROUP_MESSAGE: "GROUP_MESSAGE",
    PRIVATE_IS_READED: "PRIVATE_IS_READED",
    GROUP_IS_READED: "GROUP_IS_READED",
}

const IM_STATUS = {
    CONNECTED: "connected"
}

export class GoEasy {
    
    static _instance = null;

    static getInstance() {
        if (this._instance == null)
            this._instance = new GoEasy();
        return this._instance;
    }
    static user = null;
    static callBack = null;
    static get eventEnum() {
        return EVENT;
    }
    /**邮件消息队列 */
    static _queueMailMsg = [];
    /**客服未读消息数 */
    static _serviceUnreadCount = 0;

    static get serviceUnreadCount() {
        return this._serviceUnreadCount;
    }

    static _OTPKey = null;

    /**建立连接 */
    static establish(u, c) {

        this.user = u;//{ id: 100001, name: "起飞", avatar: "" }
        this.callBack = c;
        if (this.im) {
            return;
        } else {
            this.im = GoEasyIM.getInstance(OPTIONS);
        }
        let user = {
            id: this.user.id + "",//this.user.id
            otp: this._OTPKey,
            data: JSON.stringify({ id: this.user.id, name: this.user.name, phone: this.user.phone || "未绑定手机" }),
            forceTLS: cc.sys.os != cc.sys.OS_ANDROID
        };
        this.listener();
        this.im.connect(user).then(() => {
            // console.log("Connection successful.");
            //连接成功

        }).catch((error) => {
            console.log("err", error)
            this.callBack(EVENT.CONNECTING_ERROR, error);
        });
    }

    /**监听 */
    static listener() {
        //listening the status of connection
        let onConnecting = (count) => {
            this.callBack(EVENT.CONNECTING, { count });

            Cache.alertTipRightBottom("推送服务连接中");

        };

        let onConnected = () => {
            //隐藏右下角提示
            Cache.hideTipRightBottom("连接成功");

            this.callBack(EVENT.CONNECTED, {});
            //连接成功 重连成功

            //1.重置消息队列
            this._queueMailMsg = [];
            this._serviceUnreadCount = 0;
            // this.latestConversations();

            GoEasyConfig.Group.forEach((e) => {
                this.unsubscribe(e)
            })
            //订阅消息
            this.subscribeGroup(GoEasyConfig.Group)

            //2. 获取历史消息
            // this.history()

        };

        let onDisConnected = () => {

            Cache.hideTipRightBottom("断开推送服务");
            this.alertTips = false;
            this.callBack(EVENT.DISCONNECTED, {});
        };
        //单对单消息
        let onPrivateMessageReceived = (message) => {
            console.log("onPrivateMessageReceived: ", message)
            if (message.senderId == this.user.id + "") {
                // this.markPrivateAsRead(message.senderId);
                return;
            }
            let msg = JSON.parse(message.payload.text)

            //客服消息
            if (message.senderId == GoEasyConfig.ServiceID) {
                this._serviceUnreadCount++;
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GOEASY_UPDATE_SERVICE, message);
                return;
            }

            //服务器私发消息  
            if (message.senderId == GoEasyConfig.ServerID) {
                //刷新金币
                if (msg.type == GoEasyConfig.MessageType.RECHARGE)
                    App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GOEASY_UPDATE_GOLD);
                let localMsg = utils.getValue(GameConfig.StorageKey.EmaliMsg, []);
                if (localMsg.findIndex(e => e.messageId == message.messageId) == -1) {
                    msg.messageId = message.messageId;
                    this._queueMailMsg.unshift(msg);
                    this.playMailTips();
                    App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GOEASY_UPDATE_MAIL);
                }
            } else {
                switch (msg.type) {
                    case GoEasyConfig.MessageType.TRADE: //交易刷新
                        //已读
                        this.markPrivateAsRead(message.senderId);
                        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GOEASY_UPDATE_TRADE, message);
                        break;
                    case GoEasyConfig.MessageType.PRIVATE: //交易私聊
                        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GOEASY_UPDATE_TRADE, message);
                        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GOEASY_UPDATE_PRIVATE, message);
                        break;
                    case GoEasyConfig.MessageType.SERVICE: //客服
                        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GOEASY_UPDATE_SERVICE, message);
                        break;
                }
            }
        };
        //群消息
        let onGroupMessageReceived = (message) => {
            console.log("onGroupMessageReceived: ", message)

            let msg = JSON.parse(message.payload.text)
            //刷新金币
            if (msg.type == GoEasyConfig.MessageType.RECHARGE)
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GOEASY_UPDATE_GOLD);

            let localMsg = utils.getValue(GameConfig.StorageKey.EmaliMsg, []);
            if (localMsg.findIndex(e => e.messageId == message.messageId) == -1) {
                msg.messageId = message.messageId;
                this._queueMailMsg.unshift(msg);
                this.playMailTips();
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GOEASY_UPDATE_MAIL);
            }

        };
        //listening group message
        this.im.on(GoEasyIM.EVENT.GROUP_MESSAGE_RECEIVED, onGroupMessageReceived);

        //GoEasyIM has been connected
        this.im.on(GoEasyIM.EVENT.CONNECTED, onConnected);
        //GoEasyIM is connecting
        this.im.on(GoEasyIM.EVENT.CONNECTING, onConnecting);
        //GoEasy has been disconnected
        this.im.on(GoEasyIM.EVENT.DISCONNECTED, onDisConnected);
        //listening private message
        this.im.on(GoEasyIM.EVENT.PRIVATE_MESSAGE_RECEIVED, onPrivateMessageReceived);
    }

    static disconnect() {
        if (typeof this.im == "undefined") return;

        if (this.im.getStatus() != IM_STATUS.CONNECTED) return;
        this.im.disconnect().then(() => {
            this.im = null;
            console.log("Disconnection successful.");
        }).catch((error) => {
            console.log("Failed to disconnect GoEasy, code:" + error.code + ",error:" + error.content);
        });

    }
    /**发送消息 
     * @param msg 消息内容
     * @param type 群聊group 私聊private
     * @param sendId 群ID/玩家ID
     * @param self 自身信息
    */
    static sendMessage(msg, type, sendId, self) {
        if (typeof this.im == "undefined") return;
        if (this.im.getStatus() != IM_STATUS.CONNECTED) return;

        let textMessage = this.im.createTextMessage({
            text: JSON.stringify(msg), //消息内容
            to: {
                type: type == GoEasyConfig.ChatType.GROUP ? GoEasyIM.SCENE.GROUP : GoEasyIM.SCENE.PRIVATE,   //私聊还是群聊，私聊为GoEasyIM.SCENE.PRIVATE
                id: sendId,
                data: JSON.stringify({ id: self.id, name: self.name, phone: self.phone || "未绑定手机" }) //群信息, 任意格式的字符串或者对象，用于更新会话列表中的群信息conversation.data
            }
        });
        //发送消息
        this.im.sendMessage(textMessage).then((message) => {
            console.log("Send " + type + " message successfully.", message);
            console.log("Send textMessage message successfully.", textMessage);
        }).catch((error) => {
            console.log("Failed to send Message, code:" + error.code + " content:" + error.content);
        });

    }


    /**订阅群消息
     * @param group 群id(arr) ["group001",...]
     */
    static subscribeGroup(group) {
        if (typeof this.im == "undefined") return;
        if (this.im.getStatus() != IM_STATUS.CONNECTED) return;
        //订阅群消息
        this.im.subscribeGroup(group).then(() => {
            // console.log("Group message subscribe successfully.");

        }).catch((error) => {
            console.log("Failed to subscribe group message, code:" + error.code + " content:" + error.content);
        });
    }

    /**取消订阅群
     * @param group 群id group001
     * 
     */
    static unsubscribe(group) {
        if (typeof this.im == "undefined") return;
        if (this.im.getStatus() != IM_STATUS.CONNECTED) return;

        //取消订阅群聊消息
        this.im.unsubscribeGroup(group).then(() => {
            // console.log("Group message unsubscribe successfully.");
        }).catch((error) => {
            console.log("Failed to unsubscribe group message, code:" + error.code + " content:" + error.content);
        });
    }

    /**历史消息 
     *  查询群历史消息
    */
    static history(groupId) {
        return
        let option = {
            groupId: groupId, //groupId
            lastTimestamp: new Date().getTime(),  //查询发送时间小于（不包含）该时间的历史消息，可用于分页和分批拉取聊天记录，默认为当前时间
            limit: 30 //可选项，返回的消息条数，默认为10条，最多30条
        }
        //查询
        if (this.im.getStatus() != IM_STATUS.CONNECTED) return;
        this.im.history(option).then((result) => {
            console.log("-----history----", result)
            //群聊历史消息result示例
            result.content.forEach(element => {
                this._queueMailMsg.unshift(JSON.stringify(element.payload.text));
            });

            console.log("Query group chat history successfully, result:\n " + JSON.stringify(result));
        }).catch((error) => {
            console.log("Failed to query group message, code:" + error.code + " content:" + error.content);
        });

    }


    /**标记群消息为已读 */
    static markGroupAsRead(groupId) {
        if (typeof this.im == "undefined") return;
        if (this.im.getStatus() != IM_STATUS.CONNECTED) return;
        this.im.markGroupMessageAsRead(groupId).then((result) => {
            this._queueMailMsg = [];
            console.log(" markGroupAsRead ", result)
        }).catch((error) => {
            console.log("Failed to mark as read, code:" + error.code + " content:" + error.content);
        });
    }
    /**标记私聊消息为已读 
     * @param id 对方id
    */
    static markPrivateAsRead(id) {
        if (typeof this.im == "undefined") return;
        if (this.im.getStatus() != IM_STATUS.CONNECTED) return;

        this.im.markPrivateMessageAsRead('' + id).then(function (result) {
        }).catch(function (error) {
            console.log("Failed to mark as read, code:" + error.code + " content:" + error.content);
        });
    }

    static markServiceAsRead() {
        if (typeof this.im == "undefined") return;
        if (this.im.getStatus() != IM_STATUS.CONNECTED) return;
        this._serviceUnreadCount = 0;
        this.markPrivateAsRead(GoEasyConfig.ServiceID)
    }

    /**获得最新会话列表 */
    static latestConversations() {
        if (typeof this.im == "undefined") return;
        if (this.im.getStatus() != IM_STATUS.CONNECTED) return;
        this.im.latestConversations().then(function (result) {
            //会话列表结果
            console.log("latestConversations-----------", result)

        }).catch(function (error) {
            console.log("Failed to get the latest conversations, code:" + error.code + " content:" + error.content);
        });

    }

    /**私聊历史记录 */
    static privateHistory(id) {
        return new Promise((resolve, rejects) => {

            if (this.im.getStatus() != IM_STATUS.CONNECTED) {
                rejects("disconnect" + this.im.getStatus());
            } else {
                var option = {
                    friendId: id,  //对方userId
                    lastTimestamp: Date.now(), //查询发送时间小于（不包含）该时间的历史消息，可用于分页和分批拉取聊天记录，默认为当前时间
                    limit: 30 //可选项，返回的消息条数，默认为10条，最多30条
                }
                //查询
                this.im.history(option).then((result) => {
                    resolve(result);
                }).catch((error) => {
                    rejects(error);
                });
            }

        })
    }

    static lastPlayTime = 0;
    static playMailTips() {
        let nowTime = new Date().getTime();
        if (nowTime - this.lastPlayTime < 3000) return;
        this.lastPlayTime = nowTime;

        Cache.playSound("mailTips")


    }
}