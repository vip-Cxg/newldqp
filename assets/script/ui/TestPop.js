import { GameConfig } from "../../GameBase/GameConfig";
import PopupBase from "../base/pop/PopupBase";
import { App } from "./hall/data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class LoginPop extends PopupBase {
    @property(cc.EditBox)
    boxPhone = null;
    @property(cc.EditBox)
    boxPwd = null;
    @property(cc.EditBox)
    boxCode = null;

    codeCoolDown = true;



    start() {
    };

    
    onShow() {
        console.log("onshow---")

    };
    onClickLogin(){
        console.log("onClickLogin---",this.boxPhone.string);
        console.log("onClickLogin---",this.boxPwd.string);
        console.log("onClickLogin---",this.boxCode.string);
        
    }
    
}


