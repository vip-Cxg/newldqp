cc.Class({
    extends: cc.Component,
    properties: {},
    init:function(data,owner){this.data=data||{};this.owner=owner;this.cacheNodes();this.bindAll();},
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){this.bind('BtnClose',this.close);this.bind('Mask',this.close);this.bind('BtnReplay',function(){if(this.owner)this.owner.showBattleReplayPopup(this.data);});this.bind('BtnOpenReplay',function(){cc.log('[BattleReplayPopup] open replay',this.data);});},
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    close:function(){this.node.destroy();}
});
