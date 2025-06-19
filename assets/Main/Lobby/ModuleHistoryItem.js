let db = require("DataBase");
let connector = require("Connector");
let Cache = require('../Script/Cache');
cc.Class({
    extends: cc.Component,

    properties: {
        nodePlayer:[cc.Node],
        lblName: [],
        lblScore: [],
        lblId:[],
        lblRoomNum:cc.Label, 
        lblTime:cc.Label,
        btnDetail:cc.Node,
        preContentChild:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this.nodePlayer.forEach(player=>{
            // this.sprHead.push(player.getChildByName("sprHead").getComponent(cc.Sprite));
            this.lblScore.push(player.getChildByName("lblScore").getComponent(cc.Label));
            this.lblName.push(player.getChildByName("lblName").getComponent(cc.Label));
            this.lblId.push(player.getChildByName("lblId").getComponent(cc.Label));
        })
    },

    init (data) {
        this.lblName[0].string = data.userName0;
        this.lblName[1].string = data.userName1;
        this.lblName[2].string = data.userName2;
        this.lblName[3].string = data.userName3;

        this.lblId[0].string = data.userId0;
        this.lblId[1].string = data.userId1;
        this.lblId[2].string = data.userId2;
        this.lblId[3].string = data.userId3;

        this.lblScore[0].string = data.userScore0;
        this.lblScore[1].string = data.userScore1;
        this.lblScore[2].node.active = !(data.userScore2 == 0 && data.userName2 == '');
        this.lblScore[2].string = data.userScore2;
        this.lblScore[3].node.active = !(data.userScore3 == 0 && data.userName3 == '');
        this.lblScore[3].string = data.userScore3;
        let person = 0;
        this.lblScore.forEach( lbl =>{
            if(lbl.node.active){
                person ++;
            }
        });
        this.nodePlayer.forEach((player,idx)=>{
            player.active = idx<person;
        });

        let detailId = data.id;
        this.lblRoomNum.string = "房号:"+data.tableId;
        let logFlag = data.logFlag;
        let tableId = data.tableId;
        this.lblTime.string = "时间:" +new Date(data.gameDate).format("yyyy-MM-dd hh:mm:ss");
        this.btnDetail.on("touchend",()=>{
            Cache.playSfx();
            connector.request("detailLog",{id:db.player.id,logId:detailId},(data)=>{
                let history = cc.find('Canvas/winHistory');
                let nodeParent = history.getComponent('ModuleHistory').initHistoryDetail(this.lblName,person);
                for(let i=0; i<data.records.length; i++){
                    let detailChild = cc.instantiate(this.preContentChild);
                    detailChild.parent = nodeParent;
                    let bgContentChild = detailChild.getComponent("ModuleHistoryDetailItem");
                    bgContentChild.init(data.records[i],i,logFlag,tableId,person);
                }
            });

        });

    }
});