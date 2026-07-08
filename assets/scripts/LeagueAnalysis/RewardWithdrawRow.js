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
        this.text('Time', this.formatTime(this.data.createdAt || this.data.updatedAt || this.data.time || this.data.strDate || ''));
        this.text('Level', this.data.level || this.data.reason || this.data.type || (Number(this.data.reward || 0) < 0 ? '领取' : '获得'));
        this.text('TotalTaken', this.formatScore(Math.abs(Number(this.data.reward != null ? this.data.reward : (this.data.totalTaken || this.data.amount || 0)))));
    },
    text: function (name, value) {
        var label = this.nodes[name] && this.nodes[name].getComponent(cc.Label);
        if (!label) return;
        label.string = value;
        label.enableWrapText = false;
        label.overflow = cc.Label.Overflow.CLAMP;
    },
    formatScore: function (value) {
        var num = Number(value || 0);
        if (Math.abs(num) >= 100 && num % 100 === 0) num = num / 100;
        return String(Number(num.toFixed(2))).replace(/\.00$/, '');
    },
    formatTime: function (value) {
        if (!value) return '';
        var text = String(value);
        if (text.length === 8 && /^\d+$/.test(text)) return text.slice(0, 4) + '-' + text.slice(4, 6) + '-' + text.slice(6, 8);
        return text.replace('T', ' ').replace(/\.\d+Z?$/, '').slice(0, 19);
    }
});
