const { GameConfig } = require('../../GameBase/GameConfig');
const utils = require('../../Main/Script/utils');
cc.Class({
    extends: cc.Component,

    properties: {
        // groundItem:cc.Prefab,
        selfHands: cc.Prefab,
        layoutGround: require('./ModuleHandGroundMJ'),
        layoutFlower: require('./ModuleFlowerMJ'),
    },

    onLoad() {
        this.layoutHands = this.node.getChildByName('layoutHands');
        this.layoutGetCard = this.node.getChildByName('layoutGetCard');
        this.layoutGetCard.runAction((cc.repeatForever(cc.sequence(cc.fadeTo(0.5, 130), cc.fadeTo(0.5, 255)))));
    },
    //TODO 传 realIdx
    init(player, realIdx) {
        this.node.active = true;
        console.log("初始化对方手牌-----", player)
        this.layoutGetCard.active = false;// player.hands.length > 13;

        this.layoutHands.removeAllChildren();
        player.hands.forEach((e) => {
            let card = cc.instantiate(this.selfHands);
            card.getComponent('ModuleGroundCardsMJ').init(e, realIdx, 0.7);
            this.layoutHands.addChild(card);
        })

        if (!utils.isNullOrEmpty(player.grounds)) {
            let groundArr = player.grounds.filter(e => e.event != GameConfig.GameAction.FLOWER);
            this.layoutGround.initGround(groundArr, realIdx);
            let flowerArr = player.grounds.filter(e => e.event == GameConfig.GameAction.FLOWER);
            this.layoutFlower.initFlower(flowerArr, realIdx);

        }
    },

    outCard(card) {

        console.log('出的牌', card)

        // if (this.layoutGetCard.active)
        //     this.layoutGetCard.active = false;
        // else {
        this.removeHands(card, 1);
        // }
    },

    getCard(data, realIdx) {

        // console.log("对面现在手牌数",----handsCount)
        this.layoutGetCard.active = true;
        this.layoutGetCard._card = data.card;
        this.layoutGetCard.getComponent('ModuleGroundCardsMJ').init(data.card, realIdx);
        this.layoutHands.removeAllChildren();
        let delCount = 0;
        data.hands.forEach((e) => {
            if(e==data.card&&delCount==0){
                delCount++;
                return;

            }
            let card = cc.instantiate(this.selfHands);

            card.getComponent('ModuleGroundCardsMJ').init(e, realIdx, 0.7);
            card._card = e;
         
            this.layoutHands.addChild(card);
        })
        // for (let i = 0; i < 13; i++) {
        //     this.layoutHands.children[i].active = i<handsCount;// true;
        // }
    },

    setHands(data) {
        console.log('--删除类型-', data);
        switch (data.event) {
            case GameConfig.GameAction.PONG:
            case GameConfig.GameAction.CHOW:
                console.log('--删除2张-');
                this.removeHands(data.card, 2);
                // this.removeHands(data.card);
                break;
            case GameConfig.GameAction.ZHI:
                console.log('--删除3张-');
                this.removeHands(data.card, 3);
                // this.removeHands(data.card);
                // this.removeHands(data.card);
                break;
            // case GameConfig.GameAction.FLOWER: //花不减牌
            case GameConfig.GameAction.SHOW:
                // case GameConfig.GameAction.BU:
                console.log('--删除1张-');
                this.removeHands(data.card);
                break;
            case GameConfig.GameAction.KONG:
                console.log('--删除4张-');
                this.removeHands(data.card, 3);
                // this.removeHands(data.card);
                // this.removeHands(data.card);
                // this.removeHands(data.card);

                break;
        }
    },

    removeHands(card, count) {
        console.log("开始删牌", card, count)

        let hands = this.layoutHands.children;

        this.layoutGetCard.active = false;
        hands.forEach((node) => {
            node.active = true;
        })
        let a = count;

        if (this.layoutGetCard._card == card) {
            console.log("删除抓拍", card, a)
            this.layoutGetCard._card = -1;
            a--;

        }
        hands.forEach((node) => {
            console.log("当前node", node._card, a)
            if (a == 0)
                return;
            if (node._card == card) {
                node.destroy();
                a--
            }

        })


        // let idx = hands.findIndex(node => node._card == card);
        // console.log('当前牌的index', card, idx);
        // if (idx >= 0) {
        //     hands[idx].destroy();
        // }




    },

    //碰吃杠 
    action(data, realIdx) {
        this.setHands(data);
        this.layoutGround.addGround(data, realIdx);
    },

    /**海南麻将  花 */
    actionflower(data, realIdx) {

        this.setHands(data);

        this.layoutFlower.addFlower(data, realIdx);
    },

    reset() {
        this.layoutGround.resetGround();
        this.layoutFlower.resetFlower();

        this.layoutGetCard.active = false;
        this.layoutHands.children.forEach(node => {
            node.active = false;
        });
    }
});
