import { GameConfig } from "../../../GameBase/GameConfig";
import TableInfo from "../../../Main/Script/TableInfo";
import GameUtils from "../../common/GameUtils";
import Avatar from "../common/Avatar";

const { ccclass, property } = cc._decorator
@ccclass
export default class MJGameSummaryItem extends cc.Component {
    @property(Avatar)
    avatarNode = null;
    @property(cc.Label)
    lblName = null;
    @property(cc.Label)
    lblDraw = null;
    @property(cc.Label)
    lblKong = null;
    @property(cc.Label)
    lblBu = null;
    @property(cc.Label)
    lblZhi = null;
    @property(cc.Label)
    lblRecv = null;
    @property(cc.Label)
    lblSend = null;
    @property(cc.Label)
    lblWinScore = null;
    @property(cc.Label)
    lblLoseScore = null;

    start() {

    };

    renderUI(data, idx) {
        this.lblName.string = GameUtils.getStringByLength(TableInfo.players[idx].prop.name, 5);
        this.avatarNode.avatarUrl = TableInfo.players[idx].prop.head;
        TableInfo.players[idx].total = data.total;
        this.lblDraw.string = '' + data.draw;
        this.lblKong.string = '' + data.kong;
        this.lblBu.string = '' + data.bu;
        this.lblZhi.string = '' + data.zhi;
        this.lblRecv.string = '' + data.recv;
        this.lblSend.string = '' + data.send;
        if (data.score >= 0) {
            this.lblWinScore.node.active = true;
            this.lblWinScore.string = '' + data.score;
        } else {
            this.lblLoseScore.node.active = true;
            this.lblLoseScore.string = '' + data.score;
        }


    }

}


