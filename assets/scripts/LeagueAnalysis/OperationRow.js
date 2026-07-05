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
        this.text('Name', this.data.name || this.data.playerName || this.data.nickname || '玩家信息');
        this.text('UserID', String(this.data.userID || this.data.userId || this.data.id || ''));
        this.text('ScoreChange', this.formatSigned(this.data.score || this.data.changeScore || this.data.amount || 0));
        this.text('PlayerRemain', this.formatScore(this.data.remainScore || this.data.playerRemain || 0));
        this.text('OperatorName', this.data.operatorName || this.data.sourceName || this.data.source || this.data.parent || '');
        this.text('OperatorRemain', this.formatScore(this.data.operatorRemain || this.data.sourceRemain || 0));
        this.text('TimeLabel', this.formatTime(this.data.createdAt || this.data.updatedAt || this.data.time || this.data.strDate || ''));
    },
    text: function (name, value) {
        var label = this.nodes[name] && this.nodes[name].getComponent(cc.Label);
        if (!label) return;
        label.string = value;
        label.enableWrapText = false;
        label.overflow = cc.Label.Overflow.CLAMP;
    },
    formatSigned: function (value) {
        var num = Number(value || 0);
        if (Math.abs(num) >= 100 && num % 100 === 0) num = num / 100;
        var text = String(Number(num.toFixed(2))).replace(/\.00$/, '');
        return num > 0 ? '+' + text : text;
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
