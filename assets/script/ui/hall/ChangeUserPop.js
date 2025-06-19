import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import Avatar from "../common/Avatar";
const { ccclass, property } = cc._decorator
@ccclass
export default class ChangeUserPop extends cc.Component {

    @property(cc.Label)
    idInput = null;
    @property(cc.Label)
    proxyInput = null;

    onConfirm() {
        Cache.playSfx();
        if (this.idInput.string == "") {
            Cache.alertTip("请输入调配玩家ID")
            return;
        }
        if (this.proxyInput.string == "") {
            Cache.alertTip("请输入目标上级ID")
            return;
        }
        Connector.request(GameConfig.ServerEventName.ChangeProxy, { userID: parseInt(this.idInput.string), proxyID: parseInt(this.proxyInput.string), clubID: App.Club.CurrentClubID }, (res) => {
            Cache.alertTip("调配成功")
        }, true, (err) => {
            Cache.alertTip(err.message || "调配失败")
        })

    }
    onInputUser() {
        Cache.playSfx();
        Cache.showNumer('请输入调配玩家ID',GameConfig.NumberType.INT, (userId) => {
            this.idInput.string = "" + userId;
        });

    }
    onInputProxy() {
        Cache.playSfx();
        Cache.showNumer('请输入目标上级ID',GameConfig.NumberType.INT, (proxyId) => {
            this.proxyInput.string = "" + proxyId;
        });

    }

    onClickClose() {
        Cache.playSfx();
        this.node.destroy();
    }



}


