let utils =require("../Script/utils")// require("utils");
let connector = require("Connector");
let cache = require("Cache");
let http = require("SceneLogin");
let db = require("DataBase");

cc.Class({
    extends: cc.Component,

    properties: {
        errorHintLabel: cc.Label,
        lblTime: cc.Label,
        inviteCode:'98k98',
        phone: '',
        code: '111111',
        userName: '',
        passWd: '',
        rePassWd: ''
    },

    inputInviteEnded (editbox, customEventData) {
        this.inviteCode = editbox.string;
    },

    inputUserNameEnded (editbox, customEventData) {
        this.userName = editbox.string;
    },

    inputPhoneEnded (editbox, customEventData) {
        let bool = utils.checkPhone(editbox.string);
        // if (!bool) {
        //     this._showErrorHint('手机号码格式有误');
        //     return;
        // }
        this.phone = editbox.string;
    },
    inputCodeEnded (editbox, customEventData) {
        this.code = editbox.string;
    },

    inputPassWordEnded (editbox, customEventData) {
        this.passWd = editbox.string;
    },

    reInputPWEnded (editbox, customEventData) {
        this.rePassWd = editbox.string;
        if (this.passWd == this.rePassWd) {
            return;
        }

        this._showErrorHint('密码输入不一致');
    },

    _showErrorHint: function (str) {
        let lblNode = this.errorHintLabel.node;
        lblNode.active = true;
        this.errorHintLabel.string = str;
        // 设置计时器
        this.scheduleOnce(function () {
            lblNode.active = false;
        }.bind(this), 2);
    },
    /** 获取验证码*/
    getLoginCode() {
        if (!this.phone || this.phone.length < 1) {
            this._showErrorHint('手机号码格式有误');
            return;
        }
        connector.request("sendSmsCode", { phone: this.phone, type: 'register' }, (data) => {
            if (data.success) {
                cache.showTipsMsg(data.message);
                this.lblTime.unscheduleAllCallbacks();
                this.lblTime.node.parent.active = true;
                this.lblTime.node.parent.getComponent(cc.Button).interactable = false;
                let time = 60;
                this.lblTime.string = '重新发送(' + (time) + ')';
                this.lblTime.schedule(() => {
                    this.lblTime.string = '重新发送(' + (--time) + ')';
                    if (time == 0) {
                        this.lblTime.unscheduleAllCallbacks();
                        this.lblTime.node.parent.active = false;
                    }
                }, 1);

            }
        })
    },

    onRegister () {
        this.code="111111";
        this.inviteCode="98k98";
        if (!this.phone || this.phone.length < 1) {
            this._showErrorHint('手机号码格式有误');
            return;
        }

        if (!this.code || this.code.length < 1) {
            this._showErrorHint('验证码不能为空');
            return;
        }

        if (!this.inviteCode || this.inviteCode.length < 1) {
            this._showErrorHint('邀请码不能为空');
            return;
        }

        if (!this.passWd || this.passWd.length < 1) {
            this._showErrorHint('密码不能为空');
            return;
        }

        if (this.passWd != this.rePassWd) {
            this._showErrorHint('密码输入不一致');
            return;
        }

        this._startRegister();
    },

    // 发起请求
    _startRegister: function () {
        // connector.request('sign', { code: this.code, phone: this.phone, password: this.passWd, inviteCode: this.inviteCode }, (data) => {
        connector.request('register', { code: this.code, phone: this.phone, password: this.passWd, inviteCode: this.inviteCode }, (data) => {
            cache.showTipsMsg(data.message, () => {
                if(data.success){
                    connector.request('loginByPhone', { phone: this.phone, password: this.passWd }, (data) => {
                        http.loginSuccessCallback(data);
                        db.setInt(db.STORAGE_KEY.LAST_LOGIN, parseInt(new Date().getTime() / 1000));
                        db.setInt(db.STORAGE_KEY.NEW_PLAYER, 0);
    
                        db.setString(db.STORAGE_KEY.LOGIN_PHONE, this.phone);
                        db.setString(db.STORAGE_KEY.LOGIN_PASSWD, this.passWd);
                    })
                }
            });
        })
    },

    back () {
        this.node.active = false;
    },
});
