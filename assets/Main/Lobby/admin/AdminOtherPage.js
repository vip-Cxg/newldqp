// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const Connector = require("../../NetWork/Connector");
const Cache = require("../../Script/Cache");
const utils = require("../../Script/utils");
const { GoEasy } = require("../../GoEasy/GoEasy");
const { GameConfig } = require("../../../GameBase/GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        lblScore: cc.EditBox,
        lblMailTitle: cc.EditBox,
        lblMailContent: cc.EditBox,
        lblPlayerID:cc.Label,
        playerID:""
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    refreshUI(data){
        console.log("data----",data);
        this.playerID=data.prop.pid
        this.lblPlayerID.string="当前玩家ID :"+this.playerID;
    },
    
    onSendMail() {
        Cache.playSfx();

        if (utils.isNullOrEmpty(this.lblMailTitle.string)) {
            Cache.alertTip("请输入邮件标题")
            return;
        }

        if (utils.isNullOrEmpty(this.lblMailContent.string)) {
            Cache.alertTip("请输入邮件内容")
            return;
        }
        // {"date":"2020-11-10","title":"上分成功","content":"管理员[ID:100001] 为您上分 10000分"}

        let title = this.lblMailTitle.string;
        let content = this.lblMailContent.string;

        let reqData = { id: this.playerID, content, title };


        Cache.showConfirm("是否发送邮件", () => {
            Connector.request(GameConfig.ServerEventName.ProxyMail, reqData, (data) => {
                Cache.alertTip("发送成功");
            })
        })

    },

    addWellet() {
        Cache.playSfx();
        let reg = /^[0-9]*[1-9][0-9]*$/;
        if (!reg.test(this.lblScore.string)) {
            Cache.alertTip("请输入整数金额")
            return;
        }
        Cache.showConfirm("确认充值金额：" + this.lblScore.string, () => {
            Connector.request(GameConfig.ServerEventName.ProxyAdminChange, { id: parseInt(this.playerID), wallet: parseFloat(this.lblScore.string) * 100 }, (data) => {
                Cache.alertTip("上分成功");
            })
        })



    },
    reduceWellet() {
        Cache.playSfx();
        let reg = /^[0-9]*[1-9][0-9]*$/;
        if (!reg.test(this.lblScore.string)) {
            Cache.alertTip("请输入整数金额")
            return;
        }
        Cache.showConfirm("确认下分金额：" + this.lblScore.string, () => {
            Connector.request(GameConfig.ServerEventName.ProxyAdminChange, { id: parseInt(this.playerID), wallet: parseFloat("-" + this.lblScore.string) * 100 }, (data) => {
                Cache.alertTip("下分成功");
            })
        })
    },

    onFrozenUser(e,v){
        Cache.playSfx();
        Connector.request(GameConfig.ServerEventName.ProxyBan,{id:parseInt(this.playerID),status:v},(data)=>{
            Cache.alertTip(v=="normal"?"解封成功":"封号成功")
        })

    },
    onClickClose(){
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
    // update (dt) {},
});
