const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const dataBase = require("../Script/DataBase");
const utils = require("../Script/utils");
const http = require("SceneLogin");
const { GameConfig } = require("../../GameBase/GameConfig");
const AudioCtrl = require("../Script/audio-ctrl");

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Node,
        roomItem: cc.Prefab,
        itemContainer: cc.Node,
        toggleContainer: cc.Node,
        modelContainer: cc.Node,
        normalModel: cc.Toggle,
        title: cc.Sprite,
        qinyou: cc.SpriteFrame,
        dlm: cc.SpriteFrame,
        currentModel: "_SOLO"
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.roomData = new Object();
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
        let lastGameType = utils.getValue(GameConfig.StorageKey.LastGameType, "PDK");
        let strArr = lastGameType.split("_");
        this.currentModel = strArr.length > 1 ? "_SOLO" : "";
        GameConfig.CurrentGameType = strArr[0];


        this.toggleContainer.getChildByName("" + GameConfig.CurrentGameType).getComponent(cc.Toggle).check();

        // let a=new cc.Node();
        // a.getChildByName

        this.title.spriteFrame = GameConfig.IsLeague ? this.dlm : this.qinyou;
        this.toggleContainer.width = 193.3 + GameConfig.FitScreen * 2;
        if (strArr.length < 2)
            this.normalModel.check();
        if (GameConfig.CurrentGameType == GameConfig.GameType.XHZD) {
            this.modelContainer.active = false;
        } else {
            this.modelContainer.active = true;
        }
        this.loadRoomData()
    },
    /**选择游戏  编辑器调用*/
    onSelectGame(e, v) {
        if (GameConfig.CurrentGameType == v) return;

        GameConfig.CurrentGameType = v;
        if (v == GameConfig.GameType.XHZD) {
            // this.currentModel = "";
            // this.normalModel.check();
            this.modelContainer.active = false;
        } else {
            this.modelContainer.active = true;
        }

        if (utils.isNullOrEmpty(this.roomData[GameConfig.CurrentGameType + this.currentModel])) {
            this.loadRoomData()
        } else {
            this.addRooms(this.roomData[GameConfig.CurrentGameType + this.currentModel]);
        }
    },
    /**下载房间数据 */
    loadRoomData() {
        let gameType = GameConfig.CurrentGameType == GameConfig.GameType.XHZD ? GameConfig.CurrentGameType : GameConfig.CurrentGameType + this.currentModel;
        Connector.request(GameConfig.ServerEventName.GetGameType, { proxyID: dataBase.player.proxyID, isLeague: GameConfig.IsLeague, gameType: gameType }, (data) => {
            this.addRooms(data.rooms);
            this.roomData[GameConfig.CurrentGameType + this.currentModel] = data.rooms;
        })
    },

    /**添加房间 */
    addRooms(data) {
        //移除当前房间
        this.itemContainer.children.forEach((item, index) => {
            let ap = cc.fadeOut(0.2);
            let bp = cc.callFunc(() => {
                item.removeFromParent();
            })
            item.runAction(cc.sequence(ap, bp));

        })
        if (!data || data.length == 0)
            return;
        data.forEach((room, index) => {
            let item = cc.instantiate(this.roomItem);
            item.getComponent("ModuleClubItem").initData(room);
            this.itemContainer.addChild(item);
            // item.x = (this.itemContainer.width / 6) * (2 * index + 1);
            // item.y = 0;
            item.scale = 0;
            let ap = cc.scaleTo(0.3, 1).easing(cc.easeBackOut())
            let bp = cc.sequence(cc.delayTime(0.2 * index), ap)
            item.runAction(bp)
        });

    },

    showAutoTips() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.AutoTipsPop, (node) => {
            node.getComponent("ModuleAutoTipsPop").show(GameConfig.GameAutoTips[GameConfig.CurrentGameType]);
        })
    },

    /**选择模式 */
    selectModel(e, v) {
        if (utils.isNullOrEmpty(v))
            v = "";
        if (this.currentModel == v)
            return;
        this.currentModel = v;
        if (utils.isNullOrEmpty(this.roomData[GameConfig.CurrentGameType + this.currentModel])) {
            this.loadRoomData()
        } else {
            this.addRooms(this.roomData[GameConfig.CurrentGameType + this.currentModel]);
        }
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
