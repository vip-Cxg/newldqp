
cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad: function () {
        this.cacheNodes();
    },

    cacheNodes: function () {
        this.nodes = {};
        this.collectNodes(this.node);
    },

    collectNodes: function (node) {
        if (!node) return;
        this.nodes[node.name] = node;
        for (var i = 0; i < node.children.length; i++) {
            this.collectNodes(node.children[i]);
        }
    },

    setData: function (player, index, ownerID) {
        if (!this.nodes) this.cacheNodes();
        player = player || {};
        var prop = player.prop || player.user || player;
        var name = prop.name || prop.nickname || prop.nickName || player.name || player.nickname || player.nickName || "";
        var head = prop.head || prop.avatar || prop.avatarUrl || player.head || player.avatar || player.avatarUrl || "";
        var userID = prop.id || prop.userID || prop.pid || player.id || player.userID || player.pid || "";

        this.setText("Name", name || ("玩家" + (index + 1)));
        this.setAvatar(head);
        // if (this.nodes.Star) {
        //     this.nodes.Star.active = !!ownerID && String(userID) === String(ownerID);
        // }
    },

    setText: function (name, value) {
        var node = this.nodes && this.nodes[name];
        var label = node && node.getComponent(cc.Label);
        if (label) label.string = String(value || "");
    },

    setAvatar: function (head) {
        var node = this.nodes && this.nodes.Avatar;
        if (!node) return;
        var avatar = node.getComponent("Avatar");
        if (avatar) {
            avatar.avatarUrl = head || "";
            return;
        }
        var sprite = node.getComponent(cc.Sprite);
        if (!sprite || !head) return;
        var GameConfig = require("../../../GameBase/GameConfig").GameConfig;
        var url = String(head).indexOf("://") === -1 ? (GameConfig.HeadUrl || "") + head : head;
        cc.loader.load(url, function (err, tex) {
            if (err || !cc.isValid(sprite && sprite.node, true)) return;
            sprite.spriteFrame = new cc.SpriteFrame(tex);
        });
    }

});
