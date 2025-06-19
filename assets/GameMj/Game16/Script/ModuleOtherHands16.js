// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        // groundItem:cc.Prefab,
        layoutGround:require('./ModuleHandGround16')
    },

    onLoad () {
        this.layoutHands = this.node.getChildByName('layoutHands');
        this.layoutGetCard = this.node.getChildByName('layoutGetCard');
        this.layoutGetCard.runAction((cc.repeatForever(cc.sequence(cc.fadeTo(0.5,130),cc.fadeTo(0.5,255) ) ) ));
    },

    init (player) {
        this.node.active = true;
        for(let i = 0; i < player.hands; i++){
            this.layoutHands.children[i].active = true;
        }
        if(player.ground){
            this.layoutGround.initGround(player.ground);
        }
    },

    outCard () {
        if(this.layoutGetCard.active)
            this.layoutGetCard.active = false;
        else {
            this.removeHands();
        }
    },

    getCard () {
        this.layoutGetCard.active = true;
    },

    setHands (data) {
        switch (data.type) {
            case 'peng':
                this.removeHands();
                this.removeHands();
                break;
            case 'fang':
                this.removeHands();
                this.removeHands();
                this.removeHands();
                break;
            case 'suo':
                this.removeHands();
                break;
            case 'an':
                this.removeHands();
                this.removeHands();
                this.removeHands();
                this.removeHands();
                break;
        }
    },

    removeHands () {
       //cc.log('removeHands');
       if(this.layoutGetCard.active == true){
           this.layoutGetCard.active = false;
           //cc.log(111);
           return;
        }
        let hands = this.layoutHands.children;
        let idx = hands.findIndex(node => node.active == true);
        //cc.log(idx);
        if(idx >= 0){
            hands[idx].active = false;
        }
    },

    action (data) {
        this.setHands(data);
        this.layoutGround.addGround(data);
    },

    reset () {
        this.layoutGround.resetGround();
        
        this.layoutGetCard.active = false;
        this.layoutHands.children.forEach(node=>{
            node.active = false;
        });
    }
});
