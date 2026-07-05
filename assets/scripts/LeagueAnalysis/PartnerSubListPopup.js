cc.Class({
    extends: cc.Component,
    properties: {
        rowPrefab: cc.Prefab
    },
    init: function (data, owner) {
        this.data = data || {};
        this.owner = owner;
        this.mode = 'leader';
        this.cacheNodes();
        this.bindAll();
        this.renderSummary();
        this.renderRows();
    },
    cacheNodes: function () { this.nodes = {}; this.collect(this.node); },
    collect: function (node) {
        this.nodes[node.name] = node;
        for (var i = 0; i < node.children.length; i++) this.collect(node.children[i]);
    },
    bindAll: function () {
        this.bind('BtnClose', this.close);
        this.bind('BtnLeader', function () { this.mode = 'leader'; this.renderRows(); });
        this.bind('BtnMember', function () { this.mode = 'member'; this.renderRows(); });
        this.bind('BtnSearch', this.renderRows);
    },
    renderSummary: function () {
        var user = this.data.user || this.data || {};
        this.text('Title', '查看下级');
        this.text('RoomLabel', '玩家信息\n' + (user.userID || user.userId || '123456'));
        this.text('RoundLabel', '');
    },
    getRows: function () {
        var rows = this.data.children || [];
        if (rows.length) return rows;
        var list = [];
        for (var i = 0; i < 6; i++) {
            list.push({
                userID: 323456 + i,
                name: (this.mode === 'leader' ? '下级队长' : '下级成员') + (i + 1),
                role: this.mode === 'leader' ? (i % 2 ? 'proxy' : 'leader') : 'user',
                partner: this.mode === 'leader',
                peopleCount: i + 1,
                roomRate: 60,
                waterRate: 40,
                todayRounds: 99,
                yesterdayRounds: 0,
                todayContribution: 9999,
                yesterdayContribution: 0,
                todayIncome: 9999,
                yesterdayIncome: 0,
                score: 999900,
                warningScore: 0,
                children: i % 2 === 0 ? [{}] : []
            });
        }
        return list;
    },
    renderRows: function () {
        this.setModeButton('BtnLeader', this.mode === 'leader');
        this.setModeButton('BtnMember', this.mode === 'member');
        var content = this.nodes.content;
        if (!content || !this.rowPrefab) return;
        var rows = this.getRows();
        content.removeAllChildren();
        var rowH = 184;
        var spacingY = 8;
        content.setAnchorPoint(0.5, 1);
        content.setContentSize(content.width || 920, Math.max(430, rows.length * (rowH + spacingY)));
        for (var i = 0; i < rows.length; i++) {
            var node = cc.instantiate(this.rowPrefab);
            node.scale = 0.86;
            var comp = node.getComponent('PartnerRow');
            if (comp) comp.setData(rows[i], {
                setPartner: this.openSetPartner.bind(this),
                warning: this.openWarning.bind(this),
                viewSub: this.openSubList.bind(this),
                addScore: this.openAddScore.bind(this),
                subScore: this.openSubScore.bind(this)
            });
            content.addChild(node);
        }
    },
    openSetPartner: function (row) {
        if (this.owner && this.owner.showSetPartnerPopup) this.owner.showSetPartnerPopup(row);
    },
    openWarning: function (row) {
        if (this.owner && this.owner.showWarningPopup) this.owner.showWarningPopup(row);
    },
    openSubList: function (row) {
        if (this.owner && this.owner.showSubListPopup) this.owner.showSubListPopup(row);
    },
    openAddScore: function (row) {
        if (this.owner && this.owner.showScorePopup) this.owner.showScorePopup(row, 'add');
    },
    openSubScore: function (row) {
        if (this.owner && this.owner.showScorePopup) this.owner.showScorePopup(row, 'sub');
    },
    setModeButton: function (name, selected) {
        var node = this.nodes[name];
        if (!node) return;
        var normal = node.getChildByName('Normal');
        var selectedNode = node.getChildByName('Selected');
        if (normal) normal.active = !selected;
        if (selectedNode) selectedNode.active = selected;
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
    close: function () { this.node.destroy(); }
});
