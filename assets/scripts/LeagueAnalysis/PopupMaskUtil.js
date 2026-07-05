function findNode(root, names) {
    if (!root) return null;
    names = names || ['Mask', 'BgMask', 'bgmask'];
    for (var i = 0; i < names.length; i++) {
        if (root.name === names[i]) return root;
    }
    for (var j = 0; j < root.children.length; j++) {
        var found = findNode(root.children[j], names);
        if (found) return found;
    }
    return null;
}

function drawGraphicsMask(mask) {
    var graphics = mask.getComponent(cc.Graphics) || mask.addComponent(cc.Graphics);
    graphics.clear();
    graphics.fillColor = cc.Color.BLACK;
    var w = mask.width || 1334;
    var h = mask.height || 750;
    var ax = mask.anchorX == null ? 0.5 : mask.anchorX;
    var ay = mask.anchorY == null ? 0.5 : mask.anchorY;
    graphics.rect(-w * ax, -h * ay, w, h);
    graphics.fill();
}

module.exports = {
    ensure: function (root) {
        var mask = findNode(root);
        if (!mask) return null;

        mask.active = true;
        mask.setPosition(0, 0);
        if (mask.width < 1000 || mask.height < 600) {
            mask.setContentSize(cc.size(1334, 750));
        }
        mask.color = cc.Color.BLACK;
        mask.opacity = mask.opacity > 0 ? mask.opacity : 160;
        mask.zIndex = -999;

        if (!mask.getComponent(cc.BlockInputEvents)) {
            mask.addComponent(cc.BlockInputEvents);
        }

        var sprite = mask.getComponent(cc.Sprite);
        if (!sprite || !sprite.spriteFrame) {
            drawGraphicsMask(mask);
        }

        return mask;
    }
};
