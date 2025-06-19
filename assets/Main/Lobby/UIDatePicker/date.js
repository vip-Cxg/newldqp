cc.Class({
    extends: cc.Component,

    properties: {
        pfbDatePicker: cc.Prefab,
        defaultTime:0
    },

    onLoad () {
        let date = new Date();
        this.year = date.getFullYear();
        this.month = date.getMonth();
        this.day = date.getDate()-this.defaultTime;

        this.updateDate();

        this.node.on("touchend",()=>{
            this.onClickDate();    
        })
    },

    onClickDate() {
        let node = cc.instantiate(this.pfbDatePicker);
        node.parent = cc.find("Canvas");
        let datePicker = node.getComponent("UIDatePicker");
        datePicker.setDate(this.year, this.month, this.day);
        datePicker.setPickDateCallback((year, month, day)=>{
            this.year = year;
            this.month = month;
            this.day = day;
            this.updateDate();
        });
    },

    updateDate () {
        this.node.getComponent(cc.Label).string = cc.js.formatStr("%s-%s-%s", this.year, (this.month + 1)>9?(this.month + 1):"0"+(this.month + 1), this.day>9?this.day:"0"+this.day);
        // cc.log(this.year, this.month + 1, this.day)
    }
});
