let db = require("../Script/DataBase")
let connector = require('../NetWork/Connector');
const utils = require("../Script/utils");
const { GameConfig } = require("../../GameBase/GameConfig");
const Cache = require("../Script/Cache");
cc.Class({
    extends: cc.Component,

    properties: {

        bgSfArr: [cc.SpriteFrame],
        levelSfArr: [cc.SpriteFrame],
        playerNum: cc.Label,
        bet: cc.Label,
        ruleScore: cc.Label,
        level: cc.Sprite,
        itemData: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickItem, this);
    },
    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onClickItem, this);
    },

    onClickItem() {
        let isShow = utils.getValue(GameConfig.StorageKey.ShowAutoTips, {
            "PDK_SOLO": true,
            "XHZP_SOLO": true,
            "LDZP_SOLO": true,
            "PDK": true,
            "XHZP": true,
            "XHZD": true,
            "LDZP": true,
        });
        if (isShow[this.itemData.gameType]) {
            utils.pop(GameConfig.pop.AutoTipsPop, (node) => {
                node.getComponent("ModuleAutoTipsPop").show(GameConfig.GameAutoTips[this.itemData.gameType], this.itemData.gameType, () => {
                    this.enterRoom();
                });
            })
        } else {
            this.enterRoom();
        }


    },

    enterRoom() {
   
        let roomData = this.itemData;
        if (roomData.gameType.indexOf(GameConfig.GameType.XHZD) == -1) {

            utils.pop(GameConfig.pop.TablePop, (node) => {
                node.getComponent("ModuleTablePop").initData(roomData)
            })

            return;
        }
        let nowTime = new Date().getTime();
        if (nowTime - GameConfig.LastSocketTime < 2000) return;
        GameConfig.LastSocketTime = nowTime;
        if (db.player.wallet < roomData.lower) {
            Cache.alertTip("积分不足");
            return
        }
        if (GameConfig.IsConnecting) {
            Cache.alertTip("正在进入房间");
            return;
        }

      

        GameConfig.IsConnecting = true;
        connector.request(GameConfig.ServerEventName.JoinClubGame, { roomID: roomData.id, gameType: roomData.gameType }, (data) => {
            utils.saveValue(GameConfig.StorageKey.LastRoomId, roomData.id);
            utils.saveValue(GameConfig.StorageKey.LastGameType, roomData.gameType);
            utils.saveValue(GameConfig.StorageKey.LastRoomType, roomData.level);
            utils.saveValue(GameConfig.StorageKey.LastRoomBase, roomData.name);

            connector.connect(data, () => {
                GameConfig.IsConnecting = false;
                GameConfig.CurrentGameType = data.connectInfo.gameType;
                db.setGameType(db.GAME_TYPE[data.connectInfo.gameType]);
                cc.director.loadScene(db.TABLE_TYPE[data.connectInfo.gameType]);
            });
        })
    },

    initData(data) {
        // cc.log('clubItem==================================>', data);

        this.itemData = data;
        this.node.getComponent(cc.Sprite).spriteFrame = this.bgSfArr[Math.min(data.level, 3)];

        this.playerNum.string = data.players;
        this.bet.string = "" + utils.formatGold(data.base);
        //TODO  fee抽水比
        this.ruleScore.string = "最低: " + utils.formatGold(data.lower);
        this.level.spriteFrame = this.levelSfArr[data.level];
    },

    /**入场动画 */
    showPopAnim() {
        this.node.x = 800;
        let ap = cc.moveTo(1, cc.v2(-800, this.node.y)).easing(cc.easeBackInOut());
        this.node.runAction(ap);
    }
    // start () {

    // },

    // update (dt) {},
});
