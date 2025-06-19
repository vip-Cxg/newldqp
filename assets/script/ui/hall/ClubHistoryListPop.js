import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubHistoryListPop extends cc.Component {

    // @property(cc.Label)
    // lblTotalCount = null;
    @property(cc.EditBox)
    replayInput = null;
    @property(cc.Label)
    lblPage = null;
    // @property(cc.Node)
    // inviteBtn = null;
    @property(cc.Node)
    pageContainer = null;


    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    userItem = null;


    @property(cc.Node)
    searchUser = null;


    page = 1;
    totalPage = 0;
    renderData = null;
    selfUserID = 0;
    pageSize = 30;

    linkCount = 0;
    onLoad() {
        this.renderData = {
            page: [],
            rows: {}
        }
        this.addEvents();
        //TODO

    }
    addEvents() {
    }
    removeEvents() {
    }
    initUserID(userId) {
        console.log(App.Club.CurrentClubRole)
        this.searchUser.active = App.Club.CurrentClubRole != 'user'
        this.selfUserID = userId;
        // if (userId != DataBase.player.id) {
        //     this.inviteBtn.active = false;
        // }
        this.renderUI(1);
    }

    renderUI(page) {
        this.itemContent.removeAllChildren();
   
        Connector.request(GameConfig.ServerEventName.ClubLogs, { clubID: App.Club.CurrentClubID, userID: this.selfUserID, page: page, pageSize: this.pageSize }, (res) => {
            if (res.logs && !GameUtils.isNullOrEmpty(res.logs.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.logs.rows;
                this.pageContainer.active = true;
                this.page = page;
                this.totalPage = Math.ceil(res.logs.count / this.pageSize);
                this.lblPage.string = page + '/' + Math.ceil(res.logs.count / this.pageSize);



                // this.lblTotalCount.string = '总人数: ' + res.logs.count;
                res.logs.rows.forEach((e, i) => {
                    let userItem = cc.instantiate(this.userItem);
                    userItem.getComponent('ClubHistoryListItem').initData(e, i);
                    this.itemContent.addChild(userItem);
                });
            } else {
                this.pageContainer.active = false;
            }


        })
    }
    addPage() {
        Cache.playSfx();
        if (this.page >= this.totalPage) {
            Cache.alertTip('已经是最后一页');
            return;
        }
        let a = this.page + 1;
        this.renderUI(a);
    }
    reducePage() {
        Cache.playSfx();
        if (this.page == 1) {
            Cache.alertTip('已经是第一页');
            return;
        }
        let a = this.page - 1;

        this.renderUI(a);
    }
    onClickSearch() {
        if (GameUtils.isNullOrEmpty(this.replayInput.string)) {
            Cache.alertTip('请输入回放码');
            return
        }

        let firstIndex = this.replayInput.string.indexOf('/');
        let endIndex = this.replayInput.string.indexOf('_');
        if (firstIndex == -1 || endIndex == -1) {
            Cache.alertTip('回放码错误');
            return;
        }
        let gametype = this.replayInput.string.slice(firstIndex + 1, endIndex);

        let gameid = DataBase.GAME_TYPE[gametype] < 10 ? '0' + DataBase.GAME_TYPE[gametype] : DataBase.GAME_TYPE[gametype];

        if (GameUtils.isNullOrEmpty(gameid)) {
            Cache.alertTip('回放码错误');
            return
        }


        Connector.get(GameConfig.RecordUrl + 'records/' + this.replayInput.string + '.json', "getJson", (resData) => {
            // db.gameDate = this.lblTime.string;
            // Cache.replayTime = this.lblTime.string;
            // Cache.turn = data.serialID;
            this.linkCount = 0

            Cache.replayData = resData;
            if (resData == null) {
                Cache.alertTip("暂无回放");
                return;
            }
            if (gameid == "") {
                Cache.alertTip("暂时无法播放");
                return
            }
            GameConfig.CurrentReplayData = this.replayInput.string;
            cc.loader.loadRes(`Main/Prefab/replay${gameid}`, (err, prefab) => {
                if (!err) {
                    let nodeReplay = cc.instantiate(prefab);
                    nodeReplay.parent = cc.find('Canvas');
                    // if (gameid == "08")
                    //     nodeReplay.getComponent("ModuleReplay" + gameid).initData(data.gameType);
                } else {
                    cc.log('error to load replay');
                }
            });
        }, true, () => {


            if (this.linkCount == 0) {
                // 将时间字符串解析为日期对象
                const dateString = this.replayInput.string.split("/")[0];
                const year = dateString.substring(0, 4);
                const month = dateString.substring(4, 6) - 1; // 月份要减去1，因为月份从0开始计数
                const day = dateString.substring(6, 8);
                const date = new Date(year, month, day);

                // 进行加减法操作
                // date.setDate(date.getDate() + 1); // 加一天
                date.setDate(date.getDate() - 1); // 减一天
                this.linkCount++;
                // 将结果格式化为 "yyyyMMdd" 格式的字符串
                const result = date.getFullYear() +
                    ("0" + (date.getMonth() + 1)).slice(-2) +
                    ("0" + date.getDate()).slice(-2);

                let c = result + '/' + this.replayInput.string.split("/")[1];
                console.log(result, c); // 输出加减法后的时间字符串

                this.replayInput.string = c;
                this.onClickSearch();
            }


        });
    }

    onSearch() {
        Cache.playSfx();
        Cache.showNumer('输入玩家ID', GameConfig.NumberType.INT, (userID) => {
            this.initUserID(userID)
        })

    }

    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


