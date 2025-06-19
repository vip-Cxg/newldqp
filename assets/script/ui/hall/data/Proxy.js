
import { GameConfig } from "../../../../GameBase/GameConfig";
import Cache from "../../../../Main/Script/Cache";
import { PopupManager } from "../../../base/pop/PopupManager";
import GameUtils from "../../../common/GameUtils";
import Http from "../../../common/network/Http";
import { ProxyData, ProxyDetailData } from "./ProxyData";

export class Proxy {
    static _instance = null;
    static getInstance() {
        if (!this._instance)
            this._instance = new Proxy();
        return this._instance;
    }

    _proxyData = new ProxyData();
    _proxyDetail = new ProxyDetailData();
    _proxyEarn = 0;
    _proxyToken = '';
    constructor() {

    }

    loginProxy() {
        let proxyToken = GameUtils.getValue(GameConfig.StorageKey.ProxyToken, "");
        if (GameUtils.isNullOrEmpty(proxyToken)) {
            //TODO  打开代理登录界面
            PopupManager.show(GameConfig.pop.ProxyLoginPop);
        } else {
            //TODO 获取代理信息
            this.getProxyInfo().then(() => {
                //TODO 打开代理界面  关闭登录界面
                PopupManager.show(GameConfig.pop.ProxyManagePop);
                PopupManager.release(GameConfig.pop.ProxyLoginPop);
            }).catch((err) => {
                Cache.alertTip(err.message || '获取信息超时')
            });
        }
    }

    codeLoginProxy(code, phone) {
        let options = {
            url: GameConfig.ServerEventName.ProxyLogin,
            data: {
                code,
                phone,
                publicKey: GameConfig.Encrtyptor.getPublicKey()
            }
        }
        Http.post(options).then((data) => {
            let decryptToken = GameConfig.Encrtyptor.decrypt(data.token);
            GameUtils.saveValue(GameConfig.StorageKey.ProxyToken, decryptToken);
            this.getProxyInfo().then(() => {
                //TODO 打开代理界面  关闭登录界面
                PopupManager.show(GameConfig.pop.ProxyManagePop);
                PopupManager.release(GameConfig.pop.ProxyLoginPop);
            }).catch((err) => {
                console.log('-----111----', err);
                Cache.alertTip(err.message || '获取信息超时')
            });

        }).catch((err) => {
            //TODO 登录失败 
                console.log('-----222----', err);
                Cache.alertTip(err.message || '登录失败')
        });
    }

    /**获取代理信息 */
    getProxyInfo() {
        return new Promise((res, rej) => {
            let token = GameUtils.getValue(GameConfig.StorageKey.ProxyToken, "");
            let encryptToken = GameUtils.encryptToken(token);
            let options = {
                url: GameConfig.ServerEventName.ProxyInfo,
                data: { isLeague: GameConfig.ProxyIsLeague },
                headers: {
                    'xxx-token': encryptToken,
                },
                token
            }

            Http.post(options).then((data) => {
                this._proxyData = new ProxyData(data.proxy);
                this._proxyEarn = data.total;
                res(data)
            }).catch((err) => {
                console.log('-----err----', err);
                rej(err);
            });
        })

    }
    /**获取代理详细信息 */
    getDetailInfo() {
        return new Promise((res)=>{
            let token = GameUtils.getValue(GameConfig.StorageKey.ProxyToken, "");
            let encryptToken = GameUtils.encryptToken(token);
            let options = {
                url: GameConfig.ServerEventName.ProxyDetail,
                data: { id: this._proxyData.id, isLeague: GameConfig.ProxyIsLeague },
                headers: {
                    'xxx-token': encryptToken,
                },
                token
            }
            Http.post(options).then((data) => {
                this._proxyDetail = new ProxyDetailData(data);
                res();
            }).catch((err) => {
                Cache.alertTip(err.message||'获取统计数据失败');
                res();
            });
        })
        
    }
    get proxyData() {
        return this._proxyData;
    }
    get proxyEarn() {
        return this._proxyEarn;
    }
    get proxyDetail() {
        return this._proxyDetail;
    }
}