import Cache from "../../../Main/Script/Cache";
import { Social } from "../../../Main/Script/native-extend";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubUserItem extends cc.Component {

    code='';
    initData(data) {
        this.code=data;
        this.node.on(cc.Node.EventType.TOUCH_END,this.copyCode,this);

    }

    
    copyCode(){
        Social.setCopy(this.code);
        Cache.alertTip("回放码已复制")

    }

}


