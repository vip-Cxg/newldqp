let TableInfo = require("TableInfo");
let connector = require("Connector");
let ROUTE = require("ROUTE");
const utils = require("../../../Main/Script/utils");
const Cache = require("../../../Main/Script/Cache");
const { GameConfig } = require("../../../GameBase/GameConfig");
const DESC_VOTE = {
    'wait': '考虑中',
    'allow': '同意',
    'refuse': '拒绝'
}
const COLOR_VOTE = {
    'wait': '#0A5ECF',
    'allow': '#4ac93e',
    'refuse': '#d10602'
}
cc.Class({
    extends: cc.Component,

    properties: {
        nodePlayer: [cc.Node],
        btnAgree: cc.Node,
        btnRefuse: cc.Node,
        nodeVote: cc.Node,

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
        if (data.status == "REFUSE" || data.status == "EMPTY") { //拒绝状态
            this.nodeVote.active = false;
            return;
        }
        let numP = 0;
        this.nodeVote.active = true;
        let btnR = this.btnRefuse.getComponent(cc.Button);
        let btnA = this.btnAgree.getComponent(cc.Button);
        this.lblTips.string = "等待其他玩家同意";
        if (data.cancel != null) {
            this.nodeVote.active = false;
            cc.director.getScheduler().unscheduleAllForTarget(this);
            return;
        }
        cc.director.getScheduler().unscheduleAllForTarget(this);
        let time = Math.floor((data.clock - utils.getTimeStamp()) / 1000);
        this.lblTime.string = Math.max(time, 0);;
        this.schedule(() => {
            time--
            this.lblTime.string = Math.max(time, 0);
        }, 1);
        btnR.interactable = data.data[TableInfo.idx] == 'wait';
        btnA.interactable = data.data[TableInfo.idx] == 'wait';

        let color0 = cc.color("#d10602");
        let color1 = cc.color("#4ac93e");
        data.data.forEach((status, i) => {
            this.lblStatus[i].string = DESC_VOTE[status];
            this.lblStatus[i].node.color = cc.color(COLOR_VOTE[status]);
        });

        TableInfo.players.forEach((player, i) => {
            if (utils.isNullOrEmpty(player)) {
                this.nodePlayer[i].active = false;
                return;
            }
            this.nodePlayer[i].active = true
            this.lblName[i].node.stopAllActions();
            this.lblName[i].string = utils.getStringByLength(TableInfo.players[i].prop.name, 6);
            if (this.lblName[i].node.width > 86) {
                let width = this.lblName[i].node.width;
                this.lblName[i].node.runAction(cc.repeatForever(cc.sequence(
                    cc.delayTime(1),
                    cc.moveTo(4, (80 - width) / 2, -2),
                    cc.delayTime(1),
                    cc.moveTo(4, (width - 80) / 2, -2)
                )))
            }
            utils.setHead(this.sprHead[i], TableInfo.players[i].prop.head)
        });
    },


    refuse: function () {
        Cache.playSfx();
        connector.gameMessage(ROUTE.CS_DISBAND, 'refuse');
    },

    agree: function () {
        Cache.playSfx();
        connector.gameMessage(ROUTE.CS_DISBAND, 'allow');
        // connector.gameMessage(ROUTE.CS_QUICK_FINISH,{data :true});
    },
});
