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
        this.data = data ? data : {};
        this.mode = mode == null ? 'leader' : mode;
        if (!this.nodes) this.cacheNodes();

        this.text('Name', this.value(this.data.name, '玩家信息'));
        this.text('UserID', String(this.value(this.data.userID, '')));
        this.text('Rounds', this.value(this.data.rounds, 0));
        this.text('LeaderScore', this.formatScore(this.data.score));
        this.text('DirectScore', this.formatScore(this.data.score));
        this.text('WinnerCount', this.value(this.data.winnerCount, 0));
        this.text('TotalWin', this.formatScore(this.value(this.data.totalWin, 0)));
        this.text('Contribution', this.formatScore(this.value(this.data.contribution, 0)));
        this.text('RoomRate', '房费:' + this.percent(this.data.roomRate));
        this.text('WaterRate', '抽水:' + this.percent(this.data.waterRate));
        this.text('YesterdayIncome', this.formatScore(this.value(this.data.yesterdayIncome, 0)));
        this.text('YesterdayRounds', this.value(this.data.yesterdayRounds, 0));
        this.text('TodayIncome', this.formatScore(this.value(this.data.todayIncome, 0)));
        this.text('TodayRounds', this.value(this.data.todayRounds, 0));

        var isLeader = this.mode === 'leader';
        this.active('LeaderColumns', isLeader);
        this.active('DirectColumns', !isLeader);
    },
    value: function (value, fallback) {
        return value == null ? fallback : value;
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
        var num = Number(value == null ? 0 : value);
        if (Math.abs(num) >= 100 && num % 100 === 0) num = num / 100;
        return String(num).replace(/\.00$/, '');
    }
});
