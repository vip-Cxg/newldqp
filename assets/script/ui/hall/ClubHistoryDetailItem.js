

import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { Social } from "../../../Main/Script/native-extend";
import GameUtils from "../../common/GameUtils";
const { ccclass, property } = cc._decorator
@ccclass
export default class ClubHistoryDetailItem extends cc.Component {


    @property([cc.Label])
    tipsArr = [];
    @property(cc.Label)
    lblTurn = null;


    replayID = null;
    gameType = null;
    fileID = null;
    linkCount=0;
    initData(data, gameType) {
        this.lblTurn.string = '' + data.turn;
        this.fileID = data.fileID;//
        this.replayID = data.strDate + '/' + data.fileID + '_' + data.turn;
        data.score.scores.forEach((score, i) => {
            this.tipsArr[i].node.active = true;

            this.tipsArr[i].string =gameType=='LDZP'?score:'' + GameUtils.formatGold(score);
        })

    }
    onClickCopy() {
        Cache.playSfx();
        Cache.alertTip('复制 分享码 成功,可发送给他人');
        let firstIndex = this.replayID.indexOf('/');
        let endIndex = this.replayID.indexOf('_');
        let gametype = this.replayID.slice(firstIndex + 1, endIndex);
        Social.setCopy(this.replayID);
        console.log('123123',this.replayID)
    }


    onClickHistory() {
        Cache.playSfx();
        // http://192.168.1.102:8080/records/20211208/HNMJ_227830_QJE43TTC_1.json
        let firstIndex = this.replayID.indexOf('/');
        let endIndex = this.replayID.indexOf('_');
        let gametype = this.replayID.slice(firstIndex + 1, endIndex);
        let gameid = DataBase.GAME_TYPE[gametype] < 10 ? '0' + DataBase.GAME_TYPE[gametype] : DataBase.GAME_TYPE[gametype];
        // Connector.get('http://gmhxx.oss-cn-shenzhen.aliyuncs.com/records/20240222/HZMJ_350743_SA3DPTQ2_1_1.json', "getJson", (resData) => {
        // Connector.get(GameConfig.RecordUrl + 'records/20240403/LDZP_760796_HM3QYH5B_1_3.json', "getJson", (resData) => {

        Connector.get(GameConfig.RecordUrl + 'records/' + this.replayID + '.json', "getJson", (resData) => {
            Cache.replayData = resData;
            GameConfig.CurrentReplayData = this.replayID;
            this.linkCount = 0

            if (resData == null) {
                Cache.alertTip("暂无回放");
                return;
            }
            if (gameid == "") {
                Cache.alertTip("暂时无法播放");
                return
            }
            cc.loader.loadRes(`Main/Prefab/replay${gameid}`, (err, prefab) => {
                if (!err) {
                    let nodeReplay = cc.instantiate(prefab);
                    nodeReplay.parent = cc.find('Canvas');
                } else {
                    cc.log('error to load replay');
                }
            });
        },true,()=>{

            if (this.linkCount == 0) {
                // 将时间字符串解析为日期对象
                const dateString = this.replayID.split("/")[0];
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

                let c = result + '/' + this.replayID.split("/")[1];
                console.log(result, c); // 输出加减法后的时间字符串

                this.replayID = c;
                this.onClickHistory();
            }
        });
    }


}


