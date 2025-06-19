import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import Avatar from "../common/Avatar";
const { ccclass, property } = cc._decorator
@ccclass
export default class ChangeIDPop extends cc.Component {


    @property(cc.Node)
    inputNode = null;
    @property(cc.Label)
    idInput = null;
    @property(cc.Label)
    newIdInput = null;
   
    @property(cc.Label)
    lblTitle = null;

   





    popType = 'user';

    onLoad() {
        this.initUI()
    }


    onConfirm() {
        Cache.playSfx();
        if (this.idInput.string == "") {
            Cache.alertTip("请输入当前的玩家id")
            return;
        }
        if (this.newIdInput.string == "") {
            Cache.alertTip("请输入更换的玩家id")
            return;
        }

        Connector.request(GameConfig.ServerEventName.ChangeUserID, { id0: parseInt(this.idInput.string),id1: parseInt(this.newIdInput.string) }, (res) => {
            
                Cache.alertTip("操作成功")
                this.initUI()
            // }
        })

    }
    initUI() {
        this.idInput.string = "";
        this.newIdInput.string = "";
        this.inputNode.active = true;
    }
    onClickInput() {
        Cache.playSfx();
        Cache.showNumer('请输入当前的玩家ID',GameConfig.NumberType.INT, (userId) => {
            this.idInput.string = "" + userId;
        });

    }
    onClickNEWInput() {
        Cache.playSfx();
        Cache.showNumer('请输入更换的玩家ID',GameConfig.NumberType.INT, (userId) => {
            this.newIdInput.string = "" + userId;
        });

    }


    onClickClose() {
        Cache.playSfx();
        this.node.destroy();
    }



}


