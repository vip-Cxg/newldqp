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
export default class AdminUserItem extends cc.Component {

    @property(Avatar)
    avatar = null;

    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblId = null;
    @property(cc.Label)
    lblCard = null;
    @property(cc.Label)
    lblDiamond = null;


    userData = null;

    addEvents() {
        // App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.updateScore, this);
    }
    removeEvents() {
        // App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.updateScore, this);

    }
    updateScore() {

    }
    initData(data) {

        this.userData = data;
        this.avatar.avatarUrl = data.head;
        this.lblName.string = '' + data.name;
        this.lblId.string = '' + data.id;
        this.lblCard.string = '' + data.card;// GameUtils.formatGold(data.wallet);
        this.lblDiamond.string = '' + data.diamond;// GameUtils.formatGold(data.wallet);


    }

    onClickDetail() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.AdminDetailPop, (node) => {
            node.getComponent('AdminDetailPop').renderUser(this.userData);
        })
    }

    onAddCard() {
        Cache.playSfx();
        Cache.showNumer('请输入充值房卡数', GameConfig.NumberType.INT, (card) => {
            Connector.request(GameConfig.ServerEventName.AdminWallet, { userID: this.userData.id, card: card, add: true }, (res) => {
                Cache.alertTip("充值成功")
                this.lblCard.string = '' + (this.userData.card + card);
            }, true, (err) => {
                Cache.alertTip(err.message || "调配失败")
            })
        })
    }
    onReduceCard() {
        Cache.playSfx();
        Cache.showNumer('请输入减少房卡数', GameConfig.NumberType.INT, (card) => {
            Connector.request(GameConfig.ServerEventName.AdminWallet, { userID: this.userData.id, card: card, add: false }, (res) => {
                Cache.alertTip("操作成功")
                this.lblCard.string = '' + (this.userData.card - card);
            }, true, (err) => {
                Cache.alertTip(err.message || "调配失败")
            })
        })
    }

    onAddDiamond() {
        Cache.playSfx();
        Cache.showNumer('请输入充值钻石数', GameConfig.NumberType.INT, (diamond) => {
            Connector.request(GameConfig.ServerEventName.AdminWallet, { userID: this.userData.id, diamond: diamond, add: true }, (res) => {
                Cache.alertTip("充值成功")
                this.lblDiamond.string = '' + (this.userData.diamond + diamond);
            }, true, (err) => {
                Cache.alertTip(err.message || "调配失败")
            })
        })
    }
    onReduceDiamond() {
        Cache.playSfx();
        Cache.showNumer('请输入减少钻石数', GameConfig.NumberType.INT, (diamond) => {
            Connector.request(GameConfig.ServerEventName.AdminWallet, { userID: this.userData.id, diamond: diamond, add: false }, (res) => {
                Cache.alertTip("操作成功")
                this.lblDiamond.string = '' + (this.userData.diamond - diamond);
            }, true, (err) => {
                Cache.alertTip(err.message || "调配失败")
            })
        })
    }
    onDestroy() {
        this.removeEvents()
    }


}


