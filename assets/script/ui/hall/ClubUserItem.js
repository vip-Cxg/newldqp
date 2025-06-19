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
export default class ClubUserItem extends cc.Component {

    @property(Avatar)
    avatar = null;
    @property(cc.Label)
    lblStatus = null;
    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblId = null;
    @property(cc.Sprite)
    roleSpr = null;
    @property([cc.SpriteFrame])
    roleIconArr = [];

    userData = null;

    initData(data) {


        this.userData = data;
        // {
        //     "userID": 98961940,
        //     "role": "owner",
        //     "user": {
        //         "name": "游客98961940",
        //         "head": null
        //     },
        //     "isInGame": 0
        // }

        //TODO 玩家分数

        this.avatar.avatarUrl = data.user.head;

        if (data.userID == DataBase.player.id) {
            this.lblStatus.string = '自己';
            this.lblStatus.node.color = new cc.color(255, 0, 0);

        } else {
            this.lblStatus.string = '' + STATUS_DESC[data.isInGame];

            this.lblStatus.node.color = data.isInGame == 0 ? new cc.color(255, 255, 255) : new cc.color(0, 255, 0);

        }
        this.lblName.string = '' + GameUtils.getStringByLength(data.user.name, 6);
        this.lblId.string = '' + data.userID;

      
        switch (data.role) {
            case 'user':
                this.roleSpr.node.active = false;
                break;
            case 'proxy':
                this.roleSpr.node.active = true;
                this.roleSpr.spriteFrame = this.roleIconArr[1];
                break;
            case 'owner':
                this.roleSpr.node.active = true;
                this.roleSpr.spriteFrame = this.roleIconArr[0];
                break;
            case 'manager':
                this.roleSpr.node.active = true;
                this.roleSpr.spriteFrame =this.roleIconArr[2];
                break;
        }

    }

    onClickDetail() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.UserInfoPop, (node) => {
            node.getComponent('UserInfoPop').initUserID(this.userData.userID);
        })
    }

    changeScore(e, v) {
        let reg = /^[0-9]*[1-9][0-9]*$/;
        if (!reg.test(this.scoreInput.string)) {
            Cache.alertTip("请输入整数金额")
            return;
        }
        let userScore = v == 'add' ? this.scoreInput.string : '-' + this.scoreInput.string;
        Connector.request(GameConfig.ServerEventName.UpdateScore, { score: parseInt(userScore), userID: this.userData.userID, clubID: App.Club.CurrentClubID }, (data) => {
            Cache.alertTip(v == 'add' ? '上分成功' : '下分成功');
            this.userData.score = this.userData.score + parseInt(userScore);
            this.initData(this.userData);
            App.Club.ClubScore = data.score;
        })
    }




}


