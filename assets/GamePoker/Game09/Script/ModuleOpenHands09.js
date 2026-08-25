let ROUTE = require("../../../Main/Script/ROUTE");
let connector = require("../../../Main/NetWork/Connector");
let TableInfo = require("../../../Main/Script/TableInfo");
let utils = require("../../../Main/Script/utils");
let Cache = require("../../../Main/Script/Cache");

cc.Class({
    extends: cc.Component,

    init(scene) {
        this.scene = scene;
        this.raiseActionButtons();
        this.currentGameID = null;
        this.currentRound = 0;
        this.state = this.emptyState();
        this.createUI();
    },

    /**
     * nodeBtn 原本嵌套在 nodehands 下，无法通过自身 zIndex 压过牌桌直属的出牌节点。
     * 将按钮组提到牌桌层级并保留世界坐标，使“不出 / 提示 / 出牌”始终可见、可点击。
     */
    raiseActionButtons() {
        let nodeBtn = this.scene.nodeBtn;
        let tableNode = this.scene.bgTable && this.scene.bgTable.node;
        if (!nodeBtn || !tableNode)
            return;
        if (nodeBtn.parent !== tableNode) {
            let worldPosition = nodeBtn.parent.convertToWorldSpaceAR(nodeBtn.position);
            nodeBtn.parent = tableNode;
            nodeBtn.position = tableNode.convertToNodeSpaceAR(worldPosition);
        }
        nodeBtn.zIndex = 3000;
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
            handsByIdx: {}
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

    isEnabled() {
        let rules = TableInfo.options && TableInfo.options.rules;
        return !!(rules && Number(rules.poker) === 2 && rules.lai === true);
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
        // 新协议不再询问是否明牌，旧 UI 永久禁用；仅由 SC_SHOW_HANDS
        // 或包庄后的重连数据开启四家明牌。
        this.openHandsUI.active = false;
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

        this.openHandsNodes = {};
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
        return false;
    },

    handleOpenHands(data) {
        if (!this.isCurrent(data)) {
            console.warn("Game09 丢弃其他局的 SC_OPEN_HANDS", data);
            return;
        }
        if (!this.isEnabled())
            return;
        this.state.gameID = data.gameID;
        this.state.round = data.round;
        this.state.bankerIdx = -1;
        this.state.auto = false;
        this.state.pending = false;
        this.state.open = data.open !== false;
        this.state.multiplier = 1;
        this.state.deadline = 0;
        this.state.submitted = false;
        this.hidePending();
        if (this.scene.nodeBao)
            this.scene.nodeBao.active = false;
        this.setOpenTipsActive(false);
        if (!this.state.open)
            this.clearOpenHands();
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
        if (!this.isEnabled())
            return;
        if (data.players.length !== 4)
            console.warn("Game09 SC_SHOW_HANDS 应包含四家手牌", data);

        this.state.pending = false;
        this.state.open = true;
        this.state.revealed = true;
        this.state.bankerIdx = -1;
        this.state.multiplier = 1;
        this.state.handsByIdx = {};
        data.players.forEach(player => {
            if (player && player.idx != null && Array.isArray(player.hands))
                this.state.handsByIdx[Number(player.idx)] = player.hands.slice();
        });
        this.hidePending();
        this.setOpenTipsActive(false);
        this.refreshOpenHands();
        this.movePlayedCardsUp();
    },

    removeByPlay(data) {
        if (!this.state.revealed)
            return;
        let currentCard = data && data.currentCard ? data.currentCard : data;
        if (!currentCard || currentCard.idx == null || !Array.isArray(currentCard.cards))
            return;
        let hands = this.state.handsByIdx[Number(currentCard.idx)];
        if (!Array.isArray(hands))
            return;
        currentCard.cards.forEach(card => {
            let index = hands.indexOf(card);
            if (index >= 0)
                hands.splice(index, 1);
            else
                console.warn("Game09 公开手牌缓存未找到待删除牌", currentCard.idx, card, hands);
        });
        this.refreshOpenHands();
    },

    refreshOpenHands() {
        Object.keys(this.state.handsByIdx).forEach(idx => this.refreshPlayerHands(Number(idx)));
    },

    refreshPlayerHands(idx) {
        let realIdx = TableInfo.realIdx && TableInfo.realIdx[idx];
        let playerInfo = realIdx == null ? null : this.scene.nodePlayerInfo[realIdx];
        if (!playerInfo || !playerInfo.node)
            return;
        let container = this.openHandsNodes[idx];
        if (!container || !cc.isValid(container)) {
            container = new cc.Node("openHands_" + idx);
            container.parent = playerInfo.node;
            container.zIndex = 8;
            container.anchorX = 0;
            container.anchorY = 0.5;
            this.openHandsNodes[idx] = container;
        }
        container.destroyAllChildren();
        // 自己的手牌已经在底部正常展示。
        container.active = this.state.revealed && Number(idx) !== Number(TableInfo.idx);
        if (!container.active)
            return;
        container.anchorX = realIdx === 1 ? 1 : 0;
        container.setContentSize(400, 105);
        // 右家放头像左侧、顶家放头像右侧、左家放头像上方。
        if (realIdx === 1)
            container.setPosition(-30, 115);
        else if (realIdx === 2)
            container.setPosition(60, 25);
        else
            container.setPosition(30, 110);

        let hands = (this.state.handsByIdx[idx] || []).slice().sort((a, b) => {
            return a % 100 === b % 100 ? a - b : a % 100 - b % 100;
        });
        const cardScale = 0.55;
        const cardWidth = 90 * cardScale;
        const rowCount = hands.length > 1 ? 2 : 1;
        const cardsPerRow = Math.max(1, Math.ceil(hands.length / rowCount));
        const spacing = cardsPerRow > 1 ? Math.min(30, (container.width - cardWidth) / (cardsPerRow - 1)) : 0;
        const rowSpacing = 35;
        hands.forEach((card, i) => {
            let row = Math.floor(i / cardsPerRow);
            let column = i % cardsPerRow;
            let cardNode = cc.instantiate(this.scene.preCards);
            cardNode.parent = container;
            cardNode.scale = cardScale;
            // 右侧手牌由右向左展开，需要反转同一排的绘制层级，
            // 否则左边后创建的牌会盖住右边牌左上角的点数。
            cardNode.zIndex = row * 100 + (realIdx === 1 ? cardsPerRow - column : column);
            cardNode.setPosition(
                realIdx === 1 ? -cardWidth / 2 - column * spacing : cardWidth / 2 + column * spacing,
                (rowCount - 1) / 2 * rowSpacing - row * rowSpacing
            );
            cardNode.getComponent("ModuleCardsInit_09").init(card);
        });
    },

    movePlayedCardsUp() {
        if (!Array.isArray(this.scene.dropCards))
            return;
        this.scene.dropCards.forEach((layout, realIdx) => {
            if (!layout || !layout.node || realIdx === 0)
                return;
            let cardNode = layout.node;
            // 兼容上一版曾经直接移动过牌节点的情况，先恢复其局部坐标。
            if (cardNode._openHandsOriginY != null)
                cardNode.y = cardNode._openHandsOriginY;
            let showCardNode = cardNode.parent;
            if (!showCardNode)
                return;
            // 明牌节点是运行时挂到牌桌上的，可能覆盖原场景中的出牌区域。
            // 提高整组出牌节点，保证牌、张数、牌型特效和“不出”提示均在最上层。
            showCardNode.zIndex = 2000 + realIdx;
            if (showCardNode._openHandsOriginY == null)
                showCardNode._openHandsOriginY = showCardNode.y;
            // 整体移动出牌区域，牌、张数、牌型特效和“不出”标记会同步移动。
            showCardNode.y = showCardNode._openHandsOriginY - (realIdx === 2 ? 85 : 25);
        });
    },

    clearOpenHands() {
        Object.keys(this.openHandsNodes || {}).forEach(idx => {
            let node = this.openHandsNodes[idx];
            if (node && cc.isValid(node))
                node.destroy();
        });
        this.openHandsNodes = {};
        if (this.state)
            this.state.handsByIdx = {};
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
        this.clearOpenHands();
    },

    restore(data) {
        if (!data || data.openHandsPending === undefined || !this.isEnabled())
            return;
        this.reset();
        this.state.gameID = data.gameID || this.currentGameID;
        this.state.round = data.round == null ? this.currentRound : data.round;
        this.state.bankerIdx = data.openHandsIdx == null ? -1 : data.openHandsIdx;
        this.state.auto = data.openHandsAuto === true;

        this.state.open = data.openHands === true;
        this.state.pending = false;
        this.state.bankerIdx = -1;
        this.state.multiplier = 1;
        this.state.revealed = data.openHandsRevealed === true;
        this.hidePending();
        this.setOpenTipsActive(false);
        if (this.state.revealed && Array.isArray(data.openHandsPlayers)) {
            this.handleShowHands({
                gameID: this.state.gameID,
                round: this.state.round,
                idx: -1,
                players: data.openHandsPlayers
            });
        }
    },

    onDestroy() {
        this.unschedule(this.updateClock);
    }
});
