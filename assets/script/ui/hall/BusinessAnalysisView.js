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
        this.renderMembers(this.mockMembers());
        this.renderAgentStats(this.mockAgentStats());
        this.renderRewardDetails(this.mockRewardDetails());
        this.renderOperateLogs(this.mockOperateLogs());
        this.renderRewardWithdraw(this.mockRewardWithdraw());
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
        this.bindClick("Panel/Content/MemberTab/SearchBar/SearchButton", this.onMemberSearch.bind(this));
        this.bindClick("Panel/Content/AgentStatsTab/SearchBar/SearchButton", this.onAgentStatsSearch.bind(this));
        this.bindClick("Panel/Content/RewardDetailTab/DateBar/StartDateButton", this.onRewardStartDate.bind(this));
        this.bindClick("Panel/Content/RewardDetailTab/DateBar/EndDateButton", this.onRewardEndDate.bind(this));
        this.bindClick("Panel/Content/OperateLogTab/DateBar/StartDateButton", this.onOperateStartDate.bind(this));
        this.bindClick("Panel/Content/OperateLogTab/DateBar/EndDateButton", this.onOperateEndDate.bind(this));
        this.bindClick("Panel/Content/RewardWithdrawTab/DateBar/StartDateButton", this.onWithdrawStartDate.bind(this));
        this.bindClick("Panel/Content/RewardWithdrawTab/DateBar/EndDateButton", this.onWithdrawEndDate.bind(this));
        this.bindClick("Panel/Content/RewardWithdrawTab/WithdrawButton", this.onWithdrawReward.bind(this));

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

    mockMembers() {
        return [
            {
                isCaptain: true,
                name: "玩家信息",
                userId: "123456",
                online: true,
                todayRounds: 0,
                yesterdayRounds: 0,
                todayContribution: 2.78,
                yesterdayContribution: 0,
                todayWin: 0,
                yesterdayWin: 0,
                score: 100.8,
                todayDelta: "0",
                yesterdayDelta: "0",
            },
            {
                isCaptain: false,
                name: "玩家信息",
                userId: "123456",
                online: false,
                todayRounds: 1,
                yesterdayRounds: 0,
                todayContribution: 2.78,
                yesterdayContribution: 0,
                todayWin: -38.9,
                yesterdayWin: 0,
                score: 7.4,
                todayDelta: "-38.9",
                yesterdayDelta: "0",
            },
            {
                isCaptain: false,
                name: "玩家信息",
                userId: "123456",
                online: true,
                todayRounds: 3,
                yesterdayRounds: 2,
                todayContribution: 12.6,
                yesterdayContribution: 6.8,
                todayWin: 20,
                yesterdayWin: -5,
                score: 88,
                todayDelta: "20",
                yesterdayDelta: "-5",
            },
        ];
    },

    mockAgentStats() {
        return [
            {
                name: "代理玩家1",
                userId: "900001",
                personCount: 8,
                income: 128.6,
                memberScore: 2000,
                win: -38.9,
                contribution: 560,
            },
            {
                name: "代理玩家2",
                userId: "900002",
                personCount: 12,
                income: 256.8,
                memberScore: 5300,
                win: 72.4,
                contribution: 880,
            },
            {
                name: "代理玩家3",
                userId: "900003",
                personCount: 3,
                income: 18.2,
                memberScore: 600,
                win: 0,
                contribution: 90,
            },
            {
                name: "代理玩家4",
                userId: "900004",
                personCount: 21,
                income: 998.3,
                memberScore: 12000,
                win: 310.5,
                contribution: 1880,
            },
            {
                name: "代理玩家5",
                userId: "900005",
                personCount: 6,
                income: 66.6,
                memberScore: 1800,
                win: -12,
                contribution: 240,
            },
            {
                name: "代理玩家6",
                userId: "900006",
                personCount: 15,
                income: 420,
                memberScore: 7600,
                win: 88,
                contribution: 1200,
            },
        ];
    },

    mockRewardDetails() {
        return {
            list: [
                { reward: "+50", gameName: "牛牛", playerCount: "8人", roomId: "123456", date: "2026-06-28 15:34" },
                { reward: "+50", gameName: "金花", playerCount: "8人", roomId: "123456", date: "2026-06-28 15:34" },
                { reward: "+20", gameName: "跑得快", playerCount: "2人", roomId: "245499", date: "2026-06-28 16:12" },
                { reward: "+12", gameName: "捉麻子", playerCount: "2人", roomId: "651898", date: "2026-06-28 17:08" },
                { reward: "+8", gameName: "划水麻将", playerCount: "2人", roomId: "900001", date: "2026-06-28 18:30" },
            ],
            totalTicket: 2.78,
            subReward: 0,
            myIncome: 2.78,
        };
    },

    mockOperateLogs() {
        return [
            {
                playerName: "玩家信息",
                playerId: "123456",
                scoreRecord: "+100",
                playerRemain: 50,
                operatorName: "玩家信息",
                operatorId: "123456",
                operatorRemain: 50,
                date: "2026-06-26\n12:37:33",
            },
            {
                playerName: "玩家信息",
                playerId: "123456",
                scoreRecord: "-100",
                playerRemain: 50,
                operatorName: "玩家信息",
                operatorId: "123456",
                operatorRemain: 0,
                date: "2026-06-26\n12:37:33",
            },
            {
                playerName: "测试成员",
                playerId: "900003",
                scoreRecord: "+250",
                playerRemain: 380,
                operatorName: "代理玩家",
                operatorId: "900001",
                operatorRemain: 1200,
                date: "2026-06-27\n09:18:20",
            },
        ];
    },

    mockRewardWithdraw() {
        return {
            currentReward: 2.7,
            list: [
                { date: "2026-06-28 15:34", amount: "8人", total: "123456" },
                { date: "2026-06-29 10:22", amount: "2.78", total: "123458" },
                { date: "2026-06-30 21:06", amount: "1.20", total: "123459" },
            ],
        };
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

    renderMembers(list) {
        let content = this.getNode("Panel/Content/MemberTab/MemberScroll/content");
        if (!content) return;
        content.removeAllChildren();
        list = list || [];
        let itemHeight = 184;
        let gap = 10;
        let contentHeight = Math.max(content.parent.height, list.length * (itemHeight + gap));
        content.setContentSize(cc.size(content.width || 1038, contentHeight));

        cc.loader.loadRes("Main/Prefab/BusinessAnalysisMemberItem", (err, prefab) => {
            if (err || !prefab || !cc.isValid(content)) return;
            content.removeAllChildren();
            list.forEach((data, index) => {
                let item = cc.instantiate(prefab);
                item.name = "MemberItem_" + (index + 1);
                item.setPosition(0, -itemHeight / 2 - index * (itemHeight + gap));
                content.addChild(item);
                this.renderMemberItem(item, data);
            });
        });
    },

    renderMemberItem(item, data) {
        this.setChildActive(item, "CaptainBadge", !!data.isCaptain);
        this.setItemLabel(item, "NameLabel", data.name);
        this.setItemLabel(item, "IdLabel", data.userId);
        this.setItemLabel(item, "StatusLabel", data.online ? "在线" : "离线");
        this.setItemLabel(item, "TodayRoundsLabel", String(data.todayRounds));
        this.setItemLabel(item, "YesterdayRoundsLabel", String(data.yesterdayRounds));
        this.setItemLabel(item, "TodayContributionLabel", String(data.todayContribution));
        this.setItemLabel(item, "YesterdayContributionLabel", String(data.yesterdayContribution));
        this.setItemLabel(item, "TodayWinLabel", String(data.todayWin));
        this.setItemLabel(item, "YesterdayWinLabel", String(data.yesterdayWin));
        this.setItemLabel(item, "ScoreLabel", String(data.score));
        this.setItemLabel(item, "TodayBox/Label", "今日： " + data.todayDelta);
        this.setItemLabel(item, "YesterdayBox/Label", "昨日： " + data.yesterdayDelta);

        let statusNode = this.getNodeFrom(item, "StatusLabel");
        if (statusNode) statusNode.color = data.online ? cc.color(30, 190, 75) : cc.color(95, 95, 95);

        this.bindItemButton(item, "SetPartnerButton", "设置合伙人功能待接入");
        this.bindItemButton(item, "ForbidButton", "禁止游戏功能待接入");
        this.bindItemButton(item, "RecordButton", "战绩明细功能待接入");
        this.bindItemButton(item, "AddScoreButton", "上分功能待接入");
        this.bindItemButton(item, "ReduceScoreButton", "下分功能待接入");
    },

    renderAgentStats(list) {
        let content = this.getNode("Panel/Content/AgentStatsTab/MemberScroll/content");
        if (!content) return;
        content.removeAllChildren();
        list = list || [];
        let itemHeight = 100;
        let gap = 8;
        let contentHeight = Math.max(content.parent.height, list.length * (itemHeight + gap));
        content.setContentSize(cc.size(content.width || 1038, contentHeight));

        cc.loader.loadRes("Main/Prefab/BusinessAnalysisAgentStatsItem", (err, prefab) => {
            if (err || !prefab || !cc.isValid(content)) return;
            content.removeAllChildren();
            list.forEach((data, index) => {
                let item = cc.instantiate(prefab);
                item.name = "AgentStatsItem_" + (index + 1);
                item.setPosition(0, -itemHeight / 2 - index * (itemHeight + gap));
                content.addChild(item);
                this.renderAgentStatsItem(item, data);
            });
        });
    },

    renderAgentStatsItem(item, data) {
        this.setItemLabel(item, "NameLabel", data.name);
        this.setItemLabel(item, "IdLabel", data.userId);
        this.setItemLabel(item, "PersonLabel", String(data.personCount));
        this.setItemLabel(item, "ShouyiLabel", String(data.income));
        this.setItemLabel(item, "CyJFLabel", String(data.memberScore));
        this.setItemLabel(item, "WinLabel", String(data.win));
        this.setItemLabel(item, "ScoreLabel", String(data.contribution));

        let winNode = this.getNodeFrom(item, "WinLabel");
        if (winNode) {
            let value = Number(data.win) || 0;
            winNode.color = value > 0 ? cc.color(40, 170, 70) : value < 0 ? cc.color(210, 65, 65) : cc.color(120, 75, 45);
        }
    },

    renderRewardDetails(data) {
        data = data || {};
        let content = this.getNode("Panel/Content/RewardDetailTab/RewardScroll/content");
        if (!content) return;
        content.removeAllChildren();

        let list = data.list || [];
        let itemHeight = 56;
        let gap = 8;
        let contentHeight = Math.max(content.parent.height, list.length * (itemHeight + gap));
        content.setContentSize(cc.size(content.width || 1038, contentHeight));

        this.setLabel("Panel/Content/RewardDetailTab/SummaryValues/TotalTicketLabel", String(data.totalTicket || 0));
        this.setLabel("Panel/Content/RewardDetailTab/SummaryValues/SubRewardLabel", String(data.subReward || 0));
        this.setLabel("Panel/Content/RewardDetailTab/SummaryValues/MyIncomeLabel", String(data.myIncome || 0));

        cc.loader.loadRes("Main/Prefab/BusinessAnalysisRewardDetailItem", (err, prefab) => {
            if (err || !prefab || !cc.isValid(content)) return;
            content.removeAllChildren();
            list.forEach((row, index) => {
                let item = cc.instantiate(prefab);
                item.name = "RewardDetailItem_" + (index + 1);
                item.setPosition(0, -itemHeight / 2 - index * (itemHeight + gap));
                content.addChild(item);
                this.renderRewardDetailItem(item, row);
            });
        });
    },

    renderRewardDetailItem(item, data) {
        this.setItemLabel(item, "RewardLabel", data.reward);
        this.setItemLabel(item, "GameLabel", data.gameName);
        this.setItemLabel(item, "PlayerCountLabel", data.playerCount);
        this.setItemLabel(item, "RoomIdLabel", data.roomId);
        this.setItemLabel(item, "DateLabel", data.date);

        let rewardNode = this.getNodeFrom(item, "RewardLabel");
        if (rewardNode) rewardNode.color = cc.color(190, 50, 45);
    },

    renderOperateLogs(list) {
        let content = this.getNode("Panel/Content/OperateLogTab/OperateScroll/content");
        if (!content) return;
        content.removeAllChildren();
        list = list || [];
        let itemHeight = 100;
        let gap = 8;
        let contentHeight = Math.max(content.parent.height, list.length * (itemHeight + gap));
        content.setContentSize(cc.size(content.width || 1038, contentHeight));

        cc.loader.loadRes("Main/Prefab/BusinessAnalysisOperateLogItem", (err, prefab) => {
            if (err || !prefab || !cc.isValid(content)) return;
            content.removeAllChildren();
            list.forEach((row, index) => {
                let item = cc.instantiate(prefab);
                item.name = "OperateLogItem_" + (index + 1);
                item.setPosition(0, -itemHeight / 2 - index * (itemHeight + gap));
                content.addChild(item);
                this.renderOperateLogItem(item, row);
            });
        });
    },

    renderOperateLogItem(item, data) {
        this.setItemLabel(item, "PlayerNameLabel", data.playerName);
        this.setItemLabel(item, "PlayerIdLabel", data.playerId);
        this.setItemLabel(item, "ScoreRecordLabel", data.scoreRecord);
        this.setItemLabel(item, "PlayerRemainLabel", String(data.playerRemain));
        this.setItemLabel(item, "OperatorNameLabel", data.operatorName);
        this.setItemLabel(item, "OperatorIdLabel", data.operatorId);
        this.setItemLabel(item, "OperatorRemainLabel", String(data.operatorRemain));
        this.setItemLabel(item, "DateLabel", data.date);

        let scoreNode = this.getNodeFrom(item, "ScoreRecordLabel");
        if (scoreNode) {
            let value = parseFloat(data.scoreRecord);
            scoreNode.color = value >= 0 ? cc.color(205, 45, 45) : cc.color(30, 150, 75);
        }
    },

    renderRewardWithdraw(data) {
        data = data || {};
        let content = this.getNode("Panel/Content/RewardWithdrawTab/WithdrawScroll/content");
        if (!content) return;
        content.removeAllChildren();

        this.setLabel("Panel/Content/RewardWithdrawTab/CurrentRewardLabel", "当前奖励：" + (data.currentReward || 0));

        let list = data.list || [];
        let itemHeight = 56;
        let gap = 8;
        let contentHeight = Math.max(content.parent.height, list.length * (itemHeight + gap));
        content.setContentSize(cc.size(content.width || 1038, contentHeight));

        cc.loader.loadRes("Main/Prefab/BusinessAnalysisRewardWithdrawItem", (err, prefab) => {
            if (err || !prefab || !cc.isValid(content)) return;
            content.removeAllChildren();
            list.forEach((row, index) => {
                let item = cc.instantiate(prefab);
                item.name = "RewardWithdrawItem_" + (index + 1);
                item.setPosition(0, -itemHeight / 2 - index * (itemHeight + gap));
                content.addChild(item);
                this.renderRewardWithdrawItem(item, row);
            });
        });
    },

    renderRewardWithdrawItem(item, data) {
        this.setItemLabel(item, "DateLabel", data.date);
        this.setItemLabel(item, "AmountLabel", data.amount);
        this.setItemLabel(item, "TotalLabel", data.total);
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

    onMemberSearch() {
        Cache.playSfx();
        Cache.alertTip("成员查询功能待接入");
    },

    onAgentStatsSearch() {
        Cache.playSfx();
        Cache.alertTip("代理统计查询功能待接入");
    },

    onRewardStartDate() {
        Cache.playSfx();
        Cache.alertTip("开始日期选择待接入");
    },

    onRewardEndDate() {
        Cache.playSfx();
        Cache.alertTip("结束日期选择待接入");
    },

    onOperateStartDate() {
        Cache.playSfx();
        Cache.alertTip("操作记录开始日期选择待接入");
    },

    onOperateEndDate() {
        Cache.playSfx();
        Cache.alertTip("操作记录结束日期选择待接入");
    },

    onWithdrawStartDate() {
        Cache.playSfx();
        Cache.alertTip("奖励提取开始日期选择待接入");
    },

    onWithdrawEndDate() {
        Cache.playSfx();
        Cache.alertTip("奖励提取结束日期选择待接入");
    },

    onWithdrawReward() {
        Cache.playSfx();
        Cache.alertTip("奖励提取功能待接入");
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
