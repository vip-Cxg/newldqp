import { GameConfig } from "../../../GameBase/GameConfig";
import AudioCtrl from "../../../Main/Script/audio-ctrl";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Music extends cc.Component {
    @property(cc.SpriteFrame)
    SprCloseMusic = {
        type: cc.SpriteFrame,
        default: null,
        displayname: '关闭音乐icon',
    }
    @property(cc.SpriteFrame)
    SprOpenMusic = {
        type: cc.SpriteFrame,
        default: null,
        displayname: '开启音乐icon',
    }

    onLoad() {
        this.renderUI();
    }

    renderUI() {
        let musicVolume = GameUtils.getValue(GameConfig.StorageKey.MusicVolume, 1);
        this.node.getComponent(cc.Sprite).spriteFrame = musicVolume == 0 ? this.SprCloseMusic : this.SprOpenMusic;
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClickMusic, this);
    }

    onClickMusic() {
        Cache.playSfx();
        let musicVolume = GameUtils.getValue(GameConfig.StorageKey.MusicVolume, 1);

        if (musicVolume == 1) { //目前开启状态 点击关闭
            this.node.getComponent(cc.Sprite).spriteFrame = this.SprCloseMusic;
            AudioCtrl.getInstance().setBGMVolume(0);
            AudioCtrl.getInstance().setSFXVolume(0);
            GameUtils.saveValue(GameConfig.StorageKey.SoundVolume, 0);
            GameUtils.saveValue(GameConfig.StorageKey.MusicVolume, 0);

        } else {//目前关闭状态 点击开启
            this.node.getComponent(cc.Sprite).spriteFrame = this.SprOpenMusic;
            AudioCtrl.getInstance().setBGMVolume(1);
            AudioCtrl.getInstance().setSFXVolume(1);
            GameUtils.saveValue(GameConfig.StorageKey.SoundVolume, 1);
            GameUtils.saveValue(GameConfig.StorageKey.MusicVolume, 1);
        }

    }

}