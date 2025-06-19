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
        pwdBtn: cc.Node,
        codeBtn: cc.Node,
        pwdContent: cc.Node,
        codeContent: cc.Node,
        loginType: 1,
        phoneInput: cc.Label,
        pwdInput: cc.EditBox,
        codeInput: cc.EditBox,
        errorTips: cc.Label,
        getCodeBtn: cc.Node,
        codeTime: cc.Label,
        codeCoolDown: true,
        checkWeb: cc.WebView,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
        this.refreshUI();

        this.checkWeb.url = cc.sys.isBrowser ? GameConfig.ConfigUrl + "info/checkCodeWeb1.html" : GameConfig.ConfigUrl + "info/checkCode.html";
        if (!cc.sys.isBrowser) {
            var scheme = "testkey";
            let self = this;
            function jsCallback(target, url) {
                // 这里的返回值是内部页面的 URL 数值，需要自行解析自己需要的数据。
                var str = url.replace(scheme + '://', ''); // str === 'a=1&b=2'
                console.log("jsCallback-------str-------", str);
                console.log("jsCallback-------target-------", target);
                console.log("jsCallback-------url-------", url);
                let strarr = str.split("&");
                let ticketData = { ticket: strarr[0], randstr: strarr[1] };
                self.closeWebView(ticketData);
            }
            this.checkWeb.setJavascriptInterfaceScheme(scheme);
            this.checkWeb.setOnJSCallback(jsCallback);
        }

    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.loginBtn.on(cc.Node.EventType.TOUCH_END, this.onClickLogin, this);
        this.pwdBtn.on(cc.Node.EventType.TOUCH_END, this.onClickPwd, this);
        this.codeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickCode, this);
        this.getCodeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickGetCode, this);
        if (cc.sys.isBrowser)
            window.addEventListener('message', this.handleCheckCode.bind(this));
    },
    removeEvents() {
        console.log("ceshi -removeEventsremoveEvents--------------------")
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.loginBtn.off(cc.Node.EventType.TOUCH_END, this.onClickLogin, this);
        this.pwdBtn.off(cc.Node.EventType.TOUCH_END, this.onClickPwd, this);
        this.codeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickCode, this);
        this.getCodeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickGetCode, this);
        if (cc.sys.isBrowser)
            window.removeEventListener('message', this.handleCheckCode.bind(this));
    },

    handleCheckCode(e) {
        console.log("webData: ", e.data)
        var str = e.data.replace('testkey://', ''); // str === 'a=1&b=2'
        console.log("jsCallback-------str-------", str);
        let strarr = str.split("&");
        let ticketData = { ticket: strarr[0], randstr: strarr[1] };
        this.startLogin(ticketData);
    },

    /**刷新UI */
    refreshUI() {
        let strPassWd = utils.getValue(GameConfig.StorageKey.UserPwd);
        if (!utils.isNullOrEmpty(strPassWd)) {
            this.pwdBtn.getComponent(cc.Toggle).check();
            this.onClickPwd();
        }
        let phone = utils.getValue(GameConfig.StorageKey.UserAccount);
        this.pwdInput.string = strPassWd;
        this.phoneInput.string = phone;
    },
    onClickPhone() {
        Cache.showNumer('输入手机号',GameConfig.NumberType.INT, (phone) => {
            this.phoneInput.string = '' + phone;
        })
    },

    /**密码登陆 */
    onClickPwd() {
        this.pwdContent.active = true;
        this.codeContent.active = false;
        this.codeInput.string = "";
        let strPassWd = utils.getValue(GameConfig.StorageKey.UserPwd);
        this.pwdInput.string = strPassWd;
        this.loginType = 0;
    },
    /**验证码登陆 */
    onClickCode() {
        this.codeContent.active = true;
        this.pwdContent.active = false;
        this.loginType = 1;
        this.pwdInput.string = "";
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
        if (this.loginType == 0) {
            if (!this.pwdInput.string || this.pwdInput.string.length < 1) {
                this._showErrorHint('密码不能为空');
                return;
            }
            // this.startLogin();
            // if (utils.isNullOrEmpty(GameConfig.GameInfo.ignorePhone) || GameConfig.GameInfo.figureVerify) {
            //     this.startCheck();
            //     return;
            // }
            // if (GameConfig.GameInfo.ignorePhone.indexOf(parseInt(this.phoneInput.string)) == -1 && GameConfig.GameInfo.figureVerify) {
            //     this.startCheck();
            //     return;
            // }
            this.startLogin();
        } else {
            //验证码
            if (!this.codeInput.string || this.codeInput.string.length < 1) {
                this._showErrorHint('验证码不能为空');
                return;
            }
            // if (utils.isNullOrEmpty(GameConfig.GameInfo.ignorePhone) || GameConfig.GameInfo.figureVerify) {
            //     this.startCheck();
            //     return;
            // }
            // if (GameConfig.GameInfo.ignorePhone.indexOf(parseInt(this.phoneInput.string)) == -1 && GameConfig.GameInfo.figureVerify) {
            //     this.startCheck();
            //     return;
            // }
            this.startLogin();
        }
    },
    startCheck() {
        this.checkWeb.node.active = true;
    },
    closeWebView(str) {
        this.checkWeb.node.active = false;
        this.startLogin(str)
    },
    /**开始登陆 */
    startLogin(codeData) {
        if (!this.checkWeb) return;
        this.checkWeb.node.active = false;
        let self = this;
        // console.log("---GameConfig.DeviceID----",GameConfig.DeviceID)
        let encryptPwd = utils.encryptToken(this.pwdInput.string);
        // let encryptDevices = utils.encryptToken(GameConfig.DeviceID);
        let req = codeData ? { ticket: codeData.ticket, randstr: codeData.randstr, phone: this.phoneInput.string, password: encryptPwd, code: this.codeInput.string, publicKey: GameConfig.Encrtyptor.getPublicKey() } : { phone: this.phoneInput.string, password: encryptPwd, code: this.codeInput.string, publicKey: GameConfig.Encrtyptor.getPublicKey() }
        Connector.request(GameConfig.ServerEventName.UserLogin, req, (data) => {
            if (data.success && data.token) {
                this.removeEvents();
                utils.saveValue(GameConfig.StorageKey.UserPwd, this.pwdInput.string);
                utils.saveValue(GameConfig.StorageKey.UserLoginTime, parseInt(new Date().getTime() / 1000));
                cc.director.loadScene("Lobby");
            }
        }, true, (err) => {
            Cache.showTipsMsg(err.message);
        })
    },
    startCodeLogin() {
        if (this.checkWeb) {
            this.checkWeb.node.active = false;
        }
        let self = this;
        let req = { phone: this.phoneInput.string, code: this.codeInput.string, publicKey: GameConfig.Encrtyptor.getPublicKey() }
        Connector.request(GameConfig.ServerEventName.UserLogin, req, (data) => {
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
