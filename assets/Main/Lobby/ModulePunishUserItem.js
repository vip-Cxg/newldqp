const { GameConfig } = require("../../GameBase/GameConfig");
const utils = require("../Script/utils");

cc.Class({
    extends: cc.Component,

    properties: {
        lblName: cc.Label,
        lblId: cc.Label,
        lblReason: cc.Label,
        lblStatus: cc.Label,

        selectSpr: cc.SpriteFrame,
        unselectSpr: cc.SpriteFrame,
        itemData: null,
    },

    initData(data) {

        // createdAt: "2021-01-10T08:09:54.000Z"
        // id: 1000
        // reason: "测试举报"
        // replayID: "20210107/XHZD/qgQyTHaV"
        // reportID: 100019
        // reporter: { id: 100019, name: "", phone: "1608393405992" }
        // status: "wait"
        // updatedAt: "2021-01-10T08:09:54.000Z"
        // user: null
        // userID: 100277

        this.itemData = data;
        if (cc.find("Canvas")) {
            cc.find("Canvas").off(GameConfig.GameEventNames.ADMIN_SELECT_USER, this.selectActive, this);
            cc.find("Canvas").on(GameConfig.GameEventNames.ADMIN_SELECT_USER, this.selectActive, this);
        }
        this.lblName.string = utils.isNullOrEmpty(data.user) ? "未知玩家昵..." : "" + utils.getStringByLength(data.user.name, 5);
        this.lblId.string = utils.isNullOrEmpty(data.user) ? "未知玩家ID" : "" + data.user.id;
        this.lblReason.string = "" + utils.getStringByLength(data.reason, 6);

        switch (data.status) {
            case "end":
                this.lblStatus.string = "已处理";
                break;
            case "malicious":
                this.lblStatus.string = "恶意举报";
                break;
            case "wait":
                this.lblStatus.string = "未处理";
                break;
            case "warn":
                this.lblStatus.string = "警告";
                break;
            case "punishment":
                this.lblStatus.string = "处罚";
                break;
            case "frozen":
                this.lblStatus.string = "冻结";
                break;
            default:
                this.lblStatus.string = "未知状态";
                break;
        }

        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.ADMIN_SELECT_USER, data)
        })
    },

    selectActive(e) {
        this.node.getComponent(cc.Sprite).spriteFrame = e.detail.id == this.itemData.id ? this.selectSpr : this.unselectSpr;
        // this.selectSpr.active=e.detail.id== this.itemData.id;
    }
    // update (dt) {},
});
