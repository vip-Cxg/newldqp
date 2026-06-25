import { GameConfig } from "../../../GameBase/GameConfig";
import Connector from "../../../Main/NetWork/Connector";
import Cache from "../../../Main/Script/Cache";
import { App } from "../../ui/hall/data/App";
import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator
@ccclass
export default class ClubListPop extends cc.Component {

    @property(cc.Sprite)
    titleSpr = null;
    @property(cc.SpriteFrame)
    clubSpr = null;
    @property(cc.SpriteFrame)
    leagueSpr = null;
    @property(cc.Node)
    itemContent = null;
    @property(cc.Prefab)
    clubItem = null;



    onLoad() {
        this.addEvents();
    }
    addEvents() {
        App.EventManager.addEventListener(GameConfig.GameEventNames.CHOOSE_CLUB,this.onClickClose,this);
    }
    removeEvents() {
        App.EventManager.removeEventListener(GameConfig.GameEventNames.CHOOSE_CLUB,this.onClickClose,this);
    }
    renderLeague(){
       this. titleSpr.spriteFrame=this.leagueSpr;
        this.itemContent.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.ClubList,{isLeague:true},(data)=>{
            let clubs = GameUtils.isNullOrEmpty(data.clubs) ? [] : data.clubs.concat();
            if (clubs.length == 0) {
                clubs.push({
                    clubID: -900001,
                    inviter: 900001,
                    peoples: 9999,
                    role: 'user',
                    club: { name: '原大厅测试联盟' },
                    owner: { head: '', name: '测试' }
                });
            }
            if (clubs.length < 2) {
                clubs.push({
                    clubID: -900002,
                    inviter: 900002,
                    peoples: 9999,
                    role: 'user',
                    isStaticHallTest: true,
                    club: { name: '新大厅测试联盟' },
                    owner: { head: '', name: '测试' }
                });
            }
            if(!GameUtils.isNullOrEmpty(data.clubs)){
                App.Club.initClubData(data.clubs);
            }
            clubs.forEach((element, index) => {
                let item=cc.instantiate(this.clubItem);
                item.getComponent('ClubListItem').renderLeague(element, index);
                this.itemContent.addChild(item);
            });
        })
    }

    renderClub(){
       this. titleSpr.spriteFrame=this.clubSpr;
       this.itemContent.removeAllChildren();
        Connector.request(GameConfig.ServerEventName.ClubList,{isLeague:false},(data)=>{
            if(!GameUtils.isNullOrEmpty(data.clubs)){
                App.Club.initClubData(data.clubs);
                data.clubs.forEach(element => {
                    let item=cc.instantiate(this.clubItem);
                    item.getComponent('ClubListItem').renderClub(element);
                    this.itemContent.addChild(item);
                });
            }
        })
    }


    onClickClose() {
        Cache.playSfx();
        this.removeEvents()
        this.node.destroy();
    }



}
