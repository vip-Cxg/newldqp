const DataBase = require("../Script/DataBase");
const utils = require("../Script/utils");
const { GoEasyConfig } = require("./GoEasyConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        otherNode: cc.Node,
        otherMsg: cc.Label,
        otherImg: cc.Sprite,
        selfNode: cc.Node,
        selfMsg: cc.Label,
        selfImg: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    initData(data) {
        // messageId: "7306b1b0569011eb85f50df917cce52f"
        // payload: { text: ""测试消息"" }
        // receiverId: "wangzai100019"
        // senderId: "wangzai100153"
        // status: "success"
        // timestamp: 1610646397799
        // type: "text"

        let msgData = JSON.parse(data.payload.text);
        if (data.senderId == DataBase.player.id) {
            //自己信息
            switch (msgData.contentType) {
                case GoEasyConfig.ContentType.TEXT:
                    this.selfNode.active = true;
                    this.selfMsg.string = "" + msgData.content;
                    setTimeout(() => {
                        this.selfMsg.horizontalAlign = this.selfMsg.node.height > 40 ? cc.Label.HorizontalAlign.LEFT : cc.Label.HorizontalAlign.RIGHT;
                    }, 100)
                    break
                case GoEasyConfig.ContentType.IMAGE:
                    this.selfImg.node.active = true;
                    utils.setHead(this.selfImg, msgData.content);
                    break
                default:
                    this.selfNode.active = true;
                    this.selfMsg.string = "" + msgData.content;
                    setTimeout(() => {
                        this.selfMsg.horizontalAlign = this.selfMsg.node.height > 40 ? cc.Label.HorizontalAlign.LEFT : cc.Label.HorizontalAlign.RIGHT;
                    }, 100)
                    break
            }


        } else {
            //对方信息
            switch (msgData.contentType) {
                case GoEasyConfig.ContentType.TEXT:
                    this.otherNode.active = true;
                    this.otherMsg.string = "" + msgData.content;
                    break
                case GoEasyConfig.ContentType.IMAGE:
                    this.otherImg.node.active = true;
                    utils.setHead(this.otherImg, msgData.content);
                    break
                default:
                    this.otherNode.active = true;
                    this.otherMsg.string = "" + msgData.content;
                    break
            }
        }

    }


    // update (dt) {},
});
