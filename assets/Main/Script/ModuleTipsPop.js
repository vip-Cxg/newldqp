// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        lblWord: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    showTips(str){
        this.lblWord.string=str;

        this.node.position=cc.v2(cc.winSize.width/2+this.node.width/2,cc.winSize.height/2-(this.lblWord.node.height+30)/2);

        this.enterAnim();
        this.lblWord.scheduleOnce(()=>{
            this.leaveAnim();
        },5)
    },
    
    enterAnim(){

        let ap=cc.moveTo(0.3,cc.v2(cc.winSize.width/2-this.node.width/2,cc.winSize.height/2-(this.lblWord.node.height+30)/2));
        let bp=cc.sequence(cc.delayTime(0.5),ap)
        this.node.runAction(bp);
    },
    
    leaveAnim(){
        let ap=cc.moveTo(0.3,cc.v2(cc.winSize.width/2-this.node.width/2,cc.winSize.height/2+(this.lblWord.node.height+30)/2));
        let bp=cc.sequence(ap,cc.callFunc(()=>{
            if (this.node) {
                this.node.removeFromParent();
                this.node.destroy();
            }
        }))
        this.node.runAction(bp);
    }
    // update (dt) {},
});
