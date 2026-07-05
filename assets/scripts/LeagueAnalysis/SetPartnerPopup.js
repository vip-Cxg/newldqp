cc.Class({
    extends: cc.Component,
    properties: {},
    init:function(data){this.data=data||{};this.cacheNodes();this.bindAll();this.refresh();},
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){
        this.bind('BtnClose',this.close);
        this.bind('Mask',this.close);
        this.bind('BtnConfirm',this.submit);
    },
    refresh:function(){
        this.text('RoomRateLabel', this.getRate('roomRate'));
        this.text('WaterRateLabel', this.getRate('waterRate'));
    },
    getRate:function(key){
        var user=this.data.user||{};
        var value=this.data[key];
        if(value==null)value=user[key];
        if(value==null)value=0;
        return String(value);
    },
    readNumber:function(name, fallback){
        var node=this.nodes[name];
        var label=node&&node.getComponent(cc.Label);
        var value=label?label.string:fallback;
        value=parseFloat(String(value).replace('%',''));
        return isNaN(value)?0:value;
    },
    submit:function(){
        var payload={
            roomRate:this.readNumber('RoomRateLabel', this.getRate('roomRate')),
            waterRate:this.readNumber('WaterRateLabel', this.getRate('waterRate'))
        };
        cc.log('[SetPartnerPopup] submit', payload, this.data);
        if(this.data.onSubmit){
            var ret=this.data.onSubmit(payload);
            if(ret&&ret.then){
                ret.then(function(){this.close();}.bind(this)).catch(function(err){
                    console.error('[SetPartnerPopup] submit failed', err);
                });
                return;
            }
        }
        this.close();
    },
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    text:function(name,v){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=v;},
    close:function(){this.node.destroy();}
});
