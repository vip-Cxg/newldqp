import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import Avatar from "../common/Avatar";

const { ccclass, property } = cc._decorator
@ccclass
export default class SharePop extends cc.Component {
    @property(Avatar)
    img = null;

    onLoad() {
        this.addEvents();

 Connector.request(GameConfig.ServerEventName.GetGameInfo, {}, (data) => {

            if (data.data) {
                GameConfig.ConfigUrl = data.data.resourceUrl;
                GameConfig.NoticeUrl = data.data.noticeUrl;
                GameConfig.RecordUrl = data.data.recordUrl;
                GameConfig.HeadUrl = data.data.headUrl;
                GameConfig.DownloadUrl = data.data.download;
                GameConfig.RoomConfig = data.data.gameConfig;
                GameConfig.ShareUrl = data.data.shareUrl;
                for (let key in data.data) {
                    GameConfig.GameInfo[key] = data[key];

                }
            }
            this.img.avatarUrl = GameConfig.ShareUrl;
            console.log('123123', this.img.avatarUrl);

        });

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


