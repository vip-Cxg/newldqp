import { GameConfig } from "../../../GameBase/GameConfig";
import Cache from "../../../Main/Script/Cache";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Number extends cc.Component {

    @property(cc.Label)
    lblNum = null;
    @property(cc.Node)
    ensureBtn = null;
    @property(cc.Node)
    delbtn = null;
    @property(cc.Node)
    floatBtn = null;
    @property(cc.Label)
    lblTitle = null;


    _callBack = null;
    _type = null;


    initCallback(title = '', type, call) {

        this.lblTitle.string = title;
        this.lblNum.string = ''

        this.ensureBtn.getComponent(cc.Button).interactable = false;

        this.delbtn.active = type == GameConfig.NumberType.INT;
        this.floatBtn.active = type == GameConfig.NumberType.FLOAT;

        this._callBack = call;
        this._type = type;
    }

    onClickNum(e, v) {
        Cache.playSfx();
        //只能输入2位小数
        if(this._type==GameConfig.NumberType.FLOAT&&this.lblNum.string.indexOf('.')!=-1&&this.lblNum.string.split('.')[1].length>=2){
            return;
        }
        this.lblNum.string += v;

        this.ensureBtn.getComponent(cc.Button).interactable = true;
    }

    onClickFloat() {
        Cache.playSfx();
        if (this.lblNum.string.indexOf('.') != -1)
            return;
        if (this.lblNum.string == '') {
            this.lblNum.string = '0.';
            return;
        }
        this.lblNum.string += '.';

    }

    onClickDetele() {
        Cache.playSfx();
        if (this.lblNum.string == '')
            return;
        this.lblNum.string = this.lblNum.string.substring(0, this.lblNum.string.length - 1);
        if (this.lblNum.string == '') {
            this.ensureBtn.getComponent(cc.Button).interactable = false;
        }

    }


    onClickReset() {
        Cache.playSfx();
        this.lblNum.string = '';
        this.ensureBtn.getComponent(cc.Button).interactable = false;
    }

    onClickEnsure() {
        if (this.lblNum.string == '')
            return;
        let exportRes = this._type == GameConfig.NumberType.INT ? parseInt(this.lblNum.string) : parseFloat(this.lblNum.string);
        if (this._callBack)
            this._callBack(exportRes)

        this.node.destroy();
    }

    onClickClose() {
        Cache.playSfx();
        this.node.destroy();
    }

}