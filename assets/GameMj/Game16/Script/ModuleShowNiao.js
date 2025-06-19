// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const Cache = require("../../../Main/Script/Cache");

cc.Class({
    extends: cc.Component,

    properties: {
        sprCount: cc.Sprite,
        sfCountArr: [cc.SpriteFrame],
        countIcon: cc.Node,
        content_1: cc.Node,
        content_2: cc.Node,
        content_3: cc.Node,
        niaoCard: cc.Prefab,
        preRoundSummary: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    renderUI(data) {

        console.log("抓鸟数据",data);

        let birdCount = 0;
        // let pre = data.birds.length > 8 ? data.birds.length / 3 : 4;
        // data.birds.forEach((bird, i) => {
        //     let isZhongBirds = bird.hit; //data.zhongBirds.findIndex(bird => bird == card) >= 0;
        //     if (isZhongBirds)
        //         birdCount++;
        //     let niaoCard = cc.instantiate(this.niaoCard);
        //     niaoCard.getComponent('ModuleNiaoCards16').init(bird.card, isZhongBirds, i);
        //     if (data.birds.length < 4) {
        //         this.content_1.active = true;
        //         this.content_1.addChild(niaoCard);
        //     } else if (data.birds.length < 9) {
        //         this.content_1.active = true;
        //         this.content_2.active = true;
        //         this["content_" + (i % 2 + 1)].addChild(niaoCard);
        //     } else {

        //         this.content_1.active = true;
        //         this.content_2.active = true;
        //         this.content_3.active = true;
        //         this["content_" + (i % 3 + 1)].addChild(niaoCard);
        //     }

        // });
        // Cache.playSound("zhongma");
        // if (birdCount > 0 && birdCount <= 8) {
        //     this.sprCount.spriteFrame = this.sfCountArr[birdCount];
        // } else {
        //     this.sprCount.node.active = false;
        //     this.countIcon.active = false;
        // }
        if (data.birds.length > 0) {
            Cache.playSound("zhongma");
            let bird = data.birds[0]
            let niaoCard = cc.instantiate(this.niaoCard);
            niaoCard.getComponent('ModuleNiaoCards16').init(bird.card, true, 0);
            this.content_1.active = true;
            this.content_1.addChild(niaoCard);
            birdCount = bird.zhong
            this.sprCount.spriteFrame = this.sfCountArr[birdCount];
        } else {
            this.sprCount.node.active = false;
            this.countIcon.active = false;
        }
        setTimeout(() => {

            let node = cc.instantiate(this.preRoundSummary);
            node.parent = cc.find("Canvas");
            node.getComponent('ModuleRoundSummary16').init(data);
            node.active = true;
            if(this.node){
                this.node.removeFromParent();
                this.node.destroy();
            }
        }, 3000)
    }
    // update (dt) {},
});
