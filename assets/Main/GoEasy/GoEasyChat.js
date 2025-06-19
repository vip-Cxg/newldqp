const DataBase = require("../Script/DataBase")
const Cache = require("../Script/Cache");
const utils = require("../Script/utils");
const { GoEasy } = require("./GoEasy");
const { GameConfig } = require("../../GameBase/GameConfig");
const { App } = require("../../script/ui/hall/data/App");

cc.Class({
    extends: cc.Component,

    properties: {
        msgInput: cc.EditBox,
        sendBtn: cc.Node,
        msgScrollView: cc.ScrollView,
        msgContent: cc.Node,
        msgItem: cc.Prefab,
        systemItem: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {
    //     this.initData("service001",{id:123123123123},"PRIVATE")
    // },

    initData(sendId, tradeData, chatType) {
        this.sendId = sendId;
        this.tradeData = tradeData;
        this.chatType = chatType;
        GoEasy.privateHistory(sendId).then((data) => {
            data.content.forEach(element => {
                this.addChatItem(element)
            });
            this.addEvents();
        }).catch((err) => {
        });
    },

    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.GOEASY_UPDATE_PRIVATE, this.handleChat, this);
    },
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.GOEASY_UPDATE_PRIVATE, this.handleChat, this);
    },
    handleChat(e) {
        this.addChatItem(e.data);
    },
    onClickSend() {
        //
        if (utils.isNullOrEmpty(this.msgInput.string)) {
            Cache.alertTip("消息不能为空");
            return;
        }

        let msgInfo = {
            "title": "私聊",
            "content": this.msgInput.string,
            "type": "PRIVATE",
            "tradeID": this.tradeData.id,
            "timestamp": new Date().getTime()
        }

        let msg = {
            payload: { text: JSON.stringify(msgInfo) },
            receiverId: this.sendId,
            senderId: DataBase.player.id,
        }
        this.addChatItem(msg)
        GoEasy.sendMessage(msgInfo, this.chatType, this.sendId, DataBase.player);
        this.msgInput.string = "";
    },

    addChatItem(msg) {
        //判断是否是对方发送
        if ((msg.senderId == this.sendId || msg.senderId == DataBase.player.id) && JSON.parse(msg.payload.text).tradeID == this.tradeData.id) {

            GoEasy.markPrivateAsRead(this.sendId)
            if (JSON.parse(msg.payload.text).type == "PRIVATE") {

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
        }
    },

    onClickClose() {
        Cache.playSfx();
        this.node.stopAllActions();
        let ap = cc.moveTo(0.3, cc.v2(this.node.parent.width / 2 + this.node.width / 2, 0));
        let bp = cc.sequence(ap, cc.callFunc(() => {
            this.removeEvents();
            if (this.node) {
                this.node.removeFromParent();
                this.node.destroy();
            }
        }))
        this.node.runAction(bp)

    },

    onDestroy() {
        this.removeEvents();
    }
    // update (dt) {},
});
