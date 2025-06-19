
import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import { App } from "./data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class InviteListItem extends cc.Component {


    @property(cc.Label)
    lblDesc = null;
    @property(cc.Label)
    lblInfo = null;
    @property(cc.Node)
    btnConfirm = null;
    @property(cc.Node)
    btnCancel = null;


    itemData = null;
    itemIndex = 0;
    onLoad() {

    }

    renderUI(data, index) {
        this.itemData = data;
        this.itemIndex = index;
        // {
        //     "inviter": {
        //         "id": 207336,
        //         "name": "游客207336",
        //         "head": null
        //     },
        //     "club": {
        //         "id": 749045,
        //         "name": "旺仔公会"
        //     },
        //     "date": "2021-12-06 07:42:48"
        // }
        if (this.itemData.status == 'wait') {
            this.btnConfirm.active = true;
            this.btnCancel.active = true;
        }
        this.lblInfo.string = '合伙人ID: ' + this.itemData.inviter.id + ' 昵称: ' + this.itemData.inviter.name;
        this.lblDesc.string = '邀请您加入公会: ' + this.itemData.club.name;

    }




    onResponse(e, v) {
        // [
        //     {
        //         "inviter": {
        //             "id": 98961940,
        //             "name": "游客98961940",
        //             "head": null
        //         },
        //         "club": {
        //             "id": 542918,
        //             "name": "旺仔公会"
        //         },
        //         "date": "2021-12-02 19:50:11"
        //     }
        // ]
        //    参数proxyID, status = 'confirm'/'reject'
        Cache.playSfx();
        //type = confirm || reject
        //    client.processInvite({ clubID: 136335, userID: 59581953, type: 'confirm' });
        Connector.request(GameConfig.ServerEventName.ProcessInvite, { clubID: this.itemData.club.id, userID: this.itemData.inviter.id, status: v }, (res) => {
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.UPDATE_INVITE_LIST, { status: v, index: this.itemIndex })
        })
    }



}


