import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
import CompListRenderer from "../common/CompListRenderer";
import { App } from "./data/App";


const { ccclass, property } = cc._decorator
@ccclass
export default class RoomListItem extends CompListRenderer {
    // export default class RoomListItem extends cc.Component {
    @property(cc.Label)
    lblXlh = null;
    @property(cc.Label)
    lblGameName = null;
    @property(cc.EditBox)
    lblRoomName = null;
    @property(cc.Label)
    lblPerson = null;
    @property(cc.Label)
    lblBase = null;
    @property(cc.Label)
    lblFee = null;
    @property(cc.Label)
    lblLower = null;
    @property(cc.Label)
    lblBird = null;
    @property(cc.Label)
    lblShuffle = null;

    roomID = null;

    roomData = null;
    onLoad() {
        // this.addEvents();
        // this.renderUI();
    }

    refreshUI() {
        super.refreshUI();
        if (!this.data) return;
        this.initData(this.data);
    }
    initData(data) {

        // {
        //             "roomID": 100000,
        //             "name": "10元",
        //             "gameType": "XHZD",
        //             "base": 100,
        //             "fee": 10,
        //             "lower": 2000,
        //             "person": 4
        //         }
        this.roomData = data;
        this.roomID = data.roomID;
        this.lblXlh.string  = data.index;
        this.lblGameName.string = GameConfig.GameName[data.gameType];
        this.lblRoomName.string = data.name;
        this.lblPerson.string = data.person + '人场';
        this.lblBase.string = GameUtils.formatGold(data.base);
        this.lblFee.string = GameUtils.formatGold(data.fee);
        this.lblLower.string = GameUtils.formatGold(data.lower);
        this.lblBird.string = GameUtils.formatGold(data.bird);
        this.lblShuffle.string = GameUtils.formatGold(data.shuffle);

    }

    onInputBase() {
        Cache.playSfx();
        Cache.showNumer('请输入底分', GameConfig.NumberType.FLOAT, (base) => {
            this.lblBase.string = '' + base;
        })
    }
    onInputFee() {
        Cache.playSfx();
        Cache.showNumer('请输入抽水金额', GameConfig.NumberType.FLOAT, (fee) => {
            this.lblFee.string = '' + fee;
        })
    }
    onInputLower() {
        Cache.playSfx();
        Cache.showNumer('请输入限入金额', GameConfig.NumberType.FLOAT, (lower) => {
            this.lblLower.string = '' + lower;
        })
    }
    onInputNiao() {
        Cache.playSfx();
        Cache.showNumer('请输入打鸟金额', GameConfig.NumberType.FLOAT, (lower) => {
            this.lblBird.string = '' + lower;
        })
    }
    onInputShuffle() {
        Cache.playSfx();
        Cache.showNumer('请输入洗牌金额', GameConfig.NumberType.FLOAT, (lower) => {
            this.lblShuffle.string = '' + lower;
        })
    }

    onChangeRoom() {
        Cache.playSfx();

        let reqData = {
            clubID: App.Club.CurrentClubID,
            name: this.lblRoomName.string,
            roomID: this.roomData.roomID,
            gameType: this.roomData.gameType,
            base: parseInt(parseFloat(this.lblBase.string) * 100),
            fee: parseInt(parseFloat(this.lblFee.string) * 100),
            lower: parseInt(parseFloat(this.lblLower.string) * 100),
            bird: parseInt(parseFloat(this.lblBird.string) * 100),
            shuffle: parseInt(parseFloat(this.lblShuffle.string) * 100),
            person: this.roomData.person
        };

        Connector.request(GameConfig.ServerEventName.CreateRoom, reqData, () => {
            Cache.alertTip('修改成功');
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_ROOM_CHANGE);

        }, true, (err) => {
            Cache.alertTip(err.message || '修改失败')
        })
    }

    onDeleteRoom() {
        Cache.playSfx();
        Connector.request(GameConfig.ServerEventName.DeleteRoom, { clubID: App.Club.CurrentClubID, roomID: this.roomID }, (data) => {
            Cache.alertTip('成功删除');
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_ROOM_CHANGE);
            this.node.destroy();
        }, true, (err) => {
            Cache.alertTip(err.message || '删除失败');

        })

    }

}


