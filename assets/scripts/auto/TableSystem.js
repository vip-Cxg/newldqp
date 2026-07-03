
cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        rowPrefab: cc.Prefab,
        emptyNode: cc.Node
    },

    setData(list) {
        this.content.removeAllChildren();

        if (!list || list.length === 0) {
            if (this.emptyNode) this.emptyNode.active = true;
            return;
        }

        if (this.emptyNode) this.emptyNode.active = false;

        for (var i = 0; i < list.length; i++) {
            var node = cc.instantiate(this.rowPrefab);
            var row = node.getComponent('AutoRow');

            if (row) {
                row.init(list[i], i);
            }

            this.content.addChild(node);
        }
    }
});
