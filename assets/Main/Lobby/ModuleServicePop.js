const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const dataBase = require("../Script/DataBase");
const utils = require("../Script/utils");
const http = require("SceneLogin");
const { GameConfig } = require("../../GameBase/GameConfig");
const AudioCtrl = require("../Script/audio-ctrl");
const { GoEasy } = require("../GoEasy/GoEasy");

let Native = require("../Script/native-extend"); // require('native-extend');
const { GoEasyConfig } = require("../GoEasy/GoEasyConfig");
const { App } = require("../../script/ui/hall/data/App");
let _social = Native.Social;


cc.Class({
    extends: require("../GoEasy/GoEasyChat"),//cc.Component,

    properties: {
        web: cc.WebView,
        chatRoomNode: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        this.refreshUI();
        _social.serviceImgCallBack = (data) => {
            this.addImgItem(data);
        }


    },
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.GOEASY_UPDATE_SERVICE, this.handleChat, this);

    },
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.GOEASY_UPDATE_SERVICE, this.handleChat, this);
    },
    /**更新UI */
    refreshUI() {
        if (GameConfig.GameInfo.serviceMode) {
            this.web.node.active = false;
            this.chatRoomNode.active = true;
            GoEasy.privateHistory(GoEasyConfig.ServiceID).then((data) => {
                GoEasy.markServiceAsRead();
                data.content.forEach(element => {
                    this.addChatItem(element)
                });
                this.addEvents();
            }).catch((err) => {
                this.addEvents();
            });

        } else {
            this.web.node.active = true;
            this.chatRoomNode.active = false;
            this.web.url = `${GameConfig.GameInfo.customeService}&metadata={"tel":"${dataBase.player.phone}","name":"${dataBase.player.name}","qq":"${dataBase.player.id}","addr":"xyqp"}`//  ;
            console.log(`${GameConfig.GameInfo.customeService}&metadata={"tel":"${dataBase.player.phone}","name":"${dataBase.player.name}","qq":"${dataBase.player.id}","addr":"xyqp"}`)
        }



    },


    addChatItem(msg) {
        if (JSON.parse(msg.payload.text).type == "PRIVATE" || JSON.parse(msg.payload.text).type == "SERVICE") {

            let msgItem = cc.instantiate(this.msgItem);
            msgItem.getComponent("ChatItem").initData(msg);
            this.msgContent.addChild(msgItem);
        } else {
            let msgItem = cc.instantiate(this.systemItem);
            msgItem.getChildByName("word").getComponent(cc.Label).string = "" + JSON.parse(msg.payload.text).content;
            this.msgContent.addChild(msgItem);
        }
        setTimeout(() => {
            this.msgScrollView.scrollToBottom()
        }, 100) 
    },

    onClickSend() {
        //
        if (utils.isNullOrEmpty(this.msgInput.string)) {
            Cache.alertTip("消息不能为空");
            return;
        }

        let msgInfo = {
            "content": this.msgInput.string,
            "contentType": GoEasyConfig.ContentType.TEXT,
            "type": GoEasyConfig.MessageType.SERVICE,
            "timestamp": new Date().getTime()
        }

        let msg = {
            payload: { text: JSON.stringify(msgInfo) },
            receiverId: GoEasyConfig.ServiceID,
            senderId: dataBase.player.id,
        }
        this.addChatItem(msg)
        GoEasy.sendMessage(msgInfo, GoEasyConfig.ChatType.PRIVATE, GoEasyConfig.ServiceID, dataBase.player);
        this.msgInput.string = "";
    },


    // onClickImg() {
    //     Cache.playSfx();
    //     GameConfig.IsDebug ? this.addImgItem("qrcode/b7a22bb0-3ac3-4e4f-be77-564745767f68.jpg") : _social.selectReceipt();
    // },


    addImgItem(data) {
        let msgInfo = {
            // "content":
            "content": GameConfig.GameInfo.resourceURL + data,
            "contentType": GoEasyConfig.ContentType.IMAGE,
            "type": GoEasyConfig.MessageType.SERVICE,
            "timestamp": new Date().getTime()
        }

        let msg = {
            payload: { text: JSON.stringify(msgInfo) },
            receiverId: GoEasyConfig.ServiceID,
            senderId: dataBase.player.id,
        }
        this.addChatItem(msg)
        GoEasy.sendMessage(msgInfo, GoEasyConfig.ChatType.PRIVATE, GoEasyConfig.ServiceID, dataBase.player);
    },


    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        _social.serviceImgCallBack=null;
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
    onDestroy() {
        _social.serviceImgCallBack=null;
        this.removeEvents();
    }
});

