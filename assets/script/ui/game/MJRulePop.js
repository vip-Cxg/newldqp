import Cache from "../../../Main/Script/Cache";


const { ccclass, property } = cc._decorator
@ccclass
export default class MJRulePop extends cc.Component {




    onLoad() {
        // this.onHideMenu();
        // this.node.position = cc.v2(cc.winSize.width / 2 + this.node.width / 2, cc.winSize.height / 2 - this.node.height / 2);
        // console.log("111")
        // this.btnClose.active = false;
        // this.btnOpen.active = true;
    }

    onClickClose(){
        Cache.playSfx();
        if(this.node){
            this.node.destroy();
        }
    }

}


