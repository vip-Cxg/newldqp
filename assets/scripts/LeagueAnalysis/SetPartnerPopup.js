var Cache = require("../../Main/Script/Cache");
var GameConfig = require("../../GameBase/GameConfig").GameConfig;

function getRoot() {
    return cc.find("Canvas") || cc.director.getScene();
}

function showTip(message) {
    message = message || '操作失败';
    cc.loader.loadRes('Main/Prefab/winConfirm', function (err, prefab) {
        if (err || !prefab) {
            console.error('[SetPartnerPopup] load winConfirm failed', err);
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
            console.error('[SetPartnerPopup] load Number failed', err);
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
    init:function(data){this.data=data||{};this.roomRateValue=null;this.waterRateValue=null;this.cacheNodes();this.bindAll();this.refresh();},
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){
        this.bind('BtnClose',this.close);
        this.block('Mask');
        this.bind('BtnConfirm',this.submit);
        this.bindRateInput('RoomRateLabel','roomRate');
        this.bindRateInput('RoomRateInput','roomRate');
        this.bindRateInput('RoomRateBox','roomRate');
        this.bindRateInput('WaterRateLabel','waterRate');
        this.bindRateInput('WaterRateInput','waterRate');
        this.bindRateInput('WaterRateBox','waterRate');
    },
    refresh:function(){
        this.text('Title', this.data.title || '调整比例');
        this.text('RoomRateLabel', this.getRate('roomRate'));
        this.text('WaterRateLabel', this.getRate('waterRate'));
    },
    getRate:function(key){
        if(key==='roomRate'&&this.roomRateValue!=null)return String(this.roomRateValue);
        if(key==='waterRate'&&this.waterRateValue!=null)return String(this.waterRateValue);
        var user=this.data.user||{};
        var value=this.data[key];
        if(value==null)value=user[key];
        if(value==null&&key==='roomRate')value=user.shuffleLevel;
        if(value==null&&key==='waterRate')value=user.level;
        if(value==null)value=0;
        return String(value);
    },
    readNumber:function(name, fallback){
        var node=this.nodes[name];
        var label=node&&node.getComponent(cc.Label);
        var value=label?label.string:fallback;
        value=parseFloat(String(value).replace('%',''));
        return isNaN(value)?0:value;
    },
    bindRateInput:function(name,key){
        var node=this.nodes[name];
        if(!node)return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END,function(e){
            if(e&&e.stopPropagation)e.stopPropagation();
            this.inputRate(key);
        },this);
    },
    inputRate:function(key){
        var title=key==='roomRate'?'请输入房费比例':'请输入抽水比例';
        showNumber(title, GameConfig.NumberType.INT, function(value){
            value=Number(value);
            if(isNaN(value))value=0;
            value=Math.max(0,Math.min(100,Math.floor(value)));
            if(key==='roomRate'){
                this.roomRateValue=value;
                this.text('RoomRateLabel',value);
            }else{
                this.waterRateValue=value;
                this.text('WaterRateLabel',value);
            }
        }.bind(this));
    },
    submit:function(){
        var payload={
            roomRate:this.readNumber('RoomRateLabel', this.getRate('roomRate')),
            waterRate:this.readNumber('WaterRateLabel', this.getRate('waterRate'))
        };
        cc.log('[SetPartnerPopup] submit', payload, this.data);
        if(this.data.onSubmit){
            var ret=this.data.onSubmit(payload);
            if(ret&&ret.then){
                ret.then(function(){this.close();}.bind(this)).catch(function(err){
                    console.error('[SetPartnerPopup] submit failed', err);
                    this.toast(this.errorMessage(err)||'设置失败');
                }.bind(this));
                return;
            }
        }
        this.close();
    },
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    block:function(name){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();},this);},
    text:function(name,v){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=v;},
    errorMessage:function(err){if(!err)return '';if(typeof err==='string')return err;return err.message||err.msg||err.detail||'';},
    toast:function(message){showTip(message||'操作失败');},
    close:function(){this.node.destroy();}
});
