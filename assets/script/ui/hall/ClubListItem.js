import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
import { App } from "../../ui/hall/data/App";
import Avatar from "../common/Avatar";


const { ccclass, property } = cc._decorator
@ccclass
export default class ClubListItem extends cc.Component {

    @property(cc.SpriteFrame)
    clubBg = null;
    @property(cc.SpriteFrame)
    leagueBg = null;
    @property(Avatar)
    avatar = null;
    @property(cc.Label)
    lblCuster = null;
    @property(cc.Label)
    lblInvite = null;
    @property(cc.Label)
    lblUserCount = null;
    @property(cc.Label)
    lblClubName = null;
    @property(cc.Label)
    lblClubID = null;
    @property(cc.Label)
    lblRole = null;



    renderClub(data) {
        this.node.getComponent(cc.Sprite).spriteFrame=this.clubBg;
        this.avatar.avatarUrl=data.owner.head;
        
        this.lblCuster.string = '会长: ' + data.owner.name;
        this.lblInvite.string = '邀请码: ' + data.inviter;
        this.lblUserCount.string = '总人数: ' + data.peoples;
        this.lblClubName.string =  data.club.name;
        this.lblClubID.string = '公会ID: ' + data.clubID;
        this.lblRole.string = '角色: ' + GameConfig.ROLE_DESC[data.role];
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            App.Club.CurrentClubID = data.clubID;
            App.Club.IsLeague = false;
            GameUtils.pop(GameConfig.pop.TablePop);
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CHOOSE_CLUB);
        }, this)
    }

    renderLeague(data) {
        this.node.getComponent(cc.Sprite).spriteFrame=this.leagueBg;

        this.avatar.avatarUrl=data.owner.head;
        
        this.lblCuster.string = '会长: ' + data.owner.name;
        this.lblInvite.string = '邀请码: ' + data.inviter;
        this.lblUserCount.string = '总人数: ' + data.peoples;
        this.lblClubName.string =  data.club.name;
        this.lblClubID.string = '联盟ID: ' + data.clubID;
        this.lblRole.string = '角色: ' + GameConfig.ROLE_DESC[data.role];
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            App.Club.CurrentClubID = data.clubID;
            App.Club.IsLeague = true;
            GameUtils.pop(GameConfig.pop.TablePop);
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CHOOSE_CLUB);

        }, this)
    }




}


