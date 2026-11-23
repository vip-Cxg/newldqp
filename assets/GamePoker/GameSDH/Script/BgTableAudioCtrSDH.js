let AudioCtr = cc.Class({
    extends: require('AudioBase'),

    properties: {
        //volume:1
    },

    PassVoice: function (sex) {
        let sexVoice;
        let random = Math.random();
        sexVoice = sex;// == 1?"male":"famale";
        if (random > 0.5) {
            this.playAudio(`${sexVoice}_pass0.mp3`);
            //url = cc.url.raw(`resources/Audio/${game}/${sexVoice}_pass0.mp3`);
        } else {
            this.playAudio(`${sexVoice}_pass1.mp3`);
            //url = cc.url.raw(`resources/Audio/${game}/${sexVoice}_pass1.mp3`);
        }
    },

    playVoice: function (ground, sex) {
        let sexVoice, url, card;
        sexVoice = sex;//== 1?"male":"famale";
        card = ground.card % 100;
        let random = Math.random();
        switch (ground.type) {
            case "DAN":
            case "DUI":
                this.playAudio(`${sexVoice}_${ground.cards.length}_${card}.mp3`);

                break;
            case "LIANDUI":
            case "FEIJI":
            case "SHUN":
            case "BOMB":
                this.playAudio(`${sexVoice}_${ground.type}.mp3`);

                break;
            case "SAN":
                if (random > 0.2) {
                    if (ground.cards.length == 5) {
                        this.playAudio(`${sexVoice}_32.mp3`);
                        //url = cc.url.raw(`resources/Audio/${game}/${sexVoice}_32.mp3`);

                    }
                    if (ground.cards.length == 4) {
                        this.playAudio(`${sexVoice}_31.mp3`);
                        //url = cc.url.raw(`resources/Audio/${game}/${sexVoice}_31.mp3`);

                    }
                    if (ground.cards.length == 6) {
                        this.playAudio(`${sexVoice}_42.mp3`);
                        //url = cc.url.raw(`resources/Audio/${game}/${sexVoice}_42.mp3`);

                    }
                } else {
                    this.playAudio(`${sexVoice}_3_${card}.mp3`);

                }

                break;
            default:
                break;
        }
    },
});

module.exports = AudioCtr;