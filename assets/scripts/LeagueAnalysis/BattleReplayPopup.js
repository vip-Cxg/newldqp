var LeagueAnalysisApi = require("./LeagueAnalysisApi");

cc.Class({
    extends: cc.Component,
    properties:{
        rowPrefab: cc.Prefab
    },
    init:function(data,owner){
        this.data=data||{};
        this.owner=owner;
        this.rows=[];
        this.cacheNodes();
        this.bindAll();
        this.loadRows();
    },
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){this.bind('BtnClose',this.close);this.bind('Mask',this.close);},
    loadRows:function(){
        LeagueAnalysisApi.battleReplay({
            logID:this.data.logID||this.data.id,
            fileID:this.data.fileID||this.data.replayCode
        }).then(function(res){
            var data=res && res.data || {};
            this.text('RoomLabel','房间号：'+(data.roomID||this.data.roomID||''));
            this.rows=data.rows&&data.rows.length?data.rows:this.mockRows();
            this.renderRows();
        }.bind(this)).catch(function(err){
            console.error('[BattleReplayPopup] fallback',err);
            this.text('RoomLabel','房间号：'+(this.data.roomID||'9999999'));
            this.rows=this.mockRows();
            this.renderRows();
        }.bind(this));
    },
    renderRows:function(){
        var content=this.nodes.content;
        if(!content||!this.rowPrefab)return;
        content.removeAllChildren();
        var rowH=188, spacingY=18, contentW=content.width||920;
        content.setAnchorPoint(0.5,1);
        content.setContentSize(contentW,Math.max(430,this.rows.length*(rowH+spacingY)));
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
    text:function(name,value){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=value;},
    mockRows:function(){
        function players(offset){
            return [
                {name:'玩家昵称...',score:'+18'},
                {name:'玩家昵称...',score:offset%2?'-36':'+18'},
                {name:'玩家昵称...',score:'+18'},
                {name:'玩家昵称...',score:'+18'},
                {name:'玩家昵称...',score:'-180'},
                {name:'玩家昵称...',score:'+18'},
                {name:'玩家昵称...',score:offset%2?'+36':'-18'},
                {name:'玩家昵称...',score:'+18'}
            ];
        }
        return [
            {result:'lose',round:'1/7',players:players(1)},
            {result:'win',round:'2/7',players:players(2)},
            {result:'lose',round:'3/7',players:players(3)},
            {result:'win',round:'4/7',players:players(4)},
            {result:'lose',round:'5/7',players:players(5)}
        ];
    },
    close:function(){this.node.destroy();}
});
