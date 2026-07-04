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
        this.text('Name', this.data.name || '玩家信息');
        this.text('UserID', String(this.data.userID || ''));
        this.text('TodayRounds', this.data.rounds || 0);
        this.text('YesterdayRounds', this.data.yesterdayRounds || 0);
        this.text('TodayContribution', this.data.contribution || 0);
        this.text('YesterdayContribution', 0);
        this.text('TodayResult', this.data.result || 0);
        this.text('YesterdayResult', 0);
        this.text('Score', String(this.data.score || 0));
        this.text('TodayLabel', '今日：' + (this.data.today || 0));
        this.text('YesterdayLabel', '昨日：' + (this.data.yesterday || 0));
        if (this.nodes.RoleBadge) this.nodes.RoleBadge.active = this.data.role !== 'user';
        if (this.nodes.BtnSetPartner) this.nodes.BtnSetPartner.active = this.data.role === 'user';
        if (this.nodes.StatusOnline) this.nodes.StatusOnline.active = !!this.data.online;
        if (this.nodes.StatusOffline) this.nodes.StatusOffline.active = !this.data.online;
        this.bind('BtnSetPartner', 'setPartner');
        this.bind('BtnLimitGame', 'limitGame');
        this.bind('BtnBattleDetail', 'battleDetail');
        this.bind('BtnAddScore', 'addScore');
        this.bind('BtnSubScore', 'subScore');
    },
    text: function (name, value) {
        var label = this.nodes[name] && this.nodes[name].getComponent(cc.Label);
        if (label) label.string = value;
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
