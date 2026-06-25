const MENU_ITEMS = [
    { key: "ALL", name: "全部游戏", color: cc.color(238, 204, 170, 255) },
    { key: "DNIU", name: "牛牛", color: cc.color(128, 146, 238, 255), seats: 8, asset: "hall/niuniu01", tableColor: cc.color(181, 44, 82, 255) },
    { key: "JH", name: "金花", color: cc.color(128, 146, 238, 255), seats: 6, asset: "hall/jh02", tableColor: cc.color(52, 91, 158, 255) },
    { key: "ZMZ", name: "捉麻子", color: cc.color(128, 146, 238, 255), seats: 2, asset: "hall/zmz03", tableColor: cc.color(170, 68, 96, 255) },
    { key: "HSMJ", name: "划水麻将", color: cc.color(128, 146, 238, 255), seats: 2, asset: "hall/hsmj05", tableColor: cc.color(48, 130, 116, 255) },
    { key: "PDK", name: "跑得快", color: cc.color(128, 146, 238, 255), seats: 2, asset: "hall/zmz03", tableColor: cc.color(170, 68, 96, 255) },
];

const TABLE_COUNT = 30;
const DESIGN = {
    top: 175,
    bottom: 96,
    menu: 150,
    tableW: 360,
    tableH: 182,
    gapX: 76,
    gapY: 52,
};

cc.Class({
    extends: cc.Component,

    properties: {
        currentGame: "ALL",
    },

    onLoad() {
        this.menuButtons = {};
        this.tableSprites = {};
        this.labelPrefab = null;
        this.tableItemPrefab = null;
        this.tablePool = [];
        this.tableData = [];
        this.poolSize = 0;
        this.firstVisibleIndex = -1;
        this.assetsReady = false;
        this.currentRuleIndex = -1;
        this.node.addComponent(cc.BlockInputEvents);
        this.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this.node.setContentSize(cc.winSize);
        this.preloadAssets(() => {
            this.assetsReady = true;
            this.build();
        });
    },

    build() {
        this.node.removeAllChildren();
        let size = cc.winSize;
        this.drawBackground(size);
        this.safeRoot = this.makeNode("SafeRoot", this.node, 0, 0, size.width, size.height);
        this.buildTop(size);
        this.buildNotice(size);
        this.buildTableScroll(size);
        this.buildMenu(size);
        this.buildBottom(size);
        this.renderTables();
    },

    preloadAssets(done) {
        let tasks = 1;
        let finish = () => {
            tasks--;
            if (tasks <= 0) done && done();
        };

        cc.loader.loadRes("Main/Prefab/HallStaticLabel", cc.Prefab, (err, prefab) => {
            if (!err && prefab) {
                this.labelPrefab = prefab;
            }
            finish();
        });

        tasks++;
        cc.loader.loadRes("Main/Prefab/HallStaticTableItem", cc.Prefab, (err, prefab) => {
            if (!err && prefab) {
                this.tableItemPrefab = prefab;
            }
            finish();
        });

        MENU_ITEMS.forEach((item) => {
            if (!item.asset || this.tableSprites[item.key]) return;
            tasks++;
            cc.loader.loadRes(item.asset, cc.SpriteFrame, (err, spriteFrame) => {
                if (!err && spriteFrame) {
                    this.tableSprites[item.key] = spriteFrame;
                }
                finish();
            });
        });
    },

    drawBackground(size) {
        let bg = this.makeNode("Bg", this.node, 0, 0, size.width, size.height);
        let g = bg.addComponent(cc.Graphics);
        g.fillColor = cc.color(20, 74, 100, 255);
        g.rect(-size.width / 2, -size.height / 2, size.width, size.height);
        g.fill();
        g.fillColor = cc.color(49, 111, 137, 255);
        g.rect(-size.width / 2, -size.height / 2 + DESIGN.bottom, size.width, size.height * 0.39);
        g.fill();
        g.fillColor = cc.color(25, 43, 65, 185);
        g.rect(-size.width / 2, -size.height / 2, size.width, DESIGN.bottom);
        g.fill();
        g.fillColor = cc.color(11, 28, 48, 85);
        for (let i = 0; i < 8; i++) {
            g.circle(-size.width / 2 + 120 + i * 230, -size.height / 2 + 95 + (i % 2) * 38, 86);
            g.fill();
        }
    },

    buildTop(size) {
        let y = size.height / 2 - 52;
        let back = this.makeRoundButton("BtnBack", this.safeRoot, -size.width / 2 + 37, y, 54, 54, "<", 38, cc.color(95, 120, 224, 255));
        back.on(cc.Node.EventType.TOUCH_END, () => this.node.destroy(), this);

        let avatar = this.makeCircle("Avatar", this.safeRoot, -size.width / 2 + 95, y, 58, cc.color(225, 235, 245, 255));
        this.makeLabel("avatarHint", avatar, "测", 23, cc.color(82, 112, 148, 255), 0, 0, 58, 58);

        this.makeRoundRect("InfoBg", this.safeRoot, -size.width / 2 + 210, y - 1, 186, 52, 25, cc.color(5, 26, 39, 128));
        this.makeLabel("LabelID", this.safeRoot, "ID:514902", 26, cc.color(255, 255, 255, 255), -size.width / 2 + 214, y + 12, 170, 28);
        this.makeLabel("LabelCoin", this.safeRoot, "金币 0", 22, cc.color(255, 229, 110, 255), -size.width / 2 + 214, y - 16, 170, 26);

        this.makeLabel("ClubName", this.safeRoot, "奇幻森林", 31, cc.color(245, 250, 255, 255), 0, y + 7, 300, 48);
        this.makeRoundRect("TitleLine", this.safeRoot, 0, y - 25, 330, 2, 1, cc.color(255, 255, 255, 95));

        this.makeRoundButton("BtnSearch", this.safeRoot, size.width / 2 - 78, y + 4, 78, 62, "查找牌桌", 18, cc.color(28, 47, 74, 170));
        this.makeRoundButton("BtnRefresh", this.safeRoot, -size.width / 2 + 340, y + 2, 96, 54, "刷新", 26, cc.color(38, 83, 120, 155));
    },

    buildNotice(size) {
        let y = size.height / 2 - 138;
        this.makeRoundRect("NoticeBar", this.safeRoot, 150, y, size.width - DESIGN.menu - 250, 38, 19, cc.color(5, 28, 42, 145));
        this.makeLabel("NoticeIcon", this.safeRoot, "喇叭", 20, cc.color(255, 233, 140, 255), -size.width / 2 + DESIGN.menu + 210, y, 70, 34);
        this.makeLabel("NoticeText", this.safeRoot, ": 代理", 24, cc.color(235, 247, 255, 255), -size.width / 2 + DESIGN.menu + 285, y, 260, 34);
    },

    buildMenu(size) {
        let startY = size.height / 2 - 178;
        MENU_ITEMS.forEach((item, index) => {
            let btn = this.makeRoundButton("GameBtn_" + item.key, this.safeRoot, -size.width / 2 + 78, startY - index * 62, 136, 52, item.name, 28, item.color);
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
        let y = -18;
        this.scrollNode = this.makeNode("TableScroll", this.safeRoot, x, y, viewW, viewH);
        let scroll = this.scrollNode.addComponent(cc.ScrollView);
        scroll.horizontal = true;
        scroll.vertical = false;
        scroll.inertia = true;
        scroll.brake = 0.75;
        this.tableScroll = scroll;
        this.scrollNode.on("scrolling", this.updateVisibleTables, this);
        this.scrollNode.on("scroll-ended", this.updateVisibleTables, this);

        let view = this.makeNode("view", this.scrollNode, 0, 0, viewW, viewH);
        view.addComponent(cc.Mask);
        scroll.content = this.makeNode("content", view, -viewW / 2, viewH / 2, viewW, viewH);
        scroll.content.setAnchorPoint(cc.v2(0, 1));
        this.tableContent = scroll.content;
    },

    buildBottom(size) {
        let y = -size.height / 2 + 39;
        this.makeRoundButton("BtnScore", this.safeRoot, -70, y, 130, 55, "战绩", 27, cc.color(14, 35, 51, 120));
        this.makeRoundButton("BtnManage", this.safeRoot, 125, y, 170, 55, "合伙人管理", 27, cc.color(14, 35, 51, 120));
        this.makeRoundButton("BtnBank", this.safeRoot, 330, y, 130, 55, "保险箱", 27, cc.color(14, 35, 51, 120));
        this.makeRoundButton("BtnQuickJoin", this.safeRoot, size.width / 2 - 145, y + 2, 220, 70, "快速加入", 34, cc.color(252, 174, 70, 255));

        this.playTypeBar = this.makeNode("RoomTabs", this.safeRoot, -size.width / 2 + DESIGN.menu + 210, -size.height / 2 + DESIGN.bottom + 21, 440, 52);
        this.renderRoomTabs();
    },

    renderRoomTabs() {
        this.playTypeBar.removeAllChildren();
        if (this.currentGame === "ALL") return;
        let rules = this.getRules(this.currentGame);
        let allBtn = this.makeRoundButton("RoomTabAll", this.playTypeBar, -128, 0, 142, 45, "所有玩法", 21, this.currentRuleIndex === -1 ? cc.color(239, 172, 78, 245) : cc.color(34, 96, 118, 150));
        allBtn.on(cc.Node.EventType.TOUCH_END, () => this.selectRule(-1), this);
        rules.forEach((rule, index) => {
            let btn = this.makeRoundButton("RoomTab_" + index, this.playTypeBar, 20 + index * 152, 0, 148, 45, rule, 21, this.currentRuleIndex === index ? cc.color(239, 172, 78, 245) : cc.color(34, 96, 118, 150));
            btn.on(cc.Node.EventType.TOUCH_END, () => this.selectRule(index), this);
        });
    },

    selectGame(key) {
        this.currentGame = key;
        this.currentRuleIndex = -1;
        this.updateMenuState();
        this.renderRoomTabs();
        this.renderTables();
    },

    selectRule(index) {
        this.currentRuleIndex = index;
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
        let gameList = this.currentGame === "ALL" ? [this.getGame("DNIU")] : [this.getGame(this.currentGame)];
        let tables = [];
        gameList.forEach((game) => {
            for (let i = 1; i <= TABLE_COUNT; i++) {
                tables.push(this.createTableData(game, i));
            }
        });

        this.tableData = tables;
        this.tableRows = 2;
        this.tableStrideX = DESIGN.tableW + DESIGN.gapX;
        this.tableStrideY = DESIGN.tableH + DESIGN.gapY;
        let cols = Math.ceil(tables.length / this.tableRows);
        let contentW = cols * this.tableStrideX + 110;
        this.tableContent.setContentSize(cc.size(contentW, this.tableContent.height));
        this.tableContent.x = -this.scrollNode.width / 2;
        this.ensureTablePool();
        this.firstVisibleIndex = -1;
        this.updateVisibleTables();
    },

    ensureTablePool() {
        if (!this.tableItemPrefab) return;
        let visibleCols = Math.ceil(this.scrollNode.width / this.tableStrideX) + 2;
        let nextPoolSize = Math.min(this.tableData.length, visibleCols * this.tableRows);
        while (this.tablePool.length < nextPoolSize) {
            let tableItem = cc.instantiate(this.tableItemPrefab);
            tableItem.setContentSize(cc.size(DESIGN.tableW, DESIGN.tableH));
            this.tableContent.addChild(tableItem);
            this.tablePool.push(tableItem);
        }
        this.poolSize = nextPoolSize;
        this.tablePool.forEach((node, index) => {
            node.active = index < this.poolSize;
        });
    },

    updateVisibleTables() {
        if (!this.tableContent || !this.tableData || !this.tableData.length) return;
        if (!this.tableItemPrefab || !this.tablePool.length) return;

        let leftOffset = -this.scrollNode.width / 2 - this.tableContent.x;
        if (leftOffset < 0) leftOffset = 0;
        let startCol = Math.max(0, Math.floor(leftOffset / this.tableStrideX) - 1);
        let startIndex = startCol * this.tableRows;
        if (startIndex === this.firstVisibleIndex) return;
        this.firstVisibleIndex = startIndex;

        for (let i = 0; i < this.poolSize; i++) {
            let dataIndex = startIndex + i;
            let node = this.tablePool[i];
            if (!node) continue;
            if (dataIndex >= this.tableData.length) {
                node.active = false;
                continue;
            }
            let table = this.tableData[dataIndex];
            let col = Math.floor(dataIndex / this.tableRows);
            let row = dataIndex % this.tableRows;
            let x = 58 + col * this.tableStrideX + DESIGN.tableW / 2;
            let y = -18 - row * this.tableStrideY - DESIGN.tableH / 2;
            node.active = true;
            node.setPosition(cc.v2(x, y));
            let component = node.getComponent("HallStaticTableItem");
            if (component) {
                component.render(table, this.tableSprites[table.game.key]);
            }
        }
    },

    createTableData(game, index) {
        let occupied = (index % game.seats) + 1;
        let isPlaying = index % 4 === 0;
        let rules = this.getRules(game.key);
        let useSelectedRule = this.currentGame !== "ALL" && this.currentGame === game.key && this.currentRuleIndex >= 0;
        let ruleIndex = useSelectedRule ? this.currentRuleIndex : (index - 1) % rules.length;
        return {
            game: game,
            name: game.name + " 测试桌 " + index,
            rule: rules[ruleIndex] || rules[0],
            occupied: occupied,
            state: isPlaying ? "游戏中" : "等待中",
            totalRound: game.key === "JH" ? 6 : 20,
            currentRound: (index * 2) % 20 + 1,
        };
    },

    createTableNode(data, x, y) {
        if (this.tableItemPrefab) {
            let tableItem = cc.instantiate(this.tableItemPrefab);
            tableItem.setPosition(cc.v2(x, y));
            tableItem.setContentSize(cc.size(DESIGN.tableW, DESIGN.tableH));
            this.tableContent.addChild(tableItem);
            let component = tableItem.getComponent("HallStaticTableItem");
            if (component) {
                component.render(data, this.tableSprites[data.game.key]);
            }
            return;
        }
        let node = this.makeNode("Table_" + data.name, this.tableContent, x, y, DESIGN.tableW, DESIGN.tableH);
        this.renderTableArt(node, data);
        this.makeLabel("Rule", node, data.rule, 24, cc.color(241, 242, 255, 255), 0, 28, 230, 30);
        this.makeLabel("Round", node, data.occupied + "人/" + data.totalRound + "局", 22, cc.color(219, 232, 123, 255), 0, 0, 220, 26);
        this.renderAvatars(node, data.game.seats, data.occupied);
    },

    renderTableArt(node, data) {
        let spriteFrame = this.tableSprites[data.game.key];
        if (!spriteFrame) {
            this.createChairs(node, data.game.seats);
            this.makeRoundRect("TableBodyShadow", node, 0, -6, 305, 78, 39, cc.color(16, 21, 39, 185));
            this.makeRoundRect("TableBody", node, 0, 8, 300, 82, 41, data.game.tableColor);
            this.makeRoundRect("TableInner", node, 0, 8, 270, 58, 29, cc.color(data.game.tableColor.r + 18, data.game.tableColor.g + 18, data.game.tableColor.b + 18, 255));
            return;
        }
        let art = this.makeNode("TableArt", node, 0, -3, 390, 210);
        let sprite = art.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
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
                { x: -146, y: 62 }, { x: -74, y: 80 }, { x: 74, y: 80 }, { x: 146, y: 62 },
                { x: -146, y: -49 }, { x: -74, y: -72 }, { x: 74, y: -72 }, { x: 146, y: -49 },
            ];
        }
        if (seats === 6) {
            return [
                { x: -142, y: 55 }, { x: 0, y: 78 }, { x: 142, y: 55 },
                { x: -142, y: -52 }, { x: 0, y: -74 }, { x: 142, y: -52 },
            ];
        }
        return [{ x: -120, y: 23 }, { x: 120, y: 23 }];
    },

    getRules(key) {
        let ruleMap = {
            DNIU: ["暗一100锅", "暗一200锅"],
            JH: ["拼三张0.5底", "拼三张1底"],
            ZMZ: ["普通桌", "高级桌"],
            HSMJ: ["划水麻将", "2人玩法"],
            PDK: ["跑得快", "15张玩法"],
        };
        return ruleMap[key] || ["所有玩法"];
    },

    getRuleName(key) {
        return this.getRules(key)[0];
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
        if (this.labelPrefab) {
            let node = cc.instantiate(this.labelPrefab);
            node.name = name;
            node.setPosition(cc.v2(x, y));
            node.setContentSize(cc.size(w, h));
            node.color = color;
            node.opacity = 255;
            node.zIndex = 100;
            parent.addChild(node);
            let label = node.getComponent(cc.Label);
            if (label) {
                label.string = text;
                label.fontSize = fontSize;
                label.lineHeight = h;
                label.enableWrapText = false;
                label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                label.verticalAlign = cc.Label.VerticalAlign.CENTER;
                label.overflow = cc.Label.Overflow.CLAMP;
            }
            let outline = node.getComponent(cc.LabelOutline);
            if (outline) {
                outline.color = cc.color(23, 33, 45, 180);
                outline.width = Math.max(1, Math.floor(fontSize / 16));
            }
            return node;
        }

        let node = this.makeNode(name, parent, x, y, w, h);
        node.color = color;
        node.opacity = 255;
        node.zIndex = 100;
        let label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = h;
        label.fontFamily = "Arial";
        label.enableWrapText = false;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.CLAMP;
        let outline = node.addComponent(cc.LabelOutline);
        outline.color = cc.color(23, 33, 45, 160);
        outline.width = Math.max(1, Math.floor(fontSize / 16));
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
