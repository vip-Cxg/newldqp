"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const CompListRenderer = require("./CompListRenderer");
const { ccclass, property } = cc._decorator;
let CompList = class CompList extends cc.Component {
    constructor() {
        super(...arguments);
        this.rendererPrefab = null;
        this._rendererWidth = 0;
        this._rendererHeight = 0;
        this.gapV = 10;
        this.gapH = 10;
        this.columnCount = 1;
        this.topPadding = 0;
        this.bottomPadding = 0;
        this.leftPadding = 0;
        this.rightPadding = 0;
        this.bufferSize = 3;
        this._itemPool = new cc.NodePool(CompListRenderer.default);
        this._virtualNodes = [];
        this._lastY = 0;
    }
    onLoad() {
        if (this.columnCount < 1)
            this.columnCount = 1;
    }
    start() {
        this.refreshUI();
    }
    update(dt) {
        let frames = cc.director.getTotalFrames();
        if (frames % 10 == 0) {
            if (Math.abs(this.node.y - this._lastY) > this._rendererHeight / 2) {
                this._lastY = this.node.y;
                this.refreshUI();
            }
        }
    }
    set data(value) {
        if (this._data == value)
            return;
        this._data = value;
        this.refreshVirtualNodes();
        this.refreshUI();
    }
    get data() {
        return this._data;
    }
    get firstActiveItemData() {
        return this._firstActiveItemData;
    }
    set firstActiveItemData(v) {
        if (!this._virtualNodes)
            return;
        for (let i = 0, len = this._virtualNodes.length; i < len; i++) {
            let vn = this._virtualNodes[i];
            if (vn.data == v) {
                this._firstActiveItemData = v;
                try {
                    let node = this.node.getParent().getParent();
                    let scrollView = node.getComponent(cc.ScrollView);
                    scrollView.scrollToOffset(new cc.Vec2(0, -vn.y - this._rendererHeight / 2 - this.gapV), 1);
                }
                catch (error) {
                }
                break;
            }
        }
    }
    refreshVirtualNodes() {
        if (this._rendererHeight == 0) {
            this.moreItems();
        }
        while (this.node.children.length > 0) {
            let ele = this.node.children[0];
            this._itemPool.put(ele);
            ele.removeFromParent(false);
        }
        this._virtualNodes = [];
        if (this._data) {
            let totalRaw = Math.ceil(this._data.length / this.columnCount);
            this.node.height = (this._rendererHeight + this.gapV) * totalRaw - this.gapV + this.topPadding + this.bottomPadding;
            for (let i = 0; i < this._data.length; i++) {
                let vn = new VirtualNode();
                vn.index = i;
                vn.data = this._data[i];
                vn.width = this._rendererWidth;
                vn.height = this._rendererHeight;
                let raw = Math.ceil((i + 1) / this.columnCount);
                let colomn = i % this.columnCount + 1;
                vn.y = -(raw - 1) * (this._rendererHeight + this.gapV) - this._rendererHeight / 2 - this.topPadding;
                vn.x = (colomn - 1) * (this._rendererWidth + this.gapH) + this._rendererWidth / 2 + this.leftPadding - this.node.width * this.node.anchorX;
                vn.activeChangeCallback = this.virtualNodeActiveChangeCallback.bind(this);
                this._virtualNodes.push(vn);
            }
        }
    }
    refreshUI() {
        if (this.node && this.node.getParent()) {
            let pn = this.node.getParent();
            this._viewRect = new cc.Rect(-pn.width * pn.anchorX - this._rendererWidth, -pn.height * pn.anchorY - this._rendererHeight * this.bufferSize, pn.width + this._rendererWidth * 2, pn.height + this._rendererHeight * 2 * this.bufferSize);
        }
        let activeIndex = 0;
        this._firstActiveItemData = null;
        this._virtualNodes.forEach((ele) => {
            let top = ele.y + this.node.y + this._rendererHeight / 2 + this.gapV;
            let bottom = ele.y + this.node.y - this._rendererHeight / 2 - this.gapV;
            if (bottom > this._viewRect.yMax || top < this._viewRect.yMin) {
                ele.unactive();
            }
            else {
                if (this._firstActiveItemData == null && activeIndex == 1) {
                    this._firstActiveItemData = ele.data;
                }
                ele.active();
                let renderer = ele.ui.getComponent(CompListRenderer.default);
                if (renderer) {
                    renderer.index = ele.index;
                    renderer.data = ele.data;
                }
                else {
                    console.log("渲染item请绑定Comp_ListRenderer组件（或子组件）");
                }
                activeIndex++;
            }
        });
    }
    virtualNodeActiveChangeCallback(vn) {
        // console.log("item显示、影藏", vn.index, vn.isActived);
        if (vn.isActived) {
            if (!vn.ui) {
                if (this._itemPool.size() <= 0)
                    this.moreItems();
                vn.ui = this._itemPool.get();
                this.node.addChild(vn.ui);
            }
            vn.ui.x = vn.x;
            vn.ui.y = vn.y;
        }
        else {
            if (vn.ui) {
                vn.ui.removeFromParent(false);
                console.log("【comp_list】回收 " + vn.ui.uuid);
                this._itemPool.put(vn.ui);
                vn.ui = null;
            }
        }
    }
    moreItems() {
        let colomnWidth = (this.node.width - this.gapH * (this.columnCount - 1) - this.leftPadding - this.rightPadding) / this.columnCount;
        if (colomnWidth < 1)
            colomnWidth = 1;
        // console.log("【comp_list】more 5 items");
        for (let i = 0; i < 5; ++i) {
            let item = cc.instantiate(this.rendererPrefab);
            this._itemPool.put(item);
            item.scale = colomnWidth / item.width;
            if (this._rendererWidth == 0) {
                this._rendererWidth = colomnWidth;
                this._rendererHeight = item.height * item.scale;
            }
        }
    }
    onDestroy() {
        if (this._itemPool) {
            this._itemPool.clear();
            this._itemPool = null;
        }
    }
};
__decorate([
    property({
        type: cc.Prefab,
        displayName: "Renderer Prefab",
    })
], CompList.prototype, "rendererPrefab", void 0);
__decorate([
    property({
        displayName: "垂直间距"
    })
], CompList.prototype, "gapV", void 0);
__decorate([
    property({
        displayName: "水平间距"
    })
], CompList.prototype, "gapH", void 0);
__decorate([
    property({
        displayName: "列数"
    })
], CompList.prototype, "columnCount", void 0);
__decorate([
    property({
        displayName: "顶部间隔"
    })
], CompList.prototype, "topPadding", void 0);
__decorate([
    property({
        displayName: "底部间隔"
    })
], CompList.prototype, "bottomPadding", void 0);
__decorate([
    property({
        displayName: "左边间隔"
    })
], CompList.prototype, "leftPadding", void 0);
__decorate([
    property({
        displayName: "右边间隔"
    })
], CompList.prototype, "rightPadding", void 0);
__decorate([
    property({
        displayName: "缓冲大小",
        tooltip: "不在可视区域中item个数"
    })
], CompList.prototype, "bufferSize", void 0);
CompList = __decorate([
    ccclass
], CompList);
exports.default = CompList;
class VirtualNode {
    constructor() {
        this.index = 0;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this._isActived = false;
    }
    get isActived() {
        return this._isActived;
    }
    active() {
        if (this._isActived === true)
            return;
        this._isActived = true;
        this.activeChangeCallback.call(null, this);
    }
    unactive() {
        if (this._isActived === false)
            return;
        this._isActived = false;
        if (this.activeChangeCallback)
            this.activeChangeCallback(this);
    }
}
