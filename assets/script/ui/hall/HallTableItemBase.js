import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import utils from "../../../Main/Script/utils";
import Avatar from "../common/Avatar";
import CompListRenderer from "../common/CompListRenderer";
import { App } from "./data/App";

const { ccclass, property } = cc._decorator;

const LOCAL_GAME_NAME = {
    DNIU: "斗牛",
    JH: "金花",
    JINHUA: "金花",
    ZMZ: "捉麻子",
    ZHUOMAZI: "捉麻子",
    HSMJ: "划水麻将",
    HUASHUI_MJ: "划水麻将",
    PDK: "跑得快",
    PDK_SOLO: "跑得快",
};

@ccclass
export default class HallTableItemBase extends CompListRenderer {
    @property([Avatar])
    avatar = [];
    @property([cc.Node])
    seatNodes = [];
    @property(cc.Node)
    statusNode = null;
    @property(cc.Sprite)
    gameStatus = null;
    @property(cc.SpriteFrame)
    inGame = null;
    @property(cc.SpriteFrame)
    waitting = null;
    @property(cc.Label)
    tableName = null;

    seatCount = 0;
    gameType = "";

    onLoad() {
        this.autoBindNodes();
        this.refreshUI();
    }

    refreshUI() {
        super.refreshUI();
        if (!this.data) return;
        this.initData(this.data);
    }

    initData(data) {
        this.autoBindNodes();
        this.node.off(cc.Node.EventType.TOUCH_END);

        if (data.type == "create") {
            this.renderCreateTable(data);
            return;
        }

        this.renderTableName(data);
        this.renderStatus(data);
        this.renderPlayers(data);

        if (data.uiTest) {
            this.node.on(cc.Node.EventType.TOUCH_END, () => {
                Cache.alertTip("UI测试桌，仅用于查看大厅效果");
            }, this);
            return;
        }

        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (!utils.isNullOrEmpty(data.matchID)) {
                Cache.alertTip("无法加入有奖专区的牌桌");
                return;
            }
            this.enterGame(data, data.roomData);
        }, this);
    }

    autoBindNodes() {
        if (!this.tableName) {
            let tableNameNode = this.node.getChildByName("tableName");
            this.tableName = tableNameNode && tableNameNode.getComponent(cc.Label);
        }
        if (!this.statusNode) {
            this.statusNode = this.node.getChildByName("statusBg") || this.node.getChildByName("statusNode");
        }
        if (!this.gameStatus && this.statusNode) {
            let statusLabel = this.statusNode.getChildByName("tableStatus");
            this.gameStatus = statusLabel && statusLabel.getComponent(cc.Sprite);
        }
        this.seatNodes = [];
        this.avatar = [];
        let count = this.getSeatCount();
        for (let i = 1; i <= count; i++) {
            let seat = this.node.getChildByName("player" + i);
            if (!seat) continue;
            this.seatNodes.push(seat);
            let avatarNode = seat.getChildByName("Avatar") || seat;
            let avatar = avatarNode.getComponent(Avatar);
            if (avatar) {
                this.avatar.push(avatar);
            }
        }
    }

    getSeatCount() {
        return this.seatCount || 0;
    }

    getGameType(data) {
        return (data && data.gameType) || this.gameType || "";
    }

    getGameName(gameType) {
        return GameConfig.GameName[gameType] || LOCAL_GAME_NAME[gameType] || gameType || "";
    }

    renderCreateTable(data) {
        this.seatNodes.forEach((node) => node.active = false);
        if (this.statusNode) this.statusNode.active = false;
        if (this.tableName) this.tableName.string = this.getGameName(this.getGameType(data)) + "开房";
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            utils.pop(GameConfig.pop.TableRoomPop, (node) => {
                node.getComponent("TableRoomPop").refreshUI(data);
            });
        }, this);
    }

    renderTableName(data) {
        if (!this.tableName) return;
        if (data.uiTest) {
            this.tableName.string = this.getGameName(data.gameType) + " 测试桌 " + String(data.tableID).replace("UI", "");
            return;
        }
        let roomName = data.roomNameDict && data.roomNameDict.get(data.roomID);
        this.tableName.string = (GameConfig.TableType[data.mode] || "") + " " + (roomName || "");
    }

    renderStatus(data) {
        if (this.statusNode) this.statusNode.active = (data.players || []).length > 0;
        if (!this.gameStatus) return;
        if (data.status == GameConfig.GameStatus.WAIT || data.status == GameConfig.GameStatus.SUMMARY) {
            if (this.waitting) this.gameStatus.spriteFrame = this.waitting;
        } else if (this.inGame) {
            this.gameStatus.spriteFrame = this.inGame;
        }
    }

    renderPlayers(data) {
        let players = data.players || [];
        this.seatNodes.forEach((node, index) => {
            node.active = index < this.getSeatCount();
        });
        this.avatar.forEach((avatar) => {
            if (avatar) avatar.avatarUrl = "";
        });
        players.forEach((player, index) => {
            if (utils.isNullOrEmpty(player) || !this.avatar[index]) return;
            this.avatar[index].avatarUrl = player.head || (player.prop && player.prop.head) || "";
        });
    }

    enterGame(data, roomData) {
        let nowTime = new Date().getTime();
        if (nowTime - GameConfig.LastSocketTime < 2000) {
            Cache.alertTip("点击过于频繁");
            return;
        }
        GameConfig.LastSocketTime = nowTime;
        if (GameConfig.IsConnecting) {
            Cache.alertTip("正在进入房间");
            return;
        }
        roomData.gameType = data.gameType;
        GameConfig.TableRoom = roomData;
        GameConfig.IsConnecting = true;

        let questData = utils.isNullOrEmpty(data.tableID)
            ? { roomID: data.roomID, gameType: data.gameType, tableID: "", clubID: App.Club.CurrentClubID }
            : { roomID: data.roomID, gameType: data.gameType, tableID: data.tableID, clubID: App.Club.CurrentClubID };

        Connector.request(GameConfig.ServerEventName.JoinClubGame, questData, (res) => {
            utils.saveValue(GameConfig.StorageKey.LastRoomData, roomData);
            GameConfig.IsConnecting = false;
            GameConfig.ShowTablePop = true;
            Connector.connect(res, () => {
                GameConfig.CurrentGameType = res.data.gameType;
                DataBase.setGameType(DataBase.GAME_TYPE[res.data.gameType]);
                cc.director.loadScene(DataBase.TABLE_TYPE[res.data.gameType]);
            });
        }, true, (err) => {
            GameConfig.IsConnecting = false;
            Cache.showTipsMsg(utils.isNullOrEmpty(err.message) ? "进入游戏失败" : err.message);
        });
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_END);
    }
}
