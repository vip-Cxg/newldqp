var LeagueAnalysisApi = require("./LeagueAnalysisApi");
var Connector = require("../../Main/NetWork/Connector");
var Cache = require("../../Main/Script/Cache");
var DataBase = require("../../Main/Script/DataBase");
var GameConfig = require("../../GameBase/GameConfig").GameConfig;

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
    bindAll:function(){this.bind('BtnClose',this.close);this.block('Mask');},
    loadRows:function(){
        var localRows=this.getLocalDetailRows();
        if(localRows){
            this.text('RoomLabel','房间号：'+(this.data.roomID||this.data.tableID||''));
            this.text('RoundLabel','局数：'+localRows.length);
            this.rows=localRows;
            this.renderRows();
            return;
        }
        LeagueAnalysisApi.battleReplay({
            logID:this.data.logID||this.data.id,
            fileID:this.data.fileID||this.data.replayCode
        }).then(function(res){
            var data=res && res.data || {};
            this.text('RoomLabel','房间号：'+(data.roomID||this.data.roomID||''));
            this.rows=data.rows&&data.rows.length?data.rows:[];
            this.renderRows();
        }.bind(this)).catch(function(err){
            console.error('[BattleReplayPopup] load failed',err);
            this.text('RoomLabel','房间号：'+(this.data.roomID||''));
            this.rows=[];
            this.renderRows();
        }.bind(this));
    },
    getLocalDetailRows:function(){
        var detailData=this.data&&this.data.data||{};
        var details=detailData.details||this.data.details;
        if(!details||!details.length)return null;
        var players=this.getPlayers();
        var rows=[];
        for(var i=0;i<details.length;i++){
            var detail=details[i]||{};
            var scores=detail.scores||[];
            var rowPlayers=this.mergePlayers(players,scores);
            rows.push({
                round:(detail.round||i+1)+'/'+details.length,
                turn: detail.round || i + 1,
                replayID: this.getReplayID(detail.round || i + 1),
                result:this.getRoundResult(rowPlayers),
                players:rowPlayers
            });
        }
        return rows;
    },
    getReplayID:function(turn){
        var strDate=this.data.strDate||'';
        var fileID=this.data.fileID||'';
        var replayCode=this.data.replayCode||'';
        if(replayCode&&replayCode.indexOf('/')!==-1&&replayCode.indexOf('_')!==-1)return replayCode;
        if(!strDate&&replayCode&&replayCode.indexOf('/')!==-1){
            strDate=replayCode.split('/')[0];
            fileID=replayCode.split('/')[1];
        }
        if(!strDate||!fileID)return replayCode||fileID||'';
        return strDate+'/'+fileID+'_'+turn;
    },
    getPlayers:function(){
        var detailData=this.data&&this.data.data||{};
        var players=Array.isArray(this.data.players)?this.data.players:[];
        if(!players.length&&Array.isArray(detailData.players))players=detailData.players;
        return players||[];
    },
    mergePlayers:function(players,scores){
        var list=[];
        var max=Math.max(players.length,scores.length);
        for(var i=0;i<max;i++){
            var player=players[i]||{};
            var prop=player.prop||{};
            var score=scores[i]!=null?scores[i]:(player.total!=null?player.total:player.score);
            list.push({
                name:prop.name||player.name||('玩家'+(i+1)),
                userID:prop.id||prop.userID||prop.pid||player.id||player.userID||player.pid||'',
                score:score
            });
        }
        return list;
    },
    getRoundResult:function(players){
        players=players||[];
        var targetID=this.data&&(this.data.userID||this.data.playerID||this.data.uid);
        var target=players[0]||{};
        if(targetID){
            for(var i=0;i<players.length;i++){
                if(String(players[i].userID||'')===String(targetID)){
                    target=players[i];
                    break;
                }
            }
        }
        return Number(target.score||0)>0?'win':'lose';
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
            node.setAnchorPoint(0.5,0.5);
            node.setPosition(0,-rowH/2-i*(rowH+spacingY));
            var comp=node.getComponent('BattleReplayRow');
            if(comp)comp.setData(this.rows[i],{
                viewReplay:this.viewReplay.bind(this)
            });
            content.addChild(node);
        }
    },
    viewReplay:function(row){
        row=row||{};
        var replayID=row.replayID||this.getReplayID(row.turn||1);
        if(!replayID){
            this.showTip('暂无回放');
            return;
        }
        var gameType=this.getGameTypeFromReplayID(replayID);
        var gameID=DataBase.GAME_TYPE&&DataBase.GAME_TYPE[gameType];
        var gameIDText=gameID<10?'0'+gameID:''+gameID;
        if(gameID==null||gameIDText===''){
            this.showTip('回放码错误');
            return;
        }
        this.loadReplayByID(replayID,gameIDText,0);
    },
    getGameTypeFromReplayID:function(replayID){
        var first=replayID.indexOf('/');
        var end=replayID.indexOf('_');
        if(first===-1||end===-1||end<=first)return '';
        return replayID.slice(first+1,end);
    },
    loadReplayByID:function(replayID,gameIDText,retryCount){
        Connector.get(GameConfig.RecordUrl+'records/'+replayID+'.json','getJson',function(resData){
            Cache.replayData=resData;
            GameConfig.CurrentReplayData=replayID;
            if(resData==null){
                this.showTip('暂无回放');
                return;
            }
            cc.loader.loadRes('Main/Prefab/replay'+gameIDText,function(err,prefab){
                if(err||!prefab){
                    cc.log('error to load replay',err);
                    this.showTip('暂时无法播放');
                    return;
                }
                var nodeReplay=cc.instantiate(prefab);
                nodeReplay.parent=cc.find('Canvas');
            }.bind(this));
        }.bind(this),true,function(){
            if(retryCount>0){
                this.showTip('暂无回放');
                return;
            }
            var fixed=this.getPreviousDayReplayID(replayID);
            if(!fixed||fixed===replayID){
                this.showTip('暂无回放');
                return;
            }
            this.loadReplayByID(fixed,gameIDText,retryCount+1);
        }.bind(this));
    },
    getPreviousDayReplayID:function(replayID){
        var parts=String(replayID||'').split('/');
        if(parts.length<2||parts[0].length!==8)return '';
        var y=Number(parts[0].slice(0,4));
        var m=Number(parts[0].slice(4,6))-1;
        var d=Number(parts[0].slice(6,8));
        var date=new Date(y,m,d);
        date.setDate(date.getDate()-1);
        var result=date.getFullYear()+('0'+(date.getMonth()+1)).slice(-2)+('0'+date.getDate()).slice(-2);
        return result+'/'+parts[1];
    },
    showTip:function(message){
        if(Cache&&Cache.alertTip)Cache.alertTip(message);
        else if(Cache&&Cache.showTipsMsg)Cache.showTipsMsg(message);
    },
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    block:function(name){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();},this);},
    text:function(name,value){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=value;},
    close:function(){this.node.destroy();}
});
