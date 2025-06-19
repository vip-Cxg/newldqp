import { GameConfig } from "../../../GameBase/GameConfig";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Avatar extends cc.Component {
    @property(cc.SpriteFrame)
    sfDefaultAvatar = {
        type: cc.SpriteFrame,
        default: null,
        displayname: '默认头像',
    }

    _avatarUrl = '';

    get avatarUrl() {
        return this._avatarUrl;
    }

    set avatarUrl(value) {
        this._avatarUrl = value;
        this.renderUI();
    }

    renderUI() {
        const sprAvatar = this.node.getComponent(cc.Sprite);
        if (!GameUtils.isNullOrEmpty(this._avatarUrl)) {
            let headUrl = this._avatarUrl
            if (this._avatarUrl.indexOf('://') == -1)
                headUrl = GameConfig.HeadUrl + this._avatarUrl;
            const urlType = headUrl.split('://')[0];
            let avatarUrl = headUrl.split("://")[1];
            switch (urlType) {
                case "remote":
                    finalUrl = GameConfig.ConfigUrl + imgUrl;
                    cc.loader.load(GameConfig.ConfigUrl + imgUrl + '?file=a.png', (err, tex) => {
                        if (err) {
                            if (cc.isValid(sprAvatar, true)) { sprAvatar.spriteFrame = this.sfDefaultAvatar; }
                        } else {
                            try {
                                const spriteFrame = new cc.SpriteFrame(tex);
                                if (sprAvatar) { sprAvatar.spriteFrame = spriteFrame; }
                            } catch (error) {
                                if (cc.isValid(sprAvatar, true)) { sprAvatar.spriteFrame = this.sfDefaultAvatar; }
                            }
                        }
                    });
                    break;
                case 'file':
                    // 设置本地头像
                    sprAvatar.spriteFrame = GameConfig.AvatartAtlas.getSpriteFrame("mj_face" + avatarUrl);
                    break;
                case 'https':
                case 'http':
                    // 设置远程头像
                    // cc.loader.load(`${headUrl}`, (err, tex) => {
                    cc.loader.load(`${headUrl}?file=a.png`, (err, tex) => {
                        if (err) {
                            if (cc.isValid(sprAvatar, true)) { sprAvatar.spriteFrame = this.sfDefaultAvatar; }
                        } else {
                            try {
                                const spriteFrame = new cc.SpriteFrame(tex);
                                if (sprAvatar) { sprAvatar.spriteFrame = spriteFrame; }
                            } catch (error) {
                                if (cc.isValid(sprAvatar, true)) { sprAvatar.spriteFrame = this.sfDefaultAvatar; }
                            }
                        }
                    });
                    break;
            }
        } else {
            sprAvatar.spriteFrame = this.sfDefaultAvatar;
        }
    }
}