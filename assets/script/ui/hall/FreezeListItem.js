import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import { Social } from "../../../Main/Script/native-extend";
import GameUtils from "../../common/GameUtils";
const { ccclass, property } = cc._decorator
@ccclass
export default class FreezeListItem extends cc.Component {




    @property(cc.Label)
    lblTime = null;
    @property(cc.Label)
    lblStatus = null;
    @property(cc.Label)
    lblAmount = null;
    @property(cc.Label)
    lblReason = null;
    onLoad() {
    }

    renderUI(data) {
    

        this.lblAmount.string=''+GameUtils.formatGold(data.amount);
        this.lblStatus.string=data.status=='freeze'?'冻结':'已解冻';
        this.lblTime.string=new Date(data.unfreezeDate).format("yyyy-MM-dd hh:mm:ss");
        this.lblReason.string=''+data.reason;

        if(data.type=='REPORT'||data.type=='REPORTED'){
            this.node.on(cc.Node.EventType.TOUCH_END,()=>{
                Social.setCopy(data.replayID);
                Cache.alertTip('回放码已复制');
            },this)
        }

    }




    onClickClose() {
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
}


