import HallTableItemBase from "./HallTableItemBase";

const { ccclass } = cc._decorator;

@ccclass
export default class ModuleTableItemJH extends HallTableItemBase {
    seatCount = 6;
    gameType = "JH";
}
