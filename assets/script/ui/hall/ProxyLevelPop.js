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
export default class ProxyLevelPop extends cc.Component {

    @property(cc.Label)
    lblLevel = null;
    @property(cc.Label)
    lblShuffle = null;

    proxyData = null;

    initData(data) {


        this.proxyData = data;
        this.lblLevel.string = '' + data.level;
        this.lblShuffle.string = '' + data.shuffleLevel;


    }
    onChangeShuffle() {
        Cache.playSfx();

        Cache.showNumer('修改洗牌', GameConfig.NumberType.INT, (shuffle) => {
            this.lblShuffle.string = '' + shuffle;

        })
    }

    onChangeLevel() {
        Cache.playSfx();

        Cache.showNumer('修改等级', GameConfig.NumberType.INT, (level) => {
            this.lblLevel.string = '' + level;
        })
    }

    changeLevel() {
        Cache.playSfx();
        Connector.request(GameConfig.ServerEventName.UpdateLevel, { shuffleLevel: parseInt(this.lblShuffle.string), level: parseInt(this.lblLevel.string), userID: this.proxyData.userID, clubID: App.Club.CurrentClubID, whole: false }, (data) => {
            Cache.alertTip('操作成功');
            //TODO 发送事件
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.PROXY_LEVEL_UPDATE)
            this.node.destroy();
        })
    }
    onClickClose() {
        Cache.playSfx();
        this.node.destroy();
    }




}


