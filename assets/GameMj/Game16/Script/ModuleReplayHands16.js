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
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        layoutGround:require('./ModuleHandGround16')
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init (hands) {
        this._hands = hands;
        //cc.log('init',this._hands);
        this.layoutHands = this.node.getChildByName('layoutHands');
        this.layoutGetCard = this.node.getChildByName('layoutGetCard');
        // this.layoutGround = this.node.getChildByName('layoutGround');
        this.handsArr = this.layoutHands.children.slice();
        this._hands.sort((a,b)=>a-b);
        this._hands.forEach(card=>{
            let idx = this.handsArr.findIndex(node=>node.active == false);
            if(idx >= 0){
                this.handsArr[idx].active = true;
                this.handsArr[idx].getComponent('ModuleCards16').init(card);
                this.handsArr[idx]._card = card;
            }
        })
    },

    action (data) {
        
        this.layoutGround.addGround(data);
        return;
        // let idx;
        // if(data.type != 'suo')
        //     idx = this.layoutGround.children.findIndex(node => node.active == false);
        // else
        //     idx = this.layoutGround.children.findIndex(node => node.msg.type == 'peng' &&  node.msg.card == data.card);
        // this.layoutGround.children[idx].msg = data;
        // this.layoutGround.children[idx].getComponent('ModuleGroundDetail16').init(data);
    },

    getCard (card) {
        this._hands.push(card);
        //cc.log('getCard',card);
        this.layoutGetCard.active = true;
        this.layoutGetCard.children[0].getComponent('ModuleCards16').init(card);
        this.layoutGetCard.children[0]._card = card;

    },

    removeCard (target) {
        let idx = this._hands.findIndex(card=>card == target);
        if(idx >= 0)
            this._hands.splice(idx,1);
    },

    sortCards () {
        this.layoutGetCard.active = false;
        this.layoutHands.children.forEach(card=>card.active = false);
        this._hands.sort((a,b)=>a-b);
        this._hands.forEach(card=>{
            let idx = this.handsArr.findIndex(node=>node.active == false);
            if(idx >= 0){
                this.handsArr[idx].active = true;
                this.handsArr[idx].getComponent('ModuleCards16').init(card);
                this.handsArr[idx]._card = card;
            }
        })
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

    // update (dt) {},
});
