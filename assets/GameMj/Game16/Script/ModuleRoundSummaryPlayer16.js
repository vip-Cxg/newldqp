// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
const { GameConfig } = require('../../../GameBase/GameConfig');
let tbInfo = require('../../../Main/Script/TableInfo');
const utils = require('../../../Main/Script/utils');
const GangType = {
    'ZHI': '点杠',
    'KONG': '暗杠',
    'BU': '明杠',
    'PONG': '',
    'CHOW': '',
}
cc.Class({
    extends: cc.Component,

    properties: {
        sprHead: cc.Sprite,
        lblName: cc.Label,
        lblId: cc.Label,
        lblScore: cc.Label,
        lblBird: cc.Label,
        lblGang: cc.Label,
        lblPiao: cc.Label,
        lblTotal: cc.Label,
        imgZhuang: cc.Sprite,
        layoutHands: cc.Node,
        layoutGround: cc.Node,
        card: cc.Prefab,
        group: cc.Prefab,
        gangType: cc.Prefab,
        huCard: cc.Node
    },

    init(player, i, data) {
        console.log("结算----", player, i, data);
        this.lblName.string = utils.getStringByLength(tbInfo.players[i].prop.name, 5);
        this.lblId.string = 'ID:' + tbInfo.players[i].prop.pid;
        utils.setHead(this.sprHead, tbInfo.players[i].prop.head);
        //this.sprHead.spriteFrame = tbInfo.playerHead[i] || this.commonHead;
        this.lblScore.string = utils.formatGold(player.scores.base );// utils.formatGold(player.scores.base);
        this.lblBird.string = utils.formatGold( player.scores.bird );// utils.formatGold(player.scores.bird);
        this.lblGang.string = utils.formatGold(player.scores.kong);//  utils.formatGold(player.scores.gang);
        this.lblPiao.string = utils.formatGold(player.scores.plus||0 );     // utils.formatGold(player.scores.piao);
        this.lblTotal.string = utils.formatGold(player.scores.turn||0);
        let countZhong = this.initPlayerHands(player);
        this.initGround(player);
        // cc.log('i',i);
        // cc.log('zhuang')
        this.imgZhuang.node.active = i == tbInfo.zhuang;
        //cc.log(tbInfo.zhuang);
        if (!utils.isNullOrEmpty(player.card)) {
            console.log("胡牌")
            this.huCard.getComponent('ModuleGroundCardsMJ').init(player.card,0);
            this.huCard.active = true;
            this.huCard.scale=GameConfig.FitScreen>0? 1.2:0.9;
            let huImg = this.node.getChildByName('info').getChildByName('hu');
            // let lightImg = this.node.getChildByName('guang');
            huImg.active = true;
            // lightImg.active = true;
            // lightImg.runAction(cc.repeatForever(cc.rotateBy(0.5, 15)));
        }
    },

    initPlayerHands(player) {
        let zhong = 0;
        this.layoutHands.parent.active = true;
        player.hands.sort((a, b) => a - b);
        player.hands.forEach(card => {
            let node = cc.instantiate(this.card);
            node.active = true;
            node.scale =GameConfig.FitScreen>0? 1.2:0.9;
            node.parent = this.layoutHands;
            node.getComponent('ModuleGroundCardsMJ').init(card, 0);
            if (card == 0)
                zhong++;
        })
        return zhong;
    },

    initGround(player) {
        if (player.grounds.length > 0)
            this.layoutGround.active = true;
        player.grounds.forEach((ground) => {

            let node = cc.instantiate(this.group);
            node.active = true;
            node.parent = this.layoutGround;
            node.scale = GameConfig.FitScreen>0? 0.8:0.55;//0.5;
            node.getComponent('ModuleGroundDetailMJ').init(ground, 0);
            // if (ground.type == "an" || ground.type == "fang" || ground.type == "suo") {
            if (ground.event == GameConfig.GameAction.ZHI || ground.event == GameConfig.GameAction.KONG || ground.event == GameConfig.GameAction.BU) {
                let anGang = cc.instantiate(this.gangType);
                anGang.getComponent(cc.Label).string = GangType[ground.event];
                anGang.position = cc.v2(0, 100);
                node.addChild(anGang);
            }
        });
    }
    // update (dt) {},
});
