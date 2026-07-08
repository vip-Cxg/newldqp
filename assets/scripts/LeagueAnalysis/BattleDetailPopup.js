var LeagueAnalysisApi = require("./LeagueAnalysisApi");

cc.Class({
    extends: cc.Component,
    properties: {
        rowPrefab: cc.Prefab
    },
    init:function(data,owner){
        this.data=data||{};
        this.owner=owner;
        this.selectedDate=1;
        this.rows=[];
        this.cacheNodes();
        this.bindAll();
        this.updateDateButtons();
        this.renderSummary();
        this.loadRows();
    },
    renderSummary:function(){
        this.text('Name', this.data.nickname || this.data.name || '玩家信息');
        this.text('UserID', String(this.data.userID || this.data.userId || ''));
        this.text('TodayRound', '今日局数：' + (this.data.todayRounds || 0));
        this.text('WinLose', '输赢：' + (this.data.todayResult || 0));
    },
    loadRows:function(){
        var userID=this.data.userID||this.data.userId;
        LeagueAnalysisApi.battleDetails({
            userID:userID,
            page:1,
            pageSize:20,
            strDate:this.getDateString(this.selectedDate)
        }).then(function(res){
            var logs=res && (res.logs || res.data && res.data.logs || res.data) || {};
            this.rows=(logs.rows || res.rows || []);
            this.renderRows();
        }.bind(this)).catch(function(err){
            console.error('[BattleDetailPopup] load failed',err);
            this.rows=[];
            this.renderRows();
        }.bind(this));
    },
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){
        this.bind('BtnClose',this.close);
        this.block('Mask');
        for(var i=1;i<=7;i++)this.bind('DateButton'+i,this.onDateClick.bind(this,i));
    },
    updateDateButtons:function(){
        for(var i=1;i<=7;i++){
            var n=this.nodes['DateButton'+i];
            if(!n)continue;
            this.setAllLabels(n,this.getDateLabel(i));
            var normal=n.getChildByName('Normal');
            var selected=n.getChildByName('Selected');
            if(normal)normal.active=i!==this.selectedDate;
            if(selected)selected.active=i===this.selectedDate;
        }
    },
    getDateLabel:function(index){
        var date=new Date();
        date.setDate(date.getDate()-(Number(index||1)-1));
        var m=date.getMonth()+1;
        var d=date.getDate();
        return (m<10?'0':'')+m+'月'+(d<10?'0':'')+d+'日';
    },
    getDateString:function(index){
        var date=new Date();
        date.setDate(date.getDate()-(Number(index||1)-1));
        var y=date.getFullYear();
        var m=date.getMonth()+1;
        var d=date.getDate();
        return String(y)+(m<10?'0':'')+m+(d<10?'0':'')+d;
    },
    renderRows:function(){
        var content=this.nodes.content;
        if(!content||!this.rowPrefab)return;
        content.removeAllChildren();
        var rowH=206, spacingY=12, contentW=content.width||920;
        content.setAnchorPoint(0.5,1);
        content.setContentSize(contentW,Math.max(300,this.rows.length*(rowH+spacingY)));
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
        var view=row&&row._view||{};
        cc.log('[BattleDetailPopup] copy replay code',view.replayCode||row&&row.replayCode);
    },
    onDateClick:function(index){
        this.selectedDate=index;
        this.updateDateButtons();
        cc.log('[BattleDetailPopup] date click',index);
        this.loadRows();
    },
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    block:function(name){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();},this);},
    text:function(name,value){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=value;},
    setAllLabels:function(node,value){
        if(!node)return;
        var label=node.getComponent(cc.Label);
        if(label)label.string=value;
        for(var i=0;i<node.children.length;i++)this.setAllLabels(node.children[i],value);
    },
    close:function(){this.node.destroy();}
});
