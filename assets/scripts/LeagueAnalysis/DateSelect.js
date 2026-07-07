module.exports = cc.Class({
    extends: cc.Component,
    properties: {},

    onLoad: function () {
        this.days = 3;
        this.value = '';
        this.onChange = null;
        this.options = [];
        this.cacheNodes();
        this.bindEvents();
        this.close();
    },

    init: function (options) {
        options = options || {};
        this.cacheNodes();
        this.days = Math.max(1, Number(options.days || this.days || 3));
        this.onChange = options.onChange || null;
        this.refreshOptions();
        this.setDate(options.defaultDate || this.options[0], true);
        this.bindEvents();
        this.close();
    },

    cacheNodes: function () {
        this.btnDate = this.findNode('Btn_Date');
        this.labelDateNode = this.findNode('Label_Date', this.btnDate);
        this.labelDate = this.labelDateNode && this.labelDateNode.getComponent(cc.Label);
        this.dropdown = this.findNode('DateDropdown');
        this.items = [];
        for (var i = 0; i < this.days; i++) {
            var item = this.findNode('Item_' + i, this.dropdown);
            if (item) this.items.push(item);
        }
    },

    bindEvents: function () {
        this.bindClick(this.btnDate, this.toggle.bind(this));
        if (this.dropdown && !this.dropdown.getComponent(cc.BlockInputEvents)) {
            this.dropdown.addComponent(cc.BlockInputEvents);
        }
        for (var i = 0; i < this.items.length; i++) {
            this.bindClick(this.items[i], this.onItemClick.bind(this, i));
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

    onItemClick: function (index) {
        var date = this.options[index];
        if (!date) return;
        this.setDate(date);
        this.close();
    },

    setDate: function (date, silent) {
        if (!date) date = this.formatDate(new Date());
        this.value = typeof date === 'string' ? date : this.formatDate(date);
        if (this.labelDate) this.labelDate.string = this.value;
        if (!silent && this.onChange) this.onChange(this.value);
    },

    getDate: function () {
        return this.value || this.formatDate(new Date());
    },

    open: function () {
        if (this.dropdown) this.dropdown.active = true;
    },

    close: function () {
        if (this.dropdown) this.dropdown.active = false;
    },

    toggle: function () {
        if (!this.dropdown) return;
        this.dropdown.active = !this.dropdown.active;
    },

    refreshOptions: function () {
        this.options = [];
        var today = new Date();
        for (var i = 0; i < this.days; i++) {
            var date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
            this.options.push(this.formatDate(date));
        }
        for (var j = 0; j < this.items.length; j++) {
            var labelNode = this.findNode('Label_Date', this.items[j]);
            var label = labelNode && labelNode.getComponent(cc.Label);
            if (label) label.string = this.options[j] || '';
            this.items[j].active = !!this.options[j];
        }
    },

    formatDate: function (date) {
        if (typeof date === 'string') return date;
        date = date || new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
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
    }
});
