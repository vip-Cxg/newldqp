// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        toggle: [cc.Toggle],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    show: function () {
        let nodeSummary = cc.find('Canvas/roundSummary');
        let nodeSummary0 = cc.find('Canvas/replay/roundSummary');
        if(nodeSummary)
            nodeSummary.active = true;
        if(nodeSummary0)
            nodeSummary0.active = true;
    },

    hide: function () {
        let nodeSummary = cc.find('Canvas/roundSummary');
        let nodeSummary0 = cc.find('Canvas/replay/roundSummary');
        //cc.log(nodeSummary);
        if(nodeSummary)
            nodeSummary.active = false;
        if(nodeSummary0)
            nodeSummary0.active = false;
    },

    // update (dt) {},
});
