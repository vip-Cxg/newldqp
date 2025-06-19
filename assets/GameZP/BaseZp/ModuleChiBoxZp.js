
const Connector = require("../../Main/NetWork/Connector");
const ROUTE = require("../../Main/Script/ROUTE");
const TableInfo = require("../../Main/Script/TableInfo");

cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        group: cc.Prefab,
    },
    init(data) {
        //         "type": "chi",
        //         "options": [{
        //             "xi": 0,
        //             "cards": [14, 12, 13]
        //         }, {
        //             "xi": 0,
        //             "cards": [14, 12, 13]
        //         }]
        data.options.forEach(element => {
            let groupItem = cc.instantiate(this.group);
            groupItem.parent = this.content;
            let info = {
                type: 'chi',
                cards: element.cards,
                idx: data.idx,
                xi: 0,
                card: null,
            };
            groupItem.getComponent('BaseGroupZP').init(info, { click: false, bg: true });
            this.node.width+=groupItem.width;
        });

        this.node.on(cc.Node.EventType.TOUCH_END,()=>{
            Connector.gameMessage(ROUTE.CS_ANSWER, { serialID: TableInfo.serialID, answer: data.idx, card: TableInfo.currentCard });
            this.node.parent.parent.active=false
        },this)
    }
});
