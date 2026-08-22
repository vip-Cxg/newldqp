let ROUTE = require("../../../Main/Script/ROUTE");
let connector = require("../../../Main/NetWork/Connector");
let TableInfo = require("../../../Main/Script/TableInfo");
let utils = require("../../../Main/Script/utils");
let Cache = require("../../../Main/Script/Cache");

cc.Class({
    extends: cc.Component,

    init(scene) {
        this.scene = scene;
        this.currentGameID = null;
        this.currentRound = 0;
        this.state = this.emptyState();
        this.createUI();
    },

    emptyState() {
        return {
            pending: false,
            bankerIdx: -1,
            open: false,
            revealed: false,
            multiplier: 1,
            deadline: 0,
            auto: false,
            submitted: false,
            gameID: null,
            round: 0,
            bankerHands: []
        };
    },

    setCurrentRound(gameID, round) {
        this.currentGameID = gameID;
        this.currentRound = round;
    },

    startRound(data) {
        this.reset();
        this.currentGameID = data.gameID || this.currentGameID;
        this.currentRound = data.round;
    },

    createLabel(parent, name, text, fontSize, color) {
        let node = new cc.Node(name);
        node.parent = parent;
        let label = node.addComponent(cc.Label);
        label.string = text || "";
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 6;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        node.color = color || cc.Color.WHITE;
        return label;
    },

    createUI() {
        this.bankerOpenTips = cc.find("nodeTable/tableInfo/bankerOpenTips", this.node);
        if (!this.bankerOpenTips)
            console.error("Game09 未找到明牌提示节点: Canvas/nodeTable/tableInfo/bankerOpenTips");
        this.setOpenTipsActive(false);

        this.openHandsUI = cc.find("openHandsUI", this.node);
        this.panel = cc.find("bankerOpenPanel", this.openHandsUI);
        this.waitingLabel = cc.find("waitingTips", this.openHandsUI).getComponent(cc.Label);
        this.clockLabel = cc.find("clock", this.panel).getComponent(cc.Label);
        this.yesButton = cc.find("openButton", this.panel).getComponent(cc.Button);
        this.noButton = cc.find("noOpenButton", this.panel).getComponent(cc.Button);
        this.yesButton.node.on(cc.Node.EventType.TOUCH_END, function () {
            this.submit(true);
        }, this);
        this.noButton.node.on(cc.Node.EventType.TOUCH_END, function () {
            this.submit(false);
        }, this);
        this.panel.active = false;
        this.waitingLabel.node.active = false;

        this.bankerHandsNode = new cc.Node("bankerOpenHands");
        // 固定放在 scoreContent 内，与 wu/shi/k 同级并位于 k 的下方。
        this.bankerHandsNode.parent = this.scene.kNode.parent;
        let scoreLayout = this.bankerHandsNode.parent.getComponent(cc.Layout);
        if (scoreLayout)
            scoreLayout.enabled = false;
        this.bankerHandsNode.zIndex = this.scene.kNode.zIndex + 1;
        this.bankerHandsNode.anchorX = 0;
        this.bankerHandsNode.setContentSize(328, 80);
        this.bankerHandsNode.active = false;
    },

    setButtonsEnabled(enabled) {
        this.yesButton.interactable = enabled;
        this.noButton.interactable = enabled;
        this.yesButton.node.opacity = enabled ? 255 : 150;
        this.noButton.node.opacity = enabled ? 255 : 150;
    },

    setOpenTipsActive(active) {
        if (this.bankerOpenTips)
            this.bankerOpenTips.active = active;
    },

    isCurrent(data) {
        if (!data)
            return false;
        if (this.currentGameID != null && data.gameID != null && String(data.gameID) !== String(this.currentGameID))
            return false;
        if (this.currentRound != null && data.round != null && Number(data.round) !== Number(this.currentRound))
            return false;
        return true;
    },

    hasEnteredOpenHandsStage() {
        return this.state && this.state.bankerIdx >= 0;
    },

    handleOpenHands(data) {
        if (!this.isCurrent(data)) {
            console.warn("Game09 丢弃其他局的 SC_OPEN_HANDS", data);
            return;
        }
        let samePendingQuestion = this.state.pending === true &&
            String(this.state.gameID) === String(data.gameID) &&
            Number(this.state.round) === Number(data.round) &&
            Number(this.state.bankerIdx) === Number(data.idx);
        let submitted = samePendingQuestion && this.state.submitted;
        this.state.gameID = data.gameID;
        this.state.round = data.round;
        this.state.bankerIdx = data.idx;
        this.state.auto = data.auto === true;

        if (data.pending === true) {
            this.state.pending = true;
            this.state.open = false;
            this.state.revealed = false;
            this.state.multiplier = 1;
            this.state.deadline = Number(data.clock) || 0;
            this.state.submitted = submitted;
            this.clearBankerHands();
            this.setOpenTipsActive(false);
            this.showPending();
            return;
        }

        this.state.pending = false;
        this.state.open = data.open === true;
        this.state.multiplier = Number(data.multiplier) || (data.open ? 2 : 1);
        this.state.deadline = 0;
        this.state.submitted = false;
        this.hidePending();
        if (this.scene.nodeBao)
            this.scene.nodeBao.active = false;
        this.setOpenTipsActive(this.state.open);
        if (!this.state.open)
            this.clearBankerHands();
    },

    showPending() {
        let canOperate = TableInfo.idx === this.state.bankerIdx && !this.state.auto;
        this.panel.active = canOperate;
        this.waitingLabel.node.active = !canOperate;
        this.waitingLabel.string = this.state.auto ? "庄家已托管，等待服务器确认…" : "等待庄家选择是否明牌…";
        this.setButtonsEnabled(!this.state.submitted);
        this.unschedule(this.updateClock);
        this.updateClock();
        this.schedule(this.updateClock, 0.2);
        this.scene.changeBtn(false);
        if (this.scene.nodeBao)
            this.scene.nodeBao.active = false;
    },

    hidePending() {
        this.unschedule(this.updateClock);
        this.panel.active = false;
        this.waitingLabel.node.active = false;
    },

    updateClock() {
        if (!this.state.pending) {
            this.hidePending();
            return;
        }
        let remain = Math.max(0, this.state.deadline - utils.getTimeStamp());
        this.clockLabel.string = remain > 0 ? "请在 " + Math.ceil(remain / 1000) + " 秒内选择" : "等待服务器确认…";
        if (remain <= 0)
            this.setButtonsEnabled(false);
    },

    submit(open) {
        if (!this.state.pending || this.state.submitted)
            return;
        if (TableInfo.idx !== this.state.bankerIdx || this.state.auto)
            return;
        if (this.state.deadline > 0 && this.state.deadline <= utils.getTimeStamp())
            return;

        Cache.playSfx();
        this.state.submitted = true;
        this.setButtonsEnabled(false);
        this.clockLabel.string = "等待服务器确认…";
        connector.gameMessage(ROUTE.CS_OPEN_HANDS, {
            gameID: this.state.gameID,
            round: this.state.round,
            open: open
        });
    },

    handleShowHands(data) {
        if (!this.isCurrent(data)) {
            console.warn("Game09 丢弃其他局的 SC_SHOW_HANDS", data);
            return;
        }
        if (!Array.isArray(data.players))
            return;

        if (data.players.length > 1)
            console.warn("Game09 SC_SHOW_HANDS 包含非庄家手牌，前端将忽略", data);
        let banker = data.players.find(player => player && Number(player.idx) === Number(data.idx));
        if (!banker) {
            console.warn("Game09 SC_SHOW_HANDS 缺少庄家手牌", data);
            return;
        }

        this.state.pending = false;
        this.state.open = true;
        this.state.revealed = true;
        this.state.bankerIdx = data.idx;
        this.state.multiplier = 2;
        this.state.bankerHands = Array.isArray(banker.hands) ? banker.hands.slice() : [];
        this.hidePending();
        this.setOpenTipsActive(true);
        this.refreshBankerHands();
    },

    removeByPlay(data) {
        if (!this.state.revealed)
            return;
        let currentCard = data && data.currentCard ? data.currentCard : data;
        if (!currentCard || currentCard.idx == null || !Array.isArray(currentCard.cards))
            return;
        if (Number(currentCard.idx) !== Number(this.state.bankerIdx))
            return;
        currentCard.cards.forEach(card => {
            let index = this.state.bankerHands.indexOf(card);
            if (index >= 0)
                this.state.bankerHands.splice(index, 1);
            else
                console.warn("Game09 庄家明牌缓存未找到待删除牌", currentCard.idx, card, this.state.bankerHands);
        });
        this.refreshBankerHands();
    },

    refreshBankerHands() {
        if (!this.bankerHandsNode)
            return;
        let container = this.bankerHandsNode;
        // 庄家使用自己的正常手牌区域，不重复展示公开手牌。
        if (Number(TableInfo.idx) === Number(this.state.bankerIdx)) {
            container.destroyAllChildren();
            container.active = false;
            return;
        }
        let scoreContent = this.scene.kNode.parent;
        let maxWidth = scoreContent.width > 0 ? scoreContent.width : 328;
        let hands = this.state.bankerHands;
        const maxCardsPerRow = 14;
        const cardScale = 0.6;
        const cardWidth = 90 * cardScale;
        const cardHeight = 125 * cardScale;
        const cardSpacing = 20;
        const rowSpacing = 38;
        let rowCount = Math.max(1, Math.ceil(hands.length / maxCardsPerRow));
        let containerHeight = cardHeight + (rowCount - 1) * rowSpacing;
        container.setContentSize(maxWidth, containerHeight);
        container.setPosition(
            this.scene.kNode.x,
            this.scene.kNode.y - this.scene.kNode.height / 2 - container.height / 2 - 8 + 25
        );
        container.destroyAllChildren();
        container.active = this.state.revealed;
        if (hands.length === 0) {
            let empty = this.createLabel(container, "empty", "已出完", 20, cc.color(230, 230, 230));
            empty.node.setContentSize(100, 36);
            return;
        }

        hands.forEach((card, i) => {
            let row = Math.floor(i / maxCardsPerRow);
            let column = i % maxCardsPerRow;
            let cardNode = cc.instantiate(this.scene.preCards);
            cardNode.parent = container;
            cardNode.scale = cardScale;
            cardNode.setPosition(
                cardWidth / 2 + column * cardSpacing,
                containerHeight / 2 - cardHeight / 2 - row * rowSpacing
            );
            cardNode.getComponent("ModuleCardsInit_09").init(card);
        });
    },

    clearBankerHands() {
        if (this.bankerHandsNode) {
            this.bankerHandsNode.destroyAllChildren();
            this.bankerHandsNode.active = false;
        }
        if (this.state)
            this.state.bankerHands = [];
    },

    reset() {
        this.unschedule(this.updateClock);
        this.state = this.emptyState();
        if (this.panel)
            this.panel.active = false;
        if (this.waitingLabel)
            this.waitingLabel.node.active = false;
        this.setOpenTipsActive(false);
        if (this.yesButton)
            this.setButtonsEnabled(true);
        this.clearBankerHands();
    },

    restore(data) {
        if (!data || data.openHandsPending === undefined)
            return;
        this.reset();
        this.state.gameID = data.gameID || this.currentGameID;
        this.state.round = data.round == null ? this.currentRound : data.round;
        this.state.bankerIdx = data.openHandsIdx == null ? -1 : data.openHandsIdx;
        this.state.auto = data.openHandsAuto === true;

        if (data.openHandsPending === true) {
            this.handleOpenHands({
                gameID: this.state.gameID,
                round: this.state.round,
                idx: this.state.bankerIdx,
                pending: true,
                open: null,
                auto: this.state.auto,
                clock: data.openHandsClock,
                multiplier: 1
            });
            return;
        }

        this.state.open = data.openHands === true;
        this.state.multiplier = Number(data.multiplier) || 1;
        this.state.revealed = data.openHandsRevealed === true;
        this.setOpenTipsActive(this.state.open);
        if (this.state.revealed && Array.isArray(data.openHandsPlayers)) {
            this.handleShowHands({
                gameID: this.state.gameID,
                round: this.state.round,
                idx: this.state.bankerIdx,
                players: data.openHandsPlayers
            });
        }
    },

    onDestroy() {
        this.unschedule(this.updateClock);
    }
});
