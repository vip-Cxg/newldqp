let connector = require('../../../Main/NetWork/Connector');
let Cache = require("../../../Main/Script/Cache");
const { GameConfig } = require("../../../GameBase/GameConfig");
const utils = require("../../../Main/Script/utils");
const TableInfo = require("../../../Main/Script/TableInfo");
const ROUTE = require('../../../Main/Script/ROUTE');
const { App } = require('../../../script/ui/hall/data/App');

cc.Class({
    extends: cc.Component,

    properties: {
        summaryContent: cc.Node,
        summaryItem: cc.Prefab,
        shuffleBtn: cc.Node,
        unShuffleBtn: cc.Node,

        continueBtn: cc.Node,
        goBackBtn: cc.Node,
        loseBg: cc.Node,
        winBg: cc.Node,
        infoContent: cc.Node,
        bgMask: cc.Node,
        cutCard: cc.Toggle,
        descCut: cc.Label,
        continueSpr: cc.SpriteFrame,
        nextSpr: cc.SpriteFrame,
        isReplay: false
    },
    onLoad() {


    },

    /**初始化结算数据 */
    initData(data, replay = false) {
        this.isReplay = replay;

        //当前胜利玩家 data.winner
        if (data.winner == TableInfo.idx) {
            //当前玩家获胜
            this.winBg.active = true;
            this.loseBg.active = false;

        } else {
            //其他玩家获胜
            this.winBg.active = false;
            this.loseBg.active = true;
        }

        data.players.forEach((player, i) => {
            let summaryItem = cc.instantiate(this.summaryItem);
            summaryItem.getComponent("ModuleSummaryItem07").initData(player, data.winner, data.ach);
            this.summaryContent.addChild(summaryItem);
        });
        if (replay) { 
            this.shuffleBtn.active = false;
            // this.continueBtn.active = false;
            this.goBackBtn.active = false;
            this.unShuffleBtn.active = false;
            return;
        }

        this.goBackBtn.active = TableInfo.status == GameConfig.GameStatus.WAIT;
        // this.continueBtn.getComponent(cc.Sprite).spriteFrame = TableInfo.status == GameConfig.GameStatus.WAIT ? this.continueSpr : this.nextSpr;

        if (TableInfo.options.maxRound > 1 || data.round > 1) {
            this.unShuffleBtn.active = true;
            this.shuffleBtn.active = true;
            this.continueBtn.active = false;
        } else {
            this.unShuffleBtn.active = false;
            this.shuffleBtn.active = false;
            this.continueBtn.active = true;
        }




    },

    /**继续游戏 */
    continueGame() {
        Cache.playSfx();
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.PDK_CONTINUE_GAME)
        this.remove();
    },
    /**洗牌 */
    selectShuffleCard(e,v) {
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.PDK_SHUFFLE_CARD, v=='1')
        this.remove();
    },
    /**返回大厅 */
    backHall() {
        if (!this.isReplay) {
            GameConfig.ShowTablePop = true;
            Cache.showMask("正在返回大厅...请稍后");
            connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
            this.remove()
        }
    },

    /**显示结算 */
    onShowSummary() {
        Cache.playSfx();
        this.infoContent.active = true;
        this.bgMask.active = true;
    },
    /**显示桌面 */
    onShowTable() {
        Cache.playSfx();

        this.infoContent.active = false;
        this.bgMask.active = false;
    },


    remove() {
        if (this.node) {
            this.node.destroy();
        }

    }

    // update (dt) {},
});
