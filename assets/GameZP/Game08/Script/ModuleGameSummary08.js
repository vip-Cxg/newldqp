//const POS_PART = [cc.v2(-53,18),cc.v2(318,18),cc.v2(686,18)];
let cache = require('Cache');
let Native = require('native-extend');
let _social = Native.Social;
const utils = require('../../../Main/Script/utils');
const TableInfo = require('../../../Main/Script/TableInfo');
const { GameConfig } = require('../../../GameBase/GameConfig');
const Connector = require('../../../Main/NetWork/Connector');
const ROUTE = require('../../../Main/Script/ROUTE');
cc.Class({
    extends: cc.Component,

    properties: {
        // part: cc.Prefab,
        winBg: cc.Prefab,
        loseBg: cc.Prefab,
        bgContainer: cc.Node,
        playerContent: cc.Node,
        playerItem: cc.Prefab,
        birdContinueBtn: cc.Node,
        continueBtn: cc.Node,
        changeTableBtn: cc.Node,
    },

    onLoad() {
   
    },
    init(data, isReplay = false) {
        this.isReplay = isReplay;

        if (isReplay)
            this.hideBtn()

        data.forEach((item, index) => {
            if (item.idx == TableInfo.idx) {
                let bgNode = item.scores.total > 0 ? cc.instantiate(this.winBg) : cc.instantiate(this.loseBg);
                bgNode.parent = this.bgContainer;
            }
            let playerNode = cc.instantiate(this.playerItem)
            playerNode.getComponent("ModuleSummaryItem08").initData(item, 0);
            playerNode.parent = this.playerContent;
        });
    },

    backHall() {
        cache.playSfx();
        if (this.isReplay) {
            // this.node.removeFromParent();
            let nodeReplay = cc.find('Canvas/replay');
            if (nodeReplay != null)
                nodeReplay.getComponent('ModuleReplay08').quit();
            // utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.REPLAY_BACK_HALL);
        } else {
            GameConfig.ShowTablePop = true;
            cache.showMask("正在返回大厅...请稍后");
            Connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
        }
    },

    sendReady(e, v) {
        if (this.isReplay) {
            // this.node.removeFromParent();
            let nodeReplay = cc.find('Canvas/replay');
            if (nodeReplay != null)
                nodeReplay.getComponent('ModuleReplay08').quit();
            // utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.REPLAY_BACK_HALL);
        } else {
            GameConfig.ShowTablePop = true;
            GameConfig.IsQuickStart=true;
            cache.showMask("正在返回大厅...请稍后");
            Connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
        }
        // Connector.gameMessage(ROUTE.CS_GAME_READY, { plus: parseInt(v)!=-1 });
        // this.remove();

    },


    remove() {
        if (this.node) {
            this.node.destroy();
        }
    },

    hideBtn() {
        this.birdContinueBtn.active = false;
        this.continueBtn.active = false;
        this.changeTableBtn.active = false;

    }

    // share  () {
    //     cache.showShare(this.node);
    //     // utils.screenShoot((file, thumbWidth, thumbHeight) => {
    //     //     _social.shareImageToFriendWithWX(file, thumbWidth, thumbHeight);
    //     // });
    // },
});
