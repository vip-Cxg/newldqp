var BROWN = cc.color(99, 57, 34);
var HEADER_WHITE = cc.color(255, 255, 255);

function shrinkOverflow() {
    return cc.Label && cc.Label.Overflow && cc.Label.Overflow.SHRINK != null
        ? cc.Label.Overflow.SHRINK
        : cc.Label.Overflow.CLAMP;
}

function applyLabel(label, options) {
    if (!label) return;
    options = options || {};
    label.enableWrapText = !!options.wrap;
    label.overflow = options.overflow != null ? options.overflow : shrinkOverflow();
    if (options.lineHeight) label.lineHeight = options.lineHeight;
    else if (label.fontSize) label.lineHeight = Math.max(label.lineHeight || 0, label.fontSize + 6);
    if (options.color && label.node) label.node.color = options.color;
}

function applyRow(label, options) {
    options = options || {};
    if (!options.color) options.color = BROWN;
    applyLabel(label, options);
}

function applyHeader(label, options) {
    options = options || {};
    if (!options.color) options.color = HEADER_WHITE;
    applyLabel(label, options);
}

function applyTree(root) {
    if (!root) return;
    var label = root.getComponent(cc.Label);
    if (label) {
        var header = isInHeader(root);
        if (header) applyHeader(label);
        else applyRow(label);
    }
    for (var i = 0; i < root.children.length; i++) applyTree(root.children[i]);
}

function isInHeader(node) {
    var current = node;
    while (current) {
        if (current.name === 'TableHeader' || current.name.indexOf('Header') === 0) return true;
        current = current.parent;
    }
    return false;
}

module.exports = {
    BROWN: BROWN,
    HEADER_WHITE: HEADER_WHITE,
    applyLabel: applyLabel,
    applyRow: applyRow,
    applyHeader: applyHeader,
    applyTree: applyTree,
    shrinkOverflow: shrinkOverflow
};
