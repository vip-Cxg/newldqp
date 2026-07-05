cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad: function () {
        this.cacheNodes();
    },
    cacheNodes: function () {
        this.nodes = {};
        this.collect(this.node);
    },
    collect: function (node) {
        this.nodes[node.name] = node;
        for (var i = 0; i < node.children.length; i++) this.collect(node.children[i]);
    },
    setData: function (data, mode) {
        this.data = data || {};
        this.mode = mode || 'leader';
        if (!this.nodes) this.cacheNodes();

        this.text('Name', this.data.nickname || this.data.name || '玩家信息');
        this.text('UserID', String(this.data.userID || this.data.userId || this.data.id || '123456'));
        this.text('Rounds', this.data.rounds || this.data.todayRounds || 0);
        this.text('LeaderScore', this.formatScore(this.data.score));
        this.text('DirectScore', this.formatScore(this.data.score));
        this.text('WinnerCount', this.data.winnerCount || this.data.bigWinnerCount || 0);
        this.text('TotalWin', this.formatScore(this.data.totalWin || this.data.winScore || 0));
        this.text('Contribution', this.formatScore(this.data.contribution || this.data.todayContribution || 0));
        this.text('RoomRate', '房费:' + this.percent(this.data.roomRate));
        this.text('WaterRate', '抽水:' + this.percent(this.data.waterRate));
        this.text('YesterdayIncome', this.formatScore(this.data.yesterdayIncome || this.data.yesterdayContribution || 0));
        this.text('YesterdayRounds', this.data.yesterdayRounds || 0);
        this.text('TodayIncome', this.formatScore(this.data.todayIncome || this.data.todayContribution || 0));
        this.text('TodayRounds', this.data.todayRounds || 0);

        var isLeader = this.mode === 'leader';
        this.active('LeaderColumns', isLeader);
        this.active('DirectColumns', !isLeader);
    },
    text: function (name, value) {
        var label = this.nodes[name] && this.nodes[name].getComponent(cc.Label);
        if (!label) return;
        label.string = value;
        label.enableWrapText = false;
        label.overflow = cc.Label.Overflow.CLAMP;
    },
    active: function (name, enabled) {
        if (this.nodes[name]) this.nodes[name].active = enabled;
    },
    percent: function (value) {
        if (value == null || value === '') value = 0;
        return value + '%';
    },
    formatScore: function (value) {
        var num = Number(value || 0);
        if (Math.abs(num) >= 100 && num % 100 === 0) num = num / 100;
        return String(num).replace(/\.00$/, '');
    }
});
