import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
import { App } from "./data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class CreateClubPop extends cc.Component {

    @property(cc.EditBox)
    nameInput = null;
    @property(cc.Label)
    lblDesc = null;

    @property(cc.Node)
    nodeID = null;
    @property(cc.Label)
    lblID = null;

    @property(cc.Label)
    lblTitle = null;


    // @property(cc.Toggle)
    // hnmjTog = null;
    // @property(cc.Toggle)
    // lgmjTog = null;

    isLeague = false;

    onLoad() {
        this.addEvents();
    }
    addEvents() {
    }
    removeEvents() {

    }

    renderLeague() {
        this.nameInput.node.position = cc.v2(-54, 77);
        this.isLeague = true;
        this.lblDesc.string = '请输入联盟名称:';
        this.nodeID.active = true;
        this.lblTitle.string = '创建联盟';
    }

    inputCreatorID() {
        Cache.playSfx();
        Cache.showNumer('请输入盟主ID', GameConfig.NumberType.INT, (userID) => {
            this.lblID.string = '' + userID;
        })
    }

    onCreateClub() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.nameInput.string)) {
            Cache.alertTip('请输入公会名称')
            return;
        }
        if (this.isLeague && GameUtils.isNullOrEmpty(this.lblID.string)) {
            Cache.alertTip('请输入盟主ID')
            return;
        }
        let clubName = this.nameInput.string;

        // if (!this.hnmjTog.isChecked && !this.lgmjTog.isChecked) {
        //     Cache.alertTip('至少选择一个游戏');
        //     return;
        // }
        // let gameTypes = [];
        // if (this.hnmjTog.isChecked)
        //     gameTypes.push('HNMJ');
        // if (this.lgmjTog.isChecked)
        //     gameTypes.push('LGMJ');
        if (this.isLeague) {
            Connector.request(GameConfig.ServerEventName.CreateLeague, { clubName, userID: this.lblID.string }, (data) => {
                Cache.alertTip('创建成功');
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_HALL_CLUB);
                this.removeEvents()
                this.node.destroy();
            })
        } else {
            Connector.request(GameConfig.ServerEventName.CreateClub, { clubName }, (data) => {
                Cache.alertTip('创建成功');
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_HALL_CLUB);
                this.removeEvents()
                this.node.destroy();
            })
        }


    }


    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


