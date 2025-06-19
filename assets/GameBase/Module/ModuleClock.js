let TableInfo = require('../../Main/Script/TableInfo');

cc.Class({
    extends: cc.Component,

    properties: {
        timeLabel:cc.Label
    },

    /**倒计时 */
    clockScheduler(times){
        this.timeLabel.unscheduleAllCallbacks(); //
        let time = Math.max(TableInfo.options.clock - times, 0);
        this.timeLabel.string = time;
        this.timeLabel.schedule(() => {
            time--;
            this.timeLabel.string = Math.max(time, 0);

            if (time <= 5) {
                let ap = cc.rotateTo(0.1, 15)
                let bp = cc.rotateTo(0.1, -15)
                let cp = cc.rotateTo(0.1, 0)
                let dp = cc.scaleTo(0.1, 1.2)
                let ep = cc.scaleTo(0.1, 1)
                let fp = cc.sequence(dp, ep, dp, ep)
                let gp = cc.sequence(ap, bp, ap, bp, cp)
                this.node.runAction(cc.spawn(fp, gp))
            }
        }, 1, 19);
    }
    // update (dt) {},
});
