var LeagueAnalysisApi = require("./LeagueAnalysisApi");
var PopupMaskUtil = require("./PopupMaskUtil");

cc.Class({
    extends: cc.Component,
    properties: {
        memberPagePrefab: cc.Prefab,
        rowPrefab: cc.Prefab,
        partnerPagePrefab: cc.Prefab,
        partnerRowPrefab: cc.Prefab,
        searchPopupPrefab: cc.Prefab,
        scorePopupPrefab: cc.Prefab,
        setPartnerPopupPrefab: cc.Prefab,
        warningPopupPrefab: cc.Prefab,
        subListPopupPrefab: cc.Prefab,
        battleDetailPopupPrefab: cc.Prefab,
        battleReplayPopupPrefab: cc.Prefab,
        confirmPopupPrefab: cc.Prefab
    },
    onLoad: function () {
        this.cacheNodes();
        this.bindButtons();
        this.page = 1;
        this.pageSize = 20;
        this.showMemberTab();
    },
    cacheNodes: function () {
        this.pageRoot = this.node.getChildByName('PageRoot');
        this.popupLayer = this.node.getChildByName('PopupLayer');
        if (this.popupLayer) this.popupLayer.zIndex = 1000;
        this.leftMenu = this.node.getChildByName('LeftMenu');
    },
    bindPageContent: function (pageNode) {
        this.currentPageNode = pageNode;
        this.currentPage = this.getNode(pageNode, 'Content') || pageNode;
        var scroll = this.getNode(this.currentPage, 'ScrollView');
        this.content = this.getNode(scroll, 'view/content');
        this.contentLayout = this.content && this.content.getComponent(cc.Layout);
        this.bindCurrentSearch();
    },
    mountMemberPage: function () {
        if (!this.pageRoot || !this.memberPagePrefab) return;
        this.pageRoot.removeAllChildren();
        this.memberPageNode = cc.instantiate(this.memberPagePrefab);
        this.memberPageNode.name = 'MemberPage';
        this.pageRoot.addChild(this.memberPageNode);
        this.memberPageNode.setPosition(0, 0);
        this.bindPageContent(this.memberPageNode);
    },
    mountPartnerPage: function () {
        if (!this.pageRoot || !this.partnerPagePrefab) return;
        this.pageRoot.removeAllChildren();
        this.partnerPageNode = cc.instantiate(this.partnerPagePrefab);
        this.partnerPageNode.name = 'PartnerPage';
        this.pageRoot.addChild(this.partnerPageNode);
        this.partnerPageNode.setPosition(0, 0);
        this.bindPageContent(this.partnerPageNode);
    },
    getNode: function (root, path) {
        if (!root || !path) return null;
        var node = root;
        var parts = path.split('/');
        for (var i = 0; i < parts.length; i++) node = node && node.getChildByName(parts[i]);
        return node;
    },
    bindButtons: function () {
        this.bindTabs();
    },
    bindCurrentSearch: function () {
        var btn = this.getNode(this.currentPage, 'BtnSearch');
        this.bindClick(btn, this.showSearchPopup.bind(this));
    },
    bindTabs: function () {
        if (!this.leftMenu) return;
        var names = ['BtnStatistics', 'BtnPartner', 'BtnMember', 'BtnAgentStatistics', 'BtnRewardDetail', 'BtnOperationRecord', 'BtnRewardWithdraw'];
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            var node = this.leftMenu.getChildByName(name);
            this.bindClick(node, function (tabName) {
                cc.log('[LeagueAnalysisView] tab click', tabName);
                if (tabName === 'BtnMember') {
                    this.showMemberTab();
                    return;
                }
                if (tabName === 'BtnPartner') {
                    this.showPartnerTab();
                    return;
                }
                this.setTabSelected(tabName);
            }.bind(this, name));
        }
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
    showMemberTab: function () {
        this.currentTab = 'member';
        this.setTabSelected('BtnMember');
        this.mountMemberPage();
        this.loadMembers();
    },
    showPartnerTab: function () {
        this.currentTab = 'partner';
        this.setTabSelected('BtnPartner');
        this.mountPartnerPage();
        this.loadPartners();
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
    loadPartners: function (options) {
        options = options || {};
        var req = {
            page: options.page || this.page || 1,
            pageSize: options.pageSize || this.pageSize || 20
        };
        if (options.keywords) req.keywords = options.keywords;
        LeagueAnalysisApi.members(req).then(function (res) {
            var users = res && (res.users || res.data && res.data.users || res.data) || {};
            var rows = users.rows || res.rows || [];
            this.partners = this.filterPartnerRows(rows);
            if (!this.partners.length) this.partners = this.mockPartners();
            this.setData(this.partners);
        }.bind(this)).catch(function (err) {
            console.error('[LeagueAnalysisView] partners fallback', err);
            this.setData(this.mockPartners());
        }.bind(this));
    },
    filterPartnerRows: function (rows) {
        var list = [];
        rows = rows || [];
        for (var i = 0; i < rows.length; i++) {
            var item = rows[i] || {};
            var role = item.role || item.proxyRole || '';
            if (item.partner || item.isPartner || item.level || item.shuffleLevel || role === 'proxy' || role === 'leader' || role === 'owner') {
                list.push(item);
            }
        }
        return list;
    },
    setData: function (list) {
        list = list || [];
        var rowPrefab = this.currentTab === 'partner' ? this.partnerRowPrefab : this.rowPrefab;
        var rowCompName = this.currentTab === 'partner' ? 'PartnerRow' : 'MemberRow';
        if (!this.content || !rowPrefab) return;
        this.content.removeAllChildren();
        var rowH = 184;
        var spacingY = 4;
        var contentW = this.content.width || 1028;
        this.content.setAnchorPoint(0.5, 1);
        this.content.setContentSize(contentW, Math.max(372, list.length * (rowH + spacingY)));
        for (var i = 0; i < list.length; i++) {
            var rowNode = cc.instantiate(rowPrefab);
            rowH = rowNode.height || rowH;
            rowNode.setAnchorPoint(0.5, 0.5);
            var row = rowNode.getComponent(rowCompName);
            if (row) row.setData(list[i], {
                setPartner: this.showSetPartnerPopup.bind(this),
                warning: this.showWarningTodo.bind(this),
                viewSub: this.showViewSubTodo.bind(this),
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
        node.zIndex = 1000 + this.popupLayer.children.length;
        PopupMaskUtil.ensure(node);
        var comps = node.getComponents(cc.Component);
        for (var i = 0; i < comps.length; i++) {
            if (comps[i].init) comps[i].init(data || {}, this);
        }
        return node;
    },
    showSearchPopup: function () { this.openPopup(this.searchPopupPrefab, {
        title: '查询成员',
        onSubmit: function (userID) {
            var options = { page: 1, pageSize: this.pageSize, keywords: userID };
            if (this.currentTab === 'partner') this.loadPartners(options);
            else this.loadMembers(options);
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
                this.setData(this.currentTab === 'partner' ? this.partners : this.members);
            }.bind(this));
        }.bind(this)
    }); },
    showBattleDetailPopup: function (data) { this.openPopup(this.battleDetailPopupPrefab, data); },
    showBattleReplayPopup: function (data) { this.openPopup(this.battleReplayPopupPrefab, data); },
    showWarningTodo: function (data) {
        this.showWarningPopup(data);
    },
    showViewSubTodo: function (data) {
        this.showSubListPopup(data);
    },
    showWarningPopup: function (data) {
        this.openPopup(this.warningPopupPrefab || this.confirmPopupPrefab, {
            user: data,
            onSubmit: function () {
                this.setData(this.currentTab === 'partner' ? this.partners : this.members);
            }.bind(this)
        });
    },
    showSubListPopup: function (data) {
        this.openPopup(this.subListPopupPrefab || this.confirmPopupPrefab, {
            user: data,
            children: data && data.children
        });
    },
    showScorePopup: function (data, mode) { this.openPopup(this.scorePopupPrefab, {
        user: data,
        mode: mode,
        onSubmit: function (payload) {
            return LeagueAnalysisApi.changeScore(data.userID || data.userId, payload.mode, payload.amount).then(function () {
                var delta = Math.floor(Number(payload.amount || 0) * 100);
                if (payload.mode === 'sub' || payload.mode === 'reduce') delta = -delta;
                data.score = Number(data.score || 0) + delta;
                this.setData(this.currentTab === 'partner' ? this.partners : this.members);
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
                this.setData(this.currentTab === 'partner' ? this.partners : this.members);
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
    },
    mockPartners: function () {
        var list = [];
        for (var i = 0; i < 10; i++) {
            list.push({
                userID: 223456 + i,
                name: i % 2 ? '直属队长' + i : '合伙人' + i,
                role: i % 3 === 0 ? 'leader' : 'proxy',
                partner: true,
                peopleCount: 3 + i,
                roomRate: i % 2 ? 60 : 100,
                waterRate: i % 2 ? 40 : 100,
                todayRounds: i + 1,
                yesterdayRounds: i % 4,
                todayIncome: (12.6 + i).toFixed(2),
                yesterdayIncome: i % 2 ? 0 : 2.78,
                todayContribution: i % 2 ? -38.9 : 20,
                yesterdayContribution: 0,
                score: 988500 + i * 1000,
                warningScore: 1000000,
                today: i % 2 ? -38.9 : 0,
                yesterday: 0
            });
        }
        this.partners = list;
        return list;
    }
});
