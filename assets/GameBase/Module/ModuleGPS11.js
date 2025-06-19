let tbInfo = require("TableInfo");
let connector = require("Connector");
let ROUTE = require("ROUTE");
let cache = require('Cache');
let db = require('DataBase');

let formatFloat = function (src, pos) {
    return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
};
let calcDistance = function (loc1, loc2) {
    cc.log(JSON.stringify(loc1) + JSON.stringify(loc2));
    let x1 = (Math.PI / 180) * loc1.x;
    let x2 = (Math.PI / 180) * loc2.x;
    let y1 = (Math.PI / 180) * loc1.y;
    let y2 = (Math.PI / 180) * loc2.y;
    // 地球半径
    let r = 6371;

    // 两点间距离 km，如果想要米的话，结果*1000就可以了
    let d = Math.acos(Math.sin(x1) * Math.sin(x2) + Math.cos(x1) * Math.cos(x2) * Math.cos(y1 - y2)) * r;
    if(formatFloat(d, 1) < 1){
        return formatFloat(d * 1000, 1) + '米';
    }
    return formatFloat(d, 1) + "公里";
};

const replaceIP = function (ip) {
    if (ip == null)
        return '未知';
    return ip.substring(ip.lastIndexOf(":") + 1);
};

cc.Class({
    extends: cc.Component,

    properties: {
        sprHead: [cc.Sprite],
        lblName: [cc.Label],
        lblDistance: [cc.Label],
        lblIp: [cc.Label],
        lblRegeo:[cc.Label],
        nodeGPS: cc.Node,
        imgWarning: cc.Node,
        sprCheatName:[cc.Node],
        sprCheatHead:[cc.Node],
    },

    clear: function () {
        this.sprHead.forEach(spr => {
            spr.spriteFrame = null;
        });
        this.lblName.forEach(lbl => {
            lbl.string = '';
        });
        this.lblDistance.forEach(lbl => {
            lbl.string = '';
        });
        this.lblIp.forEach(lbl => {
            lbl.string = '';
        });
        this.lblRegeo.forEach(lbl => {
            lbl.string = '';
        })
    },

    checkIP: function () {
        let ip = [null, null, null,null];
        for (let i = 0; i < tbInfo.players.length; i++) {
            if (tbInfo.players[i] != null) {
                ip[i] = tbInfo.players[i].prop.ip;
            }
        }
        this.imgWarning.active = (ip[0] == ip[1] && ip[0] != null && ip[1] != null)
            || (ip[0] == ip[2] && ip[0] != null && ip[2] != null)
            || (ip[1] == ip[2] && ip[1] != null && ip[2] != null)
            || (ip[0] == ip[3] && ip[0] != null && ip[3] != null)
            || (ip[1] == ip[3] && ip[1] != null && ip[3] != null)
            || (ip[3] == ip[2] && ip[3] != null && ip[2] != null)

        if(this.imgWarning.active){
            if(db.gameType == 3 || db.gameType == 4 || db.gameType == 26){
                this.show();
            }  
        }
    },
    reset:function(){
        this.imgWarning.active = false;
    },
    warning: function () {
        this.imgWarning.runAction(
            cc.blink(5, 10)
        );
    },

    dissolve: function () {
        cache.playSfx();
        if (tbInfo.status != 0) {
            connector.gameMessage(ROUTE.CS_GAME_VOTE, {agree: true});
        }
        this.hide()
    },
    checkLoc : function(data){
        return data!= null && data.prop != null && data.prop.loc != null && data.prop.loc.x != 0 && data.prop.loc.y != 0;
    },
    show: function () {
        cache.playSfx();
        this.node.active = true;
        this.clear();
        let data = tbInfo.players;
        if(tbInfo.config.noCheat){
            this.sprCheatName.forEach(n=>n.active = true);
            this.sprCheatHead.forEach(h=>h.active = true);
            this.lblRegeo.forEach(l=>l.node.active = false);
        }
        data.forEach((player, i) => {
            if (player != null){
                this.sprHead[player.idx].node.active = true;
                this.sprHead[player.idx].spriteFrame = tbInfo.playerHead[player.idx];
                this.lblName[player.idx].string = player.prop.name;
                if(this.lblName[player.idx].node.width > 86){
                    this.lblName[player.idx].node.stopAllActions();
                    let width = this.lblName[player.idx].node.width;
                }
                this.lblIp[i].string = replaceIP(data[i].prop.ip);
            }
        });
        if(this.checkLoc(data[0]) && data[0].prop.loc.regeo!=null){
            this.lblRegeo[0].string = data[0].prop.loc.regeo;
        }

        if(this.checkLoc(data[1]) && data[1].prop.loc.regeo!=null)
            this.lblRegeo[1].string = data[1].prop.loc.regeo;

        if(this.checkLoc(data[2]) && data[2].prop.loc.regeo!=null)
            this.lblRegeo[2].string = data[2].prop.loc.regeo;


        if(this.checkLoc(data[3]) && data[3].prop.loc.regeo!=null)
            this.lblRegeo[3].string = data[3].prop.loc.regeo;

        this.lblRegeo.forEach(lbl=>{
            if(lbl.node.width > 140){
                lbl.node.stopAllActions();
                let width = lbl.node.width;
                lbl.node.runAction(cc.repeatForever(cc.sequence(
                    cc.delayTime(1),
                    cc.moveTo(4,(width)/2-60,0),
                    cc.delayTime(1),
                    cc.moveTo(4,-(width/2-60),0)
                )))
            }
        });


        if (this.checkLoc(data[0]) && this.checkLoc(data[1]))
            this.lblDistance[0].string = calcDistance(data[0].prop.loc, data[1].prop.loc);
        else
            this.lblDistance[0].string = "距离未知";
        if (this.checkLoc(data[0]) && this.checkLoc(data[2]))
            this.lblDistance[1].string = calcDistance(data[0].prop.loc, data[2].prop.loc);
        else
            this.lblDistance[1].string = "距离未知";
        if (this.checkLoc(data[0]) && this.checkLoc(data[3]))
            this.lblDistance[2].string = calcDistance(data[0].prop.loc, data[3].prop.loc);
        else
            this.lblDistance[2].string = "距离未知";
        if (this.checkLoc(data[1]) && this.checkLoc(data[2]))
            this.lblDistance[3].string = calcDistance(data[1].prop.loc, data[2].prop.loc);
        else
            this.lblDistance[3].string = "距离未知";
        if (this.checkLoc(data[1]) && this.checkLoc(data[3]))
            this.lblDistance[4].string = calcDistance(data[1].prop.loc, data[3].prop.loc);
        else
            this.lblDistance[4].string = "距离未知";
        if (this.checkLoc(data[2]) && this.checkLoc(data[3]))
            this.lblDistance[5].string = calcDistance(data[2].prop.loc, data[3].prop.loc);
        else
            this.lblDistance[5].string = "距离未知";

        let ip = [null, null, null,null];
        tbInfo.players.forEach((player, i) => {
            if (player != null){
                ip[i] = player.prop.ip;
            }
        });
        if (ip[0] == ip[1] && ip[0] != null) {
            this.lblDistance[0].string = "IP相同";
        }
        if (ip[0] == ip[2] && ip[0] != null) {
            this.lblDistance[1].string = "IP相同";
        }
        if (ip[0] == ip[3] && ip[0] != null) {
            this.lblDistance[2].string = "IP相同";
        }
        if (ip[1] == ip[2] && ip[1] != null) {
            this.lblDistance[3].string = "IP相同";
        }
        if (ip[1] == ip[3] && ip[1] != null) {
            this.lblDistance[4].string = "IP相同";
        }
        if (ip[2] == ip[3] && ip[2] != null) {
            this.lblDistance[5].string = "IP相同";
        }
    },

    hide: function () {
        cache.playSfx();
        this.node.active = false;
    }
});
