import HallTableItemBase from "./HallTableItemBase";

const { ccclass } = cc._decorator;

@ccclass
export default class ModuleTableItemZMZ extends HallTableItemBase {
    seatCount = 2;
    gameType = "ZMZ";
}
