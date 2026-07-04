cc.Class({
    extends: cc.Component,
    properties: {
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
    bindAll:function(){
        this.bind('BtnClose',this.close);
        this.bind('Mask',this.close);
        for(var i=1;i<=7;i++)this.bind('DateButton'+i,this.onDateClick.bind(this,i));
    },
    renderRows:function(){
        var content=this.nodes.content;
        if(!content||!this.rowPrefab)return;
        content.removeAllChildren();
        var rowH=190, spacingY=8, contentW=content.width||920;
        content.setAnchorPoint(0.5,1);
        content.setContentSize(contentW,Math.max(250,this.rows.length*(rowH+spacingY)));
        for(var i=0;i<this.rows.length;i++){
            var node=cc.instantiate(this.rowPrefab);
            var comp=node.getComponent('BattleDetailRow');
            if(comp)comp.setData(this.rows[i],{
                replay:this.openReplay.bind(this),
                copy:this.copyReplayCode.bind(this)
            });
            content.addChild(node);
        }
    },
    openReplay:function(row){
        if(this.owner&&this.owner.showBattleReplayPopup)this.owner.showBattleReplayPopup(row);
    },
    copyReplayCode:function(row){
        cc.log('[BattleDetailPopup] copy replay code',row&&row.replayCode);
    },
    onDateClick:function(index){
        cc.log('[BattleDetailPopup] date click',index);
    },
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    mockRows:function(){
        return [{
            roomID:'123456',
            time:'2019-12-12 12:12',
            gameName:'牛牛0.5底',
            replayCode:'WEEWTFDGFDFGDGFAF',
            players:[
                {name:'哇卡一为...',maskedID:'12****6',score:'+3605'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36.5'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'}
            ]
        }];
    },
    close:function(){this.node.destroy();}
});
