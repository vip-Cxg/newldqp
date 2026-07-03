
cc.Class({
    extends: cc.Component,

    properties: {
        mask: cc.Node,
        panel: cc.Node,
        titleLabel: cc.Label,
        inputBox: cc.EditBox,
        btnConfirm: cc.Node,
        btnClose: cc.Node
    },

    onLoad() {
        if (this.btnConfirm) {
            this.btnConfirm.on('click', this.onConfirm, this);
        }

        if (this.btnClose) {
            this.btnClose.on('click', this.close, this);
        }

        if (this.mask) {
            this.mask.on('click', this.close, this);
        }
    },

    init(data) {
        this.data = data || {};
        if (this.titleLabel) {
            this.titleLabel.string = this.data.title || "提示";
        }
    },

    onConfirm() {
        var value = this.inputBox ? this.inputBox.string : "";
        cc.log("弹窗确认:", value, this.data);
        this.close();
    },

    close() {
        this.node.destroy();
    }
});
