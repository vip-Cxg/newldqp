const MENU_ITEMS = [
    { key: "ALL", name: "全部游戏", color: cc.color(238, 204, 170, 255) },
    { key: "DNIU", name: "牛牛", color: cc.color(128, 146, 238, 255), seats: 8, tableColor: cc.color(181, 44, 82, 255) },
    { key: "JH", name: "金花", color: cc.color(128, 146, 238, 255), seats: 6, tableColor: cc.color(52, 91, 158, 255) },
    { key: "ZMZ", name: "捉麻子", color: cc.color(128, 146, 238, 255), seats: 2, tableColor: cc.color(170, 68, 96, 255) },
    { key: "HSMJ", name: "划水麻将", color: cc.color(128, 146, 238, 255), seats: 2, tableColor: cc.color(48, 130, 116, 255) },
    { key: "PDK", name: "跑得快", color: cc.color(128, 146, 238, 255), seats: 2, tableColor: cc.color(170, 68, 96, 255) },
];

const TABLE_COUNT = 30;
const DESIGN = {
    top: 118,
    bottom: 95,
    menu: 145,
    tableW: 350,
    tableH: 180,
    gapX: 86,
    gapY: 62,
};

cc.Class({
    extends: cc.Component,

    properties: {
        currentGame: "ALL",
    },

    onLoad() {
        this.menuButtons = {};
        this.node.addComponent(cc.BlockInputEvents);
        this.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this.node.setContentSize(cc.winSize);
        this.build();
    },

    build() {
        this.node.removeAllChildren();
        let size = cc.winSize;
        this.drawBackground(size);
        this.safeRoot = this.makeNode("SafeRoot", this.node, 0, 0, size.width, size.height);
        this.buildTop(size);
        this.buildNotice(size);
        this.buildMenu(size);
        this.buildTableScroll(size);
        this.buildBottom(size);
        this.renderTables();
    },

    drawBackground(size) {
        let bg = this.makeNode("Bg", this.node, 0, 0, size.width, size.height);
        let g = bg.addComponent(cc.Graphics);
        g.fillColor = cc.color(24, 77, 104, 255);
        g.rect(-size.width / 2, -size.height / 2, size.width, size.height);
        g.fill();
        g.fillColor = cc.color(61, 118, 145, 255);
        g.rect(-size.width / 2, -size.height / 2, size.width, size.height * 0.55);
        g.fill();
        g.fillColor = cc.color(28, 44, 68, 175);
        g.rect(-size.width / 2, -size.height / 2, size.width, size.height * 0.17);
        g.fill();
        g.fillColor = cc.color(11, 28, 48, 85);
        for (let i = 0; i < 8; i++) {
            g.circle(-size.width / 2 + 120 + i * 230, -size.height / 2 + 95 + (i % 2) * 38, 86);
            g.fill();
        }
    },

    buildTop(size) {
        let y = size.height / 2 - 52;
        let back = this.makeRoundButton("BtnBack", this.safeRoot, -size.width / 2 + 39, y, 54, 54, "<", 38, cc.color(88, 119, 220, 255));
        back.on(cc.Node.EventType.TOUCH_END, () => this.node.destroy(), this);

        let avatar = this.makeCircle("Avatar", this.safeRoot, -size.width / 2 + 100, y, 58, cc.color(225, 235, 245, 255));
        this.makeLabel("avatarHint", avatar, "测", 23, cc.color(82, 112, 148, 255), 0, 0, 58, 58);

        this.makeLabel("LabelID", this.safeRoot, "ID:514902", 30, cc.color(255, 255, 255, 255), -size.width / 2 + 222, y + 16, 210, 40);
        this.makeRoundRect("CoinBg", this.safeRoot, -size.width / 2 + 228, y - 24, 215, 28, 14, cc.color(4, 29, 44, 160));
        this.makeLabel("LabelCoin", this.safeRoot, "0", 22, cc.color(255, 229, 110, 255), -size.width / 2 + 230, y - 24, 190, 28);

        this.makeLabel("ClubName", this.safeRoot, "奇幻森林", 31, cc.color(245, 250, 255, 255), 0, y + 7, 300, 48);
        this.makeRoundRect("TitleLine", this.safeRoot, 0, y - 25, 330, 2, 1, cc.color(255, 255, 255, 95));

        this.makeRoundButton("BtnSearch", this.safeRoot, size.width / 2 - 128, y + 4, 78, 62, "查找牌桌", 20, cc.color(28, 47, 74, 170));
        this.makeRoundButton("BtnRefresh", this.safeRoot, -size.width / 2 + 340, y + 2, 96, 54, "刷新", 26, cc.color(38, 83, 120, 155));
    },

    buildNotice(size) {
        let y = size.height / 2 - 138;
        this.makeRoundRect("NoticeBar", this.safeRoot, 150, y, size.width - DESIGN.menu - 250, 38, 19, cc.color(5, 28, 42, 145));
        this.makeLabel("NoticeIcon", this.safeRoot, "喇叭", 20, cc.color(255, 233, 140, 255), -size.width / 2 + DESIGN.menu + 210, y, 70, 34);
        this.makeLabel("NoticeText", this.safeRoot, ": 代理", 24, cc.color(235, 247, 255, 255), -size.width / 2 + DESIGN.menu + 285, y, 260, 34);
    },

    buildMenu(size) {
        let startY = size.height / 2 - 190;
        MENU_ITEMS.forEach((item, index) => {
            let btn = this.makeRoundButton("GameBtn_" + item.key, this.safeRoot, -size.width / 2 + 74, startY - index * 66, 136, 56, item.name, 30, item.color);
            btn.gameKey = item.key;
            btn.on(cc.Node.EventType.TOUCH_END, () => this.selectGame(item.key), this);
            this.menuButtons[item.key] = btn;
        });
        this.updateMenuState();
    },

    buildTableScroll(size) {
        let viewW = size.width - DESIGN.menu - 6;
        let viewH = size.height - DESIGN.top - DESIGN.bottom;
        let x = -size.width / 2 + DESIGN.menu + viewW / 2;
        let y = -6;
        this.scrollNode = this.makeNode("TableScroll", this.safeRoot, x, y, viewW, viewH);
        let scroll = this.scrollNode.addComponent(cc.ScrollView);
        scroll.horizontal = true;
        scroll.vertical = false;
        scroll.inertia = true;
        scroll.brake = 0.75;

        let view = this.makeNode("view", this.scrollNode, 0, 0, viewW, viewH);
        view.addComponent(cc.Mask);
        scroll.content = this.makeNode("content", view, -viewW / 2, viewH / 2, viewW, viewH);
        scroll.content.setAnchorPoint(cc.v2(0, 1));
        this.tableContent = scroll.content;
    },

    buildBottom(size) {
        let y = -size.height / 2 + 45;
        this.makeRoundButton("BtnScore", this.safeRoot, -70, y, 130, 55, "战绩", 27, cc.color(14, 35, 51, 120));
        this.makeRoundButton("BtnManage", this.safeRoot, 125, y, 170, 55, "合伙人管理", 27, cc.color(14, 35, 51, 120));
        this.makeRoundButton("BtnBank", this.safeRoot, 330, y, 130, 55, "保险箱", 27, cc.color(14, 35, 51, 120));
        this.makeRoundButton("BtnQuickJoin", this.safeRoot, size.width / 2 - 145, y + 2, 220, 70, "快速加入", 34, cc.color(252, 174, 70, 255));

        this.playTypeBar = this.makeNode("RoomTabs", this.safeRoot, -size.width / 2 + DESIGN.menu + 175, y + 5, 360, 62);
        this.renderRoomTabs();
    },

    renderRoomTabs() {
        this.playTypeBar.removeAllChildren();
        if (this.currentGame === "ALL") return;
        this.makeRoundButton("RoomTabAll", this.playTypeBar, -95, 0, 160, 52, "所有玩法", 24, cc.color(239, 172, 78, 245));
        this.makeRoundButton("RoomTabA", this.playTypeBar, 80, 0, 185, 52, this.getRuleName(this.currentGame), 24, cc.color(34, 96, 118, 170));
    },

    selectGame(key) {
        this.currentGame = key;
        this.updateMenuState();
        this.renderRoomTabs();
        this.renderTables();
    },

    updateMenuState() {
        Object.keys(this.menuButtons).forEach((key) => {
            let btn = this.menuButtons[key];
            let g = btn.getComponent(cc.Graphics);
            let selected = key === this.currentGame;
            g.clear();
            g.fillColor = selected ? cc.color(238, 204, 170, 255) : cc.color(128, 146, 238, 238);
            g.strokeColor = cc.color(235, 238, 255, 210);
            g.lineWidth = 2;
            g.roundRect(-btn.width / 2, -btn.height / 2, btn.width, btn.height, 7);
            g.fill();
            g.stroke();
            btn.getChildByName("Label").color = selected ? cc.color(109, 79, 55, 255) : cc.color(255, 255, 255, 255);
        });
    },

    renderTables() {
        this.tableContent.removeAllChildren();
        let gameList = this.currentGame === "ALL" ? MENU_ITEMS.filter((item) => item.key !== "ALL") : [this.getGame(this.currentGame)];
        let tables = [];
        gameList.forEach((game) => {
            for (let i = 1; i <= TABLE_COUNT; i++) {
                tables.push(this.createTableData(game, i));
            }
        });

        let rows = 2;
        let cols = Math.ceil(tables.length / rows);
        let contentW = cols * (DESIGN.tableW + DESIGN.gapX) + 120;
        this.tableContent.setContentSize(cc.size(contentW, this.tableContent.height));
        tables.forEach((table, index) => {
            let col = Math.floor(index / rows);
            let row = index % rows;
            let x = 70 + col * (DESIGN.tableW + DESIGN.gapX) + DESIGN.tableW / 2;
            let y = -20 - row * (DESIGN.tableH + DESIGN.gapY) - DESIGN.tableH / 2;
            this.createTableNode(table, x, y);
        });
    },

    createTableData(game, index) {
        let occupied = (index * 3 + game.key.length) % (game.seats + 1);
        let isPlaying = index % 4 === 0;
        return {
            game: game,
            name: game.name + " 测试桌 " + index,
            rule: this.getRuleName(game.key),
            occupied: occupied,
            state: isPlaying ? "游戏中" : "等待中",
            totalRound: game.key === "JH" ? 6 : 20,
            currentRound: (index * 2) % 20 + 1,
        };
    },

    createTableNode(data, x, y) {
        let node = this.makeNode("Table_" + data.name, this.tableContent, x, y, DESIGN.tableW, DESIGN.tableH);
        this.createChairs(node, data.game.seats);
        this.makeRoundRect("TableBodyShadow", node, 0, -6, 305, 78, 39, cc.color(16, 21, 39, 185));
        this.makeRoundRect("TableBody", node, 0, 8, 300, 82, 41, data.game.tableColor);
        this.makeRoundRect("TableInner", node, 0, 8, 270, 58, 29, cc.color(data.game.tableColor.r + 18, data.game.tableColor.g + 18, data.game.tableColor.b + 18, 255));
        this.makeLabel("Rule", node, data.rule, 24, cc.color(241, 242, 255, 255), 0, 26, 230, 30);
        this.makeLabel("Round", node, data.occupied + "人/" + data.totalRound + "局", 22, cc.color(219, 232, 123, 255), 0, -3, 220, 26);
        this.makeLabel("Title", node, data.name, 24, cc.color(255, 255, 255, 255), 0, -72, 270, 34);
        this.makeRoundRect("Warn", node, 142, 9, 34, 50, 17, cc.color(70, 48, 65, 215));
        this.makeLabel("WarnText", node, "!", 32, cc.color(255, 235, 104, 255), 142, 10, 34, 45);
        this.renderAvatars(node, data.game.seats, data.occupied);
        let statusColor = data.state === "游戏中" ? cc.color(165, 30, 50, 235) : cc.color(39, 123, 79, 235);
        this.makeRoundRect("StatusBg", node, 0, 66, 112, 30, 15, statusColor);
        this.makeLabel("Status", node, data.state, 20, cc.color(118, 255, 158, 255), 0, 66, 106, 30);
    },

    createChairs(node, seats) {
        let positions = this.getSeatPositions(seats);
        positions.forEach((pos, index) => {
            let chair = this.makeRoundRect("Chair_" + index, node, pos.x, pos.y - 16, 42, 62, 16, cc.color(96, 55, 50, 230));
            chair.angle = pos.angle || 0;
        });
    },

    renderAvatars(node, seats, occupied) {
        let positions = this.getSeatPositions(seats);
        positions.forEach((pos, index) => {
            if (index >= occupied) return;
            let avatar = this.makeCircle("Avatar_" + index, node, pos.x, pos.y + 16, 48, cc.color(228, 238, 252, 255));
            this.makeLabel("AvatarName_" + index, avatar, "测" + (index + 1), 14, cc.color(35, 45, 55, 255), 0, -3, 44, 22);
        });
    },

    getSeatPositions(seats) {
        if (seats === 8) {
            return [
                { x: -128, y: 64 }, { x: -58, y: 82 }, { x: 58, y: 82 }, { x: 128, y: 64 },
                { x: -128, y: -48 }, { x: -58, y: -70 }, { x: 58, y: -70 }, { x: 128, y: -48 },
            ];
        }
        if (seats === 6) {
            return [
                { x: -128, y: 55 }, { x: 0, y: 78 }, { x: 128, y: 55 },
                { x: -128, y: -52 }, { x: 0, y: -74 }, { x: 128, y: -52 },
            ];
        }
        return [{ x: -118, y: 18 }, { x: 118, y: 18 }];
    },

    getRuleName(key) {
        let ruleMap = {
            DNIU: "暗一100锅",
            JH: "拼三张0.5底",
            ZMZ: "普通桌",
            HSMJ: "划水麻将",
            PDK: "跑得快",
        };
        return ruleMap[key] || "所有玩法";
    },

    getGame(key) {
        for (let i = 0; i < MENU_ITEMS.length; i++) {
            if (MENU_ITEMS[i].key === key) return MENU_ITEMS[i];
        }
        return MENU_ITEMS[1];
    },

    makeNode(name, parent, x, y, w, h) {
        let node = new cc.Node(name);
        node.setPosition(cc.v2(x, y));
        node.setContentSize(cc.size(w, h));
        parent.addChild(node);
        return node;
    },

    makeLabel(name, parent, text, fontSize, color, x, y, w, h) {
        let node = this.makeNode(name, parent, x, y, w, h);
        node.color = color;
        let label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = h;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.SHRINK;
        return node;
    },

    makeRoundButton(name, parent, x, y, w, h, text, fontSize, color) {
        let node = this.makeRoundRect(name, parent, x, y, w, h, Math.min(12, h / 2), color);
        node.addComponent(cc.Button);
        this.makeLabel("Label", node, text, fontSize, cc.color(255, 255, 255, 255), 0, 0, w - 8, h);
        return node;
    },

    makeRoundRect(name, parent, x, y, w, h, radius, color) {
        let node = this.makeNode(name, parent, x, y, w, h);
        let g = node.addComponent(cc.Graphics);
        g.fillColor = color;
        g.strokeColor = cc.color(255, 255, 255, 60);
        g.lineWidth = 2;
        g.roundRect(-w / 2, -h / 2, w, h, radius);
        g.fill();
        g.stroke();
        return node;
    },

    makeCircle(name, parent, x, y, size, color) {
        let node = this.makeNode(name, parent, x, y, size, size);
        let g = node.addComponent(cc.Graphics);
        g.fillColor = color;
        g.circle(0, 0, size / 2);
        g.fill();
        g.fillColor = cc.color(174, 190, 216, 255);
        g.circle(0, 8, size / 5);
        g.fill();
        g.circle(0, -12, size / 3);
        g.fill();
        return node;
    },
});
