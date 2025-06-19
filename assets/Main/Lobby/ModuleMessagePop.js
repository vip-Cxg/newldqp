const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const dataBase = require("../Script/DataBase");
const utils = require("../Script/utils");
const http = require("SceneLogin");
const { GameConfig } = require("../../GameBase/GameConfig");
const AudioCtrl = require("../Script/audio-ctrl");
const { GoEasy } = require("../GoEasy/GoEasy");
let Native = require('../Script/native-extend');
const { GoEasyConfig } = require("../GoEasy/GoEasyConfig");
let _social = Native.Social;

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Node,
        msgContent: cc.Node,
        noData: cc.Node,
        msgItem: cc.Prefab,
        updateInfo: false
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
        this.refreshUI();
    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
    },
    /**更新UI */
    refreshUI() {
        let messageArr = GoEasy._queueMailMsg.concat(utils.getValue(GameConfig.StorageKey.EmaliMsg, []));
        if (utils.isNullOrEmpty(messageArr)) {
            this.noData.active = true;
            this.msgContent.active = false;
            return;
        }

        // {"date":"2020-11-10","title":"上分成功","content":"管理员[ID:100001] 为您上分 10000分"}
        this.noData.active = false;
        this.msgContent.active = true;

        messageArr.forEach((value, index) => {
            if (utils.isNullOrEmpty(value))
                return;
            let msgData = value;

            if (!utils.isNullOrEmpty(msgData.type) && msgData.type == "RECHARGE") {
                this.updateInfo = true;
                msgData.type = "MAIL"
            }
            let item = cc.instantiate(this.msgItem);
            let str = msgData.content.match(/#(\S*)#/);
            if (str) {
                item.on(cc.Node.EventType.TOUCH_END, () => {
                    Cache.alertTip("复制成功")
                    _social.setCopy(str[1])
                })
            }
            let mailMsg = msgData.content.replace(/#/g, '');
            item.getChildByName("content").getComponent(cc.Label).string =""+mailMsg;// utils.getStringByLength(, 60);
            item.getChildByName("titleContainer").getChildByName("title").getComponent(cc.Label).string = msgData.title;
            item.getChildByName("titleContainer").getChildByName("date").getComponent(cc.Label).string = parseInt(msgData.timestamp) > 0 ? utils.timestampToTime(msgData.timestamp) : msgData.timestamp;

            this.msgContent.addChild(item);
        });
        utils.saveValue(GameConfig.StorageKey.EmaliMsg, messageArr);

        GoEasy._queueMailMsg = [];
        GoEasy.markGroupAsRead(GoEasyConfig.Group[0]);
        GoEasy.markPrivateAsRead(GoEasyConfig.ServerID);

    },
    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
    onDestroy() {
        this.removeEvents();
    }
});
