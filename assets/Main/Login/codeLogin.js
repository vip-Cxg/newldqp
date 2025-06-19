let utils = require("utils");
let connector = require("Connector");
let db = require("DataBase");
let cache = require("Cache");
let http = require("SceneLogin");
cc.Class({
    extends: cc.Component,

    properties: {
        errorHintLabel:cc.Label,
        lblTime:cc.Label,
        editboxPhone:cc.EditBox,
        phone:'',
        code:'',
        passWd: '',
        rePassWd : ''
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // let phone = db.getString(db.STORAGE_KEY.LOGIN_PHONE);
        // this.editboxPhone.string = phone;
    },

    inputPhoneEnded(editbox, customEventData) {
        let bool = utils.checkPhone(editbox.string);
        if(!bool){
            this._showErrorHint('手机号码格式有误');
            return;
        }
        this.phone = editbox.string;
    },

    inputCodeEnded(editbox, customEventData) {
        this.code = editbox.string;
    },

    inputPassWordEnded(editbox, customEventData) {
        this.passWd = editbox.string;
    },

    reInputPWEnded(editbox, customEventData) {
        this.rePassWd = editbox.string;
        if (this.passWd == this.rePassWd) {
            return;
        }

        this._showErrorHint('密码输入不一致');
    },


    _showErrorHint: function(str) {
        let lblNode = this.errorHintLabel.node;
        lblNode.active = true;
        this.errorHintLabel.string = str;   
        // 设置计时器
        this.scheduleOnce(()=>{
            lblNode.active = false;
        }, 2);
    },

    getLoginCode(evnet,data){
        cc.log("this.phone",this.phone);
        if(!this.phone || this.phone.length<1){
            this._showErrorHint('手机号码格式有误');
            return;
        }

        connector.request("sendSmsCode",{phone:this.phone},(data)=> {
            if(data.success){
                cache.showTipsMsg(data.message);
                this.lblTime.node.parent.active = true;
                this.lblTime.node.parent.getComponent(cc.Button).interactable = false;
                let time = 60;
                this.lblTime.string = '重新发送(' + (time) +')';
                this.lblTime.schedule(()=>{
                    this.lblTime.string = '重新发送(' + (--time) +')';
                    if(time==0){
                        this.lblTime.unscheduleAllCallbacks();
                        this.lblTime.node.parent.active = false;  
                    }
                },1);    
            }
        })
    },

    onChangePassWd(){
        cc.log("修改密码");   
        if (!this.phone || this.phone.length<1) {
            this._showErrorHint('手机号不能为空');
            return;
        }

        if (!this.passWd || this.passWd.length<1) {
            this._showErrorHint('密码不能为空');
            return;
        }

        if (this.passWd != this.rePassWd) {
            this._showErrorHint('密码输入不一致');
            return;
        }
        if (!this.code || this.code.length<1) {
            this._showErrorHint('验证码不能为空');
            return;
        }  

        
        this._startConfirmChange();    
    },

    onCodeLogin() {
        if (!this.phone || this.phone.length<1) {
            this._showErrorHint('手机号不能为空');
            return;
        }

        if (!this.code || this.code.length<1) {
            this._showErrorHint('验证码不能为空');
            return;
        }

        this._startCodeLogin();
    },

    _startConfirmChange(){
        connector.request('changePassword',{phone:this.phone,password:this.passWd},(data)=>{
            if(data.success){
                this.node.active =false;
            }
        })    
    },

    hide(){
        cc.log(11111)
        cc.find('Canvas/nodeForget').active = false;  
    },

    // 发起请求
    _startCodeLogin: function() {
        connector.request('loginByCode',{phone:this.phone,code:this.code},(data)=>{
            if(data.success){
                http.loginSuccessCallback(data);
                db.setInt(db.STORAGE_KEY.LAST_LOGIN, parseInt(new Date().getTime()/1000));
                db.setString(db.STORAGE_KEY.LOGIN_PHONE, this.phone);    
            }
        })
        
    }
});
