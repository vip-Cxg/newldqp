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
        this.text('RewardValue', this.formatScore(this.data.reward || this.data.rewardValue || this.data.amount || 0));
        this.text('PlayerName', this.getRewardName());
        this.text('PlayerCount', this.data.playerCount || this.data.count || this.data.turn || 0);
        this.text('RoomId', this.getRewardSource());
        this.text('Time', this.formatTime(this.data.createdAt || this.data.updatedAt || this.data.time || this.data.strDate || ''));
    },
    getRewardName: function () {
        return this.data.name || this.data.playerName || this.data.nickname || this.data.remarks || '玩家';
    },
    getRewardSource: function () {
        return this.data.roomID || this.data.roomId || this.data.tableID || this.data.source || this.data.recordCode || '';
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
