import { PopQueue } from "../../../base/pop/PopQueue";
import { ClubManager } from "../ClubManager";
import { EventManager } from "./EventManager";
import { Proxy } from "./Proxy";
import { PushManager } from "./PushManager";

class Application {
    static Instance = new Application();
    constructor() { }
    /** 代理 */
    get Proxy() {
        return Proxy.getInstance();
    }
    /** 公会 */
    get Club() {
        return ClubManager.getInstance();
    }
    /** 弹窗队列 */
    get PopQueue() {
        return PopQueue.getInstance();
    }
    /** 推送 */
    get PushManager() {
        return PushManager.getInstance();
    }
    /** 事件管理 */
    get EventManager() {
        return EventManager.getInstance();
    }

    /**锁屏 */
    lockScene() {
        let scene = cc.director.getScene();
        if (App._lockSceneNode && App._lockSceneNode.getParent()) {
            if (App._lockSceneNode.getParent() == scene)
                return;
            App._lockSceneNode.destroy();
            App._lockSceneNode = null;
        }
        let winSize = cc.winSize;
        let node = new cc.Node();
        node.width = winSize.width;
        node.height = winSize.height;
        node.x = winSize.width / 2;
        node.y = winSize.height / 2;
        node.addComponent(cc.BlockInputEvents);
        App._lockSceneNode = node;
        scene.addChild(App._lockSceneNode);
    }
    /**解锁 */
    unlockScene() {
        if (App._lockSceneNode && App._lockSceneNode.getParent()) {
            App._lockSceneNode.destroy();
            App._lockSceneNode = null;
        }
    }
}
export const App = Application.Instance;