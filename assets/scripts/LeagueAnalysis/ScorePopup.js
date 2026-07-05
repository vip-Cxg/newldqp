cc.Class({
    extends: cc.Component,
    properties: {},
    init: function (data) {
        this.data=data||{}; this.mode=this.data.mode==='sub'?'sub':'add'; this.input='0';
        this.cacheNodes(); this.bindAll(); this.refresh();
    },
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){
        this.bind('BtnClose',this.close); this.bind('Mask',this.close);
        this.bind('BtnAddMode',function(){this.mode='add';this.refresh();});
        this.bind('BtnSubMode',function(){this.mode='sub';this.refresh();});
        for(var i=0;i<=9;i++)this.bind('Key'+i,this.append.bind(this,String(i)));
        this.bind('KeyDot',this.append.bind(this,'.'));
        this.bind('KeyReset',function(){this.input='0';this.refresh();});
        this.bind('BtnConfirm',this.submit);
    },
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    append:function(n){if(n==='.'&&this.input.indexOf('.')>=0)return;if(this.input==='0'&&n!=='.')this.input='';if(this.input.length>=8)return;this.input+=n;this.refresh();},
    submit:function(){
        var amount=parseFloat(this.input||'0');
        if(!amount){cc.log('[ScorePopup] empty amount');return;}
        cc.log('[ScorePopup] submit',this.mode,amount,this.data.user);
        if(this.data.onSubmit){
            var ret=this.data.onSubmit({mode:this.mode,amount:amount,user:this.data.user});
            if(ret&&ret.then){
                ret.then(function(){this.close();}.bind(this)).catch(function(err){
                    console.error('[ScorePopup] submit failed', err);
                });
                return;
            }
        }
        this.close();
    },
    refresh:function(){this.text('Title','加减积分');this.text('InputLabel',(this.mode==='sub'?'-':'+')+(this.input||'0'));this.text('MyScoreLabel','我的积分：'+((this.data.user&&this.data.user.score)||0));this.setModeButton('BtnAddMode',this.mode==='add');this.setModeButton('BtnSubMode',this.mode==='sub');},
    setModeButton:function(name,selected){var node=this.nodes[name];if(!node)return;var normal=node.getChildByName('Normal');var selectedNode=node.getChildByName('Selected');if(normal)normal.active=!selected;if(selectedNode)selectedNode.active=selected;},
    text:function(name,v){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=v;},
    close:function(){this.node.destroy();}
});
