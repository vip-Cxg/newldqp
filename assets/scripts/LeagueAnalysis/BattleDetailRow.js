var utils = require("../../Main/Script/utils");
var GameConfig = require("../../GameBase/GameConfig").GameConfig;

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
        var row=this.viewData(this.data);
        this.data._view=row;
        this.setChildText(this.nodes.HeaderBar,'RoomId','房间ID:'+row.roomID);
        this.setChildText(this.nodes.HeaderBar,'Time',row.time||'');
        this.setChildText(this.nodes.HeaderBar,'GameType',row.gameName||'');
        this.setChildText(this.nodes.HeaderBar,'ReplayCode','回访码：'+(row.replayCode||''));
        var players=row.players||[];
        for(var i=0;i<8;i++){
            var slot=this.nodes['PlayerCard_'+i];
            if(!slot)continue;
            slot.active=!!players[i];
            if(!players[i])continue;
            this.setChildText(slot,'NameLabel',players[i].name);
            this.setChildText(slot,'MaskedIDLabel',players[i].maskedID);
            this.setChildText(slot,'ScoreLabel',players[i].score);
            this.setScoreColor(slot,'ScoreLabel',players[i].score);
            this.setAvatar(slot,players[i].head);
        }
        this.bind('BtnCopyReplayCode','copy');
        this.bind('BtnViewReplay','replay');
    },
    viewData:function(data){
        data=data||{};
        var detail=data.data||{};
        var rule=data.rule||{};
        var players=Array.isArray(data.players)?data.players:[];
        if(!players.length&&Array.isArray(detail.players))players=detail.players;
        return {
            id:data.id,
            logID:data.logID||data.id,
            fileID:data.fileID,
            roomID:data.roomID||data.tableID||'',
            time:data.time||data.createdAt||'',
            gameName:data.gameName||rule.name||data.gameType||'',
            replayCode:data.replayCode||(data.strDate&&data.fileID?data.strDate+'/'+data.fileID:data.fileID||''),
            players:this.viewPlayers(players)
        };
    },
    viewPlayers:function(players){
        var list=[];
        players=players||[];
        for(var i=0;i<players.length;i++){
            var player=players[i]||{};
            var prop=player.prop||{};
            var userID=prop.id||player.userID||player.id||'';
            list.push({
                name:prop.name||player.name||'玩家',
                maskedID:this.maskID(userID),
                score:this.formatScore(player.total!=null?player.total:player.score),
                head:prop.head||player.head||player.avatarUrl||player.avatar||''
            });
        }
        return list;
    },
    maskID:function(userID){
        var text=String(userID||'');
        if(text.length<=2)return text;
        return text.slice(0,2)+'****'+text.slice(text.length-1);
    },
    formatScore:function(value){
        value=Number(value||0);
        var text=(value/100).toFixed(2).replace(/\.00$/,'');
        if(value>0&&text.indexOf('+')!==0)text='+'+text;
        return text;
    },
    setChildText:function(root,name,value){var n=root.getChildByName(name);var l=n&&n.getComponent(cc.Label);if(l)l.string=value;},
    setAvatar:function(root,head){
        var node=this.findNode(root,'Avatar');
        if(!node)return;
        var avatar=node.getComponent('Avatar');
        if(avatar){
            avatar.avatarUrl=head||'';
            return;
        }
        var sprite=node.getComponent(cc.Sprite);
        if(sprite&&utils&&utils.setHead){
            var url=head||'';
            if(url&&url.indexOf('://')===-1)url=(GameConfig.HeadUrl||'')+url;
            utils.setHead(sprite,url);
        }
    },
    findNode:function(root,name){
        if(!root)return null;
        if(root.name===name)return root;
        for(var i=0;i<root.children.length;i++){
            var found=this.findNode(root.children[i],name);
            if(found)return found;
        }
        return null;
    },
    setScoreColor:function(root,name,value){var n=root.getChildByName(name);var l=n&&n.getComponent(cc.Label);if(!l)return;var str=String(value||'');l.node.color=str.indexOf('-')===0?new cc.Color(35,110,205,255):new cc.Color(200,70,35,255);},
    text:function(name,value){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=value;},
    bind:function(name,eventName){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();if(this.handlers[eventName])this.handlers[eventName](this.data);},this);}
});
