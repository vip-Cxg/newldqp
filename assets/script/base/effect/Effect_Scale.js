
const { ccclass, property } = cc._decorator
@ccclass
export default class Effect_Scale extends cc.Component {
    
    onLoad(){
        this.node.stopAllActions();
        let ap=cc.scaleTo(0.3,0.9);
        let bp=cc.scaleTo(0.5,1).easing(cc.easeBackInOut());
        let cp=cc.sequence(ap,bp,cc.delayTime(4));
        let dp=cc.repeatForever(cp);
        this.node.runAction(dp);

    }

}


