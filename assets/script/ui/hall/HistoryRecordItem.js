// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        lblType: cc.Label,
        lblTime: cc.Label,
        lblScore: cc.Label,
        lblRemarks: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    renderUI(data) {
        // createdAt: "2021-08-18T19:55:26.000Z"
        // gameType: "PDK_SOLO"
        // name: "-"
        // remarks: ""
        // userID: 100019
        // userScore: 360
        this.lblType.string=data.name;
        this.lblScore.string = data.userScore >= 0 ? '+' + (parseInt(data.userScore)/100).toFixed(2) : (parseInt(data.userScore)/100).toFixed(2);
        this.lblRemarks.string=data.remarks;
        this.lblTime.string=new Date(data.createdAt).format("yyyy-MM-dd hh:mm:ss")
    }
    // update (dt) {},
});
