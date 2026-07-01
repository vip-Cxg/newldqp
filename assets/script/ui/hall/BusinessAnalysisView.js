const Cache = require("../../../Main/Script/Cache");

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.node.addComponent(cc.BlockInputEvents);
        this.tabs = [
            { key: "Stats", node: "StatsTab", button: "Tab_Stats" },
            { key: "Partner", node: "PartnerTab", button: "Tab_Partner" },
            { key: "Member", node: "MemberTab", button: "Tab_Member" },
            { key: "AgentStats", node: "AgentStatsTab", button: "Tab_AgentStats" },
            { key: "RewardDetail", node: "RewardDetailTab", button: "Tab_RewardDetail" },
            { key: "OperateLog", node: "OperateLogTab", button: "Tab_OperateLog" },
            { key: "RewardWithdraw", node: "RewardWithdrawTab", button: "Tab_RewardWithdraw" },
        ];
        this.cacheNodes();
        this.loadTabSprites();
        this.bindButtons();
        this.hideReferenceImage();
        this.renderStats(this.mockStats());
        this.renderPartners(this.mockPartners());
        this.showTab("Stats");
    },

    cacheNodes() {
        this.panel = this.node.getChildByName("Panel");
        this.content = this.getNode("Panel/Content");
        this.leftTabs = this.getNode("Panel/LeftTabs");
    },

    loadTabSprites() {
        this.tabSprites = {};
        cc.loader.loadRes("hall/经营分析/统计/an01", cc.SpriteFrame, (err, spriteFrame) => {
            if (!err && spriteFrame) {
                this.tabSprites.normal = spriteFrame;
                this.showTab(this.currentTab || "Stats");
            }
        });
        cc.loader.loadRes("hall/经营分析/统计/liao01", cc.SpriteFrame, (err, spriteFrame) => {
            if (!err && spriteFrame) {
                this.tabSprites.selected = spriteFrame;
                this.showTab(this.currentTab || "Stats");
            }
        });
    },

    bindButtons() {
        this.bindClick("Panel/Header/CloseButton", this.onClickClose.bind(this));
        this.bindClick("Panel/Content/StatsTab/BottomActions/InviteButton", this.onInvitePlayer.bind(this));
        this.bindClick("Panel/Content/StatsTab/BottomActions/SetPartnerButton", this.onSetPartner.bind(this));
        this.bindClick("Panel/Content/PartnerTab/SearchBar/SearchButton", this.onPartnerSearch.bind(this));

        this.tabs.forEach((tab) => {
            this.bindClick("Panel/LeftTabs/" + tab.button, () => {
                this.showTab(tab.key);
            });
        });
    },

    bindClick(path, handler) {
        let node = this.getNode(path);
        if (!node) return;
        let button = node.getComponent(cc.Button) || node.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.08;
        button.zoomScale = 0.96;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, handler, this);
    },

    hideReferenceImage() {
        let ref = this.node.getChildByName("效果图");
        if (ref) ref.active = false;
    },

    mockStats() {
        return {
            todayReward: 0,
            yesterdayReward: 0,
            teamScore: 100,
            teamUsers: 100,
            roomRate: 0,
            shuffleRate: 0,
            gameRounds: 0,
            directCaptains: 1,
            directMembers: 1,
            indirectMembers: 1,
        };
    },

    mockPartners() {
        return [
            {
                role: "captain",
                name: "玩家信息",
                userId: "123456",
                peopleCount: 9999,
                roomRate: "100%",
                shuffleRate: "100%",
                todayRounds: 0,
                yesterdayRounds: 0,
                todayIncome: 0,
                yesterdayIncome: 0,
                todayContribution: 0,
                yesterdayContribution: 0,
                score: 0,
                limit: 0,
                todayDelta: "-38.9",
                yesterdayDelta: "0",
                memberScore: 99999,
            },
            {
                role: "direct",
                name: "玩家信息",
                userId: "123456",
                peopleCount: 9999,
                roomRate: "100%",
                shuffleRate: "100%",
                todayRounds: 0,
                yesterdayRounds: 0,
                todayIncome: 0,
                yesterdayIncome: 0,
                todayContribution: 0,
                yesterdayContribution: 0,
                score: 0,
                limit: 0,
                todayDelta: "0",
                yesterdayDelta: "0",
                memberScore: 99999,
            },
            {
                role: "direct",
                name: "玩家信息",
                userId: "123456",
                peopleCount: 9999,
                roomRate: "100%",
                shuffleRate: "100%",
                todayRounds: 0,
                yesterdayRounds: 0,
                todayIncome: 0,
                yesterdayIncome: 0,
                todayContribution: 0,
                yesterdayContribution: 0,
                score: 0,
                limit: 0,
                todayDelta: "0",
                yesterdayDelta: "0",
                memberScore: 99999,
            },
            {
                role: "direct",
                name: "玩家信息",
                userId: "123456",
                peopleCount: 9999,
                roomRate: "100%",
                shuffleRate: "100%",
                todayRounds: 0,
                yesterdayRounds: 0,
                todayIncome: 0,
                yesterdayIncome: 0,
                todayContribution: 0,
                yesterdayContribution: 0,
                score: 0,
                limit: 0,
                todayDelta: "0",
                yesterdayDelta: "0",
                memberScore: 99999,
            },
            {
                role: "direct",
                name: "玩家信息",
                userId: "123456",
                peopleCount: 9999,
                roomRate: "100%",
                shuffleRate: "100%",
                todayRounds: 0,
                yesterdayRounds: 0,
                todayIncome: 0,
                yesterdayIncome: 0,
                todayContribution: 0,
                yesterdayContribution: 0,
                score: 0,
                limit: 0,
                todayDelta: "0",
                yesterdayDelta: "0",
                memberScore: 99999,
            },
            {
                role: "direct",
                name: "玩家信息",
                userId: "123456",
                peopleCount: 9999,
                roomRate: "100%",
                shuffleRate: "100%",
                todayRounds: 0,
                yesterdayRounds: 0,
                todayIncome: 0,
                yesterdayIncome: 0,
                todayContribution: 0,
                yesterdayContribution: 0,
                score: 0,
                limit: 0,
                todayDelta: "0",
                yesterdayDelta: "0",
                memberScore: 99999,
            },
            {
                role: "direct",
                name: "玩家信息",
                userId: "123456",
                peopleCount: 9999,
                roomRate: "100%",
                shuffleRate: "100%",
                todayRounds: 0,
                yesterdayRounds: 0,
                todayIncome: 0,
                yesterdayIncome: 0,
                todayContribution: 0,
                yesterdayContribution: 0,
                score: 0,
                limit: 0,
                todayDelta: "0",
                yesterdayDelta: "0",
                memberScore: 99999,
            }
        ];
    },

    renderStats(data) {
        this.setLabel("Panel/Content/StatsTab/ScoreBlock/TodayRewardLabel", "今日总奖励： " + data.todayReward);
        this.setLabel("Panel/Content/StatsTab/ScoreBlock/YesterdayRewardLabel", "昨日总奖励： " + data.yesterdayReward);
        this.setLabel("Panel/Content/StatsTab/TotalBlock/TeamScoreLabel", "团队总积分： " + data.teamScore);
        this.setLabel("Panel/Content/StatsTab/TotalBlock/TeamUserLabel", "团队总人数： " + data.teamUsers);
        this.setLabel("Panel/Content/StatsTab/TotalBlock/RoomRateLabel", "房费比例： " + data.roomRate);
        this.setLabel("Panel/Content/StatsTab/TotalBlock/ShuffleRateLabel", "抽水比例： " + data.shuffleRate);
        this.setLabel("Panel/Content/StatsTab/TotalBlock/GameRoundLabel", "游戏局数： " + data.gameRounds);
        this.setLabel("Panel/Content/StatsTab/BottomActions/DirectCaptainBox/Value", String(data.directCaptains));
        this.setLabel("Panel/Content/StatsTab/BottomActions/DirectMemberBox/Value", String(data.directMembers));
        this.setLabel("Panel/Content/StatsTab/BottomActions/IndirectMemberBox/Value", String(data.indirectMembers));
    },

    renderPartners(list) {
        let content = this.getNode("Panel/Content/PartnerTab/PartnerScroll/content");
        if (!content) return;
        content.removeAllChildren();
        list = list || [];
        let itemHeight = 184;
        let gap = 10;
        let contentHeight = Math.max(content.parent.height, list.length * (itemHeight + gap));
        content.setContentSize(cc.size(content.width || 1038, contentHeight));

        cc.loader.loadRes("Main/Prefab/BusinessAnalysisPartnerItem", (err, prefab) => {
            if (err || !prefab || !cc.isValid(content)) return;
            content.removeAllChildren();
            list.forEach((data, index) => {
                let item = cc.instantiate(prefab);
                item.name = "PartnerItem_" + (index + 1);
                item.setPosition(0, -itemHeight / 2 - index * (itemHeight + gap));
                content.addChild(item);
                this.renderPartnerItem(item, data);
            });
        });
    },

    renderPartnerItem(item, data) {
        let isCaptain = data.role === "captain";
        this.setRoleBadge(item, isCaptain);

        this.setItemLabel(item, "NameLabel", data.name);
        this.setItemLabel(item, "IdLabel", data.userId);
        this.setItemLabel(item, "PeopleCountLabel", String(data.peopleCount));
        this.setItemLabel(item, "PeopleRateLabel", data.roomRate + " " + data.shuffleRate);
        this.setItemLabel(item, "TodayRoundsLabel", String(data.todayRounds));
        this.setItemLabel(item, "YesterdayRoundsLabel", String(data.yesterdayRounds));
        this.setItemLabel(item, "TodayIncomeLabel", String(data.todayIncome));
        this.setItemLabel(item, "YesterdayIncomeLabel", String(data.yesterdayIncome));
        this.setItemLabel(item, "TodayContributionLabel", String(data.todayContribution));
        this.setItemLabel(item, "YesterdayContributionLabel", String(data.yesterdayContribution));
        this.setItemLabel(item, "ScoreLabel", String(data.score));
        this.setItemLabel(item, "LimitLabel", String(data.limit));
        this.setItemLabel(item, "TodayBox/Label", "今日： " + data.todayDelta);
        this.setItemLabel(item, "YesterdayBox/Label", "昨日： " + data.yesterdayDelta);
        this.setItemLabel(item, "MemberScoreValue", String(data.memberScore));

        this.setChildActive(item, "AdjustRateButton", !isCaptain);
        this.setChildActive(item, "WarningButton", !isCaptain);
        this.bindItemButton(item, "AdjustRateButton", "调整比例功能待接入");
        this.bindItemButton(item, "WarningButton", "警戒值功能待接入");
        this.bindItemButton(item, "ChildrenButton", "查看下级功能待接入");
        this.bindItemButton(item, "AddScoreButton", "上分功能待接入");
        this.bindItemButton(item, "ReduceScoreButton", "下分功能待接入");
    },

    showTab(key) {
        this.currentTab = key;
        this.tabs.forEach((tab) => {
            let tabNode = this.getNode("Panel/Content/" + tab.node);
            if (tabNode) tabNode.active = tab.key === key;

            let btn = this.getNode("Panel/LeftTabs/" + tab.button);
            this.setTabButtonState(btn, tab.key === key);
        });
    },

    setTabButtonState(btn, selected) {
        if (!btn) return;
        btn.opacity = 255;
        btn.color = cc.Color.WHITE;

        let sprite = btn.getComponent(cc.Sprite);
        let spriteFrame = selected ? this.tabSprites.selected : this.tabSprites.normal;
        if (sprite && spriteFrame) {
            sprite.spriteFrame = spriteFrame;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        }

    },

    setRoleBadge(item, isCaptain) {
        this.setChildActive(item, "ZXBadge", !isCaptain);
        this.setChildActive(item, "DZBadge", isCaptain);
    },

    onInvitePlayer() {
        Cache.playSfx();
        Cache.alertTip("邀请玩家功能待接入");
    },

    onSetPartner() {
        Cache.playSfx();
        Cache.alertTip("设置合伙人功能待接入");
    },

    onPartnerSearch() {
        Cache.playSfx();
        Cache.alertTip("查询功能待接入");
    },

    onClickClose() {
        Cache.playSfx();
        this.node.removeFromParent();
        this.node.destroy();
    },

    setLabel(path, text) {
        let node = this.getNode(path);
        if (!node) return;
        let label = node.getComponent(cc.Label);
        if (label) label.string = text;
    },

    setItemLabel(root, path, text) {
        let node = this.getNodeFrom(root, path);
        if (!node) return;
        let label = node.getComponent(cc.Label);
        if (label) label.string = text;
    },

    setChildActive(root, path, active) {
        let node = this.getNodeFrom(root, path);
        if (node) node.active = active;
    },

    bindItemButton(root, path, message) {
        let node = this.getNodeFrom(root, path);
        if (!node) return;
        let button = node.getComponent(cc.Button) || node.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.08;
        button.zoomScale = 0.96;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, () => {
            Cache.playSfx();
            Cache.alertTip(message);
        }, this);
    },

    getNode(path) {
        if (!path) return null;
        let node = this.node;
        let parts = path.split("/");
        for (let i = 0; i < parts.length; i++) {
            if (!parts[i]) continue;
            node = node.getChildByName(parts[i]);
            if (!node) return null;
        }
        return node;
    },

    getNodeFrom(root, path) {
        if (!root || !path) return null;
        let node = root;
        let parts = path.split("/");
        for (let i = 0; i < parts.length; i++) {
            if (!parts[i]) continue;
            node = node.getChildByName(parts[i]);
            if (!node) return null;
        }
        return node;
    },
});
