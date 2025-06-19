// import { GameConfig } from "../../../GameBase/GameConfig";
// import Connector from "../../../Main/NetWork/Connector";
// import Cache from "../../../Main/Script/Cache";
// import { App } from "../../ui/hall/data/App";
// import GameUtils from "../../common/GameUtils";
// import Avatar from "../common/Avatar";

import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
import DataBase from "../../../Main/Script/DataBase";
import Connector from "../../../Main/NetWork/Connector";
import { App } from "./data/App";
import Avatar from "../common/Avatar";
import { Dict } from "./data/Dict";
import CompList from "../common/CompList";
import { turn } from "../../../Main/Script/TableInfo";


const { ccclass, property } = cc._decorator
@ccclass
export default class TablePop extends cc.Component {


    @property(cc.Node)
    robotBtn = null;


    @property(cc.Prefab)
    tableItem = null;

    @property(cc.Node)
    tableContent = null;

    @property(Avatar)
    avatar = null;

    @property(cc.Label)
    username = null;
    @property(cc.Label)
    lblScore = null;
    @property(cc.Label)
    userId = null;




    @property(cc.Node)
    onlyWaitIcon = null;

    @property(cc.Label)
    clubName = null;
    @property(cc.Label)
    clubID = null;

    @property(cc.Node)
    rewardNode = null;

    @property(cc.Node)
    quickStartBtn = null;

    @property(cc.Prefab)
    gameBtnItem = null;
    @property(cc.Prefab)
    roomBtnItem = null;


    @property(cc.Node)
    gameContent = null;
    @property(cc.Node)
    roomContent = null;

    @property(cc.Node)
    noticeBtn = null;
    @property(cc.Node)
    proxyBtn = null;
    @property(cc.Node)
    childBtn = null;
    @property(cc.Node)
    blackListBtn = null;

    @property(cc.Node)
    changeIDBtn = null;
    // @property(cc.Node)
    // scoreBtn = null;
    @property(cc.Node)
    noticeNode = null;

    @property(cc.Node)
    totalScore = null;
    @property(cc.Node)
    activeBtn = null;


    @property(cc.Label)
    lblNotice = null;

    currentType = '';
    currentRoom = '';
    connecting = false;
    interval = 0;
    roomNameDict = null;
    onLoad() {
        this.roomNameDict = new Dict();
        this.addEvents();

        this.refreshUI();
        this.robotBtn.active = DataBase.player.isSuperUser;
        this.changeIDBtn.active = DataBase.player.isSuperUser;

    }
    addEvents() {

        App.EventManager.addEventListener(GameConfig.GameEventNames.GAME_TYPE_CHANGE, this.renderRoom, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.ROOM_TYPE_CHANGE, this.selectRoom, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.updateUI, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_ROOM_CHANGE, this.refreshUI, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.CLUB_ROOM_DESTROY, this.refreshTableData, this);
    }
    removeEvents() {


        App.EventManager.removeEventListener(GameConfig.GameEventNames.GAME_TYPE_CHANGE, this.renderRoom, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.ROOM_TYPE_CHANGE, this.selectRoom, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_DATA_CHANGE, this.updateUI, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_ROOM_CHANGE, this.refreshUI, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CLUB_ROOM_DESTROY, this.refreshTableData, this);
    }
    updateUI() {
        this.lblScore.string = GameUtils.formatGold(App.Club.ClubScore);
        this.clubName.string = '' + App.Club.ClubName;
        this.initNotice();
    }

    /**更新UI */
    refreshUI() {

        this.roomData = new Object();
        this.currentRoomData = new Object();

        this.connecting = true;
        Connector.request(GameConfig.ServerEventName.ClubInfo, { clubID: App.Club.CurrentClubID }, (data) => {

            this.connecting = true;
            if (!GameUtils.isNullOrEmpty(data.club)) {
                //TODO 设置当前公会信息
                App.Club.IsLeague = true;
                App.Club.ClubNotice = data.club?.club?.notice || '---';
                App.Club.ClubBank = data.club.bank || 0;
                App.Club.ClubScore = data.club.score || 0;
                App.Club.ClubReward = data.club.reward || 0;
                App.Club.ClubLevel = data.club.level || 0;
                App.Club.ShuffleLevel = data.club.shuffleLevel || 0;
                App.Club.ClubName = data.club?.club?.name || '----';
                App.Club.CurrentClubRole = data.club.role || 'user';
                this.rewardNode.active = App.Club.CurrentClubRole == 'owner' || App.Club.CurrentClubRole == 'proxy';
                this.clubName.string = '' + App.Club.ClubName;
                this.activeBtn.active = data.taskStatus;

                let lastPopTime = GameUtils.getValue(GameConfig.StorageKey.ActiveDayTips, 0);
                let nowTime = new Date().getDate();
                if (lastPopTime != nowTime && data.taskStatus) {
                    GameUtils.saveValue(GameConfig.StorageKey.ActiveDayTips, nowTime);
                    GameUtils.pop(GameConfig.pop.ClubActivePop);
                }



                this.avatar.avatarUrl = DataBase.player.head || '';
                this.userId.string = "ID: " + (DataBase.player.id || '----');
                this.username.string = GameUtils.getStringByLength(DataBase.player.name) || '----';
                this.lblScore.string = GameUtils.formatGold(App.Club.ClubScore) || '-----';
                this.clubID.string = 'ID: ' + (data.club?.club?.id || '----');



                this.totalScore.active = App.Club.CurrentClubRole != 'user';
                this.noticeBtn.active = App.Club.CurrentClubRole == 'owner' || App.Club.CurrentClubRole == 'manager';
                this.blackListBtn.active = App.Club.CurrentClubRole == 'owner' || App.Club.CurrentClubRole == 'manager';

                if (App.Club.CurrentClubRole == 'user') {
                    this.proxyBtn.active = false;
                    this.childBtn.active = false;
                    // this.scoreBtn.active = true;
                } else {
                    this.proxyBtn.active = App.Club.IsLeague;
                    this.childBtn.active = true;
                    // this.scoreBtn.active = false;
                }
                this.initNotice()
            }

            this.roomNameDict.clear();
            if (!GameUtils.isNullOrEmpty(data.rooms)) {

                GameConfig.TableAllRooms = GameUtils.deepcopyArr(data.rooms);
                data.rooms.forEach((e) => {
                    this.roomNameDict.add(e.roomID, e.name);
                    if (GameUtils.isNullOrEmpty(this.roomData[e.gameType]))
                        this.roomData[e.gameType] = [];
                    this.roomData[e.gameType].push(e);
                })
                let roomArr = {}
                for (let key in this.roomData) {
                    if (GameUtils.isNullOrEmpty(roomArr[key]))
                        roomArr[key] = [];
                    this.roomData[key].forEach(e => {
                        roomArr[key].push(e.roomID);

                    });
                }
                this.roomData['HALL'] = [{ name: '大厅', roomID: [] }];
                for (let key in roomArr) {
                    let copyData = GameUtils.deepcopyArr(this.roomData[key]);// [0];
                    let hallData = copyData[0];
                    hallData.roomID = roomArr[key];
                    hallData.name = '大厅';
                    this.roomData[key].unshift(hallData)
                    this.roomData['HALL'][0].roomID = this.roomData['HALL'][0].roomID.concat(roomArr[key]);
                }
                this.renderGame();
            } else {
                //TODO 显示无房间
            }
        }, true, (err) => {
            Cache.showTipsMsg(err.message || '获取公会信息失败', () => {
                // this.node.destroy();
            })
        })
        //TODO
    }
    initNotice() {
        if (GameUtils.isNullOrEmpty(App.Club.ClubNotice)) return;
        this.noticeNode.active = true;
        this.lblNotice.string = App.Club.ClubNotice || '----';
        setTimeout(() => {
            if (this.lblNotice) {
                this.lblNotice.node.stopAllActions();
                let distance = this.lblNotice.node.width + this.lblNotice.node.parent.width;
                let ap = cc.place(cc.v2(this.lblNotice.node.parent.width / 2, 0));
                let bp = cc.moveBy(distance / 100, cc.v2(-distance, 0));
                let cp = cc.sequence(ap, bp);
                let dp = cc.repeatForever(cp);
                this.lblNotice.node.runAction(dp);
            }
        }, 500)
    }
    renderGame() {
        this.gameContent.removeAllChildren();
        // TODO 默认第一个打开游戏
        let firstKey = GameUtils.isNullOrEmpty(GameConfig.TableRoom) ? 'HALL' : GameConfig.TableRoom.gameType;
        let gameTypeArr = [];
        for (let key in this.roomData) {
            gameTypeArr.push(key);
            let gameBtn = cc.instantiate(this.gameBtnItem)
            gameBtn.getComponent('TableGameItem').initData(key);
            if (key == 'XHZD') {
                this.gameContent.addChild(gameBtn, 2);

            } else if (key == 'HALL') {
                this.gameContent.addChild(gameBtn, 3);
            } else {
                this.gameContent.addChild(gameBtn);

            }
        }
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.GAME_TYPE_CHANGE, firstKey);
    }
    renderRoom(e) {
        let gameType = e.data;
        this.currentType = gameType;

        this.currentRoomData = new Object();
        this.roomContent.removeAllChildren();
        this.roomData[gameType].forEach(e => {
            let roomBtn = cc.instantiate(this.roomBtnItem)
            roomBtn.getComponent('TableRoomItem').initData(e);
            this.roomContent.addChild(roomBtn);
        });
        //TODO 默认第一个打开房型

        let roomIndex = 0;
        if (!GameUtils.isNullOrEmpty(GameConfig.TableRoom)) {
            roomIndex = this.roomData[gameType].findIndex(v => v.roomID == GameConfig.TableRoom.roomID);
            console.log('---roomIndex--', roomIndex);
            if (roomIndex == -1)
                roomIndex = 0;
        }
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.ROOM_TYPE_CHANGE, this.roomData[gameType][roomIndex])

    }

    selectRoom(e) {
        let roomData = e.data;
        this.currentRoomData = roomData;

        this.downloadTableData(roomData);
    }

    /**下载桌子数据 */
    downloadTableData(roomData) {
        if (GameUtils.isNullOrEmpty(roomData.roomID))
            return;
        let rooms = [];
        if (typeof (roomData.roomID) != "object") {
            rooms.push(roomData.roomID)
        } else {
            rooms = roomData.roomID;
        }
        this.connecting = true;
        //TODO  可传参数limit 
        Connector.request(GameConfig.ServerEventName.Tables, { rooms: rooms, clubID: App.Club.CurrentClubID }, (data) => {

            Cache.hideMask();
            this.connecting = false;
            this.interval = 0;

            if (data.success) {
                console.log('roomData', roomData)
                if (typeof (roomData.roomID) != "object") {
                    this.quickStartBtn.active = true;
                } else {
                    this.quickStartBtn.active = false;
                }

                let newArr = [];
                let index = 0;
                let tables = []
                newArr = data.rooms.map(room => (room.tables.map(strTable => {
                    if (GameUtils.isNullOrEmpty(strTable)) return {};
                    let d = JSON.parse(strTable);
                    d.roomID = room.roomID;
                    return d;
                }))).reduce((p, i) => p.concat(i));

                newArr.sort(function (a, b) {
                    return GameUtils.sortByProps(a, b, { "status": "desc", "players": "asc" });
                });
                if (typeof (roomData.roomID) != 'object') {

                    let firstTableData = {
                        "person": roomData.person, "players": [], "status": "WAIT", "roomID": roomData.roomID, mode: 'CUSTOM', gameType: roomData.gameType
                    }
                    newArr.unshift(firstTableData)
                } else if (this.currentType == 'HALL') {
                    // let firstTableData = {
                    //     "person": 2, "players": [], "status": "WAIT", mode: 'CUSTOM',gameType:'HALL'
                    // }
                    // newArr.unshift(firstTableData)
                    console.log("this.roomData----- ", this.roomData)
                    let sortArr = []
                    for (let key in this.roomData) {
                        if (key == 'HALL') continue;
                        let createDataItem = {
                            "person": 2, "players": [], "status": "WAIT", mode: 'CUSTOM', gameType: key, type: 'create', msg: this.roomData[key]
                        }
                        sortArr.unshift(createDataItem)
                        // newArr.unshift(createDataItem)
                        console.log("key: ", key)
                    }

                    sortArr.sort(function (a, b) {
                        return GameUtils.sortByProps(a, b, { "gameType": "XHZD" });
                    });
                    newArr = sortArr.concat(newArr);

                }

                // newArr.sort(function (a, b) {
                //     return GameUtils.sortByProps(a, b, { 'gameType':'XHZD',"status": "desc", "players": "asc" });
                // });
                this.tableData = newArr;

                App.EventManager.dispatchEventWith(GameConfig.GameEventNames.ROOM_TYPE_BTN_CHANGE, roomData);
                this.renderTableUI(roomData);
            }
        }, null, (err) => {
            this.connecting = false;
            this.interval = 0;
        })
    }
    /**只看等待中 */
    onWaitTable() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.currentRoomData)) {
            return
        }

        this.onlyWaitIcon.active = !this.onlyWaitIcon.active;
        this.renderTableUI(this.currentRoomData);
    }

    renderTableUI(roomData) {
        try {
            this.tableContent.removeAllChildren();

            // console.log("roomDataroomDataroomData", this.tableData)

            this.tableData.forEach((data, i) => {

                if (GameUtils.isNullOrEmpty(data)) return;
                data['roomData'] = roomData;
                data['roomNameDict'] = this.roomNameDict;

                // if (this.onlyWaitIcon.active) {
                //     if (data.status == GameConfig.GameStatus.WAIT || data.status == GameConfig.GameStatus.SUMMARY) {

                //         let tableItem = cc.instantiate(this.tableItem);
                //         tableItem.getComponent("ModuleTableItem").initData(data, roomData, this.roomNameDict);
                //         this.tableContent.addChild(tableItem);


                //     }
                // } else {
                //     let tableItem = cc.instantiate(this.tableItem);
                //     tableItem.getComponent("ModuleTableItem").initData(data, roomData, this.roomNameDict);
                //     this.tableContent.addChild(tableItem);
                // }
            })
            this.tableContent.getComponent(CompList).data = this.tableData;

            if(GameConfig.IsQuickStart){
                GameConfig.IsQuickStart=false;
                this.newMatchEnter();
            }

        } catch (error) {
            console.log('-加桌子--报错--', error)
            //机型卡  切换场景超过三秒  定时器未销毁
        }

    }

    newMatchEnter(){
        let questData = { isAgain:true,roomID: [], gameType:'LDZP', tableID: "", clubID: App.Club.CurrentClubID, isQuick: true };
        // let questData = { isAgain:true,roomID: this.currentRoomData.roomID, gameType: this.currentRoomData.gameType, tableID: "", clubID: App.Club.CurrentClubID, isQuick: true };
        Connector.request(GameConfig.ServerEventName.JoinClubGame, questData, (data) => {
            GameUtils.saveValue(GameConfig.StorageKey.LastRoomData, this.currentRoomData);
            GameConfig.ShowTablePop = true;
            Connector.connect(data, () => {
                GameConfig.CurrentGameType = data.data.gameType;
                DataBase.setGameType(DataBase.GAME_TYPE[data.data.gameType]);
                // Connector.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.START_ENTER_SCENE, gametype: data.data.gameType })
                cc.director.loadScene(DataBase.TABLE_TYPE[data.data.gameType]);
            });
        }, true, (err) => {
            Cache.showTipsMsg(err.message || "进入游戏失败");

        })
    }

    onQuickStart() {
        Cache.playSfx();
        this.enterGame();
    }

    enterGame() {
        //TODO  进入匹配模式
        let nowTime = new Date().getTime();
        if (nowTime - GameConfig.LastSocketTime < 2000) return;
        GameConfig.LastSocketTime = nowTime;

        // if (!DataBase.player.hasBind && !GameConfig.IsDebug) {
        //     Cache.alertTip("未绑定手机，无法进入匹配模式");
        //     return;
        // }
        // if (Cache.location.lat == 0 && Cache.location.long == 0 && !GameConfig.IsDebug) {
        //     Cache.alertTip("未打开定位，无法进入匹配模式");
        //     return;
        // }
        GameConfig.TableRoom = this.currentRoomData;

        if (this.currentRoomData.gameType == 'XHZD') {
            GameUtils.pop(GameConfig.pop.MatchPop, (node) => {
                node.getComponent("ModuleMatchPop").startMatch(this.currentRoomData.roomID);
            })
        } else {

            let questData = { roomID: this.currentRoomData.roomID, gameType: this.currentRoomData.gameType, tableID: "", clubID: App.Club.CurrentClubID, isQuick: true };
            Connector.request(GameConfig.ServerEventName.JoinClubGame, questData, (data) => {
                GameUtils.saveValue(GameConfig.StorageKey.LastRoomData, this.currentRoomData);
                GameConfig.ShowTablePop = true;
                Connector.connect(data, () => {
                    GameConfig.CurrentGameType = data.data.gameType;
                    DataBase.setGameType(DataBase.GAME_TYPE[data.data.gameType]);
                    // Connector.LogsClient(GameConfig.LogsEvents.SOCKET_LINK, { action: GameConfig.LogsActions.START_ENTER_SCENE, gametype: data.data.gameType })
                    cc.director.loadScene(DataBase.TABLE_TYPE[data.data.gameType]);
                });
            }, true, (err) => {
                Cache.showTipsMsg(err.message || "进入游戏失败");

            })
        }



    }

    /**刷新当前信息 */
    refreshTableData() {
        // Cache.playSfx();
        // this.refreshUI();
        // return;
        this.downloadTableData(this.currentRoomData);
        Connector.request(GameConfig.ServerEventName.ClubInfo, { clubID: App.Club.CurrentClubID }, (data) => {
            if (!GameUtils.isNullOrEmpty(data.club)) {
                App.Club.IsLeague = data.club?.club?.isLeague == 1;
                App.Club.ClubNotice = data.club?.club?.notice;
                App.Club.ClubBank = data.club.bank||0;
                App.Club.ClubScore = data.club.score;
                App.Club.ClubReward = data.club.reward;
                App.Club.ShuffleLevel = data.club.shuffleLevel;
                App.Club.ClubLevel = data.club.level;
                App.Club.ClubName = data.club.club.name;
                App.Club.CurrentClubRole = data.club.role;
                this.rewardNode.active = data.club.role == 'owner' || data.club.role == 'proxy';
                this.clubName.string = (App.Club.IsLeague ? '联盟: ' : '公会: ') + '' + App.Club.ClubName;

                this.activeBtn.active = data.taskStatus;
                this.avatar.avatarUrl = DataBase.player.head;
                this.userId.string = "ID: " + DataBase.player.id;
                this.username.string = GameUtils.getStringByLength(DataBase.player.name);
                this.lblScore.string = GameUtils.formatGold(App.Club.ClubScore);
                this.clubID.string = 'ID: ' + data.club?.club?.id;


                this.totalScore.active = data.club.role != 'user';
                this.noticeBtn.active = data.club.role == 'owner' || data.club.role == 'manager';
                this.blackListBtn.active = data.club.role == 'owner' || data.club.role == 'manager';

                if (data.club.role == 'user') {
                    this.proxyBtn.active = false;
                    this.childBtn.active = false;
                    // this.scoreBtn.active = true;
                } else {
                    this.proxyBtn.active = App.Club.IsLeague;
                    this.childBtn.active = true;
                    // this.scoreBtn.active = false;
                }
                this.initNotice()
            }

        }, false, (err) => {

        })
    }
    /**公告*/
    openNotice() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ClubNoticePop)

    }
    /**举报列表 */
    openBlackList() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.BlackListPop)
    }
    openChangeID(){
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ChangeIDPop)
    }
    /**成员列表 */
    openClubUserList() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ClubUserListPop)
    }
    /**战绩*/
    openHistory() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ClubHistoryListPop, (node) => {
            node.getComponent('ClubHistoryListPop').initUserID(DataBase.player.id);
        });

    }
    /**保险柜*/
    openClubBank() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ClubBankPop)
    }
    /**机器人*/
    openRobotPop() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.RobotPop)
    }
    /**奖励*/
    openClubReward() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ClubRewardPop)
    }
    /**合伙人列表*/
    openProxyList() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ClubProxyListPop, (node) => {
            node.getComponent('ClubProxyListPop').initUserID(DataBase.player.id);
        })
    }
    /**下属成员*/
    openChildUser() {
        Cache.openType = 1
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ChildUserListPop, (node) => {
            node.getComponent('ChildUserListPop').initUserID(DataBase.player.id);
        })
    }
    openInfoPop() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.InfoPop);
    }
    /**房卡汇总 */
    openWalletPop() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ClubWalletListPop);
    }
    /**联盟活动 */
    openActivePop() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ClubActivePop);
    }

    onClickScore() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ClubScoreListPop);
    }

    /**所有成员的输赢 */
    onClickTotalScore() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ChildScoreListPop)
    }

    onSearchTable() {
        Cache.playSfx();
        Cache.showNumer('请输入房间号', GameConfig.NumberType.INT, (tableID) => {
            let rooms = [];
            if (typeof (this.currentRoomData.roomID) != "object") {
                rooms.push(this.currentRoomData.roomID)
            } else {
                rooms = this.currentRoomData.roomID;
            }
            this.connecting = true;
            Connector.request(GameConfig.ServerEventName.Tables, { rooms: rooms, clubID: App.Club.CurrentClubID, tableID: '' + tableID }, (data) => {

                Cache.hideMask();
                this.connecting = false;
                this.interval = -1;
                if (data.success) {
                    console.log('currentRoomData', this.currentRoomData)

                    this.quickStartBtn.active = typeof (this.currentRoomData.roomID) != "object";
                    let newArr = [];
                    let index = 0;
                    let tables = []
                    newArr = data.rooms.map(room => (room.tables.map(strTable => {
                        if (GameUtils.isNullOrEmpty(strTable)) return {};
                        let d = JSON.parse(strTable);
                        d.roomID = room.roomID;
                        return d;
                    }))).reduce((p, i) => p.concat(i));
                    newArr.sort(function (a, b) {
                        return GameUtils.sortByProps(a, b, { "status": "desc", "players": "asc" });
                    });
                    // console.log("桌子总数据----- ", JSON.stringify(newArr))
                    this.tableData = newArr;
                    App.EventManager.dispatchEventWith(GameConfig.GameEventNames.ROOM_TYPE_BTN_CHANGE, this.currentRoomData);
                    this.renderTableUI(this.currentRoomData);
                }
            }, true, (err) => {
                this.connecting = false;
                this.interval = 0;
            })
        })
    }

    ontesttt() {
        Cache.playSfx();

        Connector.request('game/systemNotice', { gameType: 'HNMJ', message: "阿萨德哈说剁几好阿说剁几哈看的啥阿说接电话阿黑色的大口袋", times: 5 }, (data) => {

        })
    }

    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();

        // App.EventManager.dispatchEventWith(GameConfig.GameEventNames.JUDGE_TIPS);
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
    onDestroy() {

        this.removeEvents();
    }
    update(dt) {
        if (GameUtils.isNullOrEmpty(this.currentRoomData))
            return;
        if (this.currentType == '')
            return;
        if (this.connecting)
            return;
        if (this.interval == -1)
            return;
        if (cc.sys.isBrowser)
            return;
        this.interval++;
        // console.log("11111",this.interval,this.interval % 200)

        if (this.interval % 300 == 0) {

            // console.log("1231231",this.interval,this.interval % 200)
            this.refreshTableData();

        }
        // if (this.interval >= 1800) {
        //     this.interval = 0;
        //     this.downloadTableData(this.currentRoomData);
        // }
    }

}


