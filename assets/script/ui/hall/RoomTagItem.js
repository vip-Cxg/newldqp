import { GameConfig } from "../../../GameBase/GameConfig";
import { App } from "./data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class RoomTagItem extends cc.Component {
    @property(cc.Label)
    desc = null;
    @property(cc.Node)
    tagContent = null;

    @property(cc.Prefab)
    tagItem = null;

    renderUI(key, data) {
        this.desc.string = GameConfig.GameName[key] + ':';
        this.tagContent.removeAllChildren();
        data.forEach(element => {
            let tagBtn = cc.instantiate(this.tagItem);
            tagBtn.getComponent('RoomToggle').initDate(element);
            this.tagContent.addChild(tagBtn);
            
        });

    }


}


