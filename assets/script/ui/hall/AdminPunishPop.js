import { GameConfig } from "../../../GameBase/GameConfig";
import Connector, { ts } from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator
@ccclass
export default class AdminPunishPop extends cc.Component {

    @property(cc.Label)
    lblAmount = null;
    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblID = null;
    
    user=null;
    reportData=null;
    
    initData(user,reportData){
          // {
            //     "id": 10075,
            //     "clubID": 621573,
            //     "reporterID": 492370,
            //     "suspectID": 271759,
            //     "fileID": "20220319/XHZD_835355_DDCQKJGG_1_1",
            //     "reason": "123123",
            //     "freeze": 180000,
            //     "status": 0,
            //     "scoreLogs": "0",
            //     "createdAt": "2022-03-19T13:44:27.000Z",
            //     "updatedAt": "2022-03-19T13:44:30.000Z",
            //     "suspectName": "洗澡",
            //     "reporterName": "洗澡"
            // }
        this.user=user;
        this.reportData=reportData;
        this.lblID.string=''+this.user.pid;
        this.lblName.string=''+this.user.name;
    }
    
    inputAmount() {
        Cache.showNumer('请输入赔偿金额', GameConfig.NumberType.INT, (amount) => {
            this.lblAmount.string = '' + amount;
        })
    }

    onClickClose() {
        Cache.playSfx();
        this.node.removeFromParent();
        this.node.destroy();
    }
    handleReport() {
        Connector.request(GameConfig.ServerEventName.HandleReport, {
            fileID: GameConfig.CurrentReplayData,
            userID: this.user.pid,
            reportID:this.reportData.id,
            amount: parseInt(this.lblAmount.string) * 100,
            clubID: App.Club.CurrentClubID
        }, (data) => {
            Cache.alertTip("补偿成功");
            this.node.removeFromParent();
            this.node.destroy();
        })
    }

}



