import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import { App } from "./data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class InviteListPop extends cc.Component {

    @property(cc.Node)
    inviteContent = null;

    @property(cc.Prefab)
    inviteItem = null;


    onLoad() {
        this.addEvents();
        this.renderUI();
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.UPDATE_INVITE_LIST, this.handleList, this);
    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.UPDATE_INVITE_LIST, this.handleList, this);

    }

    renderUI() {
        this.inviteContent.removeAllChildren();
        GameConfig.InviteList.forEach((element,i) => {
            let item = cc.instantiate(this.inviteItem);
            item.getComponent('InviteListItem').renderUI(element,i);
            this.inviteContent.addChild(item);
        });
    }

    handleList(e) {
        console.log('--回答-', e);
        // 'confirm'/'reject'
        if (GameConfig.InviteList.length == 1) {
            this.onClickClose();
            return;
        }

        if (e.status == 'confirm') {
            this.onClickClose();
        } else {
            GameConfig.InviteList.splice(e.index, 1);
            this.renderUI();
        }
    }


    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


