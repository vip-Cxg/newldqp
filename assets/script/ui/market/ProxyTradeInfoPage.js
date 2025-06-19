import { GameConfig } from "../../../GameBase/GameConfig";
import { GoEasyConfig } from "../../../Main/GoEasy/GoEasyConfig";
import Connector from "../../../Main/NetWork/Connector";
import { prototype } from "../../../Main/Script/audio-ctrl";
import Cache from "../../../Main/Script/Cache";
import { Social } from "../../../Main/Script/native-extend";
import GameUtils from "../../common/GameUtils";
import { App } from "../hall/data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class ProxyTradeInfoPage extends cc.Component {


    @property(cc.Label)
    lblDownTime = null;
    @property(cc.Label)
    lblBuyerIDDesc = null;
    @property(cc.Label)
    lblBuyerID = null;
    @property(cc.Label)
    lblNameDesc = null;
    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblAccountDesc = null;
    @property(cc.Label)
    lblAccount = null;
    @property(cc.Label)
    lblBank = null;
    @property(cc.Label)
    lblBankAddress = null;
    @property(cc.Label)
    lblPhoneDesc = null;
    @property(cc.Label)
    lblPhone = null;
    @property(cc.Label)
    lblCreateAt = null;
    @property(cc.Label)
    lblUpdateAt = null;

    @property(cc.Node)
    chatRoom = null;


    @property(cc.Sprite)
    qrcodeNode = null;
    @property(cc.Label)
    qrcodeDesc = null;
    @property(cc.SpriteFrame)
    defaultSf = null;

    @property(cc.Sprite)
    qrcodeSpr = null;
    @property(cc.Node)
    qrcodeMask = null;


    @property(cc.Node)
    judgeBtn = null;
    @property(cc.Node)
    serviceBtn = null;
    @property(cc.Node)
    submitDataBtn = null;
    @property(cc.Node)
    copyServiceBtn = null;
    @property(cc.Node)
    copyTips = null;
    @property(cc.Node)
    processBtn = null;
    @property(cc.Node)
    confirmBtn = null;
    @property(cc.Node)
    cancelBtn = null;


    @property(cc.Node)
    plsProcessBtn = null;
    @property(cc.Node)
    plsCancelBtn = null;
    @property(cc.Node)
    judgeProcessBtn = null;
    @property(cc.Node)
    judgeCancelBtn = null;

    @property(cc.Node)
    agreeProcessBtn = null;
    @property(cc.Node)
    agreeCancelBtn = null;

    @property(cc.Node)
    refuseProcessBtn = null;
    @property(cc.Node)
    refuseCancelBtn = null;

    @property(cc.Node)
    tradeInfo = null;
    @property(cc.Node)
    btnContainer = null;
    @property(cc.Node)
    tradeNoData = null;

    @property(cc.Node)
    payTypeContainer = null;
    @property(cc.Sprite)
    statusSpr = null;
    @property(cc.Label)
    statusTips = null;
    @property(cc.Node)
    tipsContainer = null;
    @property(cc.SpriteFrame)
    cancelSf = null;
    @property(cc.SpriteFrame)
    doneSf = null;
    @property(cc.Prefab)
    codePre = null;



    allData = [];
    unfinishData = [];
    finishData = [];
    tradeType = 'all';


    payType = "";
    isInitRoom = false;
    tradeId = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.addEvents();
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.SHOW_TRADE_TIPS, this.refreshTrade, this);
    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.SHOW_TRADE_TIPS, this.refreshTrade, this);

    }

    refreshTrade() {
        if (this.selectInfo)
            this.downloadTrades()
    }

    initData(data) {
        this.tradeId = data
        this.downloadTrades();
    }



    downloadTrades() {



        this.tradeInfo.active = true;
        this.btnContainer.active = true;
        this.tradeNoData.active = false;
        this.lblDownTime.node.active = false;
        this.qrcodeNode.node.active = false;
        Connector.request(GameConfig.ServerEventName.POTCTrade, { tradeID: this.tradeId }, (data) => {

            this.selectTrades({ detail: data.trade })


        });

    }

    // selectPayType(e, v) {
    //     Cache.playSfx();
    //     if (this.payType == v) return;
    //     if (GameUtils.isNullOrEmpty(this.selectInfo)) return;
    //     this.payType = v;
    //     this.refreshSelectInfo();

    // },
    selectTrades(e) {
        this.selectInfo = e.detail;
        //初始化聊天
        this.enjoinChatRoom()
        this.deleteTradeDone(this.selectInfo.id)

        let tradeType = e.detail.buyer.id == GameConfig.ProxyData.id ? "buy" : "sell";

        this.payTypeContainer.active = tradeType == "buy" && e.detail.status != "cancel" && e.detail.status != "done";
        this.payType = e.detail.payType;

        this.payTypeContainer.getChildByName("alipay").active = !GameUtils.isNullOrEmpty(this.selectInfo.seller.alipay)
        this.payTypeContainer.getChildByName("wechat").active = !GameUtils.isNullOrEmpty(this.selectInfo.seller.wechat)
        this.payTypeContainer.getChildByName("bank").active = !GameUtils.isNullOrEmpty(this.selectInfo.seller.bank)
        this.payTypeContainer.getChildByName("" + this.payType).getComponent(cc.Toggle).check();

        this.refreshSelectInfo();

        this.judgeBtn.active = tradeType == "sell" && e.detail.status == "process";//  false;//e.detail.status == "process" || e.detail.status == "done";

        //完成或取消盖章
        this.statusSpr.node.active = false;
        if (e.detail.status == "cancel" || e.detail.status == "done") {

            this.statusSpr.node.active = true;
            this.statusSpr.node.stopAllActions();
            this.statusSpr.spriteFrame = e.detail.status == "cancel" ? this.cancelSf : this.doneSf;
            this.statusSpr.node.opacity = 0;
            this.statusSpr.node.scale = 3;
            let ap = cc.scaleTo(0.1, 1);
            let bp = cc.fadeIn(0.1);
            let cp = cc.spawn(ap, bp);
            this.statusSpr.node.runAction(cp);
        }

        let showAnim = false;
        this.statusTips.node.active = false;
        this.statusTips.string = "";
        this.tipsContainer.active = false;

        //状态提示
        switch (e.detail.status) {
            case "wait"://付款中  买方显示
                if (tradeType == "buy") {
                    this.statusTips.node.active = true;
                    this.tipsContainer.active = true;
                    this.statusTips.string = "请付款后再点击【已付款】，恶意点击【已付款】会被制裁扣分";
                    showAnim = true;
                }
                break;
            case "process":
                if (tradeType == "sell") {
                    this.tipsContainer.active = true;
                    this.statusTips.node.active = true;
                    this.statusTips.string = "请确认【" + GameConfig.ChannelName[this.selectInfo.payType] + "】已收到对方转款,未收到付款请点击【交易遇到问题】";
                    showAnim = true;
                }
                break;
            case "judge":

                this.tipsContainer.active = true;
                this.statusTips.node.active = true;
                this.statusTips.string = "请点击右侧联系对方或点击上方电话进行协商";
                showAnim = true;
                break;
            case "release":
                if (tradeType == "buy") {
                    this.tipsContainer.active = true;
                    this.statusTips.node.active = true;
                    this.statusTips.string = "是否已和对方完成协商";
                    showAnim = true;
                }

                break;
            case "confirm":
                if (tradeType == "sell") {
                    this.tipsContainer.active = true;
                    this.statusTips.node.active = true;
                    this.statusTips.string = "是否已和对方完成协商";
                    showAnim = true;
                }
                break;
            case 'service':

                this.tipsContainer.active = true;
                this.statusTips.node.active = true;
                this.statusTips.string = tradeType == "sell" ? "客服已介入,请提交收款记录给客服,未提交收款记录会不利于您的判决" : "客服已介入,请提交付款凭证给客服,未提交付款凭证会不利于您的判决";
                showAnim = true;

                break;
        }

        if (showAnim) {
            this.statusTips.node.opacity = 0;
            this.statusTips.node.scale = 3;
            let ag = cc.scaleTo(0.2, 1);
            let bg = cc.fadeIn(0.2);
            let cg = cc.spawn(ag, bg);
            this.statusTips.node.runAction(cg);
        }


        //已付款或取消订单
        this.confirmBtn.active = tradeType == "buy" && e.detail.status == "wait" && (new Date().getTime() + GameConfig.ServerTimeDiff - new Date(e.detail.updatedAt).getTime()) < GameConfig.GameInfo.otcConfig.BUY_TIMEOUT;//已付款
        this.cancelBtn.active = tradeType == "buy" && e.detail.status == "wait" && (new Date().getTime() + GameConfig.ServerTimeDiff - new Date(e.detail.updatedAt).getTime()) < GameConfig.GameInfo.otcConfig.BUY_TIMEOUT;//取消订单
        //放行
        this.processBtn.active = tradeType == "sell" && e.detail.status == "process";



        //协商放行或取消
        this.plsProcessBtn.active = tradeType == "buy" && e.detail.status == "judge";
        this.judgeCancelBtn.active = tradeType == "buy" && e.detail.status == "judge";
        this.plsCancelBtn.active = tradeType == "sell" && e.detail.status == "judge";
        this.judgeProcessBtn.active = tradeType == "sell" && e.detail.status == "judge";

        // 同意再次放行或取消
        this.agreeProcessBtn.active = tradeType == "sell" && e.detail.status == "confirm";
        this.agreeCancelBtn.active = tradeType == "buy" && e.detail.status == "release";

        // 拒绝再次放行或取消
        this.refuseProcessBtn.active = tradeType == "sell" && e.detail.status == "confirm";
        this.refuseCancelBtn.active = tradeType == "buy" && e.detail.status == "release";


        //进入客服介入状态
        this.serviceBtn.active = e.detail.status == "judge";
        //向客服提交资料
        this.submitDataBtn.active = e.detail.status == "service";
        this.copyServiceBtn.active = e.detail.status == "service";
        this.copyTips.active = e.detail.status == "service";

        if (e.detail.status == "process" || e.detail.status == "wait" || e.detail.status == "trans") {
            this.tipsContainer.active = true;
            this.lblDownTime.node.active = true;
            this.lblDownTime.unscheduleAllCallbacks();
            let totalTime = 0;
            switch (e.detail.status) {
                case "wait":
                    totalTime = GameConfig.GameInfo.otcConfig.BUY_TIMEOUT;
                    break;
                case "process":
                    totalTime = e.detail.tradeType == "slow" ? GameConfig.GameInfo.otcConfig.SLOW_SELL_CONFIRM_TIMEOUT : GameConfig.GameInfo.otcConfig.FAST_SELL_CONFIRM_TIMEOUT;
                    break;
                case "trans":
                    totalTime = GameConfig.GameInfo.otcConfig.SLOW_BUY_TRANS_TIME;
                    break;
            }

            this.lblDownTime.schedule(() => {
                let leftTime = totalTime - (new Date().getTime() + GameConfig.ServerTimeDiff - new Date(e.detail.updatedAt).getTime());
                if (leftTime <= 0) {
                    this.lblDownTime.string = "00:00";
                    this.lblDownTime.unscheduleAllCallbacks();
                    return;
                }
                let hour = Math.floor(leftTime / 1000 / 60 / 60);
                if (hour > 0) {
                    this.lblDownTime.string = "约" + hour + "小时";
                    return
                }
                let min = Math.floor((leftTime / 1000) / 60);
                let sec = Math.floor((leftTime / 1000) % 60)
                let m = min < 10 ? "0" + min : "" + min;
                let s = sec < 10 ? "0" + sec : "" + sec;
                this.lblDownTime.string = m + ":" + s;
                console.log("----显示倒计时----", this.lblDownTime.node.active)

            }, 1);


        } else {
            console.log("----隐藏倒计时----")

            this.lblDownTime.node.active = false;
        }
    }
    refreshSelectInfo() {
        console.log("----selectInfo----", this.selectInfo)

        let tradeType = this.selectInfo.buyer.id == GameConfig.ProxyData.id ? "buy" : "sell";
        //买家ID  卖家一直显示
        this.lblBuyerIDDesc.node.active = tradeType == "sell";
        this.lblBuyerID.node.active = tradeType == "sell";
        this.lblBuyerID.string = "" + this.selectInfo.buyer.id;

        this.lblNameDesc.string = tradeType == "buy" ? "收款人" : "购买人";
        this.lblName.string = tradeType == "buy" ? JSON.parse(this.selectInfo.seller[this.payType]).name : this.selectInfo.buyer.name;

        this.lblAccountDesc.node.active = tradeType == "buy";
        this.lblAccount.node.active = tradeType == "buy";
        this.lblAccount.string = JSON.parse(this.selectInfo.seller[this.payType]).account + "";
        if (this.payType == "bank" && tradeType == "buy") {
            this.lblBank.node.active = true;
            this.lblBankAddress.node.active = true;
            this.lblBank.node.parent.active = true;
            this.lblBankAddress.node.parent.active = true;
            this.lblBank.string = "" + JSON.parse(this.selectInfo.seller[this.payType]).bank;
            this.lblBankAddress.string = "" + JSON.parse(this.selectInfo.seller[this.payType]).address;
        } else {
            this.lblBank.node.active = false;
            this.lblBankAddress.node.active = false;
            this.lblBank.node.parent.active = false;
            this.lblBankAddress.node.parent.active = false;
        }

        //手机号在申诉状态显示
        this.lblPhoneDesc.node.active = this.selectInfo.status != "cancel" || this.selectInfo.status != "done"//this.selectInfo.status == "judge" || this.selectInfo.status == "process" || this.selectInfo.status == "wait";
        this.lblPhone.node.active = this.selectInfo.status != "cancel" || this.selectInfo.status != "done"// this.selectInfo.status == "judge" || this.selectInfo.status == "process" || this.selectInfo.status == "wait";
        this.lblPhoneDesc.string = tradeType == "buy" ? "收款人手机" : "购买人手机";
        this.lblPhone.string = tradeType == "buy" ? this.selectInfo.seller.phone : this.selectInfo.buyer.phone;

        //创建时间
        this.lblCreateAt.string = GameUtils.timestampToTime(new Date(this.selectInfo.createdAt)) + "";
        //更新时间
        this.lblUpdateAt.string = GameUtils.timestampToTime(new Date(this.selectInfo.updatedAt)) + "";
        this.qrcodeNode.node.active = (tradeType == "buy" && this.payType != "bank" && this.selectInfo.status != "cancel" && this.selectInfo.status != "done") || (tradeType == "sell" && this.selectInfo.status != "wait");
        this.qrcodeDesc.string = tradeType == "buy" ? "点击查看收款码" : "点击查看付款凭证";

        if ((tradeType == "buy" && this.payType != "bank") || (tradeType == "sell" && this.selectInfo.status != "wait")) {

            let qrcodeUrl = tradeType == "buy" ? JSON.parse(this.selectInfo.seller[this.payType]).address : this.selectInfo.receipt;
            if (GameUtils.isNullOrEmpty(qrcodeUrl)) {
                this.qrcodeNode.spriteFrame = this.defaultSf
            } else {
                GameUtils.loadImg(GameConfig.GameInfo.resourceURL + qrcodeUrl).then((tex) => {
                    this.qrcodeNode.spriteFrame = tex;
                });

            }

        }
    }

    showQrCode() {

        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.selectInfo)) {
            Cache.alertTip("请选择订单");
            return;
        }
        let qrcodeUrl = this.selectInfo.buyer.id == GameConfig.ProxyData.id ? JSON.parse(this.selectInfo.seller[this.selectInfo.payType]).address : this.selectInfo.receipt;
        if (GameUtils.isNullOrEmpty(qrcodeUrl)) {
            Cache.alertTip(this.selectInfo.buyer.id == GameConfig.ProxyData.id ? "暂无收款码" : "对方未上传付款凭证");
            return;
        }
        this.qrcodeMask.active = true;
        GameUtils.loadImg(GameConfig.GameInfo.resourceURL + qrcodeUrl).then((tex) => {
            this.qrcodeSpr.spriteFrame = tex;
        });
        App.lockScene();
        this.qrcodeSpr.node.scale = 0;
        setTimeout(() => {
            if (this.qrcodeSpr.node.height > 500) {
                let w = 500 * this.qrcodeSpr.node.width / this.qrcodeSpr.node.height;
                let h = 500;
                this.qrcodeSpr.node.width = w;
                this.qrcodeSpr.node.height = h
            }

            this.qrcodeSpr.node.runAction(cc.scaleTo(0.2, 1));
            App.unlockScene();
        }, 300)
    }

    hideQrCode() {
        Cache.playSfx();
        this.qrcodeSpr.node.stopAllActions();
        this.qrcodeSpr.node.runAction(cc.sequence(
            cc.scaleTo(0.2, 0),
            cc.callFunc(() => {
                this.qrcodeMask.active = false;
            })
        ));
    }

    saveQrCode() {
        Cache.playSfx();
        let qrcodeUrl = JSON.parse(this.selectInfo.seller[this.selectInfo.payType]).address;
        GameUtils.SaveToLocal(GameConfig.GameInfo.resourceURL + qrcodeUrl, (filepath) => {
            if (filepath == "error ") {
                Cache.alertTip("保存失败,请截屏保存")
            } else {
                Social.saveImage(filepath);
            }
        })

    }

    copyStr(e) {
        Cache.playSfx();
        Cache.alertTip("复制成功")
        Social.setCopy(e.currentTarget.getComponent(cc.Label).string);
    }

    /**取消订单 */
    onClickCancel() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.selectInfo)) {
            Cache.alertTip("请选择订单");
            return;
        }
        Cache.showConfirm("确认取消订单吗?\n\n多次取消订单会限制交易", () => {
            Connector.request(GameConfig.ServerEventName.POTCCancelTrade, { tradeID: this.selectInfo.id }, (data) => {
                Cache.alertTip("取消成功");
                this.downloadTrades();
            })
        })
    }

    /**已付款 */
    onClickConfirm() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.selectInfo)) {
            Cache.alertTip("请选择订单");
            return;
        }
        var self = this;



        GameUtils.pop(GameConfig.pop.ConfirmReceiptPop, (node) => {
            node.getComponent("ConfirmReceiptPop").show("showConfirm", "请上传付款凭证", (receiptUrl) => {
                Connector.request(GameConfig.ServerEventName.POTCConfirmTrade, { tradeID: self.selectInfo.id, receipt: receiptUrl }, (data) => {
                    Cache.alertTip("等待卖家放行");
                    Cache.showConfirm("是否拨打电话催促对方放行", () => {
                        Social.makeCall("" + this.selectInfo.seller.phone)
                        self.downloadTrades();
                    }, () => {
                        self.downloadTrades();
                    })
                })
            })
        })
    }
    /**放行 */
    onClickProcess() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.selectInfo)) {
            Cache.alertTip("请选择订单");
            return;
        }
        var self = this;
        Cache.showConfirm("请确认【" + GameConfig.ChannelName[this.selectInfo.payType] + "】已收到对方转款" + GameUtils.formatGold(this.selectInfo.amount) + "元,未收到请勿放行！！！避免钱货两空！！！",()=>{
            Connector.request(GameConfig.ServerEventName.POTCProcessTrade, { tradeID: this.selectInfo.id }, (data) => {
                Cache.alertTip("交易成功");
                this.downloadTrades();
            })
        })
      
        // let codePre = cc.instantiate(this.codePre);
        // codePre.getComponent("MarketAccountCode").initData("请确认【" + GameConfig.ChannelName[this.selectInfo.payType] + "】已收到对方转款" + GameUtils.formatGold(this.selectInfo.amount) + "元,未收到请勿放行！！！避免钱货两空！！！", (codeStr) => {
        //     Connector.request(GameConfig.ServerEventName.POTCProcessTrade, { tradeID: this.selectInfo.id, code: codeStr }, (data) => {
        //         Cache.alertTip("交易成功");
        //         this.downloadTrades();
        //     })
        // }, null, 'proxyFinishtrade');


        // GameUtils.pop(GameConfig.pop.CheckTradePwd, (node) => {
        //     node.getComponent("CheckTradePwd").show("showConfirm", "请确认【" + GameConfig.ChannelName[this.selectInfo.payType] + "】已收到对方转款" + GameUtils.formatGold(this.selectInfo.amount) + "元,未收到请勿放行！！！避免钱货两空！！！", (tradePwd) => {
        //         let encryptPwd = GameUtils.encryptToken(tradePwd);
        //         Connector.request(GameConfig.ServerEventName.POTCProcessTrade, { tradeID: this.selectInfo.id, password: encryptPwd }, (data) => {
        //             Cache.alertTip("交易成功");
        //             this.downloadTrades(this.selectInfo.id);
        //         })
        //     })
        // })
    }

    /**申诉 */
    onClickJudge() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.selectInfo)) {
            Cache.alertTip("请选择订单");
            return;
        }
        Cache.showConfirm("未收到对方付款? 可以与对方进行电话沟通", () => {
            Connector.request(GameConfig.ServerEventName.POTCReportTrade, { tradeID: this.selectInfo.id }, (data) => {
                Cache.alertTip("订单进入申诉状态");
                this.downloadTrades();

            })
        })
    }

    /**协商放行 */
    onPleaseProcess() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.selectInfo)) {
            Cache.alertTip("请选择订单");
            return;
        }
        Cache.showConfirm("协商完成,请求卖家再次确认放行", () => {
            Connector.request(GameConfig.ServerEventName.POTCPleaseProcess, { tradeID: this.selectInfo.id }, (data) => {
                Cache.alertTip("等待对方同意");
                this.downloadTrades();
            })
        })
    }
    /**协商取消 */
    onPleaseCancel() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.selectInfo)) {
            Cache.alertTip("请选择订单");
            return;
        }
        Cache.showConfirm("协商完成,请求买家取消订单", () => {
            Connector.request(GameConfig.ServerEventName.POTCPleaseCancel, { tradeID: this.selectInfo.id }, (data) => {
                Cache.alertTip("等待对方同意");
                this.downloadTrades();
            })
        })
    }


    /**进入聊天界面 */
    enjoinChatRoom() {
        if (this.isInitRoom) return;
        this.isInitRoom = true;
        let id = this.selectInfo.seller.id == GameConfig.ProxyData.id ? this.selectInfo.buyer.id : this.selectInfo.seller.id;

        this.chatRoom.getComponent("GoEasyChat").initData(id, this.selectInfo, GoEasyConfig.ChatType.PRIVATE);

    }
    onSumbitData() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.selectInfo)) {
            Cache.alertTip("请选择订单");
            return;
        }
        Social.openUrl(`${GameConfig.GameInfo.customeService}&metadata={"tel":"${GameConfig.ProxyData.phone}","name":"${GameConfig.ProxyData.name}","代理ID":"${GameConfig.ProxyData.id}","addr":"xyqp","tradeID":"${this.selectInfo.id}","sellerID":"${this.selectInfo.seller.id}","buyerID":"${this.selectInfo.buyer.id}"}`)
    }


    onCopyService() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.selectInfo)) {
            Cache.alertTip("请选择订单");
            return;
        }
        let str = `${GameConfig.GameInfo.customeService}&metadata={"tel":"${GameConfig.ProxyData.phone}","name":"${GameConfig.ProxyData.name}","代理ID":"${GameConfig.ProxyData.id}","addr":"xyqp","tradeID":"${this.selectInfo.id}","sellerID":"${this.selectInfo.seller.id}","buyerID":"${this.selectInfo.buyer.id}"}`
        Social.setCopy(str);

    }
    /**进入客服介入状态 */
    onServiceTrade() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(this.selectInfo)) {
            Cache.alertTip("请选择订单");
            return;
        }
        Cache.showConfirm("申请客服介入后,请在及时提交资料给客服,未及时提供资料会不利于最后判决", () => {
            Connector.request(GameConfig.ServerEventName.POTCServiceTrade, { tradeID: this.selectInfo.id }, (data) => {
                Cache.alertTip(this.selectInfo.buyer.id == GameConfig.ProxyData.id ? "请提交付款凭证给客服" : "请提交收款记录给客服");
                this.downloadTrades();
            })
        })
    }
    /**删除当前订单未读 */
    deleteTradeDone(id) {
        let data = GameUtils.getValue("" + GameConfig.StorageKey.TradeWaitting + GameConfig.ProxyData.id, []);
        // if (data.length == 0) return;
        let newData = data.filter(e => { return e.tradeID != id })
        GameUtils.saveValue("" + GameConfig.StorageKey.TradeWaitting + GameConfig.ProxyData.id, newData);
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.HIDE_TRADE_TIPS);
    }

    onClickPhone(e) {
        Cache.playSfx();
        Social.setCopy(e.currentTarget.getComponent(cc.Label).string);
        Social.makeCall(e.currentTarget.getComponent(cc.Label).string);
    }

    onClickService() {
        Cache.playSfx();
        Social.openUrl(`${GameConfig.GameInfo.customeService}&metadata={"tel":"${GameConfig.ProxyData.phone}","name":"${GameConfig.ProxyData.name}","qq":"${GameConfig.ProxyData.id}","addr":"xyqp","tradeID":"${this.selectInfo.id}","sellerID":"${this.selectInfo.seller.id}","buyerID":"${this.selectInfo.buyer.id}"}`)

    }

    onClickClose() {
        Cache.playSfx();
        this.removeEvents()

        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }
}


