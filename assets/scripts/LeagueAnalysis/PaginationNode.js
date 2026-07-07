module.exports = cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad: function () {
        this.page = 1;
        this.totalPage = 1;
        this.pageSize = 10;
        this.total = 0;
        this.onPageChange = null;
        this.cacheNodes();
        this.bindButtons();
        this.updateState();
    },
    init: function (options) {
        options = options || {};
        this.cacheNodes();
        this.page = Number(options.page || this.page || 1);
        this.totalPage = Math.max(1, Number(options.totalPage || this.totalPage || 1));
        this.pageSize = Number(options.pageSize || this.pageSize || 10);
        if (options.onPageChange) this.onPageChange = options.onPageChange;
        this.updateState();
    },
    cacheNodes: function () {
        this.prevButtonNode = this.findNode('btn_pre');
        this.nextButtonNode = this.findNode('btn_next');
        this.pageLabelNode = this.findNode('page');
        this.prevButton = this.prevButtonNode && this.prevButtonNode.getComponent(cc.Button);
        this.nextButton = this.nextButtonNode && this.nextButtonNode.getComponent(cc.Button);
        this.pageLabel = this.pageLabelNode && this.pageLabelNode.getComponent(cc.Label);
    },
    bindButtons: function () {
        this.bindClick(this.prevButtonNode, this.onPrevClick.bind(this));
        this.bindClick(this.nextButtonNode, this.onNextClick.bind(this));
    },
    bindClick: function (node, fn) {
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            fn();
        }, this);
    },
    findNode: function (name, root) {
        root = root || this.node;
        if (!root) return null;
        if (root.name === name) return root;
        for (var i = 0; i < root.children.length; i++) {
            var found = this.findNode(name, root.children[i]);
            if (found) return found;
        }
        return null;
    },
    setPage: function (page, totalPage) {
        this.page = Math.max(1, Number(page || 1));
        if (totalPage != null) this.totalPage = Math.max(1, Number(totalPage || 1));
        if (this.page > this.totalPage) this.page = this.totalPage;
        this.updateState();
    },
    setTotal: function (total, pageSize) {
        this.total = Math.max(0, Number(total || 0));
        if (pageSize != null) this.pageSize = Math.max(1, Number(pageSize || 10));
        this.totalPage = Math.max(1, Math.ceil(this.total / this.pageSize));
        if (this.page > this.totalPage) this.page = this.totalPage;
        this.updateState();
    },
    setCallback: function (onPageChange) {
        this.onPageChange = onPageChange;
    },
    setEnabled: function (prevEnabled, nextEnabled) {
        if (this.prevButton) this.prevButton.interactable = !!prevEnabled;
        if (this.nextButton) this.nextButton.interactable = !!nextEnabled;
        if (this.prevButtonNode) this.prevButtonNode.opacity = prevEnabled ? 255 : 120;
        if (this.nextButtonNode) this.nextButtonNode.opacity = nextEnabled ? 255 : 120;
    },
    onPrevClick: function () {
        if (this.page <= 1) return;
        var page = this.page - 1;
        if (this.onPageChange) this.onPageChange(page);
        else this.setPage(page);
    },
    onNextClick: function () {
        if (this.page >= this.totalPage) return;
        var page = this.page + 1;
        if (this.onPageChange) this.onPageChange(page);
        else this.setPage(page);
    },
    updateState: function () {
        if (!this.pageLabel) this.cacheNodes();
        if (this.pageLabel) this.pageLabel.string = this.page + '/' + this.totalPage;
        this.setEnabled(this.page > 1, this.page < this.totalPage);
    }
});
