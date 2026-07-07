cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad: function () { this.cacheNodes(); },
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
        var role = this.data.role || 'user';
        var forbidden = !!this.data.forbidden;
        this.data.forbidden = forbidden;
        this.text('Name', this.data.name || '玩家信息');
        this.text('UserID', String(this.data.userID || ''));
        this.text('TodayRounds', this.data.todayRounds || 0);
        this.text('YesterdayRounds', this.data.yesterdayRounds || 0);
        this.text('TodayContribution', this.data.todayContribution || 0);
        this.text('YesterdayContribution', this.data.yesterdayContribution || 0);
        this.text('TodayResult', this.data.todayResult || 0);
        this.text('YesterdayResult', this.data.yesterdayResult || 0);
        this.text('Score', this.formatScore(this.data.score));
        this.text('TodayLabel', '今日：' + (this.data.todayResult || 0));
        this.text('YesterdayLabel', '昨日：' + (this.data.yesterdayResult || 0));
        if (this.nodes.RoleBadge) this.nodes.RoleBadge.active = role !== 'user';
        if (this.nodes.BtnSetPartner) this.nodes.BtnSetPartner.active = role === 'user';
        if (this.nodes.StatusOnline) this.nodes.StatusOnline.active = !!this.data.online;
        if (this.nodes.StatusOffline) this.nodes.StatusOffline.active = !this.data.online;
        this.showForbiddenStamp(this.data.forbidden);
        this.textButton('BtnLimitGame', this.data.forbidden ? '解除禁止' : '禁止游戏');
        this.bind('BtnSetPartner', 'setPartner');
        this.bind('BtnLimitGame', 'limitGame');
        this.bind('BtnBattleDetail', 'battleDetail');
        this.bind('BtnAddScore', 'addScore');
        this.bind('BtnSubScore', 'subScore');
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
    showForbiddenStamp: function (active) {
        if (this.nodes.ForbiddenStamp) this.nodes.ForbiddenStamp.active = !!active;
    },
    bind: function (name, eventName) {
        var node = this.nodes[name];
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            if (this.handlers[eventName]) this.handlers[eventName](this.data, this);
        }, this);
    }
});
