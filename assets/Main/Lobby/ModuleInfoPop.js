const Connector = require("../NetWork/Connector");
const Cache = require("../Script/Cache");
const dataBase = require("../Script/DataBase");
const utils = require("../Script/utils")
const { GameConfig } = require("../../GameBase/GameConfig");
let http = require("SceneLogin");
const Native = require("../Script/native-extend");
const { App } = require("../../script/ui/hall/data/App");
const _social = Native.Social
cc.Class({
    extends: cc.Component,

    properties: {
        headerBtn: cc.Node,
        avatar: require('../../script/ui/common/Avatar'),
        changeDataBtn: cc.Node,
        userPhone: cc.Label,
        changePhoneBtn: cc.Node,
        userPwd: cc.Label,
        changePwdBtn: cc.Node,
        /**修改 */
        userNameInput: cc.EditBox,
        userID: cc.Label,

        /**显示修改昵称和头像 性别*/
        userName: cc.Label,
        dataEnsureBtn: cc.Node,
        sexWord: cc.Label,
        sexContainer: cc.Node,
        currentHeader: "",
        currentSex: ""
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
        _social.avatarUrlCallBack = (data) => {
            if(utils.isNullOrEmpty(data)){
                Cache.alertTip("上传失败");
                return;
            }
            this.currentHeader = data;
            this.avatar.avatarUrl= this.currentHeader;
            Connector.request(GameConfig.ServerEventName.UpdatePlayerById, { head: this.currentHeader, name: dataBase.player.name, sex: dataBase.player.sex }, (data) => {
                dataBase.player = data.player;
                utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.PLAYER_DATA_UPDATE);
                Cache.alertTip("修改成功");
            })

        }

        this.currentHeader = utils.isNullOrEmpty(dataBase.player.head) ? "file://0" : dataBase.player.head;
        this.currentSex = dataBase.player.sex;
        this.changeUIShow(false);
        this.refreshUIData();
    },
    addEvents() {
        this.headerBtn.on(cc.Node.EventType.TOUCH_END, this.onSelectAvatar, this);
        this.dataEnsureBtn.on(cc.Node.EventType.TOUCH_END, this.onClickChangeData, this);
        this.changeDataBtn.on(cc.Node.EventType.TOUCH_END, this.onClickChange, this);
        this.changePhoneBtn.on(cc.Node.EventType.TOUCH_END, this.onChangePhone, this);
        this.changePwdBtn.on(cc.Node.EventType.TOUCH_END, this.onChangePwd, this);

        this.node.on(GameConfig.GameEventNames.PLAYER_DATA_UPDATE, this.refreshUIData, this);
        this.userID.node.on(cc.Node.EventType.TOUCH_END, this.copyId, this);
    },
    removeEvents() {

    },
    onClickChange() {
        Cache.playSfx();
        this.changeUIShow(true)
    },

    /**改变界面显示 */
    changeUIShow(show) {

        this.userName.node.active = !show;
        this.changeDataBtn.active = !show;
        this.sexWord.node.active = !show;


        this.userNameInput.node.active = show;
        this.dataEnsureBtn.active = show;
        this.sexContainer.active = show;
    },

    /**更新UI数据 */
    refreshUIData() {
        this.userNameInput.placeholder = '' + dataBase.player.name;
        this.userNameInput.string = '' + dataBase.player.name;
        this.userName.string = '' + dataBase.player.name;

        this.userPhone.string = !dataBase.player.hasBind ? "未绑定手机" : '' + dataBase.player.phone;
        this.userPwd.string = '' + dataBase.player.password;

        this.sexWord.string = dataBase.player.sex == "male" ? "男" : "女";
        let headIndex = 0;
        if (this.currentHeader.split("://")[0] == "file")
            headIndex = this.currentHeader.split("://")[1];
        this.userID.string = "" + dataBase.player.id;
        this.avatar.avatarUrl= this.currentHeader;

    },
  
    /**修改资料 */
    onClickChangeData() {
        Cache.playSfx();
        Connector.request(GameConfig.ServerEventName.UpdatePlayerById, { head: this.currentHeader, name: this.userNameInput.string, sex: this.currentSex }, (data) => {
            dataBase.player = data.player;
            utils.dispatchAllEvent(this.node, GameConfig.GameEventNames.PLAYER_DATA_UPDATE);
            this.changeUIShow(false);
            Cache.alertTip("修改成功！");
        })
    },
    /**选择头像 */
    onClickToggle(e) {
        Cache.playSfx();
        this.currentHeader = GameConfig.ConfigUrl + "avatar/mj_face" + parseInt(e.currentTarget.name.replace("toggle", "")) + ".png";
    },
 


    onClickSex(e, v) {
        Cache.playSfx();
        this.currentSex = v;
    },

    /**改变手机 */
    onChangePhone() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.ChangeDataPop, (pop) => {
            pop.getComponent("ModuleChangePop").refreshUIData("phone", this.refreshUIData.bind(this));
            // this.onClickClose();

        })
    },

    /**改变密码 */
    onChangePwd() {
        Cache.playSfx();
        utils.pop(GameConfig.pop.ChangeDataPop, (pop) => {
            pop.getComponent("ModuleChangePop").refreshUIData("pwd", this.refreshUIData.bind(this));
            // this.onClickClose();

        })
    },

    /**复制id */
    copyId() {
        Cache.playSfx();
        Cache.alertTip("id复制成功");
        _social.setCopy(this.serialID);
    },

    /**自定义头像 */
    onSelectAvatar() {
        Cache.playSfx();
        _social.selectPicture();
    },


    /**同步微信 */
    onSyncWxInfo() {
        Cache.playSfx();
        // _social.wechatAuth();
        // _social.wxLoginCallBack = (res) => {
        //     let encryptIdfa = utils.encryptToken(GameConfig.DeviceIDFA);
        //     let encryptDevices = utils.encryptToken(GameConfig.DeviceID);
        //     Connector.request(GameConfig.ServerEventName.UserLogin, { publicKey: GameConfig.Encrtyptor.getPublicKey(), idfa: encryptIdfa, deviceID: encryptDevices, install: GameConfig.InviteCode, info: res }, (data) => {
        //         if (data.success) {
        //             http.loginSuccessCallback(data)
        //             if (data.player.hasBind)
        //                 utils.saveValue(GameConfig.StorageKey.UserAccount, data.player.phone);
        //             utils.saveValue(GameConfig.StorageKey.UserLoginTime, parseInt(new Date().getTime() / 1000));
        //         }
        //     })
        // }
    },

    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        _social.avatarUrlCallBack = null;
        this.removeEvents();
        this.node.removeFromParent();
        this.node.onDestroy();
    },

    onDestroy() {
        _social.avatarUrlCallBack = null;
        this.removeEvents();
    }
});
