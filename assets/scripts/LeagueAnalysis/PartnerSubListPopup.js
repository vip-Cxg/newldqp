var LeagueAnalysisApi = require("./LeagueAnalysisApi");
var Cache = require("../../Main/Script/Cache");

cc.Class({
    extends: cc.Component,
    properties: {
        rowPrefab: cc.Prefab
    },
    init: function (data, owner) {
        this.data = data || {};
        this.owner = owner;
        this.mode = data.mode || data.defaultMode || this.pickDefaultMode(data.user || data || {});
        this.cacheNodes();
        this.bindAll();
        this.renderSummary();
        this.loadRows();
    },
    cacheNodes: function () { this.nodes = {}; this.collect(this.node); },
    collect: function (node) {
        this.nodes[node.name] = node;
        for (var i = 0; i < node.children.length; i++) this.collect(node.children[i]);
    },
    bindAll: function () {
        this.bind('BtnClose', this.close);
        this.bind('BtnLeader', function () { this.switchMode('leader'); });
        this.bind('BtnMember', function () { this.switchMode('member'); });
        this.bind('BtnSearch', this.loadRows);
    },
    renderSummary: function () {
        var user = this.data.user || this.data || {};
        this.text('Title', '查看下级');
        this.text('SuperiorName', user.nickname || user.name || '玩家信息');
        this.text('SuperiorID', String(user.userID || user.userId || user.id || '123456'));
    },
    switchMode: function (mode) {
        if (this.mode === mode) return;
        this.mode = mode;
        this.loadRows();
    },
    getCurrentUser: function () {
        return this.data.user || this.data || {};
    },
    pickDefaultMode: function (user) {
        if (Number(user && user.leaderCount || 0) > 0) return 'leader';
        if (Number(user && user.memberCount || 0) > 0) return 'member';
        return 'leader';
    },
    getTargetID: function () {
        var user = this.getCurrentUser();
        return user.userID || user.userId || user.id;
    },
    getSearchKeyword: function () {
        var node = this.nodes.SearchInput || this.nodes.Input || this.nodes.SearchEditBox;
        if (!node) return '';
        var editBox = node.getComponent(cc.EditBox);
        if (editBox) return editBox.string;
        var label = node.getComponent(cc.Label) || node.getComponentInChildren(cc.Label);
        return label ? label.string : '';
    },
    extractRows: function (res) {
        var data = res && (res.data || res.detail) || res || {};
        if (data.rows) return data.rows;
        if (data.list) return data.list;
        if (Array.isArray(data)) return data;
        return [];
    },
    loadRows: function () {
        this.setModeButton('BtnLeader', this.mode === 'leader');
        this.setModeButton('BtnMember', this.mode === 'member');
        this.renderHeader();

        var targetID = this.getTargetID();
        if (!targetID) {
            this.rows = [];
            this.renderRows();
            return;
        }

        LeagueAnalysisApi.children({
            userID: targetID,
            type: this.mode,
            page: 1,
            pageSize: 50,
            keywords: this.getSearchKeyword()
        }).then(function (res) {
            this.rows = this.extractRows(res);
            this.renderRows();
        }.bind(this)).catch(function (err) {
            console.error('[PartnerSubListPopup] load children failed', err);
            this.rows = [];
            this.renderRows();
        }.bind(this));
    },
    getRowsFallback: function () {
        var rows = this.data.children || [];
        if (rows.length) {
            var filtered = [];
            for (var r = 0; r < rows.length; r++) {
                var item = rows[r] || {};
                var role = item.role || item.proxyRole || '';
                var isLeader = role === 'leader' || role === 'owner' || item.partner || item.isPartner || item.children && item.children.length;
                if (this.mode === 'leader' && isLeader) filtered.push(item);
                if (this.mode === 'member' && !isLeader) filtered.push(item);
            }
            return filtered;
        }
        return [];
    },
    renderRows: function () {
        this.setModeButton('BtnLeader', this.mode === 'leader');
        this.setModeButton('BtnMember', this.mode === 'member');
        this.renderHeader();
        var content = this.nodes.content;
        if (!content || !this.rowPrefab) return;
        var rows = this.rows || [];
        content.removeAllChildren();
        var rowH = 82;
        var spacingY = 10;
        content.setAnchorPoint(0.5, 1);
        content.setContentSize(content.width || 790, Math.max(242, rows.length * (rowH + spacingY)));
        for (var i = 0; i < rows.length; i++) {
            var node = cc.instantiate(this.rowPrefab);
            var comp = node.getComponent('PartnerSubRow') || node.getComponent('PartnerRow');
            if (comp && comp.setData) comp.setData(rows[i], this.mode);
            this.bindRowClick(node, rows[i]);
            content.addChild(node);
        }
    },
    bindRowClick: function (node, row) {
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            this.handleRowClick(row);
        }, this);
    },
    handleRowClick: function (row) {
        if (!row) return;
        if (this.hasNextLayer(row)) {
            this.openSubList(row);
        } else {
            this.showTip('没有下一层');
        }
    },
    hasNextLayer: function (row) {
        if (!row) return false;
        if (row.hasChildren === true) return true;
        if (Number(row.childrenCount || 0) > 0) return true;
        if (Number(row.leaderCount || 0) > 0) return true;
        if (Number(row.memberCount || 0) > 0) return true;
        return !!(row.children && row.children.length);
    },
    showTip: function (message) {
        if (Cache && Cache.showTipsMsg) Cache.showTipsMsg(message);
        else if (Cache && Cache.alertTip) Cache.alertTip(message);
        else cc.warn(message);
    },
    renderHeader: function () {
        var leader = this.mode === 'leader';
        this.text('HeaderPlayerInfo', '玩家信息');
        this.text('HeaderRounds', !leader ? '局数' : '');
        this.text('HeaderScore', !leader ? '积分' : '积分');
        this.text('HeaderWinnerCount', !leader ? '大赢家次数' : '');
        this.text('HeaderTotalWin', !leader ? '总赢分' : '');
        this.text('HeaderContribution', !leader ? '贡献分' : '');
        this.text('HeaderRate', !leader ? '' : '比例');
        this.text('HeaderYesterday', !leader ? '' : '昨日收益\n昨日局数');
        this.text('HeaderToday', !leader ? '' : '今日收益\n今日局数');
        this.setHeaderNode('HeaderRounds', !leader);
        this.setHeaderNode('HeaderWinnerCount', !leader);
        this.setHeaderNode('HeaderTotalWin', !leader);
        this.setHeaderNode('HeaderContribution', !leader);
        this.setHeaderNode('HeaderRate', leader);
        this.setHeaderNode('HeaderYesterday', leader);
        this.setHeaderNode('HeaderToday', leader);
        this.placeHeader('HeaderPlayerInfo', -313, 220);
        if (!leader) {
            this.placeHeader('HeaderRounds', -144, 220);
            this.placeHeader('HeaderScore', -35, 220);
            this.placeHeader('HeaderWinnerCount', 88, 220);
            this.placeHeader('HeaderTotalWin', 222, 220);
            this.placeHeader('HeaderContribution', 337, 220);
        } else {
            this.placeHeader('HeaderRate', -125, 220);
            this.placeHeader('HeaderYesterday', 23, 220);
            this.placeHeader('HeaderToday', 192, 220);
            this.placeHeader('HeaderScore', 346, 220);
        }
    },
    setHeaderNode: function (name, active) {
        if (this.nodes[name]) this.nodes[name].active = !!active;
    },
    placeHeader: function (name, x, y) {
        var node = this.nodes[name];
        if (!node) return;
        node.active = true;
        node.setPosition(x, y);
    },
    openSetPartner: function (row) {
        if (this.owner && this.owner.showSetPartnerPopup) this.owner.showSetPartnerPopup(row);
    },
    openWarning: function (row) {
        if (this.owner && this.owner.showWarningPopup) this.owner.showWarningPopup(row);
    },
    openSubList: function (row) {
        if (!this.owner || !this.owner.showSubListPopup) return;
        var defaultMode = this.pickDefaultMode(row);
        this.owner.showSubListPopup(row, defaultMode);
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
