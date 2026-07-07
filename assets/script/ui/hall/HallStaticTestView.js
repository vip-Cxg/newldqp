const { GameConfig } = require("../../../GameBase/GameConfig");
const Connector = require("../../../Main/NetWork/Connector");
const Cache = require("../../../Main/Script/Cache");
const DataBase = require("../../../Main/Script/DataBase");
const utils = require("../../../Main/Script/utils");
const GameUtilsModule = require("../../common/GameUtils");
const GameUtils = GameUtilsModule.default || GameUtilsModule;
const { App } = require("./data/App");

const MENU_ITEMS = [
    { key: "ALL", name: "全部游戏", icon: "hall/quanbuyouxi", color: cc.color(238, 204, 170, 255) },
    { key: "DNIU", name: "牛牛", icon: "hall/niuniu", color: cc.color(128, 146, 238, 255), seats: 8, asset: "hall/niuniu01", tableColor: cc.color(181, 44, 82, 255) },
    { key: "JH", name: "金花", icon: "hall/jinhua", color: cc.color(128, 146, 238, 255), seats: 6, asset: "hall/jh02", tableColor: cc.color(52, 91, 158, 255) },
    { key: "HSMJ", name: "划水麻将", icon: "hall/huashuimaj", color: cc.color(128, 146, 238, 255), seats: 2, asset: "hall/hsmj05", tableColor: cc.color(48, 130, 116, 255) },
    { key: "PDK", name: "跑得快", icon: "hall/paodekuai", color: cc.color(128, 146, 238, 255), seats: 2, asset: "hall/zmz03", tableColor: cc.color(170, 68, 96, 255) },
    { key: "ZMZ", name: "捉麻子", icon: "hall/zuomazi", hiddenInStaticHall: true, color: cc.color(128, 146, 238, 255), seats: 2, asset: "hall/zmz03", tableColor: cc.color(170, 68, 96, 255) },
];

const TABLE_COUNT = 30;
const DESIGN = {
    top: 175,
    bottom: 84,
    menu: 128,
    tableLeft: 142,
    tableRight: 8,
    tableW: 360,
    tableH: 182,
    gapX: 44,
    gapY: 42,
    menuBtnW: 92,
    menuBtnH: 93,
};

const HALL_UI = {
    bg: "hall/bgHall",
    back: "hall/fanhui",
    avatar: "hall/touxiang",
    avatarFill: "head/common_moren",
    coin: "hall/game_coin",
    clubTitle: "hall/julebudi",
    refresh: "hall/shuaxin",
    message: "hall/xiaoxi",
    setting: "hall/sehzhi",
    score: "hall/zhanjitongji",
    manage: "hall/jinyinfenxi",
    bank: "hall/baoxianxiang",
    quick: "hall/kuaisujiaru",
    ruleNormal: "hall/suoyouwanan",
    ruleSelected: "hall/suoyouwanfadi",
};

cc.Class({
    extends: cc.Component,

    properties: {
        currentGame: "ALL",
        leagueAnalysisViewPrefab: cc.Prefab,
    },

    onLoad() {
        this.node.opacity = 0;
        this.menuButtons = {};
        this.tableSprites = {};
        this.uiSprites = {};
        this.menuSprites = {};
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
            this.node.opacity = 255;
        });
    },

    build() {
        let size = cc.winSize;
        if (this.node.getChildByName("BgLayer")) {
            this.buildPrefabLayout(size);
            return;
        }

        this.node.removeAllChildren();
        this.drawBackground(size);
        this.safeRoot = this.makeNode("SafeRoot", this.node, 0, 0, size.width, size.height);
        this.buildTop(size);
        this.buildNotice(size);
        this.buildTableScroll(size);
        this.buildMenu(size);
        this.buildBottom(size);
        this.renderTables();
    },

    buildPrefabLayout(size) {
        this.safeRoot = this.node;
        this.node.setContentSize(size);
        this.resizeNode(this.getNode("BgLayer"), 0, 0, size.width, size.height);
        this.resizeNode(this.getNode("BgLayer/BgImage"), 0, 0, size.width, size.height);
        this.applySprite("BgLayer/BgImage", "bg", size.width, size.height);
        this.resizeNode(this.getNode("BgLayer/TopTint"), 0, size.height / 2 - 52, size.width, 104);
        let ref = this.getNode("大厅效果");
        if (ref) ref.active = false;

        this.bindTopPrefab(size);
        this.bindNoticePrefab(size);
        this.bindMenuPrefab(size);
        this.bindTableScrollPrefab(size);
        this.bindBottomPrefab(size);
        this.updateMenuState();
        this.renderTables();
    },

    bindTopPrefab(size) {
        let top = this.getNode("TopBar");
        if (top) this.resizeNode(top, 0, size.height / 2 - 54, size.width, 108);
        this.drawPanel(this.getNode("TopBar/InfoBg"), cc.color(0, 0, 0, 95), 0);
        this.applySprite("TopBar/BtnBack", "back", 77, 77);
        this.applySprite("TopBar/ClubTitle/julebudi", "clubTitle", 382, 70);
        this.applySprite("TopBar/BtnRefresh", "refresh", 76, 90);
        this.applySprite("TopBar/BtnMessage", "message", 76, 90);
        this.applySprite("TopBar/BtnSetting", "setting", 76, 90);
        this.resizeNode(this.getNode("TopBar/BtnBack"), this.leftX(53), 10, 77, 77);
        this.bindUserInfoPrefab();
        this.resizeNode(this.getNode("TopBar/InfoBg"), this.leftX(239), 10, 250, 74);
        this.resizeNode(this.getNode("TopBar/ClubTitle"), 16, 5, 382, 70);
        this.resizeNode(this.getNode("TopBar/ClubTitle/julebudi"), 0, 0, 382, 70);
        this.resizeNode(this.getNode("TopBar/BtnRefresh"), size.width / 2 - 368, 4, 76, 90);
        this.resizeNode(this.getNode("TopBar/BtnMessage"), size.width / 2 - 210, 4, 76, 90);
        this.resizeNode(this.getNode("TopBar/BtnSetting"), size.width / 2 - 62, 4, 76, 90);
        this.bindTouch("TopBar/BtnBack", () => this.node.destroy());
        this.bindTouch("TopBar/BtnRefresh", () => this.renderTables(), true);
        this.bindTouch("TopBar/BtnMessage", () => {}, true);
        this.bindTouch("TopBar/BtnSetting", () => {}, true);
        this.resizeNode(this.getNode("TopBar/ClubTitle/Label"), 0, 2, 310, 48);
        this.refreshTopRealData();
        this.refreshClubInfoForTop();
    },

    bindUserInfoPrefab() {
        let userInfo = this.getNode("TopBar/UserInfo");
        if (!userInfo) return;
        userInfo.active = true;
        userInfo.opacity = 255;
        let infoBg = this.getNode("TopBar/UserInfo/InfoBg");
        if (infoBg) infoBg.active = false;
        this.drawPanel(this.getNode("TopBar/UserInfo/CoinBg"), cc.color(0, 0, 0, 135), 16);
        let coinIconPath = this.getNode("TopBar/UserInfo/CoinBg/CoinIcon");
        let coinLabelPath = this.getNode("TopBar/UserInfo/CoinBg/LabelCoin");
        this.resizeNode(userInfo, this.leftX(242), 10, 360, 90);
        this.resizeNode(this.getNode("TopBar/UserInfo/AvatarRoot"), -93.718, 0, 76, 76);
        this.resizeNode(this.getNode("TopBar/UserInfo/AvatarRoot/AvatarMask"), 0, 0, 66, 66);
        this.resizeNode(this.getNode("TopBar/UserInfo/AvatarRoot/AvatarMask/AvatarSprite"), 0, 0, 58, 58);
        this.resizeNode(this.getNode("TopBar/UserInfo/AvatarRoot/AvatarFrame"), 0, 0, 66, 66);
        this.resizeNode(this.getNode("TopBar/UserInfo/LabelID"), 34, 13, 220, 36);
        this.resizeNode(this.getNode("TopBar/UserInfo/CoinBg"), 26, -18, 168, 34);
        this.resizeNode(coinIconPath, -54, 0, 28, 28);
        this.resizeNode(coinLabelPath, 28, 0, 104, 28);
        this.applySprite("TopBar/UserInfo/AvatarRoot/AvatarMask/AvatarSprite", "avatarFill", 58, 58);
        this.applySprite("TopBar/UserInfo/AvatarRoot/AvatarFrame", "avatar", 66, 66);
        this.applySprite(coinIconPath, "coin", 28, 28);
        this.styleLabel("TopBar/UserInfo/LabelID", 22, cc.color(255, 255, 255, 255), 24);
        this.styleCoinLabel(coinLabelPath, 20, cc.color(255, 231, 120, 255), 22);
        let zMap = {
            InfoBg: 0,
            AvatarRoot: 10,
            LabelID: 20,
            CoinBg: 20,
        };
        Object.keys(zMap).forEach((name) => {
            let node = userInfo.getChildByName(name);
            if (node) node.zIndex = zMap[name];
        });

    },

    refreshTopRealData() {
        let player = DataBase.player || {};
        let clubName = this.getCurrentClubName();
        let playerID = player.id || player.userID || player.pid || "";
        let coinValue = !utils.isNullOrEmpty(player.card) ? player.card : (!utils.isNullOrEmpty(player.score) ? player.score : 0);

        this.setNodeLabel("TopBar/ClubTitle/Label", clubName);
        this.setNodeLabel("TopBar/UserInfo/LabelID", playerID ? "ID:" + playerID : "ID:--");
        this.setNodeLabel("TopBar/UserInfo/CoinBg/LabelCoin", this.ellipsisText(this.formatTopCoin(coinValue), 10));
        this.setTopAvatar(player.head);

        let fallbackID = this.getNode("LabelID", this.safeRoot);
        if (fallbackID) fallbackID.getComponent(cc.Label).string = playerID ? "ID:" + playerID : "ID:--";
        let fallbackCoin = this.getNode("LabelCoin", this.safeRoot);
        if (fallbackCoin) fallbackCoin.getComponent(cc.Label).string = "金币 " + this.ellipsisText(this.formatTopCoin(coinValue), 10);
        let fallbackClubName = this.getNode("ClubName", this.safeRoot);
        if (fallbackClubName) fallbackClubName.getComponent(cc.Label).string = clubName;
    },

    refreshClubInfoForTop() {
        if (this._loadingTopClubInfo || App.Club.CurrentClubID == -1) return;
        this._loadingTopClubInfo = true;
        Connector.request(GameConfig.ServerEventName.ClubInfo, { clubID: App.Club.CurrentClubID }, (res) => {
            this._loadingTopClubInfo = false;
            if (res && res.club) {
                if (res.club.club && res.club.club.name) {
                    App.Club.ClubName = res.club.club.name;
                }
                if (res.club.role) {
                    App.Club.CurrentClubRole = res.club.role;
                }
            }
            if (res && res.rooms) {
                GameConfig.TableAllRooms = GameUtils.deepcopyArr(res.rooms || []);
            }
            this.refreshTopRealData();
        }, false, () => {
            this._loadingTopClubInfo = false;
            this.refreshTopRealData();
        });
    },

    getCurrentClubName() {
        if (!utils.isNullOrEmpty(App.Club.ClubName)) return App.Club.ClubName;
        let clubData = App.Club.CurrentClubData || {};
        if (clubData.club && clubData.club.name) return clubData.club.name;
        if (clubData.name) return clubData.name;
        return App.Club.IsLeague ? "本地测试大联盟" : "本地俱乐部";
    },

    formatTopCoin(value) {
        if (utils.isNullOrEmpty(value)) return "0";
        let num = Number(value);
        if (isNaN(num)) return "" + value;
        if (Math.abs(num - Math.floor(num)) < 0.0001) return "" + Math.floor(num);
        return ("" + parseFloat(num.toFixed(2)));
    },

    setTopAvatar(head) {
        let node = this.getNode("TopBar/UserInfo/AvatarRoot/AvatarMask/AvatarSprite");
        if (!node || utils.isNullOrEmpty(head)) return;
        let sprite = node.getComponent(cc.Sprite);
        if (!sprite) return;
        let url = head;
        if (url.indexOf("://") === -1) {
            url = GameConfig.HeadUrl + url;
        }
        if (utils.isNullOrEmpty(url)) return;
        if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
            url += url.indexOf("?") === -1 ? "?file=a.png" : "";
            cc.loader.load(url, (err, tex) => {
                if (err || !cc.isValid(node)) return;
                try {
                    sprite.spriteFrame = new cc.SpriteFrame(tex);
                } catch (e) {
                    this.applySprite(node, "avatarFill", 58, 58);
                }
            });
            return;
        }
        if (url.indexOf("file://") === 0 && GameConfig.AvatartAtlas) {
            let frame = GameConfig.AvatartAtlas.getSpriteFrame("mj_face" + url.split("file://")[1]);
            if (frame) sprite.spriteFrame = frame;
        }
    },

    bindNoticePrefab(size) {
        let notice = this.getNode("NoticeBar");
        this.resizeNode(notice, 8, size.height / 2 - 116, size.width - 16, 40);
        this.resizeNode(this.getNode("NoticeBar/IconSpeaker"), -size.width / 2 + 180, 0, 74, 34);
        this.resizeNode(this.getNode("NoticeBar/NoticeText"), -size.width / 2 + 245, 0, 250, 34);
        this.setNodeLabel("NoticeBar/NoticeText", ": 代理");
    },

    bindMenuPrefab(size) {
        let menu = this.getNode("GameMenu");
        this.resizeNode(menu, -size.width / 2 + 62, 5, DESIGN.menu, size.height - DESIGN.top - 22);
        let visibleIndex = 0;
        MENU_ITEMS.forEach((item, index) => {
            let btn = this.getNode("GameMenu/GameBtn_" + item.key);
            if (!btn) return;
            btn.active = !item.hiddenInStaticHall;
            if (item.hiddenInStaticHall) return;
            this.resizeNode(btn, 0, size.height / 2 - 176 - visibleIndex * 96, DESIGN.menuBtnW, DESIGN.menuBtnH);
            visibleIndex++;
            this.applyMenuSprite(btn, item);
            this.configureButton(btn);
            btn.gameKey = item.key;
            btn.off(cc.Node.EventType.TOUCH_END);
            btn.on(cc.Node.EventType.TOUCH_END, () => this.selectGame(item.key), this);
            this.setChildActive(btn, "Label", false);
            this.menuButtons[item.key] = btn;
        });
    },

    bindTableScrollPrefab(size) {
        this.scrollNode = this.getNode("TableScroll");
        let viewW = size.width - DESIGN.tableLeft - DESIGN.tableRight;
        let viewH = size.height - DESIGN.top - DESIGN.bottom;
        let x = -size.width / 2 + DESIGN.tableLeft + viewW / 2;
        let y = -12;
        this.resizeNode(this.scrollNode, x, y, viewW, viewH);

        let scroll = this.scrollNode.getComponent(cc.ScrollView) || this.scrollNode.addComponent(cc.ScrollView);
        scroll.horizontal = true;
        scroll.vertical = false;
        scroll.inertia = true;
        scroll.brake = 0.75;
        this.tableScroll = scroll;
        this.scrollNode.off("scrolling");
        this.scrollNode.off("scroll-ended");
        this.scrollNode.on("scrolling", this.updateVisibleTables, this);
        this.scrollNode.on("scroll-ended", this.updateVisibleTables, this);

        let view = this.getNode("TableScroll/view");
        this.resizeNode(view, 0, 0, viewW, viewH);
        if (!view.getComponent(cc.Mask)) view.addComponent(cc.Mask);
        let content = this.getNode("TableScroll/view/content");
        this.resizeNode(content, -viewW / 2, viewH / 2, viewW, viewH);
        content.setAnchorPoint(cc.v2(0, 1));
        scroll.content = content;
        this.tableContent = content;
    },

    bindBottomPrefab(size) {
        let bottom = this.getNode("BottomBar");
        this.resizeNode(bottom, 0, -333, size.width, 84);
        if (bottom) bottom.zIndex = 80;
        this.clearGraphics(bottom);
        let bgBottom = this.getNode("BottomBar/bgBottom");
        if (bgBottom) {
            this.resizeNode(bgBottom, 0, 0, bottom ? bottom.width : size.width, bottom ? bottom.height : DESIGN.bottom);
            bgBottom.active = true;
            bgBottom.opacity = 255;
            bgBottom.color = cc.Color.WHITE;
            bgBottom.zIndex = 0;
            let sprite = bgBottom.getComponent(cc.Sprite);
            if (sprite && bgBottom.removeComponent) {
                bgBottom.removeComponent(sprite);
            }
            this.drawPanel(bgBottom, cc.color(0, 0, 0, 125), 0);
        }
        this.applySprite("BottomBar/BtnScore", "score", 183, 59);
        this.applySprite("BottomBar/BtnManage", "manage", 192, 56);
        this.applySprite("BottomBar/BtnBank", "bank", 171, 50);
        this.applySprite("BottomBar/BtnQuickJoin", "quick", 198, 76);
        this.resizeNode(this.getNode("BottomBar/BtnScore"), -552, 0, 183, 59);
        this.resizeNode(this.getNode("BottomBar/BtnManage"), -308, 0, 192, 56);
        this.resizeNode(this.getNode("BottomBar/BtnBank"), -70, 0, 171, 50);
        this.resizeNode(this.getNode("BottomBar/BtnQuickJoin"), 536, 2, 198, 76);
        ["BtnScore", "BtnManage", "BtnBank", "BtnQuickJoin"].forEach((name) => {
            let node = this.getNode("BottomBar/" + name);
            if (node) node.zIndex = 10;
        });
        this.bindTouch("BottomBar/BtnScore", () => {}, true);
        this.bindTouch("BottomBar/BtnManage", this.openLeagueAnalysisView, true);
        this.bindTouch("BottomBar/BtnBank", () => {}, true);
        this.bindTouch("BottomBar/BtnQuickJoin", () => {}, true);
        this.playTypeBar = this.getNode("PlayTypeTabs");
        this.resizeNode(this.playTypeBar, this.leftX(DESIGN.menu + 360), -size.height / 2 + DESIGN.bottom + 32, 560, 52);
        this.renderRoomTabs();
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

        MENU_ITEMS.forEach((item) => {
            if (!item.icon || this.menuSprites[item.key]) return;
            tasks++;
            cc.loader.loadRes(item.icon, cc.SpriteFrame, (err, spriteFrame) => {
                if (!err && spriteFrame) {
                    this.menuSprites[item.key] = spriteFrame;
                }
                finish();
            });
        });

        Object.keys(HALL_UI).forEach((key) => {
            if (this.uiSprites[key]) return;
            tasks++;
            cc.loader.loadRes(HALL_UI[key], cc.SpriteFrame, (err, spriteFrame) => {
                if (!err && spriteFrame) {
                    this.uiSprites[key] = spriteFrame;
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
        let visibleIndex = 0;
        MENU_ITEMS.forEach((item) => {
            if (item.hiddenInStaticHall) return;
            let btn = this.makeRoundButton("GameBtn_" + item.key, this.safeRoot, -size.width / 2 + 78, startY - visibleIndex * 62, 136, 52, item.name, 28, item.color);
            visibleIndex++;
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
        this.bindTouch("BtnManage", () => {});

        this.playTypeBar = this.makeNode("RoomTabs", this.safeRoot, -size.width / 2 + DESIGN.menu + 210, -size.height / 2 + DESIGN.bottom + 21, 440, 52);
        this.renderRoomTabs();
    },

    renderRoomTabs() {
        if (!this.playTypeBar) return;
        this.playTypeBar.removeAllChildren();
        if (this.currentGame === "ALL") return;
        let rules = this.getRules(this.currentGame);
        let allBtn = this.makeImageTab("RoomTabAll", -184, 0, "所有玩法", this.currentRuleIndex === -1);
        allBtn.on(cc.Node.EventType.TOUCH_END, () => this.selectRule(-1), this);
        rules.forEach((rule, index) => {
            let btn = this.makeImageTab("RoomTab_" + index, -18 + index * 170, 0, rule, this.currentRuleIndex === index);
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
            let selected = key === this.currentGame;
            btn.opacity = selected ? 255 : 230;
            btn.scale = selected ? 1.03 : 1;
            let label = btn.getChildByName("Label");
            if (label) label.active = false;
        });
    },

    renderTables() {
        if (this.currentGame === "PDK") {
            this.renderPdkRealTables();
            return;
        }
        this.renderMockTables();
    },

    renderMockTables() {
        let gameList = this.currentGame === "ALL" ? [this.getGame("DNIU")] : [this.getGame(this.currentGame)];
        let tables = [];
        gameList.forEach((game) => {
            for (let i = 1; i <= TABLE_COUNT; i++) {
                tables.push(this.createTableData(game, i));
            }
        });
        this.applyTableData(tables, true);
    },

    applyTableData(tables, resetScroll) {
        tables = tables || [];
        this.tableData = tables;
        this.tableRows = 2;
        this.tableStrideX = DESIGN.tableW + DESIGN.gapX;
        this.tableStrideY = DESIGN.tableH + DESIGN.gapY;
        let cols = Math.ceil(tables.length / this.tableRows);
        let contentW = cols * this.tableStrideX + 110;
        if (contentW < this.scrollNode.width) contentW = this.scrollNode.width;
        this.tableContent.setContentSize(cc.size(contentW, this.tableContent.height));
        this.ensureTablePool();
        if (resetScroll !== false) this.resetTableScroll();
        this.firstVisibleIndex = -1;
        this.updateVisibleTables();
    },

    renderPdkRealTables() {
        this.pdkRenderToken = (this.pdkRenderToken || 0) + 1;
        let token = this.pdkRenderToken;
        let rooms = this.getPdkRooms();
        if (rooms.length) {
            this.loadPdkTablesFromRooms(rooms, token);
            return;
        }

        this.applyTableData([], true);
        Connector.request(GameConfig.ServerEventName.ClubInfo, { clubID: App.Club.CurrentClubID }, (res) => {
            GameConfig.TableAllRooms = GameUtils.deepcopyArr ? GameUtils.deepcopyArr(res.rooms || []) : (res.rooms || []);
            if (token !== this.pdkRenderToken || this.currentGame !== "PDK") return;
            this.loadPdkTablesFromRooms(this.getPdkRooms(), token);
        }, true, (err) => {
            if (token !== this.pdkRenderToken || this.currentGame !== "PDK") return;
            Cache.showTipsMsg(utils.isNullOrEmpty(err && err.message) ? "获取跑得快房型失败" : err.message);
            this.applyTableData([], true);
        });
    },

    loadPdkTablesFromRooms(rooms, token) {
        rooms = rooms || [];
        if (!rooms.length) {
            Cache.showTipsMsg("当前联盟没有跑得快房型，请先配置跑得快房间");
            this.applyTableData([], true);
            return;
        }

        let roomIDs = rooms.map((room) => room.roomID).filter((roomID) => !utils.isNullOrEmpty(roomID));
        if (!roomIDs.length) {
            this.applyTableData(this.buildPdkTableData(rooms, []), true);
            return;
        }

        Connector.request(GameConfig.ServerEventName.Tables, { rooms: roomIDs, clubID: App.Club.CurrentClubID }, (res) => {
            if (token !== this.pdkRenderToken || this.currentGame !== "PDK") return;
            this.applyTableData(this.buildPdkTableData(rooms, res.rooms || []), true);
        }, true, (err) => {
            if (token !== this.pdkRenderToken || this.currentGame !== "PDK") return;
            Cache.showTipsMsg(utils.isNullOrEmpty(err && err.message) ? "获取跑得快桌子失败" : err.message);
            this.applyTableData(this.buildPdkTableData(rooms, []), true);
        });
    },

    buildPdkTableData(rooms, tableRooms) {
        let pdkGame = this.getGame("PDK");
        let roomMap = {};
        rooms.forEach((room) => {
            if (!room || utils.isNullOrEmpty(room.roomID)) return;
            roomMap[String(room.roomID)] = room;
        });

        let result = [];
        rooms.forEach((room, index) => {
            result.push(this.createPdkCreateEntry(room, index));
        });

        let realTables = [];
        (tableRooms || []).forEach((roomTables) => {
            if (!roomTables) return;
            let room = roomMap[String(roomTables.roomID)];
            if (!room) return;
            (roomTables.tables || []).forEach((tableStr) => {
                let table = this.parseTableString(tableStr);
                if (!table || utils.isNullOrEmpty(table.tableID)) return;
                table.roomID = roomTables.roomID;
                realTables.push(this.createPdkRealTableEntry(pdkGame, room, table));
            });
        });

        realTables.sort((a, b) => {
            let statusA = a.rawStatus === "WAIT" ? 1 : 0;
            let statusB = b.rawStatus === "WAIT" ? 1 : 0;
            if (statusA !== statusB) return statusB - statusA;
            return (b.occupied || 0) - (a.occupied || 0);
        });

        return result.concat(realTables);
    },

    createPdkCreateEntry(room, index) {
        let game = this.getGame("PDK");
        return {
            game: game,
            name: (room && room.name ? room.name : "跑得快") + "开房",
            rule: room && room.name ? room.name : this.getRuleName("PDK"),
            entryText: this.getRoomEntryText(room),
            occupied: 0,
            players: [],
            state: "等待中",
            totalRound: this.getRoomTotalRound(room),
            currentRound: 0,
            isPdkCreateRoom: true,
            realRoomData: this.copyRoomData(room),
            roomID: room && room.roomID,
            gameType: room && room.gameType,
        };
    },

    createPdkRealTableEntry(game, room, table) {
        let players = this.normalizeTablePlayers(table.players || []);
        return {
            game: game,
            name: (GameConfig.TableType && GameConfig.TableType[table.mode] || "普通桌") + " " + (room.name || "跑得快"),
            rule: room.name || this.getRuleName("PDK"),
            entryText: this.getRoomEntryText(room),
            occupied: players.length,
            players: players,
            state: table.status === "WAIT" ? "等待中" : "游戏中",
            rawStatus: table.status,
            totalRound: this.getRoomTotalRound(room),
            currentRound: table.turn || table.round || 0,
            isPdkRealTable: true,
            realRoomData: this.copyRoomData(room),
            realTableData: table,
            roomID: table.roomID || room.roomID,
            tableID: table.tableID,
            gameType: table.gameType || room.gameType,
        };
    },

    parseTableString(tableStr) {
        if (utils.isNullOrEmpty(tableStr)) return null;
        if (typeof tableStr === "object") return tableStr;
        try {
            return JSON.parse(tableStr);
        } catch (err) {
            console.warn("[HallStaticTestView] parse PDK table failed", tableStr, err);
        }
        return null;
    },

    normalizeTablePlayers(players) {
        if (!players || !players.length) return [];
        return players.filter((player) => !!player).map((player, index) => {
            if (typeof player !== "object") {
                return { name: "玩家" + (index + 1), head: "" };
            }
            let prop = player.prop || player.user || player;
            return {
                name: prop.name || prop.nickname || prop.nickName || player.name || player.nickname || player.nickName || "玩家" + (index + 1),
                head: prop.head || prop.avatar || prop.avatarUrl || player.head || player.avatar || player.avatarUrl || "",
                raw: player,
            };
        });
    },

    getPdkRooms() {
        let rooms = GameConfig.TableAllRooms || [];
        let pdkTypes = this.getPdkGameTypes();
        return rooms.filter((room) => room && pdkTypes.indexOf(room.gameType) !== -1);
    },

    getPdkGameTypes() {
        return ["PDK", "PDK_SOLO", "PDK_CLAN", "PDK_SOLO_CLAN"];
    },

    copyRoomData(room) {
        if (!room) return {};
        if (GameUtils.deepcopyArr) return GameUtils.deepcopyArr([room])[0];
        let result = {};
        Object.keys(room).forEach((key) => result[key] = room[key]);
        return result;
    },

    getRoomEntryText(room) {
        if (!room) return this.getEntryText("PDK", 0);
        let lower = this.formatRoomNumber(room.lower || room.base || 0);
        let fee = this.formatRoomNumber(room.fee || 0);
        if (!lower && !fee) return this.getEntryText("PDK", 0);
        return "入:" + (lower || 0) + "/出" + (fee || 0);
    },

    formatRoomNumber(value) {
        let num = Number(value || 0);
        if (!num) return 0;
        if (Math.abs(num) >= 100) num = num / 100;
        return Math.floor(num) === num ? String(num) : String(Number(num.toFixed(2)));
    },

    getRoomTotalRound(room) {
        let rules = room && room.rules;
        if (typeof rules === "string") {
            try {
                rules = JSON.parse(rules);
            } catch (err) {
                rules = null;
            }
        }
        return rules && (rules.turn || rules.round || rules.maxTurn) || 10;
    },

    resetTableScroll() {
        if (this.tableScroll) {
            this.tableScroll.stopAutoScroll();
            this.tableScroll.scrollToLeft(0);
        }
        if (this.tableContent && this.scrollNode) {
            this.tableContent.setPosition(cc.v2(-this.scrollNode.width / 2, this.tableContent.y));
        }
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
        if (!this.tableContent || !this.tableData || !this.tableData.length) {
            this.tablePool.forEach((node) => node.active = false);
            return;
        }
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
            let x = 38 + col * this.tableStrideX + DESIGN.tableW / 2;
            let y = -18 - row * this.tableStrideY - DESIGN.tableH / 2;
            node.active = true;
            node.setPosition(cc.v2(x, y));
            let component = node.getComponent("HallStaticTableItem");
            if (component) {
                component.render(table, this.tableSprites[table.game.key]);
            }
            this.bindTableClick(node, table, dataIndex);
        }
    },

    createTableData(game, index) {
        let players = game.players || [];
        let occupied = players.length;
        let isPlaying = false;
        let rules = this.getRules(game.key);
        let useSelectedRule = this.currentGame !== "ALL" && this.currentGame === game.key && this.currentRuleIndex >= 0;
        let ruleIndex = useSelectedRule ? this.currentRuleIndex : (index - 1) % rules.length;
        return {
            game: game,
            name: game.key === "PDK" && index === 1 ? "跑得快开房" : game.name + " 测试桌 " + index,
            rule: rules[ruleIndex] || rules[0],
            entryText: this.getEntryText(game.key, ruleIndex),
            occupied: occupied,
            players: players,
            state: isPlaying ? "游戏中" : "等待中",
            totalRound: 10,
            currentRound: (index * 2) % 10 + 1,
            isCreateRoomEntry: game.key === "PDK" && index === 1,
        };
    },

    bindTableClick(node, table, dataIndex) {
        node.off(cc.Node.EventType.TOUCH_END);
        if (!table || (!table.isPdkCreateRoom && !table.isPdkRealTable && !table.isCreateRoomEntry)) return;
        this.configureButton(node);
        node.on(cc.Node.EventType.TOUCH_END, () => {
            if (table.isPdkRealTable) {
                this.requestJoinPdkRoom(table.realRoomData, table.tableID);
                return;
            }
            if (table.isPdkCreateRoom) {
                this.requestJoinPdkRoom(table.realRoomData, "");
                return;
            }
            this.enterPdkCreateRoom();
        }, this);
    },

    enterPdkCreateRoom() {
        let roomData = this.findPdkRoomData();
        if (roomData && !utils.isNullOrEmpty(roomData.roomID)) {
            this.requestJoinPdkRoom(roomData);
            return;
        }

        Connector.request(GameConfig.ServerEventName.ClubInfo, { clubID: App.Club.CurrentClubID }, (res) => {
            GameConfig.TableAllRooms = GameUtils.deepcopyArr(res.rooms || []);
            let latestRoomData = this.findPdkRoomData();
            if (!latestRoomData || utils.isNullOrEmpty(latestRoomData.roomID)) {
                Cache.showTipsMsg("当前联盟没有跑得快房型，请先配置跑得快房间");
                return;
            }
            this.requestJoinPdkRoom(latestRoomData);
        }, true, (err) => {
            Cache.showTipsMsg(utils.isNullOrEmpty(err.message) ? "获取跑得快房型失败" : err.message);
        });
    },

    requestJoinPdkRoom(roomData, tableID) {
        Cache.playSfx && Cache.playSfx();

        let nowTime = new Date().getTime();
        if (nowTime - GameConfig.LastSocketTime < 2000) {
            Cache.alertTip("点击过于频繁");
            return;
        }
        GameConfig.LastSocketTime = nowTime;
        if (GameConfig.IsConnecting) {
            Cache.alertTip("正在进入房间");
            return;
        }

        if (!roomData || utils.isNullOrEmpty(roomData.roomID)) {
            Cache.showTipsMsg("当前联盟没有跑得快房型，请先配置跑得快房间");
            return;
        }

        let gameType = roomData.gameType || GameConfig.GameType.PDK || "PDK";
        let enterData = {
            roomID: roomData.roomID,
            gameType: gameType,
            tableID: tableID || "",
        };
        roomData.gameType = gameType;
        GameConfig.TableRoom = roomData;
        GameConfig.IsConnecting = true;

        let questData = {
            roomID: enterData.roomID,
            gameType: enterData.gameType,
            tableID: enterData.tableID,
            clubID: App.Club.CurrentClubID,
        };
        Connector.request(GameConfig.ServerEventName.JoinClubGame, questData, (res) => {
            utils.saveValue(GameConfig.StorageKey.LastRoomData, roomData);
            GameConfig.IsConnecting = false;
            GameConfig.ReturnToStaticHall = true;
            GameConfig.ShowTablePop = false;
            Connector.connect(res, () => {
                GameConfig.CurrentGameType = res.data.gameType;
                DataBase.setGameType(DataBase.GAME_TYPE[res.data.gameType]);
                cc.director.loadScene(DataBase.TABLE_TYPE[res.data.gameType]);
            });
        }, true, (err) => {
            GameConfig.IsConnecting = false;
            Cache.showTipsMsg(utils.isNullOrEmpty(err.message) ? "进入游戏失败" : err.message);
        });
    },

    findPdkRoomData() {
        let rooms = GameConfig.TableAllRooms || [];
        let priority = ["PDK", "PDK_SOLO", "PDK_CLAN", "PDK_SOLO_CLAN"];
        for (let i = 0; i < priority.length; i++) {
            let gameType = priority[i];
            for (let j = 0; j < rooms.length; j++) {
                if (rooms[j] && rooms[j].gameType === gameType) {
                    return GameUtils.deepcopyArr ? GameUtils.deepcopyArr([rooms[j]])[0] : Object.assign({}, rooms[j]);
                }
            }
        }
        return null;
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
            DNIU: ["牛牛0.5底", "暗一100锅 3底"],
            JH: ["拼三张0.5底", "拼三张1底"],
            ZMZ: ["普通桌", "高级桌"],
            HSMJ: ["划水麻将", "2人玩法"],
            PDK: ["跑得快", "15张玩法"],
        };
        return ruleMap[key] || ["所有玩法"];
    },

    getEntryText(key, ruleIndex) {
        let map = {
            DNIU: ["入:100/出10", "入:100/出10"],
            JH: ["入:50/出5", "入:100/出10"],
            ZMZ: ["入:100/出10", "入:100/出10"],
            HSMJ: ["入:100/出10", "入:100/出10"],
            PDK: ["入:100/出10", "入:100/出10"],
        };
        let list = map[key] || ["入:100/出10"];
        return list[ruleIndex] || list[0];
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

    getNode(path, root) {
        let parts = path.split("/");
        let node = root || this.node;
        for (let i = 0; i < parts.length; i++) {
            if (!node) return null;
            node = node.getChildByName(parts[i]);
        }
        return node;
    },

    resizeNode(node, x, y, w, h) {
        if (!node) return;
        node.setPosition(cc.v2(x, y));
        node.setContentSize(cc.size(w, h));
    },

    leftX(x) {
        return -cc.winSize.width / 2 + x;
    },

    rightX(x) {
        return cc.winSize.width / 2 - x;
    },

    bindTouch(path, handler) {
        let node = this.resolveNode(path);
        if (!node) return;
        this.configureButton(node);
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, handler, this);
    },

    openLeagueAnalysisView() {
        if (!this.leagueAnalysisViewPrefab) {
            console.error("[HallStaticTestView] leagueAnalysisViewPrefab is missing. Please bind assets/prefabs/LeagueAnalysis/LeagueAnalysisView.prefab.");
            return;
        }
        let canvas = cc.find("Canvas") || this.node;
        let nodeName = "LeagueAnalysisView";
        let oldNode = canvas.getChildByName(nodeName);
        if (oldNode && oldNode.isValid) {
            oldNode.active = true;
            oldNode.zIndex = 1000;
            return;
        }
        let popNode = cc.instantiate(this.leagueAnalysisViewPrefab);
        popNode.name = nodeName;
        popNode.setPosition(cc.v2(0, 0));
        popNode.zIndex = 1000;
        canvas.addChild(popNode);
    },

    configureButton(node) {
        if (!node) return;
        let button = node.getComponent(cc.Button) || node.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.08;
        button.zoomScale = 0.94;
    },

    setNodeLabel(path, text) {
        let node = this.resolveNode(path);
        if (!node) return;
        let label = node.getComponent(cc.Label);
        if (label) label.string = text;
    },

    styleLabel(path, fontSize, color, lineHeight) {
        let node = this.resolveNode(path);
        if (!node) return;
        let label = node.getComponent(cc.Label);
        if (!label) return;
        label.fontSize = fontSize;
        label.lineHeight = lineHeight || node.height;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.enableWrapText = false;
        label.overflow = cc.Label.Overflow.CLAMP;
        node.color = color || cc.Color.WHITE;
    },

    styleCoinLabel(path, fontSize, color, lineHeight) {
        let node = this.resolveNode(path);
        if (!node) return;
        let label = node.getComponent(cc.Label);
        if (!label) return;
        label.fontSize = fontSize;
        label.lineHeight = lineHeight || node.height;
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.enableWrapText = false;
        label.overflow = cc.Label.Overflow.CLAMP;
        node.color = color || cc.Color.WHITE;
    },

    resolveNode(path) {
        if (!path) return null;
        return typeof path === "string" ? this.getNode(path) : path;
    },

    ellipsisText(text, maxLength) {
        let value = String(text == null ? "" : text);
        if (value.length <= maxLength) return value;
        if (maxLength <= 3) return value.slice(0, maxLength);
        return value.slice(0, maxLength - 3) + "...";
    },

    setChildLabel(node, text) {
        let labelNode = node && node.getChildByName("Label");
        let label = labelNode && labelNode.getComponent(cc.Label);
        if (label) label.string = text;
    },

    setChildActive(node, childName, active) {
        let child = node && node.getChildByName(childName);
        if (child) child.active = active;
    },

    applySprite(path, key, w, h) {
        let node = typeof path === "string" ? this.getNode(path) : path;
        if (!node) return;
        let spriteFrame = this.uiSprites[key];
        if (!spriteFrame) return;
        this.clearGraphics(node);
        let sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        if (w && h) node.setContentSize(cc.size(w, h));
        node.color = cc.Color.WHITE;
        node.opacity = 255;
    },

    applySpriteToChild(parentPath, name, key, x, y, w, h, zIndex) {
        let parent = this.getNode(parentPath);
        let spriteFrame = this.uiSprites[key];
        if (!parent || !spriteFrame) return null;
        let node = parent.getChildByName(name);
        if (!node) {
            node = new cc.Node(name);
            parent.addChild(node);
        }
        node.setPosition(cc.v2(x, y));
        node.setContentSize(cc.size(w, h));
        node.zIndex = zIndex || 0;
        node.opacity = 255;
        node.color = cc.Color.WHITE;
        this.clearGraphics(node);
        let sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        return node;
    },

    applyMenuSprite(btn, item) {
        if (!btn || !item) return;
        let spriteFrame = this.menuSprites[item.key];
        if (!spriteFrame) return;
        this.clearGraphics(btn);
        let sprite = btn.getComponent(cc.Sprite) || btn.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        btn.color = cc.Color.WHITE;
        btn.opacity = item.key === this.currentGame ? 255 : 225;
    },

    clearGraphics(node) {
        let graphics = node && node.getComponent(cc.Graphics);
        if (!graphics) return;
        graphics.clear();
        if (node.removeComponent) {
            node.removeComponent(graphics);
        }
    },

    drawPanel(node, color, radius) {
        if (!node) return;
        let g = node.getComponent(cc.Graphics) || node.addComponent(cc.Graphics);
        g.clear();
        g.fillColor = color;
        g.roundRect(-node.width / 2, -node.height / 2, node.width, node.height, radius || 0);
        g.fill();
    },

    drawPanelChild(parentPath, name, x, y, w, h, color, radius, zIndex) {
        let parent = this.getNode(parentPath);
        if (!parent) return null;
        let node = parent.getChildByName(name);
        if (!node) {
            node = new cc.Node(name);
            parent.addChild(node);
        }
        node.setPosition(cc.v2(x, y));
        node.setContentSize(cc.size(w, h));
        node.zIndex = zIndex == null ? -10 : zIndex;
        node.opacity = 255;
        this.drawPanel(node, color, radius || 0);
        return node;
    },

    makeImageTab(name, x, y, text, selected) {
        let node = this.makeNode(name, this.playTypeBar, x, y, 157, 52);
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = selected ? this.uiSprites.ruleSelected : this.uiSprites.ruleNormal;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.configureButton(node);
        this.makeLabel("Label", node, text, 24, selected ? cc.color(255, 255, 255, 255) : cc.color(255, 255, 255, 240), 0, 0, 145, 48);
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
