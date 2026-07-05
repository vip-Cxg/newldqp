var LeagueAnalysisApi = require("./LeagueAnalysisApi");

cc.Class({
    extends: cc.Component,
    properties: {
        memberPagePrefab: cc.Prefab,
        rowPrefab: cc.Prefab,
        searchPopupPrefab: cc.Prefab,
        scorePopupPrefab: cc.Prefab,
        setPartnerPopupPrefab: cc.Prefab,
        battleDetailPopupPrefab: cc.Prefab,
        battleReplayPopupPrefab: cc.Prefab,
        confirmPopupPrefab: cc.Prefab
    },
    onLoad: function () {
        this.cacheNodes();
        this.bindButtons();
        this.page = 1;
        this.pageSize = 20;
        this.loadMembers();
    },
    cacheNodes: function () {
        this.pageRoot = this.node.getChildByName('PageRoot');
        this.popupLayer = this.node.getChildByName('PopupLayer');
        this.leftMenu = this.node.getChildByName('LeftMenu');
        this.mountMemberPage();
        this.memberPage = this.getNode(this.memberPageNode, 'Content');
        var scroll = this.getNode(this.memberPage, 'ScrollView');
        this.content = this.getNode(scroll, 'view/content');
        this.contentLayout = this.content && this.content.getComponent(cc.Layout);
    },
    mountMemberPage: function () {
        if (!this.pageRoot || !this.memberPagePrefab) return;
        this.pageRoot.removeAllChildren();
        this.memberPageNode = cc.instantiate(this.memberPagePrefab);
        this.memberPageNode.name = 'MemberPage';
        this.pageRoot.addChild(this.memberPageNode);
        this.memberPageNode.setPosition(0, 0);
    },
    getNode: function (root, path) {
        if (!root || !path) return null;
        var node = root;
        var parts = path.split('/');
        for (var i = 0; i < parts.length; i++) node = node && node.getChildByName(parts[i]);
        return node;
    },
    bindButtons: function () {
        var btn = this.getNode(this.memberPage, 'BtnSearch');
        this.bindClick(btn, this.showSearchPopup.bind(this));
        this.bindTabs();
    },
    bindTabs: function () {
        if (!this.leftMenu) return;
        var names = ['BtnStatistics', 'BtnPartner', 'BtnMember', 'BtnAgentStatistics', 'BtnRewardDetail', 'BtnOperationRecord', 'BtnRewardWithdraw'];
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            var node = this.leftMenu.getChildByName(name);
            this.bindClick(node, function (tabName) {
                cc.log('[LeagueAnalysisView] tab click', tabName);
                if (tabName !== 'BtnMember') return;
                this.setTabSelected(tabName);
            }.bind(this, name));
        }
        this.setTabSelected('BtnMember');
    },
    setTabSelected: function (selectedName) {
        if (!this.leftMenu) return;
        var names = ['BtnStatistics', 'BtnPartner', 'BtnMember', 'BtnAgentStatistics', 'BtnRewardDetail', 'BtnOperationRecord', 'BtnRewardWithdraw'];
        for (var i = 0; i < names.length; i++) {
            var node = this.leftMenu.getChildByName(names[i]);
            if (!node) continue;
            var normal = node.getChildByName('Normal');
            var selected = node.getChildByName('Selected');
            var isSelected = names[i] === selectedName;
            if (normal) normal.active = !isSelected;
            if (selected) selected.active = isSelected;
        }
    },
    bindClick: function (node, fn) {
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            fn();
        }, this);
    },
    loadMembers: function (options) {
        options = options || {};
        var req = {
            page: options.page || this.page || 1,
            pageSize: options.pageSize || this.pageSize || 20
        };
        if (options.keywords) req.keywords = options.keywords;
        LeagueAnalysisApi.members(req).then(function (res) {
            var users = res && (res.users || res.data && res.data.users || res.data) || {};
            this.members = users.rows || res.rows || [];
            this.setData(this.members);
        }.bind(this)).catch(function (err) {
            console.error('[LeagueAnalysisView] members fallback', err);
            this.setData(this.mockMembers());
        }.bind(this));
    },
    setData: function (list) {
        list = list || [];
        if (!this.content || !this.rowPrefab) return;
        this.content.removeAllChildren();
        var rowH = 184;
        var spacingY = 4;
        var contentW = this.content.width || 1028;
        this.content.setAnchorPoint(0.5, 1);
        this.content.setContentSize(contentW, Math.max(372, list.length * (rowH + spacingY)));
        for (var i = 0; i < list.length; i++) {
            var rowNode = cc.instantiate(this.rowPrefab);
            rowH = rowNode.height || rowH;
            rowNode.setAnchorPoint(0.5, 0.5);
            var row = rowNode.getComponent('MemberRow');
            if (row) row.setData(list[i], {
                setPartner: this.showSetPartnerPopup.bind(this),
                limitGame: this.showLimitConfirm.bind(this),
                battleDetail: this.showBattleDetailPopup.bind(this),
                addScore: function (data) { this.showScorePopup(data, 'add'); }.bind(this),
                subScore: function (data) { this.showScorePopup(data, 'sub'); }.bind(this)
            });
            this.content.addChild(rowNode);
        }
    },
    openPopup: function (prefab, data) {
        if (!prefab || !this.popupLayer) return null;
        var node = cc.instantiate(prefab);
        this.popupLayer.addChild(node);
        var comps = node.getComponents(cc.Component);
        for (var i = 0; i < comps.length; i++) {
            if (comps[i].init) comps[i].init(data || {}, this);
        }
        return node;
    },
    showSearchPopup: function () { this.openPopup(this.searchPopupPrefab, {
        title: '查询成员',
        onSubmit: function (userID) {
            this.loadMembers({ page: 1, pageSize: this.pageSize, keywords: userID });
        }.bind(this)
    }); },
    showSetPartnerPopup: function (data) { this.openPopup(this.setPartnerPopupPrefab, {
        user: data,
        onSubmit: function (payload) {
            return LeagueAnalysisApi.setPartner({
                userID: data.userID || data.userId,
                roomRate: payload.roomRate,
                waterRate: payload.waterRate
            }).then(function () {
                data.role = 'proxy';
                data.partner = true;
                data.level = payload.roomRate;
                data.shuffleLevel = payload.waterRate;
                this.setData(this.members);
            }.bind(this));
        }.bind(this)
    }); },
    showBattleDetailPopup: function (data) { this.openPopup(this.battleDetailPopupPrefab, data); },
    showBattleReplayPopup: function (data) { this.openPopup(this.battleReplayPopupPrefab, data); },
    showScorePopup: function (data, mode) { this.openPopup(this.scorePopupPrefab, {
        user: data,
        mode: mode,
        onSubmit: function (payload) {
            return LeagueAnalysisApi.changeScore(data.userID || data.userId, payload.mode, payload.amount).then(function () {
                var delta = Math.floor(Number(payload.amount || 0) * 100);
                if (payload.mode === 'sub' || payload.mode === 'reduce') delta = -delta;
                data.score = Number(data.score || 0) + delta;
                this.setData(this.members);
            }.bind(this));
        }.bind(this)
    }); },
    showLimitConfirm: function (data) {
        var forbidden = !data.forbidden;
        this.openPopup(this.confirmPopupPrefab, { message: forbidden ? '确认禁止该玩家游戏？' : '确认解除禁止？', onOK: function () {
            return LeagueAnalysisApi.updateForbidden(data.userID || data.userId, forbidden).then(function () {
                data.forbidden = forbidden;
                data.hasLimit = forbidden ? (data.userID || data.userId) : 0;
                data.status = forbidden ? 'limit' : 'normal';
                this.setData(this.members);
            }.bind(this));
        }.bind(this) });
    },
    mockMembers: function () {
        var list = [];
        for (var i = 0; i < 12; i++) {
            list.push({
                userID: 123456 + i,
                name: i % 2 ? '测试玩家' + i : '旧朋友123',
                role: i % 4 === 0 ? 'proxy' : 'user',
                online: i % 3 !== 0,
                rounds: i,
                yesterdayRounds: i % 5,
                contribution: (2.78 + i).toFixed(2),
                result: i % 2 ? -38.9 : 20,
                score: 9885 + i * 7,
                today: i % 2 ? -38.9 : 0,
                yesterday: 0
            });
        }
        this.members = list;
        return list;
    }
});
