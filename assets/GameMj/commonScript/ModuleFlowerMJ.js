// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
let tbInfo = require('TableInfo');
const { GameConfig } = require('../../GameBase/GameConfig');
const utils = require('../../Main/Script/utils');

cc.Class({
    extends: cc.Component,

    properties: {
        card: cc.Prefab,
        content: []
    },

    onLoad() {
    },

    /**初始化花牌区 */
    initFlower(data, realIdx) {

        if (utils.isNullOrEmpty(data))
            return;

        this.resetFlower();
        data.forEach((card, i) => {
            this.addFlower(card, realIdx);
        })
    },

    /**重置花牌区 */
    resetFlower() {
        this.content = [];
        this.node.removeAllChildren();
    },

    /**添加一个花牌 */
    addFlower(data, realIdx) {
        let node = cc.instantiate(this.card);
    
        node.getComponent('ModuleGroundCardsMJ').init(data.card, realIdx);
        node._card = data.card;
        //TODO
        // tbInfo.outCards.push(data.card);
        node.active = true;
        this.node.addChild(node);

        return node;
    },




    // update (dt) {},
});
