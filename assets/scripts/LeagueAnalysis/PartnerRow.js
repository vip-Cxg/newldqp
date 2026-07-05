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
    setData: function (data, handlers) {
        this.data = data || {};
        this.handlers = handlers || {};
        if (!this.nodes) this.cacheNodes();

        var user = this.data.user || {};
        var role = this.data.role || this.data.proxyRole || 'proxy';
        var isLeader = role === 'leader' || role === 'owner' || this.data.isLeader || this.data.isCaptain;

        this.text('Name', this.data.nickname || this.data.name || user.name || '队长信息');
        this.text('UserID', String(this.data.userID || this.data.userId || this.data.id || ''));
        this.text('StatusOnline', '');
        this.text('StatusOffline', '');
        this.text('TodayRounds', this.data.todayRounds || this.data.tdTurn || this.data.rounds || 0);
        this.text('YesterdayRounds', this.data.yesterdayRounds || this.data.ydTurn || 0);
        this.text('TodayContribution', this.data.todayIncome || this.data.todayContribution || this.data.tdFee || this.data.contribution || 0);
        this.text('YesterdayContribution', this.data.yesterdayIncome || this.data.yesterdayContribution || this.data.ydFee || 0);
        this.text('TodayResult', this.data.todayContribution || this.data.todayResult || this.data.result || 0);
        this.text('YesterdayResult', this.data.yesterdayContribution || this.data.yesterdayResult || 0);
        this.text('Score', this.formatScore(this.data.score));
        this.text('TodayLabel', '今日：' + (this.data.todayIncome || this.data.todayContribution || this.data.today || 0));
        this.text('YesterdayLabel', '昨日：' + (this.data.yesterdayIncome || this.data.yesterdayContribution || this.data.yesterday || 0));

        var peopleText = (this.data.peopleCount || this.data.directCount || this.data.memberCount || 0) + '人';
        var roomRate = this.data.roomRate != null ? this.data.roomRate : (this.data.level != null ? this.data.level : 0);
        var waterRate = this.data.waterRate != null ? this.data.waterRate : (this.data.shuffleLevel != null ? this.data.shuffleLevel : 0);
        this.text('PeopleCount', peopleText);
        this.text('Rate', roomRate + '% ' + waterRate + '%');
        this.text('Warning', this.formatScore(this.data.warningScore || this.data.warning || this.data.limitScore || 0));

        if (this.nodes.RoleBadge) this.nodes.RoleBadge.active = true;
        if (this.nodes.ZXBadge) this.nodes.ZXBadge.active = !isLeader;
        if (this.nodes.DZBadge) this.nodes.DZBadge.active = !!isLeader;
        if (this.nodes.ForbiddenStamp) this.nodes.ForbiddenStamp.active = false;
        if (this.nodes.BtnAdjustRate) this.textButton('BtnAdjustRate', '调整比例');
        if (this.nodes.BtnWarning) this.textButton('BtnWarning', '警戒值');
        if (this.nodes.BtnViewSub) this.textButton('BtnViewSub', '查看下级');

        this.bind('BtnAdjustRate', 'setPartner');
        this.bind('BtnWarning', 'warning');
        this.bind('BtnViewSub', 'viewSub');
        this.bind('BtnAddScore', 'addScore');
        this.bind('BtnSubScore', 'subScore');
        this.bind('BtnBattleDetail', 'battleDetail');
    },
    text: function (name, value) {
        var label = this.nodes[name] && this.nodes[name].getComponent(cc.Label);
        if (label) {
            label.string = value;
            label.enableWrapText = false;
            label.overflow = cc.Label.Overflow.CLAMP;
        }
    },
    textButton: function (name, value) {
        var node = this.nodes[name];
        if (!node) return;
        var label = node.getComponentInChildren(cc.Label);
        if (label) label.string = value;
    },
    formatScore: function (score) {
        score = Number(score || 0) / 100;
        return score.toFixed(2).replace(/\.00$/, '');
    },
    bind: function (name, eventName) {
        var node = this.nodes[name];
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            if (this.handlers[eventName]) this.handlers[eventName](this.data);
        }, this);
    }
});
