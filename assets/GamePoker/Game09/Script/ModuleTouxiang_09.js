let tbInfo = require("TableInfo");
let connector = require("Connector");
let ROUTE = require("ROUTE");
const utils = require("../../../Main/Script/utils");
const { GameConfig } = require("../../../GameBase/GameConfig");
cc.Class({
    extends: cc.Component,

    properties: {
        nodePlayer: [cc.Node],
        btnAgree: cc.Node,
        btnRefuse: cc.Node,
        nodeVote: cc.Node,

        preLblTips: cc.Prefab,
        lblTime: cc.Label,
        lblTips: cc.Label,
    },

    onLoad() {
        this.lblName = [];
        this.lblStatus = [];
        this.sprHead = [];
        this.nodePlayer.forEach((player) => {
            this.sprHead.push(player.getChildByName("sprHead").getComponent(cc.Sprite));
            this.lblStatus.push(player.getChildByName("lblStatus").getComponent(cc.Label));
            this.lblName.push(player.getChildByName("lblName").getComponent(cc.Label));
        })
    },

    txInit: function (data) {
        let numP = 0;
        this.nodeVote.active = true;
        let btnR = this.btnRefuse.getComponent(cc.Button);
        let btnA = this.btnAgree.getComponent(cc.Button);
        this.lblTips.string = "所有玩家同意或者倒计时" + data.voteTime + "秒以后解散";
        if (data.cancel != null) {
            this.nodeVote.active = false;
            cc.director.getScheduler().unscheduleAllForTarget(this);
            return;
        }
        cc.director.getScheduler().unscheduleAllForTarget(this);
        let time = data.voteTime;
        this.lblTime.string = time;
        this.schedule(() => {
            time--
            this.lblTime.string = Math.floor(Math.max(time, 0));
        }, 1);
        
        btnR.interactable = !data.vote[tbInfo.idx];
        btnA.interactable = !data.vote[tbInfo.idx];

        let color0 = cc.color("#d10602");
        let color1 = cc.color("#4ac93e");
        data.vote.forEach((status, i) => {
            this.lblStatus[i].string = status ? "同意" : "考虑中";
            this.lblStatus[i].node.color = status ? color1 : color0;
        });

        data.vote.forEach((status, i) => {
            if (status == true) {
                numP++;
            }
        });
        if (numP == 4) {
            this.nodeVote.active = false;
        }
        tbInfo.players.forEach((player, i) => {
            this.lblName[i].node.stopAllActions();
            this.lblName[i].string = player.idx == tbInfo.idx || !GameConfig.IsLeague ? utils.getStringByLength(tbInfo.players[i].prop.name, 6) : "玩家" + (player.idx + 1);
            if (this.lblName[i].node.width > 86) {
                let width = this.lblName[i].node.width;
                this.lblName[i].node.runAction(cc.repeatForever(cc.sequence(
                    cc.delayTime(1),
                    cc.moveTo(4, (80 - width) / 2, -2),
                    cc.delayTime(1),
                    cc.moveTo(4, (width - 80) / 2, -2)
                )))
            }
            if (player.idx == tbInfo.idx || !GameConfig.IsLeague)
                utils.setHead(this.sprHead[i], tbInfo.players[i].prop.head)
        });
    },


    refuse: function () {
        connector.gameMessage(ROUTE.CS_QUICK_FINISH, { vote: false });
    },

    agree: function () {
        connector.gameMessage(ROUTE.CS_QUICK_FINISH, { vote: true });
    },
});
