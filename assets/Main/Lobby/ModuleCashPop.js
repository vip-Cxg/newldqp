const { GameConfig } = require("../../GameBase/GameConfig");
const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const dataBase = require("../Script/DataBase");
const utils = require("../Script/utils");

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Node,
        bankBtn: cc.Node,
        alipayBtn: cc.Node,
        bankContent: cc.Node,
        alipayContent: cc.Node,

        goldCount: cc.Label,


        // /**下拉选择按钮 */
        // selectBtn: cc.Node,
        /**提现形式  0---银行 1---支付宝 */
        sumbitType: 0,

        /**提现金额 */
        cashCount: cc.EditBox,
        /**银行名称 */
        bankName: cc.EditBox,
        /**银行用户名称 */
        bankUser: cc.EditBox,
        /**银行账号 */
        bankAccount: cc.EditBox,


        /**支付宝账号 */
        alipayAccount: cc.EditBox,
        /**支付宝用户 */
        alipayUser: cc.EditBox,

        /**验证码按钮 */
        codeBtn: cc.Node,
        /**短信验证码 */
        codeMsg: cc.EditBox,
        lastClickTime: 0,
        codeDownTime: 60,
        /**提交按钮 */
        submitBtn: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
        this.refreshUI();
    },
    addEvents() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.bankBtn.on(cc.Node.EventType.TOUCH_END, this.onClickBank, this);
        this.alipayBtn.on(cc.Node.EventType.TOUCH_END, this.onClickAlipay, this);
        this.submitBtn.on(cc.Node.EventType.TOUCH_END, this.onClickSubmit, this);
        this.codeBtn.on(cc.Node.EventType.TOUCH_END, this.onClickCode, this);
    },
    removeEvents() {
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
        this.bankBtn.off(cc.Node.EventType.TOUCH_END, this.onClickBank, this);
        this.alipayBtn.off(cc.Node.EventType.TOUCH_END, this.onClickAlipay, this);
        this.submitBtn.off(cc.Node.EventType.TOUCH_END, this.onClickSubmit, this);
        this.codeBtn.off(cc.Node.EventType.TOUCH_END, this.onClickCode, this);

    },
    /**刷新UI */
    refreshUI() {
        this.goldCount.string = "" + dataBase.player.wallet;
    },
    /**点击银行卡提现 */
    onClickBank() {
        this.bankContent.active = true;
        this.alipayContent.active = false;
    },
    /**点击支付宝提现 */
    onClickAlipay() {
        this.bankContent.active = false;
        this.alipayContent.active = true;

    },
    /**获取验证码 */
    onClickCode() {
        // utils.checkPhone(this.p)
        if (this.codeDownTime != 60) return;

        if (utils.isNullOrEmpty(dataBase.player.phone)) {
            Cache.showTipsMsg("未绑定手机号");
            return;
        }

        this.schedule(() => {
            this.codeDownTime--;
            if (this.codeDownTime <= 0) {
                this.unscheduleAllCallbacks();
                this.codeDownTime = 60;
                this.codeBtn.getComponent(cc.Button).interactable = true;
                this.codeBtn.getChildByName("downTime").getComponent(cc.Label).string = "重新发送";
            } else {
                this.codeBtn.getChildByName("downTime").getComponent(cc.Label).string = "" + this.codeDownTime + "s";
            }

        }, 1, 60);



        Connector.request(GameConfig.ServerEventName.CashSmsCode, { phone: dataBase.player.phone }, (data) => {
            if (data.success) {
                Cache.showTipsMsg("已发送验证码");
            }
        })
    },


    /**提交申请 */
    onClickSubmit() {
        // let checkRes = this.checkMsg();
        // if (!checkRes) return;
        let drawInfo = {
            card: "1234567890",
            name: "旺仔",
            bank: "支付宝"
        }
        Connector.cashRequest(GameConfig.ServerEventName.GetCash, { id: dataBase.player.id, money: "5000", cash: "50", sms: "123456", remarks: "哈哈", withdrawInfo: drawInfo }, (data) => {
            Cache.showTipsMsg(data.data, () => {
                this.onClickClose();
            });
        })
    },
    /**验证信息 */
    checkMsg() {
        if (utils.isNullOrEmpty(this.cashCount.string)) {
            Cache.showTipsMsg("提现金额不能为空");
            return false;
        }
        let cashCountReg = /^[0-9]*$/;
        if (!cashCountReg.test(this.cashCount.string)) {
            Cache.showTipsMsg("提现金额必须为数字！");
            return false
        }
        if (parseInt(this.cashCount.string) > parseInt(dataBase.player.wallet)) {
            Cache.showTipsMsg("提现金额不能大于账户余额！");
            return false;
        }
        if (utils.isNullOrEmpty(this.codeMsg.string)) {
            Cache.showTipsMsg("短信验证码不能为空");
            return false;
        }
        let codeMsgReg = /^[0-9]*$/;
        if (!codeMsgReg.test(this.codeMsg.string)) {
            Cache.showTipsMsg("短信验证码必须为数字！");
            return false
        }


        let checkRes = this.sumbitType == 0 ? this.checkBankMsg() : this.checkAlipayMsg();
        return checkRes;
    },
    /**验证银行信息 */
    checkBankMsg() {

        if (utils.isNullOrEmpty(this.bankName.string)) {
            Cache.showTipsMsg("银行名字不能为空");
            return false;
        }
        let bankNameReg = /^[\u4e00-\u9fa5]+$/;
        if (!bankNameReg.test(this.bankName.string)) {
            Cache.showTipsMsg("银行名字必须为汉字！");
            return false
        }


        if (utils.isNullOrEmpty(this.bankAccount.string)) {
            Cache.showTipsMsg("银行账户不能为空");
            return false;
        }
        let bankAccountReg = /^[0-9]*$/;
        if (!bankAccountReg.test(this.bankAccount.string)) {
            Cache.showTipsMsg("银行账户必须为数字！");
            return false
        }

        if (utils.isNullOrEmpty(this.bankUser.string)) {
            Cache.showTipsMsg("银行账户姓名不能为空");
            return false;
        }

        let bankUsereReg = /^[\u4e00-\u9fa5]+$/;
        if (!bankUsereReg.test(this.bankName.string)) {
            Cache.showTipsMsg("银行账户姓名必须为汉字！");
            return false
        }



        return true;
    },
    /**验证支付宝信息 */
    checkAlipayMsg() {
        if (utils.isNullOrEmpty(this.alipayAccount.string)) {
            Cache.showTipsMsg("支付宝账户不能为空");
            return false;
        }
        //支付宝账号为手机或邮箱
        let alipayAccountReg = /^(?:1[3-9]\d{9}|[a-zA-Z\d._-]*\@[a-zA-Z\d.-]{1,10}\.[a-zA-Z\d]{1,20})$/;
        if (!alipayAccountReg.test(this.alipayAccount.string)) {
            Cache.showTipsMsg("支付宝账号格式不对");
            return false
        }

        if (utils.isNullOrEmpty(this.alipayUser.string)) {
            Cache.showTipsMsg("支付宝账号姓名不能为空");
            return false;
        }

        let alipayUserReg = /^[\u4e00-\u9fa5]+$/;
        if (!alipayUserReg.test(this.alipayUser.string)) {
            Cache.showTipsMsg("支付宝账户姓名必须为汉字！");
            return false
        }

        return true;
    },

    /**关闭弹窗 */
    onClickClose() {
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    },
    onDestroy() {
        this.removeEvents();
    }
    // update (dt) {},
});
