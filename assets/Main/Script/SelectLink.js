import { GameConfig } from '../../GameBase/GameConfig';
import GameUtils from '../../script/common/GameUtils';
import Http from '../../script/common/network/Http';
import Connector from '../NetWork/Connector';
import utils, { saveValue } from '../Script/utils';
import Cache from './Cache';
export class SelectLink {
    // static _instance = null;

    // static getInstance(apiCallback,hotCallback) {
    //     if (!this._instance)
    //         this._instance = new SelectLink(apiCallback,hotCallback);
    //     return this._instance;
    // }

    _apiUrl = null;
    _apiSelected = false;
    _hotSelected = false;
    _apiCallback = null;
    _hotCallback = null;
    _startTime = 0;
    _selectRound = 0;
    constructor(apiCallback = null, hotCallback = null) {
        this._apiUrl = null;
        this._apiSelected = false;
        this._hotSelected = false;
        this._apiCallback = apiCallback;
        this._hotCallback = hotCallback;
        this._startTime = 0;
        this.loadLocalConfig();
    }

    /**加载本地配置 */
    loadLocalConfig() {
        // if (cc.sys.isBrowser) {
        //     //链接本地
        //     // this.changeLocalUrl('http://192.168.31.96:8000/');
        //     this.changeLocalUrl('http://123.206.217.199/');
        //     // this.changeLocalUrl('http://159.75.97.241/');
        //     return;
        // }

        // console.log("开始选择最佳线路")
        // let urlArr = utils.getValue(GameConfig.StorageKey.ServerUrlObj, {});
        // if (!utils.isNullOrEmpty(urlArr) && !GameConfig.IsDebug) {
        //     this.selectQuickestUrl(urlArr);
        //     return;
        // }

        // // let url = "https://pku.qzhagy.com/config/release_first.json";
        // // let url = "https://pku.qzhagy.com/config/release_first.json";
        // let url = "https://pku.qzhagy.com/config/release_first.json";

        // // pkoknn.oss-cn-shenzhen.aliyuncs.com
        // utils.XMLRequestOSS(url, this.selectQuickestUrl.bind(this));
        // // let url = "Main/release";
        // // cc.loader.loadRes(url, (err, res) => {
        // //     console.log("本地链接", res.json)
        // //     this.selectQuickestUrl(res.json);
        // // })

        let hideTime = 0;
        cc.game.on(cc.game.EVENT_HIDE, () => {
            hideTime = new Date().getTime();
            // Cache.alertTip("游戏暂停");
          
            cc.game.pause();
        });
        cc.game.on(cc.game.EVENT_SHOW, () => {
            cc.game.resume();

            let nowTime = new Date().getTime();
            // Cache.alertTip("游戏继续" + (nowTime - hideTime) / 1000 + '  ' + nowTime + '  ' + hideTime)
            
            if (nowTime - hideTime > 20000 && hideTime != 0&&cc.director.getScene().name.indexOf('Game')!=-1) {
                // Cache.alertTip("游戏重新载入")
                cc.game.restart();

            } else {
                hideTime = 0;
            }
        });

        this.changeLocalUrl('http://106.54.59.46/');
    }

    selectLinkJSON(index) {
        if (this._apiSelected) return;
        const sources = [...new Set([
            GameConfig.DefaultUrl,
            'https://qty.krtqyh.com/hlconfig/release_first.json'
        ].filter(url => typeof url === 'string' && /^https?:\/\/[^/\s]+/i.test(url)))];
        const source = sources[index];
        if (!source) return this.showLinkFailure();
        const next = () => this.selectLinkJSON(index + 1);
        utils.testConnect(source, (err, data) => {
            if (this._apiSelected) return;
            if (err) next();
            else this.selectQuickestUrl(data, next, source);
        });
    }

    serverFailed = null;
    /**选择最快链路 */
    selectQuickestUrl(data, onFail, source) {
        if (this._apiSelected) return;
        clearTimeout(this.serverFailed);
        this._startTime = GameUtils.getTimeStamp();
        const round = ++this._selectRound;
        const fail = () => {
            if (round !== this._selectRound || this._apiSelected) return;
            clearTimeout(this.serverFailed);
            ++this._selectRound; // Ignore late responses after starting the fallback.
            if (typeof onFail === 'function') onFail();
            else this.showLinkFailure();
        };
        const servers = data && Array.isArray(data.servers) ? data.servers : [];
        const urls = [...new Set(servers.reduce((result, value) => {
            if (typeof value === 'string' && /^https?:\/\/[^/\s]+/i.test(value.trim())) {
                result.push(value.trim().replace(/\/+$/, '') + '/');
            }
            return result;
        }, []))];
        let pending = urls.length;
        if (!pending) return fail();
        this.serverFailed = setTimeout(fail, 6500);
        urls.forEach(url => {
            utils.testConnect(url + 'CONFIG', err => {
                if (round !== this._selectRound || this._apiSelected) return;
                if (!err) {
                    if (source) utils.saveValue(GameConfig.StorageKey.LinkJson, source);
                    this.changeLocalUrl(url, data);
                } else if (--pending === 0) {
                    fail();
                }
            });
        });
    }
    showLinkFailure() {
        GameUtils.LogsClient(GameConfig.LogsEvents.SELECT_LINK, { action: GameConfig.LogsActions.SELECT_LINK_FAIL });
        Cache.showTipsMsg('所有登录线路均无法连接，请检查网络后重试', () => cc.game.restart());
    }
    // 局数  输赢 今天昨天
    changeLocalUrl(url, serverData) {
        if (this._apiSelected) return;
        this._apiSelected = true;
        clearTimeout(this.serverFailed);
        url = url.replace(/\/+$/, '') + '/';
        this._apiUrl = url;
        Connector.logicUrl = url;//wx00e14f422f1929e90000wxcb45c285efd3f864
        Http.API_URL = url;
        // Connector.logicUrl ='http://206.119.85.11:9000/'// url;//wx00e14f422f1929e90000wxcb45c285efd3f864
        // Http.API_URL = 'http://206.119.85.11:9000/'//url;

        let durTime = ((GameUtils.getTimeStamp() - this._startTime) / 1000).toFixed(2);
        GameUtils.LogsClient(GameConfig.LogsEvents.SELECT_LINK, { action: GameConfig.LogsActions.SELECT_LINK_TIME, url: url, times: durTime })

        //将新配置保存至本地
        utils.saveValue(GameConfig.StorageKey.ServerUrlObj, serverData);
        utils.saveValue(GameConfig.StorageKey.CurrentServerUrl || "CurrentServerUrl", url);
        if (this._apiCallback)
            this._apiCallback();






    }


    get ApiUrl() {
        return this._apiUrl;
    }


    // --------------热更新地址--------------------------------

    selectHot() {
        this._hotSelected = false;
        let serverData = utils.getValue(GameConfig.StorageKey.ServerUrlObj, {});
        if (utils.isNullOrEmpty(serverData) || utils.isNullOrEmpty(serverData.update)) {
            if (this._hotCallback)
                this._hotCallback("");
            return;
        }
        if (typeof serverData.update == 'string') {
            //TODO 只有一个字符串
            if (this._hotCallback)
                this._hotCallback(serverData.update);
            return;
        }

        if (this.hotSelectFail)
            clearTimeout(this.hotSelectFail)
        this.hotSelectFail = setTimeout(() => {
            //TODO 所有热更新域名都无法访问 
            if (this._hotCallback)
                this._hotCallback("");
        }, 12 * 1000);
        serverData.update.forEach(url => {
            cc.log(url)
            Connector.get(url + 'version.manifest', 'getJson', (resData) => {
                this.changeHotUrl(url);
            }, null, (err) => {
                console.log(url + "---err--", err)

            });
        })
    }

    changeHotUrl(url) {
        if (this._hotSelected) return;
        this._hotSelected = true;
        clearTimeout(this.hotSelectFail)
        console.log("新的热更新地址-----", url)
        if (this._hotCallback)
            this._hotCallback(url);
    }

}

