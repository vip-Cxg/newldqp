cc.Class({
    extends: cc.Component,
    properties: {},
    init: function (data, owner) {
        this.data = data || {};
        this.owner = owner;
        this.input = '';
        this.cacheNodes();
        this.bindAll();
        this.refresh();
    },
    cacheNodes: function () { this.nodes = {}; this.collect(this.node); },
    collect: function (node) { this.nodes[node.name] = node; for (var i=0;i<node.children.length;i++) this.collect(node.children[i]); },
    bindAll: function () {
        this.bind('BtnClose', this.close);
        this.bind('Mask', this.close);
        for (var i=0;i<=9;i++) this.bind('Key_' + i, this.append.bind(this, String(i)));
        this.bind('Key_重输', function(){ this.input=''; this.refresh(); });
        this.bind('Key_删除', function(){ this.input=this.input.slice(0,-1); this.refresh(); });
    },
    bind: function (name, fn) {
        var node=this.nodes[name]; if(!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function(e){ if(e&&e.stopPropagation)e.stopPropagation(); fn.call(this); }, this);
    },
    append: function (n) {
        if(this.input.length>=6) return;
        this.input+=n;
        this.refresh();
        if(this.input.length===6) this.submit();
    },
    submit: function () {
        cc.log('[SearchMemberPopup] submit id', this.input);
        if (this.data && this.data.onSubmit) this.data.onSubmit(this.input);
        this.close();
    },
    refresh: function () { var label=this.nodes.InputLabel&&this.nodes.InputLabel.getComponent(cc.Label); if(label) label.string=this.input; },
    close: function () { this.node.destroy(); }
});
