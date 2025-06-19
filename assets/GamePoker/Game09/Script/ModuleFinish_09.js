
let tbInfo = require("TableInfo");
let audioCtrl = require("audio-ctrl");
const { GameConfig } = require("../../../GameBase/GameConfig");
cc.Class({
    extends: cc.Component,

    properties: {
        bgTable: cc.Layout,
        nodeYou: [cc.Node],
    },

    showRank: function (data) {
        let pos = [
            cc.v2(-cc.winSize.width / 2 + 70 + GameConfig.FitScreen, -240),
            cc.v2(cc.winSize.width / 2 - 70 - GameConfig.FitScreen, 35),
            cc.v2(-168, 244),
            cc.v2(-cc.winSize.width / 2 + 70 + GameConfig.FitScreen, 35)
        ]
        tbInfo.cuter = null;
        tbInfo.cutCards = null;
        let url = cc.url.raw(`resources/Audio/Common/winerVoice.mp3`);
        audioCtrl.getInstance().playSFX(url);
        let nodeRank = this.nodeYou[data.finish];
        tbInfo.players[data.idx].finish = data.finish;
        nodeRank.active = true;
        nodeRank.setPosition(0, 0);
        nodeRank.scale = 5;
        if (nodeRank)
            nodeRank.opacity = 0;
        nodeRank.runAction(cc.sequence(
            cc.spawn(
                cc.fadeIn(0.5),
                cc.scaleTo(0.5, 0.9)
            ),
            cc.scaleTo(0.2, 1.1),
            cc.scaleTo(0.2, 1),
            cc.moveTo(0.2, pos[tbInfo.realIdx[data.idx]])
        ));
    }

});
