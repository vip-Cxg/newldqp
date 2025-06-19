import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import { App } from "./data/App";
const GAME_TYPE = {
    PDK: 'PDK_SOLO',
    LDZP: 'LDZP_SOLO',
    XHZD: 'XHZD',
    HZMJ: 'HZMJ_SOLO'
}
const { ccclass, property } = cc._decorator
@ccclass
export default class QuestionPop extends cc.Component {




    @property(cc.Node)
    questContent = null;
    @property(cc.Prefab)
    questItem = null;
    @property(cc.Label)
    lblTitle = null;

    currentIndex = 0;
    answerData = []
    onLoad() {
        this.addEvents();
        this.renderUI();
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.QUESTION_SELECT_ANSWER, this.handleAnswer, this);
    }

    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.QUESTION_SELECT_ANSWER, this.handleAnswer, this);
    }
    renderUI() {
        this.lblTitle.string = GameConfig.QuestData.title;
        this.questContent.removeAllChildren();
        GameConfig.QuestData.list.forEach(element => {
            let questItem = cc.instantiate(this.questItem);
            questItem.getComponent('QuestItem').renderUI(element);
            this.questContent.addChild(questItem);
        });

    }

    handleAnswer(e) {
        console.log(e);
        let answerIndex = this.answerData.findIndex(v => e.data.questId == v.questId);
        if (answerIndex == -1) {
            this.answerData.push(e.data);
        } else {
            this.answerData[answerIndex] = e.data;
        }
    }

    onClickConfirm() {
        console.log("答案", this.answerData);
        if (this.answerData.length < GameConfig.QuestData.list.length) {
            Cache.alertTip('请完成所有问题')
            return;
        }

        Connector.request(GameConfig.ServerEventName.Questionnaire, {answer: this.answerData }, (res) => {
            Cache.alertTip('提交成功');
            this.onClickClose();
        }, true, (err) => {
            Cache.alertTip(err.message || '提交失败');
            this.onClickClose();

        })
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


