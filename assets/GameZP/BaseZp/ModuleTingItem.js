cc.Class({
    extends: cc.Component,

    properties: {
        spriteFrame: [cc.SpriteFrame],
        cardCount:cc.Label
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (data,show,count) {
        let sprite;
        if(!show){
            sprite = this.node.getComponent(cc.Sprite);
            
        } else{
            sprite = this.node.getChildByName('2').getComponent(cc.Sprite);
        }
        sprite.spriteFrame = this.spriteFrame[data];
        this.node.value = data;
        this.cardCount.string=count+"张"
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // },
});
