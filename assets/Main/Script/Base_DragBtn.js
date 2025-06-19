// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const utils = require('./utils');

cc.Class({
    extends: cc.Component,

    properties: {
        touchTime: 0
    },
    onLoad(){
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        // this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    },
    onTouchStart(e) {
        this.touchPos = e.getLocation();
        this.touchTime = utils.getTimeStamp();

    },
    onTouchMove(e) {
       
        let nowTime= utils.getTimeStamp();
        if(nowTime-this.touchTime>400){

            let pos = e.getLocation();
            let a = cc.find("Canvas").convertToNodeSpaceAR(pos)
    
            this.node.x = parseInt(a.x)
            this.node.y = parseInt(a.y)
        }
    },
    onTouchEnd() {
        let nowTime= utils.getTimeStamp();
        if(nowTime-this.touchTime<=400){
            this.onClickBtn();
            
        }
    },

    onClickBtn(){
        // sudo mkdir -p /Users/marvin/Library/Java
        // sudo tar -xzf OpenJDK17U-jdk_x64_linux_hotspot_17.0.10_7.tar.gz -C /Users/marvin/Library/Java
    },

});
