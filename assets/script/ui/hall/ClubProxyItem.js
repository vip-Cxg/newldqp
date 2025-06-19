import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import Avatar from "../common/Avatar";

const STATUS_DESC = ['离线', '在线']
const { ccclass, property } = cc._decorator
@ccclass
export default class ClubProxyItem extends cc.Component {

    @property(Avatar)
    avatar = null;
    @property(cc.Label)
    lblLevel = null;
    @property(cc.Label)
    lblShuffle = null;
    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblId = null;

    @property(cc.Label)
    lblYdTurn = null;
    @property(cc.Label)
    lblTdTurn = null;
    @property(cc.Label)
    lblYdFee = null;
    @property(cc.Label)
    lblTdFee = null;

    @property(cc.Node)
    levelBtn = null;
    @property(cc.Node)
    proxyBtn = null;


    userData = null;

    initData(data) {


        this.userData = data;
        this.avatar.avatarUrl = data.user.head;

        this.lblName.string = '' + GameUtils.getStringByLength(data.user.name, 6);
        this.lblId.string = '' + data.userID;
        this.lblLevel.string = '' + data.level;
        this.lblShuffle.node.active=App.Club.ShuffleLevel!=0;
        this.lblShuffle.string = '' + data.shuffleLevel;
        if (data.userID == DataBase.player.id) {
            this.levelBtn.active = false;
            this.proxyBtn.active = false;
        }


        this.lblYdTurn.string = '' + (data.ydTurn || 0);
        this.lblTdTurn.string = '' + (data.tdTurn || 0);
        this.lblYdFee.string = '' + (GameUtils.formatGold(data.ydFee) || 0);
        this.lblTdFee.string = '' + (GameUtils.formatGold(data.tdFee) || 0);


    }

    onClickDetail() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.UserInfoPop, (node) => {
            node.getComponent('UserInfoPop').initUserID(this.userData.userID);
        })
    }

    openChildUser() {
        Cache.openType = 0
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ChildUserListPop, (node) => {
            node.getComponent('ChildUserListPop').initUserID(this.userData.userID);
        })

    }

    openChildProxy() {
        Cache.playSfx();
        // this.initUserID(this.userData.userID);
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.PROXY_LIST_UPDATE, this.userData.userID)
        // GameUtils.pop(GameConfig.pop.ClubProxyListPop, (node) => {
        //     node.getComponent('ClubProxyListPop').initUserID(this.userData.userID);
        // })

    }
    onChangeLevel() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ProxyLevelPop, (node) => {
            node.getComponent('ProxyLevelPop').initData(this.userData);
        })
        return;
        Cache.showNumer('修改等级', GameConfig.NumberType.INT, (level) => {
            this.changeLevel(level);
        })
    }

    changeLevel(level) {
        Connector.request(GameConfig.ServerEventName.UpdateLevel, { level: level, userID: this.userData.userID, clubID: App.Club.CurrentClubID, whole: false }, (data) => {
            Cache.alertTip('操作成功');
            this.userData.level = '' + parseInt(level);
            this.initData(this.userData);
        })
    }




}


