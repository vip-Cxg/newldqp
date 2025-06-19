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
export default class ChildUserItem extends cc.Component {

    @property(Avatar)
    avatar = null;
    @property(cc.Label)
    lblStatus = null;
    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblId = null;

    @property(cc.Label)
    lblTurn = null;
  
    @property(cc.Label)
    lblScore = null;

    @property(cc.Sprite)
    roleSpr = null;
    @property([cc.SpriteFrame])
    roleIconArr = [];


    initData(data) {
        this.avatar.avatarUrl = data.user.head;
   
   
        if (data.userID == DataBase.player.id) {
            this.lblStatus.string = '自己';
            this.lblStatus.node.color = new cc.color(255, 0, 0);
        } else {
            this.lblStatus.string = '' ;

            this.lblStatus.node.color = data.isInGame == 0 ? new cc.color(255, 255, 255) : new cc.color(0, 255, 0);


        }
        this.lblName.string = '' + GameUtils.getStringByLength(data.user.name, 6);
        this.lblId.string = '' + data.userID;

        this.lblTurn.string = '' + (data.turn || 0)
        this.lblScore.string = '' + (GameUtils.formatGold(data.score) || 0)


    }



}


