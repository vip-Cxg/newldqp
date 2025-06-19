let logic = require("Logic07");
let tbInfo = require("TableInfo");
cc.Class({
    extends: cc.Component,

    properties: {
        layerHandCards:cc.Layout,
        sprDisnable:cc.Node,
        btnTip:cc.Button,
        canvas: cc.Node
    },

    tipsStart (autoplay) {
        this.sprDisnable.active = false;
        let hands = this.canvas.getComponent("SceneTable07").hands;
        let nodeGroup = this.layerHandCards.node.getComponent("LayerHandsCards07").nodeCards;
        let newHands = [];
        let newCurrent;
        hands.forEach(card => {
            newHands.push(card);       
        });
        
        // cc.log("this.node.tipsTime:" + this.node.tipsTime);
        let results = logic.autoplay(newHands, tbInfo.current, this.node.tipsTime,tbInfo.config);
        let result = results[this.node.tipsTime%results.length]
        // cc.log("提示结果",results,results.length,result);
        if (result == null){
            return;
        }
        if (result.length ==0){
            this.sprDisnable.active = true;
            this.node.getComponent(cc.Button).interactable = false;
            return;
        }
        tbInfo.tipResult = [];
        tbInfo.tipResult = result;
        this.node.tipsTime++;
        nodeGroup.forEach(card => {
            let bgCardMask = card.getChildByName("bgCardMask");
            bgCardMask.active = false;
            card._prior = false;
            card.setPosition(card.pos0);    
        });
        result.forEach(c => {
            for (let x = 0; x < nodeGroup.length; x++) {
                let card = nodeGroup[x];
                if (card._value == c && !card._prior) {
                    card._prior = true; 
                    card.position = card.pos1;   
                    return;
                }
            }
        });
        this.layerHandCards.node.getComponent("LayerHandsCards07").checkCurrent();
    }
});
