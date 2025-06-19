import { GameConfig } from '../../../GameBase/GameConfig';
import Cache from '../../../Main/Script/Cache';
import TableInfo from '../../../Main/Script/TableInfo';
import utils from '../../../Main/Script/utils';
import { App } from '../../../script/ui/hall/data/App';
const { ccclass, property } = cc._decorator
const posBaodan = [
    cc.v2(106, 48),
    cc.v2(-106, 48),
    cc.v2(106, 48)
];
const cardPos = [
    cc.v2(90, 0),
    cc.v2(-90, 0),
    cc.v2(90, 0),
];

@ccclass
export default class player07 extends cc.Component {


    @property(cc.Node)
    nodeAction = null;
    @property(cc.Node)
    nodeBanker = null;
    @property(cc.Node)
    nodeOffline = null;
    @property(cc.Node)
    nodeBaoDan = null;
    @property(cc.Node)
    nodeAutoPlay = null;
    @property(cc.Node)
    nodeReady = null;
    @property(cc.Node)
    nodeNiao = null;
    @property(cc.Node)
    nodeClock = null;
    @property(cc.Node)
    nodeCardCount = null;

    @property(cc.Node)
    layerShowCard = null;
    @property(cc.Node)
    nodeShowCard = null;
    @property(cc.Node)
    nodePass = null;
    @property([sp.SkeletonData])
    pokerSkeleton = [];
    @property(cc.Prefab)
    preType = null;
    @property(cc.Label)
    lblCardType = null;
    @property(cc.Prefab)
    prePlayCards = null;


    @property(cc.Sprite)
    sprAvatar = null;

    /**积分 */
    @property(cc.Label)
    lblScore = null;
    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblBombScore = null;
    @property(cc.Label)
    lblCardCount = null;
    @property(cc.Font)
    winFont = null;
    @property(cc.Font)
    loseFont = null;

    /**性别 */
    sex = "male"

    _playerData = null;

    set playerData(v) {
        if (this._playerData == v) return;
        this._playerData = v;
        this.refreshUI();
    }
    _wallet = 0;
    get wallet() {
        return this._wallet;
    }
    set wallet(v) {
        if (this._wallet == v) return;
        this._wallet = v;
        this.lblScore.string = "" + utils.formatGold(this._wallet, 2);
    }

    playPos = [
        cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, 0),
        cc.v2(cc.winSize.width / 2 - 139 / 2 - GameConfig.FitScreen, 130),
        cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, 110),
    ];
    showCardPos = [
        cc.v2(550, 130),
        cc.v2(-277, 0),
        cc.v2(139 / 2 - cc.winSize.width / 2 + GameConfig.FitScreen, 110),
    ];
    refreshUI() {

        this.sex = this._playerData.prop.sex;
        this.lblName.string = "" + utils.getStringByLength(this._playerData.prop.name, 6);
        utils.setHead(this.sprAvatar, this._playerData.prop.head);
        this.wallet = this._playerData.wallet;
        this.node.position = this.playPos[TableInfo.realIdx[this._playerData.idx]];
        this.nodeCardCount.position = cardPos[TableInfo.realIdx[this._playerData.idx]];
        this.nodeBaoDan.position = posBaodan[TableInfo.realIdx[this._playerData.idx]];
        if (TableInfo.realIdx[this._playerData.idx] == 0) {
            let pos1 = cc.find("Canvas").convertToWorldSpaceAR(cc.v2(0, -10));
            let pos2 = this.node.convertToNodeSpaceAR(pos1);
            this.layerShowCard.position = pos2// this.showCardPos[TableInfo.realIdx[this._playerData.idx]];
        }

        this.initPlayer();
    }

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.showPlayerInfo, this)
    }
    /**打开详细信息 */
    showPlayerInfo() {
        if (!this._playerData) return;
        App.lockScene();
        let idx = this._playerData.idx;
        utils.pop(GameConfig.pop.PlayerInfo, (node) => {
            App.unlockScene();
            node.getComponent("ModulePlayerInfo").init(idx)
        })
    }
    /**游戏开始前初始化显示 */
    initPlayer() {
        this.nodeBaoDan.active = false;
        this.nodeNiao.active = false;
        this.nodeBanker.active = false;
        this.nodeAutoPlay.active = false;
        this.nodeAction.active = false;
        this.hideClock();
        this.removeDropCard()
    }
    activeAction(v) {
        this.nodeAction.active = v;
        if (v) {
            this.nodeAction.stopAllActions();
            this.nodeAction.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(1), cc.delayTime(0.2), cc.fadeIn(1))));
        }
    }
    /**显示庄 */
    activeBanker(bool) {
        this.nodeBanker.active = bool;
    }
    /**显示报单 */
    activeBaodan(bool) {
        this.nodeBaoDan.active = bool;
    }
    /**显示托管状态 */
    activeAutoPlay(bool) {
        this.nodeAutoPlay.active = bool;
    }
    /**显示离线状态 */
    activeOffline(bool) {
        this.nodeOffline.active = bool;
    }
    /**显示准备 */
    activeReady(bool) {
        this.nodeReady.active = bool;
    }
    /**改变剩余牌数 */
    cardCount(data) {
        this.lblCardCount.string = data + "";
    }
    activeNiao(data) {
        if (utils.isNullOrEmpty(data.ready)) return;
        //打鸟显示
        if (data.ready == 1) {
            this.nodeNiao.active = true;
            this.nodeNiao.scale = 0;
            // this.nodeNiao.opacity=0;
            let ap = cc.fadeIn(0.5);
            let bp = cc.scaleTo(0.1, 3);
            let cp = cc.scaleTo(0.3, 0.2);
            let dp = cc.scaleTo(0.1, 1);
            let ep = cc.sequence(bp, cc.delayTime(0.3), cp, dp);
            let fp = cc.spawn(ap, ep);
            this.nodeNiao.runAction(ep);
        } else {
            this.nodeNiao.active = false;
        }

    }

    /**炸弹改变积分 */
    showBombScores(index, wallet, value, callBack) {
        //改变总积分显示
        this.lblScore.string = utils.formatGold(wallet, 2);

        if (value < 0) {
            this.lblBombScore.font = this.loseFont;
            this.lblBombScore.string = utils.formatGold(value);

        } else {
            this.lblBombScore.font = this.winFont;
            this.lblBombScore.string = utils.formatGold(value);

        }
        this.lblBombScore.node.anchorX = index == 1 ? 1 : 0;
        this.lblBombScore.node.position = index == 1 ? cc.v2(-81, -108) : cc.v2(79, -108);
        this.lblBombScore.node.opacity = 0;
        this.lblBombScore.node.active = true;
        let bp = cc.fadeIn(0.3);
        let cp = index == 1 ? cc.moveTo(0.3, cc.v2(-81, -65)) : cc.moveTo(0.3, cc.v2(79, -65));
        let fp = cc.spawn(bp, cp);
        let dp = cc.delayTime(1);
        let ep = cc.callFunc(() => {
            this.lblBombScore.node.active = false;
            if (callBack)
                callBack();
        })
        this.lblBombScore.node.runAction(cc.sequence(fp, dp, ep));
    }

    showClock(value) {

        let labelNode = this.nodeClock.getChildByName("time").getComponent(cc.Label)
        let times = utils.isNullOrEmpty(value) ? 15 : parseInt(value);
        labelNode.string = "" + times;
        labelNode.unscheduleAllCallbacks();
        this.nodeClock.active = true;
        labelNode.schedule(() => {
            times--;
            labelNode.string = "" + Math.max(times, 0);
            if (times <= 5) {

            }
        }, 1);
    }
    hideClock() {
        this.nodeClock.getChildByName("time").getComponent(cc.Label).unscheduleAllCallbacks();
        this.nodeClock.active = false;
    }


    /**出牌 */
    showCard(data) {
        this.hideClock();
        this.activeAutoPlay(data.auto);
        this.activeAction(false);
        this.lblCardCount.string = "" + data.hands;
        this.lblCardType.string = "";
        this.nodeShowCard.removeAllChildren();

        let realIdx = TableInfo.realIdx[data.idx];
        let idxType;

        switch (data.type) {
            case "BOMB":
                idxType = 0;
                break
            case "LIANDUI":
                idxType = 1;

                break
            case "SHUN":
                //显示牌类型
                idxType = 2;
                let cardType = ["", "", "", "", "", "五连顺", "六连顺", "七连顺", "八连顺", "九连顺", "十连顺", "十一连顺", "十二连顺",];
                let numCard = data.cards.length;
                this.lblCardType.string = cardType[numCard];
                break
            case "FEIJI":
                idxType = realIdx != 0 ? 4 : 3;
                break;
            default:
                break;
        }
        //  播放出牌种类特效
        if (idxType) {
            let nodeAnimation = new cc.Node();
            nodeAnimation.parent = this.layerShowCard;
            nodeAnimation.addComponent(sp.Skeleton);
            let ani = nodeAnimation.getComponent(sp.Skeleton);
            ani.skeletonData = this.pokerSkeleton[idxType];
            ani.premultipliedAlpha = false
            ani.setAnimation(1, "animation", false)
            if (ani) {
                // 注册动画的结束回调
                ani.setCompleteListener((trackEntry, loopCount) => {
                    nodeAnimation.destroy();
                });
            }

        }

        let nodePlayCards = cc.instantiate(this.prePlayCards);
        nodePlayCards.scale = realIdx == 0 ? 1 : 0.8;
        nodePlayCards.parent = this.nodeShowCard;
        let empGroup = JSON.parse(JSON.stringify(data));
        nodePlayCards.getComponent("LayoutShowCards07").init(empGroup);
    }

    /**要不起 */
    showPass() {
        this.removeDropCard();
        this.lblCardType.string = "要不起";
    }

    /** 清除出牌区*/
    removeDropCard() {
        this.lblCardType.string = "";
        this.nodeShowCard.removeAllChildren();
    }

    summaryShowCard(hands) {
        if (hands.length == 0) return;
        let nodePlayCards = cc.instantiate(this.prePlayCards);
        nodePlayCards.parent = this.nodeShowCard;
        let empGroup = JSON.parse(JSON.stringify(hands));
        nodePlayCards.getComponent("LayoutShowCards07").initRemainCard(empGroup);
    }


    leaveRoom() {
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }

    }

}


// 尊敬的市长您好，我是开福区吉祥巷小学的老师，现向您反映吉祥巷小学领导的一些情况，希望您帮忙解决一下，谢谢。
//     1.该领导克扣职工工资，不给职工缴纳五险，到手工资一个月只有800—1000
//     2.该领导利用职权强行加塞无资格证亲属或关系户教师，并在工资及业务方给予这部分员工优惠和方便。
//     3.对于学校资金支出等方面没有进行公示，一人多职，教师福利被大大压缩，法定节假日教师无任何福利。
//     4.教职工怀孕，不允许教职工参与面试代课教师，以不给予生育津贴为威胁，借机安排自己熟人来校上课。
//     5.该领导自己的工作强迫分给底下教职工完成，教职工除了完成本职教学任务外，还承担着大量部门工作以及该领导分配的本该属于她自己的工作，教师工作压力极大。
//     6.教职工外出培训机会极少。
//     7.报账上存在极大虚化空间。
//     8.校内基本上是“三足鼎立”，“三人成虎”的局面，形式主义严重。
// 希望市领导，能够帮助我们底层员工争取应有的权利，建立完善的督察机制，督促校内建立完整的包括在编，合同，临聘教师的每季度可轮换的自查队伍，便于校内账目的自查。感谢您对此邮件的查验与阅读。
