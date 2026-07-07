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

        var role = this.data.role || 'proxy';
        var isLeader = role === 'owner' || role === 'manager' || role === 'leader';

        this.text('Name', this.data.name || '队长信息');
        this.text('UserID', String(this.data.userID || ''));
        this.text('StatusOnline', '');
        this.text('StatusOffline', '');
        this.text('TodayRounds', this.data.todayRounds || 0);
        this.text('YesterdayRounds', this.data.yesterdayRounds || 0);
        this.text('TodayContribution', this.data.todayIncome || 0);
        this.text('YesterdayContribution', this.data.yesterdayIncome || 0);
        this.text('TodayResult', this.data.todayContribution || 0);
        this.text('YesterdayResult', this.data.yesterdayContribution || 0);
        this.text('Score', this.formatScore(this.data.score) + '\n' + this.formatScore(this.data.warningScore || 0));
        this.text('TodayLabel', '今日：' + (this.data.todayIncome || 0));
        this.text('YesterdayLabel', '昨日：' + (this.data.yesterdayIncome || 0));

        var peopleText = (this.data.peopleCount || 0) + '人';
        var roomRate = this.data.roomRate || 0;
        var waterRate = this.data.waterRate || 0;
        this.text('PeopleCount', peopleText);
        this.text('RoomRate', roomRate + '%');
        this.text('WaterRate',  waterRate + '%');

        if (this.nodes.RoleBadge) this.nodes.RoleBadge.active = true;
        if (this.nodes.ZXBadge) this.nodes.ZXBadge.active = !isLeader;
        if (this.nodes.DZBadge) this.nodes.DZBadge.active = !!isLeader;
        if (this.nodes.ForbiddenStamp) this.nodes.ForbiddenStamp.active = false;
        if (this.nodes.BtnAdjustRate) this.nodes.BtnAdjustRate.active = !isLeader;
        if (this.nodes.BtnWarning) this.nodes.BtnWarning.active = !isLeader;
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
            if (this.handlers[eventName]) this.handlers[eventName](this.data, this);
        }, this);
    }
});
