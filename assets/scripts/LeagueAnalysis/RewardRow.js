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

    },
    text: function (name, value) {
        var label = this.nodes[name] && this.nodes[name].getComponent(cc.Label);
        if (!label) return;
        label.string = value;
        label.enableWrapText = false;
        label.overflow = cc.Label.Overflow.CLAMP;
    }
});
