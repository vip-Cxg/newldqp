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
        this.text('Name', this.data.name || this.data.nickname || '玩家信息');
        this.text('UserID', String(this.data.userID || this.data.userId || this.data.id || ''));
        this.text('Count', this.data.peopleCount || this.data.directCount || this.data.memberCount || 0);
        this.text('Income', this.formatPair(this.data.todayProfit || this.data.todayIncome, this.data.yesterdayProfit || this.data.yesterdayIncome));
        this.text('Score', this.formatScore(this.data.score));
        this.text('WinLoss', this.formatPair(this.data.todayResult || this.data.todayWinLoss || this.data.todayContribution, this.data.yesterdayResult || this.data.yesterdayWinLoss || this.data.yesterdayContribution));
        this.text('Contribution', this.formatPair(this.data.todayContribute || this.data.todayContribution || this.data.tdFee, this.data.yesterdayContribute || this.data.yesterdayContribution || this.data.ydFee));
    },
    text: function (name, value) {
        var label = this.nodes[name] && this.nodes[name].getComponent(cc.Label);
        if (!label) return;
        label.string = value;
        label.enableWrapText = false;
        label.overflow = cc.Label.Overflow.CLAMP;
    },
    formatPair: function (today, yesterday) {
        return this.formatScore(today) + '\n' + this.formatScore(yesterday);
    },
    formatScore: function (value) {
        var num = Number(value || 0);
        if (Math.abs(num) >= 100 && num % 100 === 0) num = num / 100;
        return String(Number(num.toFixed(2))).replace(/\.00$/, '');
    }
});
