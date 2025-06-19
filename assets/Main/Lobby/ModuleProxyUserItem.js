const { GameConfig } = require("../../GameBase/GameConfig");
const { App } = require("../../script/ui/hall/data/App");
const utils = require("../Script/utils");

cc.Class({
    extends: cc.Component,

    properties: {
        lblName: cc.Label,
        lblId: cc.Label,
        lblWattle: cc.Label,
        avatarSpr: cc.Sprite,

        selectSpr: cc.SpriteFrame,
        unselectSpr: cc.SpriteFrame,
        itemData: null,
    },

    initData(data) {
        this.itemData = data;

        // if (cc.find("Canvas")) {
        try {
            cc.find('Canvas').off(GameConfig.GameEventNames.PROXY_SELECT_USER, this.selectActive, this);
            cc.find('Canvas').on(GameConfig.GameEventNames.PROXY_SELECT_USER, this.selectActive, this);
        } catch (error) {

        }
        // }
        this.lblName.string = "" + utils.getStringByLength(data.name, 6);
        this.lblId.string = "ID: " + data.id
        this.lblWattle.string = "钱包: " + utils.formatGold(data.wallet, 2);

        let avatarUrl = utils.isNullOrEmpty(data.head) ? "" : data.head;
        utils.setHead(this.avatarSpr, avatarUrl);
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            // App.EventManager.dispatchEventWith(GameConfig.GameEventNames.PROXY_SELECT_USER, data)
            utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.PROXY_SELECT_USER, data)
        })
    },

    selectActive(e) {
        this.node.getComponent(cc.Sprite).spriteFrame = e.detail.id == this.itemData.id ? this.selectSpr : this.unselectSpr;
        this.lblName.node.color = e.detail.id == this.itemData.id ? new cc.color("#ffffff") : new cc.color("#3E62A1")
        this.lblId.node.color = e.detail.id == this.itemData.id ? new cc.color("#ffffff") : new cc.color("#3E62A1")
        this.lblWattle.node.color = e.detail.id == this.itemData.id ? new cc.color("#ffffff") : new cc.color("#3E62A1")

        // this.selectSpr.active=e.detail.id== this.itemData.id;
    }
    // update (dt) {},
});
