// let tbInfo = require("TableInfo");
// let audioCtrl = require("audio-ctrl");
let AudioCtr = cc.Class({
    extends: require('AudioBase'),

    properties: {
        //volume:1
    },

    PassVoice: function (sex) {
        // let sexVoice,url;
        // sexVoice = sex == 1?"male":"famale";
        this.playAudio(`${sex}_PASS.mp3`);
        // url = cc.url.raw(`resources/Audio/Game09/${sexVoice}_PASS.mp3`);
        // audioCtrl.getInstance().playSFX(url);
    },

    playVoice: function (ground,sex) {
        switch (ground.type){
            case "DAN":
            case "DUI":
                this.play(ground,sex);
                break;
            case "LIANDUI":
            case "FEIJI":
            case "SHUN":
                this.special(ground,sex);
                break;
            case "SP":
                this.wushik(ground,sex);
                break;
            case "BOMB":
                let radom = Math.random();
                if(radom>0.2){
                    this.play(ground,sex);
                } else{
                    this.special(ground,sex);
                }
                break;
            case "SAN":
                let card,sexVoice;
                // sexVoice = sex == 1?"male":"famale";
                card = ground.card%100;
                this.playAudio(`${sex}_3_${card}.mp3`);
                // let url = cc.url.raw(`resources/Audio/Game09/${sexVoice}_3_${card}.mp3`);
                // audioCtrl.getInstance().playSFX(url);
                break;
        }
    },

    wushik: function (ground,sex) {
        // let sexVoice;
        // sexVoice = sex == 1?"male":"famale";
        this.playAudio(`${sex}_${ground.type}_${ground.card}.mp3`);
        // let url = cc.url.raw(`resources/Audio/Game09/${sexVoice}_${ground.type}_${ground.card}.mp3`);
        // audioCtrl.getInstance().playSFX(url);
    },

    special: function (ground,sex) {
        // let sexVoice;
        // sexVoice = sex == 1?"male":"famale";
        this.playAudio(`${sex}_${ground.type}.mp3`);
        // let url = cc.url.raw(`resources/Audio/Game09/${sexVoice}_${ground.type}.mp3`);
        // audioCtrl.getInstance().playSFX(url);
    },

    play: function (ground,sex) {
        let card = ground.card % 100;
        // let sexVoice,url;
        // sexVoice = sex == 1?"male":"famale";
        if(ground.cards.length == 2 && (ground.cards[0] % 100) != (ground.cards[1] % 100)){
            //url = cc.url.raw(`resources/Audio/Game09/${sexVoice}_1_18.mp3`)
            this.playAudio(`${sex}_1_18.mp3`);
        }
        else{
            this.playAudio(`${sex}_${ground.cards.length}_${card}.mp3`);
            //url = cc.url.raw(`resources/Audio/Game09/${sexVoice}_${ground.cards.length}_${card}.mp3`);
        }
        //audioCtrl.getInstance().playSFX(url);
    }
});

module.exports = AudioCtr;