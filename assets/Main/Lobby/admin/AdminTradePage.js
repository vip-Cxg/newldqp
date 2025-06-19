// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { GameConfig } = require("../../../GameBase/GameConfig");
const Connector = require("../../NetWork/Connector");
const utils = require('../../Script/utils');
cc.Class({
    extends: require('../../Script/PopBase'),

    properties: {
        buyerInput: cc.EditBox,
        sellerInput: cc.EditBox,
        tradeItem: cc.Prefab,
        tradeContainer: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.searchTrade()
    },

    searchTrade() {
        // condition.status   condition.buyerID  condition.sellerID  condition.strDate
        let req = {
            status: 'service'
        }
        if (!utils.isNullOrEmpty(this.buyerInput.string))
            req.buyerID = this.buyerInput.string;
        if (!utils.isNullOrEmpty(this.sellerInput.string))
            req.sellerID = this.sellerInput.string;
        this.tradeContainer.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.OTCAdminTradeList, { condition: req }, (res) => {
            if(!utils.isNullOrEmpty(res.trades)){
                res.trades.forEach(element => {
                    let tradeItem=cc.instantiate(this.tradeItem);
                    tradeItem.getComponent('AdminTradeItem').initData(element);
                    this.tradeContainer.addChild(tradeItem);
                });
            }
        })
    }
    // update (dt) {},
});
