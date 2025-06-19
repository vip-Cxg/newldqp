// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const Cache = require("./Cache");
const TableInfo = require("./TableInfo");
const utils = require("./utils");

cc.Class({
    extends: cc.Component,

    properties: {
        lblDistance: [cc.Label],
        userName: [cc.Label],
        avatar: [cc.Sprite],
        unknowPos: [cc.Node],
        lblIp: [cc.Label],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.clearInfo();
        this.updateInfo()
    },
    clearInfo() {
        this.lblDistance.forEach(lbl => {
            lbl.string = '';
        });
        this.lblIp.forEach(lbl => {
            lbl.string = '';
        });

    },

    updateInfo() {
        let data = [null, null, null, null];
        let ip = [null, null, null, null];
        if (utils.isNullOrEmpty(TableInfo.players)) return;

        TableInfo.players.forEach((player) => {
            if (utils.isNullOrEmpty(player.prop)) return;
            data[TableInfo.realIdx[player.idx]] = player;
            ip[TableInfo.realIdx[player.idx]] = player.prop.ip;

        })

        if (ip[0] == ip[1] && ip[0] != null && ip[1] != null) {
            this.lblIp[0].string = "ip相同"
        } else {
            this.lblIp[0].string = ""
        }
        if (ip[0] == ip[2] && ip[0] != null && ip[2] != null) {
            this.lblIp[1].string = "ip相同"
        } else {
            this.lblIp[1].string = ""
        }
        if (ip[0] == ip[3] && ip[0] != null && ip[3] != null) {
            this.lblIp[2].string = "ip相同"
        } else {
            this.lblIp[2].string = ""
        }
        if (ip[1] == ip[2] && ip[1] != null && ip[2] != null) {
            this.lblIp[3].string = "ip相同"
        } else {
            this.lblIp[3].string = ""
        }
        if (ip[1] == ip[3] && ip[1] != null && ip[3] != null) {
            this.lblIp[4].string = "ip相同"
        } else {
            this.lblIp[4].string = ""
        }
        if (ip[2] == ip[3] && ip[2] != null && ip[3] != null) {
            this.lblIp[5].string = "ip相同"
        } else {
            this.lblIp[5].string = ""
        }


        console.log("GPS---",data)
        data.forEach((player, i) => {
            if (utils.isNullOrEmpty(player)||utils.isNullOrEmpty(player.prop)) {
                this.userName[i].string = "";
                return;
            }
            if (TableInfo.turn == 0 && player.idx != TableInfo.idx) {
                this.userName[i].string = "未知";
                return;
            }
        console.log("GPS--1-",player)

            if (player.location.lat == 0 && player.location.long == 0) {
                this.unknowPos[i].active = true;
            }
            if (TableInfo.options.mode == 'CUSTOM') {
                this.userName[i].string = utils.getStringByLength(player.prop.name, 6);
                let avatarNode = this.avatar[i]
                utils.setHead(avatarNode, player.prop.head);
            } else {
                this.userName[i].string = player.idx != TableInfo.idx ? "玩家" + (player.idx + 1) : utils.getStringByLength(player.prop.name, 6);
                if (player.idx == TableInfo.idx) {
                    let avatarNode = this.avatar[i]
                    utils.setHead(avatarNode, player.prop.head);
                }
            }

        });

        if (this.checkPlayer(data[0]) && this.checkPlayer(data[1])) {
            let res = utils.judgeDistance(data[0].location, data[1].location, 500);
            this.lblDistance[0].node.color = res ? new cc.color(255, 0, 0, 255) : new cc.color(13, 201, 13, 255);
            this.lblDistance[0].string = utils.getDistance(data[0].location, data[1].location);
        } else {
            this.lblDistance[0].node.color = new cc.color(0, 0, 0, 255);
            this.lblDistance[0].string = "";
        }

        if (this.checkPlayer(data[0]) && this.checkPlayer(data[2])) {
            let res = utils.judgeDistance(data[0].location, data[2].location, 500);
            this.lblDistance[1].node.color = res ? new cc.color(255, 0, 0, 255) : new cc.color(13, 201, 13, 255);
            this.lblDistance[1].string = utils.getDistance(data[0].location, data[2].location);
        } else {
            this.lblDistance[1].node.color = new cc.color(0, 0, 0, 255);
            this.lblDistance[1].string = "";
        }

        if (this.checkPlayer(data[0]) && this.checkPlayer(data[3])) {
            let res = utils.judgeDistance(data[0].location, data[3].location, 500);
            this.lblDistance[2].node.color = res ? new cc.color(255, 0, 0, 255) : new cc.color(13, 201, 13, 255);
            this.lblDistance[2].string = utils.getDistance(data[0].location, data[3].location);
        } else {
            this.lblDistance[2].node.color = new cc.color(0, 0, 0, 255);
            this.lblDistance[2].string = "";
        }

        if (this.checkPlayer(data[1]) && this.checkPlayer(data[2])) {
            let res = utils.judgeDistance(data[1].location, data[2].location, 500);
            this.lblDistance[3].node.color = res ? new cc.color(255, 0, 0, 255) : new cc.color(13, 201, 13, 255);
            this.lblDistance[3].string = utils.getDistance(data[1].location, data[2].location);
        } else {
            this.lblDistance[3].node.color = new cc.color(0, 0, 0, 255);
            this.lblDistance[3].string = "";
        }

        if (this.checkPlayer(data[1]) && this.checkPlayer(data[3])) {
            let res = utils.judgeDistance(data[1].location, data[3].location, 500);
            this.lblDistance[4].node.color = res ? new cc.color(255, 0, 0, 255) : new cc.color(13, 201, 13, 255);
            this.lblDistance[4].string = utils.getDistance(data[1].location, data[3].location);
        } else {
            this.lblDistance[4].node.color = new cc.color(0, 0, 0, 255);
            this.lblDistance[4].string = "";
        }

        if (this.checkPlayer(data[2]) && this.checkPlayer(data[3])) {
            let res = utils.judgeDistance(data[2].location, data[3].location, 500);
            this.lblDistance[5].node.color = res ? new cc.color(255, 0, 0, 255) : new cc.color(13, 201, 13, 255);
            this.lblDistance[5].string = utils.getDistance(data[2].location, data[3].location);
        } else {
            this.lblDistance[5].node.color = new cc.color(0, 0, 0, 255);
            this.lblDistance[5].string = "";
        }
        // });
    },
    checkPlayer: function (data) {
        return data != null && data.prop != null && data.location != null && data.location.lat != 0 && data.location.long != 0;
    },

    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
    // update (dt) {},
});
