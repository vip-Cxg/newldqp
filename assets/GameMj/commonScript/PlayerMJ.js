import GameUtils from "../../script/common/GameUtils";
import Avatar from "../../script/ui/common/Avatar";
import { App } from "../../script/ui/hall/data/App";
import TableInfo from '../../Main/Script/TableInfo';
import { GameConfig } from "../../GameBase/GameConfig";
const { ccclass, property } = cc._decorator
@ccclass
export default class ClubProxyItem extends cc.Component {

    @property(cc.Label)
    lblScores = null;
    @property(cc.Node)
    gaNode = null;
    @property(cc.Node)
    imgReady = null;
    @property(cc.ProgressBar)
    progressBar = null;
    @property(cc.Node)
    imgActive = null;
    @property(cc.SpriteFrame)
    sprDefaultHead = null;
    @property(cc.Node)
    imgOffline = null;
    @property(cc.Node)
    imgZhuang = null;
    @property(Avatar)
    imgHead = null;
    @property(cc.Label)
    betStr = null;
    @property(cc.Label)
    lblName = null;
    @property(cc.Node)
    autoNode = null;
    @property(cc.Node)
    niaoNode = null;

    totalTime = 0;
    clockTime = 0;

    newPlayer(idx) {
        this._scores = [0, 0, 0, 0];
    }

    playerInit(data, record) {
        console.log("初始化玩家: " + data.idx + " ", data)
        this.idx = data.idx;
        this.playData = data;
        this.realIdx = TableInfo.realIdx[data.idx];

        if (!GameUtils.isNullOrEmpty(data.prop)) {
            this.imgHead.avatarUrl = data.prop.head;// TableInfo.idx != data.idx && TableInfo.status == GameConfig.GameStatus.WAIT ? '' : data.prop.head;
            this.imgReady.active = data.ready != null;
            if (this.realIdx == 1) {
                this.imgReady.x = -this.imgReady.x;
                this.betStr.node.x = -82;
            }
            this.imgOffline.active = data.offline; // TableInfo.idx != data.idx && TableInfo.status == GameConfig.GameStatus.WAIT ? false : data.offline;
            TableInfo.players[data.idx] = data;
            this.lblName.string = GameUtils.getStringByLength(data.prop.name, 5);// TableInfo.idx != data.idx && TableInfo.status == GameConfig.GameStatus.WAIT ? '等待加入' : GameUtils.getStringByLength(data.prop.name, 5);
            this.imgZhuang.active = this.idx == TableInfo.zhuang;// TableInfo.idx != data.idx && TableInfo.status == GameConfig.GameStatus.WAIT ? false : this.idx == TableInfo.zhuang;
            this.lblScores.string = '' + GameUtils.formatGold(data.wallet);//TableInfo.idx != data.idx && TableInfo.status == GameConfig.GameStatus.WAIT ? '0' : '' + data.total;
            this.niaoNode.active = data.ready && data.ready.plus;
        } else {
            this.imgOffline.active = false;
        }



        let playPos = [
            cc.v2(84 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, -133),
            cc.v2(cc.winSize.width / 2 - 84 / 2 - GameConfig.FitScreen, 100),
            cc.v2(329, cc.winSize.height / 2 - 128 / 2),
            cc.v2(84 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, 100)

        ];
        if (this.realIdx == 2)
            this.gaNode.position = cc.v2(65, 42);
        this.node.position = playPos[this.realIdx];

    }

    showInfo() {
        if (!this.playData) return;
        App.lockScene();
        let idx = this.playData.idx;
        GameUtils.pop(GameConfig.pop.PlayerInfo, (node) => {
            App.unlockScene();
            node.getComponent("ModulePlayerInfo").init(idx)
        })
    }


    reset() {
        this.lblName.string = '空闲';
        this.imgReady.active = false;
        this.imgOffline.active = false;
        this.imgZhuang.active = false;
        this.imgHead.spriteFrame = this.sprDefaultHead;
        this.niaoNode.active = false;

    }


    roundReset() {
        this.imgReady.active = false;
        this.imgActive.active = false;
        this.progressBar.node.active = false;
        this.imgOffline.active = false;
        this.niaoNode.active = false;

        this.gaNode.active = false;

        this.resetOther();

        this.imgZhuang.active = TableInfo.zhuang == this.idx;
    }

    //服务器idx  clock倒计时结束时间戳
    clockAnim(data) {
        if (this.idx == data.idx) {

            this.progressBar.node.active = true;
            this.clockTime = data.clock;

            this.progressBar.progress = 1;
            let endTime = GameUtils.getTimeStamp(data.clock);
            let newTime = GameUtils.getTimeStamp();
            this.totalTime = (endTime - newTime);

        } else {
            this.progressBar.node.active = false;
            this.totalTime = 0;
            this.clockTime = 0;
        }
        return;
        let node = this.imgActive;
        node.active = this.idx == idx;

        node.stopAllActions();
        node.runAction(cc.repeatForever(
            cc.sequence(
                cc.delayTime(0.5),
                cc.fadeOut(1),
                cc.delayTime(0.5),
                cc.fadeIn(1)
            )
        ));
    }
    activeNiao(data) {
        if (GameUtils.isNullOrEmpty(data.readyStatus)) return;
        //打鸟显示
        if (data.readyStatus.plus) {
            this.niaoNode.active = true;
            this.niaoNode.scale = 0;
            // this.niaoNode.opacity=0;
            let ap = cc.fadeIn(0.5);
            let bp = cc.scaleTo(0.1, 3);
            let cp = cc.scaleTo(0.3, 0.2);
            let dp = cc.scaleTo(0.1, 1);
            let ep = cc.sequence(bp, cc.delayTime(0.3), cp, dp);
            let fp = cc.spawn(ap, ep);
            this.niaoNode.runAction(ep);

        } else {

            this.niaoNode.active = false;

        }

    }
    showReady() {
        this.imgReady.active = true;
    }

    hideReady() {
        this.imgReady.active = false;
    }
    activeAutoPlay(bool) {
        this.autoNode.active = bool;
    }
    resetOther() {
        //this.lblScores.string = '0';
    }
    offlineChange(bool) {

        if (GameUtils.isNullOrEmpty(this.playData.prop)) {
            this.imgOffline.active = false;
        } else {
            this.imgOffline.active = bool;
        }

    }
    setScore(amount) {
        this.lblScores.string = GameUtils.formatGold(amount);
    }
    showBet(str) {
        this.betStr.node.active = true;
        this.betStr.string = str;
    }
    hideBet() {
        this.betStr.node.active = false;
    }
    showGa() {
        this.gaNode.active = true;
    }
    removePlayer() {
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
    update(dt) {
        if (!this.progressBar.node.active)
            return;
        if (this.clockTime == 0) return;
        if (this.totalTime <= 0) return;

        let endTime = GameUtils.getTimeStamp(this.clockTime);
        let newTime = GameUtils.getTimeStamp();
        let time = (endTime - newTime);
        if (time <= 0) {
            this.progressBar.progress = 1;
            return;
        }
        this.progressBar.progress = time / this.totalTime;
    }


}


