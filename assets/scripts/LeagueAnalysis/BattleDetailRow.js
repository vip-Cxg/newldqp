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
        this.text('RoomLabel','房间ID:'+this.data.roomID+'  '+this.data.time);
        this.text('GameNameLabel',this.data.gameName||'');
        this.text('ReplayCodeLabel','回访码：'+(this.data.replayCode||''));
        var players=this.data.players||[];
        for(var i=0;i<8;i++){
            var slot=this.nodes['PlayerSlot'+(i+1)];
            if(!slot)continue;
            slot.active=!!players[i];
            if(!players[i])continue;
            this.setChildText(slot,'NameLabel',players[i].name);
            this.setChildText(slot,'MaskedIDLabel',players[i].maskedID);
            this.setChildText(slot,'ScoreLabel',players[i].score);
        }
        this.bind('BtnCopyReplayCode','copy');
        this.bind('BtnReplay','replay');
    },
    setChildText:function(root,name,value){var n=root.getChildByName(name);var l=n&&n.getComponent(cc.Label);if(l)l.string=value;},
    text:function(name,value){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=value;},
    bind:function(name,eventName){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();if(this.handlers[eventName])this.handlers[eventName](this.data);},this);}
});
