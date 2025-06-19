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
export default class AdminClubItem extends cc.Component {



    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblId = null;

    @property(cc.Label)
    lblCount = null;
    clubData = null;

    addEvents() {
        // App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.updateScore, this);
    }
    removeEvents() {
        // App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.updateScore, this);

    }
    updateScore() {

    }
    initData(data) {

        this.clubData = data;
        this.lblName.string = '' + data.name;
        this.lblId.string = '' + data.id;
        this.lblCount.string = '' + data.persons;


    }

    onClickDetail() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.AdminDetailPop, (node) => {
            node.getComponent('AdminDetailPop').renderClub(this.clubData);
        })
        // Connector.request(GameConfig.ServerEventName.AdminClubInfo, { clubID: this.clubData.id }, (res) => {
           
        // })
    }
    onDestroy() {
        this.removeEvents()
    }


}


