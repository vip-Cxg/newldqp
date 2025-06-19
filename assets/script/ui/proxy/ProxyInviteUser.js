import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import Avatar from "../common/Avatar";
const { ccclass, property } = cc._decorator
@ccclass
export default class ProxyInviteUser extends cc.Component {


    @property(cc.Node)
    inputNode = null;
    @property(cc.Label)
    idInput = null;
    @property(cc.Label)
    levelInput = null;
    @property(cc.Label)
    shuffleInput = null;
    @property(cc.Node)
    proxyNode = null;
    @property(cc.Label)
    ensureDesc = null;
    @property(cc.Label)
    lblTitle = null;

    @property(cc.Node)
    userNode = null;
    @property(cc.Label)
    lblId = null;
    @property(cc.Label)
    lblName = null;

    @property(Avatar)
    avatarSpr = null;




    @property(cc.Node)
    shuffleTips = null;
    @property(cc.Node)
    shuffleBox = null;

    popType = 'user';

    onLoad() {

        this.initUI()
    }

    initType(key) {
        this.popType = key;
        this.proxyNode.active = key != 'user';
        this.ensureDesc.string = key != 'user' ? '添加合伙人' : '确认邀请';
        this.lblTitle.string = key != 'user' ? '添加合伙人' : '邀请玩家';

        if(App.Club.ShuffleLevel==0){
            this.shuffleInput.node.active=false;
            this.shuffleBox.active=false;
            this.shuffleTips.active=false;

            this.shuffleInput.string = "0"
        }

    }


    onConfirm() {
        Cache.playSfx();
        if (this.idInput.string == "") {
            Cache.alertTip("请输入玩家id")
            return;
        }



        Connector.request(GameConfig.ServerEventName.SearchUserInfo, { userID: parseInt(this.idInput.string) }, (res) => {
            if (!GameUtils.isNullOrEmpty(res.user)) {
                this.inputNode.active = false;
                this.userNode.active = true;
                this.lblId.string = '玩家ID: ' + res.user.id;
                this.lblName.string = '昵称: ' + GameUtils.getStringByLength(res.user.name, 6);
                this.avatarSpr.avatarUrl = res.user.head;
            } else {
                Cache.alertTip("未找到该玩家")
            }
        })

    }
    ensureConfirm() {
        Cache.playSfx();

        if (this.popType == 'user') {
            Connector.request(GameConfig.ServerEventName.Invite, { userID: parseInt(this.idInput.string), clubID: App.Club.CurrentClubID }, (res) => {
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.ADD_USER);
                Cache.alertTip('邀请成功');
                this.initUI();
            });
            return;
        }
        if (this.levelInput.string == "") {
            Cache.alertTip("请输入合伙人等级")
            return;
        }
        if (this.shuffleInput.string == "") {
            Cache.alertTip("请输入合伙人洗牌s")
            return;
        }
        Connector.request(GameConfig.ServerEventName.AddProxy, { userID: parseInt(this.idInput.string), clubID: App.Club.CurrentClubID, level: parseInt(this.levelInput.string), shuffleLevel: parseInt(this.shuffleInput.string) }, (res) => {
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.ADD_PROXY);
            Cache.alertTip('添加成功');
            this.initUI();
        });

    }
    onClickInput() {
        Cache.playSfx();
        Cache.showNumer('请输入玩家ID',GameConfig.NumberType.INT, (userId) => {
            this.idInput.string = "" + userId;
        });

    }
    onClickLevel() {
        Cache.playSfx();
        Cache.showNumer('请输入合伙人等级', GameConfig.NumberType.INT,(level) => {
            this.levelInput.string = "" + level;
        });

    }
    onClickShuffle() {
        Cache.playSfx();
        Cache.showNumer('请输入合伙人洗牌', GameConfig.NumberType.INT,(shuffle) => {
            this.shuffleInput.string = "" + shuffle;
        });

    }

    cancelConfirm() {
        Cache.playSfx();
        this.inputNode.active = true;
        this.userNode.active = false;

    }
    initUI() {
        this.idInput.string = "";
        this.inputNode.active = true;
        this.userNode.active = false;
    }


    onClickClose() {
        Cache.playSfx();
        this.node.destroy();
    }



}


