import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import CompList from "../common/CompList";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubNoticePop extends cc.Component {

    @property(cc.Label)
    lblTitle = null;
    @property(cc.Label)
    lblDescName = null;
    @property(cc.Label)
    lblDescNotice = null;

    @property(cc.EditBox)
    roomNameInput = null;
    @property(cc.EditBox)
    noticeInput = null;
    @property(cc.Node)
    noticeNode = null;
    @property(cc.Node)
    tagNode = null;

    @property(cc.Node)
    tagContent = null;
    @property(cc.Prefab)
    tagItem = null;
    @property(cc.Prefab)
    listItem = null;
    
    chooseRoom = [];

    onLoad() {
        this.addEvents();
        this.renderNotice(true)
        // this.downloadAllRooms()
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.SELECT_TAG_HISTORY, this.addTag, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, this.removeTag, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_ROOM_CHANGE, this.downloadAllRooms, this);
    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.SELECT_TAG_HISTORY, this.addTag, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CANCEL_TAG_HISTORY, this.removeTag, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_ROOM_CHANGE, this.downloadAllRooms, this);

    }
    renderNotice() {
        this.lblTitle.string="公告";
        this.lblDescName.string=App.Club.IsLeague? '联盟名:':'公会名:';
        this.lblDescNotice.string=App.Club.IsLeague? '联盟公告:':'公会公告:';
        this.changeUIActive(true);
        this.roomNameInput.string=App.Club.ClubName;
        if (!GameUtils.isNullOrEmpty(App.Club.ClubNotice)) {
            this.noticeInput.string = App.Club.ClubNotice;
        }
    }
    changeUIActive(bool) {

        this.noticeNode.active = bool;
        this.tagNode.active = false;

    }


    onUpdateNotice() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.noticeInput.string)) {
            Cache.alertTip('请输入公会公告')
            return;
        }
        if (GameUtils.isNullOrEmpty(this.roomNameInput.string)) {
            Cache.alertTip('请输入公会名')
            return;
        }
        Connector.request(GameConfig.ServerEventName.UpdateClubNotice, { clubID: App.Club.CurrentClubID,name:this.roomNameInput.string, notice: this.noticeInput.string }, (data) => {
            Cache.alertTip('修改成功');
            App.Club.ClubNotice = this.noticeInput.string;
            App.Club.ClubName = this.roomNameInput.string;
        })

    }

    openCreatePop() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.CreateRoomPop);
    }


    downloadAllRooms() {
        this.lblTitle.string="房型管理";

        this.noticeNode.active = false;
        this.tagNode.active = true;
        this.tagContent.removeAllChildren();
        this.chooseRoom = [];

        Connector.request(GameConfig.ServerEventName.AllRooms, { clubID: App.Club.CurrentClubID }, (data) => {

            if (!GameUtils.isNullOrEmpty(data.rooms)) {
                // this.tagContent.getComponent(CompList).data = data.rooms;


                data.rooms.forEach((element,i) => {
                    let tagBtn = cc.instantiate(this.listItem);
                    element.index = i+1
                    tagBtn.getComponent('RoomListItem').initData(element)
                    this.tagContent.addChild(tagBtn);

                });
            }
        });

    }

    onConfrimRooms() {
        console.log("提交----", this.chooseRoom);
        // return;
        Connector.request(GameConfig.ServerEventName.UpdateClubNotice, { clubID: App.Club.CurrentClubID, rooms: this.chooseRoom }, (data) => {
            Cache.alertTip('修改成功');
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_ROOM_CHANGE);
        })
    }

    addTag(e) {
        let index = this.chooseRoom.findIndex(a => a.roomID == e.data.roomID);
        if (index == -1)
            this.chooseRoom.push(e.data);
    }
    removeTag(e) {
        let index = this.chooseRoom.findIndex(a => a.roomID == e.data.roomID);
        if (index != -1)
            this.chooseRoom.splice(index, 1);
    }

    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


