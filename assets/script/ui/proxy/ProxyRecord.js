

import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator
@ccclass
export default class InviteListItem extends cc.Component {


    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    recordItem = null;
    onLoad() {
        this.renderUI();
    }

    renderUI() {
        this.itemContent.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.InviteRecord, {}, (data) => {
            if (!GameUtils.isNullOrEmpty(data.list)) {
                data.list.forEach(element => {
                    let item = cc.instantiate(this.recordItem);
                    item.getChildByName('desc').getComponent(cc.Label).string = element.type == 'leave' ? '直属玩家' + element.name + '(' + element.id + ')' + '已离开 '+element.date : '玩家' + element.name + '(' + element.id + ')' + '已成为直属玩家 '+element.date;
                    this.itemContent.addChild(item);
                });
            }

            // date: "2021-11-28 23:50:19"
            // id: 100019
            // name: "Cxg"
            // type: "leave"
        })


    }







}


