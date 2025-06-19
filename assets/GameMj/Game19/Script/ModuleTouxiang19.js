let TableInfo = require("TableInfo");
let connector = require("Connector");
let ROUTE = require("ROUTE");
const utils = require("../../../Main/Script/utils");
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

        titleSpr: cc.Sprite,
        voteSf: cc.SpriteFrame,
        confirmSf: cc.SpriteFrame,
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

    txInit(data) {
        console.log('投降----', data);
        console.log('投降---TableInfo.players-', TableInfo.players);

        if (data.status == "REFUSE" || data.status == "EMPTY") { //拒绝状态
            this.nodeVote.active = false;
            return;
        }
        this.titleSpr.spriteFrame = data.status == "VOTE" ? this.voteSf : this.confirmSf;

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
            this.lblStatus[i].node.color = cc.color(COLOR_VOTE[status]);//status ? color1 : color0;
        });


        TableInfo.players.forEach((player, i) => {
            if (player) {
                this.nodePlayer[i].active = true;
                this.lblName[i].node.stopAllActions();
                this.lblName[i].string = utils.getStringByLength(TableInfo.players[i].prop.name, 6);
                utils.setHead(this.sprHead[i], GameConfig.HeadUrl + TableInfo.players[i].prop.head)
            }

        });
    },


    refuse() {
        connector.gameMessage(ROUTE.CS_DISBAND, 'refuse');
    },

    agree() {
        connector.gameMessage(ROUTE.CS_DISBAND, 'allow');
    },
});
