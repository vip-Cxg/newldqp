
cc.Class({
    extends: cc.Component,

    properties: {
        idLabel: cc.Label,
        nameLabel: cc.Label,
        scoreLabel: cc.Label,
        btnAction: cc.Node
    },

    init(data, index) {
        this.data = data;
        this.index = index;

        if (this.idLabel) this.idLabel.string = data.id || "";
        if (this.nameLabel) this.nameLabel.string = data.name || "";
        if (this.scoreLabel) this.scoreLabel.string = data.score || "";
    },

    onLoad() {
        if (this.btnAction) {
            this.btnAction.on('click', this.onAction, this);
        }
    },

    onAction() {
        cc.log("点击行按钮", this.data);
    }
});
