import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
const { ccclass, property } = cc._decorator
@ccclass
export default class FreezeListPop extends cc.Component {




    @property(cc.Node)
    listContent= null;
    @property(cc.Prefab)
    listItem = null;

    onLoad() {
        this.renderUI();
    }

    renderUI() {
        this.listContent.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.UserFreezeList, {}, (data) => {
            if(!GameUtils.isNullOrEmpty(data.logs)){
                data.logs.forEach((e)=>{
                    let listItem=cc.instantiate(this.listItem);
                    listItem.getComponent('FreezeListItem').renderUI(e);
                    this.listContent.addChild(listItem);
                })
            }
        })

    }




    onClickClose() {
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
}


