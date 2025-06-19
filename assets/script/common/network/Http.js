import { GameConfig } from "../../../GameBase/GameConfig";
import GameUtils from "../GameUtils";

export default class Http {
    static API_URL = GameConfig.TestServerUrl;

    /**post 请求
     * @param options  --url,data, headers timeout ,
     */
    static post(options) {
        return new Promise((resolve, reject) => {
            let { url, data, headers = {}, timeout = 10000, sign = true, token = '' } = options;
            if (url == null) {
                reject(new Error('empty url'));
                return;
            }
            if (data == null) {
                reject(new Error('empty data'));
                return;
            }
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.open('POST', this.API_URL + url, true);
            xhr.setRequestHeader('cache-control', 'no-cache');
            xhr.setRequestHeader('contentType', 'text/html;charset=uft-8'); //指定发送的编码
            xhr.setRequestHeader('Content-Type', 'application/json');
            for (let key in headers) {
                xhr.setRequestHeader(key, headers[key]);
            }
            console.log('url: ', url);
            console.log('data: ', data);
            data.version = cc.gameVersion || GameConfig.DefaultVersion;
            data.ts = GameUtils.getTimeStamp();
            if (sign) {
                data.sign = GameUtils.encryptData(data, token);
            }
            xhr.timeout = timeout;
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {

                    if (xhr.status < 200 || xhr.status > 207) {
                        reject(new Error(`request fail ${xhr.status}`));
                        return;
                    }
                    let response = xhr.responseText;
                    let resData = JSON.parse(response);
                    console.log(url + ': ', resData)
                    resolve(resData);
                }
            };

            xhr.onerror = (e) => {
                // FIXME  confirm e?
                reject(e);
            };
            xhr.ontimeout = () => {
                reject(new Error('timeout'));
            };
            xhr.send(JSON.stringify(data));
        });
    }
}
