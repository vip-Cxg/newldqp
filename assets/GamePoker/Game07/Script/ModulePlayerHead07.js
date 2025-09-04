let TableInfo = require("../../../Main/Script/TableInfo");
let cache = require('../../../Main/Script/Cache');
let db = require('../../../Main/Script/DataBase');
let audioCtrl = require("audio-ctrl");
const utils = require("../../../Main/Script/utils");
const { GameConfig } = require("../../../GameBase/GameConfig");
let posHead = [
    cc.v2(-511, -232),
    cc.v2(509, 148),
    cc.v2(-511, 148)
];
let posBaodan = [
    cc.v2(106, 48),
    cc.v2(-106, 48),
    cc.v2(106, 48)
];
// let posBaodan = [
//     cc.v2(46, 81),
//     cc.v2(-23, 84),
//     cc.v2(-21, 78)
// ];
cc.Class({
    extends: cc.Component,

    properties: {
        sprHead: require('../../../script/ui/common/Avatar'),
        playLight: cc.Node,
        imgBanker: cc.Node,
        lblZongjifen: cc.Label,
        lblName: cc.Label,
        sprStatus: cc.Node,
        lastTime: 0,
        // prePlayerFrame: cc.Prefab,
        sprBaodan: cc.Node,
        // numHands: cc.Label,
        // nodeHand: cc.Node,
        nodeAutoPlay: cc.Node,
        readyIcon: cc.Node,
        scoreChange: cc.Node,
        loseFont: cc.Font,
        winFont: cc.Font,
        niaoNode: cc.Node,
        clock: cc.Node,
        cardContainer: cc.Node,
        cardCount: cc.Label,
        playerData: null
    },

    /**初始化玩家状态 */
    init(data, index) {
        this.playerData = data;
        let windowNode = cc.find("Canvas")

        let playPos = [
            cc.v2(139 / 2 - windowNode.width / 2 + GameConfig.FitScreen, 0),
            cc.v2(windowNode.width / 2 - 139 / 2 - GameConfig.FitScreen, 130),
            cc.v2(139 / 2 - windowNode.width / 2 + GameConfig.FitScreen, 110),
        ]
        this.node.position = playPos[TableInfo.realIdx[data.idx]];
        let cardPos = [
            cc.v2(90, 0),
            cc.v2(-90, 0),
            cc.v2(90, 0),
        ]
        this.cardContainer.position = cardPos[TableInfo.realIdx[data.idx]];
        if (utils.isNullOrEmpty(data.prop))
            return;

        this.playLight.active = false;
        // this.sprBaodan.active = false;
        this.sprStatus.active = data.offline;
        this.imgBanker.active = data.idx == TableInfo.zhuang && TableInfo.status != GameConfig.GameStatus.WAIT;
        this.lblZongjifen.string = utils.formatGold(data.wallet);
        this.cardCount.string = typeof data.hands == 'number' ? '' + data.hands : '';

        this.readyIcon.active = data.ready;
        this.niaoNode.active = data.ready && data.ready.plus;

        this.lblName.string = '玩家'+(data.idx+1);//utils.getStringByLength(data.prop.name, 6);
        this.sprHead.avatarUrl = '';//data.prop.head
        this.sprBaodan.setPosition(posBaodan[TableInfo.realIdx[data.idx]]);

        this.node.on('touchend', () => {
            if (TableInfo.idx != data.idx) {
                this.showInfo(data);
            }
        })
    },

    showAvatar(){
        this.sprHead.avatarUrl = this.playerData.prop.head
        this.lblName.string = utils.getStringByLength(this.playerData.prop.name, 6);
    },

    showInfo(data) {
        let myDate = new Date();
        let currentTime = myDate.getTime();
        if (currentTime - this.lastTime < 2000) {
            this.lastTime = currentTime;
            cache.alertTip("发言间隔需要2秒");
            return;
        }
        let idx = data.idx;

        utils.pop(GameConfig.pop.PlayerInfo, (node) => {
            node.getComponent("ModulePlayerInfo").init(idx)
        })
    },
    resetPlayer() {
        console.log('重置',this.playerData)

        this.imgBanker.active = false;
        this.playLight.active = false;
        this.sprBaodan.active = false;
        this.nodeAutoPlay.active = false;
        this.readyIcon.active = false;
        this.sprStatus.active = false;
        this.cardCount.string = '0';
        this.niaoNode.active = false;
        this.hideClock();


    },
    activeBanker(bool) {
        this.imgBanker.active = bool;
    },

    playCardLight(bool) {
        if (bool) {
            this.playLight.active = true;
            this.playLight.stopAllActions();
            this.playLight.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(1), cc.delayTime(0.2), cc.fadeIn(1))));
        } else {
            this.playLight.stopAllActions();
            this.playLight.active = false;
        }
    },
    /**显示报单 */
    activeBaodan(bool) {
        this.sprBaodan.active = bool;
    },
    /**显示托管状态 */
    activeAutoPlay(bool) {
        this.nodeAutoPlay.active = bool;
    },
    /**显示准备 */
    activeReady(bool) {
        this.readyIcon.active = bool;
    },
    /**改变剩余牌数 */
    changeCardCount(data) {
        this.cardCount.string = data + "";
    },
    /**设置钱包分数 */
    setScore(v) {
        this.lblZongjifen.string = utils.formatGold(v);

    },
    /**离线 */
    activeOffline(bool) {
        this.sprStatus.active = bool && !utils.isNullOrEmpty(this.playerData.prop);;
    },
    activeNiao(data) {
        console.log('鸟显示-1-',data)
        console.log('鸟显示-2-',data.readyStatus)
        console.log('鸟显示-3-',data.readyStatus.plus)
        if (utils.isNullOrEmpty(data.readyStatus)) return;
        //打鸟显示
        if (data.readyStatus.plus) {
            this.niaoNode.active = true;
            this.niaoNode.scale = 0;
            // this.niaoNode.opacity=0;
            let ap = cc.fadeIn(0.5);
            let bp = cc.scaleTo(0.1, 3);
            let cp = cc.scaleTo(0.3, 0.2);
            let dp = cc.scaleTo(0.1, 1);
            let ep = cc.sequence(bp, cc.delayTime(0.3), cp, dp);
            let fp = cc.spawn(ap, ep);
            this.niaoNode.runAction(ep);

        } else {

            this.niaoNode.active = false;

        }

    },
    /**炸弹改变积分 */
    showBombScores(index, wallet, value, callBack) {
        //改变总积分显示
        this.lblZongjifen.string = utils.formatGold(wallet);

        if (value < 0) {
            this.scoreChange.getComponent(cc.Label).font = this.loseFont;
            this.scoreChange.getComponent(cc.Label).string = utils.formatGold(value);

        } else {
            this.scoreChange.getComponent(cc.Label).font = this.winFont;
            this.scoreChange.getComponent(cc.Label).string = utils.formatGold(value);

        }
        this.scoreChange.anchorX = index == 1 ? 1 : 0;
        this.scoreChange.position = index == 1 ? cc.v2(-81, -108) : cc.v2(79, -108);
        if (this.scoreChange)
            this.scoreChange.opacity = 0;
        this.scoreChange.active = true;
        let bp = cc.fadeIn(0.3);
        let cp = index == 1 ? cc.moveTo(0.3, cc.v2(-81, -65)) : cc.moveTo(0.3, cc.v2(79, -65));
        let fp = cc.spawn(bp, cp);
        let dp = cc.delayTime(1);
        let ep = cc.callFunc(() => {
            this.scoreChange.active = false;
            if (!utils.isNullOrEmpty(callBack))
                callBack();
        })
        this.scoreChange.runAction(cc.sequence(fp, dp, ep));
    },
    showClock(value) {
        // let a = new cc.Label();
        console.log('倒计时:',value)
        let labelNode = this.clock.getChildByName("time").getComponent(cc.Label)
        labelNode.string = utils.isNullOrEmpty(value) ? "15" : "" + parseInt(value);
        let times = utils.isNullOrEmpty(value) ? 15 : parseInt(value);
        labelNode.unscheduleAllCallbacks();
        this.clock.active = true;
        labelNode.schedule(() => {
            if(times==0)return;
            times--;
            this.clock.getChildByName("time").getComponent(cc.Label).string = Math.max(times, 0);
            if (times <= 5) {

            }
        }, 1);
    },
    hideClock() {
        this.clock.getChildByName("time").getComponent(cc.Label).unscheduleAllCallbacks();
        this.clock.active = false;
    },


    removePlayer() {
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }

});
