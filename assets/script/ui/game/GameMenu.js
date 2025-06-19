
const { ccclass, property } = cc._decorator
@ccclass
export default class GameMenu extends cc.Component {



    @property(cc.Node)
    btnClose = null;
    @property(cc.Node)
    btnOpen = null;

    isMoving = false;

    updateCount = -1;

    onLoad() {
        // this.onHideMenu();
        this.node.position = cc.v2(cc.winSize.width / 2 + this.node.width / 2, cc.winSize.height / 2 - this.node.height / 2);
        this.btnClose.active = false;
        this.btnOpen.active = true;
    }

    onHideMenu() {
        if (this.isMoving)
            return;
        this.isMoving = true;
        let startPos = cc.v2(cc.winSize.width / 2 - this.node.width / 2, cc.winSize.height / 2 - this.node.height / 2);
        let endPos = cc.v2(cc.winSize.width / 2 + this.node.width / 2, cc.winSize.height / 2 - this.node.height / 2);

        let ap = cc.moveTo(0.3, endPos);
        let bp = cc.place(startPos);
        let cp = cc.sequence(bp, ap, cc.callFunc(() => {
            this.isMoving = false;
            this.btnClose.active = false;
            this.btnOpen.active = true;
            this.updateCount = -1;
        }));
        this.node.runAction(cp)
    }

    onshowMenu() {
        if (this.isMoving)
            return;
        this.isMoving = true;
        let endPos = cc.v2(cc.winSize.width / 2 - this.node.width / 2, cc.winSize.height / 2 - this.node.height / 2);
        let startPos = cc.v2(cc.winSize.width / 2 + this.node.width / 2, cc.winSize.height / 2 - this.node.height / 2);

        let ap = cc.moveTo(0.3, endPos);
        let bp = cc.place(startPos);
        let cp = cc.sequence(bp, ap, cc.callFunc(() => {
            this.isMoving = false;
            this.btnClose.active = true;
            this.btnOpen.active = false;
            this.updateCount = 0;
        }));

        this.node.runAction(cp)
    }

    update(dt) {
        if (this.updateCount < 0)
            return;
        this.updateCount++;
        if (this.updateCount % 300 == 0) {
            this.updateCount = 0;
            this.onHideMenu()
        }
    }

}


