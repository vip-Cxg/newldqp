import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator
@ccclass
export default class BlackListPop extends cc.Component {

    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    listItem = null;
    @property(cc.EditBox)
    fileIDInput = null;

    onLoad() {
        this.addEvents();
        this.downloadList();
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.UPDATE_REPORT_LIST, this.downloadList, this);

    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.UPDATE_REPORT_LIST, this.downloadList, this);
    }

    downloadList() {
        this.itemContent.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.ReportLogs, { clubID: App.Club.CurrentClubID }, (res) => {
            if (!GameUtils.isNullOrEmpty(res.data)) {
                res.data.forEach((e) => {
                    let item = cc.instantiate(this.listItem);
                    item.getComponent('BlackListItem').renderUI(e);
                    this.itemContent.addChild(item);
                })
            }


        })


    }
    onSearch() {
        Cache.playSfx();
        if (this.fileIDInput.string == '')
            return;
        this.itemContent.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.ReportLogs, { clubID: App.Club.CurrentClubID, fileID: this.fileIDInput.string }, (res) => {
            if (!GameUtils.isNullOrEmpty(res.data)) {
                res.data.forEach((e) => {
                    let item = cc.instantiate(this.listItem);
                    item.getComponent('BlackListItem').renderUI(e);
                    this.itemContent.addChild(item);
                })
            }
        })
    }

    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


