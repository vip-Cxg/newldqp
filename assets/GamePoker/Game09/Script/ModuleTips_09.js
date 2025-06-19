let logic = require("Logic_09");
let TableInfo = require("TableInfo");
cc.Class({
    extends: cc.Component,

    properties: {
        layerHandCards:cc.Node,
        sprDisnable:cc.Node,
        btnTip:cc.Button,
        canvas: cc.Node
    },

    autoTip(){
        this.sprDisnable.active = false;
        let hands = this.canvas.getComponent("SceneTable09").hands;
        let nodeGroup = this.layerHandCards.getComponent("ModuleCards_09").nodeCards;
        let newHands = [];
        let newCurrent;
        hands.forEach(cards => {
            cards.forEach(c=>{
                newHands.push(c);       
            })
        });
        let result = logic.autoplay(newHands, TableInfo.current, this.node.tipsTime,TableInfo.config.shun);
        if (result == null){
            return;
        }
        if (result.length ==0){
            this.sprDisnable.active = true;
            this.node.getComponent(cc.Button).interactable = false;
            return;
        }   
    },

    tipsStart () {
        this.sprDisnable.active = false;
        let hands = this.canvas.getComponent("SceneTable09").hands;
        let nodeGroup = this.layerHandCards.getComponent("ModuleCards_09").nodeCards;
        let newHands = [];
        let newCurrent;
        hands.forEach(cards => {
            cards.forEach(c=>{
                newHands.push(c);       
            })
        });
        cc.log("newHands" ,newHands);
        cc.log("TableInfo.current" ,TableInfo.current);
        cc.log("this.node.tipsTime,TableInfo.config.shun" ,this.node.tipsTime,TableInfo.config.shun);
        cc.log("newHands" ,newHands);
        let result = logic.autoplay(newHands, TableInfo.current, this.node.tipsTime,TableInfo.config.shun);
        cc.log("提示结果",result);
        if (result == null){
            return;
        }
        if (result.length ==0){
            this.sprDisnable.active = true;
            this.node.getComponent(cc.Button).interactable = false;
            return;
        }
        TableInfo.tipResult = [];
        TableInfo.tipResult = result;
        this.node.tipsTime++;
        nodeGroup.forEach(cards => {
            cards.forEach(card=>{
                let bgCardMask = card.getChildByName("bgCardMask");
                bgCardMask.active = false;
                card._prior = false;
                card.isZhankai = false;
                card.setPosition(card.pos0);    
            })
        });
        result.forEach(c => {
            for (let x = 0; x < nodeGroup.length; x++) {
                for (let y = 0; y < nodeGroup[x].length; y++) {
                    let card = nodeGroup[x][y];
                    let bgCardMask = card.getChildByName("bgCardMask");
                    if (card._value == c && !bgCardMask.active) {
                        bgCardMask.active = true;
                        card._prior = true;   
                        if(nodeGroup[x].length >3){
                            nodeGroup[x].forEach(c=>{
                                c.setPosition(c.pos1);
                                c.isZhankai = true;      
                            }); 
                        }
                        return;
                    }
                }
            }
        });
        this.layerHandCards.getComponent("ModuleCards_09").checkCurrent();
    }
});
