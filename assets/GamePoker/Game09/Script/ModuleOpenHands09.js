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

    createButton(parent, name, text, color, callback) {
        let node = new cc.Node(name);
        node.parent = parent;
        node.setContentSize(230, 62);
        let graphics = node.addComponent(cc.Graphics);
        graphics.fillColor = color;
        graphics.roundRect(-115, -31, 230, 62, 10);
        graphics.fill();
        let button = node.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.zoomScale = 0.95;
        let label = this.createLabel(node, "label", text, 25, cc.Color.WHITE);
        label.node.setContentSize(220, 60);
        node.on(cc.Node.EventType.TOUCH_END, callback, this);
        return button;
    },

    createUI() {
        let root = new cc.Node("openHandsFeature");
        root.parent = this.node;
        root.zIndex = 100;
        root.setContentSize(cc.winSize.width, cc.winSize.height);
        this.root = root;

        let badge = new cc.Node("openHandsBadge");
        badge.parent = root;
        badge.setPosition(0, 245);
        badge.setContentSize(180, 48);
        let badgeBg = badge.addComponent(cc.Graphics);
        badgeBg.fillColor = cc.color(176, 42, 36, 235);
        badgeBg.roundRect(-90, -24, 180, 48, 12);
        badgeBg.fill();
        let badgeLabel = this.createLabel(badge, "label", "庄家明牌 ×2", 28, cc.color(255, 233, 128));
        badgeLabel.node.setContentSize(170, 46);
        badge.active = false;
        this.badge = badge;

        let waiting = this.createLabel(root, "openHandsWaiting", "等待庄家选择是否明牌…", 28, cc.color(255, 236, 151));
        waiting.node.setPosition(0, 78);
        waiting.node.setContentSize(500, 54);
        waiting.node.active = false;
        this.waitingLabel = waiting;

        let panel = new cc.Node("openHandsPanel");
        panel.parent = root;
        panel.setPosition(0, 25);
        panel.setContentSize(610, 245);
        panel.addComponent(cc.BlockInputEvents);
        let panelBg = panel.addComponent(cc.Graphics);
        panelBg.fillColor = cc.color(25, 33, 43, 245);
        panelBg.roundRect(-305, -122, 610, 245, 18);
        panelBg.fill();

        let title = this.createLabel(panel, "title", "是否选择明牌？", 32, cc.color(255, 237, 160));
        title.node.setPosition(0, 78);
        title.node.setContentSize(500, 50);
        let clock = this.createLabel(panel, "clock", "", 24, cc.Color.WHITE);
        clock.node.setPosition(0, 35);
        clock.node.setContentSize(300, 40);
        this.clockLabel = clock;

        this.yesButton = this.createButton(panel, "openButton", "明牌（本局输赢 ×2）", cc.color(190, 63, 46), function () {
            this.submit(true);
        });
        this.yesButton.node.setPosition(-132, -55);
        this.noButton = this.createButton(panel, "closeButton", "不明牌", cc.color(63, 105, 142), function () {
            this.submit(false);
        });
        this.noButton.node.setPosition(132, -55);
        panel.active = false;
        this.panel = panel;

        this.bankerHandsNode = new cc.Node("bankerOpenHands");
        this.bankerHandsNode.parent = root;
        this.bankerHandsNode.setContentSize(430, 80);
        this.bankerHandsNode.active = false;
    },

    setButtonsEnabled(enabled) {
        this.yesButton.interactable = enabled;
        this.noButton.interactable = enabled;
        this.yesButton.node.opacity = enabled ? 255 : 150;
        this.noButton.node.opacity = enabled ? 255 : 150;
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
            this.badge.active = false;
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
        this.badge.active = this.state.open;
        if (this.state.open)
            this.badge.getChildByName("label").getComponent(cc.Label).string = "庄家明牌 ×" + this.state.multiplier;
        else
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
        this.badge.active = true;
        this.badge.getChildByName("label").getComponent(cc.Label).string = "庄家明牌 ×" + this.state.multiplier;
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
        if (!TableInfo.realIdx)
            return;
        let realIdx = TableInfo.realIdx[this.state.bankerIdx];
        if (realIdx == null || !this.bankerHandsNode)
            return;
        const positions = [cc.v2(0, -205), cc.v2(465, 22), cc.v2(-65, 205), cc.v2(-465, 22)];
        let container = this.bankerHandsNode;
        container.setPosition(positions[realIdx]);
        container.setContentSize(realIdx === 1 || realIdx === 3 ? 255 : 430, 80);
        container.destroyAllChildren();
        let hands = this.state.bankerHands;
        container.active = this.state.revealed;
        if (hands.length === 0) {
            let empty = this.createLabel(container, "empty", "已出完", 20, cc.color(230, 230, 230));
            empty.node.setContentSize(100, 36);
            return;
        }

        let maxWidth = realIdx === 1 || realIdx === 3 ? 245 : 420;
        let cardScale = realIdx === 0 ? 0.38 : 0.34;
        let cardWidth = 90 * cardScale;
        let spacing = hands.length > 1 ? Math.min(cardWidth, (maxWidth - cardWidth) / (hands.length - 1)) : 0;
        spacing = Math.max(7, spacing);
        let totalWidth = cardWidth + spacing * (hands.length - 1);
        hands.forEach((card, i) => {
            let cardNode = cc.instantiate(this.scene.preCards);
            cardNode.parent = container;
            cardNode.scale = cardScale;
            cardNode.setPosition(-totalWidth / 2 + cardWidth / 2 + i * spacing, 0);
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
        if (this.badge)
            this.badge.active = false;
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
        this.badge.active = this.state.open;
        if (this.state.open)
            this.badge.getChildByName("label").getComponent(cc.Label).string = "庄家明牌 ×" + this.state.multiplier;
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
