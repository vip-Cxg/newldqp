cc.Class({
    extends: cc.Component,
    properties:{},
    onLoad:function(){this.cacheNodes();},
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    setData:function(data,handlers){
        this.data=data||{};
        this.handlers=handlers||{};
        if(!this.nodes)this.cacheNodes();
        this.setChildText(this.nodes.ResultArea,'RoundLabel',this.data.round||'1/7');
        var isWin=this.data.result==='win';
        if(this.nodes.ResultLoseIcon)this.nodes.ResultLoseIcon.active=!isWin;
        if(this.nodes.ResultWinIcon)this.nodes.ResultWinIcon.active=isWin;
        this.fillList(this.nodes.PlayerListLeft,(this.data.players||[]).slice(0,4));
        this.fillList(this.nodes.PlayerListRight,(this.data.players||[]).slice(4,8));
        this.bind('BtnViewReplay','viewReplay');
    },
    fillList:function(root,list){
        if(!root)return;
        for(var i=0;i<4;i++){
            this.setChildText(root,'Name'+(i+1),list[i]?list[i].name:'');
            this.setChildText(root,'Score'+(i+1),list[i]?this.formatScore(list[i].score):'');
            this.setScoreColor(root,'Score'+(i+1),list[i]?this.formatScore(list[i].score):'');
        }
    },
    formatScore:function(value){
        if(typeof value==='string')return value;
        value=Number(value||0);
        var text=(value/100).toFixed(2).replace(/\.00$/,'');
        if(value>0&&text.indexOf('+')!==0)text='+'+text;
        return text;
    },
    setChildText:function(root,name,value){var n=root.getChildByName(name);var l=n&&n.getComponent(cc.Label);if(l)l.string=value;},
    setScoreColor:function(root,name,value){var n=root&&root.getChildByName(name);var l=n&&n.getComponent(cc.Label);if(!l)return;var str=String(value||'');l.node.color=str.indexOf('-')===0?new cc.Color(42,155,48,255):new cc.Color(190,55,35,255);},
    text:function(name,value){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=value;},
    bind:function(name,eventName){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();if(this.handlers[eventName])this.handlers[eventName](this.data);},this);}
});
