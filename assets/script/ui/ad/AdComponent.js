import { GameConfig } from "../../../GameBase/GameConfig";
import { Social } from "../../../Main/Script/native-extend";
import GameUtils from "../../common/GameUtils";
const { ccclass, property } = cc._decorator
@ccclass
export default class LoginPop extends cc.Component {



    url = '';
    jumpType = 'url';

    initAd(data) {
        this.url = data.adUrl;
        this.jumpType = data.jumpType;
        GameUtils.loadImg(data.imgUrl).then((tex) => {
            // let spriteFrame = new cc.SpriteFrame(tex);
            this.node.getComponent(cc.Sprite).spriteFrame = tex;
        });
        this.node.on(cc.Node.EventType.TOUCH_END, this.jumpUrl, this);

    }

    jumpUrl() {
        if(GameUtils.isNullOrEmpty(this.url)){
            return;
        }
        switch (this.jumpType) {
            case 'url':
                Social.openUrl(this.url);
                break;
            case 'pop':
                GameUtils.pop(GameConfig.pop[this.url]);
                break;
        }
    }

    hideAd() {
        this.node.active = false;
    }
    showAd() {
        this.node.active = true;
    }

}


