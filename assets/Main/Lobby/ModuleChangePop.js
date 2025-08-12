const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const DataBase = require("../Script/DataBase");
const utils = require("../Script/utils")
const { GameConfig } = require("../../GameBase/GameConfig");
const { App } = require("../../script/ui/hall/data/App");

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Node,
        codeBtn: cc.Node,
        ensureBtn: cc.Node,

        newPwdInput: cc.EditBox,
        ensurePwdInput: cc.EditBox,

        oldPhone: cc.Label,
        newPhone: cc.EditBox,

        codeInput: cc.EditBox,
        changeType: "",
        codeDownTime: 60,
        callBack: null
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.codeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickCode, this);
        this.ensureBtn.on(cc.Node.EventType.TOUCH_END, this.onClickEnsure, this);

    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.codeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickCode, this);
        this.ensureBtn.off(cc.Node.EventType.TOUCH_END, this.onClickEnsure, this);
    },


    /**更新UI数据 */
    refreshUIData(changeType, callBack) {
        this.callBack = callBack;
        this.changeType = changeType;
        switch (changeType) {
            case "pwd":
                this.newPwdInput.node.active = true;
                this.ensurePwdInput.node.active = true;
                this.oldPhone.node.active = false;
                this.newPhone.node.active = false;
                this.codeInput.node.active = false;
                break;
            case "phone":
                this.newPwdInput.node.active = false;
                this.ensurePwdInput.node.active = false;
                this.oldPhone.node.active = true;
                this.newPhone.node.active = true;
                this.codeInput.node.active = true;

                this.oldPhone.string = !DataBase.player.hasBind ? "旧手机号:  未绑定手机" : '旧手机号:  ' + DataBase.player.phone;


                break;
        }
    },

    /** 获取验证码*/
    onClickCode() {
        Cache.playSfx();

        if (this.codeDownTime != 60) return;
        let phone = "";
        switch (this.changeType) {
            case "pwd":

                if (!DataBase.player.hasBind) {
                    Cache.alertTip("请先绑定手机号");
                    return;
                }
                if (utils.isNullOrEmpty(this.newPwdInput.string)) {
                    Cache.alertTip("请输入新密码");
                    return;
                }
                if (utils.isNullOrEmpty(this.ensurePwdInput.string)) {
                    Cache.alertTip("请重复密码");
                    return;
                }
                if (this.ensurePwdInput.string != this.newPwdInput.string) {
                    Cache.alertTip("密码不一致");
                    return;
                }
                phone = DataBase.player.phone;
                break;
            case "phone":

                let bool = utils.checkPhone(this.newPhone.string);
                if (!bool) {
                    Cache.alertTip("手机号码格式有误");
                    return;
                }
                phone = this.newPhone.string;

                break;
        }

        this.schedule(() => {
            this.codeDownTime--;
            if (this.codeDownTime <= 0) {
                this.unscheduleAllCallbacks();
                this.codeDownTime = 60;
                this.codeBtn.getComponent(cc.Button).interactable = true;
                this.codeBtn.getChildByName("word").getComponent(cc.Label).string = "重新发送";
            } else {
                this.codeBtn.getChildByName("word").getComponent(cc.Label).string = "" + this.codeDownTime + "s";
            }

        }, 1, 60);
        Connector.request(GameConfig.ServerEventName.BindCode, { phone: phone }, (data) => {
            if (data.success) {
                Cache.alertTip("已发送验证码");
            }
        })

    },
    /** 确认修改*/
    onClickEnsure() {
        Cache.playSfx();


        switch (this.changeType) {
            case "pwd":

                if (!DataBase.player.hasBind) {
                    Cache.alertTip("请先绑定手机号");
                    return;
                }
                if (utils.isNullOrEmpty(this.newPwdInput.string)) {
                    Cache.alertTip("请输入新密码");
                    return;
                }
                if (this.newPwdInput.string.length < 6 || this.newPwdInput.string.length > 16) {
                    Cache.alertTip("密码长度为6至16位");
                    return;
                }
                let reg = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/;
                if (!reg.test(this.newPwdInput.string)) {
                    Cache.alertTip("密码不能含有特殊符号和空格");
                    return;
                }
                if (utils.isNullOrEmpty(this.ensurePwdInput.string)) {
                    Cache.alertTip("请重复密码");
                    return;
                }
                if (this.ensurePwdInput.string != this.newPwdInput.string) {
                    Cache.alertTip("密码不一致");
                    return;
                }
                let encryptPwd=utils.encryptToken(this.newPwdInput.string);
                Connector.request(GameConfig.ServerEventName.ChangePassword, { password: encryptPwd }, (data) => {
                    Cache.alertTip("修改成功");
                    utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.PLAYER_DATA_UPDATE);
                    this.scheduleOnce(() => {
                        if (this.callBack)
                            this.callBack();
                        this.onClickClose();
                    }, 0.8);
                }, null, (data) => {
                    Cache.showTipsMsg(utils.isNullOrEmpty(data.message) ? "修改失败" : data.message);
                })

                break;
            case "phone":
                if (utils.isNullOrEmpty(this.codeInput.string)) {
                    Cache.alertTip("请输入验证码");
                    return;
                }
                Connector.request(GameConfig.ServerEventName.BindPhone, { phone: this.newPhone.string, code: this.codeInput.string }, (data) => {
                    Cache.alertTip("修改成功");
                    App.EventManager.dispatchEventWith( GameConfig.GameEventNames.PLAYER_DATA_UPDATE);
                    this.scheduleOnce(() => {
                        if (this.callBack)
                            this.callBack();
                        this.onClickClose();
                    }, 0.8);

                }, null, (data) => {
                    Cache.showTipsMsg(utils.isNullOrEmpty(data.message) ? "修改失败" : data.message);
                })

                break;
        }
    },

    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        this.removeEvents();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
});
