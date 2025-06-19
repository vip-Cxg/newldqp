import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import { Social } from "../../../Main/Script/native-extend";

const { ccclass, property } = cc._decorator
@ccclass
export default class BlackListPop extends cc.Component {

    @property(cc.Label)
    lblSuspectID = null;
    @property(cc.Label)
    lblReporterID = null;
    @property(cc.Label)
    lblSuspectName = null;
    @property(cc.Label)
    lblReporteName = null;
    @property(cc.Label)
    lblReason = null;
    @property(cc.Label)
    lblFileID = null;
    @property(cc.Label)
    lblStatus = null;
    @property(cc.Node)
    handleBtn = null;
    @property(cc.Node)
    maliciousBtn = null;

    itemData = null;
    reportID = null;
    reporterID = null;
    linkCount = 0;

    onLoad() {
    }

    renderUI(data) {
        // {
        //     "id": 10002,
        //     "clubID": 621573,
        //     "reporterID": 492370,
        //     "suspectID": 970914,
        //     "fileID": "20220314/XHZD_734137_PJBQG8FT_1_1",
        //     "reason": "测试",
        //     "status": 0,
        //     "scoreLogs": "0",
        //     "createdAt": "2022-03-14T19:53:57.000Z",
        //     "updatedAt": "2022-03-14T19:53:57.000Z"
        // }
        try {
            this.itemData = data;
            this.reporterID = data.reporterID;
            this.reportID = data.id;
            this.handleBtn.active = data.status == 0;
            this.maliciousBtn.active = data.status == 0;
            switch (data.status) {
                case -1:
                    this.lblStatus.string = '未冻结钱';
                    break;
                case 1:
                    this.lblStatus.string = '已处理';
                    break;
                case 0:
                    this.lblStatus.string = '未处理'
                    break;
                default:
                    this.lblStatus.string='未知状态';
                    break;
            }
            this.lblFileID.string = data.fileID;
            this.lblReporterID.string = data.reporterID;
            this.lblSuspectID.string = data.suspectID;
            this.lblReporteName.string = data.reporterName;
            this.lblSuspectName.string = data.suspectName;
            this.lblReason.string = data.reason;
        } catch (error) {
            Cache.alertTip(data.id+"数据错误")
        }
       

    }

    openReplay() {
       
        Cache.playSfx();
        Social.setCopy(this.lblFileID.string);
        Cache.alertTip("回放码已复制")
        // let firstIndex = this.lblFileID.string.indexOf('/');
        // let endIndex = this.lblFileID.string.indexOf('_');
        // let gametype = this.lblFileID.string.slice(firstIndex + 1, endIndex);
        // let gameid = DataBase.GAME_TYPE[gametype] < 10 ? '0' + DataBase.GAME_TYPE[gametype] : DataBase.GAME_TYPE[gametype];
        Connector.get(GameConfig.RecordUrl + 'records/' + this.lblFileID.string + '.json', "getJson", (resData) => {
            Cache.replayData = resData;
            GameConfig.CurrentReplayData = this.lblFileID.string;
            this.linkCount = 0

            if (resData == null) {
                Cache.alertTip("暂无回放");
                return;
            }
            cc.loader.loadRes(`prefab/AdminReplay09`, (err, prefab) => {
                if (!err) {
                    let nodeReplay = cc.instantiate(prefab);
                    nodeReplay.getComponent("ModuleReplay_09").adminReplayInit( this.itemData)
                    nodeReplay.parent = cc.find('Canvas');
                } else {
                    cc.log('error to load replay');
                }
            });
        },true,()=>{

            if (this.linkCount == 0) {
                // 将时间字符串解析为日期对象
                const dateString = this.lblFileID.string.split("/")[0];
                const year = dateString.substring(0, 4);
                const month = dateString.substring(4, 6) - 1; // 月份要减去1，因为月份从0开始计数
                const day = dateString.substring(6, 8);
                const date = new Date(year, month, day);

                // 进行加减法操作
                // date.setDate(date.getDate() + 1); // 加一天
                date.setDate(date.getDate() - 1); // 减一天
                this.linkCount++;
                // 将结果格式化为 "yyyyMMdd" 格式的字符串
                const result = date.getFullYear() +
                    ("0" + (date.getMonth() + 1)).slice(-2) +
                    ("0" + date.getDate()).slice(-2);

                let c = result + '/' + this.lblFileID.string.split("/")[1];
                console.log(result, c); // 输出加减法后的时间字符串

                this.lblFileID.string = c;
                this.openReplay();
            }
        });
    }

    onClickDetail() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.UserInfoPop, (node) => {
            node.getComponent('UserInfoPop').initUserID(parseInt(this.lblSuspectID.string));
        })
    }
    handleReport() {
        // Connector.request(GameConfig.ServerEventName.FinishReport,{fileID: '20220318/XHZD_473721_772H55DC_1_1',clubID:App.Club.CurrentClubID,reportID:this.reportID },(data)=>{
        Connector.request(GameConfig.ServerEventName.FinishReport, { fileID: this.lblFileID.string, clubID: App.Club.CurrentClubID, reportID: this.reportID }, (data) => {
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_REPORT_LIST);
        })
    }
    setMalicious() {
        // Connector.request(GameConfig.ServerEventName.SetMalicious,{fileID: '20220318/XHZD_473721_772H55DC_1_1',clubID:App.Club.CurrentClubID,userID:this.reporterID,reportID:this.reportID },(data)=>{
        Connector.request(GameConfig.ServerEventName.SetMalicious, { fileID: this.lblFileID.string, clubID: App.Club.CurrentClubID, userID: this.reporterID, reportID: this.reportID }, (data) => {
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_REPORT_LIST);
        })
    }

}



