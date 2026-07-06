var Cache = require("../../Main/Script/Cache");

function getMessage(err, fallback) {
    if (!err) return fallback || '请求失败';
    if (typeof err === 'string') return err;
    return err.message || err.msg || err.detail || fallback || '请求失败';
}

function showTip(message) {
    message = getMessage(message, '请求失败');
    cc.loader.loadRes('Main/Prefab/winConfirm', function (err, prefab) {
        if (err || !prefab) {
            console.error('[SearchMemberPopup] load winConfirm failed', err);
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
}

cc.Class({
    extends: cc.Component,
    properties: {},
    init: function (data, owner) {
        this.data = data || {};
        this.owner = owner;
        this.input = '';
        this.submitting = false;
        this.maxLength = Number(this.data.maxLength || this.data.autoSubmitLength || 6);
        this.cacheNodes();
        this.bindAll();
        this.refresh();
    },
    cacheNodes: function () { this.nodes = {}; this.collect(this.node); },
    collect: function (node) { this.nodes[node.name] = node; for (var i=0;i<node.children.length;i++) this.collect(node.children[i]); },
    bindAll: function () {
        this.bind('BtnClose', this.close);
        this.block('Mask');
        for (var i=0;i<=9;i++) this.bind('Key_' + i, this.append.bind(this, String(i)));
        this.bind('Key_reset', function(){ this.input=''; this.refresh(); });
        this.bind('Key_del', function(){ this.input=this.input.slice(0,-1); this.refresh(); });
    },
    bind: function (name, fn) {
        var node=this.nodes[name]; if(!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function(e){ if(e&&e.stopPropagation)e.stopPropagation(); fn.call(this); }, this);
    },
    block: function (name) {
        var node=this.nodes[name]; if(!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function(e){ if(e&&e.stopPropagation)e.stopPropagation(); }, this);
    },
    append: function (n) {
        if(this.submitting || this.input.length>=this.maxLength) return;
        this.input+=n;
        this.refresh();
        if(this.input.length===this.maxLength) this.submit();
    },
    submit: function () {
        if (this.submitting) return;
        cc.log('[SearchMemberPopup] submit id', this.input);
        if (!this.input || this.input.length < this.maxLength) return;
        if (this.data && this.data.onSubmit) {
            var ret;
            this.submitting = true;
            try {
                ret = this.data.onSubmit(this.input);
            } catch (err) {
                this.submitting = false;
                console.error('[SearchMemberPopup] submit failed', err);
                showTip(getMessage(err, '请求失败'));
                return;
            }
            if (ret && ret.then) {
                ret.then(function () {
                    this.close();
                }.bind(this)).catch(function (err) {
                    this.submitting = false;
                    console.error('[SearchMemberPopup] submit failed', err);
                    if (!err || !err.__leagueAnalysisTipShown) showTip(getMessage(err, '请求失败'));
                }.bind(this));
                return;
            }
        }
        this.close();
    },
    refresh: function () {
        this.text('Title', this.data.title || '查询成员');
        this.text('InputLabel', this.input);
    },
    text: function (name, value) {
        var node = this.nodes[name];
        var label=node&&(node.getComponent(cc.Label)||node.getComponentInChildren(cc.Label));
        if(label) label.string=String(value == null ? '' : value);
    },
    close: function () { this.node.destroy(); }
});
