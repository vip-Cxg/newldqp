let tbInfo = require("../../../Main/Script/TableInfo");
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
        sprHead: cc.Sprite,
        nodeBln: cc.Node,
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
        niaoNode:cc.Node,
        clock: cc.Node,
        cardContainer: cc.Node,
        cardCount: cc.Label,
        publishPage:cc.Prefab
    },

    /**初始化玩家状态 */
    init: function (data, index) {
        let windowNode = cc.find("Canvas")

        let playPos = [
            cc.v2(139 / 2 - windowNode.width / 2 + GameConfig.FitScreen, 0),
            cc.v2(windowNode.width / 2 - 139 / 2 - GameConfig.FitScreen, 130),
            cc.v2(139 / 2 - windowNode.width / 2 + GameConfig.FitScreen, 110),
        ]
        this.node.position = playPos[tbInfo.realIdx[data.idx]];
        let cardPos=[
            cc.v2(90,0),
            cc.v2(-90,0),
            cc.v2(90,0),
        ]
        this.cardContainer.position=cardPos[tbInfo.realIdx[data.idx]];
        this.nodeBln.active = false;
        // this.sprBaodan.active = false;
        this.sprStatus.active = data.offline ? data.offline : false;
        this.imgBanker.active = data.idx == tbInfo.zhuang;
        this.lblZongjifen.string = utils.formatGold(data.wallet, 2);
        this.cardCount.string="";
        this.showUserInfo(data);
        this.sprBaodan.setPosition(posBaodan[tbInfo.realIdx[data.idx]]);
        // this.node.on('touchend', () => {
        //     if (tbInfo.idx != data.idx) {
        //         //
        //         let publishPage=cc.instantiate(this.publishPage);
        //         publishPage.getComponent("AdminOtherPage").refreshUI(data);
        //         cc.find("Canvas").addChild(publishPage);

        //     }
        // })
    },

    showUserInfo(data) {
        this.lblName.string = utils.getStringByLength(data.prop.name, 6);
        this.scheduleOnce(() => {
            utils.setHead(this.sprHead, data.prop.head);
        }, 0.5);
        // if (tbInfo.idx == data.idx) {
        //     this.lblName.string = utils.getStringByLength(data.prop.name, 6);
        //     this.scheduleOnce(() => {
        //         utils.setHead(this.sprHead, data.prop.head);
        //     }, 0.5);
        // } else {
        //     //第0局不显示名字和头像
        //     let name = tbInfo.turn == 0 ? "玩家" : data.prop.name;
        //     let avatarUrl = tbInfo.turn == 0 ? "" : data.prop.head;
        //     this.lblName.string = utils.getStringByLength(name, 6);
        //     this.scheduleOnce(() => {
        //         utils.setHead(this.sprHead, avatarUrl);
        //     }, 0.5);
        // }

    },

    showInfo: function (data) {
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
        // let newEvent = new cc.Event.EventCustom('playerInfo', true);
        // newEvent.detail = { idx: idx };
        // this.node.dispatchEvent(newEvent);
    },

    activeBanker: function (bool) {
        this.imgBanker.active = bool;
    },

    activeBln: function (bool) {
        this.nodeBln.active = true;
        this.nodeBln.stopAllActions();
        this.nodeBln.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(1), cc.delayTime(0.2), cc.fadeIn(1))));
    },
    /**显示报单 */
    activeBaodan: function (bool) {
        this.sprBaodan.active = bool;
    },
    /**显示托管状态 */
    activeAutoPlay: function (bool) {
        this.nodeAutoPlay.active = bool;
    },
    /**显示准备 */
    activeReady(bool) {
        this.readyIcon.active = bool;
    },
    /**改变剩余牌数 */
    changeCardCount(data) {
        this.cardCount.string=data+"";
    },
    /**炸弹改变积分 */
    showBombScores(index, wallet, value, callBack) {
        //改变总积分显示
        this.lblZongjifen.string = utils.formatGold(wallet, 2);

        if (value < 0) {
            this.scoreChange.getComponent(cc.Label).font = this.loseFont;
            this.scoreChange.getComponent(cc.Label).string =utils.formatGold(value) ;

        } else {
            this.scoreChange.getComponent(cc.Label).font = this.winFont;
            this.scoreChange.getComponent(cc.Label).string =  utils.formatGold(value);

        }
        this.scoreChange.anchorX = index == 1 ? 1 : 0;
        this.scoreChange.position = index == 1 ? cc.v2(-81, -108) : cc.v2(79, -108);
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


        let labelNode = this.clock.getChildByName("time").getComponent(cc.Label)
        labelNode.string = utils.isNullOrEmpty(value) ? "15" : "" + value;
        let times = utils.isNullOrEmpty(value) ? 15 : parseInt(value);
        labelNode.unscheduleAllCallbacks();
        this.clock.active = true;
        labelNode.schedule(() => {
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

    activeNiao(data){
        if(utils.isNullOrEmpty(data.ready)) return;
        //打鸟显示
        if (data.ready == 1) {
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

    }

});
