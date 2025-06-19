let audioCtrl = require('audio-ctrl');
cc.Class({
    extends: cc.Component,

    properties: {
        toggle: [cc.Toggle],
        //audioSfx: cc.AudioClip,
    },

    // use this for initialization
    onLoad: function () {
        // this.toggle[0].node.on('touchend',()=>{
        //     if(this.toggle[0].isChecked)
        //         this.show();
        // })
        //  this.toggle[1].node.on('touchend',()=>{
        //     if(this.toggle[1].isChecked)
        //         this.hide();
        // })
    },

    show: function () {
        let nodeSummary = cc.find('Canvas/nodeTable/roundSummary');
        let nodeSummary1 = cc.find('Canvas/roundSummary');
        let nodeSummary0 = cc.find('Canvas/replay/roundSummary');
        if (nodeSummary)
            nodeSummary.active = true;
        if (nodeSummary1)
            nodeSummary1.active = true;
        if (nodeSummary0)
            nodeSummary0.active = true;
    },

    hide: function () {
        let nodeSummary = cc.find('Canvas/nodeTable/roundSummary');
        let nodeSummary1 = cc.find('Canvas/roundSummary');
        let nodeSummary0 = cc.find('Canvas/replay/roundSummary');
        cc.log(nodeSummary);
        if (nodeSummary)
            nodeSummary.active = false;
        if (nodeSummary1)
            nodeSummary1.active = false;
        if (nodeSummary0)
            nodeSummary0.active = false;
    },

    playSound: function () {
        //audioCtrl.getInstance().playSFX(this.audioSfx);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
