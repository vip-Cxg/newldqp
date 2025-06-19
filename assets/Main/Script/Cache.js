let audioCtrl = require('audio-ctrl');
let db = require("DataBase");

module.exports = {
    preReplay: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    mjCards: null,
    winTips: null,
    openType: 0,
    /**显示正在连接 */
    showMask: function (str) {
        if (!cc.find("winMask")) return;

        if (this.maskTimeOut)
            clearTimeout(this.maskTimeOut)
        this.maskTimeOut = setTimeout(() => {
            let winMask = cc.find('winMask').getComponent('ModuleWinMask');
            if (str)
                winMask.lblMessage.string = str;
            else
                winMask.lblMessage.string = '正在连接中，请稍后';
            winMask.show();
        }, 500)
    },
    /**隐藏正在连接 */
    hideMask: function () {
        if (this.maskTimeOut)
            clearTimeout(this.maskTimeOut)
        if (cc.find("winMask"))
            cc.find('winMask').getComponent('ModuleWinMask').hide();
    },

    /**showToast */
    alertTip(str, pos) {
        cc.loader.loadRes("Main/Prefab/winTips", (err, prefeb) => {
            let emp = cc.instantiate(prefeb);
            emp.getComponent("ModuleWinTips").tipsInit(str, pos);
        });
    },
    /**右下角提示 */
    alertTipRightBottom(str) {
        let node = cc.find("Canvas/tipsRightBottom");
        if (node) return;
        cc.loader.loadRes("Main/Prefab/winTips", (err, prefeb) => {
            let emp = cc.instantiate(prefeb);
            emp.getComponent("ModuleWinTips").tipsRightBottom(str);
        });
    },
    /**隐藏右下角提示 */
    hideTipRightBottom(str) {
        let node = cc.find("Canvas/tipsRightBottom");
        if (node)
            node.getComponent("ModuleWinTips").hideTipsRightBottom(str);
    },
    /**
     * 右上角提示
     */
    alertTipPop(str) {
        cc.loader.loadRes("Main/Prefab/TipsPop", (err, prefeb) => {
            let emp = cc.instantiate(prefeb);
            emp.parent = cc.find("Canvas");
            emp.getComponent("ModuleTipsPop").showTips(str);
        });
    },
    /**显示提示框 */
    showConfirm: function (message, callback1, callback2, key = "") {
        // if(cc.find('Canvas/winConfirm')){
        //     // cc.find('Canvas/winConfirm').getComponent("ModuleWinConfirm").show('showConfirm', message, callback1, callback2, key);
        //     return;
        // }
        cc.loader.loadRes("Main/Prefab/winConfirm", (err, prefeb) => {
            // if(cc.find('Canvas/winConfirm')){
            //     // cc.find('Canvas/winConfirm').getComponent("ModuleWinConfirm").show('showConfirm', message, callback1, callback2, key);
            //     return;
            // }
            if (!err) {
                let emp = cc.instantiate(prefeb);
                emp.getComponent("ModuleWinConfirm").show('showConfirm', message, callback1, callback2, key);
            }
        });
    },
    /**显示数字输入框 
     *  @param title 标题
     *  @param type 数字类型
     *  @param callback 回调
     */
    showNumer(title = '', type, callback) {
        if (cc.find('Canvas/Number')) {
            cc.find('Canvas/Number').getComponent("Number").initCallback(title, type, callback);
            return;
        }
        cc.loader.loadRes("prefab/Number", (err, prefeb) => {
            if (cc.find('Canvas/Number')) {
                cc.find('Canvas/Number').getComponent("Number").initCallback(title, type, callback);
                return;
            }
            if (!err) {
                let emp = cc.instantiate(prefeb);
                emp.getComponent("Number").initCallback(title, type, callback);
                cc.find('Canvas').addChild(emp)
            }
        });
    },
    /**播放点击音效 */
    playSfx() {
        let url = cc.url.raw('resources/Audio/Common/click.mp3');
        audioCtrl.getInstance().playSFX(url);
    },
    /**播放表情动画音效 */
    playAnimSound(animName) {
        let url = cc.url.raw('resources/Audio/Common/anim' + animName + ".mp3");
        audioCtrl.getInstance().playSFX(url);
    },
    /**播放音效 */
    playSound(animName) {
        let url = cc.url.raw('resources/Audio/Common/' + animName + ".mp3");
        audioCtrl.getInstance().playSFX(url);
    },
    /**显示提示语 */
    showTipsMsg(message, callback, key = "") {
        cc.loader.loadRes("Main/Prefab/winConfirm", (err, prefeb) => {
            let emp = cc.instantiate(prefeb);
            emp.getComponent("ModuleWinConfirm").show('showTipsMsg', message, callback, null, key);
        });
    },
    /**显示提示语 */
    inputInviterPop: function (msg, callback) {
        // let bgNode=new cc.Node();
        // bgNode.width=150;
        // bgNode.=150;
        cc.loader.loadRes("Main/Prefab/InviterPop", (err, prefeb) => {
            let emp = cc.instantiate(prefeb);
            emp.getComponent("ModuleInviterPop").show(msg, callback);
            cc.find("Canvas").addChild(emp)
        });
    }
};
