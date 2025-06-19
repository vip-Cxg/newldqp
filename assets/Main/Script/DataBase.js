const utils = require("./utils");

let db = {

    player: null,       //用户信息
    connectInfo: null,      //连接信息
    systemNotice: null,     //公告信息
    gameType: 11,           //游戏类型
    gameDate: null,         //游戏日期
    noticeContent: null,
    /**当前桌子背景下标 */
    tableBgIndex: 0,
    /**当前桌子背景图片 */
    tableBgSf: null,
    /**系统配置 */
    systemConfig: null,
    card: 0,

    postfix: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    gameName: ['沅江千分', '', '沅江麻将', '', '隆回罢炸弹', '邵阳剥皮', '沅江鬼胡子', '跑得快', '新化字牌', '新化炸弹', '郴州字牌', '株洲碰胡',
        '衡阳同花', '衡阳六胡抢', '打码子', '', '红中麻将', '南县歪胡子', '', '安乡偎麻雀', '红A', "娄底炸弹", "娄底放炮罚", "涟源K五十", '转转麻将',
        '岳阳字牌', '隆回炸弹', '长沙麻将', '沅江二人千分', '福禄寿'],

    // TABLE_TYPE :["Game00","Game01","Game02",'Game03','Game04','Game05','Game06','Game07','Game08','Game09','Game10','Game11','Game12','Game13','Game14','','Game16','Game17','Game18','Game19','Game20','Game21','Game22','Game23','Game24','Game25','Game26','Game27','Game28','Game29'],
    /**游戏类型对应场景 */
    TABLE_TYPE: {
        "PDK": "Game07",
        "PDK_CLAN": "Game07",
        "PDK_SOLO": "Game07",
        "PDK_SOLO_CLAN": "Game07",
        "XHZP": "Game08",
        "XHZP_CLAN": "Game08",
        "XHZP_SOLO": "Game08",
        "XHZP_SOLO_CLAN": "Game08",
        "XHZD": "Game09",
        "XHZD_CLAN": "Game09",
        "LDZP": "Game08",
        "LDZP_CLAN": "Game08",
        "LDZP_SOLO": "Game08",
        "LDZP_SOLO_CLAN": "Game08",
        "HZMJ_SOLO": "Game16",
        "HZMJ": "Game16",
        "HNMJ": "Game19",
        "LGMJ": "Game19"

    },
    GAME_TYPE: {
        "PDK": 7,
        "PDK_CLAN": 7,
        "PDK_SOLO": 7,
        "PDK_SOLO_CLAN": 7,
        "XHZP": 8,
        "XHZP_CLAN": 8,
        "XHZP_SOLO": 8,
        "XHZP_SOLO_CLAN": 8,
        "XHZD": 9,
        "XHZD_CLAN": 9,
        "LDZP": 8,
        "LDZP_CLAN": 8,
        "LDZP_SOLO": 8,//22
        "LDZP_SOLO_CLAN": 8,//22
        "HZMJ_SOLO": 16,//22
        "HZMJ": 16,//22
        'HNMJ': 19,
        'LGMJ': 19,
    },

    GAME_NAME: {
        "PDK": "跑得快",
        "PDK_SOLO": "双人跑得快",
        "XHZP": "硬胡子",
        "XHZP_SOLO": "双人硬胡子",
        "XHZD": "新化炸弹",
        "LDZP": "放炮罚",
        "LDZP_SOLO": "双人放炮罚",
        "HZMJ_SOLO": "双人红中麻将",
        "HZMJ": "红中麻将",
        "HNMJ_SOLO": '双人海南麻将',
        "HNMJ": '海南麻将',
        "LGMJ_SOLO": '双人新海南麻将',
        "LGMJ": '新海南麻将',
    },


    CLAN_NAME: ['yjqf_clan_name', null, 'yjmj_clan_name', 'lyzp_clan_name', 'lhbzd_clan_name', 'sybp_clan_name', 'yjghz_clan_name',
        'yjpdk_clan_name', 'xhzp_clan_name', 'xhzd_clan_name', 'czzp_clan_name', 'zzph_clan_name', 'hyth_clan_name', 'hdlhq_clan_name',
        'dmz_clan_name', null, 'hzmj_clan_name', 'nxwhz_clan_name', null, 'axwmq_clan_name', 'ha_clan_name', 'ldzd_clan_name', 'ldzp_clan_name',
        'lyzd_clan_name', 'zzmj_clan_name', 'yyzp_clan_name', 'lhzd_clan_name', 'csmj_clan_name', 'yjqf_clan_name', 'fls_clan_name'],

    CLAN_ID: ['yjqf_clan_id', null, 'yjmj_clan_id', 'lyzp_clan_id', 'lhbzd_clan_id', 'sybp_clan_id', 'yjghz_clan_id', 'yjpdk_clan_id',
        'xhzp_clan_id', 'xhzd_clan_id', 'czzp_clan_id', 'zzph_clan_id', 'hyth_clan_id', 'hdlhq_clan_id', 'dmz_clan_id', null, 'hzmj_clan_id',
        'nxwhz_clan_id', null, 'axwmq_clan_id', 'ha_clan_id', 'ldzd_clan_id', 'ldzp_clan_id', 'lyzd_clan_id', 'zzmh_clan_id', 'yyzp_clan_id', 'lhzd_clan_id', 'csmj_clan_id', 'yjqf_clan_id', 'fls_clan_id'],

    STORAGE_KEY: {

        USER_ID: 'USER_ID',
        LAST_LOGIN: 'LAST_LOGIN',
        LOGIN_PASSWD: 'LOGIN_PASSWD',
        LOGIN_PHONE: 'LOGIN_PHONE',
        NEW_PLAYER: 'NEW_PLAYER',

        TABLE_CUT_TYPE: 'TABLE_CUT_TYPE',

        SET_MUSIC: "SET_MUSIC",
        SET_SOUND: "SET_SOUND",
        SET_TABLE: "SET_TABLE",

        GAME_TYPE: "GAME_TYPE",
        GAME_DATE: "GAME_DATE",

        CLAN_NAME: 'CLAN_NAME',

        /**快速加入 1--公会 0--大联盟 */
        QUICK_JOIN_CLUB: 'QUICK_JOIN_CLUB',
        /**快速加入 游戏类型 */
        QUICK_JOIN_GAME: 'QUICK_JOIN_GAME',
        /**快速加入 游戏房间类型 */
        QUICK_JOIN_ROOM: 'QUICK_JOIN_ROOM',

        AUDIO: ['AUDIO_0', 'AUDIO_1', 'AUDIO_2', 'AUDIO_3', 'AUDIO_4', 'AUDIO_5', 'AUDIO_6', 'AUDIO_7', 'AUDIO_8', 'AUDIO_9', 'AUDIO_10'
            , 'AUDIO_11', 'AUDIO_12', 'AUDIO_13', 'AUDIO_14', 'AUDIO_15', 'AUDIO_16', 'AUDIO_17', 'AUDIO_18', 'AUDIO_19', 'AUDIO_20',
            'AUDIO_21', 'AUDIO_22', 'AUDIO_23', 'AUDIO_24', 'AUDIO_25', 'AUDIO_26', 'AUDIO_27', 'AUDIO_28'],

        AUDIO_VERSION: ['AUDIO_VERSION_0', 'AUDIO_VERSION_1', 'AUDIO_VERSION_2', 'AUDIO_VERSION_3', 'AUDIO_VERSION_4', 'AUDIO_VERSION_5', 'AUDIO_VERSION_6', 'AUDIO_VERSION_7', 'AUDIO_VERSION_8',
            'AUDIO_VERSION_9', 'AUDIO_VERSION_10', 'AUDIO_VERSION_11', 'AUDIO_VERSION_12', 'AUDIO_VERSION_13', 'AUDIO_VERSION_14', 'AUDIO_VERSION_15', 'AUDIO_VERSION_16', 'AUDIO_VERSION_17',
            'AUDIO_VERSION_18', 'AUDIO_VERSION_19', 'AUDIO_VERSION_20', 'AUDIO_VERSION_21', 'AUDIO_VERSION_22', 'AUDIO_VERSION_23', 'AUDIO_VERSION_24', 'AUDIO_VERSION_25', 'AUDIO_VERSION_26', 'AUDIO_VERSION_27', 'AUDIO_VERSION_28'],
    },

    getFloat: function (name, defaultValue) {
        let value = utils.getValue(name);
        return value == null ? (defaultValue == null ? 0 : defaultValue) : parseFloat(value);
    },
    setFloat: function (name, value) {
        utils.saveValue(name, value);
        //(`db.save() ${name}:${value}`);
    },
    getInt: function (name, defaultNum) {
        let value = utils.getValue(name);
        //cc.log("db-value", value);
        return (value == null ? defaultNum ? defaultNum : 1 : parseInt(value));
    },
    getIntTable: function (name) {
        let value = utils.getValue(name);
        //cc.log("db-value", value);
        return utils.isNullOrEmpty(value) ? 1 : parseInt(value);
    },
    setInt: function (name, value) {

        if (utils.isNullOrEmpty(value))
            value = 1;
        let int = parseInt(value);
        utils.saveValue(name, int);
        //cc.log(`db.save() ${name}:${value}`);
    },
    getString: function (name) {
        let value = utils.getValue(name);

        return utils.isNullOrEmpty(value) ? "" : value;
    },
    setString: function (name, value) {
        //let string = value.toString();
        if (utils.isNullOrEmpty(value))
            value = "";
        utils.saveValue(name, value);
        //cc.log(`db.save() ${name}:${value}`);
    },
    setGameType: function (gameType) {
        utils.saveValue(db.STORAGE_KEY.GAME_TYPE, gameType);
        db.gameType = gameType;
    },
    /**获取游戏对应场景 */
    getTableScene: function () {
        return db.TABLE_TYPE[db.gameType];

    },
    

    loadGameType: function () {
        let val = utils.getValue(db.STORAGE_KEY.GAME_TYPE);
        val = (val == null) ? 7 : parseInt(val);
        db.gameType = val;
    }
};
module.exports = db;
