const { GameConfig } = require("../../GameBase/GameConfig");
const { App } = require("../../script/ui/hall/data/App");
const utils = require("../Script/utils");

cc.Class({
    extends: cc.Component,

    properties: {
        lblName: cc.Label,
        lblId: cc.Label,
        lblPhone: cc.Label,
        desc: cc.Node,
        lblWattle: cc.Label,
        selectSpr: cc.SpriteFrame,
        unselectSpr: cc.SpriteFrame,
        itemData: null,
    },

    initData(data) {
        this.itemData = data;
        if (cc.find("Canvas")) {
            cc.find("Canvas").off(GameConfig.GameEventNames.PROXY_SELECT_USER, this.selectActive, this);
            cc.find("Canvas").on(GameConfig.GameEventNames.PROXY_SELECT_USER, this.selectActive, this);
        }
        this.lblName.string = "" + utils.getStringByLength(data.name, 5);
        this.lblId.string = "ID:" + data.id;
        this.lblPhone.string = "" + data.phone;
        this.lblWattle.string = "" + utils.formatGold(data.wallet, 2);

        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            // App.EventManager.dispatchEventWith(GameConfig.GameEventNames.PROXY_SELECT_USER, data)
            utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.PROXY_SELECT_USER, data)
        })
    },

    selectActive(e) {
        this.node.getComponent(cc.Sprite).spriteFrame = e.detail.id == this.itemData.id ? this.selectSpr : this.unselectSpr;

        this.lblName.node.color = e.detail.id == this.itemData.id ? new cc.color("#ffffff") : new cc.color("#3E62A1")
        this.lblId.node.color = e.detail.id == this.itemData.id ? new cc.color("#ffffff") : new cc.color("#3E62A1")
        this.lblPhone.node.color = e.detail.id == this.itemData.id ? new cc.color("#ffffff") : new cc.color("#3E62A1")
        this.lblWattle.node.color = e.detail.id == this.itemData.id ? new cc.color("#ffffff") : new cc.color("#3E62A1")
        this.desc.color = e.detail.id == this.itemData.id ? new cc.color("#ffffff") : new cc.color("#3E62A1")
        // this.selectSpr.active=e.detail.id== this.itemData.id;
    }
    // update (dt) {},
});
