/** 
 * 日期组件
 */

cc.Class({
    extends: cc.Component,

    properties: {
        lbYearMonth: cc.Label,
        ndDays: cc.Node,
        pfbDay: cc.Prefab,
    },

    onLoad () {
        this.initData();
        this.updateDate();
    },

    initData() {
        this.date = this.date ? this.date : new Date();
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth();
        this.day = this.date.getDate();

        this.pfgListDay = [];
        for (let i = 0; i < 31; ++i) {
            let node = cc.instantiate(this.pfbDay);
            node.parent = this.ndDays;
            this.pfgListDay.push(node);
        }
    },

    getMonthsDay(year, month) {
        var year = year;
        var month = month;
        if (arguments.length == 0) {
            var date = new Date();
            year = date.getFullYear();
            month = data.getMonth();
        }

        if (arguments.length == 1) {
            var date = new Date();
            month = data.getMonth();
        }
        
        var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if ((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)) {
            monthDays[1] = 29;
        }
        return monthDays[month];
    },

    // 获取这个月第一天星期几 
    getMonthFirst(year, month) {
        var year = year;
        var month = month;
        
        if (arguments.length == 0) {
            var date = new Date();
            year = date.getFullYear();
            month = data.getMonth();
        }

        if (arguments.length == 1) {
            var date = new Date();
            month = data.getMonth();
        }
        
        var newDate = new Date(year, month, 1);
        return newDate.getDay();
    },


    // 设置显示的日志，默认为当前日期
    setDate(year, month, day) {
        this.date = new Date(year, month, day);
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth();
        this.day = this.date.getDate();

        this.updateDate();
    },

    updateDate () {
        this.lbYearMonth.string = cc.js.formatStr("%s年%s月", this.year, this.month + 1);

        

        let totalDays = this.getMonthsDay(this.year, this.month);
        let fromWeek = this.getMonthFirst(this.year, this.month);
        //let date = new Date(this.year, this.month, 0);
        //let totalDays = date.getDate();
        //let fromWeek = date.getDay();

        for (let i = 0; i < this.pfgListDay.length; ++i) {
            let node = this.pfgListDay[i];
            if (i < totalDays) {
                node.active = true;
                let index = fromWeek + i;
                let row = Math.floor(index / 7);
                let col = index % 7;
                let x = -(this.ndDays.width - node.width) * 0.5 + col * node.width;
                let y = (this.ndDays.height - node.height) * 0.5 - row * node.height;
                node.setPosition(x, y);
                let script = node.getComponent("UIItemDay");
                script.setDay(i, i + 1, this.day === i + 1, (selIndex, selDay)=>{
                    this.day = selDay;
                    this.updateDate();
                });
            } else {
                node.active = false;
            }
        }
    },

    onClickLeft2 () {
        this.year -= 1;
        this.date.setFullYear(this.year);
        this.date.setMonth(this.month);
        this.updateDate();
    },

    onClickRight2 () {
        this.year += 1;
        this.date.setFullYear(this.year);
        this.date.setMonth(this.month);
        this.updateDate();
    },

    onClickLeft () {
        if (this.month > 0) {
            this.month -= 1;
        } else {
            this.month = 11;
            this.year -= 1;
        }
        this.date.setFullYear(this.year);
        this.date.setMonth(this.month);
        this.updateDate();
    },

    onClickRight () {
        if (this.month < 11) {
            this.month += 1;
        } else {
            this.month = 0;
            this.year += 1;
        }
        this.date.setFullYear(this.year);
        this.date.setMonth(this.month);
        this.updateDate();
    },

    // 设置选中日期之后的回调
    setPickDateCallback(cb) {
        this.cb = cb;
    },

    onClickClose () {
        if (this.cb) {
            this.cb(this.year, this.month, this.day);
        }
        this.node.parent = null;
    },
});
