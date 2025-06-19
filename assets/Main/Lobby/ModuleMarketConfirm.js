const { GameConfig } = require("../../GameBase/GameConfig");
const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn:cc.Node,
        lblChannel:cc.Label,
        lblBtnWord:cc.Label,
        confirmBtn:cc.Node,
        marketData:null,
    },

    
    onLoad() {
        this.addEvents();
    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
    },
    /**更新UI */
    initData(data,channel) {
        this.marketData=data;
        this.lblBtnWord.string=this.marketData.operate=="buy"?"确认出售":"已付款";
        this.lblChannel.string=this.marketData.operate=="buy"?"出售金额: "+this.marketData.amount:"支付信息："+this.marketData.seller[channel];
    },

    onClickConfirm(){
        Cache.playSfx();
        Connector.request(GameConfig.ServerEventName.OTCConfirm,{marketID:this.marketData.id},(data)=>{
            //确认出售或已付款
            this.onClickClose()
        })
    },

    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
    onDestroy() {
        this.removeEvents();
    }

});
