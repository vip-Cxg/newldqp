import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
import { App } from "./data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class CreateRoomItem extends cc.Component {

    @property(cc.Label)
    lblDesc = null;

    eventKey=null;

    onLoad() {
        // this.addEvents();
        // this.renderUI();
    }
    // addEvents() {
    //     App.EventManager.addEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_GAME, this.selectGame, this);
    //     App.EventManager.addEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_PERSON, this.selectRoom, this);
    // }
    // removeEvents() {
    //     App.EventManager.removeEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_GAME, this.selectGame, this);
    //     App.EventManager.removeEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_PERSON, this.selectRoom, this);

    // }

    initGame(data,index,key){
        this.eventKey=key;
        this.eventData=index;

        this.lblDesc.string=data.name;
    }
    initPerson(data,index,key){
        this.lblDesc.string=data+'人场';
        this.eventKey=key;
        this.eventData=data;
    }

    initRule(data,desc,key){
        this.lblDesc.string=desc;
        this.eventKey=key;
        this.eventData=data;
    }

    onClickItem(){
        Cache.playSfx();
        App.EventManager.dispatchEventWith(this.eventKey,this.eventData);
    }

}


