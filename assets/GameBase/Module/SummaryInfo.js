
const TableInfo = require("../../Main/Script/TableInfo");
const utils = require("../../Main/Script/utils");
const { GameConfig } = require("../GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        roomId: cc.Label,
        time: cc.Label,
        version: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.time.string = utils.timestampToTime(new Date().getTime());
        if (TableInfo.options && TableInfo.options.roomID && TableInfo.options.tableID)
            this.roomId.string = TableInfo.options.roomID + " 房号: " + TableInfo.options.tableID;
        if (cc.sys.os != cc.sys.OS_IOS && cc.sys.os != cc.sys.OS_ANDROID) {
            cc.gameVersion = GameConfig.DefaultVersion;
        }
        if (cc.gameVersion == null)
            cc.gameVersion = GameConfig.DefaultVersion;
        this.version.string = "版本号: " + cc.gameVersion;
    },




    // update (dt) {},
});
