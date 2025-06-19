let db = require("DataBase");
cc.Class({
    extends: cc.Component,

    properties: {
        
    },


    playAudio:function(msg){
        let game = db.gameType<10?("Game0"+db.gameType):("Game"+db.gameType);
        if (!cc.sys.isNative) {
            return;
        }
        let url = jsb.fileUtils.getWritablePath() + "remote-asset/Audio/"+ game +"/" + msg ; 
        cc.loader.load(url, function(err,data){
            let audioCtrl = require("audio-ctrl");
            audioCtrl.getInstance().playSFX(data);
        });       
    },
});
