import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import Avatar from "../common/Avatar";

const { ccclass, property } = cc._decorator
@ccclass
export default class SharePop extends cc.Component {
    @property(Avatar)
    img = null;

    onLoad() {
        this.addEvents();
        this.img.avatarUrl = GameConfig.ShareUrl;
        console.log('123123',this.img.avatarUrl);

    }
    addEvents() {
    }
    removeEvents() {

    }

    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


