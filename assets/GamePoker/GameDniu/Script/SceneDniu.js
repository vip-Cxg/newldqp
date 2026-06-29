let ROUTE = require("../../../Main/Script/ROUTE");
let connector = require("../../../Main/NetWork/Connector");
let db = require("../../../Main/Script/DataBase");
let PACK = require("../../../Main/Script/PACK");
let Cache = require("../../../Main/Script/Cache");
const { GameConfig } = require("../../../GameBase/GameConfig");
const DniuSeatMapper = require("./DniuSeatMapper");
const DniuTimelineConfig = require("./DniuTimelineConfig");

const DESIGN_SIZE = cc.size(1136, 640);
const SEAT_POS_8 = [
    cc.v2(0, -214),
    cc.v2(410, -112),
    cc.v2(430, 44),
    cc.v2(320, 184),
    cc.v2(0, 210),
    cc.v2(-320, 184),
    cc.v2(-430, 44),
    cc.v2(-410, -112)
];
const SEAT_NAMES = ["self", "rightLow", "rightMid", "rightTop", "top", "leftTop", "leftMid", "leftLow"];

cc.Class({
    extends: cc.Component,

    onLoad() {
        this.idx = -1;
        this.person = 8;
        this.status = "WAIT";
        this.players = [];
        this.tablePlayers = [];
        this.realIdx = [0, 1, 2, 3, 4, 5, 6, 7];
        this.seatMapper = new DniuSeatMapper(this.person);
        this.timelineScale = 1;
        this.cardsByIdx = {};
        this.selfHands = [];
        this.resultsByIdx = {};
        this.readyNodes = [];
        this.cardLayers = [];
        this.cardNodesByIdx = {};
        this.seatNodes = [];
        this.dealToken = 0;
        this.dealUntil = 0;
        this.clockEnd = 0;
        this.phase = "WAIT";
        this.banker = 0;

        this.buildTable();
        this.buildDebugPanel();
        this.schedule(this.gameMsgSchedule, 0.1);
        connector.emit(PACK.CS_JOIN_DONE, {});
    },

    onDestroy() {
        this.unschedule(this.gameMsgSchedule);
    },

    gameMsgSchedule() {
        if (!connector._queueGameMsg || connector._queueGameMsg.length <= 0) return;
        let msg = connector._queueGameMsg.shift();
        cc.log("[DNIU]", msg.route, msg.data);

        switch (msg.route) {
            case ROUTE.SC_GAME_DATA:
            case ROUTE.SC_JOIN_TABLE:
            case ROUTE.SC_RECONNECT:
                this.initTable(msg.data);
                break;
            case ROUTE.SC_GAME_READY:
                this.onReady(msg.data);
                break;
            case ROUTE.SC_GAME_INIT:
                this.onGameInit(msg.data);
                break;
            case ROUTE.SC_ACTION:
                this.onAction(msg.data);
                break;
            case ROUTE.SC_ROUND_SUMMARY:
                this.onRoundSummary(msg.data);
                break;
            case ROUTE.SC_DNIU_SPECTATE:
                this.onSpectate(msg.data);
                break;
            case ROUTE.SC_PLAYER_LEAVE:
                connector.disconnect();
                break;
            case ROUTE.SC_GAME_DESTORY:
                connector.disconnect();
                break;
            case ROUTE.SC_TOAST:
                Cache.alertTip((msg.data && msg.data.message) || "服务器提示");
                break;
            default:
                break;
        }
    },

    buildTable() {
        this.node.setContentSize(DESIGN_SIZE);
        this.node.removeAllChildren();

        this.bg = this.makeNode("bg", this.node, cc.v2(0, 0));
        this.bg.setContentSize(DESIGN_SIZE);
        this.drawRoundRect(this.bg, -568, -320, 1136, 640, 0, cc.color(34, 117, 96), cc.color(24, 84, 70));

        let felt = this.makeNode("felt", this.node, cc.v2(0, -8));
        felt.setContentSize(940, 510);
        this.drawRoundRect(felt, -470, -255, 940, 510, 42, cc.color(20, 150, 123), cc.color(10, 96, 82));

        let glow = this.makeNode("feltLine", this.node, cc.v2(0, -8));
        glow.setContentSize(960, 530);
        let g = glow.addComponent(cc.Graphics);
        g.lineWidth = 5;
        g.strokeColor = cc.color(78, 232, 198, 160);
        g.roundRect(-480, -265, 960, 530, 48);
        g.stroke();

        this.titleLabel = this.makeLabel("斗牛", 34, cc.color(255, 238, 160), this.node, cc.v2(0, 280));
        this.roomLabel = this.makeLabel("房间号: --", 22, cc.color(255, 255, 255), this.node, cc.v2(420, 276));
        this.roundLabel = this.makeLabel("等待玩家", 24, cc.color(210, 255, 235), this.node, cc.v2(0, 240));
        this.tipLabel = this.makeLabel("", 26, cc.color(255, 235, 125), this.node, cc.v2(0, -286));
        this.clockLabel = this.makeLabel("", 34, cc.color(255, 255, 255), this.node, cc.v2(0, 50));
        this.phaseBadge = this.makeLabel("", 30, cc.color(255, 244, 150), this.node, cc.v2(0, 112));
        this.phaseBadge.node.active = false;
        this.centerBankerBadge = this.makeLabel("庄", 34, cc.color(255, 255, 255), this.node, cc.v2(0, 78));
        this.centerBankerBadge.node.active = false;
        this.drawRoundRect(this.centerBankerBadge.node, -28, -28, 56, 56, 28, cc.color(196, 66, 47), cc.color(255, 226, 120));

        this.observerBadge = this.makeLabel("你正在旁观", 22, cc.color(255, 255, 255), this.node, cc.v2(278, -108));
        this.observerBadge.node.rotation = -18;
        this.observerBadge.node.active = false;

        this.exitBtn = this.makeButton("退出", cc.v2(-505, 274), cc.size(100, 44), cc.color(106, 72, 50), () => {
            Cache.playSfx && Cache.playSfx();
            Cache.showConfirm("是否退出房间", () => {
                connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
            });
        });

        this.readyBtn = this.makeButton("准备", cc.v2(0, -72), cc.size(132, 68), cc.color(65, 205, 92), () => {
            connector.gameMessage(ROUTE.CS_GAME_READY, { plus: false, shuffle: false });
        });

        this.callButtons = [
            { label: "不抢", value: 0, color: cc.color(116, 112, 108) },
            { label: "1倍", value: 1, color: cc.color(222, 162, 48) },
            { label: "2倍", value: 2, color: cc.color(222, 162, 48) },
            { label: "3倍", value: 3, color: cc.color(222, 162, 48) },
            { label: "4倍", value: 4, color: cc.color(222, 162, 48) },
        ].map((item, index) => {
            let node = this.makeButton(item.label, cc.v2(-224 + index * 112, -72), cc.size(96, 50), item.color, () => {
                connector.gameMessage(ROUTE.CS_CALL, { value: item.value });
                this.hideActionButtons();
            });
            node.active = false;
            return node;
        });

        this.betButtons = [1, 2, 4, 5].map((value, index) => {
            let node = this.makeButton(String(value), cc.v2(-168 + index * 112, -72), cc.size(96, 50), cc.color(224, 151, 42), () => {
                connector.gameMessage(ROUTE.CS_BET, { value: value });
                this.hideActionButtons();
            });
            node.active = false;
            return node;
        });

        this.rubBtn = this.makeButton("搓牌", cc.v2(385, -142), cc.size(100, 46), cc.color(72, 190, 90), () => {
            this.revealOwnFinalCard();
        });
        this.openCardBtn = this.makeButton("开牌", cc.v2(498, -142), cc.size(100, 46), cc.color(72, 190, 90), () => {
            this.revealOwnFinalCard();
        });
        this.showOpenCardButtons(false);

        this.sitBtn = this.makeButton("坐下", cc.v2(455, -220), cc.size(118, 58), cc.color(86, 205, 84), () => {
            connector.gameMessage(ROUTE.CS_DNIU_SIT, {});
        });
        this.sitBtn.active = false;

        this.robotBtn = this.makeButton("加机器人", cc.v2(360, -220), cc.size(142, 52), cc.color(70, 138, 214), () => {
            connector.gameMessage(ROUTE.CS_DNIU_ADD_ROBOT, {});
        });
        this.robotBtn.active = false;

        this.removeRobotBtn = this.makeButton("移除机器人", cc.v2(500, -220), cc.size(158, 52), cc.color(184, 95, 74), () => {
            connector.gameMessage(ROUTE.CS_DNIU_REMOVE_ROBOT, {});
        });
        this.removeRobotBtn.active = false;

        for (let i = 0; i < this.person; i++) {
            this.seatNodes[i] = this.createSeat(i);
            this.cardLayers[i] = this.makeNode("cards-" + i, this.node, SEAT_POS_8[i]);
        }
    },

    buildDebugPanel() {
        let showDebug = cc.sys.isBrowser || GameConfig.isTest;
        if (!showDebug) return;

        this.debugPanel = this.makeNode("dniu-debug-panel", this.node, cc.v2(-394, -224));
        this.debugPanel.setContentSize(330, 104);
        this.drawRoundRect(this.debugPanel, -165, -52, 330, 104, 10, cc.color(0, 0, 0, 96), cc.color(255, 255, 255, 45));

        this.debugTitle = this.makeLabel("斗牛测试", 16, cc.color(230, 245, 255), this.debugPanel, cc.v2(-92, 18));
        this.debugSpeedLabel = this.makeLabel("速度 x1", 16, cc.color(255, 230, 120), this.debugPanel, cc.v2(0, 18));

        this.makeDebugButton("0.5x", cc.v2(-112, -12), () => this.setTimelineScale(2));
        this.makeDebugButton("1x", cc.v2(-48, -12), () => this.setTimelineScale(1));
        this.makeDebugButton("2x", cc.v2(16, -12), () => this.setTimelineScale(0.5));
        this.makeDebugButton("清牌", cc.v2(80, -12), () => this.clearCards());
        this.makeDebugButton("旁观", cc.v2(144, -12), () => this.setDebugPerspective(-1));
        this.makeDebugButton("视角1", cc.v2(-78, -42), () => this.setDebugPerspective(0));
        this.makeDebugButton("视角2", cc.v2(-14, -42), () => this.setDebugPerspective(1));
        this.makeDebugButton("视角3", cc.v2(50, -42), () => this.setDebugPerspective(2));
    },

    makeDebugButton(text, pos, cb) {
        let node = this.makeNode("debug-" + text, this.debugPanel, pos);
        node.setContentSize(54, 28);
        this.drawRoundRect(node, -27, -14, 54, 28, 6, cc.color(40, 86, 118, 210), cc.color(255, 255, 255, 80));
        this.makeLabel(text, 14, cc.color(255, 255, 255), node, cc.v2(0, 0));
        node.on(cc.Node.EventType.TOUCH_END, cb, this);
        return node;
    },

    setTimelineScale(scale) {
        this.timelineScale = scale || 1;
        let speed = Math.round((1 / this.timelineScale) * 10) / 10;
        if (this.debugSpeedLabel) this.debugSpeedLabel.string = "速度 x" + speed;
        Cache.showTipsMsg && Cache.showTipsMsg("斗牛动作速度 x" + speed);
    },

    setDebugPerspective(idx) {
        this.idx = idx;
        this.observer = idx < 0;
        this.calcRealIdx();
        this.refreshObserverUi();
        this.refreshPlayers();
        this.renderAllCards();
        Cache.showTipsMsg && Cache.showTipsMsg(idx < 0 ? "切到旁观视角" : ("切到玩家" + (idx + 1) + "视角"));
    },

    getTiming(key) {
        let value = DniuTimelineConfig[key];
        if (value == null) return 0;
        return value * (this.timelineScale || 1);
    },

    createSeat(realIdx) {
        let pos = SEAT_POS_8[realIdx];
        let seat = this.makeNode("seat-" + SEAT_NAMES[realIdx], this.node, pos);
        seat.setContentSize(realIdx == 0 ? 210 : 170, realIdx == 0 ? 118 : 96);
        let avatar = this.makeNode("avatar", seat, cc.v2(-72, realIdx == 0 ? 10 : 6));
        avatar.setContentSize(realIdx == 0 ? 54 : 42, realIdx == 0 ? 54 : 42);
        this.drawRoundRect(avatar, -avatar.width / 2, -avatar.height / 2, avatar.width, avatar.height, avatar.width / 2, cc.color(70, 96, 135), cc.color(245, 218, 128));
        let coin = this.makeLabel("体", realIdx == 0 ? 18 : 15, cc.color(255, 235, 126), avatar, cc.v2(0, 0));

        let plate = this.makeNode("plate", seat, cc.v2(0, 0));
        let plateSize = realIdx == 0 ? cc.size(180, 58) : cc.size(132, 48);
        plate.setContentSize(plateSize);
        this.drawRoundRect(plate, -plateSize.width / 2, -plateSize.height / 2, plateSize.width, plateSize.height, 24, cc.color(12, 84, 73, 210), cc.color(5, 48, 44));

        let name = this.makeLabel("空位", realIdx == 0 ? 22 : 18, cc.color(255, 245, 170), seat, cc.v2(12, realIdx == 0 ? 56 : 48));
        let wallet = this.makeLabel("", realIdx == 0 ? 18 : 15, cc.color(255, 235, 126), seat, cc.v2(20, realIdx == 0 ? 30 : 25));
        let score = this.makeLabel("", realIdx == 0 ? 22 : 20, cc.color(120, 255, 145), seat, cc.v2(0, realIdx == 0 ? -76 : -58));
        let niu = this.makeLabel("", realIdx == 0 ? 28 : 24, cc.color(255, 224, 72), seat, cc.v2(0, realIdx == 0 ? -48 : -36));
        let ready = this.makeLabel("", 20, cc.color(72, 255, 115), seat, cc.v2(20, 4));
        let banker = this.makeLabel("庄", 20, cc.color(255, 255, 255), seat, cc.v2(58, 32));
        banker.node.active = false;
        this.drawRoundRect(banker.node, -18, -18, 36, 36, 18, cc.color(196, 66, 47), cc.color(255, 226, 120));
        let bet = this.makeLabel("", realIdx == 0 ? 20 : 16, cc.color(255, 235, 126), seat, cc.v2(realIdx == 0 ? 78 : 62, -24));
        seat._nameLabel = name;
        seat._walletLabel = wallet;
        seat._scoreLabel = score;
        seat._niuLabel = niu;
        seat._readyLabel = ready;
        seat._bankerLabel = banker;
        seat._betLabel = bet;
        seat._avatarNode = avatar;
        return seat;
    },

    initTable(data) {
        if (!data || !data.options) return;
        this.idx = data.idx == null ? this.idx : data.idx;
        this.observer = data.observer || this.idx < 0;
        this.person = data.options.person || this.person || 8;
        this.status = data.status;
        this.phase = data.status == "START" ? this.phase : "WAIT";
        this.seatMapper.setContext(this.idx, this.person, this.observer);
        this.players = this.normalizePlayers(data.players || []);
        this.tablePlayers = this.players.slice();
        this.cardsByIdx = {};
        this.selfHands = [];
        this.resultsByIdx = {};
        this.cardNodesByIdx = {};
        this.calcRealIdx();
        this.roomLabel.string = "房间号: " + data.options.tableID;
        this.roundLabel.string = data.round > 0 ? ("第" + data.turn + "圈 第" + data.round + "局") : "等待玩家";
        this.setClock(data.clock);
        this.updateReadyButton();
        this.tipLabel.string = "";
        this.refreshPlayers();
        this.clearCards();
    },

    calcRealIdx() {
        this.seatMapper.setContext(this.idx, this.person, this.observer);
        this.realIdx = this.seatMapper.buildServerToViewMap();
    },

    normalizePlayers(players) {
        let list = [];
        (players || []).forEach((player) => {
            if (!player || player.idx == null) return;
            list[player.idx] = player;
        });
        return list;
    },

    onReady(data) {
        if (!data || !this.players[data.idx]) return;
        this.players[data.idx].ready = data.readyStatus || {};
        if (this.tablePlayers[data.idx]) this.tablePlayers[data.idx].ready = data.readyStatus || {};
        this.updateReadyButton();
        this.refreshPlayers();
    },

    onGameInit(data) {
        if (!data) return;
        this.status = "START";
        this.phase = data.phase || "CALL_BANKER";
        this.banker = data.banker == null ? this.banker : data.banker;
        this.selfHands = Array.isArray(data.hands) ? data.hands.slice() : [];
        this.readyBtn.active = false;
        this.roundLabel.string = "第" + data.turn + "圈 第" + data.round + "局";
        this.setClock(data.clock);
        this.mergeTablePlayers(data.players);
        this.cardsByIdx = {};
        this.updateReadyButton();
        this.refreshPlayers(this.banker);
        this.clearCards();
        this.tipLabel.string = "发牌中";
    },

    onAction(data) {
        if (!data) return;
        if (data.event == "CALL_BANKER") {
            this.phase = "CALL_BANKER";
            this.banker = data.banker == null ? this.banker : data.banker;
            this.setClock(data.clock);
            this.mergeTablePlayers(data.players);
            this.ensureBackCards(data.players, 4);
            this.refreshPlayers(this.banker);
            this.updateActionButtons();
            this.showPhaseBadge("抢庄");
            this.tipLabel.string = "抢庄中";
            return;
        }
        if (data.event == "CALL_BANKER_UPDATE") {
            this.mergeTablePlayers(data.players);
            if (data.idx == this.idx) this.hideActionButtons();
            this.refreshPlayers();
            return;
        }
        if (data.event == "CALL_BANKER_RESULT") {
            this.phase = "BANKER_RESULT";
            this.banker = data.banker == null ? this.banker : data.banker;
            this.setClock(data.clock);
            this.mergeTablePlayers(data.players);
            this.ensureBackCards(data.players, 4);
            this.refreshPlayers(this.banker);
            this.updateActionButtons();
            this.showPhaseBadge("定庄");
            this.flyBankerBadge(this.banker);
            this.tipLabel.string = "确定庄家";
            return;
        }
        if (data.event == "BET") {
            this.phase = "BET";
            this.banker = data.banker == null ? this.banker : data.banker;
            this.setClock(data.clock);
            this.mergeTablePlayers(data.players);
            this.ensureBackCards(data.players, 4);
            this.refreshPlayers(this.banker);
            this.updateActionButtons(this.banker);
            this.showPhaseBadge("下注");
            this.tipLabel.string = "下注中";
            return;
        }
        if (data.event == "BET_UPDATE") {
            this.mergeTablePlayers(data.players);
            if (data.idx == this.idx) this.hideActionButtons();
            this.refreshPlayers();
            return;
        }
        if (data.event == "BET_RESULT") {
            this.phase = "BET_RESULT";
            this.banker = data.banker == null ? this.banker : data.banker;
            this.setClock(data.clock);
            this.mergeTablePlayers(data.players);
            this.ensureBackCards(data.players, 4);
            this.refreshPlayers(this.banker);
            this.updateActionButtons();
            this.showPhaseBadge("下注完成");
            this.playBetChips(data.players || []);
            this.tipLabel.string = "下注完成";
            return;
        }
        if (data.event == "DEAL") {
            this.phase = "DEAL";
            this.showOpenCardButtons(false);
            this.banker = data.banker == null ? this.banker : data.banker;
            this.setClock(data.clock);
            this.cardsByIdx = {};
            (data.players || this.players || []).forEach((player) => {
                if (!player || player.idx == null || player.pending) return;
                if (this.seatMapper.isSelf(player.idx) && this.selfHands.length > 0) {
                    this.cardsByIdx[player.idx] = this.selfHands.slice(0, 4);
                    return;
                }
                this.cardsByIdx[player.idx] = new Array(Math.min(player.hands || 4, 4)).fill(0);
            });
            this.refreshPlayers(this.banker);
            this.showPhaseBadge("发牌");
            this.renderDealCards(4);
            this.tipLabel.string = "发牌中";
            return;
        }
        if (data.event == "FINAL_CARD") {
            this.phase = "FINAL_CARD";
            this.hideActionButtons();
            this.banker = data.banker == null ? this.banker : data.banker;
            this.setClock(data.clock);
            this.cardsByIdx = {};
            (data.players || this.players || []).forEach((player) => {
                if (!player || player.idx == null || player.pending) return;
                if (this.seatMapper.isSelf(player.idx) && this.selfHands.length > 0) {
                    this.cardsByIdx[player.idx] = this.selfHands.slice(0, 5);
                    return;
                }
                this.cardsByIdx[player.idx] = new Array(player.hands || 5).fill(0);
            });
            this.refreshPlayers(this.banker);
            this.showPhaseBadge("补牌");
            this.renderFinalCard();
            this.showOpenCardButtons(!this.observer && this.idx >= 0);
            this.tipLabel.string = "发最后一张";
            return;
        }
        if (data.event == "SHOW_CARDS") {
            this.phase = "SHOW_CARDS";
            this.showOpenCardButtons(false);
            this.onShowCards(data);
        }
    },

    onShowCards(data) {
        let wait = Math.max(0, this.dealUntil - Date.now());
        if (wait > 0) {
            this.scheduleOnce(() => this.onShowCards(data), wait / 1000);
            return;
        }
        this.cardsByIdx = {};
        this.resultsByIdx = {};
        (data.players || []).forEach((player) => {
            if (!player || player.idx == null || !player.hands || player.hands.length <= 0) return;
            this.cardsByIdx[player.idx] = player.hands || [];
            this.resultsByIdx[player.idx] = player;
        });
        this.updateReadyButton();
        this.setClock(data.clock);
        this.banker = data.banker == null ? this.banker : data.banker;
        this.refreshPlayers(this.banker);
        this.renderShowCardsWithFlip();
        this.updateActionButtons();
        this.showPhaseBadge("亮牌");
        this.tipLabel.string = "等待结算";
    },

    onRoundSummary(data) {
        data = data || {};
        this.showOpenCardButtons(false);
        this.cardsByIdx = {};
        this.selfHands = [];
        this.resultsByIdx = {};
        (data.players || []).forEach((player) => {
            player.ready = null;
            this.cardsByIdx[player.idx] = player.hands || [];
            this.resultsByIdx[player.idx] = player;
            if (this.players[player.idx]) this.players[player.idx].ready = null;
            if (this.tablePlayers[player.idx]) this.tablePlayers[player.idx].ready = null;
        });
        this.banker = data.banker == null ? this.banker : data.banker;
        this.refreshPlayers(this.banker);
        this.renderAllCards();
        this.playCoinFly(data.players || []);
        this.status = data.status || "SUMMARY";
        this.phase = "SUMMARY";
        this.setClock(data.clock);
        this.readyBtn.active = false;
        this.updateActionButtons();
        this.showPhaseBadge("结算");
        this.scheduleOnce(() => this.updateReadyButton(), this.getTiming("summaryReadyDelay"));
        this.tipLabel.string = "本局结束";
    },

    onSpectate(data) {
        data = data || {};
        this.observer = data.observer !== false;
        if (data.idx != null) {
            this.idx = data.idx;
            this.calcRealIdx();
        }
        this.refreshObserverUi();
        this.updateReadyButton();
        this.refreshPlayers();
    },

    refreshPlayers(banker) {
        banker = banker == null ? this.banker : banker;
        for (let i = 0; i < this.person; i++) {
            let real = this.realIdx[i];
            let seat = this.seatNodes[real];
            if (!seat) continue;
            let player = this.tablePlayers[i] || this.players[i];
            let result = this.resultsByIdx[i];
            let pending = player && player.pending;
            let name = player && player.prop ? player.prop.name : (player && player.name ? player.name : (result && result.name ? result.name : "空位"));
            seat.opacity = pending ? 150 : 255;
            if (this.cardLayers[real]) this.cardLayers[real].opacity = pending ? 150 : 255;
            seat._avatarNode.active = !!player;
            seat._nameLabel.string = (this.seatMapper.isSelf(i) ? "我: " : "") + name;
            seat._walletLabel.string = player && player.wallet != null ? String(Math.floor(player.wallet / 100) || player.wallet) : "";
            seat._bankerLabel.node.active = i == banker;
            seat._readyLabel.string = pending ? "下局加入" : (player && player.ready ? "已准备" : "");
            if (player && !pending && this.status == "START") {
                if (this.phase == "CALL_BANKER" || this.phase == "BANKER_RESULT") {
                    seat._betLabel.string = player.called ? (player.call ? ("抢庄 x" + player.call) : "不抢") : "";
                } else if (this.phase == "BET" || this.phase == "BET_RESULT" || this.phase == "FINAL_CARD" || this.phase == "SHOW_CARDS" || this.phase == "SUMMARY") {
                    seat._betLabel.string = player.banker ? "庄家" : (player.betDone || player.bet ? ("下注 x" + player.bet) : "");
                } else {
                    seat._betLabel.string = "";
                }
            } else {
                seat._betLabel.string = "";
            }
            seat._niuLabel.string = result && result.niu ? (result.niu.name + " x" + result.niu.multiplier) : "";
            if (result && result.scores) {
                let score = result.scores.turn || 0;
                seat._scoreLabel.string = (score >= 0 ? "+" : "") + score;
                seat._scoreLabel.node.color = score >= 0 ? cc.color(120, 255, 145) : cc.color(255, 105, 105);
            } else {
                seat._scoreLabel.string = "";
            }
        }
    },

    mergeTablePlayers(players) {
        if (!Array.isArray(players)) return;
        players.forEach((player) => {
            if (!player || player.idx == null) return;
            let current = this.tablePlayers[player.idx] || {};
            this.tablePlayers[player.idx] = {
                ...current,
                ...player,
                prop: current.prop || player.prop || (player.name ? { name: player.name } : null),
                ready: player.ready || current.ready,
                pending: player.pending || false
            };
            this.players[player.idx] = this.tablePlayers[player.idx];
        });
    },

    updateReadyButton() {
        if (!this.readyBtn) return;
        this.refreshObserverUi();
        if (this.robotBtn) {
            this.robotBtn.active = !this.observer && this.idx >= 0 && (this.status == "WAIT" || this.status == "SUMMARY");
        }
        if (this.removeRobotBtn) {
            this.removeRobotBtn.active = !this.observer && this.idx >= 0 && (this.status == "WAIT" || this.status == "SUMMARY");
        }
        if (this.observer || this.idx < 0) {
            this.readyBtn.active = false;
            return;
        }
        if (this.status == "START") {
            this.readyBtn.active = false;
            return;
        }
        let me = this.tablePlayers[this.idx] || this.players[this.idx];
        this.readyBtn.active = (this.status == "WAIT" || this.status == "SUMMARY") && !(me && me.ready);
    },

    updateActionButtons(banker) {
        this.hideActionButtons();
        if (this.observer || this.idx < 0 || this.status != "START") return;
        let me = this.tablePlayers[this.idx] || this.players[this.idx];
        if (!me || me.pending) return;
        if (this.phase == "CALL_BANKER" && !me.called) {
            (this.callButtons || []).forEach(btn => btn.active = true);
        }
        if (this.phase == "BET" && this.idx != banker && !me.betDone) {
            (this.betButtons || []).forEach(btn => btn.active = true);
        }
    },

    hideActionButtons() {
        (this.callButtons || []).forEach(btn => btn.active = false);
        (this.betButtons || []).forEach(btn => btn.active = false);
    },

    showOpenCardButtons(active) {
        active = !!active && !this.observer && this.idx >= 0;
        if (this.rubBtn) this.rubBtn.active = active;
        if (this.openCardBtn) this.openCardBtn.active = active;
    },

    refreshObserverUi() {
        let active = this.observer || this.idx < 0;
        if (this.observerBadge) this.observerBadge.node.active = active;
        if (this.sitBtn) this.sitBtn.active = active;
        if (this.robotBtn && active) this.robotBtn.active = false;
        if (this.removeRobotBtn && active) this.removeRobotBtn.active = false;
        if (active) {
            this.hideActionButtons();
            this.showOpenCardButtons(false);
        }
    },

    ensureBackCards(players, count) {
        let hasCards = false;
        Object.keys(this.cardNodesByIdx || {}).forEach((idx) => {
            if (this.cardNodesByIdx[idx] && this.cardNodesByIdx[idx].length > 0) {
                hasCards = true;
            }
        });
        (players || this.players || []).forEach((player) => {
            if (!player || player.idx == null || player.pending) return;
            let handCount = Math.min(count, player.hands || count);
            if (handCount <= 0) return;
            if (!this.cardsByIdx[player.idx] || this.cardsByIdx[player.idx].length < handCount) {
                this.cardsByIdx[player.idx] = new Array(handCount).fill(0);
            }
        });
        if (!hasCards) {
            this.renderAllCards();
        }
    },

    renderAllCards() {
        this.clearCards();
        for (let idx = 0; idx < this.person; idx++) {
            let cards = this.cardsByIdx[idx];
            if (!cards) continue;
            let real = this.realIdx[idx];
            let layer = this.cardLayers[real];
            if (!layer) continue;
            let scale = real == 0 ? 0.82 : 0.46;
            let gap = real == 0 ? 44 : 22;
            this.cardNodesByIdx[idx] = [];
            let result = this.resultsByIdx[idx];
            let liftIndex = this.getLiftIndex(cards, result);
            cards.forEach((card, i) => {
                let node = this.createCard(card, scale);
                node.setPosition((i - 2) * gap, i == liftIndex ? (real == 0 ? 18 : 10) : 0);
                layer.addChild(node);
                this.cardNodesByIdx[idx][i] = node;
            });
        }
    },

    renderShowCardsWithFlip() {
        for (let idx = 0; idx < this.person; idx++) {
            let cards = this.cardsByIdx[idx];
            if (!cards) continue;
            let real = this.realIdx[idx];
            let layer = this.cardLayers[real];
            if (!layer) continue;
            let scale = real == 0 ? 0.82 : 0.46;
            let gap = real == 0 ? 44 : 22;
            let result = this.resultsByIdx[idx];
            let liftIndex = this.getLiftIndex(cards, result);
            if (!this.cardNodesByIdx[idx]) this.cardNodesByIdx[idx] = [];

            cards.forEach((card, i) => {
                let node = this.cardNodesByIdx[idx][i];
                let finalPos = cc.v2((i - 2) * gap, i == liftIndex ? (real == 0 ? 18 : 10) : 0);
                if (!node || !node.isValid) {
                    node = this.createCard(0, scale);
                    node.setPosition(finalPos);
                    layer.addChild(node);
                    this.cardNodesByIdx[idx][i] = node;
                }
                node.stopAllActions();
                node.setPosition(finalPos);
                this.scheduleOnce(() => {
                    if (node && node.isValid) this.flipCard(node, card, scale);
                }, i * this.getTiming("showCardFlipInterval"));
            });
        }
    },

    renderDealCards(maxCards) {
        this.clearCards();
        this.dealToken += 1;
        let token = this.dealToken;
        let dealCount = 0;
        let startWorld = this.node.convertToWorldSpaceAR(cc.v2(0, 35));
        maxCards = maxCards || 5;

        for (let cardIndex = 0; cardIndex < maxCards; cardIndex++) {
            for (let idx = 0; idx < this.person; idx++) {
                let cards = this.cardsByIdx[idx];
                if (!cards || cards.length <= cardIndex) continue;
                let real = this.realIdx[idx];
                let layer = this.cardLayers[real];
                if (!layer) continue;

                let isSelf = this.seatMapper.isSelf(idx);
                let scale = real == 0 ? 0.82 : 0.46;
                let gap = real == 0 ? 44 : 22;
                let finalPos = cc.v2((cardIndex - 2) * gap, 0);
                let card = cards[cardIndex];
                let delay = dealCount * this.getTiming("dealFirstFourInterval");
                dealCount++;

                this.scheduleOnce(() => {
                    if (token !== this.dealToken) return;
                    let node = this.createCard(0, scale);
                    node.opacity = 0;
                    node.setPosition(layer.convertToNodeSpaceAR(startWorld));
                    layer.addChild(node);
                    if (!this.cardNodesByIdx[idx]) this.cardNodesByIdx[idx] = [];
                    this.cardNodesByIdx[idx][cardIndex] = node;
                    node.runAction(cc.sequence(
                        cc.spawn(
                            cc.fadeIn(this.getTiming("dealCardFadeIn")),
                            cc.moveTo(this.getTiming("dealCardFlyTime"), finalPos).easing(cc.easeSineOut()),
                            cc.scaleTo(this.getTiming("dealCardFlyTime"), scale)
                        ),
                        cc.callFunc(() => {
                            node.setPosition(finalPos);
                            node.setScale(scale);
                            node.opacity = 255;
                            if (isSelf && card) {
                                this.scheduleOnce(() => this.flipCard(node, card, scale), cardIndex * this.getTiming("cardFlipDelay"));
                            }
                        })
                    ));
                }, delay);
            }
        }
        this.dealUntil = Date.now() + Math.max(this.getTiming("dealMinBlockTime") * 1000, (dealCount * this.getTiming("dealFirstFourInterval") + this.getTiming("dealCardFlyTime") + this.getTiming("dealCardFadeIn")) * 1000);
    },

    renderFinalCard() {
        this.dealToken += 1;
        for (let idx = 0; idx < this.person; idx++) {
            let cards = this.cardsByIdx[idx];
            if (!cards || cards.length < 5) continue;
            let real = this.realIdx[idx];
            let layer = this.cardLayers[real];
            if (!layer) continue;

            let scale = real == 0 ? 0.82 : 0.46;
            let gap = real == 0 ? 44 : 22;
            let isSelf = this.seatMapper.isSelf(idx);
            if (!this.cardNodesByIdx[idx]) this.cardNodesByIdx[idx] = [];
            for (let i = 0; i < 5; i++) {
                if (this.cardNodesByIdx[idx][i]) continue;
                let isFinalSelfCard = isSelf && i == 4;
                let node = this.createCard(isFinalSelfCard ? 0 : (isSelf ? cards[i] : 0), scale);
                node.setPosition(cc.v2((i - 2) * gap, 0));
                layer.addChild(node);
                this.cardNodesByIdx[idx][i] = node;
            }
        }
        this.dealUntil = Date.now();
    },

    revealOwnFinalCard() {
        if (this.idx < 0 || !this.selfHands || this.selfHands.length < 5) return;
        let nodes = this.cardNodesByIdx[this.idx];
        if (!nodes || !nodes[4]) return;
        let real = this.realIdx[this.idx];
        let scale = real == 0 ? 0.82 : 0.46;
        this.flipCard(nodes[4], this.selfHands[4], scale);
        this.showOpenCardButtons(false);
    },

    playCoinFly(players) {
        let winner = null;
        (players || []).forEach((player) => {
            if (!winner || ((player.scores && player.scores.turn) || 0) > ((winner.scores && winner.scores.turn) || 0)) {
                winner = player;
            }
        });
        if (!winner || winner.idx == null) return;
        let targetReal = this.realIdx[winner.idx];
        let targetPos = SEAT_POS_8[targetReal] || cc.v2(0, 0);
        (players || []).forEach((player) => {
            let score = player.scores && player.scores.turn || 0;
            if (!score || player.idx == null || player.idx == winner.idx) return;
            let fromReal = this.realIdx[player.idx];
            let fromPos = SEAT_POS_8[fromReal] || cc.v2(0, 0);
            for (let i = 0; i < 5; i++) {
                let coin = this.makeNode("coin", this.node, cc.v2(fromPos.x + (i - 2) * 10, fromPos.y));
                coin.setContentSize(18, 18);
                this.drawRoundRect(coin, -9, -9, 18, 18, 9, cc.color(255, 202, 54), cc.color(255, 248, 176));
                coin.opacity = 0;
                coin.runAction(cc.sequence(
                    cc.delayTime(i * this.getTiming("coinInterval")),
                    cc.spawn(
                        cc.fadeIn(this.getTiming("coinFadeIn")),
                        cc.moveTo(this.getTiming("coinFlyTime"), cc.v2(targetPos.x, targetPos.y - 20)).easing(cc.easeSineInOut()),
                        cc.scaleTo(this.getTiming("coinFlyTime"), 0.65)
                    ),
                    cc.fadeOut(this.getTiming("coinFadeOut")),
                    cc.removeSelf()
                ));
            }
        });
    },

    flyBankerBadge(idx) {
        if (!this.centerBankerBadge || idx == null) return;
        let real = this.realIdx[idx];
        let target = SEAT_POS_8[real] || cc.v2(0, 0);
        let node = this.centerBankerBadge.node;
        node.stopAllActions();
        node.active = true;
        node.opacity = 255;
        node.setScale(1.15);
        node.setPosition(cc.v2(0, 78));
        node.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(this.getTiming("bankerAppearTime"), 1.35), cc.fadeIn(this.getTiming("bankerAppearTime"))),
            cc.delayTime(this.getTiming("bankerHoldTime")),
            cc.spawn(
                cc.moveTo(this.getTiming("bankerFlyTime"), cc.v2(target.x + 58, target.y + 32)).easing(cc.easeSineInOut()),
                cc.scaleTo(this.getTiming("bankerFlyTime"), 0.72)
            ),
            cc.fadeOut(this.getTiming("bankerFadeOutTime")),
            cc.callFunc(() => {
                node.active = false;
                this.refreshPlayers(this.banker);
            })
        ));
    },

    playBetChips(players) {
        (players || []).forEach((player, pIndex) => {
            if (!player || player.idx == null || player.idx == this.banker || !player.bet) return;
            let real = this.realIdx[player.idx];
            let start = SEAT_POS_8[real] || cc.v2(0, 0);
            let target = cc.v2(start.x * 0.82, start.y + (start.y < 0 ? 58 : -46));
            for (let i = 0; i < 3; i++) {
                let chip = this.makeNode("bet-chip", this.node, cc.v2(start.x + (i - 1) * 10, start.y + 8));
                chip.setContentSize(22, 22);
                this.drawRoundRect(chip, -11, -11, 22, 22, 11, cc.color(220, 58, 72), cc.color(255, 236, 150));
                chip.opacity = 0;
                chip.setScale(0.7);
                chip.runAction(cc.sequence(
                    cc.delayTime(pIndex * this.getTiming("chipPlayerDelay") + i * this.getTiming("chipInterval")),
                    cc.spawn(
                        cc.fadeIn(this.getTiming("chipFadeIn")),
                        cc.moveTo(this.getTiming("chipFlyTime"), cc.v2(target.x + (i - 1) * 14, target.y)).easing(cc.easeSineOut()),
                        cc.scaleTo(this.getTiming("chipFlyTime"), 1)
                    ),
                    cc.delayTime(this.getTiming("chipHoldTime")),
                    cc.fadeOut(this.getTiming("chipFadeOut")),
                    cc.removeSelf()
                ));
            }
        });
    },

    showPhaseBadge(text) {
        if (!this.phaseBadge) return;
        this.phaseBadge.string = text;
        this.phaseBadge.node.active = true;
        this.phaseBadge.node.stopAllActions();
        this.phaseBadge.node.opacity = 0;
        this.phaseBadge.node.setScale(0.8);
        this.phaseBadge.node.runAction(cc.sequence(
            cc.spawn(cc.fadeIn(0.12), cc.scaleTo(0.12, 1.12)),
            cc.scaleTo(0.08, 1),
            cc.delayTime(0.65),
            cc.fadeOut(0.25)
        ));
    },

    setClock(clock) {
        if (!this.clockLabel) return;
        this.clockEnd = clock || 0;
        this.updateClockLabel();
    },

    updateClockLabel() {
        if (!this.clockLabel) return;
        if (!this.clockEnd) {
            this.clockLabel.string = "";
            return;
        }
        let left = Math.max(0, Math.ceil((this.clockEnd - Date.now()) / 1000));
        this.clockLabel.string = left > 0 ? String(left) : "";
        if (left > 0) {
            this.scheduleOnce(() => this.updateClockLabel(), 0.25);
        }
    },

    clearCards() {
        this.dealToken += 1;
        this.cardNodesByIdx = {};
        this.cardLayers.forEach(layer => layer.removeAllChildren());
    },

    createCard(card, scale) {
        let node = this.makeNode("card", null, cc.v2(0, 0));
        node.setScale(scale || 1);
        node.setContentSize(72, 104);
        this.paintCard(node, card);
        return node;
    },

    paintCard(node, card) {
        if (!node || !node.isValid) return;
        node.removeAllChildren();
        if (!card) {
            this.drawRoundRect(node, -36, -52, 72, 104, 8, cc.color(46, 114, 182), cc.color(255, 255, 255));
            this.makeLabel("斗牛", 18, cc.color(255, 255, 255), node, cc.v2(0, 0));
            return;
        }

        let parsed = this.parseCard(card);
        let color = parsed.red ? cc.color(205, 36, 48) : cc.color(20, 24, 30);
        this.drawRoundRect(node, -36, -52, 72, 104, 8, cc.color(250, 248, 238), cc.color(205, 196, 180));
        this.makeLabel(parsed.rank, 22, color, node, cc.v2(-21, 32));
        this.makeLabel(parsed.suit, 24, color, node, cc.v2(-21, 10));
        this.makeLabel(parsed.suit, 30, color, node, cc.v2(10, -8));
    },

    flipCard(node, card, scale) {
        if (!node || !node.isValid) return;
        scale = scale || node.scale || 1;
        let half = this.getTiming("cardFlipHalfTime");
        node.stopAllActions();
        node.runAction(cc.sequence(
            cc.scaleTo(half, 0.02, scale).easing(cc.easeSineIn()),
            cc.callFunc(() => this.paintCard(node, card)),
            cc.scaleTo(half, scale, scale).easing(cc.easeSineOut())
        ));
    },

    parseCard(card) {
        let suit = Math.floor(card / 100);
        let rank = card % 100;
        let suits = ["", "♠", "♥", "♣", "♦"];
        let ranks = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        return {
            suit: suits[suit] || "?",
            rank: ranks[rank] || String(rank),
            red: suit == 2 || suit == 4
        };
    },

    getLiftIndex(cards, result) {
        let indexes = result && result.niu && result.niu.liftIndexes ? result.niu.liftIndexes : [];
        if (!indexes.length) return -1;
        let best = indexes[0];
        indexes.forEach((idx) => {
            if (idx == null || !cards[idx]) return;
            if (!cards[best] || cards[idx] % 100 > cards[best] % 100) {
                best = idx;
                return;
            }
            if (cards[idx] % 100 == cards[best] % 100 && Math.floor(cards[idx] / 100) > Math.floor(cards[best] / 100)) {
                best = idx;
            }
        });
        return best;
    },

    makeButton(text, pos, size, color, cb) {
        let node = this.makeNode("btn-" + text, this.node, pos);
        node.setContentSize(size);
        this.drawRoundRect(node, -size.width / 2, -size.height / 2, size.width, size.height, 12, color, cc.color(255, 255, 255, 90));
        this.makeLabel(text, 28, cc.color(255, 255, 255), node, cc.v2(0, 0));
        let button = node.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.08;
        button.zoomScale = 0.96;
        node.on(cc.Node.EventType.TOUCH_END, cb, this);
        return node;
    },

    makeNode(name, parent, pos) {
        let node = new cc.Node(name);
        node.setPosition(pos || cc.v2(0, 0));
        if (parent) parent.addChild(node);
        return node;
    },

    makeLabel(text, size, color, parent, pos) {
        let node = this.makeNode("label", parent, pos || cc.v2(0, 0));
        let label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = size;
        label.lineHeight = size + 8;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        node.color = color || cc.color(255, 255, 255);
        return label;
    },

    drawRoundRect(node, x, y, w, h, r, fill, stroke) {
        let g = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        g.clear();
        g.fillColor = fill;
        g.roundRect(x, y, w, h, r);
        g.fill();
        if (stroke) {
            g.lineWidth = 2;
            g.strokeColor = stroke;
            g.roundRect(x, y, w, h, r);
            g.stroke();
        }
    }
});
