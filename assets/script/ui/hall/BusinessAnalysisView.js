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
        this.bindButtons();
        this.hideReferenceImage();
        this.renderStats(this.mockStats());
        this.showTab("Stats");
    },

    cacheNodes() {
        this.panel = this.node.getChildByName("Panel");
        this.content = this.getNode("Panel/Content");
        this.leftTabs = this.getNode("Panel/LeftTabs");
    },

    bindButtons() {
        this.bindClick("Panel/Header/CloseButton", this.onClickClose.bind(this));
        this.bindClick("Panel/Content/StatsTab/BottomActions/InviteButton", this.onInvitePlayer.bind(this));
        this.bindClick("Panel/Content/StatsTab/BottomActions/SetPartnerButton", this.onSetPartner.bind(this));

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

    showTab(key) {
        this.tabs.forEach((tab) => {
            let tabNode = this.getNode("Panel/Content/" + tab.node);
            if (tabNode) tabNode.active = tab.key === key;

            let btn = this.getNode("Panel/LeftTabs/" + tab.button);
            if (btn) btn.opacity = tab.key === key ? 255 : 230;
        });
    },

    onInvitePlayer() {
        Cache.playSfx();
        Cache.alertTip("邀请玩家功能待接入");
    },

    onSetPartner() {
        Cache.playSfx();
        Cache.alertTip("设置合伙人功能待接入");
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
});
