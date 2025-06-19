import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
import DataBase from "../../../Main/Script/DataBase";
import Connector from "../../../Main/NetWork/Connector";
import { App } from "./data/App";
import Avatar from "../common/Avatar";
import { Dict } from "./data/Dict";


const { ccclass, property } = cc._decorator
@ccclass
export default class TableRoomBtn extends cc.Component {



    @property(cc.Label)
    desc = null;

    roomData=null;

    /**更新UI */
    initData(data) {
        this.desc.string=data.name;
        this.roomData=data;
        this.node.on(cc.Node.EventType.TOUCH_END,this.enterGame,this);
    }
    enterGame() {
        Cache.playSfx();

        if (this.roomData.gameType == 'XHZD') {
            GameUtils.pop(GameConfig.pop.MatchPop, (node) => {
                node.getComponent("ModuleMatchPop").startMatch(this.roomData.roomID);
            })
        } else {

            let questData =  { roomID: this.roomData.roomID, gameType: this.roomData.gameType, tableID: "", clubID: App.Club.CurrentClubID } ;
            Connector.request(GameConfig.ServerEventName.JoinClubGame, questData, (data) => {
                GameConfig.IsConnecting = false;
                GameConfig.ShowTablePop = true;
                Connector.connect(data, () => {
                    GameConfig.CurrentGameType = data.data.gameType;
                    DataBase.setGameType(DataBase.GAME_TYPE[data.data.gameType]);
                    //Connector.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.START_ENTER_SCENE, gametype: data.data.gameType })
                    cc.director.loadScene(DataBase.TABLE_TYPE[data.data.gameType]);
                });
            }, true, (err) => {
                GameConfig.IsConnecting = false;
                Cache.showTipsMsg(GameUtils.isNullOrEmpty(err.message) ? "进入游戏失败" : err.message);
    
            })
        }


    }

    robotInit(data){
        this.desc.string=data.name;
        this.roomData=data;
        this.node.on(cc.Node.EventType.TOUCH_END,this.robotEvent,this);
    }
    robotEvent(){
        Cache.playSfx();
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.ROBOT_SELECT_ROOM, this.roomData);
    }


    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        this.node.removeFromParent();
        this.node.destroy();
    }


}


