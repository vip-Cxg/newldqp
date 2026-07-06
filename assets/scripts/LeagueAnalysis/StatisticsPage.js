var LeagueAnalysisApi = require("./LeagueAnalysisApi");

function safeNumber(value, fallback) {
    var num = Number(value);
    if (isNaN(num)) return fallback == null ? 0 : fallback;
    return num;
}

module.exports = cc.Class({
    extends: cc.Component,

    init: function (owner) {
        this.owner = owner;
        this.bindButtons();
        this.load();
    },

    bindButtons: function () {
        this.bindClick(this.findNode('InviteButton'), function () {
            if (this.owner && this.owner.showInvitePlayerPopup) this.owner.showInvitePlayerPopup();
        }.bind(this));
        this.bindClick(this.findNode('SetPartnerButton'), function () {
            if (this.owner && this.owner.showStatisticsSetPartnerFlow) this.owner.showStatisticsSetPartnerFlow();
        }.bind(this));
    },

    bindClick: function (node, fn) {
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            fn();
        }, this);
    },

    load: function () {
        LeagueAnalysisApi.overview().then(function (res) {
            var data = res && (res.data || res.detail) || res || {};
            this.render(data);
        }.bind(this)).catch(function (err) {
            console.error('[StatisticsPage] overview fallback', err);
            this.render(this.mockData());
        }.bind(this));
    },

    render: function (data) {
        data = data || {};
        this.setText('ScoreBlock/TodayRewardLabel', '今日总奖励： ' + this.formatScore(data.todayReward || data.todayTotalReward || 0));
        this.setText('ScoreBlock/YesterdayRewardLabel', '昨日总奖励： ' + this.formatScore(data.yesterdayReward || data.yesterdayTotalReward || 0));
        this.setText('TotalBlock/TeamScoreLabel', '团队总积分： ' + this.formatPointScore(data.teamScore || data.totalScore || 0));
        this.setText('TotalBlock/TeamUserLabel', '团队总人数： ' + (data.teamPeople || data.teamUsers || data.totalPeople || 0));
        this.setText('TotalBlock/RoomRateLabel', '房费比例： ' + this.formatPercent(data.roomRate || data.roomPercent || 0));
        this.setText('TotalBlock/ShuffleRateLabel', '抽水比例： ' + this.formatPercent(data.waterRate || data.shuffleRate || data.waterPercent || 0));
        this.setText('TotalBlock/GameRoundLabel', '游戏局数： ' + (data.gameRounds || data.rounds || 0));
        this.setText('BottomActions/DirectCaptainBox/Value', data.directCaptains || data.directCaptain || data.leaderCount || 0);
        this.setText('BottomActions/DirectMemberBox/Value', data.directMembers || data.directMember || data.memberCount || 0);
        this.setText('BottomActions/IndirectMemberBox/Value', data.indirectMembers || data.indirectMember || data.indirectCount || 0);
    },

    setText: function (path, value) {
        var node = this.getNode(path);
        var label = node && node.getComponent(cc.Label);
        if (label) label.string = String(value);
    },

    getNode: function (path) {
        if (!path) return null;
        var node = this.node;
        var parts = path.split('/');
        for (var i = 0; i < parts.length; i++) {
            node = node && node.getChildByName(parts[i]);
        }
        return node;
    },

    findNode: function (name, root) {
        root = root || this.node;
        if (!root) return null;
        if (root.name === name) return root;
        for (var i = 0; i < root.children.length; i++) {
            var found = this.findNode(name, root.children[i]);
            if (found) return found;
        }
        return null;
    },

    formatScore: function (value) {
        var num = safeNumber(value, 0);
        return String(Number(num.toFixed(2))).replace(/\.00$/, '');
    },

    formatPointScore: function (value) {
        var num = safeNumber(value, 0) / 100;
        return String(Number(num.toFixed(2))).replace(/\.00$/, '');
    },

    formatPercent: function (value) {
        var num = safeNumber(value, 0);
        return String(Number(num.toFixed(2))).replace(/\.00$/, '') + '%';
    },

    mockData: function () {
        return {
            todayReward: 0,
            yesterdayReward: 0,
            teamScore: 60000,
            teamPeople: 7,
            roomRate: 100,
            waterRate: 100,
            gameRounds: 0,
            directCaptains: 0,
            directMembers: 6,
            indirectMembers: 0
        };
    }
});
