import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import { App } from "./data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class RobotPop extends cc.Component {



    @property(cc.Node)
    itemContent = null;

    @property(cc.Prefab)
    itemPre = null;


    @property(cc.Label)
    lblRoom = null;

    currentRoomID = null;
    onLoad() {
        this.addEvents();
        this.refreshUI();
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.ROBOT_SELECT_ROOM, this.selectRoom, this);
    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.ROBOT_SELECT_ROOM, this.selectRoom, this);

    }
    selectRoom(e) {
        this.lblRoom.string = '操作房型: ' + e.data.name;
        this.currentRoomID = e.data.roomID;
    }
    /**更新UI */
    refreshUI() {

        //TODO
        this.itemContent.removeAllChildren();
        GameConfig.TableAllRooms.forEach(element => {
            let item = cc.instantiate(this.itemPre);
            item.getComponent('TableRoomBtn').robotInit(element);
            this.itemContent.addChild(item);
        });
    }
    changeTable(e, v) {
        Cache.playSfx();
        if (!this.currentRoomID) return;
        Connector.request(GameConfig.ServerEventName.Robot, { roomID: this.currentRoomID, clubID: App.Club.CurrentClubID, operate: parseInt(v) }, (data) => {
            Cache.alertTip('操作成功')

        }, true, (err) => {
            Cache.alertTip(err.message || '操作失败')
        })
    }


    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        this.removeEvents();
        this.node.removeFromParent();
        this.node.destroy();
    }


}


