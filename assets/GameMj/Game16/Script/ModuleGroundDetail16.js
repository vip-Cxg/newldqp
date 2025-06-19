// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
let TableInfo = require('TableInfo');
const { GameConfig } = require('../../../GameBase/GameConfig');
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    init(data) {
        console.log("弃牌-----", data)
        switch (data.event) {
            case GameConfig.GameAction.PONG:
                TableInfo.outCards.push(data.card);
                TableInfo.outCards.push(data.card);
                break;
            case GameConfig.GameAction.CHOW:
                TableInfo.outCards.push(data.card[0]);
                TableInfo.outCards.push(data.card[1]);
                TableInfo.outCards.push(data.card[2]);
                break;
            default:
                TableInfo.outCards.push(data.card);
                TableInfo.outCards.push(data.card);
                TableInfo.outCards.push(data.card);
                if (data.from == data.idx)
                    TableInfo.outCards.push(data.card);
                break;
        }
        
        this.node.active = true;
        if (data.type == GameConfig.GameAction.KONG) {
            this.node.children.forEach((node, i) => {
                node.getComponent('ModuleCards16').init(data.card);
                node.active = true;
                node.getChildByName('an').active = i != 3;
            });
            return;
        }
        this.node.children.forEach((node, i) => {
            // node.active = data.type == 'suo' || data.type == 'fang' || ((data.type == 'peng' || data.type == 'chi') && node._name != 'gang');
            node.active =true;
            node.getComponent('ModuleCards16').init(data.type == GameConfig.GameAction.CHOW ? data.card[i] : data.card);
            node.getChildByName('an').active = false;
        })
    },

    // update (dt) {},
});
