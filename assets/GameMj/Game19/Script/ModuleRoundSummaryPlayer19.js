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
const HuType = {
    'triplet': ' 碰碰胡x',
    'dragon': ' 豪华七小对x',
    'one': ' 幺九字x',
    'single': ' 十三幺x',
    'pair': ' 七对x',
    'mix': ' 混一色x',
    'pure': ' 清一色x',
    'sky': ' 天胡x',
    'kong': ' 杠花x',
    'draw': ' 自摸x',
    'combo': ' 连庄+',
    'flower': ' 花胡+',
    'follow':' 首轮跟张',
    'loser': ' 包牌',
    'shooter': ' 放炮',
    'winner': ' 接炮',
    'follow': ' 跟牌'
};
const TYPE_STR = {
    'ZHI': '点杠 x1',
    'KONG': '暗杠 x2',
    'BU': '明杠 x1',
    'PONG': '',
    'CHOW': '',
};
cc.Class({
    extends: cc.Component,

    properties: {
        // lblName: cc.Label,
        // lblId: cc.Label,
        // lblScore: cc.Label,
        // lblBird: cc.Label,
        // lblGang: cc.Label,
        // lblPiao: cc.Label,
        sprHead: require('../../../script/ui/common/Avatar'),
        lblTotal: cc.Label,
        lblHuStr: cc.Label,
        lblFlowerStr: cc.Label,
        lblGang: cc.Label,
        imgZhuang: cc.Node,
        imgHu: cc.Node,
        handContent: cc.Node,
        groundContent: cc.Node,
        flowerContent: cc.Node,
        card: cc.Prefab,
        group: cc.Prefab,
        huCard: cc.Node,
        winFont: cc.Font,

        loseFont: cc.Font
    },

    init(player, i, data) {
        this.sprHead.avatarUrl = tbInfo.players[i].prop.head;


        this.lblTotal.font = (player.score || 0) < 0 ? this.loseFont : this.winFont;
        this.lblTotal.string = player.score || 0;
        this.initPlayerHands(player);
        this.initGround(player);
        this.imgZhuang.active = player.host;
        this.imgHu.active = player.win;

        if (player.card) {
            this.huCard.getComponent('ModuleGroundCardsMJ').init(player.card, 0);
            this.huCard.active = true;
            this.huCard.scale = 0.8
        } else {
            this.huCard.active = false;

        }
        // lblHuStr
        // sender 炮手  loser 包牌
        let str = ''
        for (let key in player.special) {
            if (player.special[key] == 0)
                continue;
            str += HuType[key] + (player.special[key] < 0 ? '' : '' + player.special[key]);
        }

        for (let key in player.plus) {
            if (player.plus[key] == 0)
                continue;
            str += HuType[key] + (player.plus[key] < 0 ? '' : '' + player.plus[key]);
        }

        if (player.combo && player.combo > 0)
            str += ' 连庄 +' + player.combo;

        this.lblHuStr.string = str;
    },

    /**手牌 */
    initPlayerHands(player) {
        let zhong = 0;
        this.handContent.removeAllChildren();
        // player.hands.sort((a, b) => a - b);
        player.hands.forEach(card => {
            let node = cc.instantiate(this.card);
            node.active = true;
            node.scale = 0.85;//0.8; -443 -11
            node.parent = this.handContent;
            node.getComponent('ModuleGroundCardsMJ').init(card, 0);
            if (card == 0)
                zhong++;
        })
    },

    /**弃牌 */
    initGround(player) {
        this.flowerContent.removeAllChildren();
        this.groundContent.removeAllChildren();

        // bu 明杠  zhi 点杠  kong 暗杠 card   31 字
        let flowCount = 0;
        let gangStr = '';
        player.grounds.forEach((ground) => {
            if (ground.event == GameConfig.GameAction.FLOWER) {
                flowCount++;
                let node = cc.instantiate(this.card);
                node.active = true;
                node.scale = 0.8
                node.parent = this.flowerContent;
                node.getComponent('ModuleGroundCardsMJ').init(ground.card, 0);
                return;
            }
            if (ground.event == GameConfig.GameAction.ZHI || ground.event == GameConfig.GameAction.KONG || ground.event == GameConfig.GameAction.BU) {
                gangStr += ground.card > 30 ? ' 字' + TYPE_STR[ground.event] : ' ' + TYPE_STR[ground.event];
            }
            let node = cc.instantiate(this.group);
            node.active = true;
            node.parent = this.groundContent;
            node.scale = 0.55;//0.5;
            node.getComponent('ModuleGroundDetailMJ').init(ground, 0);
        });
        if (flowCount > 0)
            this.lblFlowerStr.string = flowCount + '花';

        this.lblGang.string = gangStr;
        // let gangStr="";
    },

    // update (dt) {},
});
