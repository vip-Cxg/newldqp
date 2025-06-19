import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import Avatar from "../common/Avatar";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubHistoryDetailPop extends cc.Component {

    // @property(Avatar)
    // avatar = null;
    // @property(cc.Label)
    // lblLevel = null;
    // @property(cc.Label)
    // lblName = null;
    // @property(cc.Label)
    // lblId = null;

    @property([cc.Label])
    tipsArr = [];
    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    detailItem = null;


    historyData = null;

    initData(data) {
        console.log("2123123",data)
        data.data.players.forEach((player,i)=>{
            this.tipsArr[i].node.active=true;
            this.tipsArr[i].string=GameUtils.getStringByLength(player.prop.name,5);
        })

        this.itemContent.removeAllChildren();
        data.data.details.forEach((e, i) => {
            let item=cc.instantiate(this.detailItem);
            let itemData={
                fileID:data.fileID,
                score:e,
                turn:i+1,
                strDate:data.strDate,
            }
            item.getComponent('ClubHistoryDetailItem').initData(itemData,data.gameType);
            this.itemContent.addChild(item);
        });

    }
    onClickClose() {
        Cache.playSfx();
        this.node.destroy();
    }



}


