const { GameConfig } = require("../../../GameBase/GameConfig");
const Cache = require("../../../Main/Script/Cache");
const { App } = require("./data/App");
const utils = require('../../../Main/Script/utils');


cc.Class({
    extends: cc.Component,

    properties: {
        chooseNode: cc.Node,
        unChooseNode: cc.Node,
        roomData: null
    },


    addEvents() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickBtn, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.ROOM_TYPE_BTN_CHANGE, this.changeBtnUI, this);
    },
    removeEvents() {
        // console.log("room removeEvents", JSON.stringify(this.roomData));
        App.EventManager.removeEventListener(GameConfig.GameEventNames.ROOM_TYPE_BTN_CHANGE, this.changeBtnUI, this);

    },
    initData(roomData) {
        this.addEvents();
        this.roomData = roomData;

        if (roomData.name == '大厅') {
            this.chooseNode.getChildByName('name').getComponent(cc.Label).string = roomData.name;
            this.chooseNode.getChildByName('name').y -= 10;
            this.chooseNode.getChildByName('base').getComponent(cc.Label).string = '';
            this.unChooseNode.getChildByName('name').getComponent(cc.Label).string = roomData.name;
            this.unChooseNode.getChildByName('name').y -= 10;
            this.unChooseNode.getChildByName('base').getComponent(cc.Label).string = '';
        } else {
            this.chooseNode.getChildByName('name').getComponent(cc.Label).string = roomData.name;
            this.chooseNode.getChildByName('base').getComponent(cc.Label).string = '最低: ' + utils.formatGold(roomData.lower);
            this.unChooseNode.getChildByName('name').getComponent(cc.Label).string = roomData.name;
            this.unChooseNode.getChildByName('base').getComponent(cc.Label).string = '最低: ' + utils.formatGold(roomData.lower);

        }


    },
    onClickBtn() {
        Cache.playSfx();
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.ROOM_TYPE_CHANGE, this.roomData);
    },
    changeBtnUI(e) {
        this.chooseNode.active = e.data.name == this.roomData.name;
    },
    onDestroy() {
        this.removeEvents();
    }

    // update (dt) {},
});
