import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import { App } from "./data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class RoomToggle extends cc.Component {
    @property(cc.Toggle)
    selfToggel = null;
    @property(cc.Label)
    lblRoomName = null;
    @property(cc.Label)
    lblLower = null;
    @property(cc.Label)
    lblFee = null;

    currentData = null;
    initDate(data) {
        // {
        //     "roomID": 10030,
        //     "name": "单挑 1毛",
        //     "gameType": "HZMJ",
        //     "base": 1,
        //     "fee": 10,
        //     "lower": 50,
        //     "person": 2
        // }
        this.currentData = data;
        this.lblRoomName.string = '' + data.name;
        this.lblLower.string = '' + data.lower;
        this.lblFee.string = '' + data.fee;
        // new cc.Toggle().isChecked
        this.selfToggel.isChecked=data.choose;
        // this.selfToggel.check();

        this.selfToggel.node.on(cc.Node.EventType.TOUCH_END, () => {
            setTimeout(() => {
                if (this.selfToggel.isChecked) {
                    App.EventManager.dispatchEventWith(GameConfig.GameEventNames.SELECT_TAG_HISTORY, this.currentData)
                } else {
                    App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, this.currentData)
                }
                // if (this.selfToggel.isChecked) {
                //     App.EventManager.dispatchEventWith(GameConfig.GameEventNames.SELECT_TAG_HISTORY, element.id)
                // } else {
                //     App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, element.id)
                // }
            }, 300);
        }, this)
    }

    onInputFee() {
        Cache.playSfx();
        Cache.showNumer('请输入房费', GameConfig.NumberType.FLOAT,(fee) => {
            this.lblFee.string = '' + fee;
            this.currentData.fee = fee;
            if (this.selfToggel.isChecked) {
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.SELECT_TAG_HISTORY, this.currentData)
            } else {
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, this.currentData)
            }
        })
    }
    onInputLower() {
        Cache.playSfx();
        Cache.showNumer('请输入最低积分限制',GameConfig.NumberType.FLOAT, (lower) => {
            this.lblLower.string = '' + lower;
            this.currentData.lower = lower;
            if (this.selfToggel.isChecked) {
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.SELECT_TAG_HISTORY, this.currentData)
            } else {
                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, this.currentData)
            }

        })
    }


}


