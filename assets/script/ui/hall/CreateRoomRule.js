import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
import { App } from "./data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class CreateRoomRule extends cc.Component {

    @property(cc.Node)
    ruleContent = null;

    @property(cc.Prefab)
    toggleItem = null;

    onLoad() {
        this.addEvents();
    }
    addEvents() {
        // App.EventManager.addEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_GAME, this.selectGame, this);
    }
    removeEvents() {

    }
    renderUI(data) {
        this.ruleContent.removeAllChildren();

        if (data) {
            data.selection.forEach((count, i) => {

                let toggleItem = cc.instantiate(this.toggleItem);
                let itemData = {
                    key: data.name,
                    value: count
                };
                if (i == 0)
                     App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_RULE,itemData);

                
                let descData = data.desc.replace('%s', count);
                toggleItem.getComponent('CreateRoomItem').initRule(itemData, descData, GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_RULE);
                this.ruleContent.addChild(toggleItem);
            })
        }

    }
    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}
