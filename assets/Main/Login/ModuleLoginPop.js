const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const dataBase = require("../Script/DataBase");
const utils = require("../Script/utils");
const http = require("SceneLogin");
const { GameConfig } = require("../../GameBase/GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Node,
        loginBtn: cc.Node,

        codeContent: cc.Node,
        phoneInput: cc.Label,
        codeInput: cc.EditBox,
        errorTips: cc.Label,
        getCodeBtn: cc.Node,
        codeTime: cc.Label,
        codeCoolDown: true,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
        this.refreshUI();


    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.loginBtn.on(cc.Node.EventType.TOUCH_END, this.onClickLogin, this);
        this.getCodeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickGetCode, this);

    },
    removeEvents() {
        console.log("ceshi -removeEventsremoveEvents--------------------")
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.loginBtn.off(cc.Node.EventType.TOUCH_END, this.onClickLogin, this);
        this.getCodeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickGetCode, this);

    },

    /**刷新UI */
    refreshUI() {
        let phone = utils.getValue(GameConfig.StorageKey.UserAccount)||'请输入手机号';
        this.phoneInput.string = phone;
        this.codeContent.active = true;
    },
    onClickPhone() {
        Cache.showNumer('输入手机号', GameConfig.NumberType.INT, (phone) => {
            this.phoneInput.string = '' + phone;
        })
    },

    /**获取验证码 */
    onClickGetCode() {
        let bool = utils.checkPhone(this.phoneInput.string);
        if (!bool) {
            this._showErrorHint('手机号码格式有误');
            return;
        }
        if (!this.codeCoolDown) return;
        let nowTime = utils.getTimeStamp();
        if (Math.floor((nowTime - GameConfig.sendCodeTime) / 1000) < 30) {
            Cache.alertTip('请' + (30 - Math.floor((nowTime - GameConfig.sendCodeTime) / 1000)) + '秒后再试');
            return;
        }

        Connector.request(GameConfig.ServerEventName.SendCode, { phone: this.phoneInput.string }, (data) => {
            if (data.success) {
                GameConfig.sendCodeTime = utils.getTimeStamp();
                this.codeCoolDown = false;
                Cache.alertTip("已发送验证码");
                this.getCodeBtn.getComponent(cc.Button).interactable = false;
                let time = 30;
                this.codeTime.string = '(' + (time) + 's)';
                this.codeTime.schedule(() => {
                    this.codeTime.string = '(' + (--time) + 's)';
                    if (time == 0) {
                        this.codeTime.string = '验证码';
                        this.codeCoolDown = true;
                        this.codeTime.unscheduleAllCallbacks();
                        this.getCodeBtn.getComponent(cc.Button).interactable = true;
                    }
                }, 1);
            }
        })
    },
    /**登陆 */
    onClickLogin() {

        let bool = utils.checkPhone(this.phoneInput.string);
        if (!bool) {
            this._showErrorHint('手机号码格式有误');
            return;
        }

        //验证码
        if (!this.codeInput.string || this.codeInput.string.length < 1) {
            this._showErrorHint('验证码不能为空');
            return;
        }
     
        this.startCodeLogin();
    },


    startCodeLogin() {

        let self = this;
        let req = { phone: this.phoneInput.string, code: this.codeInput.string, publicKey: GameConfig.Encrtyptor.getPublicKey() }
        Connector.request(GameConfig.ServerEventName.UserCodeLogin, req, (data) => {
            if (data.success && data.token) {
                this.removeEvents();
                utils.saveValue(GameConfig.StorageKey.UserLoginTime, parseInt(new Date().getTime() / 1000));
                cc.director.loadScene("Lobby");
            }
        }, true, (err) => {
            try {
                if (err.status.code == 502) {
                    Cache.inputInviterPop("邀请码错误", (data) => {
                        GameConfig.InviteCode = {
                            inviter: "" + data
                        }
                        self.onClickLogin();
                    })
                } else {
                    Cache.showTipsMsg(err.message);
                }
            } catch (error) {
                Cache.showTipsMsg(err.message);
            }

        })
    },


    _showErrorHint(str) {
        this.errorTips.node.active = true;
        this.errorTips.string = str;
        // 设置计时器
        this.scheduleOnce(() => {
            this.errorTips.node.active = false;
        }, 2);
    },
    /**关闭弹窗 */
    onClickClose() {
        this.removeEvents();
        this.node.removeFromParent();
        this.node.destroy();

    },
    onDestroy() {
        this.removeEvents();
    }
});
