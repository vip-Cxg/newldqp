let ROUTE = require("../../../Main/Script/ROUTE");
let connector = require("../../../Main/NetWork/Connector");
let db = require("../../../Main/Script/DataBase");
let PACK = require("../../../Main/Script/PACK");
let Cache = require("../../../Main/Script/Cache");
const { GameConfig } = require("../../../GameBase/GameConfig");

const DESIGN_SIZE = cc.size(1136, 640);
const SEAT_POS_6 = [
    cc.v2(0, -210),
    cc.v2(370, -128),
    cc.v2(390, 92),
    cc.v2(0, 210),
    cc.v2(-390, 92),
    cc.v2(-370, -128)
];
const SEAT_NAMES = ["self", "rightLow", "rightHigh", "top", "leftHigh", "leftLow"];

cc.Class({
    extends: cc.Component,

    onLoad() {
        this.idx = -1;
        this.person = 6;
        this.status = "WAIT";
        this.players = [];
        this.tablePlayers = [];
        this.realIdx = [0, 1, 2, 3, 4, 5];
        this.cardsByIdx = {};
        this.resultsByIdx = {};
        this.readyNodes = [];
        this.cardLayers = [];
        this.seatNodes = [];
        this.dealToken = 0;
        this.dealUntil = 0;

        this.buildTable();
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
                if (msg.data && msg.data.event == "SHOW_CARDS") this.onShowCards(msg.data);
                break;
            case ROUTE.SC_ROUND_SUMMARY:
                this.onRoundSummary(msg.data);
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

        this.exitBtn = this.makeButton("退出", cc.v2(-505, 274), cc.size(100, 44), cc.color(106, 72, 50), () => {
            Cache.playSfx && Cache.playSfx();
            Cache.showConfirm("是否退出房间", () => {
                connector.gameMessage(ROUTE.CS_PLAYER_LEAVE, {});
            });
        });

        this.readyBtn = this.makeButton("准备", cc.v2(0, -72), cc.size(132, 68), cc.color(65, 205, 92), () => {
            connector.gameMessage(ROUTE.CS_GAME_READY, { plus: false, shuffle: false });
        });

        for (let i = 0; i < this.person; i++) {
            this.seatNodes[i] = this.createSeat(i);
            this.cardLayers[i] = this.makeNode("cards-" + i, this.node, SEAT_POS_6[i]);
        }
    },

    createSeat(realIdx) {
        let pos = SEAT_POS_6[realIdx];
        let seat = this.makeNode("seat-" + SEAT_NAMES[realIdx], this.node, pos);
        let plate = this.makeNode("plate", seat, cc.v2(0, 0));
        plate.setContentSize(172, 58);
        this.drawRoundRect(plate, -86, -29, 172, 58, 28, cc.color(12, 84, 73), cc.color(5, 48, 44));

        let name = this.makeLabel("空位", 22, cc.color(255, 245, 170), seat, cc.v2(0, 54));
        let score = this.makeLabel("", 22, cc.color(120, 255, 145), seat, cc.v2(0, -70));
        let niu = this.makeLabel("", 25, cc.color(255, 224, 72), seat, cc.v2(0, -42));
        let ready = this.makeLabel("", 22, cc.color(72, 255, 115), seat, cc.v2(0, 6));
        seat._nameLabel = name;
        seat._scoreLabel = score;
        seat._niuLabel = niu;
        seat._readyLabel = ready;
        return seat;
    },

    initTable(data) {
        if (!data || !data.options) return;
        this.idx = data.idx == null ? this.idx : data.idx;
        this.person = data.options.person || this.person || 6;
        this.status = data.status;
        this.players = data.players || [];
        this.tablePlayers = this.players.slice();
        this.cardsByIdx = {};
        this.resultsByIdx = {};
        this.calcRealIdx();
        this.roomLabel.string = "房间号: " + data.options.tableID;
        this.roundLabel.string = data.round > 0 ? ("第" + data.turn + "圈 第" + data.round + "局") : "等待玩家";
        this.updateReadyButton();
        this.tipLabel.string = "";
        this.refreshPlayers();
        this.clearCards();
        this.renderWaitCards();
    },

    calcRealIdx() {
        let self = this.idx < 0 ? 0 : this.idx;
        this.realIdx = [];
        for (let i = 0; i < this.person; i++) {
            this.realIdx[(self + i) % this.person] = i;
        }
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
        this.readyBtn.active = false;
        this.roundLabel.string = "第" + data.turn + "圈 第" + data.round + "局";
        this.mergeTablePlayers(data.players);
        this.cardsByIdx = {};
        (data.players || this.players || []).forEach((player) => {
            let idx = player.idx;
            this.cardsByIdx[idx] = idx == this.idx ? (data.hands || []) : new Array(player.hands || 5).fill(0);
        });
        this.updateReadyButton();
        this.refreshPlayers(data.banker);
        this.renderDealCards();
        this.tipLabel.string = "亮牌中...";
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
            this.cardsByIdx[player.idx] = player.hands || [];
            this.resultsByIdx[player.idx] = player;
        });
        this.updateReadyButton();
        this.refreshPlayers(data.banker);
        this.renderAllCards();
        this.tipLabel.string = "等待结算";
    },

    onRoundSummary(data) {
        data = data || {};
        this.cardsByIdx = {};
        this.resultsByIdx = {};
        (data.players || []).forEach((player) => {
            player.ready = null;
            this.cardsByIdx[player.idx] = player.hands || [];
            this.resultsByIdx[player.idx] = player;
            if (this.players[player.idx]) this.players[player.idx].ready = null;
            if (this.tablePlayers[player.idx]) this.tablePlayers[player.idx].ready = null;
        });
        this.refreshPlayers(data.banker);
        this.renderAllCards();
        this.status = data.status || "SUMMARY";
        this.readyBtn.active = false;
        this.scheduleOnce(() => this.updateReadyButton(), 1.5);
        this.tipLabel.string = "本局结束";
    },

    refreshPlayers(banker) {
        for (let i = 0; i < this.person; i++) {
            let real = this.realIdx[i];
            let seat = this.seatNodes[real];
            if (!seat) continue;
            let player = this.tablePlayers[i] || this.players[i];
            let result = this.resultsByIdx[i];
            let name = player && player.prop ? player.prop.name : (player && player.name ? player.name : (result && result.name ? result.name : "空位"));
            seat._nameLabel.string = (i == this.idx ? "我: " : "") + (i == banker ? "[庄] " : "") + name;
            seat._readyLabel.string = player && player.ready ? "已准备" : "";
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
                ready: player.ready || current.ready
            };
            this.players[player.idx] = this.tablePlayers[player.idx];
        });
    },

    updateReadyButton() {
        if (!this.readyBtn) return;
        if (this.status == "START") {
            this.readyBtn.active = false;
            return;
        }
        let me = this.tablePlayers[this.idx] || this.players[this.idx];
        this.readyBtn.active = (this.status == "WAIT" || this.status == "SUMMARY") && !(me && me.ready);
    },

    renderWaitCards() {
        (this.players || []).forEach((player, idx) => {
            if (!player || !player.prop) return;
            this.cardsByIdx[idx] = new Array(5).fill(0);
        });
        this.renderAllCards();
    },

    renderAllCards() {
        this.clearCards();
        for (let idx = 0; idx < this.person; idx++) {
            let cards = this.cardsByIdx[idx];
            if (!cards) continue;
            let real = this.realIdx[idx];
            let layer = this.cardLayers[real];
            if (!layer) continue;
            let scale = real == 0 ? 0.82 : 0.56;
            let gap = real == 0 ? 44 : 26;
            cards.forEach((card, i) => {
                let node = this.createCard(card, scale);
                node.setPosition((i - 2) * gap, 0);
                layer.addChild(node);
            });
        }
    },

    renderDealCards() {
        this.clearCards();
        this.dealToken += 1;
        let token = this.dealToken;
        let dealCount = 0;
        let startWorld = this.node.convertToWorldSpaceAR(cc.v2(0, 35));

        for (let cardIndex = 0; cardIndex < 5; cardIndex++) {
            for (let idx = 0; idx < this.person; idx++) {
                let cards = this.cardsByIdx[idx];
                if (!cards || cards.length <= cardIndex) continue;
                let real = this.realIdx[idx];
                let layer = this.cardLayers[real];
                if (!layer) continue;

                let isSelf = idx == this.idx;
                let scale = real == 0 ? 0.82 : 0.56;
                let gap = real == 0 ? 44 : 26;
                let finalPos = cc.v2((cardIndex - 2) * gap, 0);
                let card = isSelf ? cards[cardIndex] : 0;
                let delay = dealCount * 0.045;
                dealCount++;

                this.scheduleOnce(() => {
                    if (token !== this.dealToken) return;
                    let node = this.createCard(card, scale);
                    node.opacity = 0;
                    node.setPosition(layer.convertToNodeSpaceAR(startWorld));
                    layer.addChild(node);
                    node.runAction(cc.sequence(
                        cc.spawn(
                            cc.fadeIn(0.08),
                            cc.moveTo(0.2, finalPos).easing(cc.easeSineOut()),
                            cc.scaleTo(0.2, scale)
                        ),
                        cc.callFunc(() => {
                            node.setPosition(finalPos);
                            node.setScale(scale);
                            node.opacity = 255;
                        })
                    ));
                }, delay);
            }
        }
        this.dealUntil = Date.now() + Math.max(900, (dealCount * 0.045 + 0.28) * 1000);
    },

    clearCards() {
        this.dealToken += 1;
        this.cardLayers.forEach(layer => layer.removeAllChildren());
    },

    createCard(card, scale) {
        let node = this.makeNode("card", null, cc.v2(0, 0));
        node.setScale(scale || 1);
        node.setContentSize(72, 104);
        if (!card) {
            this.drawRoundRect(node, -36, -52, 72, 104, 8, cc.color(46, 114, 182), cc.color(255, 255, 255));
            this.makeLabel("斗牛", 18, cc.color(255, 255, 255), node, cc.v2(0, 0));
            return node;
        }

        let parsed = this.parseCard(card);
        let color = parsed.red ? cc.color(205, 36, 48) : cc.color(20, 24, 30);
        this.drawRoundRect(node, -36, -52, 72, 104, 8, cc.color(250, 248, 238), cc.color(205, 196, 180));
        this.makeLabel(parsed.rank, 22, color, node, cc.v2(-21, 32));
        this.makeLabel(parsed.suit, 24, color, node, cc.v2(-21, 10));
        this.makeLabel(parsed.suit, 30, color, node, cc.v2(10, -8));
        return node;
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
