// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { GameConfig } = require("../../../GameBase/GameConfig");
const Cache = require("../../../Main/Script/Cache");
const { App } = require("./data/App");


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

        if (gametype === 'SDH' || gametype === 'SDH_CLAN') {
            [this.chooseNode, this.unChooseNode].forEach((node, index) => {
                node.getComponent(cc.Sprite).spriteFrame = null;
                const title = new cc.Node('SDHName');
                title.parent = node;
                title.color = index === 0 ? cc.color(255, 224, 146) : cc.color(238, 232, 220);
                const label = title.addComponent(cc.Label);
                label.fontSize = 22;
                label.lineHeight = 26;
                label.string = GameConfig.GameName[gametype];
            });
            return;
        }

        let a={
            'HALL':this.gameSprArr[0],
            'PDK':this.gameSprArr[1],
            'HZMJ':this.gameSprArr[2],
            'LDZP':this.gameSprArr[3],
            'XHZD':this.gameSprArr[4],
        }

        this.chooseNode.getComponent(cc.Sprite).spriteFrame =  a[gametype];
        this.unChooseNode.getComponent(cc.Sprite).spriteFrame =  a[gametype];
        this.unChooseNode.opacity=120;

        // new cc.Node().opacity
        // this.chooseNode. getChildByName('name').getComponent(cc.Label).string = GameConfig.GameName[gametype];
        // this.unChooseNode.getChildByName('name').getComponent(cc.Label).string = GameConfig.GameName[gametype];

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
