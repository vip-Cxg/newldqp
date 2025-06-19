import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../../script/common/GameUtils";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "./data/App";
const GAME_TYPE = {
    PDK: 'PDK_SOLO',
    LDZP: 'LDZP_SOLO',
    XHZD: 'XHZD',
    HZMJ: 'HZMJ_SOLO'
}
const { ccclass, property } = cc._decorator
@ccclass
export default class QuestItem extends cc.Component {




    @property(cc.Label)
    lblContent = null;
    @property([cc.Node])
    answerArr = [];
    

    
    currentIndex = 0;

    onLoad() {
    }
    
    renderUI(data) {
        this.currentId=data.questId;
        this.lblContent.string = data.content;
        data.answer.forEach(element => {
            this.answerArr[element.index].active=true;
            this.answerArr[element.index].getChildByName('word').getComponent(cc.Label).string=element.word;
        });

    }


    onClickAnswer(e,v){
        Cache.playSfx();
        let data={
            questId:this.currentId,
            answer:parseInt(v)
        }
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.QUESTION_SELECT_ANSWER,data)
    }

    onClickClose() {
        Cache.playSfx();
        this.removeEvents();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
}


