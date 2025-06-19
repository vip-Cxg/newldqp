import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
import { App } from "../hall/data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class ProxyMarketPop extends cc.Component {


    // @property(cc.EditBox)
    // buyCount = null;

    @property(cc.Prefab)
    marketAccountInfo = null;
    @property(cc.Prefab)
    rewardTradeItem = null;
    @property(cc.Prefab)
    createTradePage = null;
    @property(cc.Prefab)
    buyTradeList = null;
    @property(cc.Node)
    rewardContent = null;
    @property(cc.Node)
    buyListContent = null;
    @property(cc.Node)
    layerContent = null;
    @property(cc.Node)
    buyListScroll = null;
    @property(cc.Toggle)
    btnBuy = null;

    @property(cc.Node)
    updateBtn = null;

    codeCoolDown = true;



    start() {
        this.showBuyPage();
    };





    showBuyPage() {
        this.layerTopActive(true);
        this.removeContentChildren();
        GameConfig.ProxyMarketConfig.forEach(e => {
            let rewardItem = cc.instantiate(this.rewardTradeItem);
            rewardItem.getComponent("ProxyBuyTradeItem").initData(e);
            this.rewardContent.addChild(rewardItem);
        });

    }
    openAccountInfo() {
        Cache.playSfx();
        let marketAccountInfo = cc.instantiate(this.marketAccountInfo);
        marketAccountInfo.getComponent('ModuleMarketAccount').renderData('proxy');
        cc.find('Canvas').addChild(marketAccountInfo);
    }

    showSellPage() {
        Cache.playSfx();
        if (GameUtils.isNullOrEmpty(GameConfig.ProxyData.alipay) && GameUtils.isNullOrEmpty(GameConfig.ProxyData.bank)) {
            this.btnBuy.check();
            Cache.showConfirm("至少填写一种收款信息", () => {
                let marketAccountInfo = cc.instantiate(this.marketAccountInfo);
                marketAccountInfo.getComponent('ModuleMarketAccount').renderData('proxy');
                cc.find('Canvas').addChild(marketAccountInfo);
            })
            return;
        }
        this.layerTopActive(false);
        this.removeContentChildren();
        let buyList = cc.instantiate(this.createTradePage);
        this.layerContent.addChild(buyList);
    }

    layerTopActive(bool) {
        this.buyListScroll.active = bool;
        this.updateBtn.active = bool;
    }
    removeContentChildren() {

        this.buyListContent.removeAllChildren();
        this.layerContent.removeAllChildren();
        this.rewardContent.removeAllChildren();
    }

    /**购买订单列表 */
    showBuyList() {
        Cache.playSfx();
        this.layerTopActive(false);
        this.removeContentChildren();

        let buyList = cc.instantiate(this.buyTradeList);
        buyList.getComponent("TradeList").downloadList(true,'proxy');
        this.layerContent.addChild(buyList);
    }
    /**购买订单列表 */
    showSellList() {
        Cache.playSfx();
        this.layerTopActive(false);
        this.removeContentChildren();

        let buyList = cc.instantiate(this.buyTradeList);
        buyList.getComponent("TradeList").downloadList(false,'proxy');
        this.layerContent.addChild(buyList);
    }

    // onclickBuy(){
    //     Cache.playSfx();
    //     let amount = parseInt(this.buyCount.string) || 0;
    //     if (amount <= 0 || amount > 10000) {
    //         Cache.alertTip("请输入订单范围内金额1000~10000")
    //         return;
    //     }
    //     if (amount %1000!=0) {
    //         Cache.alertTip("请输入1000的倍数")
    //         return;
    //     }

    //     // Connector.request()

    // }

    onClickClose() {
        Cache.playSfx();
        if (this.node) {
            this.node.removeFromParent();
            this.node.destroy();
        }
    }



}


