// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
let lineLength = 0;
let tbInfo = require('TableInfo');
const { GameConfig } = require('../../GameBase/GameConfig');
const ROW = 3;
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
        // let lastPlayer = tbInfo.currentPlayer - 1 >= 0 ? (tbInfo.currentPlayer - 1) : (tbInfo.config.person - 1);
        // let realLastPlayer = tbInfo.realIdx[lastPlayer];
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
        let node = cc.instantiate(this.card);
        node._card = card;
        tbInfo.outCards.push(card);
        node.active = true;
        this.content.push(node);
        let nodeIndex = this.content.length - 1;
        node.getComponent('ModuleGroundCardsMJ').init(card, realIdx, 1.2);

        //弃牌区位置摆放
        let x = 0;
        let y = 0;
        switch (realIdx) {
            case 0:

                node.zIndex = Math.floor(nodeIndex / lineLength) % 2 == 0 ? 2 : 1;
                x = -this.node.width / 2 + node.width / 2 + (nodeIndex % lineLength) * node.width;
                y = Math.floor(nodeIndex / lineLength) % 2 == 0 ? node.height / 2 + Math.floor(nodeIndex / lineLength) / 2 * node.height * (12.5 / 60.5) : node.height * 3 / 2 + (Math.floor(Math.floor(nodeIndex / lineLength) / 2) - 1) * node.height * (12.5 / 60.5);
                console.log('node----', x, y)
                break;
            case 1:
                node.zIndex = lineLength - (nodeIndex % lineLength);
                node.rotation = 90;
                let width1 = node.height * (27 / 40);
                let height1 = node.width * (33 / 40);
                x = -this.node.width / 2 + width1 / 2 + (nodeIndex % lineLength) * width1 + (node.height * 9 / 40) * Math.floor(Math.floor(nodeIndex / lineLength) / 2);
                y = height1 / 2 + Math.floor(nodeIndex / lineLength) % 2 * height1;

                break;
            case 2:
                node.rotation = 180;
                node.zIndex = Math.floor(nodeIndex / lineLength);
                let width2 = node.width * (33 / 40);
                let height2 = node.height * (35 / 40);
                x = -this.node.width / 2 + width2 / 2 + (nodeIndex % lineLength) * width2;
                y = Math.floor(nodeIndex / lineLength) % 2 == 0 ? height2 / 2 - Math.floor(nodeIndex / lineLength) / 2 * height2 * (12.5 / 60.5) : height2 * 3 / 2 - (Math.floor(Math.floor(nodeIndex / lineLength) / 2) + 1) * height2 * (12.5 / 60.5);
                break;
            case 3:
                node.zIndex = nodeIndex % lineLength;
                node.rotation = -90;
                let width3 = node.height * (27 / 40);
                let height3 = node.width * (33 / 40);
                x = -this.node.width / 2 + width3 / 2 + (nodeIndex % lineLength) * width3 - (node.height * 9 / 40) * Math.floor(Math.floor(nodeIndex / lineLength) / 2);
                y = height3 / 2 + Math.floor(nodeIndex / lineLength) % 2 * height3;
                break;
        }


        node.position = cc.v2(x, y)
        this.node.addChild(node);
        if (light) {
            cc.sprFlag.parent = node;
            cc.sprFlag.position = cc.v2(0, 30); //出牌光标位置
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

    resetSameCard() {
        this.node.children.forEach(node => {
            node.color = cc.color(255, 255, 255);
        })
    },

    reset(idx) {
        this.content = [];
        if (tbInfo.config.person == 2)
            this.node.width = 750;
        lineLength = tbInfo.config.person == 2 ? 16 : 8;
        this.node.removeAllChildren();
        // let item = cc.instantiate(this.card);
        // lineLength = Math.floor(this.node.width / (item.width * 1.2))
        // console.log('一行最多' + lineLength + '个');

        // item.destroy();

    }

    // update (dt) {},
});
