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
        //     this.changeLocalUrl('http://192.168.31.96:8000/');
        //     // this.changeLocalUrl('http://43.139.144.179/');
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

        // 先尝试使用本地上次保存的线路配置；若探测失败，再拉取新的 release_first.json
        let serverData = utils.getValue(GameConfig.StorageKey.ServerUrlObj, {});
        console.log("serverData", serverData)
        if (!utils.isNullOrEmpty(serverData) && serverData.servers && serverData.servers.length > 0) {
        console.log("serverData1", serverData)

            this.selectQuickestUrl(serverData, () => {
                this.selectLinkJSON(0);
            });
        } else {
        console.log("serverData2", serverData)

            this.selectLinkJSON(0);
        }


    }
    selectCount = 0;
    selectLinkJSON(index) {
        if (this.selectCount > 2) {
            Cache.alertTip("无法连接服务器,请联系管理员")
            return;
        }
        let linkJSON = [
            "https://fghtyu-1394606355.cos.ap-shanghai.myqcloud.com/xcconfig/release_first.json",
            "http://pku.qzhagy.com/xcconfig/release_first.json"
        ];
        this.selectCount++;
        utils.NewXMLRequestOSS(linkJSON[index], (res) => {
            console.log("res",linkJSON[index], res) 
            if (res == 'err') {
                this.selectLinkJSON(this.selectCount);
                // Cache.alertTip("第" + index + '个访问不通,开始访问第' + this.selectCount + "个");
                console.log("11111111")

            } else {
                utils.saveValue(GameConfig.StorageKey.LinkJson, linkJSON[index]);
                // Cache.alertTip("获取json成功" + linkJSON[index]);
                this.selectQuickestUrl(res);
                console.log("22222")

            }

        });
    }

    serverFailed = null;
    /**选择最快链路 */
    selectQuickestUrl(data, onTimeoutFail = null) {
        this._apiSelected = false;
        if (this.serverFailed)
            clearTimeout(this.serverFailed);
        this._startTime = GameUtils.getTimeStamp();
        const round = ++this._selectRound;
        this.serverFailed = setTimeout(() => {
            // 如果已经开始下一轮选择，忽略旧回调
            if (round !== this._selectRound) return;
            // 若已经成功设置了线路，则无需兜底
            if (this._apiSelected) return;
            //请求失败 调用备用域名  
            Cache.alertTip("网络较卡,正在选择新线路")
            if (typeof onTimeoutFail === 'function') {
                onTimeoutFail();
            } else {
                this.loadDefaultUrl();
            }
        }, 10 * 1000);
        // 如果本地配置缺失，直接走失败兜底
        if (!data || !data.servers || data.servers.length === 0) {
            if (typeof onTimeoutFail === 'function') {
                onTimeoutFail();
            } else {
                this.loadDefaultUrl();
            }
            return;
        }

        data.servers.forEach(url => {
            utils.XMLRequest(url, data, (u, serverData) => {
                // 忽略旧轮次的探测结果，避免晚返回覆盖新选择
                if (round !== this._selectRound) return;
                this.changeLocalUrl(u, serverData);
            });
        })
    }
    /**无法获取新的 下载默认配置域名 */
    loadDefaultUrl() {
        utils.testConnect(GameConfig.DefaultUrl, (err, res) => {
            console.log("loadDefaultUrl---", err, res)
            if (!err) {
                //将新配置保存至本地
                GameUtils.LogsClient(GameConfig.LogsEvents.SELECT_LINK, { action: GameConfig.LogsActions.SELECT_SPARE_LINK })
                utils.saveValue(GameConfig.StorageKey.ServerUrlObj, res);
                this.selectQuickestUrl(res);
            } else {
                GameUtils.LogsClient(GameConfig.LogsEvents.SELECT_LINK, { action: GameConfig.LogsActions.SELECT_LINK_FAIL })
                Cache.showTipsMsg("无法访问服务器,请检查网络后再重启游戏", () => {
                    cc.game.end();
                })
            }

        })
    }
    // 局数  输赢 今天昨天
    changeLocalUrl(url, serverData) {
        if (this._apiSelected) return;
        this._apiSelected = true;
        clearTimeout(this.serverFailed);
        Connector.logicUrl = url;//wx00e14f422f1929e90000wxcb45c285efd3f864
        Http.API_URL = url;
        // Connector.logicUrl ='http://206.119.85.11:9000/'// url;//wx00e14f422f1929e90000wxcb45c285efd3f864
        // Http.API_URL = 'http://206.119.85.11:9000/'//url;

        let durTime = ((GameUtils.getTimeStamp() - this._startTime) / 1000).toFixed(2);
        GameUtils.LogsClient(GameConfig.LogsEvents.SELECT_LINK, { action: GameConfig.LogsActions.SELECT_LINK_TIME, url: url, times: durTime })

        //将新配置保存至本地
        utils.saveValue(GameConfig.StorageKey.ServerUrlObj, serverData);
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


