// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
let lineLength = 14;
let TableInfo = require('TableInfo');
const { GameConfig } = require('../../../GameBase/GameConfig');
let START_POS_X = [-177, 45];
let START_POS_Y = [-30, -150];
let RECT_X = [47, -56];
let RECT_Y = [56, 33];
cc.Class({
    extends: cc.Component,

    properties: {
        card: cc.Prefab,
        content: []
    },

    onLoad() {
        // this.node.children.forEach((node,i) => {
        //     node.idx = i;
        // })
    },

    init(data, idx) {
        // let lastPlayer = TableInfo.currentPlayer - 1 >= 0 ? (TableInfo.currentPlayer - 1) : (TableInfo.config.person - 1);
        // let realLastPlayer = TableInfo.realIdx[lastPlayer];
        this.reset();
        data.forEach((card, i) => {
            this.outCard(card, idx, false);
        })
    },

    removeCard() {
        cc.sprFlag.removeFromParent();
        cc.sprFlag.active = false;
        let node = this.content.pop();
        if (node)
            node.destroy();
    },

    outCard(card, realIdx, light) {
        //cc.log(this.node.getComponent(cc.Layout));
        let node = cc.instantiate(this.card);
        // if (realIdx == 0) {
        //     let startY = GameConfig.FitScreen > 0 ?0 : -30;
        //     node.position = cc.v2(START_POS_X[realIdx] + (this.content.length % lineLength) * RECT_X[realIdx], startY + RECT_Y[realIdx] * Math.floor(this.content.length / lineLength));
        //     console.log("出牌位置: ", node.position.x, node.position.y)
        // }
        // if (realIdx == 1) {
        //     node.position = cc.v2(START_POS_X[realIdx] + RECT_X[realIdx] * Math.floor(this.content.length / lineLength), START_POS_Y[realIdx] + (this.content.length % lineLength) * RECT_Y[realIdx]);
        // }
        node.getComponent('ModuleCards16').init(card,1.2);
        node._card = card;
        node.zIndex=500-this.node.childrenCount;
     

        TableInfo.outCards.push(card);
        node.active = true;
        this.content.push(node);

        if (realIdx == 0) {
            node.position=cc.v2(-this.node.width/2+node.width*((this.content.length-1)%18),18+(node.height-18)*Math.ceil(this.content.length/18))
        }
        if (realIdx == 1) {
            node.position=cc.v2(this.node.width/2-node.width*((this.content.length-1)%18),18-(node.height-18)*Math.ceil(this.content.length/18))
        }
        this.node.addChild(node);

        // node.zIndex = (realIdx == 0 || realIdx == 1) ? (3 - Math.floor(this.content.length + 1) / lineLength) : Math.floor(this.content.length + 1) / lineLength;
        // if (realIdx == 1)
            node.zIndex = realIdx == 0?50 - this.content.length:this.content.length;
        if (light) {
            cc.sprFlag.parent = node;
            cc.sprFlag.position = cc.v2(0, 60);
            cc.sprFlag.active = true;
            cc.sprFlag.stopAllActions();
            cc.sprFlag.runAction(cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.5, 0, 15),
                    cc.moveBy(0.5, 0, -15),
                )
            ));
        }
        return node;
    },

    showSameCard(card) {
        this.resetSameCard();
        this.node.children.forEach(node => {
            if (node.active && node._card == card) {
                node.color = cc.color(150, 150, 150);
            }
        })
    },

    resetSameCard(card) {
        this.node.children.forEach(node => {
            node.color = cc.color(255, 255, 255);
        })
    },

    reset(idx) {
        this.content = [];
        this.node.removeAllChildren();
        lineLength = TableInfo.options.person == 2 ? 14 : 10;
        // if (idx == 0 && lineLength == 14)
            // this.node.position = cc.v2(-219, -141);
    }

    // update (dt) {},
});
