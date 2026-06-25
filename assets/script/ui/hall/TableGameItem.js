// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { GameConfig } = require("../../../GameBase/GameConfig");
const Cache = require("../../../Main/Script/Cache");
const { App } = require("./data/App");

const GAME_NAME = {
    HALL: "全部游戏",
    DNIU: "牛牛",
    JH: "金花",
    JINHUA: "金花",
    ZMZ: "捉麻子",
    HSMJ: "划水麻将",
    PDK: "跑得快",
};
const STYLE = {
    width: 150,
    height: 50,
    radius: 8,
    selectedBg: cc.color(238, 158, 54, 255),
    selectedStroke: cc.color(255, 226, 137, 255),
    normalBg: cc.color(37, 112, 123, 235),
    normalStroke: cc.color(99, 198, 188, 255),
    text: cc.color(255, 255, 255, 255),
    normalText: cc.color(216, 245, 242, 255),
};

cc.Class({
    extends: cc.Component,

    properties: {
        chooseNode: cc.Node,
        unChooseNode: cc.Node,
        gameType: '',

        gameSprArr:[cc.SpriteFrame]

    },

    // LIFE-CYCLE CALLBACKS:


    addEvents() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickBtn, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.GAME_TYPE_CHANGE, this.changeUI, this)
    },
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.GAME_TYPE_CHANGE, this.changeUI, this)

    },
    initData(gametype) {
        this.addEvents();
        this.gameType = gametype; 

        let name = GAME_NAME[gametype] || GameConfig.GameName[gametype] || gametype;
        this.drawBlock(this.chooseNode, true);
        this.drawBlock(this.unChooseNode, false);
        let chooseName = this.chooseNode && this.chooseNode.getChildByName('name');
        let unChooseName = this.unChooseNode && this.unChooseNode.getChildByName('name');
        if (chooseName && chooseName.getComponent(cc.Label)) {
            this.setupLabel(chooseName, name, true);
        }
        if (unChooseName && unChooseName.getComponent(cc.Label)) {
            this.setupLabel(unChooseName, name, false);
        }

    },
    drawBlock(node, selected) {
        if (!node) return;
        node.opacity = 255;
        node.setContentSize(cc.size(STYLE.width, STYLE.height));
        let sprite = node.getComponent(cc.Sprite);
        if (sprite) {
            sprite.enabled = false;
        }
        let graphics = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        graphics.clear();
        graphics.fillColor = selected ? STYLE.selectedBg : STYLE.normalBg;
        graphics.strokeColor = selected ? STYLE.selectedStroke : STYLE.normalStroke;
        graphics.lineWidth = selected ? 3 : 2;
        graphics.roundRect(-STYLE.width / 2, -STYLE.height / 2, STYLE.width, STYLE.height, STYLE.radius);
        graphics.fill();
        graphics.stroke();
    },
    setupLabel(labelNode, name, selected) {
        labelNode.setPosition(cc.v2(0, 0));
        labelNode.setContentSize(cc.size(STYLE.width - 16, STYLE.height));
        let label = labelNode.getComponent(cc.Label);
        label.string = name;
        label.fontSize = name.length >= 4 ? 22 : 24;
        label.lineHeight = STYLE.height;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        labelNode.color = selected ? STYLE.text : STYLE.normalText;
    },
    onClickBtn() {
        Cache.playSfx();
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GAME_TYPE_CHANGE, this.gameType);

    },
    changeUI(e) {
        if(this.chooseNode)
        this.chooseNode.active = e.data == this.gameType;
    },
    onDestroy() {
        this.removeEvents();
    }
    // update (dt) {},
});
