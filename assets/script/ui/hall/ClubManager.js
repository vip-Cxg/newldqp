import { GameConfig } from "../../../GameBase/GameConfig";
import GameUtils from "../../common/GameUtils";
import { App } from "./data/App";


export class ClubManager {
    static _instance = null;
    static getInstance() {
        if (!this._instance)
            this._instance = new ClubManager();
        return this._instance;
    }
    constructor() {
        this._allClub = [];
        this._clubIDList = [];
        this._clubList = {};
        this._currentClub = {};
        this._currentClubId = -1;
        this._currentClubRole = 'user';

        this._clubName='';
        this._clubNotice = '';
        this._clubScore = 0;
        this._clubBank = 0;
        this._clubLevel = 0;
        this._clubReward = 0;
        this._isLeague=true;

        this._shuffleLevel=0;
    }
    initClubData(clubList) {
        console.log('初始化公会', clubList)
        this.clear();
        this._allClub = clubList;
        clubList.forEach((club, index) => {
            let clubId = club.clubID;
            this._clubIDList.push(clubId);
            this._clubList[clubId] = club;
        });
    }

    get CurrentClubRole() {
        return this._currentClubRole;
    }
    set CurrentClubRole(v) {
        this._currentClubRole = v;
    }

    set CurrentClubID(clubId) {
        GameUtils.saveValue(GameConfig.StorageKey.LastClubID, clubId);
        this._currentClubId = clubId;
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_CHANGE)
    }


    get CurrentClubID() {
        if (this._allClub.length == 0)
            return -1;

        if (this._currentClubId == -1) {
            let LastClubID = GameUtils.getValue(GameConfig.StorageKey.LastClubID);
            this._currentClubId = this._clubIDList.indexOf(LastClubID) == -1 ? this._allClub[0].clubID : LastClubID;
        }
        return this._currentClubId;
    }

    get CurrentClubData() {
        if (this._allClub.length == 0)
            return {};
        let clubData = {};
        if (GameUtils.isNullOrEmpty(this._clubList[this._currentClubId])) {
            clubData = this._allClub[0];
            this._currentClubId=clubData.clubID;
        } else {
            clubData = this._clubList[this._currentClubId];
        }
        // let clubData = GameUtils.isNullOrEmpty(this._clubList[this._currentClubId]) ? this._allClub[0] : this._clubList[this._currentClubId];
        return clubData;
    }



    get AllClubData() {
        return this._allClub;
    }





    get ClubNotice() {
        return this._clubNotice;
    }
    set ClubNotice(v) {
        this._clubNotice = v;
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_DATA_CHANGE);
    }


    get ClubScore() {
        return this._clubScore;
    }
    set ClubScore(v) {
        if(this._clubScore==v) return;
        this._clubScore = v;
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_DATA_CHANGE);
    }

   

    get ClubBank() {
        return this._clubBank;
    }
    set ClubBank(v) {
        if(this._clubBank==v) return;
        this._clubBank = v;
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_DATA_CHANGE);
    }

    get ClubLevel() {
        return this._clubLevel;
    }
    set ClubLevel(v) {
        if(this._clubLevel==v) return;
        this._clubLevel = v;
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_DATA_CHANGE);
    }

    get ShuffleLevel() {
        return this._shuffleLevel;
    }
    set ShuffleLevel(v) {
        if(this._shuffleLevel==v) return;
        this._shuffleLevel = v;
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_DATA_CHANGE);
    }



    get ClubReward() {
        return this._clubReward;
    }
    set ClubReward(v) {
        if(this._clubReward==v) return;
        this._clubReward = v;
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_DATA_CHANGE);
    }

    get ClubName() {
        return this._clubName;
    }
    set ClubName(v) {
        this._clubName = v;
        App.EventManager.dispatchEventWith(GameConfig.GameEventNames.CLUB_DATA_CHANGE);
    }

    get IsLeague() {
        return this._isLeague;
    }
    set IsLeague(v) {
        this._isLeague = v;
    }


    clear() {
        this._allClub = [];
        this._clubIDList = [];
        this._clubList = {};
        this._currentClubRole = 'user';
    }
}


