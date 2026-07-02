const Cache = require("../../../../Main/Script/Cache");

cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad() {
        this.node.addComponent(cc.BlockInputEvents);
        this.tabs = [
            { key: "Stats", node: "StatsTab", button: "Tab_Stats", title: "统计" },
            { key: "Partner", node: "PartnerTab", button: "Tab_Partner", title: "合伙人" },
            { key: "Member", node: "MemberTab", button: "Tab_Member", title: "成员管理" },
            { key: "AgentStats", node: "AgentStatsTab", button: "Tab_AgentStats", title: "代理统计" },
            { key: "RewardDetail", node: "RewardDetailTab", button: "Tab_RewardDetail", title: "奖励明细" },
            { key: "OperateLog", node: "OperateLogTab", button: "Tab_OperateLog", title: "操作记录" },
            { key: "RewardWithdraw", node: "RewardWithdrawTab", button: "Tab_RewardWithdraw", title: "奖励提取" },
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
        cc.loader.loadRes("hall/经营分析/images/left_tab_normal", cc.SpriteFrame, (err, spriteFrame) => {
            if (!err && spriteFrame) {
                this.tabSprites.normal = spriteFrame;
                this.showTab(this.currentTab || "Stats");
            }
        });
        cc.loader.loadRes("hall/经营分析/images/left_tab_selected", cc.SpriteFrame, (err, spriteFrame) => {
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

        cc.loader.loadRes("Main/Prefab/BusinessAnalysis/BusinessAnalysisPartnerItem", (err, prefab) => {
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
        this.bindItemButton(item, "AdjustRateButton", this.showAdjustRatePopup.bind(this));
        this.bindItemButton(item, "WarningButton", this.showWarningPopup.bind(this));
        this.bindItemButton(item, "ChildrenButton", this.showChildrenPopup.bind(this));
        this.bindItemButton(item, "AddScoreButton", this.showScorePopup.bind(this));
        this.bindItemButton(item, "ReduceScoreButton", this.showScorePopup.bind(this));
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

        cc.loader.loadRes("Main/Prefab/BusinessAnalysis/BusinessAnalysisMemberItem", (err, prefab) => {
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

        this.bindItemButton(item, "SetPartnerButton", this.showSetPartnerPopup.bind(this));
        this.bindItemButton(item, "ForbidButton", this.showForbidPopup.bind(this));
        this.bindItemButton(item, "RecordButton", this.showRecordPopup.bind(this));
        this.bindItemButton(item, "AddScoreButton", this.showScorePopup.bind(this));
        this.bindItemButton(item, "ReduceScoreButton", this.showScorePopup.bind(this));
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

        cc.loader.loadRes("Main/Prefab/BusinessAnalysis/BusinessAnalysisAgentStatsItem", (err, prefab) => {
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

        cc.loader.loadRes("Main/Prefab/BusinessAnalysis/BusinessAnalysisRewardDetailItem", (err, prefab) => {
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

        cc.loader.loadRes("Main/Prefab/BusinessAnalysis/BusinessAnalysisOperateLogItem", (err, prefab) => {
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

        cc.loader.loadRes("Main/Prefab/BusinessAnalysis/BusinessAnalysisRewardWithdrawItem", (err, prefab) => {
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
            if (tab.key === key) this.setLabel("Panel/Header/TitleLabel", tab.title || "经营分析");

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
        this.showInvitePopup();
    },

    onSetPartner() {
        Cache.playSfx();
        this.showSetPartnerPopup();
    },

    onPartnerSearch() {
        Cache.playSfx();
        this.showSearchPopup("合伙人查询");
    },

    onMemberSearch() {
        Cache.playSfx();
        this.showSearchMemberPopup();
    },

    onAgentStatsSearch() {
        Cache.playSfx();
        this.showSearchPopup("代理统计查询");
    },

    onRewardStartDate() {
        Cache.playSfx();
        this.showDatePopup("开始日期");
    },

    onRewardEndDate() {
        Cache.playSfx();
        this.showDatePopup("结束日期");
    },

    onOperateStartDate() {
        Cache.playSfx();
        this.showDatePopup("操作记录开始日期");
    },

    onOperateEndDate() {
        Cache.playSfx();
        this.showDatePopup("操作记录结束日期");
    },

    onWithdrawStartDate() {
        Cache.playSfx();
        this.showDatePopup("奖励提取开始日期");
    },

    onWithdrawEndDate() {
        Cache.playSfx();
        this.showDatePopup("奖励提取结束日期");
    },

    onWithdrawReward() {
        Cache.playSfx();
        this.showWithdrawConfirmPopup();
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

    bindItemButton(root, path, handler) {
        let node = this.getNodeFrom(root, path);
        if (!node) return;
        let button = node.getComponent(cc.Button) || node.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.08;
        button.zoomScale = 0.96;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, () => {
            Cache.playSfx();
            if (typeof handler === "function") {
                handler();
            } else {
                this.showTextPopup("提示", handler || "功能待接入");
            }
        }, this);
    },

    showBusinessPopupPrefab(prefabName, setup) {
        this.closeBusinessPopup();

        let mask = new cc.Node("BusinessPopupMask");
        this.node.addChild(mask, 999);
        mask.setContentSize(this.node.getContentSize());
        mask.addComponent(cc.BlockInputEvents);
        let maskGraphics = mask.addComponent(cc.Graphics);
        maskGraphics.fillColor = cc.color(0, 0, 0, 165);
        maskGraphics.rect(-this.node.width / 2, -this.node.height / 2, this.node.width, this.node.height);
        maskGraphics.fill();
        this.businessPopup = mask;

        cc.loader.loadRes("Main/Prefab/BusinessAnalysis/" + prefabName, (err, prefab) => {
            if (err || !prefab || !cc.isValid(mask)) {
                Cache.alertTip("弹窗资源加载失败：" + prefabName);
                return;
            }
            let panel = cc.instantiate(prefab);
            panel.name = prefabName;
            mask.addChild(panel);
            let close = this.getNodeFrom(panel, "CloseButton");
            if (close) this.bindItemButton(panel, "CloseButton", this.closeBusinessPopup.bind(this));
            if (typeof setup === "function") setup(panel);
        });
        return true;
    },

    showSetPartnerPopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupSetPartner", (panel) => {
            this.bindItemButton(panel, "Content/ConfirmButton", () => {
                Cache.alertTip("设置合伙人接口待接入");
            });
        })) return;

        let popup = this.createFormPopupBase("添加合伙人");
        let c = popup.content;

        this.addPopupLabel(c, "RoomRateTitle", "房费比例:", -205, 95, 170, 42, 30, cc.Color.WHITE);
        this.addPopupField(c, "RoomRateInput", "0", 50, 95, 330, 54);
        this.addPopupLabel(c, "RoomPercent", "%", 245, 95, 44, 42, 30, cc.Color.WHITE);

        this.addPopupLabel(c, "WaterRateTitle", "抽水比例:", -205, 5, 170, 42, 30, cc.Color.WHITE);
        this.addPopupField(c, "WaterRateInput", "0", 50, 5, 330, 54);
        this.addPopupLabel(c, "WaterPercent", "%", 245, 5, 44, 42, 30, cc.Color.WHITE);

        this.addPopupImageButton(c, "ConfirmButton", "hall/经营分析/images/btn_confirm_green", "确定", 0, -115, 128, 58, () => {
            Cache.alertTip("设置合伙人接口待接入");
        });
    },

    showAdjustRatePopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupAdjustRate", (panel) => {
            this.bindItemButton(panel, "Content/ConfirmButton", () => {
                Cache.alertTip("调整比例接口待接入");
            });
        })) return;

        let popup = this.createFormPopupBase("调整比例");
        let c = popup.content;

        this.addPopupLabel(c, "RoomRateTitle", "房费比例:", -205, 95, 170, 42, 30, cc.Color.WHITE);
        this.addPopupField(c, "RoomRateInput", "0", 50, 95, 330, 54);
        this.addPopupLabel(c, "RoomPercent", "%", 245, 95, 44, 42, 30, cc.Color.WHITE);

        this.addPopupLabel(c, "WaterRateTitle", "抽水比例:", -205, 5, 170, 42, 30, cc.Color.WHITE);
        this.addPopupField(c, "WaterRateInput", "0", 50, 5, 330, 54);
        this.addPopupLabel(c, "WaterPercent", "%", 245, 5, 44, 42, 30, cc.Color.WHITE);

        this.addPopupImageButton(c, "ConfirmButton", "hall/经营分析/images/btn_confirm_green", "确定", 0, -115, 128, 58, () => {
            Cache.alertTip("调整比例接口待接入");
        });
    },

    showWarningPopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupWarning", (panel) => {
            this.bindItemButton(panel, "Content/ConfirmButton", () => {
                Cache.alertTip("调整警戒值接口待接入");
            });
        })) return;

        let popup = this.createFormPopupBase("设置警戒值");
        let c = popup.content;
        this.addPopupLabel(c, "WarningTitle", "警戒分:", -190, 95, 150, 42, 30, cc.Color.WHITE);
        this.addPopupField(c, "WarningInput", "0", 50, 95, 330, 54);
        this.addPopupLabel(c, "WarningPercent", "%", 245, 95, 44, 42, 30, cc.Color.WHITE);
        this.addPopupLabel(c, "TipLabel", "注：一条线玩家总分数低于警戒值分，玩家不能进入游戏，警戒分设置0，警戒解除，只能给直属代理和玩家设置！", 0, -12, 520, 92, 19, cc.Color.WHITE);
        this.addPopupImageButton(c, "ConfirmButton", "hall/经营分析/images/btn_confirm_green", "确定", 0, -125, 128, 58, () => {
            Cache.alertTip("调整警戒值接口待接入");
        });
    },

    showChildrenPopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupChildren", (panel) => {
            let showMode = this.switchChildrenPopupMode.bind(this, panel);
            this.bindItemButton(panel, "LeftPanel/CaptainTabButton", () => showMode(true));
            this.bindItemButton(panel, "LeftPanel/MemberTabButton", () => showMode(false));
            this.bindItemButton(panel, "RightPanel/SearchButton", () => {
                Cache.alertTip("查看下级查询接口待接入");
            });
            showMode(true);
        })) return;

        this.closeBusinessPopup();

        let mask = new cc.Node("BusinessPopupMask");
        this.node.addChild(mask, 999);
        mask.setContentSize(this.node.getContentSize());
        mask.addComponent(cc.BlockInputEvents);
        let maskGraphics = mask.addComponent(cc.Graphics);
        maskGraphics.fillColor = cc.color(0, 0, 0, 165);
        maskGraphics.rect(-this.node.width / 2, -this.node.height / 2, this.node.width, this.node.height);
        maskGraphics.fill();

        let panel = new cc.Node("ChildrenPopupPanel");
        mask.addChild(panel);
        panel.setContentSize(cc.size(1075, 604));
        this.addPopupSprite(panel, "Bg", "hall/经营分析/images/popup_children_bg", 0, 0, 1075, 604);

        this.addPopupLabel(panel, "TitleLabel", "查看下级", 0, 258, 260, 62, 40, cc.Color.WHITE);
        let close = this.addPopupSprite(panel, "CloseButton", "hall/经营分析/images/popup_close_btn", 520, 265, 54, 54);
        close.addComponent(cc.Button);
        close.on(cc.Node.EventType.TOUCH_END, this.closeBusinessPopup, this);

        let left = new cc.Node("LeftPanel");
        panel.addChild(left);
        left.setPosition(-420, -20);
        left.setContentSize(cc.size(225, 470));

        this.addPopupBlock(left, "TopUserBg", 0, 186, 214, 78, cc.color(255, 240, 210));
        this.addPopupSprite(left, "LeaderBadge", "hall/经营分析/images/badge_superior_captain", -92, 186, 30, 74);
        this.addPopupSprite(left, "LeaderAvatar", "hall/经营分析/images/avatar_placeholder_bg", -50, 186, 62, 62);
        this.addPopupLabel(left, "LeaderName", "玩家信息", 35, 202, 120, 28, 20, cc.color(120, 75, 45));
        this.addPopupLabel(left, "LeaderId", "123456", 35, 172, 120, 28, 20, cc.color(120, 75, 45));

        let captainBtn = this.addPopupSprite(left, "CaptainTabButton", "hall/经营分析/images/btn_large_orange", 0, 84, 205, 67);
        captainBtn.addComponent(cc.Button);
        this.addPopupLabel(captainBtn, "Label", "下级队长", 0, 1, 180, 54, 32, cc.Color.WHITE);

        let memberBtn = this.addPopupSprite(left, "MemberTabButton", "hall/经营分析/images/btn_large_green", 0, -3, 205, 67);
        memberBtn.addComponent(cc.Button);
        this.addPopupLabel(memberBtn, "Label", "下级成员", 0, 1, 180, 54, 32, cc.Color.WHITE);

        let right = new cc.Node("RightPanel");
        panel.addChild(right);
        right.setPosition(120, -20);
        right.setContentSize(cc.size(780, 470));

        let header = this.addPopupBlock(right, "HeaderRow", 0, 202, 780, 62, cc.color(65, 155, 80));
        let listLayer = new cc.Node("ListLayer");
        right.addChild(listLayer);
        listLayer.setPosition(0, 0);
        listLayer.setContentSize(cc.size(780, 340));

        let input = this.addPopupSprite(right, "SearchInputBg", "hall/经营分析/images/input_field_bg", -235, -220, 290, 50);
        this.addPopupLabel(input, "Placeholder", "", 0, 0, 260, 38, 22, cc.color(150, 120, 100));
        let query = this.addPopupSprite(right, "SearchButton", "hall/经营分析/images/btn_query_yellow", 55, -220, 126, 52);
        query.addComponent(cc.Button);
        this.addPopupLabel(query, "Label", "查询", 0, 2, 100, 40, 26, cc.Color.WHITE);
        query.on(cc.Node.EventType.TOUCH_END, () => {
            Cache.playSfx();
            Cache.alertTip("查看下级查询接口待接入");
        }, this);

        let state = { mode: "captain" };
        let render = () => {
            header.removeAllChildren();
            listLayer.removeAllChildren();
            let captainMode = state.mode === "captain";
            this.setPopupSprite(captainBtn, captainMode ? "hall/经营分析/images/btn_large_orange" : "hall/经营分析/images/btn_large_green");
            this.setPopupSprite(memberBtn, captainMode ? "hall/经营分析/images/btn_large_green" : "hall/经营分析/images/btn_large_orange");

            if (captainMode) {
                this.renderChildrenCaptainHeader(header);
                this.renderChildrenCaptainRows(listLayer);
            } else {
                this.renderChildrenMemberHeader(header);
                this.renderChildrenMemberRows(listLayer);
            }
        };

        captainBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Cache.playSfx();
            state.mode = "captain";
            render();
        }, this);
        memberBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Cache.playSfx();
            state.mode = "member";
            render();
        }, this);

        this.businessPopup = mask;
        render();
    },

    switchChildrenPopupMode(panel, captainMode) {
        this.setChildActive(panel, "RightPanel/CaptainView", captainMode);
        this.setChildActive(panel, "RightPanel/MemberView", !captainMode);
        this.setPopupSprite(this.getNodeFrom(panel, "LeftPanel/CaptainTabButton"), captainMode ? "hall/经营分析/images/btn_large_green" : "hall/经营分析/images/btn_large_yellow");
        this.setPopupSprite(this.getNodeFrom(panel, "LeftPanel/MemberTabButton"), captainMode ? "hall/经营分析/images/btn_large_yellow" : "hall/经营分析/images/btn_large_green");
    },

    showScorePopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupScore", (panel) => {
            this.bindItemButton(panel, "Content/AddModeButton", () => {
                Cache.alertTip("切换增加积分");
            });
            this.bindItemButton(panel, "Content/ReduceModeButton", () => {
                Cache.alertTip("切换减少积分");
            });
            this.bindItemButton(panel, "Content/ConfirmButton", () => {
                Cache.alertTip("上下分接口待接入");
            });
        })) return;

        let popup = this.createKeyboardPopupBase("加减积分");
        let c = popup.content;
        let leftPanel = this.addPopupBlock(c, "ModePanel", -335, 0, 220, 485, cc.color(177, 143, 130));
        this.addPopupImageButton(leftPanel, "AddModeButton", "hall/经营分析/images/btn_large_orange", "增加积分", 0, 177, 194, 72, null, 30);
        this.addPopupImageButton(leftPanel, "ReduceModeButton", "hall/经营分析/images/btn_large_green", "减少积分", 0, 87, 194, 72, null, 30);

        this.addPopupBlock(c, "InputPanel", 165, 190, 590, 72, cc.color(177, 143, 130));
        this.addPopupField(c, "ScoreInput", "+0", 165, 190, 520, 58);

        let keys = [
            ["1", -75, 100], ["2", 140, 100], ["3", 355, 100],
            ["4", -75, 15], ["5", 140, 15], ["6", 355, 15],
            ["7", -75, -70], ["8", 140, -70], ["9", 355, -70],
            [".", -75, -155], ["0", 140, -155], ["重输", 355, -155],
        ];
        keys.forEach((key) => {
            this.addKeyboardKey(c, key[0], key[1], key[2]);
        });

        this.addPopupLabel(c, "MyScoreLabel", "我的积分：99999", -95, -245, 280, 42, 28, cc.color(82, 72, 150));
        this.addPopupImageButton(c, "ConfirmButton", "hall/经营分析/images/btn_confirm_green", "确认操作", 360, -245, 205, 72, () => {
            Cache.alertTip("上下分接口待接入");
        }, 28);
    },

    renderChildrenCaptainHeader(header) {
        [
            ["玩家信息", -295, 160],
            ["比例", -105, 105],
            ["昨日收益\n昨日局数", 55, 145],
            ["今日收益\n今日局数", 225, 145],
            ["积分", 360, 90],
        ].forEach((item) => this.addPopupLabel(header, item[0] + "Title", item[0], item[1], 0, item[2], 50, 22, cc.Color.WHITE));
    },

    renderChildrenCaptainRows(layer) {
        let rows = [
            { name: "玩家信息", id: "123456", roomRate: "房费:100%", waterRate: "抽水:100%", yesterdayIncome: 0, yesterdayRounds: 0, todayIncome: 0, todayRounds: 0, score: 9999 },
        ];
        rows.forEach((row, index) => {
            let y = 150 - index * 104;
            this.addPopupBlock(layer, "CaptainRowBg" + index, 0, y, 770, 92, cc.color(255, 240, 210));
            this.addPopupSprite(layer, "Avatar" + index, "hall/经营分析/images/avatar_placeholder_bg", -345, y, 70, 70);
            this.addPopupLabel(layer, "Name" + index, row.name + "\n" + row.id, -270, y, 105, 56, 20, cc.color(120, 75, 45));
            this.addPopupLabel(layer, "Rate" + index, row.roomRate + "\n" + row.waterRate, -105, y, 125, 56, 20, cc.color(120, 75, 45));
            this.addPopupLabel(layer, "Yesterday" + index, row.yesterdayIncome + "\n" + row.yesterdayRounds, 55, y, 90, 56, 20, cc.color(120, 75, 45));
            this.addPopupLabel(layer, "Today" + index, row.todayIncome + "\n" + row.todayRounds, 225, y, 90, 56, 20, cc.color(120, 75, 45));
            this.addPopupLabel(layer, "Score" + index, String(row.score), 360, y, 90, 40, 20, cc.color(120, 75, 45));
        });
    },

    renderChildrenMemberHeader(header) {
        [
            ["玩家信息", -295, 160],
            ["局数", -105, 80],
            ["积分", 5, 90],
            ["大赢家次数", 145, 130],
            ["总赢分", 285, 100],
            ["贡献分", 395, 90],
        ].forEach((item) => this.addPopupLabel(header, item[0] + "Title", item[0], item[1], 0, item[2], 50, 22, cc.Color.WHITE));
    },

    renderChildrenMemberRows(layer) {
        let rows = [
            { name: "玩家信息", id: "123456", rounds: 99, score: 999999, winner: 0, totalWin: 9999, contribution: 9999 },
            { name: "玩家信息", id: "123456", rounds: 99, score: 999999, winner: 0, totalWin: 9999, contribution: 9999 },
        ];
        rows.forEach((row, index) => {
            let y = 150 - index * 104;
            this.addPopupBlock(layer, "MemberRowBg" + index, 0, y, 770, 92, cc.color(255, 240, 210));
            this.addPopupSprite(layer, "Avatar" + index, "hall/经营分析/images/avatar_placeholder_bg", -345, y, 70, 70);
            this.addPopupLabel(layer, "Name" + index, row.name + "\n" + row.id, -270, y, 105, 56, 20, cc.color(120, 75, 45));
            this.addPopupLabel(layer, "Rounds" + index, String(row.rounds), -105, y, 80, 40, 20, cc.color(120, 75, 45));
            this.addPopupLabel(layer, "Score" + index, String(row.score), 5, y, 100, 40, 20, cc.color(120, 75, 45));
            this.addPopupLabel(layer, "Winner" + index, String(row.winner), 145, y, 100, 40, 20, cc.color(120, 75, 45));
            this.addPopupLabel(layer, "TotalWin" + index, String(row.totalWin), 285, y, 100, 40, 20, cc.color(120, 75, 45));
            this.addPopupLabel(layer, "Contribution" + index, String(row.contribution), 395, y, 90, 40, 20, cc.color(120, 75, 45));
        });
    },

    showRecordPopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupRecord", (panel) => {
            this.bindItemButton(panel, "Content/CopyReplayCodeButton", () => {
                Cache.alertTip("复制回放码待接入");
            });
            this.bindItemButton(panel, "Content/OpenReplayButton", this.showReplayPopup.bind(this));
        })) return;

        let popup = this.createLargePopupBase("战绩明细");
        let c = popup.content;

        let dateTabs = ["06月28日", "06月27日", "06月27日", "06月27日", "06月27日", "06月27日", "06月27日"];
        dateTabs.forEach((text, index) => {
            this.addPopupImageButton(c, "DateTab" + index, index === 0 ? "hall/经营分析/images/btn_large_orange" : "hall/经营分析/images/btn_large_green", text, -440 + index * 145, 205, 130, 54, null, 24);
        });

        this.addPopupBlock(c, "UserSummaryBg", 0, 145, 980, 100, cc.color(255, 236, 195));
        this.addPopupSprite(c, "Avatar", "hall/经营分析/images/avatar_placeholder_bg", -430, 145, 66, 66);
        this.addPopupLabel(c, "UserNameLabel", "玩家信息\n123456", -350, 145, 125, 66, 22, cc.color(130, 75, 35));
        this.addPopupLabel(c, "TodayRoundsLabel", "今日局数： 1", -90, 145, 210, 52, 26, cc.color(130, 75, 35));
        this.addPopupLabel(c, "WinLabel", "输赢： -35.6", 230, 145, 230, 52, 26, cc.color(50, 155, 70));

        this.addPopupBlock(c, "RoomHeader", 0, 66, 980, 42, cc.color(90, 165, 88));
        this.addPopupLabel(c, "RoomInfoLabel", "房间ID:123456  2019-12-12 12:12", -315, 66, 350, 36, 22, cc.Color.WHITE);
        this.addPopupLabel(c, "GameNameLabel", "牛牛0.5底", 0, 66, 180, 36, 22, cc.Color.WHITE);
        this.addPopupLabel(c, "ReplayCodeLabel", "回访码：WEEWTFDGDFFGDFGAF", 270, 66, 360, 36, 22, cc.Color.WHITE);

        let detail = this.addPopupBlock(c, "DetailPanel", 0, -33, 980, 150, cc.color(255, 236, 195));
        for (let i = 0; i < 8; i++) {
            let x = -390 + i * 100;
            this.addPopupBlock(detail, "PlayerIconBg" + i, x, 32, 62, 62, cc.color(235, 235, 235));
            this.addPopupLabel(detail, "PlayerName" + i, "哇卡一为...\n12****6", x, -28, 80, 42, 16, cc.color(130, 75, 35));
            this.addPopupLabel(detail, "PlayerScore" + i, i === 0 ? "+3605" : "-36", x, -70, 82, 30, 20, i === 0 ? cc.color(220, 130, 25) : cc.color(45, 92, 210));
        }
        this.addPopupImageButton(c, "CopyReplayCodeButton", "hall/经营分析/images/btn_small_blue", "复制回放码", 415, -4, 132, 54, () => {
            Cache.alertTip("复制回放码待接入");
        }, 21);
        this.addPopupImageButton(c, "OpenReplayButton", "hall/经营分析/images/btn_small_blue", "查看回放", 415, -68, 132, 54, this.showReplayPopup.bind(this), 22);
    },

    showReplayPopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupReplay", (panel) => {
            this.bindItemButton(panel, "Content/ReplayButton0", () => {
                Cache.alertTip("回放播放待接入");
            });
            this.bindItemButton(panel, "Content/ReplayButton1", () => {
                Cache.alertTip("回放播放待接入");
            });
            this.bindItemButton(panel, "Content/ReplayScroll/content/ReplayButton0", () => {
                Cache.alertTip("回放播放待接入");
            });
            this.bindItemButton(panel, "Content/ReplayScroll/content/ReplayButton1", () => {
                Cache.alertTip("回放播放待接入");
            });
            this.bindItemButton(panel, "Content/ReplayScroll/content/ReplayButton2", () => {
                Cache.alertTip("回放播放待接入");
            });
        })) return;

        let popup = this.createLargePopupBase("战绩回放");
        let c = popup.content;
        this.addPopupBlock(c, "RoomHeader", 0, 195, 980, 42, cc.color(90, 165, 88));
        this.addPopupLabel(c, "RoomLabel", "房间号：9999999", -350, 195, 240, 36, 22, cc.Color.WHITE);
        this.addPopupLabel(c, "RoundLabel", "局数：7", -130, 195, 120, 36, 22, cc.Color.WHITE);

        [
            { result: "输", color: cc.color(55, 115, 190), y: 78 },
            { result: "赢", color: cc.color(180, 100, 45), y: -92 },
        ].forEach((row, index) => {
            this.addPopupBlock(c, "ReplayRowBg" + index, 0, row.y, 980, 150, cc.color(255, 236, 195));
            this.addPopupBlock(c, "ReplayResultBg" + index, -385, row.y, 195, 150, cc.color(255, 224, 170));
            this.addPopupLabel(c, "ReplayResult" + index, row.result, -430, row.y + 8, 80, 60, 48, row.color);
            this.addPopupLabel(c, "ReplayRound" + index, "1/7", -350, row.y + 5, 90, 60, 42, cc.color(95, 62, 45));
            for (let i = 0; i < 8; i++) {
                let col = i % 2;
                let rr = Math.floor(i / 2);
                let x = -130 + col * 260;
                let y = row.y + 50 - rr * 34;
                this.addPopupLabel(c, "ReplayPlayer" + index + "_" + i, "玩家昵称...", x, y, 140, 30, 21, cc.color(60, 95, 195));
                this.addPopupLabel(c, "ReplayScore" + index + "_" + i, i === 1 ? "-180" : "+18", x + 120, y, 90, 30, 21, i === 1 ? cc.color(35, 155, 70) : cc.color(190, 45, 45));
            }
            this.addPopupImageButton(c, "ReplayButton" + index, "hall/经营分析/images/btn_small_blue", "查看回放", 390, row.y, 145, 56, () => {
                Cache.alertTip("回放播放待接入");
            }, 22);
        });
    },

    showForbidPopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupForbid", (panel) => {
            this.bindItemButton(panel, "Content/CancelButton", this.closeBusinessPopup.bind(this));
            this.bindItemButton(panel, "Content/ConfirmButton", () => {
                Cache.alertTip("禁止游戏接口待接入");
            });
        })) return;

        let popup = this.createFormPopupBase("禁止游戏");
        let c = popup.content;
        this.addPopupLabel(c, "MessageLabel", "确认禁止该玩家游戏？", 0, 58, 520, 70, 30, cc.Color.WHITE);
        this.addPopupImageButton(c, "CancelButton", "hall/经营分析/images/btn_cancel_blue", "取消", -95, -80, 128, 58, this.closeBusinessPopup.bind(this));
        this.addPopupImageButton(c, "ConfirmButton", "hall/经营分析/images/btn_confirm_green", "确定", 95, -80, 128, 58, () => {
            Cache.alertTip("禁止游戏接口待接入");
        });
    },

    showDatePopup(title) {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupDate", (panel) => {
            this.setItemLabel(panel, "TitleLabel", title || "选择日期");
            this.bindItemButton(panel, "Content/CancelButton", this.closeBusinessPopup.bind(this));
            this.bindItemButton(panel, "Content/ConfirmButton", this.closeBusinessPopup.bind(this));
        })) return;

        let popup = this.createFormPopupBase(title || "选择日期");
        let c = popup.content;
        this.addPopupLabel(c, "YearLabel", "2026年", -180, 82, 160, 44, 28, cc.Color.WHITE);
        this.addPopupLabel(c, "MonthLabel", "06月", 0, 82, 120, 44, 28, cc.Color.WHITE);
        this.addPopupLabel(c, "DayLabel", "28日", 160, 82, 120, 44, 28, cc.Color.WHITE);
        this.addPopupBlock(c, "DatePanel", 0, -15, 520, 90, cc.color(255, 248, 235));
        this.addPopupLabel(c, "SelectedLabel", "当前选择：2026-06-28", 0, -15, 420, 50, 26, cc.color(120, 75, 45));
        this.addPopupImageButton(c, "CancelButton", "hall/经营分析/images/btn_cancel_blue", "取消", -95, -130, 128, 58, this.closeBusinessPopup.bind(this));
        this.addPopupImageButton(c, "ConfirmButton", "hall/经营分析/images/btn_confirm_green", "确定", 95, -130, 128, 58, this.closeBusinessPopup.bind(this));
    },

    showSearchPopup(title) {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupSearch", (panel) => {
            this.setItemLabel(panel, "TitleLabel", title || "查询");
            this.bindItemButton(panel, "Content/SearchConfirmButton", () => {
                Cache.alertTip("查询接口待接入");
            });
        })) return;

        let popup = this.createKeyboardPopupBase(title || "搜索成员");
        let c = popup.content;
        this.addSearchKeyboardContent(c, "输入ID号：", "查询接口待接入");
    },

    showSearchMemberPopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupSearchMember", (panel) => {
            this.bindItemButton(panel, "Content/SearchConfirmButton", () => {
                Cache.alertTip("成员查询接口待接入");
            });
        })) return;

        let popup = this.createKeyboardPopupBase("搜索成员");
        let c = popup.content;
        this.addSearchKeyboardContent(c, "输入ID号：", "成员查询接口待接入");
    },

    showInvitePopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupInvite", (panel) => {
            this.bindItemButton(panel, "Content/SearchConfirmButton", () => {
                Cache.alertTip("邀请玩家接口待接入");
            });
        })) return;

        let popup = this.createKeyboardPopupBase("邀请玩家");
        let c = popup.content;
        this.addSearchKeyboardContent(c, "输入ID号：", "邀请玩家接口待接入");
    },

    showWithdrawConfirmPopup() {
        if (this.showBusinessPopupPrefab("BusinessAnalysisPopupWithdrawConfirm", (panel) => {
            this.bindItemButton(panel, "Content/CancelButton", this.closeBusinessPopup.bind(this));
            this.bindItemButton(panel, "Content/ConfirmButton", () => {
                Cache.alertTip("奖励提取接口待接入");
            });
        })) return;

        let popup = this.createFormPopupBase("奖励提取");
        let c = popup.content;
        this.addPopupLabel(c, "MessageLabel", "确认取出当前奖励？", 0, 58, 520, 70, 30, cc.Color.WHITE);
        this.addPopupLabel(c, "RewardLabel", "当前奖励：2.7", 0, 4, 420, 40, 26, cc.Color.WHITE);
        this.addPopupImageButton(c, "CancelButton", "hall/经营分析/images/btn_cancel_blue", "取消", -95, -115, 128, 58, this.closeBusinessPopup.bind(this));
        this.addPopupImageButton(c, "ConfirmButton", "hall/经营分析/images/btn_confirm_green", "确定", 95, -115, 128, 58, () => {
            Cache.alertTip("奖励提取接口待接入");
        });
    },

    createFormPopupBase(title) {
        return this.createArtPopupBase(title, 583, 444, "hall/经营分析/images/popup_small_bg", cc.size(540, 300), cc.v2(0, -28));
    },

    createKeyboardPopupBase(title) {
        return this.createArtPopupBase(title, 880, 645, "hall/经营分析/images/popup_large_bg", cc.size(820, 535), cc.v2(0, -40));
    },

    createLargePopupBase(title) {
        return this.createArtPopupBase(title, 1075, 604, "hall/经营分析/images/popup_large_bg", cc.size(980, 485), cc.v2(0, -28));
    },

    createArtPopupBase(title, width, height, bgResource, contentSize, contentPosition) {
        this.closeBusinessPopup();

        let mask = new cc.Node("BusinessPopupMask");
        this.node.addChild(mask, 999);
        mask.setContentSize(this.node.getContentSize());
        mask.addComponent(cc.BlockInputEvents);
        let maskGraphics = mask.addComponent(cc.Graphics);
        maskGraphics.fillColor = cc.color(0, 0, 0, 165);
        maskGraphics.rect(-this.node.width / 2, -this.node.height / 2, this.node.width, this.node.height);
        maskGraphics.fill();

        let panel = new cc.Node("BusinessPopupPanel");
        mask.addChild(panel);
        panel.setContentSize(cc.size(width, height));
        this.addPopupSprite(panel, "PanelBg", bgResource, 0, 0, width, height);

        this.addPopupLabel(panel, "TitleLabel", title || "", 0, height / 2 - 52, 360, 64, 38, cc.Color.WHITE);
        let close = this.addPopupSprite(panel, "CloseButton", "hall/经营分析/images/popup_close_btn", width / 2 - 22, height / 2 - 22, 54, 54);
        close.addComponent(cc.Button);
        close.on(cc.Node.EventType.TOUCH_END, () => {
            Cache.playSfx();
            this.closeBusinessPopup();
        }, this);

        let content = new cc.Node("Content");
        panel.addChild(content);
        content.setContentSize(contentSize || cc.size(width - 60, height - 120));
        content.setPosition(contentPosition || cc.v2(0, -30));

        this.businessPopup = mask;
        return { mask: mask, panel: panel, content: content };
    },

    addSearchKeyboardContent(parent, title, tip) {
        this.addPopupBlock(parent, "InputPanel", 0, 215, 760, 84, cc.color(177, 143, 130));
        this.addPopupLabel(parent, "InputTitle", title || "输入ID号：", -255, 215, 190, 54, 34, cc.Color.WHITE);
        this.addPopupField(parent, "SearchInput", "", 115, 215, 450, 58);

        let keys = [
            ["1", -270, 105], ["2", 0, 105], ["3", 270, 105],
            ["4", -270, 0], ["5", 0, 0], ["6", 270, 0],
            ["7", -270, -105], ["8", 0, -105], ["9", 270, -105],
            ["重输", -270, -210], ["0", 0, -210], ["删除", 270, -210],
        ];
        keys.forEach((key) => {
            this.addKeyboardKey(parent, key[0], key[1], key[2], 260, 92);
        });

        this.addPopupImageButton(parent, "SearchConfirmButton", "hall/经营分析/images/btn_confirm_green", "查询", 380, -285, 128, 58, () => {
            Cache.alertTip(tip || "查询接口待接入");
        }, 26);
    },

    addKeyboardKey(parent, text, x, y, w, h) {
        w = w || 205;
        h = h || 78;
        let key = this.addPopupBlock(parent, "Key_" + text, x, y, w, h, cc.color(86, 76, 165));
        key.addComponent(cc.Button);
        this.addPopupLabel(key, "Label", text, 0, 0, w, h, text.length > 1 ? 38 : 58, cc.Color.WHITE);
        key.on(cc.Node.EventType.TOUCH_END, () => {
            Cache.playSfx();
        }, this);
        return key;
    },

    addPopupImageButton(parent, name, resourcePath, text, x, y, w, h, handler, fontSize) {
        let btn = this.addPopupSprite(parent, name, resourcePath, x, y, w, h);
        btn.addComponent(cc.Button);
        this.addPopupLabel(btn, "Label", text || "", 0, 1, w, h, fontSize || 24, cc.Color.WHITE);
        if (handler) {
            btn.on(cc.Node.EventType.TOUCH_END, () => {
                Cache.playSfx();
                handler();
            }, this);
        }
        return btn;
    },

    addPopupBlock(parent, name, x, y, w, h, fillColor) {
        let node = new cc.Node(name);
        parent.addChild(node);
        node.setPosition(x, y);
        node.setContentSize(cc.size(w, h));
        let graphics = node.addComponent(cc.Graphics);
        graphics.fillColor = fillColor || cc.color(255, 255, 255);
        if (graphics.roundRect) {
            graphics.roundRect(-w / 2, -h / 2, w, h, 8);
        } else {
            graphics.rect(-w / 2, -h / 2, w, h);
        }
        graphics.fill();
        return node;
    },

    addPopupLabel(parent, name, text, x, y, w, h, fontSize, labelColor) {
        let node = new cc.Node(name);
        parent.addChild(node);
        node.setPosition(x, y);
        node.setContentSize(cc.size(w, h));
        node.color = labelColor || cc.Color.WHITE;
        let label = node.addComponent(cc.Label);
        label.string = text || "";
        label.fontSize = fontSize || 22;
        label.lineHeight = Math.ceil((fontSize || 22) * 1.25);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.enableWrapText = true;
        let outline = node.addComponent(cc.LabelOutline);
        outline.width = 1;
        outline.color = cc.color(80, 55, 45);
        return node;
    },

    addPopupField(parent, name, placeholder, x, y, w, h) {
        let bg = this.addPopupBlock(parent, name, x, y, w, h, cc.color(255, 248, 235));
        this.addPopupLabel(bg, "Placeholder", placeholder || "", 0, 0, w - 20, h - 8, 22, cc.color(150, 120, 100));
        return bg;
    },

    addPopupButton(parent, name, text, x, y, w, h, bgColor, handler) {
        let btn = this.addPopupBlock(parent, name, x, y, w, h, bgColor || cc.color(70, 195, 120));
        btn.addComponent(cc.Button);
        this.addPopupLabel(btn, "Label", text || "", 0, 1, w, h, 24, cc.Color.WHITE);
        if (handler) {
            btn.on(cc.Node.EventType.TOUCH_END, () => {
                Cache.playSfx();
                handler();
            }, this);
        }
        return btn;
    },

    addPopupSprite(parent, name, resourcePath, x, y, w, h) {
        let node = new cc.Node(name);
        parent.addChild(node);
        node.setPosition(x, y);
        node.setContentSize(cc.size(w, h));
        let sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.setPopupSprite(node, resourcePath);
        return node;
    },

    setPopupSprite(node, resourcePath) {
        if (!node || !resourcePath) return;
        let sprite = node.getComponent(cc.Sprite);
        if (!sprite) sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        cc.loader.loadRes(resourcePath, cc.SpriteFrame, (err, spriteFrame) => {
            if (!err && spriteFrame && cc.isValid(node)) {
                sprite.spriteFrame = spriteFrame;
            }
        });
    },

    showImagePopup(resourcePath, title) {
        let popup = this.createPopupBase(title || "提示");
        let imageNode = new cc.Node("Image");
        popup.content.addChild(imageNode);
        imageNode.setPosition(0, -12);
        imageNode.setContentSize(cc.size(980, 520));
        let sprite = imageNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        cc.loader.loadRes(resourcePath, cc.SpriteFrame, (err, spriteFrame) => {
            if (err || !spriteFrame || !cc.isValid(imageNode)) {
                this.setPopupMessage(popup.content, "弹窗资源加载失败：\\n" + resourcePath);
                return;
            }
            sprite.spriteFrame = spriteFrame;
        });
    },

    showTextPopup(title, message) {
        let popup = this.createPopupBase(title || "提示");
        this.setPopupMessage(popup.content, message || "");
    },

    createPopupBase(title) {
        this.closeBusinessPopup();

        let mask = new cc.Node("BusinessPopupMask");
        this.node.addChild(mask, 999);
        mask.setContentSize(this.node.getContentSize());
        mask.addComponent(cc.BlockInputEvents);
        let maskGraphics = mask.addComponent(cc.Graphics);
        maskGraphics.fillColor = cc.color(0, 0, 0, 150);
        maskGraphics.rect(-this.node.width / 2, -this.node.height / 2, this.node.width, this.node.height);
        maskGraphics.fill();

        let panel = new cc.Node("BusinessPopupPanel");
        mask.addChild(panel);
        panel.setContentSize(cc.size(1040, 600));
        let panelGraphics = panel.addComponent(cc.Graphics);
        panelGraphics.fillColor = cc.color(80, 72, 150);
        panelGraphics.rect(-520, -300, 1040, 600);
        panelGraphics.fill();

        let titleNode = new cc.Node("TitleLabel");
        panel.addChild(titleNode);
        titleNode.setPosition(0, 260);
        titleNode.color = cc.Color.WHITE;
        titleNode.setContentSize(cc.size(360, 60));
        let titleLabel = titleNode.addComponent(cc.Label);
        titleLabel.string = title;
        titleLabel.fontSize = 36;
        titleLabel.lineHeight = 44;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        titleLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        let titleOutline = titleNode.addComponent(cc.LabelOutline);
        titleOutline.width = 2;
        titleOutline.color = cc.color(65, 55, 120);

        let close = new cc.Node("CloseButton");
        panel.addChild(close);
        close.setPosition(500, 260);
        close.setContentSize(cc.size(56, 56));
        close.color = cc.color(95, 80, 180);
        close.addComponent(cc.Sprite);
        close.addComponent(cc.Button);
        let closeLabelNode = new cc.Node("Label");
        close.addChild(closeLabelNode);
        closeLabelNode.setContentSize(cc.size(56, 56));
        closeLabelNode.color = cc.Color.WHITE;
        let closeGraphics = close.addComponent(cc.Graphics);
        closeGraphics.fillColor = cc.color(95, 80, 180);
        closeGraphics.circle(0, 0, 28);
        closeGraphics.fill();
        let closeLabel = closeLabelNode.addComponent(cc.Label);
        closeLabel.string = "×";
        closeLabel.fontSize = 44;
        closeLabel.lineHeight = 50;
        closeLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        closeLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        close.on(cc.Node.EventType.TOUCH_END, this.closeBusinessPopup, this);

        let content = new cc.Node("Content");
        panel.addChild(content);
        content.setPosition(0, -18);
        content.setContentSize(cc.size(1000, 520));

        this.businessPopup = mask;
        return { mask: mask, panel: panel, content: content };
    },

    setPopupMessage(content, message) {
        if (!cc.isValid(content)) return;
        content.removeAllChildren();
        let labelNode = new cc.Node("MessageLabel");
        content.addChild(labelNode);
        labelNode.setContentSize(cc.size(820, 260));
        labelNode.color = cc.Color.WHITE;
        let label = labelNode.addComponent(cc.Label);
        label.string = message || "";
        label.fontSize = 30;
        label.lineHeight = 40;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.enableWrapText = true;
    },

    closeBusinessPopup() {
        if (this.businessPopup && cc.isValid(this.businessPopup)) {
            this.businessPopup.removeFromParent();
            this.businessPopup.destroy();
        }
        this.businessPopup = null;
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
