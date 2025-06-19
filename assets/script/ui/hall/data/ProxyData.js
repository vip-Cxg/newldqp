export class ProxyData{

    constructor(proxyData={}){
        this._id=proxyData.id||0;
        this._name=proxyData.name||'暂无';
        this._inviter=proxyData.inviter||'QWERTY';
        this._league=proxyData.league||'public';
        this._wallet=proxyData.wallet||0;
        this._phone=proxyData.phone||'暂无';
        this._role=proxyData.role||'normal';
        this._rewardWin=proxyData.rewardWin||0;
        this._parent=proxyData.parent||'暂无';
        this._shuffle=proxyData.shuffle||0;
        this._credit=proxyData.credit||0;
    }
    
    get id(){
        return this._id;
    }
    get name(){
        return this._name;
    }
    get inviter(){
        return this._inviter;
    }
    get league(){
        return this._league;
    }
    get wallet(){
        return this._wallet;
    }
    get phone(){
        return this._phone;
    }
    get role(){
        return this._role;
    }
    get rewardWin(){
        return this._rewardWin;
    }
    get parent(){
        return this._parent;
    }
    get shuffle(){
        return this._shuffle;
    }
    get credit(){
        return this._credit;
    }

}
export class ProxyDetailData{

    constructor(proxyData={}){
        this._count=proxyData.count||0;
        this._userCount=proxyData.userCount||0;
        this._proxyCount=proxyData.proxyCount||0;
        this._wallet=proxyData.wallet||0;
        this._userWallet=proxyData.userWallet||0;
        this._proxyWallet=proxyData.proxyWallet||0;

    }
    
    get count(){
        return this._count;
    }
    get userCount(){
        return this._userCount;
    }
    get proxyCount(){
        return this._proxyCount;
    }
    get wallet(){
        return this._wallet;
    }
    get userWallet(){
        return this._userWallet;
    }
    get proxyWallet(){
        return this._proxyWallet;
    }

}