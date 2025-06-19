import { GameConfig } from "../../../GameBase/GameConfig";
import { App } from "../../ui/hall/data/App";
import PopupBase from "./PopupBase";
import { PopupManager } from "./PopupManager";

export class PopQueue {
    static _instance = null;
    static getInstance() {
        if (!this._instance) {
            this._instance = new PopupBase();
        }
        return this._instance;
    }
    _queue = [];
    constructor() {
    }
    /**显示弹窗 
     * @param path resources下的路径
     * @param queue 是否进入队列 (进入队列不会立即弹出);
     */
    showPop(path,queue=false) {
        
        if(queue){
            //放入队列等候
            this._queue.push(path);
            return;
        }

        //立即弹出
        PopupManager.show(path)
    }


}
