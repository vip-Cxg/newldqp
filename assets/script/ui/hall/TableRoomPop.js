import Cache from "../../../Main/Script/Cache";

const { ccclass, property } = cc._decorator
@ccclass
export default class TableRoomPop extends cc.Component {



    @property(cc.Node)
    itemContent = null;

    @property(cc.Prefab)
    itemPre = null;

    /**更新UI */
    refreshUI(data) {

        //TODO
        this.itemContent.removeAllChildren();
        data.msg.forEach(element => {
            if(element.name=='大厅') return 
            let item=cc.instantiate(this.itemPre);
            item.getComponent('TableRoomBtn').initData(element);
            this.itemContent.addChild(item);
        });
    }

    /**关闭弹窗 */
    onClickClose() {
        Cache.playSfx();
        this.node.removeFromParent();
        this.node.destroy();
    }


}


