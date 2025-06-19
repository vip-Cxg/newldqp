cc.Class({
    extends: cc.Component,

    properties: {
        spriteFrame: [cc.SpriteFrame],
        imgPao: cc.Node,
        imgBlin: cc.Node
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (data,show,pao,blin) {
        let sprite;
        if(!show){
            sprite = this.node.getComponent(cc.Sprite);
            
        } else{
            sprite = this.node.getChildByName('2').getComponent(cc.Sprite);
        }
        sprite.spriteFrame = this.spriteFrame[data];
        this.node.value = data;
        if(pao)
            this.imgPao.active = pao;
        if(blin)
            this.imgBlin.active = blin;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
