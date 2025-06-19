let tbInfo = require("TableInfo");
let connector = require("Connector");
let ROUTE = require("ROUTE");
let db = require("DataBase");
let cache = require('Cache');


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
        imgWarning: cc.Node,
        lblRegeo: [cc.Label]
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
        //cc.log('哈哈哈哈哈哈哈哈');
        cc.log(tbInfo.players.length);

        for (let i = 0; i < tbInfo.players.length; i++) {
            if (tbInfo.players[i] != null) {
                ip[i] = replaceIP(tbInfo.players[i].prop.ip);
            }
        }
        cc.log(ip);
        // if( ( db.gameType == 6 || db.gameType == 7 ) && tbInfo.config.person == 2 ){

        //     this.imgWarning.active = (ip[0] == ip[1] && ip[0] != null && ip[1] != null);
        // } else {
        this.imgWarning.active = (ip[0] == ip[1] && ip[0] != null && ip[1] != null)
            || (ip[0] == ip[2] && ip[0] != null && ip[2] != null)
            || (ip[1] == ip[2] && ip[1] != null && ip[2] != null);
        //}

        if(this.imgWarning.active){
            // cc.log(tbInfo.players);
            // cc.log(tbInfo.playerName);
            // cc.log(tbInfo.playerHead);
            setTimeout(() => {
                this.show();
            },500);

            //cache.showTipsMsg('有玩家ip相同');    
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
        connector.gameMessage(ROUTE.CS_GAME_VOTE, {agree: true});
        this.hide()
    },
    checkLoc : function(data){
        return data!= null && data.prop != null && data.prop.loc != null && data.prop.loc.x != 0 && data.prop.loc.y != 0;
    },
    show: function () {
        this.clear();
        let data = tbInfo.players;
        data.forEach((player, i) => {
            if (player != null){
                this.sprHead[player.idx].node.active = true;
                this.sprHead[player.idx].spriteFrame = tbInfo.playerHead[player.idx];
                this.lblName[player.idx].node.active = true;
                this.lblName[player.idx].string = player.prop.name;
                if(this.lblName[player.idx].node.width > 86){
                    let width = this.lblName[player.idx].node.width;
                    this.lblName[player.idx].node.runAction(cc.repeatForever(cc.sequence(
                        cc.delayTime(1),
                        cc.moveTo(4,(80-width)/2,-2),
                        cc.delayTime(1),
                        cc.moveTo(4,(width-80)/2,-2)
                    )))
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
            lbl.node.stopAllActions();
            if(lbl.node.width > 140){
                let width = lbl.node.width;
                lbl.node.runAction(cc.repeatForever(cc.sequence(
                    cc.delayTime(1),
                    cc.moveTo(4,(width)/2-70,0.8),
                    cc.delayTime(1),
                    cc.moveTo(4,-(width/2-70),0.8)
                )))
             }
        });

        if (this.checkLoc(data[0]) && this.checkLoc(data[1])) {
            this.lblDistance[0].string = calcDistance(data[0].prop.loc, data[1].prop.loc);
        }
        else {
            this.lblDistance[0].string = "距离未知";
        }
        if (this.checkLoc(data[0]) && this.checkLoc(data[2])) {
            this.lblDistance[1].string = calcDistance(data[0].prop.loc, data[2].prop.loc);
        }
        else {
            this.lblDistance[1].string = "距离未知";
        }
        if (this.checkLoc(data[1]) && this.checkLoc(data[2])) {
            this.lblDistance[2].string = calcDistance(data[1].prop.loc, data[2].prop.loc);
        }
        else {
            if(this.lblDistance[2])
                this.lblDistance[2].string = "距离未知";
        }
        let ip = [null, null, null];
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
        if (ip[1] == ip[2] && ip[1] != null) {
            this.lblDistance[2].string = "IP相同";
        }
        this.node.active = true;
    },

    hide: function () {
        this.node.active = false;
    }
});
