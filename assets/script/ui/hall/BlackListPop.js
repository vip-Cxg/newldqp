import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import { App } from "../../ui/hall/data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class BlackListPop extends cc.Component {

    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    listItem = null;
    @property(cc.EditBox)
    fileIDInput = null;

    onLoad() {
        this._requestSerial = 0;
        this.addEvents();
        this.downloadList();
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.UPDATE_REPORT_LIST, this.downloadList, this);

    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.UPDATE_REPORT_LIST, this.downloadList, this);
    }

    downloadList() {
        this.loadReports({ clubID: App.Club.CurrentClubID });
    }

    onSearch() {
        Cache.playSfx();
        if (this.fileIDInput.string == '')
            return;
        this.loadReports({ clubID: App.Club.CurrentClubID, fileID: this.fileIDInput.string });
    }

    loadReports(params) {
        let serial = ++this._requestSerial;
        this.requestReports(params, serial, 0);
    }

    requestReports(params, serial, attempt) {
        if (!this.node || !cc.isValid(this.node) || serial !== this._requestSerial)
            return;
        const timeouts = [30000, 60000, 90000];
        // Connector.request 会加入 ts/sign；每次重试必须使用新的对象重新签名。
        let requestData = Object.assign({}, params);
        Connector.request(GameConfig.ServerEventName.ReportLogs, requestData, (res) => {
            if (serial !== this._requestSerial || !this.node || !cc.isValid(this.node))
                return;
            let list = Array.isArray(res.data) ? res.data : [];
            this.renderReports(list, serial);
        }, true, (err) => {
            if (serial !== this._requestSerial || !this.node || !cc.isValid(this.node))
                return;
            let status = Number(err && err.statusCode) || 0;
            let retryable = status === 0 || status >= 500 || (err && err.type === "timeout");
            if (retryable && attempt < timeouts.length - 1) {
                console.warn("举报列表请求失败，准备重试", attempt + 1, err);
                this.scheduleOnce(() => this.requestReports(params, serial, attempt + 1), attempt + 1);
                return;
            }
            this.onRequestFailed(err);
        }, false, timeouts[attempt], true);
    }

    renderReports(list, serial) {
        if (serial !== this._requestSerial || !this.node || !cc.isValid(this.node))
            return;
        // 请求成功后再清空，失败或重试期间保留原列表。
        this.itemContent.removeAllChildren();
        this.renderReportBatch(list, 0, serial);
    }

    renderReportBatch(list, start, serial) {
        if (serial !== this._requestSerial || !this.node || !cc.isValid(this.node))
            return;
        let end = Math.min(start + 12, list.length);
        for (let i = start; i < end; i++) {
            try {
                let item = cc.instantiate(this.listItem);
                item.getComponent('BlackListItem').renderUI(list[i]);
                this.itemContent.addChild(item);
            } catch (err) {
                // 单条脏数据不能让整个举报列表无法打开。
                console.error("举报列表第 " + i + " 条数据渲染失败", list[i], err);
            }
        }
        if (end < list.length)
            this.scheduleOnce(() => this.renderReportBatch(list, end, serial), 0);
    }

    onRequestFailed(err) {
        let status = err && err.statusCode != null ? err.statusCode : "未知";
        let type = err && err.type ? "，类型：" + err.type : "";
        let message = err && err.message ? err.message : "请求失败";
        console.error("举报列表请求失败", err);
        Cache.alertTip(message + "（状态：" + status + type + "）");
    }

    onClickClose() {
        Cache.playSfx();
        this._requestSerial++;
        this.unscheduleAllCallbacks();
        this.removeEvents()
        this.node.destroy();
    }



}


