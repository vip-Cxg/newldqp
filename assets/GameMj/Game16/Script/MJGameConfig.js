let config = {
    COMMON : {
        STATUS:{
            WAIT:0,
            CUTE:1,
            START:2,
            SUMMARY:3,
            DESTORY:4,
            TIAN:5,
            XIAN_TING:6,
            ZHUANG_GANG:7,
            ZHUANG_TING:8,
            GANG:9
        },
    },
    GAME_HZMJ : {
        PLAYER_POS_READY:[cc.v2(-493,-143),cc.v2(504,104),cc.v2(319,234),cc.v2(-493,104)],
        PLAYER_POS_START:[cc.v2(-493,-143),cc.v2(504,104),cc.v2(319,234),cc.v2(-493,104)],
        STATUS:{
            WAIT:0,
            CUTE:1,
            START:2,
            SUMMARY:3,
            DESTORY:4,
            TIAN:5,
            XIAN_TING:6,
            ZHUANG_GANG:7,
            ZHUANG_TING:8,
            GANG:9
        },
        FIRST_CARD_POS:{x:-530,y:-260},
        CARD_RECT: 70,
        /**手牌大小 */
        CARD_SCALE: 1,
        QUEST_TYPE: {
            GUO: 'guo',
            PENG:'peng',
            SUO:'suo',
            FANG:'fang',
            AN:'an',
            HU:'hu',
            GANG:'gang'
        },
        GROUND_RECT: 150,
        QUEST_IMG_POS: [cc.v2(-18,-94),cc.v2(309,37),cc.v2(-18,177),cc.v2(-300,37)],
        ELSE_HANDS_POS: [cc.v2(547,16),cc.v2(-51,256),cc.v2(-287,43)],
        SHOW_CARD_POS: [cc.v2(-10,-117),cc.v2(335,22),cc.v2(-17,168),cc.v2(-320,27)],
        RULE_MA:['不扎码','一码全中','扎2码','','扎4码','胡几奖几','扎6码']
    },
    GAME_YJQF : {
        PLAYER_XI_POS: [cc.v2(-489,-162),cc.v2(484,127),cc.v2(-488,126)],
        PLAYER_POS : [cc.v2(-487,-195),cc.v2(487,93),cc.v2(-487,93)],
        FINAL_XI_POS: [cc.v2(-393,-238),cc.v2(387,50),cc.v2(-393,50)],
        FINISH_POS:[cc.v2(-417,-101),cc.v2(417,171),cc.v2(-417,171)],
        FINAL_SCORE_POS:[cc.v2(-394,-212), cc.v2(408, 75), cc.v2(-391,75)]
    },
    GAME_YJSRQF : {
        PLAYER_POS : [cc.v2(-487,-84),cc.v2(487,-84),cc.v2(487,197),cc.v2(-487,197)]
    }
};
module.exports = config;