import HallTableItemBase from "./HallTableItemBase";

const { ccclass } = cc._decorator;

@ccclass
export default class ModuleTableItemHSMJ extends HallTableItemBase {
    seatCount = 2;
    gameType = "HSMJ";
}
