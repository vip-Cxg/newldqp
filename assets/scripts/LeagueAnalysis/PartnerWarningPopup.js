var Cache = require("../../Main/Script/Cache");
var GameConfig = require("../../GameBase/GameConfig").GameConfig;

function getRoot() {
    return cc.find("Canvas") || cc.director.getScene();
}

function showTip(message) {
    message = message || '操作失败';
    cc.loader.loadRes('Main/Prefab/winConfirm', function (err, prefab) {
        if (err || !prefab) {
            console.error('[PartnerWarningPopup] load winConfirm failed', err);
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

function bringNumberToFront() {
    var number = cc.find('Canvas/Number');
    if (number) number.zIndex = 4000;
}

function showNumber(title, type, callback) {
    var canvas = cc.find('Canvas');
    if (canvas && Cache && Cache.showNumer) {
        Cache.showNumer(title, type, callback);
        setTimeout(bringNumberToFront, 50);
        return;
    }
    var root = getRoot();
    if (!root) {
        showTip('数字键盘未加载');
        return;
    }
    cc.loader.loadRes("prefab/Number", function (err, prefab) {
        if (err || !prefab) {
            console.error('[PartnerWarningPopup] load Number failed', err);
            showTip('数字键盘加载失败');
            return;
        }
        var node = cc.instantiate(prefab);
        root.addChild(node, 10000);
        node.name = 'Number';
        node.zIndex = 4000;
        var comp = node.getComponent('Number');
        if (comp && comp.initCallback) comp.initCallback(title, type, callback);
    });
}

cc.Class({
    extends: cc.Component,
    properties: {},
    init: function (data) {
        this.data = data || {};
        this.input = String(this.getWarningValue());
        this.cacheNodes();
        this.bindAll();
        this.refresh();
    },
    cacheNodes: function () { this.nodes = {}; this.collect(this.node); },
    collect: function (node) {
        this.nodes[node.name] = node;
        for (var i = 0; i < node.children.length; i++) this.collect(node.children[i]);
    },
    bindAll: function () {
        this.bind('BtnClose', this.close);
        this.bind('BtnConfirm', this.submit);
        this.bind('ConfirmButton', this.submit);
        this.bindWarningInput('WarningInput');
        this.bindWarningInput('WarningValue');
        this.block('Mask');
    },
    getWarningValue: function () {
        var user = this.data.user || {};
        var value = user.warningScore || user.warning || user.limitScore || 0;
        return Number(value || 0) / 100;
    },
    refresh: function () {
        this.text('Title', '设置警戒分');
        this.text('WarningTitle', '警戒分:');
        this.text('WarningValue', this.input);
    },
    inputWarning: function () {
        showNumber('请输入警戒分', GameConfig.NumberType.FLOAT, function (value) {
            value = Number(value);
            if (isNaN(value)) value = 0;
            this.input = String(value);
            this.text('WarningValue', this.input);
        }.bind(this));
    },
    submit: function () {
        var value = Number(this.input || 0);
        var user = this.data.user || {};
        user.warningScore = Math.floor(value * 100);
        if (this.data.onSubmit) {
            var ret = this.data.onSubmit({ warningScore: user.warningScore, user: user });
            if (ret && ret.then) {
                ret.then(function () {
                    this.close();
                }.bind(this)).catch(function (err) {
                    console.error('[PartnerWarningPopup] submit failed', err);
                    this.toast(this.errorMessage(err) || '设置失败');
                }.bind(this));
                return;
            }
        }
        this.close();
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
    bindWarningInput: function (name) {
        var node = this.nodes[name];
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            this.inputWarning();
        }, this);
    },
    block: function (name) {
        var node = this.nodes[name];
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
        }, this);
    },
    text: function (name, value) {
        var node = this.nodes[name];
        var label = node && (node.getComponent(cc.Label) || node.getComponentInChildren(cc.Label));
        if (label) label.string = value;
    },
    hide: function (name) {
        if (this.nodes[name]) this.nodes[name].active = false;
    },
    errorMessage: function (err) {
        if (!err) return '';
        if (typeof err === 'string') return err;
        return err.message || err.msg || err.detail || '';
    },
    toast: function (message) {
        message = message || '操作失败';
        showTip(message);
    },
    close: function () { this.node.destroy(); }
});
