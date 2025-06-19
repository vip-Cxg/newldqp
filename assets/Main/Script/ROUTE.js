module.exports = {

    /**-------------------------------匹配事件--------------------------------- */
    




    /**-------------------------------游戏事件--------------------------------- */
    /**海南麻将 小局继续 */
    CS_CHAPTER:'CS_CHAPTER',
    /**海南麻将 小局准备 */
    SC_CHAPTER:'SC_CHAPTER',
    SC_REFRESH_CARD: "SC_REFRESH_CARD",
    CS_CLAN_QUEUE: "CS_CLAN_QUEUE",
    CS_JOIN_ROOM: "CS_JOIN_ROOM",
    CS_CREATE_ROOM: "CS_CREATE_ROOM",
    CS_RE_GAME: "CS_RE_GAME",
    SC_PLAY_ERROR: "SC_PLAY_ERROR",

    /**游戏移除 */
    SC_GAME_DESTORY:"SC_GAME_DESTORY",
    /**游戏内提示 */
    SC_TOAST:"SC_TOAST",

    /**游戏信息      麻将加入游戏初始化 桌子信息  */
    SC_GAME_DATA: "SC_GAME_DATA",
    /**游戏信息      所有的游戏内容的信息 */
    SC_JOIN_TABLE: "SC_JOIN_TABLE",

    /**加桌        玩家进桌了 */
    SC_JOIN_GAME: "SC_JOIN_GAME",

    /**   玩家进桌了 准备状态 */
    SC_PREPARE: "SC_PREPARE",

    /**玩家准备 */
    CS_GAME_READY: "CS_GAME_READY",

    /**放炮罚继续游戏 */
    CS_NEXT: "CS_NEXT",

    /**玩家准备 */
    SC_GAME_READY: "SC_GAME_READY",
    SC_NEXT: "SC_NEXT",

    /**玩家在线状态改变 */
    SC_CHANGE_STATUS: "SC_CHANGE_STATUS",


    /**游戏开始数据包   直接发牌过去了   庄家:bankId 当前局数: 玩家配置 : 手牌 */
    SC_GAME_INIT: "SC_GAME_INIT",

    /**显示打出的牌 */
    SC_SHOW_CARD: "SC_SHOW_CARD",

    /**手牌    id:   card: */
    SC_PASS_CARD: "SC_PASS_CARD", 

    /**玩家出牌 */
    SC_PLAY_CARD: "SC_PLAY_CARD",
    /**玩家出牌 */
    CS_PLAY_CARD: "CS_PLAY_CARD", 

    /**玩家 取消 托管 */
    SC_CANCEL_AUTO: "SC_CANCEL_AUTO",
    
    /**玩家 取消 托管 */
    CS_CANCEL_AUTO: "CS_CANCEL_AUTO",
    
    /**玩家 开始 托管 */
    SC_START_AUTO: "SC_START_AUTO",
    
    /**玩家 开始 托管 */
    CS_START_AUTO: "CS_START_AUTO",

    /**同步手牌 */
    SC_SYNC_HANDS: "SC_SYNC_HANDS",
    /**显示服务器提示牌 */
    SC_TIPS: "SC_TIPS",

    SC_SHOW_HOST: "SC_SHOW_HOST",
    SC_SCORE: "SC_SCORE",
    SC_FINISH: "SC_FINISH",
    SC_PROGRESS: "SC_PROGRESS",
    CS_PROGRESS: "CS_PROGRESS",
    SC_GAME_VOTE: "SC_GAME_VOTE",
    CS_GAME_VOTE: "CS_GAME_VOTE",
    CS_GAME_CHAT: "CS_GAME_CHAT",
    SC_GAME_CHAT: "SC_GAME_CHAT",
    SC_PLAYER_LEAVE: "SC_PLAYER_LEAVE",
    CS_PLAYER_LEAVE: "CS_PLAYER_LEAVE",
    SC_ROUND_SUMMARY: "SC_ROUND_SUMMARY",
    SC_GAME_SUMMARY: "SC_GAME_SUMMARY",
    SC_RECONNECT: "SC_RECONNECT",
    SC_RECORD: "SC_RECORD",
    SC_CUTE: "SC_CUTE",
    CS_CUTE: "CS_CUTE",
    SC_SYSTEM_NOTICE: "SC_SYSTEM_NOTICE",
    //mJ
    SC_DEAD: "SC_DEAD",
    SC_GET_CARD: "SC_GET_CARD", //手牌    id:   card:
    CS_GET_CARD: "CS_GET_CARD", //手牌    id:   card:
    SC_OUT_CARD: "SC_OUT_CARD", //出牌    id:   card:
    CS_OUT_CARD: "CS_OUT_CARD", //玩家出牌  card
    SC_QUEST: "SC_QUEST", //徇问是否吃碰等情    id:   catogroy:   碰 杠 胡 听
    SC_QIANGGANG: "SC_QIANGGANG",// 询问是否抢杠胡 card: idx:
    CS_QIANGGANG: "CS_QIANGGANG",//pass: "pass", hu:"hu" 回答
    CS_ANSWER: "CS_ANSWER", //回答  catogroy
    SC_GAME_DRAW: "SC_GAME_DRAW",
    SC_HAIDI: "SC_HAIDI",
    SC_ACTION: "SC_ACTION",
    SC_ACTIONS: "SC_ACTIONS",
    SC_ALERT: 'SC_ALERT',

    SC_SHOW_DECK: "SC_SHOW_DECK",
    CS_SHOW_DECK: "CS_SHOW_DECK",
    SC_QUICK_FINISH: "SC_QUICK_FINISH",
    CS_QUICK_FINISH: "CS_QUICK_FINISH",

    /**解散 */
    SC_DISBAND:'SC_DISBAND',
    CS_DISBAND:'CS_DISBAND',


    SC_SHOW_HANDS: "SC_SHOW_HANDS",

    SC_LOCATION: 'SC_LOCATION',
    CS_LOCATION: 'CS_LOCATION',

    SC_PIAO: 'SC_PIAO',
    SC_BET: 'SC_BET',
    CS_PIAO: 'CS_PIAO',

    SC_BAO: "SC_BAO",
    CS_BAO: "CS_BAO",

    SC_CALL: "SC_CALL",
    CS_CALL: "CS_CALL",

    SC_MASTER: "SC_MASTER"
};
