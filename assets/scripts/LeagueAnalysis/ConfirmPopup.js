cc.Class({
    extends: cc.Component,
    properties: {},
    init:function(data){this.data=data||{};this.cacheNodes();this.bindAll();this.text('MessageLabel',this.data.message||'确认操作？');},
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){this.bind('BtnClose',this.close);this.bind('Mask',this.close);this.bind('BtnCancel',this.close);this.bind('BtnOK',function(){if(this.data.onOK)this.data.onOK();this.close();});},
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    text:function(name,v){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=v;},
    close:function(){this.node.destroy();}
});
