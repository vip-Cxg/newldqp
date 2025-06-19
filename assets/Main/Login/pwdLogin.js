let utils = require("utils");
let db =require('../Script/DataBase') //require("DataBase");
let connector = require("Connector");
let cache = require("Cache");
let http = require("SceneLogin");
cc.Class({
    extends: cc.Component,

    properties: {
        errorHintLabel: cc.Label,
        preForget:cc.Prefab,
        editboxPassWd:cc.EditBox,
        editboxPhone:cc.EditBox,
        // toggleSetPassWd:cc.Toggle,
        phone: '',
        passWd: ''
    },

    // LIFE-CYCLE CALLBACKS:

    autoLogin(){
        if((cc.sys.os == cc.sys.OS_IOS || cc.sys.os == cc.sys.OS_ANDROID)){
            let lastLogin = db.getInt(db.STORAGE_KEY.LAST_LOGIN);
            let strPassWd = db.getString(db.STORAGE_KEY.LOGIN_PASSWD);
            let phone = db.getString(db.STORAGE_KEY.LOGIN_PHONE);
            if (strPassWd != "" && phone!= "" && (parseInt(new Date() / 1000) - lastLogin < 60 * 60 * 24 * 7)) {
                connector.request('loginByPhone',{phone:this.phone,password:this.passWd},(data)=>{
                    http.loginSuccessCallback(data);
                })
            }
        }
    },

    onLoad () {
        let strPassWd = db.getString(db.STORAGE_KEY.LOGIN_PASSWD);
        let phone = db.getString(db.STORAGE_KEY.LOGIN_PHONE);
        let isNewPlayer = db.getInt(db.STORAGE_KEY.NEW_PLAYER);
        this.editboxPassWd.string = strPassWd;
        this.passWd = strPassWd;
        this.editboxPhone.string = phone;
        this.phone = phone;
        cc.log("初始密码，手机",strPassWd,phone,isNewPlayer);

        // setTimeout(this.autoLogin.bind(this),200);
    },

    inputPhoneEnded(editbox, customEventData) {
        this.phone = editbox.string;
    },

    inputPassWordEnded(editbox, customEventData) {
        this.passWd = editbox.string;
    },

    _showErrorHint(str) {
        let lblNode = this.errorHintLabel.node;
        lblNode.active = true;
        this.errorHintLabel.string = str;   
        // 设置计时器
        this.scheduleOnce(()=>{
            lblNode.active = false;
        }, 2);
    },

    onChangePd(){
        // this.node.active = false;
        if(cc.find('Canvas/nodeForget')!=null){
            cc.find('Canvas/nodeForget').active = true;       
        }else{
            let nodeForget = cc.instantiate(this.preForget);
            nodeForget.parent = cc.find("Canvas");
        }    
    },

    onLogin() {
        if (!this.phone || this.phone.length<1) {
            this._showErrorHint('手机号码格式有误');
            return;
        }

        if (!this.passWd || this.passWd.length<1) {
            this._showErrorHint('密码不能为空');
            return;
        }
        
        this._startLogin();
    },

    // 发起请求
    _startLogin() {
        connector.request('loginByPhone',{phone:this.phone,password:this.passWd},(data)=>{
            if(data.success){
                http.loginSuccessCallback(data);
                db.setInt(db.STORAGE_KEY.LAST_LOGIN, parseInt(new Date().getTime()/1000));
                db.setString(db.STORAGE_KEY.LOGIN_PHONE, this.phone);
                // if(this.toggleSetPassWd.isChecked){
                    db.setString(db.STORAGE_KEY.LOGIN_PASSWD, this.passWd);
                    
                // }else{
                //     db.setString(db.STORAGE_KEY.LOGIN_PASSWD, '');
                // }       
            }
        })
    },
});
