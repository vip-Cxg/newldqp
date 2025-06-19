// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
const POS_PART = [cc.v2(-86, -4), cc.v2(212, -4), cc.v2(488, -4), cc.v2(769, -4)];
let tbInfo = require('TableInfo');
let cache = require('Cache');
let Native = require('native-extend');
let _social = Native.Social;
let utils = require("utils");
let connector = require('Connector');
cc.Class({
    extends: cc.Component,

    properties: {
        imgZhuang: [cc.Node],
        lblTid: cc.Label,
        lblDate: cc.Label,
        part: cc.Prefab,
        player: cc.Node,
        sprHead: [cc.Sprite],
        commonHead: cc.SpriteFrame
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init: function (data) {
        //this.player.removeAllChildren();
        this.sprHead.forEach((spr, i) => {
            spr.spriteFrame = tbInfo.playerHead[i] || this.commonHead;
        });
        if (data.byVote) {
            connector.disconnect();
        }
        let winScore = 0;
        for (let j = 0; j < tbInfo.config.person; j++) {
            if (data.playerSummary[j].scores[2] - winScore >= 0)
                winScore = data.playerSummary[j].scores[2];
        }
        this.lblTid.string = '房号: ' + data.room;
        for (let i = 0; i < tbInfo.config.person; i++) {
            let nodePart = cc.instantiate(this.part);
            nodePart.parent = this.player;
            nodePart.position = POS_PART[i];
            nodePart.getComponent('ModulePart16').init(data, data.playerSummary[i], i, winScore);
        }
        this.lblDate.string = new Date(data.time).format("yyyy-MM-dd hh:mm:ss");
        this.imgZhuang.forEach((node, i) => {
            node.active = i == tbInfo.zhuang;
        })
    },

    backHall: function () {
        cache.playSfx();
        setTimeout(() => {
            cc.game.removePersistRootNode(this.node);
            if (this.node) {
                this.node.destroy();
            }
        }, 500)

    },

    gameSummaryShare: function () {
        cache.playSfx();
        cache.showShare(this.node);
        // utils.screenShoot((file, thumbWidth, thumbHeight) => {
        //     _social.shareImageToFriendWithWX(file, thumbWidth, thumbHeight);
        // });
    },

    // update (dt) {},
});
