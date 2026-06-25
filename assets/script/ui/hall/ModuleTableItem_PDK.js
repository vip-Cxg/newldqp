import HallTableItemBase from "./HallTableItemBase";

const { ccclass } = cc._decorator;

@ccclass
export default class ModuleTableItemPDK extends HallTableItemBase {
    seatCount = 2;
    gameType = "PDK";
}
