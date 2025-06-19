import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import DataBase from "../../../Main/Script/DataBase";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";
import Avatar from "../common/Avatar";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubHistoryListItem extends cc.Component {

    // @property(Avatar)
    // avatar = null;
    // @property(cc.Label)
    // lblLevel = null;
    // @property(cc.Label)
    // lblName = null;
    // @property(cc.Label)
    // lblId = null;

    @property([cc.Node])
    players = [];
    @property(cc.Label)
    lblGameName = null;
    @property(cc.Label)
    lblDesc = null;
    @property(cc.Label)
    lblRule = null;
    @property(cc.Sprite)
    iconSpr = null;
    @property([cc.SpriteFrame])
    iconSprArr = [];
    @property(cc.Font)
    winFont = null;
    @property(cc.Font)
    loseFont = null;

    historyData = null;

    initData(data, i) {

        // console.log("战绩-" + i + "-", data)

        //    data= {
        //         "id": 10000001,
        //             "players": "98961940,25392518",
        //                 "parents": ",",
        //                     "tableID": 811795,
        //                         "gameType": "HNMJ",
        //                             "fileID": "HNMJ_811795_HNGB7AD2",
        //                                 "data": {
        //             "details": [
        //                 [
        //                     1200,
        //                     -1200
        //                 ],
        //                 [
        //                     130,
        //                     -130
        //                 ]
        //             ],
        //                 "players": [
        //                     {
        //                         "prop": {
        //                             "id": 98961940,
        //                             "sex": "male",
        //                             "head": null,
        //                             "name": "游客98961940",
        //                             "parent": 98961940,
        //                             "cluster": [
        //                                 98961940
        //                             ]
        //                         },
        //                         "score": 1330
        //                     },
        //                     {
        //                         "prop": {
        //                             "id": 25392518,
        //                             "sex": "male",
        //                             "head": null,
        //                             "name": "游客25392518",
        //                             "parent": 98961940,
        //                             "cluster": [
        //                                 98961940
        //                             ]
        //                         },
        //                         "score": -1330
        //                     }
        //                 ]
        //         },
        //         "strDate": "20211206",
        //             "createdAt": "2021-12-06T15:55:14.000Z",
        //                 "updatedAt": "2021-12-06T15:55:14.000Z"
        //     }
        this.historyData = data;


        data.data.players.forEach((e, i) => {
            if (GameUtils.isNullOrEmpty(e)) return;
            this.players[i].active = true;
            let playerNode = this.players[i];
            playerNode.getChildByName('avatar').getComponent(Avatar).avatarUrl = e.prop.head;
            playerNode.getChildByName('name').getComponent(cc.Label).string = GameUtils.getStringByLength(e.prop.name, 7);
            playerNode.getChildByName('id').getComponent(cc.Label).string = '' + e.prop.id;
            if (e.total >= 0) {
                playerNode.getChildByName('score').getComponent(cc.Label).font = this.winFont;
            } else {
                playerNode.getChildByName('score').getComponent(cc.Label).font = this.loseFont;
            }
            playerNode.getChildByName('score').getComponent(cc.Label).string = GameUtils.formatGold(e.total);

            if (e.total > 0 && e.prop.id == DataBase.player.id) {
                this.iconSpr.node.active = true;
                this.iconSpr.spriteFrame = this.iconSprArr[0];
            } else if (e.total < 0 && e.prop.id == DataBase.player.id) {
                this.iconSpr.node.active = true;
                this.iconSpr.spriteFrame = this.iconSprArr[1];
            } else if (e.total == 0 && e.prop.id == DataBase.player.id) {
                this.iconSpr.node.active = false;
            }

        });
        // {
        //     "fee": 100,
        //     "base": 1000,
        //     "bird": 500,
        //     "mode": "CUSTOM",
        //     "name": "pdk8",
        //     "lower": 20000,
        //     "rules": null,
        //     "clubID": 126553,
        //     "gameID": "Y4KHYK23",
        //     "person": 2,
        //     "roomID": 31,
        //     "shuffle": 100,
        //     "tableID": "769321",
        //     "gameType": "PDK",
        //     "isLeague": 1,
        //     "maxRound": 8,
        //     "password": "",
        //     "clubOwnerID": 549815
        // }

        this.lblGameName.string =data.rule?data.rule.name :GameConfig.GameName[data.gameType];
        this.lblRule.string=data.rule?'底分:'+ GameUtils.formatGold(data.rule.base)+' 打鸟: '+GameUtils.formatGold(data.rule.bird):'';
        this.lblDesc.string = '房号: ' + data.tableID + ' ' + new Date(data.createdAt).format("yyyy-MM-dd hh:mm:ss");
    }

    onClickDetail() {
        Cache.playSfx();
        GameUtils.pop(GameConfig.pop.ClubHistoryDetailPop, (node) => {
            node.getComponent('ClubHistoryDetailPop').initData(this.historyData);
        })
    }


}


