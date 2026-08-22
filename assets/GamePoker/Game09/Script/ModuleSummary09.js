let TableInfo = require("../../../Main/Script/TableInfo");
let connector = require('../../../Main/NetWork/Connector');
let cache = require("../../../Main/Script/Cache");
const utils = require("../../../Main/Script/utils");
const { GameConfig } = require("../../../GameBase/GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        summaryContent: cc.Node,
        summaryItem: cc.Prefab,
        shuffleContinueBtn: cc.Node,
        continueBtn: cc.Node,
        goBackBtn: cc.Node,
        loseBg: cc.Node,
        winBg: cc.Node,
        infoContent: cc.Node,
        bgMask: cc.Node,
        // cutCard: cc.Toggle,
        descCut: cc.Label,
        isReplay: false
    },
    onLoad() {
     
    },
    /**初始化结算数据 */
    initData(data, replay = false) {
        this.isReplay = replay;
        this.showOpenHandsSummary(data);
        if (replay) {
            this.continueBtn.active = false;
            this.shuffleContinueBtn.active = false;
        }else{
            this.goBackBtn.active=data.status==GameConfig.GameStatus.WAIT;
        }
        // if (!utils.isNullOrEmpty(TableInfo.options) && !utils.isNullOrEmpty(TableInfo.options.shuffle) && TableInfo.options.shuffle > 0) {
        //     this.cutCard.node.active = true;
        //     this.descCut.string = "每次" + utils.formatGold(TableInfo.options.shuffle);
        // } else {
        //     this.cutCard.node.active = false;
        // }

        //当前胜利组 data.winner
        if (data.winner == GameConfig.ZDCurrentGroup) {
            //当前玩家获胜
            this.winBg.active = true;
            this.loseBg.active = false;

        } else {
            //其他玩家获胜
            this.winBg.active = false;
            this.loseBg.active = true;
        }
        data.players.sort(utils.compare("rank"));

        data.players.forEach((player, i) => {
            let summaryItem = cc.instantiate(this.summaryItem);
            this.summaryContent.addChild(summaryItem);
            summaryItem.getComponent("ModuleSummaryItem09").initData(player, data.winner,player.idx,replay);
        });

    },

    /**明牌倍数只作展示，players[].turn 已是服务端计算后的最终分数。 */
    showOpenHandsSummary(data) {
        if (!data || data.openHands !== true)
            return;
        let node = new cc.Node("openHandsSummary");
        node.parent = this.node;
        node.zIndex = 50;
        node.setPosition(0, 275);
        node.setContentSize(250, 48);
        let bg = node.addComponent(cc.Graphics);
        bg.fillColor = cc.color(176, 42, 36, 235);
        bg.roundRect(-125, -24, 250, 48, 12);
        bg.fill();
        let labelNode = new cc.Node("label");
        labelNode.parent = node;
        labelNode.setContentSize(240, 46);
        labelNode.color = cc.color(255, 233, 128);
        let label = labelNode.addComponent(cc.Label);
        label.fontSize = 27;
        label.lineHeight = 34;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.string = "本局明牌 ×" + (Number(data.multiplier) || 2);
    },

    /**继续游戏 */
    onContinueGame(e, v) {
        cache.playSfx();
        utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.ZD_CONTINUE_GAME, { cut: parseInt(v)==1 });
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },

    /**返回大厅 */
    onBackHall() {
        cache.playSfx();
        utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.ZD_BACK_HALL);
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
    /**显示结算 */
    onShowSummary() {
        cache.playSfx();
        this.infoContent.active = true;
        this.bgMask.active = true;
    },
    /**显示桌面 */
    onShowTable() {
        cache.playSfx();

        this.infoContent.active = false;
        this.bgMask.active = false;
    },

    // update (dt) {},
});
