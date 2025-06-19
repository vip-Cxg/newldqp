
import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import Avatar from "../common/Avatar";
import DataBase from "../../../Main/Script/DataBase";
import { Social } from "../../../Main/Script/native-extend";
const CONTENT_TYPE = {
    DATA: 'data',
    OTHER: 'other',
    ITEM: 'item',
}
const { ccclass, property } = cc._decorator
@ccclass
export default class UserInfoPop extends cc.Component {
    @property(cc.Label)
    lblPage = null;
    @property(cc.Node)
    pageContainer = null;

    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    baseInfoItem = null;
    @property(cc.Prefab)
    performInfoItem = null;


    @property(cc.Node)
    tipsContent = null;
    @property(cc.Node)
    scoreTips = null;
    @property(cc.Node)
    baseTips = null;
    @property(cc.Node)
    performTips = null;


    @property(Avatar)
    avatar = null;
    @property(cc.Node)
    statusContent = null;
    @property(cc.Label)
    lblStatus = null;

    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblId = null;
    @property(cc.Label)
    lblScore = null;
    @property(cc.Label)
    lblLevel = null;
    @property(cc.Label)
    lblCreated = null;
    @property(cc.Label)
    lblUpdate = null;

    @property(cc.Sprite)
    roleSpr = null;
    @property([cc.SpriteFrame])
    roleIconArr = [];


    @property(cc.Node)
    dataContent = null;
    @property(cc.Node)
    userDataContent = null;
    @property(cc.Node)
    proxyDataContent = null;
    @property(cc.Label)
    lblDataScore = null;
    @property(cc.Label)
    lblDataBank = null;
    @property(cc.Label)
    lblDataReward = null;
    @property(cc.Label)
    lblDataLevel = null;
    @property(cc.Label)
    lblDataLimit = null;
    @property(cc.Node)
    userLimitTog = null;
    @property(cc.Node)
    userFrozenTog = null;
    @property(cc.Node)
    proxyLimitTog = null;
    @property(cc.Node)
    proxyFrozenTog = null;

    @property(cc.Node)
    otherContent = null;

    @property(cc.Toggle)
    wholeTog = null;
    @property(cc.Node)
    dataBtn = null;
    @property(cc.Node)
    otherBtn = null;

    @property(cc.Node)
    managerTog = null;
    @property(cc.Node)
    chooseManagerTog = null;


    @property(cc.Node)
    userInfoContent = null;
    @property(cc.Prefab)
    userInfoItem = null;

    @property(cc.Label)
    lblSumScore = null;
    @property(cc.Label)
    lblPreson = null;
    @property(cc.Label)
    lblCurExp = null;
    @property(cc.Label)
    lblLastExp = null;
    @property(cc.Label)
    lblCurEarn = null;
    @property(cc.Label)
    lblLastEarn = null;
    @property(cc.Label)
    lblCurTurn = null;
    @property(cc.Label)
    lblLastTurn = null;

    page = 1;
    totalPage = 0;
    renderData = null;

    currentList = 0;

    userID = null;
    userRole = 'user';
    currentUserInfo = null;

    currentLog = '';

    lastLoginTime = 0;
    onLoad() {
        this.addEvents();
    }
    addEvents() {
    }
    removeEvents() {

    }

    initUserID(userid) {
        this.userID = userid;
        this.renderData = {
            page: [],
            rows: {}
        }
        this.dataBtn.active = App.Club.CurrentClubRole != 'user';
        this.otherBtn.active = App.Club.CurrentClubRole != 'user';// App.Club.CurrentClubRole == 'owner' || App.Club.CurrentClubRole == 'manager';
        this.renderUI()
    }

    renderUI() {
        this.itemContent.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.UserInfo, { clubID: App.Club.CurrentClubID, userID: this.userID }, (data) => {
            if (!GameUtils.isNullOrEmpty(data.user)) {
                this.avatar.avatarUrl = data.user.user.head;
                this.lblName.string = data.user.user.name;
                this.lblId.string = data.user.userID;
                this.lblScore.string = GameUtils.formatGold(data.user.score) || 0;
                this.lblLevel.string = data.user.level || 0;
                this.lblCreated.string = new Date(data.user.createdAt).format("yyyy-MM-dd hh:mm:ss");
                this.lblUpdate.string = new Date(data.user.updatedAt).format("yyyy-MM-dd hh:mm:ss");
                this.lastLoginTime = new Date(data.user.updatedAt).getTime();
                this.lblDataBank.string = GameUtils.formatGold(data.user.bank) || 0;
                this.lblDataReward.string = GameUtils.formatGold(data.user.reward) || 0;
                this.lblDataLevel.string = data.user.level || 0;
                this.lblDataScore.string = GameUtils.formatGold(data.user.score) || 0;
                this.lblDataLimit.string = GameUtils.formatGold(data.user.limit) || 0;
                // let selfData = {
                //     user: {
                //         name: data.user.user.name,
                //         head: data.user.user.head
                //     }
                // }

          
                this.currentUserInfo = data.user;
                // this.currentUserInfo.cluster.unshift(selfData)


                this.managerTog.active = App.Club.CurrentClubRole == 'owner' && data.user.role == 'user';

                if (data.user.role == 'user') {
                    this.roleSpr.node.active = false;
                } else {
                    this.roleSpr.node.active = true;
                    this.roleSpr.spriteFrame = data.user.role == 'proxy' ? this.roleIconArr[1] : this.roleIconArr[0];
                }
                switch (data.user.role) {
                    case 'user':
                        this.userDataContent.active = true;
                        this.proxyDataContent.active = false;
                        break;
                    case 'proxy':
                        this.userDataContent.active = false;
                        this.proxyDataContent.active = true;
                        break;
                    case 'manager':
                    case 'owner':
                        this.userDataContent.active = false;
                        this.proxyDataContent.active = true
                        this.chooseManagerTog.active = true;
                        break;
                }
                // status		normal 正常 frozen 禁止进入 limit 禁止进入游戏 blacklist 黑名单
                switch (data.user.status) {
                    case 'normal':
                        this.userLimitTog.active = false;
                        this.userFrozenTog.active = false;
                        this.proxyLimitTog.active = false;
                        this.proxyFrozenTog.active = false;
                        this.chooseManagerTog.active = false;
                        this.statusContent.active=false;
                        this.lblStatus.string='';
                        break;
                    case 'limit':
                        this.userLimitTog.active = true;
                        this.userFrozenTog.active = false;
                        this.proxyLimitTog.active = true;
                        this.proxyFrozenTog.active = false;
                        this.chooseManagerTog.active = false;
                        this.statusContent.active=true;
                        this.lblStatus.string='限制';
                        break;
                    case 'frozen':
                        this.userLimitTog.active = false;
                        this.userFrozenTog.active = true;
                        this.proxyLimitTog.active = false;
                        this.proxyFrozenTog.active = true;
                        this.chooseManagerTog.active = false;
                        this.statusContent.active=true;
                        this.lblStatus.string='冻结';
                        break;
                    case 'blacklist':
                        this.userLimitTog.active = false;
                        this.userFrozenTog.active = false;
                        this.proxyLimitTog.active = false;
                        this.proxyFrozenTog.active = false;
                        this.chooseManagerTog.active = false;
                        this.statusContent.active=true;
                        this.lblStatus.string='拉黑';
                        break;
                }

                this.renderBaseInfo(1);
            }
        })

    }

    onClickBtn(e, v) {
        this.currentList = parseInt(v);
        this.renderData = {
            page: [],
            rows: {}
        };
        switch (this.currentList) {
            case 1:
                this.renderBaseInfo(1);
                break;
            case 2:
                this.renderScoreLog(1, 1);
                break;
            case 3:
                this.renderPerformLog(1);
                break;
            case 4:
                this.renderScoreLog(1, 0);
                break;
        }
    }

    /**基础信息 */
    renderBaseInfo(page) {
        this.changeContent(CONTENT_TYPE.ITEM);
        this.baseTips.active = true;
        this.scoreTips.active = false;
        this.performTips.active = false;
        this.itemContent.removeAllChildren();
        this.currentList = 1;
        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let item = cc.instantiate(this.baseInfoItem);
                item.getChildByName('time').getComponent(cc.Label).string = e.strDate
                item.getChildByName('turn').getComponent(cc.Label).string = e.room
                item.getChildByName('win').getComponent(cc.Label).string = e.score
                this.itemContent.addChild(item);
            });
            return;
        }

        Connector.request(GameConfig.ServerEventName.UserBaseInfo, { clubID: App.Club.CurrentClubID, userID: this.userID, page: page, pageSize: 8 }, (res) => {

            // if ( !GameUtils.isNullOrEmpty(res.data)) {
            if (res.data && !GameUtils.isNullOrEmpty(res.data.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.data.rows;
                this.pageContainer.active = true;
                this.page = page;
                let count = typeof (res.data.count) == 'number' ? res.data.count : res.data.count.length;
                this.totalPage = Math.ceil(count / 8);
                this.lblPage.string = page + '/' + Math.ceil(count / 8);
                res.data.rows.forEach((e) => {
                    let item = cc.instantiate(this.baseInfoItem);
                    item.getChildByName('time').getComponent(cc.Label).string = e.strDate
                    item.getChildByName('turn').getComponent(cc.Label).string = e.room
                    item.getChildByName('win').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.score)
                    this.itemContent.addChild(item);
                });
            }
        })
    }
    /**体力日志 */
    renderScoreLog(page, value) {
        this.changeContent(CONTENT_TYPE.ITEM);
        this.baseTips.active = false;
        this.scoreTips.active = true;
        this.performTips.active = false;
        // /game/scoreLog
        this.itemContent.removeAllChildren();
        this.currentList = 2;
        this.currentLog = value;
        // if (this.renderData.page.indexOf(page) != -1) {
        //     this.page = page;
        //     this.lblPage.string = this.page + '/' + this.totalPage;
        //     this.renderData.rows['' + page].forEach(e => {
        //         let item = cc.instantiate(this.baseInfoItem);
        //         item.getChildByName('time').getComponent(cc.Label).string = new Date(e.createdAt).format("yyyy-MM-dd hh:mm:ss");
        //         item.getChildByName('turn').getComponent(cc.Label).string = e.event
        //         item.getChildByName('win').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.remainScore) + (e.remainBank == 0 ? '' : '(' + GameUtils.formatGold(e.remainBank) + ')')
        //         this.itemContent.addChild(item);
        //     });
        //     return;
        // }
        let self = this;
        Connector.request(GameConfig.ServerEventName.UserScoreLog, { clubID: App.Club.CurrentClubID, userID: this.userID, page: page, pageSize: 8, type: this.currentLog }, (res) => {
            if (res.log && !GameUtils.isNullOrEmpty(res.log.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.log.rows;
                this.pageContainer.active = true;
                this.page = page;
                let count = typeof (res.log.count) == 'number' ? res.log.count : res.log.count.length;
                this.totalPage = Math.ceil(count / 8);
                this.lblPage.string = page + '/' + Math.ceil(count / 8);
                res.log.rows.forEach((e) => {
                    let item = cc.instantiate(this.baseInfoItem);
                    item.getChildByName('time').getComponent(cc.Label).string = new Date(e.createdAt).format("yyyy-MM-dd hh:mm:ss");
                    let eventStr = GameUtils.isNullOrEmpty(e.recordCode) ? e.event : e.event + '' + e.recordCode;
                    if(!GameUtils.isNullOrEmpty(e.fee)&&e.fee>0){
                        eventStr+=' 抽水'+GameUtils.formatGold(e.fee)
                    }
                    if(!GameUtils.isNullOrEmpty(e.shuffle)&&e.shuffle>0){
                        eventStr+=' 洗牌'+GameUtils.formatGold(e.shuffle)
                    }

                    item.getChildByName('turn').getComponent(cc.Label).string = eventStr;// e.event
                    item.getChildByName('win').getComponent(cc.Label).string = '' + GameUtils.formatGold(e.remainScore) + (e.remainBank == 0 ? '' : '(' + GameUtils.formatGold(e.remainBank) + ')')

                    if (!GameUtils.isNullOrEmpty(e.recordCode))
                        item.getComponent('UserBaseItem').initData(e.recordCode)

                    this.itemContent.addChild(item);
                });
            }
        })
    }
    /**业绩日志 */
    renderPerformLog(page) {
        this.changeContent(CONTENT_TYPE.ITEM);

        this.baseTips.active = false;
        this.scoreTips.active = false;
        this.performTips.active = true;
        // /game/performLog
        this.itemContent.removeAllChildren();
        this.currentList = 3;

        if (this.renderData.page.indexOf(page) != -1) {
            this.page = page;
            this.lblPage.string = this.page + '/' + this.totalPage;
            this.renderData.rows['' + page].forEach(e => {
                let item = cc.instantiate(this.performInfoItem);
                item.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                item.getChildByName('turn').getComponent(cc.Label).string = e.turn;
                item.getChildByName('reward').getComponent(cc.Label).string = GameUtils.formatGold(e.reward);
                item.getChildByName('active').getComponent(cc.Label).string = GameUtils.formatGold(e.activity);
                item.getChildByName('total').getComponent(cc.Label).string = GameUtils.formatGold(e.sum);
                this.itemContent.addChild(item);
            });
            return;
        }

        Connector.request(GameConfig.ServerEventName.UserPerformLog, { clubID: App.Club.CurrentClubID, userID: this.userID, page: page, pageSize: 8 }, (res) => {
            if (res.data && !GameUtils.isNullOrEmpty(res.data.rows)) {
                this.renderData.page.push(page);
                this.renderData.rows['' + page] = res.data.rows;
                this.pageContainer.active = true;
                this.page = page;
                let count = typeof (res.data.count) == 'number' ? res.data.count : res.data.count.length;
                this.totalPage = Math.ceil(count / 8);
                this.lblPage.string = page + '/' + Math.ceil(count / 8);
                res.data.rows.forEach((e) => {
                    let item = cc.instantiate(this.performInfoItem);
                    item.getChildByName('time').getComponent(cc.Label).string = e.strDate;
                    item.getChildByName('turn').getComponent(cc.Label).string = e.turn;
                    item.getChildByName('reward').getComponent(cc.Label).string = GameUtils.formatGold(e.reward);
                    item.getChildByName('active').getComponent(cc.Label).string = GameUtils.formatGold(e.activity);
                    item.getChildByName('total').getComponent(cc.Label).string = GameUtils.formatGold(e.sum);
                    this.itemContent.addChild(item);
                });
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
        switch (this.currentList) {
            case 1:
                this.renderBaseInfo(a);
                break;
            case 2:
                this.renderScoreLog(a, this.currentLog);
                break;
            case 3:
                this.renderPerformLog(a);
                break;
        }
    }
    reducePage() {
        Cache.playSfx();
        if (this.page == 1) {
            Cache.alertTip('已经是第一页');
            return;
        }
        let a = this.page - 1;

        switch (this.currentList) {
            case 1:
                this.renderBaseInfo(a);
                break;
            case 2:
                this.renderScoreLog(a, this.currentLog);
                break;
            case 3:
                this.renderPerformLog(a);
                break;
        }
    }

    showDataContent() {
        Cache.playSfx();
        this.changeContent(CONTENT_TYPE.DATA);

    }


    showOtherContent() {
        Cache.playSfx();
        this.changeContent(CONTENT_TYPE.OTHER);
        this.renderOtherContent();

    }
    renderOtherContent() {

        this.userInfoContent.removeAllChildren();

        if (!DataBase.player.isSuperUser) {
            this.currentUserInfo.cluster = this.currentUserInfo.cluster.slice(0, 2)
        }

        this.currentUserInfo.cluster.forEach((e) => {
            let item = cc.instantiate(this.userInfoItem);
            item.getComponent("Avatar").avatarUrl = e.user.head;
            item.getChildByName('name').getComponent(cc.Label).string = GameUtils.getStringByLength(e.user.name, 6);
            item.getChildByName('id').getComponent(cc.Label).string = '' + e.userID;
            this.userInfoContent.addChild(item);
        })


        Connector.request(GameConfig.ServerEventName.GroupInfo, { clubID: App.Club.CurrentClubID, userID: this.userID }, (res) => {

            this.lblSumScore.string = '' + (GameUtils.formatGold(res.sumScore) || 0);
            this.lblPreson.string = '' + Math.max((res.peoples || 0), 1);
            this.lblCurExp.string = '' + (GameUtils.formatGold(res.currentExpenses) || 0);
            this.lblLastExp.string = '' + (GameUtils.formatGold(res.lastExpenses) || 0);
            this.lblCurEarn.string = '' + (GameUtils.formatGold(res.currentIncoming) || 0);
            this.lblLastEarn.string = '' + (GameUtils.formatGold(res.lastIncoming) || 0);
            this.lblCurTurn.string = '' + (res.currentTurn || 0);
            this.lblLastTurn.string = '' + (res.lastTurn || 0);
        })
    }
    changeContent(type) {
        switch (type) {
            case CONTENT_TYPE.DATA:
                this.tipsContent.active = false;
                this.itemContent.active = false;
                this.pageContainer.active = false;

                this.dataContent.active = true;
                this.otherContent.active = false;
                break;
            case CONTENT_TYPE.OTHER:
                this.pageContainer.active = false;
                this.tipsContent.active = false;
                this.itemContent.active = false;
                this.dataContent.active = false;
                this.otherContent.active = true;
                break;
            case CONTENT_TYPE.ITEM:
                this.pageContainer.active = false;
                this.tipsContent.active = true;
                this.itemContent.active = true;
                this.dataContent.active = false;
                this.otherContent.active = false;
                break;
        }
    }




    onUserLimit(v) {
        Cache.playSfx();
        this.updateStatus(this.userLimitTog.active ? 'normal' : 'limit', this.wholeTog.isChecked, this.userLimitTog);
    }
    onUserFrozen(v) {
        Cache.playSfx();
        this.updateStatus(this.userFrozenTog.active ? 'normal' : 'frozen', this.wholeTog.isChecked, this.userFrozenTog);
    }

    onProxyLimit(v) {
        Cache.playSfx();
        this.updateStatus(this.proxyLimitTog.active ? 'normal' : 'limit', this.wholeTog.isChecked, this.proxyLimitTog);
    }
    onProxyFrozen(v) {
        Cache.playSfx();
        this.updateStatus(this.proxyFrozenTog.active ? 'normal' : 'frozen', this.wholeTog.isChecked, this.proxyFrozenTog);
    }

    onClickOthertatus(e, v) {
        Cache.playSfx();
        this.updateStatus(v, true);
    }


    updateStatus(status, whole, node = null) {
        //         clubID	是	{{clubID}}	
        // userID	是	{{userID}}	
        // whole	否	false	是否修改整线，默认false
        // status	是	frozen	normal 正常 frozen 禁止进入 limit 禁止进入游戏 blacklist 黑名单
        Connector.request(GameConfig.ServerEventName.UpdateStatus, { clubID: App.Club.CurrentClubID, userID: this.userID, whole, status }, (res) => {
            Cache.alertTip('操作成功');

            switch (status) {
                case 'normal':
                    this.statusContent.active=false;
                    this.lblStatus.string='';
                    break;
                case 'limit':
                    this.statusContent.active=true;
                    this.lblStatus.string='限制';
                    break;
                case 'frozen':
                    this.statusContent.active=true;
                    this.lblStatus.string='冻结';
                    break;
                case 'blacklist':
                    this.statusContent.active=true;
                    this.lblStatus.string='拉黑';
                    break;
            }

            if (node)
                node.active = !node.active;
        })
    }


    onChangeLevel() {
        Cache.playSfx();
        Cache.showNumer('修改等级', GameConfig.NumberType.INT, (level) => {
            this.changeLevel(level);
        })
    }

    changeLevel(level) {
        Connector.request(GameConfig.ServerEventName.UpdateLevel, { level: level, userID: this.userID, clubID: App.Club.CurrentClubID, whole: false }, (data) => {
            Cache.alertTip('操作成功');
            this.lblLevel.string = level || 0;
            this.lblDataLevel.string = level || 0;
        })
    }

    onAddScore() {
        Cache.playSfx();
        Cache.showNumer('增加体力', GameConfig.NumberType.FLOAT, (score) => {
            this.changeScore(score)
        })
    }
    onReduceScore() {
        Cache.playSfx();
        Cache.showNumer('减少体力', GameConfig.NumberType.FLOAT, (score) => {
            this.changeScore(parseFloat('-' + score));
        })
    }
    changeScore(userScore) {
        Connector.request(GameConfig.ServerEventName.UpdateScore, { score: Math.floor(userScore * 100), userID: this.userID, clubID: App.Club.CurrentClubID }, (data) => {
            Cache.alertTip('操作成功');
            this.lblScore.string = '' + GameUtils.formatGold(parseFloat(this.lblScore.string) * 100 + userScore * 100);
            this.lblDataScore.string = '' + GameUtils.formatGold(parseFloat(this.lblDataScore.string) * 100 + userScore * 100);

            App.Club.ClubScore = data.score;
        })
    }

    onClickBank() {
        Cache.playSfx();
        Connector.request(GameConfig.ServerEventName.UpdateClubBank, { score: Math.floor(parseFloat(this.lblDataBank.string) * 100), userID: this.userID, clubID: App.Club.CurrentClubID }, (data) => {
            Cache.alertTip('提取成功');
            this.lblScore.string = '' + GameUtils.formatGold(parseFloat(this.lblScore.string) + parseFloat(this.lblDataBank.string));
            this.lblDataBank.string = 0;
            this.lblDataScore.string = '' + GameUtils.formatGold(parseFloat(this.lblDataScore.string) + parseFloat(this.lblDataBank.string));
            if (this.userID == DataBase.player.id) {
                App.Club.ClubBank = data.bank;
                App.Club.ClubScore = data.score;
            }
        })

    }
    onClickReward() {
        Cache.playSfx();
        Connector.request(GameConfig.ServerEventName.DrawReward, { clubID: App.Club.CurrentClubID, userID: this.userID, reward: Math.floor(parseFloat(this.lblDataReward.string) * 100) }, (data) => {
            Cache.alertTip('提取成功');
            this.lblDataReward.string = GameUtils.formatGold(data.reward) || 0;
            this.lblDataScore.string = GameUtils.formatGold(data.score) || 0;
            this.lblScore.string = GameUtils.formatGold(data.score) || 0;
            if (this.userID == DataBase.player.id) {
                App.Club.ClubScore = data.score;
            }
        })
    }
    onClickManager() {
        Cache.playSfx();
        Connector.request(GameConfig.ServerEventName.Promote, { promote: !this.chooseManagerTog.active, userID: this.userID, clubID: App.Club.CurrentClubID }, (data) => {
            Cache.alertTip('操作成功');
            this.chooseManagerTog.active = !this.chooseManagerTog.active
        })
    }

    onExitClub() {
        Cache.playSfx();
        let nowTime = new Date().getTime();
        let tipsStr = '是否将他踢出公会?'
        if (nowTime - this.lastLoginTime < 259200000) {
            tipsStr = '该玩家三天内进行过游戏,是否将他踢出公会?'
        }


        Cache.showConfirm(tipsStr, () => {
            Connector.request(GameConfig.ServerEventName.QuitClub, { userID: this.userID, clubID: App.Club.CurrentClubID }, (data) => {
                Cache.alertTip('踢出成功')
                if (this.node) {
                    this.node.removeFromParent();
                    this.node.destroy();
                }
            }, true, (err) => {
                Cache.alertTip(err.message || '踢出失败')
            })

        })
    }

    changeLimitScore() {
        Cache.playSfx();
        Cache.showNumer('请输入信用额度', GameConfig.NumberType.FLOAT, (score) => {
            Connector.request(GameConfig.ServerEventName.UpdateLimit, { userID: this.userID, clubID: App.Club.CurrentClubID, limit: parseInt(score * 100) }, (data) => {
                Cache.alertTip('修改成功')
                this.lblDataLimit.string = '' + GameUtils.formatGold(data.limit);
            }, true, (err) => {
                Cache.alertTip(err.message || '修改失败')
            })
        })
    }
    handldLiftLimit() {
        Connector.request(GameConfig.ServerEventName.LiftLimit, { userID: this.userID, clubID: App.Club.CurrentClubID }, (data) => {
            Cache.alertTip('解除限制成功')
        }, true, (err) => {
            Cache.alertTip(err.message || '解除失败')
        })
    }

    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


