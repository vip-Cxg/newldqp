let TableInfo = require('TableInfo');
let connector = require('Connector');
let ROUTE = require('ROUTE');
const Cache = require('../../Main/Script/Cache');
const utils = require('../../Main/Script/utils');
const { GameConfig } = require('../GameConfig');
const replaceIP = function (ip) {
    if (ip == null)
        return '未知';
    return ip.substring(ip.lastIndexOf(":") + 1);
};
cc.Class({
    extends: cc.Component,

    properties: {
        userId: cc.Label,
        userName: cc.Label,
        avatar: require('../../script/ui/common/Avatar'),
        closeBtn: cc.Node,
        lastTime: 0
    },

    // use this for initialization
    onLoad() {
        this.addEvents();
    },

    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
    },

    init(data) {

        // this.node.parent = cc.find('Canvas');
        this.idx = data;
        this.userId.string = !utils.isNullOrEmpty(TableInfo.options) && TableInfo.options.gameType == GameConfig.GameType.XHZD && TableInfo.options.mode != 'CUSTOM' ? "" : TableInfo.players[data].prop.pid;
        this.userName.string = !utils.isNullOrEmpty(TableInfo.options) && (TableInfo.options.gameType == GameConfig.GameType.XHZD) && TableInfo.options.mode != 'CUSTOM' ? "玩家" + (data + 1) : TableInfo.players[data].prop.name;

        if (!utils.isNullOrEmpty(TableInfo.options) && TableInfo.options.gameType == GameConfig.GameType.XHZD&&TableInfo.options.mode != 'CUSTOM')
            return;

        this.avatar.avatarUrl = TableInfo.players[data].prop.head;
        // this.lblIp.string = replaceIP(TableInfo.players[data].prop.ip);
    },

    emitAnimation(event, data) {
        if (this.checkDurationTime()) {
            Cache.playSfx();
            this.pleaseWaite();
            return;
        }
        connector.gameMessage(ROUTE.CS_GAME_CHAT, { messageType: 4, content: data, target: this.idx });
        this.storageCurrentTime();
        this.onClickClose();

    },


    // quit  () {
    //     Cache.playSfx();
    //     this.node.removeFromParent(false);
    // },

    storageCurrentTime() {
        let myDate = new Date();
        this.lastTime = myDate.getTime();
    },

    checkDurationTime() {
        let myDate = new Date();
        let currentTime = myDate.getTime();
        return currentTime - this.lastTime < 3000;
    },

    pleaseWaite() {
        Cache.alertTip("发言间隔需要3秒");
    },

    onClickClose() {
        Cache.playSfx();
        this.removeEvents();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }

    }
});
