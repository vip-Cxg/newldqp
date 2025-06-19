// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { GameConfig } = require("../../../GameBase/GameConfig");
const Connector = require("../../NetWork/Connector");
const Cache = require("../../Script/Cache");
const utils = require("../../Script/utils");

cc.Class({
    extends: require('../../Script/PopBase'),

    properties: {
        lblScoreId: cc.EditBox,
        lblScore: cc.EditBox,

    },
    // 
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // resetProxyPwd(){
    //     if(this.proxyId.string==""){
    //         Cache.alertTip("请输入代理id")
    //         return;
    //     }
    //     Connector.request(GameConfig.ServerEventName.ProxyResetPwd,{id:parseInt(this.proxyId.string)},(data)=>{
    //         Cache.alertTip("重置成功");
    //     },null,(err)=>{
    //         Cache.showTipsMsg(utils.isNullOrEmpty(err.message)?"修改失败":err.message);
    //     })

    // },
    addCredit() {
        Cache.playSfx();
        if (utils.isNullOrEmpty(this.lblScoreId.string)) {
            Cache.alertTip("请输入代理id")
            return;
        }
        let reg = /^[0-9]*[1-9][0-9]*$/;
        if (!reg.test(this.lblScore.string)) {
            Cache.alertTip("请输入整数金额")
            return;
        }
        Cache.showConfirm("确认充值金额：" + this.lblScore.string, () => {
            Connector.request(GameConfig.ServerEventName.AdminSetCredit, { proxyID: parseInt(this.lblScoreId.string), credit: parseFloat(this.lblScore.string) * 100 }, (data) => {
                Cache.alertTip("上分成功");
            })
        })



    },
    reduceCredit() {
        Cache.playSfx();
        if (utils.isNullOrEmpty(this.lblScoreId.string)) {
            Cache.alertTip("请输入代理id")
            return;
        }
        let reg = /^[0-9]*[1-9][0-9]*$/;
        if (!reg.test(this.lblScore.string)) {
            Cache.alertTip("请输入整数金额")
            return;
        }
        Cache.showConfirm("确认下分金额：" + this.lblScore.string, () => {
            Connector.request(GameConfig.ServerEventName.AdminSetCredit, { proxyID: parseInt(this.lblScoreId.string), credit: parseFloat("-" + this.lblScore.string) * 100 }, (data) => {
                Cache.alertTip("下分成功");
            })
        })
    },

    searchCredit(){
        Connector.request(GameConfig.ServerEventName.AdminGetCredit, { proxyID: parseInt(this.lblScoreId.string)}, (data) => {
            
        })
    }
    // update (dt) {},
});
