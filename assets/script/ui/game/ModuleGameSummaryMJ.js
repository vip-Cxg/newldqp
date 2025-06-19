let tableInfo = require("../../../Main/Script/TableInfo");
let connector = require('../../../Main/NetWork/Connector');
let cache = require("../../../Main/Script/Cache");
const utils = require("../../../Main/Script/utils");
const { GameConfig } = require("../../../GameBase/GameConfig");
const ROUTE = require("../../../Main/Script/ROUTE");
const { App } = require("../hall/data/App");

cc.Class({
    extends: cc.Component,

    properties: {
        summaryContent: cc.Node,
        summaryItem: cc.Prefab,
        continueBtn: cc.Node,
        // adComponent: require('../../../script/ui/ad/AdComponent'),
        isReplay: false
    },
    onLoad() {
        // if (!utils.isNullOrEmpty(GameConfig.AdData) && !utils.isNullOrEmpty(GameConfig.AdData.XHZDSummaryAd)) {
        //     this.adComponent.showAd();
        //     this.adComponent.initAd(GameConfig.AdData.XHZDSummaryAd);
        // } else {
        //     this.adComponent.hideAd();
        // }
    },
    /**初始化结算数据 */
    initData(data, replay = false) {

        if (replay) {
            this.continueBtn.active = false;
        }
        GameConfig.ShowTablePop=true;
        this.isReplay = replay;
        // }
        // if (!utils.isNullOrEmpty(tableInfo.options) && !utils.isNullOrEmpty(tableInfo.options.shuffle)) {
        //     this.descCut.string = "每次" + utils.formatGold(tableInfo.options.shuffle) + "元";
        // }

        //当前胜利组 data.winner

        // data.players.sort(utils.compare("rank"));

        data.forEach((player, i) => {
            let summaryItem = cc.instantiate(this.summaryItem);
            summaryItem.getComponent("MJGameSummayItem").renderUI(player, i);
            this.summaryContent.addChild(summaryItem);
        });

    },

    /**继续游戏 */
    onContinueGame(e, v) {
        cache.playSfx();

        if (tableInfo.options.mode == 'CUSTOM') {
            //选桌继续游戏
            connector.gameMessage(ROUTE.CS_GAME_READY, {});

        } else {
            utils.pop(GameConfig.pop.MatchPop, (node) => {
                node.getComponent("ModuleMatchPop").startMatch(tableInfo.config.roomID);
            })
        }
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },

    /**返回大厅 */
    onBackHall() {
        cache.playSfx();
        if (this.isReplay) {
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.REPLAY_BACK_HALL)
            this.node.destroy();
            return;
        }
        if (tableInfo.options.mode == 'CUSTOM') {
            //选桌继续游戏
            GameConfig.ShowTablePop=true;
            connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
            return;
        } 
        //返回大厅 直接跳转场景
        cc.director.loadScene("Lobby");

    },


    // update (dt) {},
});
