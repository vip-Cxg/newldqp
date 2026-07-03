const Cache = require("../../../../Main/Script/Cache");

cc.Class({
    extends: cc.Component,

    properties: {},

    init(owner, user, defaultMode) {
        this.owner = owner;
        this.user = user || {};
        this.mode = defaultMode === "reduce" ? "reduce" : "add";
        this.input = "0";
        this.cacheNodes();
        this.bindHotAreas();
        this.refresh();
    },

    cacheNodes() {
        this.content = this.getNode("Content");
        this.titleLabel = this.getNode("TitleLabel");
        this.inputLabel = this.getNode("Content/ScoreInputLabel");
        this.addButton = this.findNodeDeep(this.node, "AddModeButton");
        this.reduceButton = this.findNodeDeep(this.node, "ReduceModeButton");
        this.confirmButton = this.findNodeDeep(this.node, "ConfirmButton");
        this.addFrame = this.addButton && this.addButton.getComponent(cc.Sprite) && this.addButton.getComponent(cc.Sprite).spriteFrame;
        this.reduceFrame = this.reduceButton && this.reduceButton.getComponent(cc.Sprite) && this.reduceButton.getComponent(cc.Sprite).spriteFrame;
        if (this.inputLabel) this.inputLabel.setContentSize(cc.size(520, 58));
    },

    bindHotAreas() {
        if (!this.content) return;
        let layer = this.content.getChildByName("ScoreTouchLayer");
        if (layer) layer.destroy();
        layer = new cc.Node("ScoreTouchLayer");
        layer.setContentSize(this.content.getContentSize());
        layer.setPosition(0, 0);
        this.content.addChild(layer, 999);

        this.addHotArea(layer, this.addButton, () => {
            this.mode = "add";
            this.refresh();
        });
        this.addHotArea(layer, this.reduceButton, () => {
            this.mode = "reduce";
            this.refresh();
        });
        for (let i = 0; i <= 9; i++) {
            this.addHotArea(layer, this.findNodeDeep(this.node, "Key_" + i), () => {
                this.appendInput(String(i));
            });
        }
        this.addHotArea(layer, this.findNodeDeep(this.node, "Key_."), () => {
            this.appendInput(".");
        });
        this.addHotArea(layer, this.findNodeDeep(this.node, "Key_重输"), () => {
            this.input = "0";
            this.refresh();
        });
        this.addHotArea(layer, this.confirmButton, () => {
            this.confirm();
        });
    },

    addHotArea(layer, target, handler) {
        if (!layer || !target) return;
        let hot = new cc.Node("Hot_" + target.name);
        hot.setContentSize(target.getContentSize());
        hot.setPosition(layer.convertToNodeSpaceAR(target.convertToWorldSpaceAR(cc.v2(0, 0))));
        layer.addChild(hot);
        let button = hot.addComponent(cc.Button);
        button.transition = cc.Button.Transition.NONE;
        hot.on(cc.Node.EventType.TOUCH_START, (event) => {
            if (event && event.stopPropagation) event.stopPropagation();
            Cache.playSfx();
            if (typeof handler === "function") handler();
        }, this);
    },

    appendInput(text) {
        if (text === ".") {
            if (this.input.indexOf(".") >= 0) return;
            this.input += this.input ? "." : "0.";
        } else {
            if (this.input === "0") this.input = "";
            if (this.input.length >= 8) return;
            this.input += text;
        }
        this.refresh();
    },

    confirm() {
        let amount = Number(this.input);
        if (!Number.isFinite(amount) || amount <= 0) {
            Cache.alertTip("请输入正确的积分");
            return;
        }
        if (this.owner && this.owner.requestChangePartnerScore) {
            this.owner.requestChangePartnerScore(this.user, this.mode, amount);
        }
    },

    refresh() {
        this.setLabel(this.titleLabel, this.mode === "reduce" ? "下分" : "上分");
        this.setLabel(this.inputLabel, (this.mode === "reduce" ? "-" : "+") + (this.input || "0"));
        this.setLabel(this.getNode("Content/MyScoreLabel"), "当前积分：" + (this.user.score || 0));

        let addSprite = this.addButton && this.addButton.getComponent(cc.Sprite);
        let reduceSprite = this.reduceButton && this.reduceButton.getComponent(cc.Sprite);
        if (addSprite && this.addFrame && this.reduceFrame) {
            addSprite.spriteFrame = this.mode === "add" ? this.addFrame : this.reduceFrame;
        }
        if (reduceSprite && this.addFrame && this.reduceFrame) {
            reduceSprite.spriteFrame = this.mode === "reduce" ? this.addFrame : this.reduceFrame;
        }
    },

    setLabel(node, text) {
        let label = node && node.getComponent(cc.Label);
        if (label) label.string = text;
    },

    getNode(path) {
        if (!path) return null;
        let node = this.node;
        let parts = path.split("/");
        for (let i = 0; i < parts.length; i++) {
            node = node && node.getChildByName(parts[i]);
        }
        return node || null;
    },

    findNodeDeep(root, name) {
        if (!root) return null;
        if (root.name === name) return root;
        for (let i = 0; i < root.children.length; i++) {
            let found = this.findNodeDeep(root.children[i], name);
            if (found) return found;
        }
        return null;
    }
});
