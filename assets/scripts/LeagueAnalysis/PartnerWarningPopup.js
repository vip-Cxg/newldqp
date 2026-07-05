cc.Class({
    extends: cc.Component,
    properties: {},
    init: function (data) {
        this.data = data || {};
        this.input = String(this.getWarningValue());
        this.cacheNodes();
        this.bindAll();
        this.refresh();
    },
    cacheNodes: function () { this.nodes = {}; this.collect(this.node); },
    collect: function (node) {
        this.nodes[node.name] = node;
        for (var i = 0; i < node.children.length; i++) this.collect(node.children[i]);
    },
    bindAll: function () {
        this.bind('BtnClose', this.close);
        this.bind('BtnConfirm', this.submit);
    },
    getWarningValue: function () {
        var user = this.data.user || {};
        var value = user.warningScore || user.warning || user.limitScore || 0;
        return Number(value || 0) / 100;
    },
    refresh: function () {
        this.text('Title', '设置警戒值');
        this.text('RoomRateTitle', '警戒分:');
        this.text('RoomRateLabel', this.input);
        this.text('WaterRateTitle', '注: 一条线玩家总分数低于警戒值分，玩家不能进入游戏，警戒分设置0，警戒解除，只能给直属代理和玩家设置！');
        this.hide('WaterRateBox');
        this.hide('WaterRateLabel');
    },
    submit: function () {
        var value = Number(this.input || 0);
        var user = this.data.user || {};
        user.warningScore = Math.floor(value * 100);
        if (this.data.onSubmit) this.data.onSubmit({ warningScore: user.warningScore, user: user });
        this.close();
    },
    bind: function (name, fn) {
        var node = this.nodes[name];
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            fn.call(this);
        }, this);
    },
    text: function (name, value) {
        var label = this.nodes[name] && this.nodes[name].getComponent(cc.Label);
        if (label) label.string = value;
    },
    hide: function (name) {
        if (this.nodes[name]) this.nodes[name].active = false;
    },
    close: function () { this.node.destroy(); }
});
