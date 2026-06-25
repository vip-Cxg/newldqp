import HallTableItemBase from "./HallTableItemBase";

const { ccclass } = cc._decorator;

@ccclass
export default class ModuleTableItemDN extends HallTableItemBase {
    seatCount = 8;
    gameType = "DNIU";
}
