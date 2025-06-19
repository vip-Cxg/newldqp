import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import GameUtils from "../../common/GameUtils";
import { App } from "./data/App";

const { ccclass, property } = cc._decorator
@ccclass
export default class CreateRoomPop extends cc.Component {

    @property(cc.EditBox)
    roomNameInput = null;
    @property(cc.Label)
    lblBase = null;
    @property(cc.Label)
    lblFee = null;
    @property(cc.Label)
    lblLower = null;
    @property(cc.Label)
    lblDesc = null;
    @property(cc.Label)
    lblNiao = null;
    @property(cc.Label)
    lblShuffle = null;
    @property(cc.Node)
    gameContent = null;
    @property(cc.Node)
    ruleContent = null;

    @property(cc.Prefab)
    toggleItem = null;
    @property(cc.Prefab)
    ruleItem = null;


    newGame = null;
    newPerson = null;
    newRule = [];
    onLoad() {
        this.addEvents();
        this.renderUI();
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_GAME, this.selectGame, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_PERSON, this.selectRoom, this);
        App.EventManager.addEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_RULE, this.selectRule, this);
    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_GAME, this.selectGame, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_PERSON, this.selectRoom, this);
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_RULE, this.selectRule, this);

    }

    renderUI() {

        this.gameContent.removeAllChildren();
        if (GameUtils.isNullOrEmpty(GameConfig.RoomConfig))
            return;
        this.newGame = GameConfig.RoomConfig[0].gameType;
        this.lblDesc.string = GameConfig.RoomConfig[0].desc;

        this.selectGame({ data: 0 })
        GameConfig.RoomConfig.forEach((e, i) => {
            let toggleItem = cc.instantiate(this.toggleItem);
            toggleItem.getComponent('CreateRoomItem').initGame(e, i, GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_GAME);
            this.gameContent.addChild(toggleItem)
        })
    }

    selectGame(e) {
        this.newGame = GameConfig.RoomConfig[e.data].gameType;
        this.newPerson = GameConfig.RoomConfig[e.data].person[0];
        this.newRule = [];

        this.lblDesc.string = GameConfig.RoomConfig[e.data].desc;

        // GameConfig.RoomConfig[e.data].person.forEach((v, i) => {
        //     let toggleItem = cc.instantiate(this.toggleItem);
        //     toggleItem.getComponent('CreateRoomItem').initPerson(v, i, GameConfig.GameEventNames.CREATE_ROOM_CHOOSE_PERSON);
        //     this.personContent.addChild(toggleItem);
        // });
        this.ruleContent.removeAllChildren();
        if (!GameUtils.isNullOrEmpty(GameConfig.RoomConfig[e.data].rules)) {
            console.log("1123", GameConfig.RoomConfig[e.data].rules, e.data)
            GameConfig.RoomConfig[e.data].rules.forEach((e) => {
                // GameConfig.RoomConfig[e.data].rules[0]
                let toggleItem = cc.instantiate(this.ruleItem);
                toggleItem.getComponent('CreateRoomRule').renderUI(e);
                this.ruleContent.addChild(toggleItem);

            })

        }

    }

    selectRoom(e) {
        this.newPerson = e.data;
    }
    selectRule(e) {
        let keyIndex = this.newRule.findIndex((a) => a.key == e.data.key);
        if (keyIndex == -1)
            this.newRule.push(e.data)
        else
            this.newRule[keyIndex] = e.data;
    }

    onInputBase() {
        Cache.playSfx();
        Cache.showNumer('请输入底分', GameConfig.NumberType.FLOAT, (base) => {
            this.lblBase.string = '' + base;
        })
    }
    onInputFee() {
        Cache.playSfx();
        Cache.showNumer('请输入抽水金额', GameConfig.NumberType.FLOAT, (fee) => {
            this.lblFee.string = '' + fee;
        })
    }
    onInputLower() {
        Cache.playSfx();
        Cache.showNumer('请输入限入金额', GameConfig.NumberType.FLOAT, (lower) => {
            this.lblLower.string = '' + lower;
        })
    }
    onInputNiao() {
        Cache.playSfx();
        Cache.showNumer('请输入打鸟金额', GameConfig.NumberType.FLOAT, (lower) => {
            this.lblNiao.string = '' + lower;
        })
    }
    onInputShuffle() {
        Cache.playSfx();
        Cache.showNumer('请输入洗牌金额', GameConfig.NumberType.FLOAT, (lower) => {
            this.lblShuffle.string = '' + lower;
        })
    }

    onConfirmRoom() {
        Cache.playSfx();
        console.log("dtaa", this.newRule);
        if (GameUtils.isNullOrEmpty(this.newPerson)) {
            Cache.alertTip('请选择人数');
            return;
        }
        if (this.roomNameInput.string == '') {
            Cache.alertTip('请设置房型名称');
            return;
        }
        if (this.lblBase.string == '') {
            Cache.alertTip('请设置底分');
            return;
        }
        if (this.lblFee.string == '') {
            Cache.alertTip('请设置抽水');
            return;
        }
        if (this.lblLower.string == '') {
            Cache.alertTip('请设置限入');
            return;
        }
        if (this.lblNiao.string == '') {
            Cache.alertTip('请设置打鸟');
            return;
        }
        if (this.lblShuffle.string == '') {
            Cache.alertTip('请设置洗牌');
            return;
        }
        let reqData = {
            clubID: App.Club.CurrentClubID,
            name: this.roomNameInput.string,
            gameType: this.newGame,
            base: parseInt(parseFloat(this.lblBase.string) * 100),
            fee: parseInt(parseFloat(this.lblFee.string) * 100),
            lower: parseInt(parseFloat(this.lblLower.string) * 100),
            bird: parseInt(parseFloat(this.lblNiao.string) * 100),
            shuffle: parseInt(parseFloat(this.lblShuffle.string) * 100),
            person: this.newPerson
        };
        if (!GameUtils.isNullOrEmpty(this.newRule)) {
            reqData['rules'] = {};

            this.newRule.forEach((e) => {
                reqData['rules'][e.key] = e.value;
            })
        }
        Connector.request(GameConfig.ServerEventName.CreateRoom, reqData, () => {
            Cache.alertTip('创建成功');
            App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_ROOM_CHANGE);
            this.removeEvents()
            this.node.destroy();

        }, true, (err) => {
            Cache.alertTip(err.message || '创建失败')
        })
    }

    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}


