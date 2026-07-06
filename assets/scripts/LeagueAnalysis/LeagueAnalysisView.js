var LeagueAnalysisApi = require("./LeagueAnalysisApi");
var PopupMaskUtil = require("./PopupMaskUtil");
var Cache = require("../../Main/Script/Cache");

cc.Class({
    extends: cc.Component,
    properties: {
        statisticsPagePrefab: cc.Prefab,
        memberPagePrefab: cc.Prefab,
        rowPrefab: cc.Prefab,
        partnerPagePrefab: cc.Prefab,
        partnerRowPrefab: cc.Prefab,
        agentPagePrefab: cc.Prefab,
        agentRowPrefab: cc.Prefab,
        rewardDetailPagePrefab: cc.Prefab,
        rewardRowPrefab: cc.Prefab,
        operationPagePrefab: cc.Prefab,
        operationRowPrefab: cc.Prefab,
        rewardWithdrawPagePrefab: cc.Prefab,
        rewardWithdrawRowPrefab: cc.Prefab,
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
        this.showStatisticsTab();
    },
    cacheNodes: function () {
        this.pageRoot = this.node.getChildByName('PageRoot');
        this.popupLayer = this.node.getChildByName('PopupLayer');
        if (this.pageRoot) this.pageRoot.zIndex = 10;
        if (this.popupLayer) this.popupLayer.zIndex = 1000;
        this.leftMenu = this.node.getChildByName('LeftMenu');
        if (this.leftMenu) this.leftMenu.zIndex = 50;
    },
    bindPageContent: function (pageNode) {
        this.currentPageNode = pageNode;
        this.currentPage = this.getNode(pageNode, 'Content') || pageNode;
        var scroll = this.getNode(this.currentPage, 'ScrollView');
        this.scrollView = scroll && scroll.getComponent(cc.ScrollView);
        this.content = this.getNode(scroll, 'view/content');
        this.contentLayout = this.content && this.content.getComponent(cc.Layout);
        this.bindCurrentSearch();
        this.bindCurrentWithdraw();
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
        this.bindClick(this.findNode(this.node, 'BtnClose'), this.closeView.bind(this));
    },
    bindCurrentSearch: function () {
        var btn = this.getNode(this.currentPage, 'BtnSearch');
        this.bindClick(btn, function () {
            this.showSearchPopup();
        }.bind(this));
    },
    bindCurrentWithdraw: function () {
        if (this.currentTab !== 'rewardWithdraw') return;
        var btn = this.findNode(this.currentPageNode, 'WithdrawBtn') ||
            this.findNode(this.currentPageNode, 'BtnWithdraw') ||
            this.findNode(this.currentPageNode, 'BtnTakeOut');
        this.bindClick(btn, function () {
            this.showRewardWithdrawConfirm();
        }.bind(this));
    },
    bindTabs: function () {
        if (!this.leftMenu) return;
        var names = ['BtnStatistics', 'BtnPartner', 'BtnMember', 'BtnAgentStatistics', 'BtnRewardDetail', 'BtnOperationRecord', 'BtnRewardWithdraw'];
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            var node = this.leftMenu.getChildByName(name);
            this.bindTabClick(node, function (tabName) {
                cc.log('[LeagueAnalysisView] tab click', tabName);
                if (tabName === 'BtnStatistics') {
                    this.showStatisticsTab();
                    return;
                }
                if (tabName === 'BtnMember') {
                    this.showMemberTab();
                    return;
                }
                if (tabName === 'BtnPartner') {
                    this.showPartnerTab();
                    return;
                }
                if (tabName === 'BtnAgentStatistics') {
                    this.showAgentTab();
                    return;
                }
                if (tabName === 'BtnRewardDetail') {
                    this.showRewardDetailTab();
                    return;
                }
                if (tabName === 'BtnOperationRecord') {
                    this.showOperationTab();
                    return;
                }
                if (tabName === 'BtnRewardWithdraw') {
                    this.showRewardWithdrawTab();
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
    showStatisticsTab: function () {
        cc.log('[LeagueAnalysisView] showStatisticsTab');
        this.currentTab = 'statistics';
        this.setTabSelected('BtnStatistics');
        this.mountStatisticsPage();
    },
    mountStatisticsPage: function () {
        if (!this.pageRoot || !this.statisticsPagePrefab) {
            console.error('[LeagueAnalysisView] statistics page prefab missing');
            return;
        }
        this.pageRoot.removeAllChildren();
        this.statisticsPageNode = cc.instantiate(this.statisticsPagePrefab);
        this.statisticsPageNode.name = 'StatisticsPage';
        this.pageRoot.addChild(this.statisticsPageNode);
        this.statisticsPageNode.setPosition(0, 0);
        this.currentPageNode = this.statisticsPageNode;
        this.currentPage = this.getNode(this.statisticsPageNode, 'Content') || this.statisticsPageNode;
        var comp = this.statisticsPageNode.getComponent('StatisticsPage');
        if (comp && comp.init) comp.init(this);
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
    showAgentTab: function () {
        this.currentTab = 'agent';
        this.setTabSelected('BtnAgentStatistics');
        this.mountListPage('agent');
        this.loadGenericList('agent');
    },
    showRewardDetailTab: function () {
        this.currentTab = 'rewardDetail';
        this.setTabSelected('BtnRewardDetail');
        this.mountListPage('rewardDetail');
        this.loadGenericList('rewardDetail');
    },
    showOperationTab: function () {
        this.currentTab = 'operation';
        this.setTabSelected('BtnOperationRecord');
        this.mountListPage('operation');
        this.loadGenericList('operation');
    },
    showRewardWithdrawTab: function () {
        this.currentTab = 'rewardWithdraw';
        this.setTabSelected('BtnRewardWithdraw');
        this.mountListPage('rewardWithdraw');
        this.loadGenericList('rewardWithdraw');
    },
    getListConfig: function (tab) {
        var configs = {
            member: { page: this.memberPagePrefab, row: this.rowPrefab, rowComp: 'MemberRow', api: 'members', store: 'members' },
            partner: { page: this.partnerPagePrefab, row: this.partnerRowPrefab, rowComp: 'PartnerRow', api: 'partners', store: 'partners', filter: this.filterPartnerRows.bind(this) },
            agent: { page: this.agentPagePrefab, row: this.agentRowPrefab, rowComp: 'AgentRow', api: 'agentStats', store: 'agents' },
            rewardDetail: { page: this.rewardDetailPagePrefab, row: this.rewardRowPrefab, rowComp: 'RewardRow', api: 'rewardDetails', store: 'rewardDetails', summary: this.renderRewardDetailSummary.bind(this) },
            operation: { page: this.operationPagePrefab, row: this.operationRowPrefab, rowComp: 'OperationRow', api: 'operateLogs', store: 'operations' },
            rewardWithdraw: { page: this.rewardWithdrawPagePrefab, row: this.rewardWithdrawRowPrefab, rowComp: 'RewardWithdrawRow', api: 'rewardWithdraw', store: 'rewardWithdrawRows', summary: this.renderRewardWithdrawSummary.bind(this) }
        };
        return configs[tab || this.currentTab];
    },
    mountListPage: function (tab) {
        var config = this.getListConfig(tab);
        if (!this.pageRoot || !config || !config.page) {
            console.error('[LeagueAnalysisView] page prefab missing', tab);
            return;
        }
        this.pageRoot.removeAllChildren();
        var pageNode = cc.instantiate(config.page);
        pageNode.name = (tab || this.currentTab) + 'Page';
        this.pageRoot.addChild(pageNode);
        pageNode.setPosition(0, 0);
        this.bindPageContent(pageNode);
    },
    bindClick: function (node, fn) {
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            fn();
        }, this);
    },
    bindTabClick: function (node, fn) {
        if (!node) return;
        this.bindClick(node, fn);
        for (var i = 0; i < node.children.length; i++) {
            this.bindClick(node.children[i], fn);
        }
    },
    loadMembers: function (options) {
        options = options || {};
        var req = {
            page: options.page || this.page || 1,
            pageSize: options.pageSize || this.pageSize || 20
        };
        if (options.keywords) req.keywords = options.keywords;
        return LeagueAnalysisApi.members(req).then(function (res) {
            var users = res && (res.users || res.data && res.data.users || res.data) || {};
            var rows = users.rows || res.rows || [];
            if (this.isSearchEmpty(options, rows)) return this.showSearchEmptyTip();
            this.members = rows;
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
        return LeagueAnalysisApi.partners(req).then(function (res) {
            var users = res && (res.users || res.data && res.data.users || res.data) || {};
            var rows = users.rows || res.rows || [];
            var partners = this.filterPartnerRows(rows);
            if (this.isSearchEmpty(options, partners)) return this.showSearchEmptyTip();
            this.partners = partners;
            this.setData(this.partners);
        }.bind(this)).catch(function (err) {
            console.error('[LeagueAnalysisView] partners load failed', err);
            this.partners = [];
            this.setData(this.partners);
        }.bind(this));
    },
    loadGenericList: function (tab, options) {
        options = options || {};
        var config = this.getListConfig(tab);
        if (!config || !LeagueAnalysisApi[config.api]) {
            console.error('[LeagueAnalysisView] api config missing', tab);
            return;
        }
        var req = {
            page: options.page || this.page || 1,
            pageSize: options.pageSize || this.pageSize || 20
        };
        if (options.keywords) req.keywords = options.keywords;
        return LeagueAnalysisApi[config.api](req).then(function (res) {
            var data = res && (res.data || res.detail) || res || {};
            var rows = data.rows || data.list || res.rows || [];
            if (config.filter) rows = config.filter(rows);
            if (this.isSearchEmpty(options, rows)) return this.showSearchEmptyTip();
            this[config.store] = rows;
            if (config.summary) config.summary(data);
            this.setData(rows);
        }.bind(this)).catch(function (err) {
            console.error('[LeagueAnalysisView] list load failed', tab, err);
            this[config.store] = [];
            if (config.summary) config.summary({});
            this.setData([]);
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
        var config = this.getListConfig(this.currentTab) || this.getListConfig('member');
        var rowPrefab = config && config.row;
        var rowCompName = config && config.rowComp;
        if (!this.content || !rowPrefab) return;
        this.content.removeAllChildren();
        var rowH = 0;
        var spacingY = 4;
        var contentW = this.content.width || 1028;
        if (this.contentLayout && this.contentLayout.spacingY != null) spacingY = this.contentLayout.spacingY;
        this.content.setAnchorPoint(0.5, 1);
        for (var i = 0; i < list.length; i++) {
            var rowNode = cc.instantiate(rowPrefab);
            rowH = rowNode.height || rowH || 184;
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
        var viewH = this.content.parent ? this.content.parent.height : 372;
        var totalH = list.length ? list.length * rowH + Math.max(0, list.length - 1) * spacingY : viewH;
        this.content.setContentSize(contentW, Math.max(viewH, totalH));
        if (this.contentLayout && this.contentLayout.updateLayout) this.contentLayout.updateLayout();
        var scrollView = this.scrollView || (this.content.parent && this.content.parent.parent && this.content.parent.parent.getComponent(cc.ScrollView));
        if (scrollView) scrollView.scrollToTop(0);
    },
    renderRewardDetailSummary: function (data) {
        data = data || {};
        this.setPageText('Value_TotalTicket', this.formatScore(data.totalTicket || data.totalReward || data.reward || 0));
        this.setPageText('Value_SubReward', this.formatScore(data.subReward || data.childrenReward || 0));
        this.setPageText('Value_MyIncome', this.formatScore(data.myIncome || data.income || 0));
    },
    renderRewardWithdrawSummary: function (data) {
        data = data || {};
        this.currentRewardRaw = data.currentReward != null ? data.currentReward : (data.reward || 0);
        this.setPageText('CurrentRewardLabel', '当前奖励：' + this.formatScore(this.currentRewardRaw));
    },
    setPageText: function (name, value) {
        if (!this.currentPageNode) return;
        var node = this.findNode(this.currentPageNode, name);
        var label = node && node.getComponent(cc.Label);
        if (label) label.string = String(value);
    },
    findNode: function (root, name) {
        if (!root) return null;
        if (root.name === name) return root;
        for (var i = 0; i < root.children.length; i++) {
            var found = this.findNode(root.children[i], name);
            if (found) return found;
        }
        return null;
    },
    formatScore: function (value) {
        var num = Number(value || 0);
        if (Math.abs(num) >= 100 && num % 100 === 0) num = num / 100;
        return String(Number(num.toFixed ? num.toFixed(2) : num)).replace(/\.00$/, '');
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
    showTip: function (message) {
        if (!message) return;
        this.showMessagePopup(message);
    },
    showMessagePopup: function (message) {
        cc.loader.loadRes('Main/Prefab/winConfirm', function (err, prefab) {
            if (err || !prefab) {
                console.error('[LeagueAnalysisView] load winConfirm failed', err);
                return;
            }
            var canvas = cc.find('Canvas');
            if (!canvas) return;
            var node = cc.instantiate(prefab);
            canvas.addChild(node);
            node.zIndex = 3000;
            var comp = node.getComponent('ModuleWinConfirm');
            if (comp && comp.show) comp.show('showTipsMsg', message, null, null, '', 3000);
        });
    },
    closeView: function () {
        this.node.destroy();
    },
    getErrorMessage: function (err, fallback) {
        if (!err) return fallback || '操作失败';
        if (typeof err === 'string') return err;
        return err.message || err.msg || err.detail || fallback || '操作失败';
    },
    rejectWithTip: function (message) {
        this.showTip(message);
        return Promise.reject({ message: message });
    },
    isSearchEmpty: function (options, rows) {
        return !!(options && options.keywords && (!rows || rows.length === 0));
    },
    showSearchEmptyTip: function () {
        this.showTip('没有找到');
        return { empty: true };
    },
    getResultData: function (res) {
        return res && (res.data || res.detail) || res || {};
    },
    showSearchPopup: function (options) {
        options = options || {};
        this.openPopup(this.searchPopupPrefab, {
            title: options.title || '查询成员',
            maxLength: options.maxLength || 6,
            onSubmit: options.onSubmit || function (userID) {
                var req = { page: 1, pageSize: this.pageSize, keywords: userID };
                if (this.currentTab === 'partner') return this.loadPartners(req);
                if (this.currentTab === 'agent' || this.currentTab === 'rewardDetail' || this.currentTab === 'operation' || this.currentTab === 'rewardWithdraw') return this.loadGenericList(this.currentTab, req);
                return this.loadMembers(req);
            }.bind(this)
        });
    },
    showInvitePlayerPopup: function () {
        this.showSearchPopup({
            title: '邀请玩家',
            onSubmit: function (userID) {
                return LeagueAnalysisApi.invitePlayer(userID).then(function () {
                    this.showTip('邀请成功');
                    var comp = this.statisticsPageNode && this.statisticsPageNode.getComponent('StatisticsPage');
                    if (comp && comp.load) comp.load();
                }.bind(this));
            }.bind(this)
        });
    },
    showStatisticsSetPartnerFlow: function () {
        this.showSearchPopup({
            title: '设置合伙人',
            onSubmit: function (userID) {
                return LeagueAnalysisApi.findUser(userID).then(function (res) {
                    var user = this.getResultData(res);
                    var existingPartner = this.isPartnerUser(user);
                    this.showSetPartnerPopup(user, {
                        title: existingPartner ? '调整比例' : '设置合伙人',
                        forceAdd: !existingPartner,
                        afterSuccess: function () {
                            var comp = this.statisticsPageNode && this.statisticsPageNode.getComponent('StatisticsPage');
                            if (comp && comp.load) comp.load();
                        }.bind(this)
                    });
                }.bind(this));
            }.bind(this)
        });
    },
    showSetPartnerPopup: function (data, options) {
        options = options || {};
        this.openPopup(this.setPartnerPopupPrefab, {
            title: options.title || '调整比例',
            user: data,
            onSubmit: function (payload) {
                var isExistingPartner = !options.forceAdd && this.isPartnerUser(data);
                var apiName = isExistingPartner ? 'updatePartnerRate' : 'setPartner';
                var api = LeagueAnalysisApi[apiName];
                if (typeof api !== 'function') {
                    return this.rejectWithTip('接口未接入: ' + apiName);
                }
                return api({
                    userID: data.userID || data.userId,
                    roomRate: payload.roomRate,
                    waterRate: payload.waterRate
                }).then(function () {
                    data.role = 'proxy';
                    data.partner = true;
                    data.level = payload.roomRate;
                    data.shuffleLevel = payload.waterRate;
                    data.roomRate = payload.roomRate;
                    data.waterRate = payload.waterRate;
                    if (options.afterSuccess) options.afterSuccess();
                    else if (this.currentTab === 'partner') this.loadPartners({ page: this.page || 1, pageSize: this.pageSize || 20 });
                    else this.setData(this.currentTab === 'partner' ? this.partners : this.members);
                    this.showTip('设置成功');
                }.bind(this));
            }.bind(this)
        });
    },
    isPartnerUser: function (data) {
        data = data || {};
        var role = data.role || data.proxyRole || '';
        return !!(
            data.partner ||
            data.isPartner ||
            role === 'proxy' ||
            role === 'owner' ||
            role === 'manager' ||
            role === 'leader' ||
            Number(data.level || data.roomRate || 0) > 0 ||
            Number(data.shuffleLevel || data.waterRate || 0) > 0
        );
    },
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
            onSubmit: function (payload) {
                if (typeof LeagueAnalysisApi.updateWarning !== 'function') {
                    return this.rejectWithTip('接口未接入: updateWarning');
                }
                return LeagueAnalysisApi.updateWarning(data.userID || data.userId, payload.warningScore).then(function (res) {
                    var result = this.getResultData(res);
                    data.warningScore = result.limit != null ? result.limit : payload.warningScore;
                    data.warning = data.warningScore;
                    data.limitScore = data.warningScore;
                    this.setData(this.currentTab === 'partner' ? this.partners : this.members);
                    this.showTip('设置成功');
                }.bind(this));
            }.bind(this)
        });
    },
    showSubListPopup: function (data, defaultMode) {
        if (!defaultMode) {
            var hasCount = data && (data.leaderCount != null || data.memberCount != null || data.childrenCount != null);
            defaultMode = hasCount && Number(data.memberCount || 0) > 0 && Number(data.leaderCount || 0) <= 0 ? 'member' : 'leader';
        }
        this.openPopup(this.subListPopupPrefab || this.confirmPopupPrefab, {
            user: data,
            children: data && data.children,
            defaultMode: defaultMode
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
                this.showTip(payload.mode === 'sub' || payload.mode === 'reduce' ? '下分成功' : '上分成功');
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
                this.showTip(forbidden ? '封禁成功' : '解除封禁成功');
            }.bind(this));
        }.bind(this) });
    },
    showRewardWithdrawConfirm: function () {
        var reward = Number(this.currentRewardRaw || 0);
        if (reward <= 0) {
            this.showTip('当前没有可提取奖励');
            return;
        }
        this.openPopup(this.confirmPopupPrefab, {
            message: '确认取出当前奖励？',
            onOK: function () {
                return LeagueAnalysisApi.drawReward(reward).then(function (res) {
                    var data = this.getResultData(res);
                    this.currentRewardRaw = data.reward || 0;
                    this.showTip('提取成功');
                    this.loadGenericList('rewardWithdraw');
                }.bind(this));
            }.bind(this)
        });
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
