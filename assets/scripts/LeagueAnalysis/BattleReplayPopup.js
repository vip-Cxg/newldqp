cc.Class({
    extends: cc.Component,
    properties:{
        rowPrefab: cc.Prefab
    },
    init:function(data,owner){
        this.data=data||{};
        this.owner=owner;
        this.rows=this.mockRows();
        this.cacheNodes();
        this.bindAll();
        this.renderRows();
    },
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){this.bind('BtnClose',this.close);this.bind('Mask',this.close);},
    renderRows:function(){
        var content=this.nodes.content;
        if(!content||!this.rowPrefab)return;
        content.removeAllChildren();
        var rowH=186, spacingY=16, contentW=content.width||920;
        content.setAnchorPoint(0.5,1);
        content.setContentSize(contentW,Math.max(380,this.rows.length*(rowH+spacingY)));
        for(var i=0;i<this.rows.length;i++){
            var node=cc.instantiate(this.rowPrefab);
            var comp=node.getComponent('BattleReplayRow');
            if(comp)comp.setData(this.rows[i],{
                viewReplay:this.viewReplay.bind(this)
            });
            content.addChild(node);
        }
    },
    viewReplay:function(row){cc.log('[BattleReplayPopup] view replay',row);},
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    mockRows:function(){
        var players=[
            {name:'玩家昵称...',score:'+18'},
            {name:'玩家昵称...',score:'+18'},
            {name:'玩家昵称...',score:'+18'},
            {name:'玩家昵称...',score:'+18'},
            {name:'玩家昵称...',score:'-180'},
            {name:'玩家昵称...',score:'+18'},
            {name:'玩家昵称...',score:'+18'},
            {name:'玩家昵称...',score:'+18'}
        ];
        return [
            {result:'lose',round:'1/7',players:players},
            {result:'win',round:'1/7',players:players}
        ];
    },
    close:function(){this.node.destroy();}
});
