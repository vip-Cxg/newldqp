const State = require('./SDHState');
const Preview = require('./SDHPreview');
const cards = require('./LogicSDH');
const connector = require('../../../Main/NetWork/Connector');
const PACK = require('../../../Main/Script/PACK');
const Cache = require('../../../Main/Script/Cache');
const utils = require('../../../Main/Script/utils');
const { GameConfig } = require('../../../GameBase/GameConfig');

const SUITS = ['—', '♠', '♥', '♣', '♦'];
const SUIT_NAMES = ['', '黑桃', '红桃', '梅花', '方块'];
const SUIT_THEMES = [
    null,
    { background: cc.color(47, 56, 77), border: cc.color(168, 184, 216) },
    { background: cc.color(169, 36, 66), border: cc.color(255, 151, 165) },
    { background: cc.color(17, 107, 75), border: cc.color(120, 229, 161) },
    { background: cc.color(160, 76, 25), border: cc.color(255, 194, 108) }
];
const SELF_RESULT_Y = -22;
const PLAYED_CARD_SCALE = 0.85;
const COLORS = {
    white: cc.color(255, 250, 233),
    gold: cc.color(255, 218, 127),
    green: cc.color(18, 100, 77),
    blue: cc.color(30, 80, 96)
};

cc.Class({
    extends: require('GameBase'),

    properties: {
        preCards: cc.Prefab,
        prePlayerInfo: cc.Prefab,
        summaryPrefab: cc.Prefab,
        autoMask: cc.Node,
        cancelAutoBtn: cc.Node
    },

    onLoad() {
        this.state = new State();
        this.selected = new Set();
        this.pending = null;
        this.winTrick = null;
        this.previewMode = cc.sys.isBrowser && typeof CC_PREVIEW !== 'undefined' && CC_PREVIEW &&
            /(?:^|[?&])sdh=1(?:&|$)/.test(window.location.search);

        const table = this.node.getChildByName('nodeTable');
        if (table) {
            const frame = name => {
                const node = table.getChildByName(name);
                const sprite = node && node.getComponent(cc.Sprite);
                return sprite && sprite.spriteFrame;
            };
            this.buttonSkins = { primary: frame('btnPlay'), tip: frame('btnTip'), secondary: frame('normalReadyBtn') || frame('btnTip') };
            const play = table.getChildByName('btnPlay');
            const title = play && play.getChildByName('desc');
            const label = title && title.getComponent(cc.Label);
            this.actionFont = label && label.font;
            table.children.forEach(node => { node.active = node.name === 'bg2'; });
        }
        ['layerRight', 'nodeTou', 'btnMask', 'cutTips', 'winMask'].forEach(name => {
            const node = this.node.getChildByName(name);
            if (node) node.active = false;
        });
        this.ui = this.panel('SDH', this.node, 0, 0);
        const top = Math.min(310, (this.node.height || 640) / 2 - 24);
        this.hud = this.label(this.ui, 0, top, '', 28, COLORS.gold);
        this.hud.node.anchorX = 0;
        this.hud.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        this.hud.overflow = cc.Label.Overflow.SHRINK;
        this.hud.enableWrapText = false;
        this.phase = this.label(this.ui, 0, top - 51, '', 24);
        this.notice = this.label(this.ui, 0, 81, '', 22, COLORS.gold);
        this.seats = this.buildSeats();
        this.trickRows = [
            this.panel('出牌-自己', this.ui, 0, -65),
            this.panel('出牌-右', this.ui, 368, 165),
            this.panel('出牌-左', this.ui, -368, 165)
        ];
        this.bidResults = this.trickRows.map(() => {
            const root = this.panel('叫庄结果', this.ui, 0, 0);
            const title = this.label(root, 0, 0, '', 38);
            if (this.actionFont) title.font = this.actionFont;
            const outline = title.node.addComponent(cc.LabelOutline);
            outline.color = cc.color(47, 23, 13);
            outline.width = 3;
            return { root, title };
        });
        this.hand = this.panel('手牌', this.ui, 0, 0);
        this.controls = this.panel('操作', this.ui, 0, -120);
        this.summaryPanel = this.panel('结算', this.node, 0, 0);
        this.summaryPanel.zIndex = 300;
        this.summaryPanel.addComponent(cc.BlockInputEvents);
        this.summaryPanel.active = false;
        this.initSDHMenu();

        this.initGameBase();
        if (this.previewMode) {
            this.preview = new Preview((route, data) => this.receive(route, data));
            this.button(this.ui, 545, 249, '模拟重连', () => {
                this.preview.reconnect();
                Cache.alertTip('已按桌面快照恢复');
            }, 135);
        } else {
            connector.emit(PACK.CS_JOIN_DONE, {});
            this.schedule(() => {
                const queue = connector._queueGameMsg;
                for (let i = 0; i < 25 && queue.length; i++) {
                    const msg = queue.shift();
                    this.receive(msg.route, msg.data);
                }
            }, 0.04);
        }
        this.schedule(() => {
            this.refreshClock();
            const size = this.handViewport();
            if (!this.handSize || size.width !== this.handSize.width || size.height !== this.handSize.height) {
                this.renderHand();
                this.renderTrick();
                this.renderSummary();
            }
        }, 0.2);
        this.renderHand();
        this.render();
    },

    // GameBase's existing menu bindings remain safe even though SDH draws its own controls.
    onStartAuto() {
        const s = this.state;
        const self = s.players[s.idx];
        if (self && !self.auto && ['CALL', 'BURY', 'START'].includes(s.status)) this.send('CS_START_AUTO', {});
    },
    cancelAuto() {
        const self = this.state.players[this.state.idx];
        if (self && self.auto) this.send('CS_CANCEL_AUTO', {});
    },
    onQuickFinish() { this.surrender(); },
    onRulePop() { Cache.alertTip('三人包牌：叫庄、选主、扣底；每墩庄家先出，闲家抓分。'); },

    buildSeats() {
        const edge = Math.min(570, (this.node.width || 1136) / 2 - 74);
        return [[-edge, -143], [edge, 137], [-edge, 137]].map(([x, y], i) => {
            const root = this.panel('座位', this.ui, x, y);
            const empty = this.label(root, 0, 20, '空座', 20);
            if (!this.prePlayerInfo) return { root, empty, view: null };
            const node = cc.instantiate(this.prePlayerInfo);
            node.parent = root;
            node.active = false;
            const view = node.getComponent('ModulePlayerHeadSDH');
            node.position = cc.v2(0, 0);
            return { root, empty, view };
        });
    },

    initSDHMenu() {
        this.topMenu = this.node.getChildByName('layerTop');
        if (!this.topMenu) return;
        this.topMenu.zIndex = 200;
        this.topMenu.active = true;
        const menu = this.topMenu.getComponent('GameMenu');
        const action = (name, fn) => {
            const node = this.topMenu.getChildByName(name);
            if (!node) return null;
            const button = node.getComponent(cc.Button);
            if (button) button.clickEvents = [];
            node.on('click', () => {
                if (menu) menu.onHideMenu();
                fn();
            }, this);
            return node;
        };
        this.menuAuto = action('autoBtn', () => this.onStartAuto());
        const settings = action('btnSet', () => this.showSet());
        const rule = action('btnRule', () => this.onRulePop());
        const exit = action('exitBtn', () => this.onExitTable());
        this.menuRows = [this.menuAuto, rule, settings, exit].filter(Boolean);
        this.layoutMenuRows();
        ['btnEnd', 'btnChat', 'btn_update'].forEach(name => {
            const node = this.topMenu.getChildByName(name);
            if (node) node.active = false;
        });
        if (this.autoMask) this.autoMask.zIndex = 190;
        if (this.cancelAutoBtn) {
            const button = this.cancelAutoBtn.getComponent(cc.Button);
            button.clickEvents = [];
            this.cancelAutoBtn.on('click', () => this.cancelAuto(), this);
        }
    },

    layoutMenuRows() {
        let y = 150;
        (this.menuRows || []).forEach(node => {
            if (node.active) { node.y = y; y -= 80; }
        });
    },

    receive(route, data) {
        data = data || {};
        if (route === 'SC_SDH_HINT') return this.receiveHint(data);
        if (route === 'SC_GAME_DESTORY') return this.leave(false);
        if (route === 'SC_PLAY_ERROR' || route === 'SC_TOAST') {
            this.pending = null;
            Cache.alertTip(data.msg || data.message || '操作未成功');
            this.renderControls();
            return;
        }
        if (route === 'SC_SYSTEM_NOTICE' || route === 'SC_GAME_CHAT') return;
        const s = this.state;
        const oldHands = s.hands;
        const oldSuit = s.trumpSuit;
        const snapshot = ['SC_GAME_DATA', 'SC_RECONNECT', 'SC_JOIN_TABLE'].indexOf(route) >= 0;
        if (route === 'SC_TRICK_END') {
            const finished = { trick: s.trick.slice(), text: this.nameOf(data.winner) + ' 收墩 +' + (data.trickScore || 0) + ' 分' };
            this.winTrick = finished;
            this.scheduleOnce(() => {
                if (this.winTrick === finished) { this.winTrick = null; this.renderTrick(); }
            }, 0.65);
        }
        s.apply(route, data);
        if (snapshot || ['SC_GAME_INIT', 'SC_SHOW_CARD', 'SC_BOTTOM', 'SC_ROUND_SUMMARY'].indexOf(route) >= 0) this.winTrick = null;
        if (snapshot || ({
            SC_GAME_READY: 'CS_GAME_READY', SC_CALL_HA: 'CS_CALL_HA',
            SC_BURY_DONE: 'CS_BURY', SC_SHOW_CARD: 'CS_PLAY_CARD',
            SC_START_AUTO: 'CS_START_AUTO', SC_CANCEL_AUTO: 'CS_CANCEL_AUTO'
        }[route] === this.pending && (data.idx === undefined || data.idx === s.idx)) ||
            route === 'SC_SURRENDER' || route === 'SC_ROUND_SUMMARY') this.pending = null;
        if (route === 'SC_CALL_TURN' || snapshot) {
            const next = s.currentBid ? s.currentBid + s.bidStep : s.minBid;
            this.bid = Math.max(s.minBid, next);
        }
        if (oldHands !== s.hands || oldSuit !== s.trumpSuit || snapshot) {
            this.selected.clear();
            this.renderHand(route === 'SC_GAME_INIT');
        }
        this.render();
        if (route === 'SC_CALL_HA' && (data.pass || data.bid > 0)) this.animateBidResult(data.idx);
        if (route === 'SC_TRUMP_INFO') this.animateBidResult(s.haIDX);
        if (!this.previewMode && route === 'SC_TRUMP_INFO' && (s.targetScore == null || !s.clock)) {
            // The current server's trump push only carries suit and banker.
            // The existing scene-sync reply includes targetScore and clocks.
            connector.emit(PACK.CS_JOIN_DONE, {});
        }
        if (route === 'SC_CALL_HA' && data.phase === 'suit' && data.auto) {
            Cache.alertTip('系统自动选主');
        }
    },

    send(route, data) {
        if (this.pending && (route !== 'CS_SURRENDER' || this.pending === route)) return;
        if (route === 'CS_CALL_HA') {
            const s = this.state;
            if (s.status !== 'CALL' || s.currentIDX !== s.idx ||
                (s.callPhase === 'bid' && (s.currentBidder === s.idx || s.callPassed[s.idx]))) return;
        }
        if (this.preview) return this.preview.send(route, data);
        this.pending = route;
        this.renderControls();
        connector.gameMessage(route, data);
        this.scheduleOnce(() => {
            if (this.pending === route) { this.pending = null; this.renderControls(); }
        }, 3);
    },

    nameOf(idx) {
        const p = this.state.players[idx];
        return p && p.prop && p.prop.name || (idx >= 0 ? '玩家 ' + (idx + 1) : '—');
    },

    panel(name, parent, x, y) {
        const node = new cc.Node(name);
        node.parent = parent;
        node.setPosition(x, y);
        return node;
    },

    label(parent, x, y, value, size, color) {
        const node = this.panel('文本', parent, x, y);
        const label = node.addComponent(cc.Label);
        label.fontSize = size;
        label.lineHeight = size + 6;
        label.string = value;
        node.color = color || COLORS.white;
        return label;
    },

    button(parent, x, y, value, action, width, skin, theme) {
        const node = this.panel(value, parent, x, y);
        const skins = this.buttonSkins || {};
        const primary = /^(出牌|准备|继续准备|叫庄|确认扣底|同意投降)/.test(value);
        const frame = skins[skin] || (primary ? skins.primary || skins.secondary : skins.secondary || skins.primary);
        const tableAction = parent === this.controls;
        const height = tableAction ? 96 : skin ? 80 : frame ? 52 : 46;
        node.setContentSize(width || (skin ? 150 : 132), height);
        const fontSize = tableAction ? 36 : skin ? 34 : 20;
        const title = this.label(node, 0, 0, value, fontSize, tableAction || skin ? cc.Color.WHITE : undefined);
        if ((tableAction || skin) && this.actionFont && !/^[♠♥♣♦]/.test(value)) {
            title.font = this.actionFont;
            title.lineHeight = fontSize + 4;
        }
        title.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        title.verticalAlign = cc.Label.VerticalAlign.CENTER;
        title.overflow = cc.Label.Overflow.SHRINK;
        title.enableWrapText = false;
        title.node.setContentSize(node.width - 18, height);
        if (frame && !theme) {
            const sprite = node.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.type = skin ? cc.Sprite.Type.SIMPLE : cc.Sprite.Type.SLICED;
            sprite.spriteFrame = frame;
            if (!skin && !tableAction) {
                const outline = title.node.addComponent(cc.LabelOutline);
                outline.color = cc.color(60, 28, 12);
                outline.width = 2;
            }
        } else {
            const g = node.addComponent(cc.Graphics);
            g.fillColor = theme ? theme.background : COLORS.green;
            g.roundRect(-node.width / 2 + 2, -height / 2 + 2, node.width - 4, height - 4, 12);
            g.fill();
            if (theme) {
                g.strokeColor = theme.border;
                g.lineWidth = 3;
                g.roundRect(-node.width / 2 + 2, -height / 2 + 2, node.width - 4, height - 4, 12);
                g.stroke();
            }
        }
        node.on(cc.Node.EventType.TOUCH_END, action, this);
        return node;
    },

    row(parent, values, width, scale, leftAligned) {
        const gap = Math.max(0, Math.min(70 * scale, (width - 90 * scale) / Math.max(1, values.length - 1)));
        const first = leftAligned ? 90 * scale / 2 : -(values.length - 1) * gap / 2;
        return values.map((value, i) => this.cardNode(parent, value, scale, first + i * gap, 0));
    },

    cardNode(parent, value, scale, x, y) {
        const node = cc.instantiate(this.preCards);
        node.parent = parent;
        node.scale = scale;
        node.setPosition(x, y);
        const sprite = node.getComponent(cc.Sprite);
        const atlas = GameConfig.PorketAtlas;
        const spriteID = value === 515 ? 65 : value === 615 ? 66 :
            value % 100 === 15 ? value + 1 : value;
        const frame = atlas && atlas.getSpriteFrame(String(spriteID));
        if (frame) sprite.spriteFrame = frame;
        else {
            const suit = Math.floor(value / 100);
            const rank = value % 100;
            this.label(node, 0, 0, suit > 4 ? (value === 515 ? '小王' : '大王') :
                SUITS[suit] + ({ 11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2' }[rank] || rank),
                22, suit === 2 || suit === 4 ? cc.color(162, 31, 33) : cc.color(20, 30, 40));
        }
        const mask = node.getChildByName('bgCardMask');
        if (mask) mask.active = false;
        return node;
    },

    canSelect() {
        const s = this.state;
        const self = s.players[s.idx];
        return !this.pending && s.idx >= 0 && !(self && self.auto) &&
            (s.status === 'BURY' && s.idx === s.haIDX && s.hands.length === 33 ||
             s.status === 'START' && s.currentIDX === s.idx && !this.winTrick);
    },

    handViewport() {
        const size = cc.winSize || this.node;
        return { width: size.width || 1136, height: size.height || 640 };
    },

    renderHand(animate) {
        this.handGesture = null;
        this.hand.destroyAllChildren();
        this.hand.removeAllChildren();
        this.sorted = cards.sortCards(this.state.hands, this.state.trumpSuit);
        this.handSize = this.handViewport();
        // Keep the score strip out of the clock, network status and menu area.
        this.hud.node.x = -this.handSize.width / 2 + 36;
        this.hud.node.setContentSize(this.handSize.width * 0.7 - 36, 38);
        const layout = this.handLayout = cards.handLayout(this.sorted.length, this.handSize.width, this.handSize.height);
        this.controls.y = layout.controlsY;
        // Reserve space for both rows the whole round. The table never shifts
        // when moving from 33 to 25 cards, or when the upper row empties.
        this.trickRows[0].y = Math.max(SELF_RESULT_Y, layout.highest - layout.lift + 125 * PLAYED_CARD_SCALE / 2 + 8);
        const sideX = Math.max(0, Math.min(320, this.handSize.width / 2 - 277));
        [1, 2].forEach(i => {
            const seat = this.seats[i];
            const avatar = seat.view && seat.view.sprHead && seat.view.sprHead.node;
            const y = avatar ? this.ui.convertToNodeSpaceAR(avatar.convertToWorldSpaceAR(cc.v2(0, 0))).y : seat.root.y;
            this.trickRows[i].setPosition(i === 1 ? sideX : -sideX, y);
        });
        this.notice.node.y = layout.controlsY + 175;
        this.handNodes = [];
        this.handRows = [];
        this.handRestY = [];
        layout.rows.forEach(row => {
            for (let col = 0; col < row.length; col++) {
                const i = row.start + col;
                const left = layout.left + col * layout.gap;
                const node = this.cardNode(this.hand, this.sorted[i], layout.scale, left + layout.cardWidth / 2,
                    row.y + (this.selected.has(i) ? layout.lift : 0));
                this.handNodes[i] = node;
                this.handRows[i] = row.start;
                this.handRestY[i] = row.y;
                if (animate) {
                    node.opacity = 0;
                    cc.tween(node).delay(i * 0.025).to(0.10, { opacity: 255 }).start();
                }
                const width = col < row.length - 1 ? layout.gap : layout.cardWidth;
                const hit = this.panel('选牌', this.hand, left + width / 2, (row.low + row.high) / 2);
                hit.handIndex = i;
                hit.setContentSize(width, row.high - row.low);
                hit.on(cc.Node.EventType.TOUCH_START, event => this.beginHandGesture(i, event), this);
                hit.on(cc.Node.EventType.TOUCH_MOVE, event => {
                    if (!this.handGesture || !this.canSelect() || this.handGesture.id !== event.getID()) return;
                    const pos = this.hand.convertToNodeSpaceAR(event.getLocation());
                    const index = cards.handIndexAt(layout, pos.x, pos.y);
                    if (index >= 0 && index !== this.handGesture.last) this.sweepHandGesture(index);
                }, this);
                hit.on(cc.Node.EventType.TOUCH_END, event => this.endHandGesture(i, event), this);
                hit.on(cc.Node.EventType.TOUCH_CANCEL, event => this.endHandGesture(null, event), this);
            }
        });
    },

    beginHandGesture(index, event) {
        if (this.handGesture || !this.canSelect()) return;
        this.handGesture = { last: index, selecting: !this.selected.has(index),
            id: event && event.getID ? event.getID() : null, marked: new Set() };
        this.sweepHandGesture(index);
    },

    sweepHandGesture(index) {
        const gesture = this.handGesture;
        const limit = this.state.status === 'BURY' ? 8 : Infinity;
        // A vertical drag moves to the new row, not through the rest of the old row.
        const last = this.handRows[gesture.last] === this.handRows[index] ? gesture.last : index;
        cards.sweepSelection(this.selected, last, index, gesture.selecting, limit).forEach(i => {
            const node = this.handNodes[i];
            if (!node) return;
            node.y = this.handRestY[i] + (this.selected.has(i) ? this.handLayout.lift : 0);
            const mask = node.getChildByName('bgCardMask');
            if (mask) mask.active = true;
            gesture.marked.add(i);
        });
        gesture.last = index;
        this.renderControls();
    },

    endHandGesture(index, event) {
        // Also accept a direct end event used by the Creator regression driver.
        if (!this.handGesture && index != null && !(event && event.getID)) this.beginHandGesture(index, event);
        const gesture = this.handGesture;
        if (!gesture || (event && event.getID && gesture.id !== event.getID())) return;
        gesture.marked.forEach(i => {
            const node = this.handNodes[i];
            const mask = node && node.getChildByName('bgCardMask');
            if (mask) mask.active = false;
        });
        this.handGesture = null;
    },

    renderTrick() {
        const s = this.state;
        this.trickRows.forEach(node => node.removeAllChildren());
        const entries = this.winTrick ? this.winTrick.trick : s.trick || [];
        entries.forEach(entry => {
            const row = this.trickRows[(entry.idx - s.idx + 3) % 3];
            if (row) this.row(row, entry.cards, 276, PLAYED_CARD_SCALE);
        });
        this.renderBidResults();
        this.notice.string = this.winTrick ? this.winTrick.text : '';
        this.renderControls();
    },

    renderBidResults() {
        const s = this.state;
        this.bidResults.forEach(({ root, title }, seat) => {
            const idx = (s.idx + seat + 3) % 3;
            const bid = s.idx >= 0 ? s.bidLabel(idx) : '';
            const trump = s.idx >= 0 ? this.trumpNotice(idx) : '';
            root.active = !!(trump || bid);
            root.setPosition(this.trickRows[seat].x, seat === 0 ? SELF_RESULT_Y : this.trickRows[seat].y);
            title.string = trump || bid;
            // Use the system font for the playing card glyphs.
            title.useSystemFont = !!trump || !this.actionFont;
            if (!trump && this.actionFont) title.font = this.actionFont;
            const theme = SUIT_THEMES[s.trumpSuit];
            title.node.color = trump ? (theme ? theme.border : COLORS.gold) : s.callPassed[idx] ? COLORS.white : COLORS.gold;
        });
    },

    trumpNotice(idx) {
        const s = this.state;
        if (idx < 0 || idx !== s.haIDX) return '';
        const choosing = s.status === 'CALL' && s.callPhase === 'suit';
        if ((choosing || s.status === 'BURY') && SUIT_NAMES[s.trumpSuit]) {
            return '主牌：' + SUITS[s.trumpSuit] + ' ' + SUIT_NAMES[s.trumpSuit];
        }
        if (choosing && s.currentIDX === idx) {
            return idx === s.idx ? '请选择主花色' : '庄家正在选主';
        }
        return '';
    },

    animateBidResult(idx) {
        const s = this.state;
        if (s.idx < 0 || !Number.isInteger(idx)) return;
        const entry = this.bidResults[(idx - s.idx + 3) % 3];
        if (!entry || !entry.root.active) return;
        if (entry.animation) entry.animation.stop();
        entry.root.scale = 0.7;
        entry.root.opacity = 180;
        entry.animation = cc.tween(entry.root).to(0.18, { scale: 1.24, opacity: 255 })
            .to(0.12, { scale: 1 });
        entry.animation.start();
    },

    render() {
        const s = this.state;
        this.hud.string = '房号 ' + (s.tableID || '—') + '   叫庄 ' + (s.haBid || s.currentBid || '—') +
            '   主 ' + (SUIT_NAMES[s.trumpSuit] ? SUITS[s.trumpSuit] + ' ' + SUIT_NAMES[s.trumpSuit] : '—') +
            '   闲家 ' + (s.opponentScore || 0) + '/' + (s.targetScore == null || !s.haBid ? '—' : s.targetScore);
        this.seats.forEach((seat, i) => {
            const idx = ((s.idx < 0 ? 0 : s.idx) + i) % 3;
            const p = s.players[idx];
            const count = i === 0 ? (s.hands || []).length : p && p.hands || 0;
            const seated = !!(p && p.prop);
            seat.empty.string = !seated ? '空座' : seat.view ? '' : this.nameOf(idx) + ' · ' + count + ' 张';
            const view = seat.view;
            if (!view) return;
            view.node.active = seated;
            if (!seated) return;
            const avatar = p.prop.head || '';
            if (view.sprHead && seat.avatar !== avatar) {
                seat.avatar = avatar;
                view.sprHead.avatarUrl = avatar;
            }
            view.lblName.string = Array.from(this.nameOf(idx)).slice(0, 8).join('') + (i === 0 ? '（自己）' : '');
            view.lblZongjifen.string = Number.isFinite(p.wallet) ? utils.formatGold(p.wallet) : '';
            view.cardContainer.active = i !== 0 && ['CALL', 'BURY', 'START'].includes(s.status);
            view.cardCount.string = String(count);
            view.cardContainer.setPosition(i === 1 ? -85 : 85, 18);
            view.playLight.active = idx === s.currentIDX && ['CALL', 'BURY', 'START'].includes(s.status);
            view.imgBanker.active = idx === s.haIDX && s.status !== 'WAIT';
            view.readyIcon.active = !!p.ready && s.status === 'WAIT';
            view.nodeAutoPlay.active = !!p.auto;
            view.sprStatus.active = !!p.offline;
            view.niaoNode.active = false;
            view.sprBaodan.active = false;
            view.clock.active = false;
        });
        const mine = s.players[s.idx];
        const playing = ['CALL', 'BURY', 'START'].includes(s.status);
        const auto = !!(playing && mine && mine.auto);
        if (this.autoMask) this.autoMask.active = auto;
        if (this.menuAuto) {
            this.menuAuto.active = !auto;
            this.menuAuto.getComponent(cc.Button).interactable = !!mine && playing && !this.pending;
            this.layoutMenuRows();
        }
        this.refreshClock();
        this.renderTrick();
        this.renderSummary();
        this.syncSurrenderVote();
    },

    refreshClock() {
        const s = this.state;
        const p = s.players[s.currentIDX];
        const deadline = s.clock || p && p.clock;
        const timer = s.currentIDX < 0 || !deadline ? '' : ' · ' + Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) + ' 秒';
        const vote = s.surrenderVote;
        const voteInfo = vote && vote.status === 'VOTE' ? '  ·  闲家投降投票 ' +
            Math.max(0, Math.ceil((vote.clock - Date.now()) / 1000)) + ' 秒' : '';
        if (this.confirmVote && this.confirmPanel && cc.isValid(this.confirmPanel, true)) {
            this.confirmPanel.getComponent('ModuleWinConfirm').lblMessage.string = '   ' + this.voteMessage(this.confirmVote);
        }
        this.phase.string = ({
            WAIT: '等待三人准备', CALL: s.callPhase === 'suit' ?
                (s.currentIDX === s.idx ? '请选择主花色' : '等待庄家选择主花色') : '叫庄竞价',
            BURY: s.idx === s.haIDX ? '请选择 8 张扣底' : '庄家正在扣底',
            START: '第 ' + (s.trickNum + (this.winTrick ? 0 : 1)) + ' 墩', SUMMARY: '本局结束'
        }[s.status] || '等待房间同步') + (s.currentIDX >= 0 ? ' · ' + this.nameOf(s.currentIDX) : '') + timer + voteInfo;
    },

    renderControls() {
        const s = this.state;
        const bar = this.controls;
        bar.setPosition(0, this.handLayout.controlsY);
        bar.destroyAllChildren();
        bar.removeAllChildren();
        const self = s.players[s.idx];
        if (!self || this.pending) return;
        const actions = [];
        const button = (text, fn, w, skin, theme) => {
            const node = this.button(bar, 0, 0, text, fn, w || 180, skin, theme);
            actions.push(node);
            return node;
        };
        const mine = s.currentIDX === s.idx && !self.auto;
        if (s.status === 'WAIT' && !self.ready && s.idx >= 0) {
            button('准备', () => this.send('CS_GAME_READY', { plus: false, shuffle: false }), 220, 'primary');
        } else if (s.status === 'CALL' && mine) {
            if (s.callPhase === 'suit') {
                SUIT_NAMES.slice(1).forEach((name, i) => button(SUITS[i + 1] + ' ' + name,
                    () => this.send('CS_CALL_HA', { suit: i + 1 }), 168, null, SUIT_THEMES[i + 1]));
            } else if (s.callPhase === 'bid' && s.currentBidder !== s.idx && !s.callPassed[s.idx]) {
                const min = Math.max(s.minBid, s.currentBid ? s.currentBid + s.bidStep : s.minBid);
                const adjust = delta => { this.bid = Math.max(min, Math.min(s.maxBid, this.bid + delta)); this.renderControls(); };
                button('不叫', () => this.send('CS_CALL_HA', { pass: true }), 184, 'tip');
                if (min <= s.maxBid) {
                    this.bid = Math.max(min, Math.min(s.maxBid, this.bid || min));
                    button('-' + s.bidStep, () => adjust(-s.bidStep), 88, 'tip');
                    const track = this.panel('叫庄滑杆', bar, 0, 0);
                    const trackHalf = 94;
                    track.setContentSize(220, 96);
                    actions.push(track);
                    button('+' + s.bidStep, () => adjust(s.bidStep), 88, 'tip');
                    const submit = button('叫庄 ' + this.bid, () => this.send('CS_CALL_HA', { bid: this.bid }), 184, 'primary');
                    const title = submit.children[0].getComponent(cc.Label);
                    const paint = track.addComponent(cc.Graphics);
                    const redraw = () => {
                        const x = min === s.maxBid ? 0 : -trackHalf + 2 * trackHalf * (this.bid - min) / (s.maxBid - min);
                        paint.clear();
                        paint.fillColor = COLORS.blue;
                        paint.roundRect(-trackHalf, -5, 2 * trackHalf, 10, 5);
                        paint.fill();
                        paint.fillColor = COLORS.gold;
                        paint.circle(x, 0, 15);
                        paint.fill();
                        title.string = '叫庄 ' + this.bid;
                    };
                    const slide = event => {
                        const x = track.convertToNodeSpaceAR(event.getLocation()).x;
                        const ratio = Math.min(1, Math.max(0, (x + trackHalf) / (2 * trackHalf)));
                        const steps = Math.floor((s.maxBid - min) / s.bidStep);
                        this.bid = min + Math.round(ratio * steps) * s.bidStep;
                        redraw();
                    };
                    track.on(cc.Node.EventType.TOUCH_START, slide);
                    track.on(cc.Node.EventType.TOUCH_MOVE, slide);
                    redraw();
                }
            }
        } else if (this.canSelect()) {
            const chosen = Array.from(this.selected).sort((a, b) => a - b).map(i => this.sorted[i]);
            const clear = () => { this.selected.clear(); this.renderHand(); this.renderControls(); };
            if (s.status === 'BURY') {
                button('提示扣底', () => this.requestHint(true), 196, 'tip');
                button('清空选择', clear, 196, 'tip');
                button('确认扣底 ' + chosen.length + '/8', () => {
                    if (chosen.length === 8) this.send('CS_BURY', { cards: chosen });
                    else Cache.alertTip('请选择 8 张牌');
                }, 238, 'primary');
            } else {
                const lead = s.trick && s.trick[0];
                button('提示', () => this.requestHint(true), undefined, 'tip');
                button('清空选择', clear, 208, 'tip');
                button('出牌', () => {
                    if (!chosen.length) return Cache.alertTip('请先选牌');
                    if (lead && chosen.length !== lead.cards.length) return Cache.alertTip('请跟出 ' + lead.cards.length + ' 张牌');
                    this.send('CS_PLAY_CARD', { cards: chosen });
                }, undefined, 'primary');
            }
        }
        const gap = 28;
        const widths = actions.map(node => node.width);
        const total = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, widths.length - 1);
        bar.scale = total ? Math.min(1, (this.handSize.width - 44) / total) : 1;
        cards.centeredActions(widths, gap).forEach((x, i) => { actions[i].x = x; });
        if (s.status === 'START' && s.trick.length && this.canSelect()) this.requestHint(false);
    },

    hintKey() {
        const s = this.state;
        return JSON.stringify([s.tableID, s.gameID, s.turn, s.status, s.idx, s.currentIDX,
            s.clock, s.trickNum, s.trumpSuit, s.hands, s.trick]);
    },

    requestHint(manual) {
        if (!this.canSelect() || !this.sorted.length) return;
        const key = this.hintKey();
        const previous = this.hint;
        if (previous && previous.key === key) {
            if (!manual) return;
            if (previous.choices) {
                if (previous.choices.length) this.applyHint(previous);
                else Cache.alertTip('暂时没有可用的提示');
                return;
            }
            if (!previous.expired) { previous.manual = true; return; }
        }
        this.hintSeq = (this.hintSeq || 0) + 1;
        const hint = this.hint = { key, requestID: this.hintSeq, manual, cursor: 0 };
        if (this.preview) this.preview.send('CS_SDH_HINT', { requestID: hint.requestID });
        else connector.gameMessage('CS_SDH_HINT', { requestID: hint.requestID });
        this.scheduleOnce(() => {
            if (this.hint !== hint || hint.choices || this.hintKey() !== hint.key || !this.canSelect()) return;
            hint.expired = true;
            if (hint.manual) Cache.alertTip('暂未收到选牌提示，请重试');
        }, 2);
    },

    receiveHint(data) {
        const hint = this.hint;
        if (!hint || hint.requestID !== data.requestID || hint.choices || hint.key !== this.hintKey() || !this.canSelect()) return;
        const s = this.state;
        const lead = s.trick[0];
        const count = s.status === 'BURY' ? 8 : lead ? lead.cards.length : 1;
        hint.choices = (Array.isArray(data.choices) ? data.choices : []).slice(0, 8)
            .filter(group => Array.isArray(group) && group.length === count && cards.hintIndices(this.sorted, group));
        if (!hint.choices.length) {
            if (hint.manual) Cache.alertTip('暂时没有可用的提示');
            return;
        }
        if (hint.manual || (data.forced === true && hint.choices.length === 1 && !this.selected.size && !this.handGesture)) {
            this.applyHint(hint);
        }
    },

    applyHint(hint) {
        const options = hint.choices;
        this.selected = cards.hintIndices(this.sorted, options[hint.cursor]) || new Set();
        hint.cursor = (hint.cursor + 1) % options.length;
        this.renderHand();
        this.renderControls();
    },

    onExitTable() {
        const s = this.state;
        if (['CALL', 'BURY', 'START'].includes(s.status)) {
            if (!(s.haIDX >= 0)) {
                Cache.alertTip('请等叫庄结束、确定庄家后再投降');
                return;
            }
            this.surrender();
            return;
        }
        this.leave();
    },

    surrender() {
        const s = this.state;
        const vote = s.surrenderVote;
        if (!['CALL', 'BURY', 'START'].includes(s.status) || s.haIDX < 0) return;
        if (vote && vote.status === 'VOTE' && s.idx !== s.haIDX) {
            if (vote.data && vote.data[s.idx] === 'wait') this.syncSurrenderVote();
            else Cache.alertTip('投降投票进行中');
        } else {
            const message = s.idx === s.haIDX ? '退出即庄家投降，并判庄家输。确定投降吗？' :
                '退出将发起闲家投降，需要另一名闲家同意。确定发起吗？';
            this.confirm(message, () => {
                if (['CALL', 'BURY', 'START'].includes(s.status) && s.haIDX >= 0 &&
                    (s.idx === s.haIDX || !s.surrenderVote || s.surrenderVote.status !== 'VOTE')) {
                    this.send('CS_SURRENDER', { allow: true });
                }
            });
        }
    },

    voteMessage(vote) {
        const seconds = Math.max(0, Math.ceil((vote.clock - Date.now()) / 1000));
        return this.nameOf(vote.idx) + ' 发起投降，是否同意？\n' + seconds + ' 秒后未操作默认同意';
    },

    syncSurrenderVote() {
        const s = this.state;
        const vote = s.surrenderVote;
        if (!['CALL', 'BURY', 'START'].includes(s.status)) {
            if (this.confirmLoad || this.confirmPanel) this.dismissConfirm();
            return;
        }
        if (!vote || vote.status !== 'VOTE' || !vote.data || vote.data[s.idx] !== 'wait') {
            if (this.confirmVote) this.dismissConfirm();
            return;
        }
        if (this.confirmVote && this.confirmVote.clock === vote.clock && this.confirmVote.idx === vote.idx &&
            (this.confirmLoad || this.confirmPanel && cc.isValid(this.confirmPanel, true))) return;
        if (this.pending === 'CS_SURRENDER' && this.confirmVote &&
            this.confirmVote.clock === vote.clock && this.confirmVote.idx === vote.idx) return;
        this.dismissConfirm();
        const submit = allow => {
            const current = s.surrenderVote;
            if (current && current.status === 'VOTE' && current.clock === vote.clock && current.idx === vote.idx &&
                current.data && current.data[s.idx] === 'wait') this.send('CS_SURRENDER', { allow });
        };
        this.confirm(this.voteMessage(vote), () => submit(true), () => submit(false), vote);
    },

    dismissConfirm() {
        this.confirmLoad = null;
        this.confirmVote = null;
        if (this.confirmPanel && cc.isValid(this.confirmPanel, true)) this.confirmPanel.destroy();
        this.confirmPanel = null;
    },

    confirm(message, yes, no, vote) {
        if (this.confirmLoad || (this.confirmPanel && cc.isValid(this.confirmPanel, true))) return;
        const load = this.confirmLoad = {};
        this.confirmVote = vote || null;
        cc.resources.load('Main/Prefab/winConfirm', cc.Prefab, (err, prefab) => {
            if (this.confirmLoad !== load || !cc.isValid(this.node, true)) return;
            this.confirmLoad = null;
            if (err) { this.confirmVote = null; Cache.alertTip('无法打开确认框，请重试'); return; }
            this.confirmPanel = cc.instantiate(prefab);
            this.confirmPanel.getComponent('ModuleWinConfirm').show('showConfirm',
                vote ? this.voteMessage(vote) : message, yes, no);
        });
    },

    renderSummary() {
        const root = this.summaryPanel;
        const size = this.handViewport();
        root.setContentSize(size.width, size.height);
        const s = this.state;
        const result = s.summary;
        root.active = !!result;
        this.ui.active = !result;
        if (!result) { this.renderedSummary = null; return; }
        const viewport = size.width + 'x' + size.height;
        if (this.renderedSummary === result && this.summaryViewport === viewport) return;
        this.renderedSummary = result;
        this.summaryViewport = viewport;
        root.destroyAllChildren();
        root.removeAllChildren();
        const skin = this.summaryPrefab && cc.instantiate(this.summaryPrefab);
        if (skin) {
            skin.parent = root;
            skin.setPosition(0, 0);
            const summary = skin.getComponent('ModuleSummarySDH');
            // Reuse Game07's artwork only. The copied controller expects PDK
            // protocol, not the SDH result, so never call its initData.
            summary.enabled = false;
            summary.summaryContent.parent.active = false;
            summary.infoContent.getChildByName('gameInfo').active = false;
            skin.getChildByName('summarySelect').active = false;
            skin.getChildByName('btnContent').active = false;
            const won = (s.idx === s.haIDX) === result.haWins;
            summary.winBg.active = !result.draw && won;
            summary.loseBg.active = !result.draw && !won;
            summary.bgMask.active = true;
        }
        const layout = cards.summaryLayout(size.width, size.height);
        const info = this.panel('本局信息', root, layout.edge - layout.infoWidth / 2, layout.infoY);
        const infoLine = (text, y, font, color) => {
            const label = this.label(info, 0, y, text, font, color);
            label.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
            label.overflow = cc.Label.Overflow.CLAMP;
            label.enableWrapText = false;
            label.node.setContentSize(layout.infoWidth, font + 8);
        };
        if (result.draw) this.label(root, 0, 115, '流局', 32, COLORS.gold);
        if (!result.draw) {
            infoLine(result.haWins ? '庄家获胜' : '闲家获胜', 0, 32, COLORS.gold);
            infoLine('叫庄 ' + result.haBid + '    主花色 ' + (SUITS[s.trumpSuit] || '—'), -38, 24);
            infoLine('闲家得分 ' + result.opponentScore + ' / ' + result.targetScore, -70, 24);
            infoLine('最后一墩：' + this.nameOf(result.lastTrickWinner), -101, 21);
            const picked = result.lastTrickWinner >= 0 && s.haIDX >= 0 && result.lastTrickWinner !== s.haIDX;
            const bottom = picked ? '抠底 ' + result.bottomScore + ' × 2 = ' + result.bottomScore * 2 + ' 分'
                : '底牌 ' + result.bottomScore + ' 分（不计入闲家）';
            this.label(root, -layout.edge + layout.bottomWidth / 2, layout.bottomY + 61, bottom, 23, COLORS.gold);
            const buried = result.buriedCards || [];
            this.row(this.panel('底牌', root, -layout.edge, layout.bottomY), buried, layout.bottomWidth, 0.72, true);
            if (!buried.length) this.label(root, -layout.edge + 61, layout.bottomY, '未扣底', 21);
            (result.players || []).forEach((entry, i) => {
                const y = layout.handY[i];
                const score = entry.scores && entry.scores.round || 0;
                const hands = entry.hands || [];
                const name = Array.from(this.nameOf(entry.idx)).slice(0, 7).join('');
                this.label(root, -layout.edge + 77, y + 15, name, 22);
                this.label(root, -layout.edge + 77, y - 17, score > 0 ? '+' + score : String(score), 25, COLORS.gold);
                this.row(this.panel('结算手牌', root, layout.handLeft, y), hands, layout.handWidth, layout.scale, true);
                if (!hands.length) this.label(root, layout.handLeft + 58, y, '已出完', 22);
            });
        }
        const next = () => {
            s.clearRound();
            this.selected.clear();
            this.renderHand();
            this.render();
            this.send('CS_GAME_READY', { plus: false, shuffle: false });
        };
        const originalButton = skin && skin.getComponent('ModuleSummarySDH').continueBtn;
        if (originalButton) {
            originalButton.parent = root;
            originalButton.name = '继续准备';
            originalButton.setPosition(0, layout.nextY);
            originalButton.active = true;
            originalButton.getComponent(cc.Button).clickEvents = [];
            originalButton.on('click', next, this);
        } else this.button(root, 0, layout.nextY, '继续准备', next, 160);
    },

    leave(notifyServer) {
        if (this.preview) {
            this.preview.reset();
            return;
        }
        if (notifyServer !== false) connector.gameMessage('CS_PLAYER_LEAVE', {});
        connector.disconnect();
        cc.director.loadScene('Lobby');
    }
});
