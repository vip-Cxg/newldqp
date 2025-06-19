let tbInfo = require("TableInfo");
let ROUTE = require("ROUTE");
let connector = require("Connector");
let audioCtrl = require("audio-ctrl");
const { GameConfig } = require("../../../GameBase/GameConfig");
let pos = [cc.v2(0, -298), cc.v2(430, 66), cc.v2(0, 209), cc.v2(-430, 66)];
let playerPos = [
    cc.v2(-522, -290),
    cc.v2(532, 106),
    cc.v2(-178, 244),
    cc.v2(-522, 107)
];
const START_POS = cc.v2(0, 66);
const LR_POS = [cc.v2(-400, 66), cc.v2(408, 66)];
cc.Class({
    extends: cc.Component,

    properties: {
        prePlayerInfo: cc.Prefab,
        preCards: cc.Prefab,
        prefBack: cc.Prefab,
        sliderDeal: cc.Slider,
        imgBackground: cc.Sprite,
        bgMask: cc.Layout,
        btnCut: cc.Node,
        canvas: cc.Node,
        sliderHand: cc.Slider,
        bgCutMask: cc.Layout,
        bgWaitCut: cc.Layout,
        nodeHand: cc.Node,
        nodeCut: cc.Node,
        btnTips: cc.Node,
        btnPlay: cc.Node,
        btnPass: cc.Node,
        nodeBtn: cc.Node,
        bgTable: cc.Layout,
        nodeShowCard:[]
    },

    onLoad: function () {
        this.nodeCut.active = true;
        this.sliderDeal.node.on("touchend", () => {
            cc.log(this.sliderDeal.progress);
            connector.gameMessage(ROUTE.CS_PROGRESS, { percent: this.sliderDeal.progress });
        });
        this.sliderHand.node.on("touchend", () => {
            cc.log(this.sliderHand.progress);
            connector.gameMessage(ROUTE.CS_PROGRESS, { percent: this.sliderHand.progress });
        });
        this.nodeHand.on("touchend", () => {
            cc.log(this.sliderHand.progress);
            connector.gameMessage(ROUTE.CS_PROGRESS, { percent: this.sliderHand.progress });
        });
        this.nodeHand.on("touchcancel", () => {
            cc.log(this.sliderHand.progress);
            connector.gameMessage(ROUTE.CS_PROGRESS, { percent: this.sliderHand.progress });
        });
        this.sliderHand.node.on("touchcancel", () => {
            cc.log(this.sliderHand.progress);
            connector.gameMessage(ROUTE.CS_PROGRESS, { percent: this.sliderHand.progress });
        });
        this.sliderDeal.node.on("touchcancel", () => {
            cc.log(this.sliderDeal.progress);
            connector.gameMessage(ROUTE.CS_PROGRESS, { percent: this.sliderDeal.progress });
        });

    },


    sendCut: function () {
        connector.gameMessage(ROUTE.CS_CUTE, {});
    },

    sliderCallBack: function () {
        let slider = this.sliderDeal.getComponent(cc.Slider);
        let sliderHand = this.sliderHand.getComponent(cc.Slider);
        this.imgBackground.fillRange = slider.progress;
        sliderHand.progress = slider.progress;
        this.progress = slider.progress
    },

    sliderHandCallBack: function () {
        let sliderHand = this.sliderHand.getComponent(cc.Slider);
        let slider = this.sliderDeal.getComponent(cc.Slider);
        slider.progress = sliderHand.progress;
        this.imgBackground.fillRange = slider.progress;
        this.progress = slider.progress;
    },

    showDeal: function () {
        this.nodeCut.active = true;
        this.btnCut.active = tbInfo.cuter == tbInfo.idx;
        this.bgCutMask.node.zIndex = 1000;
        this.sliderHand.progress = 0.5;
        this.imgBackground.fillRange = this.sliderHand.progress;
        this.nodeShowCard = [];
        this.sliderDeal.progress = 0.5;
        this.sliderDeal.node.zIndex = 101;
        for (let i = 0; i < 108; i++) {
            let node = cc.instantiate(this.prefBack);
            node.parent = this.node;
            node.setPosition(-400 + 8 * i, 66);
            this.imgBackground.node.active = true;
            this.sliderDeal.node.active = true;
            this.sliderHand.node.active = true;
            if (tbInfo.cuter != tbInfo.idx) {
                this.bgCutMask.node.active = true;
                this.bgWaitCut.node.active = true;
                let lbl = this.bgWaitCut.node.getChildByName("lblWait");
                let str = lbl.getComponent(cc.Label);
                let name = tbInfo.players[tbInfo.cuter].prop.name;
                str.string = "请等待 " + name + " 切牌";
            }
            this.nodeShowCard.push(node);
        }
    },

    cutHandMove: function (rd) {
        if (tbInfo.cuter == tbInfo.idx)
            return;
        this.sliderDeal.progress = rd;
        this.imgBackground.fillRange = rd;
        this.sliderHand.progress = rd;

    },

    cut: function (data) {
        let seq = [];
        let spawn = [];
        this.btnPlay.active = false;//打牌按键
        this.btnTips.active = false;//提示按键
        this.bgCutMask.node.active = false;//切牌遮罩
        this.bgWaitCut.node.active = false;//等待文字
        this.bgMask.node.active = false;//进度条遮罩
        this.sliderDeal.node.active = false;//滑动条
        this.sliderHand.node.active = false;//手
        this.btnCut.active = false;//切牌按键
        let slider = this.sliderDeal.getComponent(cc.Slider);
        let nodeCutCards;
        seq.push(cc.delayTime(1));
        let random = 0;
        let deckSpawn = [];

        let cutPosX = Math.floor(slider.progress * 100) * 8 - 400;
        nodeCutCards = cc.instantiate(this.preCards);
        nodeCutCards.parent = this.canvas;
        nodeCutCards.getComponent("ModuleCardsInit_09").init(data.showCard);
        nodeCutCards.setPosition(cutPosX, 66);
        deckSpawn.push(cc.targetedAction(nodeCutCards,
            cc.sequence(
                cc.place(START_POS),
                cc.delayTime(1.2),
                cc.hide()
            )));
        random = Math.random();
        let url = cc.url.raw(`resources/Audio/Common/deal07.mp3`);
        this.nodeShowCard.forEach((back, i) => {
            deckSpawn.push(cc.targetedAction(back,
                cc.sequence(
                    cc.moveTo(0.5, LR_POS[i < 50 ? 0 : 1]),
                    cc.delayTime(0.2),
                    cc.moveTo(0.4, START_POS),
                )));
        });
        seq.push(cc.spawn(deckSpawn));
        let dealSpawn = [];
        this.nodeShowCard.forEach((back, i) => {
            dealSpawn.push(cc.targetedAction(back,
                cc.sequence(
                    cc.delayTime(0.02 * i % 4),
                    cc.spawn(
                        cc.rotateBy(0.3, 90),
                        cc.scaleTo(0.3, 0.6),
                        cc.moveTo(0.6, pos[i % 4]),
                        cc.callFunc(() => {
                            if (i % 9 == 0)
                                audioCtrl.getInstance().playSFX(url)
                        }),
                        cc.sequence(
                            cc.delayTime(0.4),
                            cc.fadeOut(0.2)
                        )
                    ),
                    cc.callFunc(function () {
                        this.destroy();
                    }, back)
                )));
        });

        let playerPos = [

            cc.v2(-cc.winSize.width / 2 + 139 / 2 + GameConfig.FitScreen, -240 + 30),
            cc.v2(cc.winSize.width / 2 - 139 / 2 - GameConfig.FitScreen, 35 + 30),
            cc.v2(-168, 220 + 30),
            cc.v2(-cc.winSize.width / 2 + 139 / 2 + GameConfig.FitScreen, 35 + 30)
        ]

        dealSpawn.push(cc.targetedAction(nodeCutCards,
            cc.sequence(
                cc.delayTime(2 * random),
                cc.show(),
                cc.moveTo(0.4, playerPos[tbInfo.realIdx[data.currentIDX]]),
                cc.delayTime(1),
                cc.callFunc(function () {
                    this.destroy();
                }, nodeCutCards),
            )
        ));
        let cardsJs = cc.find("Canvas/nodeTable/nodehands/layerHandCards");
        let cards = cardsJs.getComponent("ModuleCards_09");
        let dealSeq = [cc.delayTime(0.05), cc.delayTime(0.05)];
        if (cards.nodeLbl.length > 0) {
            cards.nodeLbl.forEach((lbl, x) => {
                lbl.active = true;
                if (lbl)
                    lbl.opacity = 0;
                dealSeq.push(
                    cc.targetedAction(lbl, cc.sequence(cc.delayTime(2 + x * 0.2), cc.fadeIn(0.4)))
                );
            });
        }
        let handsSeq = [cc.delayTime(0.2)];
        cards.nodeCards.forEach((group, x) => {
            group.forEach((card, y) => {
                card.active = true;
                if (card)
                    card.opacity = 0;
                handsSeq.push(cc.targetedAction(card, cc.sequence(cc.delayTime(y / 3), cc.fadeIn(0.5))));
            });
        });
        spawn.push(cc.spawn(dealSpawn));
        spawn.push(cc.spawn(dealSeq));
        spawn.push(cc.spawn(handsSeq));
        seq.push(cc.spawn(spawn));
        seq.push(cc.delayTime(1));
        this.node.runAction(cc.sequence(seq));
    },
});
