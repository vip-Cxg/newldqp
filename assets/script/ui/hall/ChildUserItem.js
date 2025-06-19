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
    lblYdTurn = null;
    @property(cc.Label)
    lblTdTurn = null;
    @property(cc.Label)
    lblYdFee = null;
    @property(cc.Label)
    lblTdFee = null;
    @property(cc.Label)
    lblScore = null;

    @property(cc.Node)
    addBtn = null;
    @property(cc.Node)
    reduceBtn = null;

    @property(cc.Sprite)
    roleSpr = null;
    @property([cc.SpriteFrame])
    roleIconArr = [];

    userData = null;
    showReduce = false

    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.updateScore, this);
    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.updateScore, this);

    }
    updateScore() {
        this.lblScore.string = '' + GameUtils.formatGold(App.Club.ClubScore);

    }
    initData(data, showReduce = false) {
        this.showReduce = showReduce;
        // {
        //     "userID": 24582998,
        //     "role": "owner",
        //     "parent": 24582998,
        //     "score": 9100,
        //     "user": {
        //         "name": "游客24582998",
        //         "head": null
        //     },
        //     "isInGame": 0, //是否在游戏中
        //     "ydTurn": 0,  //昨日局数
        //     "tdTurn": 0,  //今日局数
        //     "ydFee": 0,  //昨日贡献
        //     "tdFee": 0  //今日贡献
        // },
        this.userData = data;
        this.avatar.avatarUrl = data.user.head;
        // if (!showReduce) {
        //     this.reduceBtn.active = false;
        //     this.addBtn.x += this.addBtn.width / 2;
        // }
        if (data.parent != DataBase.player.id) {
            this.reduceBtn.active = false;
            this.addBtn.x += this.addBtn.width / 2;
        }

        if (data.userID == DataBase.player.id) {
            this.lblStatus.string = '自己';
            this.lblStatus.node.color = new cc.color(255, 0, 0);
            this.addEvents();
        } else {
            this.lblStatus.string = '' + STATUS_DESC[data.isInGame];

            this.lblStatus.node.color = data.isInGame == 0 ? new cc.color(255, 255, 255) : new cc.color(0, 255, 0);
        }

        let new_desc = {
            'normal': '',
            'frozen': '(冻结)',
            'blacklist': '(拉黑)',
            'limit': '(限制)',
        }
        if (data.status)
            this.lblStatus.string = this.lblStatus.string + new_desc[data.status]

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
                this.roleSpr.spriteFrame = this.roleIconArr[2];
                break;
        }

        this.lblYdTurn.string = '' + (data.ydTurn || 0)
        this.lblTdTurn.string = '' + (data.tdTurn || 0)
        this.lblYdFee.string = '' + (GameUtils.formatGold(data.ydFee) || 0)
        this.lblTdFee.string = '' + (GameUtils.formatGold(data.tdFee) || 0)
        this.lblScore.string = '' + (GameUtils.formatGold(data.score) || 0)


    }

    onClickDetail() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.UserInfoPop, (node) => {
            node.getComponent('UserInfoPop').initUserID(this.userData.userID);
        })
    }

    onAddScore() {
        Cache.playSfx();
        Cache.showNumer('增加体力', GameConfig.NumberType.FLOAT, (score) => {
            this.changeScore(score)
        })
    }
    onReduceScore() {
        Cache.playSfx();
        Cache.showNumer('减少体力', GameConfig.NumberType.FLOAT, (score) => {
            this.changeScore(parseFloat('-' + score));
        })
    }

    changeScore(userScore) {
        Connector.request(GameConfig.ServerEventName.UpdateScore, { score: parseInt(userScore * 100), userID: this.userData.userID, clubID: App.Club.CurrentClubID }, (data) => {
            Cache.alertTip('操作成功');
            this.userData.score = this.userData.score + parseInt(userScore * 100);
            this.initData(this.userData, this.showReduce);
            App.Club.ClubScore = data.score;
        })
    }

    onDestroy() {
        this.removeEvents()
    }


}


