/**游戏配置 */
export class GameConfig {
    /**游戏类型 */
    static GameType = {
        /**双人跑得快 */
        PDK_SOLO: "PDK_SOLO",
        /**跑得快 */
        PDK: "PDK",
        /**新化字牌 */
        XHZP: "XHZP",
        XHZP_SOLO: "XHZP_SOLO",

        /**娄底字牌 */
        LDZP: "LDZP",
        LDZP_SOLO: "LDZP_SOLO",

        /**新化炸弹 */
        XHZD: "XHZD",
        /**双人红中麻将 */
        HZMJ_SOLO: "HZMJ_SOLO",
        /**红中麻将 */
        HZMJ: "HZMJ",
        /**双人海南麻将 */
        HNMJ_SOLO: "HNMJ_SOLO",
        /**海南麻将 */
        HNMJ: "HNMJ",
        /**新海南麻将 */
        LGMJ: "LGMJ",

    };
    /**游戏名字 */
    static GameName = {
        "HALL": "集合大厅",
        "PDK_SOLO": "跑得快",
        "PDK_SOLO_CLAN": "跑得快",
        "PDK": "跑得快",
        "PDK_CLAN": "跑得快",
        "XHZP": "放炮罚",
        "XHZP_CLAN": "放炮罚",
        "XHZP_SOLO": "放炮罚",
        "XHZP_SOLO_CLAN": "放炮罚",
        "XHZD": "新化炸弹",
        "XHZD_CLAN": "新化炸弹",
        "LDZP": "放炮罚",
        "LDZP_CLAN": "放炮罚",
        "LDZP_SOLO": "放炮罚",
        "LDZP_SOLO_CLAN": "放炮罚",
        "HZMJ_SOLO": "红中麻将",
        "HZMJ": "红中麻将",
        "HNMJ_SOLO": "双人海南麻将",
        "HNMJ": "海南麻将",
        "LGMJ_SOLO": "双人新海南麻将",
        "LGMJ": "新海南麻将"
    }
    /**游戏托管提示 */
    static GameAutoTips = {
        "PDK_SOLO": "60秒内不出牌，系统将自动进入托管状态。\n规则: 默认跟打，如出头，则由大到小，单张依次出牌。",
        "PDK": "60秒内不出牌，系统将自动进入托管状态。\n规则: 默认跟打，如出头，则由大到小，单张依次出牌。",
        "XHZP": "60秒内不出牌，系统将自动进入托管状态。\n规则: 不会进行吃、碰、胡，如必须出牌，则由小到大开始出牌。",
        "XHZP_SOLO": "60秒内不出牌，系统将自动进入托管状态。\n规则: 不会进行吃、碰、胡，如必须出牌，则由小到大开始出牌。",
        "XHZD": "90秒内不出牌，系统将自动进入托管状态。\n规则: 由小到大，单张依次出牌，其他玩家出牌时自动选择要不起。",
        "LDZP": "60秒内不出牌，系统将自动进入托管状态。\n规则: 不会进行吃、碰、胡，如必须出牌，则由小到大开始出牌。",
        "LDZP_SOLO": "60秒内不出牌，系统将自动进入托管状态。\n规则: 不会进行吃、碰、胡，如必须出牌，则由小到大开始出牌。",
    }
    /**游戏房间类型 */
    static GameRoomLevel = ["初级场", "中级场", "高级场", "大师场"]
    /**游戏事件名 */
    static GameEventNames = {

        /**----------------桌子------------------ */
        /**游戏类型切换 */
        GAME_TYPE_CHANGE: "GAME_TYPE_CHANGE",
        /**房间类型切换 */
        ROOM_TYPE_CHANGE: "ROOM_TYPE_CHANGE",
        /**房间类型按钮切换 */
        ROOM_TYPE_BTN_CHANGE: "ROOM_TYPE_BTN_CHANGE",
        /**更新公告 */
        UPDATE_CLUB_NOTICE: "UPDATE_CLUB_NOTICE",

        /**机器人 选择房型 */
        ROBOT_SELECT_ROOM: 'ROBOT_SELECT_ROOM',

        /**刷新举报列表 */
        UPDATE_REPORT_LIST: 'UPDATE_REPORT_LIST',

        /**----------------公会------------------ */
        /**更新大厅公会 */
        UPDATE_HALL_CLUB: 'UPDATE_HALL_CLUB',
        /**公会修改 */
        CLUB_CHANGE: 'CLUB_CHANGE',
        /**选择公会 */
        CHOOSE_CLUB: 'CHOOSE_CLUB',
        /**公会房间修改 */
        CLUB_ROOM_CHANGE: 'CLUB_ROOM_CHANGE',
        /**公会房间销毁 */
        CLUB_ROOM_DESTROY: 'CLUB_ROOM_DESTROY',
        /**公会数据修改 */
        CLUB_DATA_CHANGE: 'CLUB_DATA_CHANGE',
        /**查看下属合伙人 */
        PROXY_LIST_UPDATE: 'PROXY_LIST_UPDATE',
        /**合伙人等级修改 */
        PROXY_LEVEL_UPDATE: 'PROXY_LEVEL_UPDATE',
        /**添加合伙人事件 */
        ADD_PROXY: 'ADD_PROXY',
        /**添加玩家事件 */
        ADD_USER: 'ADD_USER',

        /**创建房型 选择游戏 */
        CREATE_ROOM_CHOOSE_GAME: 'CREATE_ROOM_CHOOSE_GAME',
        /**创建房型 选择人数 */
        CREATE_ROOM_CHOOSE_PERSON: 'CREATE_ROOM_CHOOSE_PERSON',
        /**创建房型 选择规则 */
        CREATE_ROOM_CHOOSE_RULE: 'CREATE_ROOM_CHOOSE_RULE',

        /**玩家数据更新 */
        PLAYER_DATA_UPDATE: "PLAYER_DATA_UPDATE",
        /** 字牌换桌*/
        ZP_CHANGE_TABLE: "ZP_CHANGE_TABLE",
        /** 游戏内重新连接*/
        GAME_RECONNECT: "GAME_RECONNECT",
        /** 回放返回大厅*/
        REPLAY_BACK_HALL: "REPLAY_BACK_HALL",
        /** 回放继续*/
        REPLAY_CONTINUE: "REPLAY_CONTINUE",
        /** 回放显示大结算*/
        REPLAY_SHOW_GAME_SUMMARY: "REPLAY_SHOW_GAME_SUMMARY",
        /**更新牌桌背景 */
        UPDATE_TABLE_BG: "UPDATE_TABLE_BG",
        /**更新金币UI */
        UPDATE_WALLET: "UPDATE_WALLET",
        /**更新金币数据 */
        UPDATE_WALLET_DATA: "UPDATE_WALLET_DATA",
        /**更新理财列表 */
        UPDATE_FINANCE_LIST: 'UPDATE_FINANCE_LIST',
        /**选择筛选条件 */
        SELECT_TAG_HISTORY: 'SELECT_TAG_HISTORY',
        /**取消筛选条件 */
        CANCEL_TAG_HISTORY: 'CANCEL_TAG_HISTORY',

        /**刷新代理邀请玩家列表 */
        UPDATE_INVITE_LIST: 'UPDATE_INVITE_LIST',

        /**抽奖券更新 */
        UPDATE_TICKET_UI: "UPDATE_TICKET_UI",
        /**判断弹窗提示 */
        JUDGE_TIPS: "JUDGE_TIPS",
        /**-------新化炸弹----------- */
        /**结算返回大厅 */
        ZD_BACK_HALL: "ZD_BACK_HALL",
        /**继续游戏 */
        ZD_CONTINUE_GAME: "ZD_CONTINUE_GAME",
        /**换桌继续 */
        ZD_CHANGE_TABLE: "ZD_CHANGE_TABLE",

        /**----------------跑得快------------------ */
        /**跑得快换桌 */
        PDK_CHANGE_TABLE: "PDK_CHANGE_TABLE",
        /**跑得快返回大厅 */
        PDK_BACK_HALL: "PDK_BACK_HALL",
        /**跑得快继续游戏 */
        PDK_CONTINUE_GAME: "PDK_CONTINUE_GAME",
        /**跑得快洗牌继续游戏 */
        PDK_SHUFFLE_CARD: "PDK_SHUFFLE_CARD",

        /**----------------放炮罚------------------ */
        /**放炮罚洗牌继续游戏 */
        LDZP_SHUFFLE_CARD: "LDZP_SHUFFLE_CARD",

        /**----------------红中麻将------------------ */
        /**红中麻将换桌 */
        HZMJ_CHANGE_TABLE: "HZMJ_CHANGE_TABLE",
        /**红中麻将返回大厅 */
        HZMJ_BACK_HALL: "HZMJ_BACK_HALL",
        /**红中麻将继续游戏 */
        HZMJ_CONTINUE_GAME: "HZMJ_CONTINUE_GAME",
        /**----------------海南麻将------------------ */
        /**海南麻将 出牌时显示相同牌 */
        HNMJ_SHOW_SAME_CARD: "HNMJ_SHOW_SAME_CARD",
        /**海南麻将 重置相同牌 */
        HNMJ_RESET_SAME_CARD: "HNMJ_RESET_SAME_CARD",
        /**海南麻将 查胡 */
        HNMJ_CHECK_HU: "HNMJ_CHECK_HU",
        /**海南麻将 隐藏听牌 */
        HNMJ_HIDE_TING: "HNMJ_HIDE_TING",
        /**海南麻将 quest回调 */
        HNMJ_QUEST_CALL: "HNMJ_QUEST_CALL",

        /**海南麻将  */
        HNMJ_GAME_SUMMARY: "HNMJ_GAME_SUMMARY",


        /**回放返回大厅 */
        REPLAY_BACK_HALL: 'REPLAY_BACK_HALL',

        /**--------------------------市场交易------------------------------ */
        /**选择markets信息 */
        MARKETS_SELECT: "MARKETS_SELECT",
        /**选择trades信息 */
        TRADES_SELECT: "TRADES_SELECT",
        /**显示交易提醒 */
        SHOW_TRADE_TIPS: "SHOW_TRADE_TIPS",
        /**隐藏交易提醒 */
        HIDE_TRADE_TIPS: "HIDE_TRADE_TIPS",
        /**刷新出售信息 */
        REFRESH_SELL_INFO: "REFRESH_SELL_INFO",


        /**--------------------------代理管理------------------------------ */
        /**选择直属用户信息 */
        PROXY_SELECT_USER: "PROXY_SELECT_USER",
        /**代理分成信息 */
        PROXY_PROFIT_DATA: "PROXY_PROFIT_DATA",
        /**修改代理分成 */
        PROXY_CHANGE_PROFIT: "PROXY_CHANGE_PROFIT",
        /**刷新下级代理数据 */
        PROXY_UPDATE_CHILD: "PROXY_UPDATE_CHILD",
        /**刷新直属用户数据 */
        PROXY_UPDATE_USER: "PROXY_UPDATE_USER",
        /**刷新所有直属用户数据 */
        PROXY_UPDATE_ALL_USER: "PROXY_UPDATE_ALL_USER",
        /**刷新所有下级代理数据 */
        PROXY_UPDATE_ALL_CHILD: "PROXY_UPDATE_ALL_CHILD",
        /**刷新代理数据 */
        PROXY_UPDATE_DATA: "PROXY_UPDATE_DATA",

        /**修改代理机器人数据 */
        PROXY_CHANGE_ROBOT: "PROXY_CHANGE_ROBOT",

        /**admin选择用户信息 */
        ADMIN_SELECT_USER: "ADMIN_SELECT_USER",

        /**切换大联盟 刷新数据 */
        EXCHANGE_LEAGUE_UPDATEDATA: 'EXCHANGE_LEAGUE_UPDATEDATA',

        /**显示代理提醒 */
        PROXY_SHOW_NOTICE: "PROXY_SHOW_NOTICE",

        /**黑名单改变状态 */
        PUNISH_CHANGE_STATUS: "PUNISH_CHANGE_STATUS",
        /**--------------------------GOEasy------------------------------ */

        /**刷新金币 */
        GOEASY_UPDATE_GOLD: "GOEASY_UPDATE_GOLD",
        /**邮件更新 */
        GOEASY_UPDATE_MAIL: "GOEASY_UPDATE_MAIL",
        /**交易更新 */
        GOEASY_UPDATE_TRADE: "GOEASY_UPDATE_TRADE",
        /**交易私聊更新 */
        GOEASY_UPDATE_PRIVATE: "GOEASY_UPDATE_PRIVATE",
        /**客服 */
        GOEASY_UPDATE_SERVICE: "GOEASY_UPDATE_SERVICE",

        /**--------------------------活动 ------------------------------ */

        /**刷新活动进程 */
        UPDATE_ACTIVE_PROCESS: "UPDATE_ACTIVE_PROCESS",

        /**问卷调查选择答案 */
        QUESTION_SELECT_ANSWER: "QUESTION_SELECT_ANSWER",


    }
    // static ServerUrl = "https://game.ovz43x.com/";//正式服
    static ServerUrl = '';//正式服
    /**冒的办法用的请求 */
    static DefaultUrl = "http://pku.qzhagy.com/newconfig/release_first.json";

    static TestServerUrl = "http://161.117.57.34:8000/";
    // static TestServerUrl = "http://47.241.56.123:8000/";

    /**代理服务端接口前缀 */
    static ProxyServer = "admin";
    /**服务器事件接口名 */
    static ServerEventName = {
        /**获取公钥 */
        GetPublicKey: "global/key",
        /**获取用户信息 */
        // GetPlayerInfo: "info",
        GetPlayerInfo: "game/info",
        /**修改用户信息 */
        UpdatePlayerById: "game/update",
        /**获取房间信息 */
        GetGameType: "game/clubs",
        /**进入游戏房间 */
        JoinClubGame: "game/joinGame",
        /**获取游戏配置信息 */
        GetGameInfo: "game/global",
        /**提现申请 */
        GetCash: "clientWithdraw/gameWithdraw",
        /**注册 */
        Register: "game/register",
        /**登录 */
        UserLogin: "game/login",
        /**验证码登录 */
        UserCodeLogin: "game/login",
        /**获取验证码 */
        SendSmsCode: "game/sms",
        /**用户登录验证码 */
        LoginUserCode: "global/sms/login/user",
        /**代理登录验证码 */
        LoginProxyCode: "global/sms/login/proxy",
        /**用户绑定手机验证码 */
        BindUserCode: "global/sms/bind/user",
        /**用户更新账号信息验证码 */
        OTCUserCode: "global/sms/update/otc",
        /**用户更新交易密码验证码 */
        OTCUserPwdCode: "global/sms/security/user",
        /**提现验证码 */
        CashSmsCode: "game/clientWithdraw/sendSms",
        /**绑定手机号 */
        BindPhone: "game/bind",
        /**修改密码 */
        ChangePassword: "game/password",
        /**获取战绩 */
        GetHistory: "game/history",
        /**积分兑换 */
        Exchange: "game/exchange",
        /**桌子数据 */
        Tables: "game/tables",
        /**所有桌子数据 */
        AllTables: "game/hall",
        /**上传头像 */
        Upload: "game/upload",
        /**微信登录 */
        WxLogin: "game/oauth",
        /**刷新匹配 */
        MatchInfo: "game/pollingMatch",
        /**开始匹配 */
        JoinMatch: "game/joinMatch",
        /**取消匹配 */
        CancelMatch: "game/cancelMatch",
        /**同意匹配 */
        AcceptMatch: "game/acceptMatch",
        /**举报玩家  前置*/
        PreReportUser: "game/prereport",

        /**GoEasy OTP */
        OTP: "game/otp",
        /**更新金币 */
        UpdateWallet: "game/wallet",

        /**抽奖接口 */
        Lottery: "game/raffle",
        /**抽奖记录 */
        LotteryList: "game/getRaffleLog",
        /**抽奖数据 */
        LotteryData: "game/getRaffle",
        /**任务进程 */
        TaskProgress: "game/task/progress",
        /**任务信息 */
        TaskInfo: "game/task/info",
        /**任务领取 */
        TaskReceive: "game/task/receive",
        /**转账积分 */
        GiveAwayScore: "game/wallet/giveAway",



        /**代理登录 */
        ProxyLogin: this.ProxyServer + "/login",
        /**代理信息 */
        ProxyInfo: this.ProxyServer + "/info",
        /**代理直属用户 */
        ProxyUsers: this.ProxyServer + "/users",
        /**下级代理 */
        ProxyChildren: this.ProxyServer + "/proxies",
        /**代理分成 */
        ProxyProfit: this.ProxyServer + "/profits",
        /**修改代理分成 */
        ProxyChangeProfit: this.ProxyServer + "/profit",
        /**添加代理 */
        ProxyAdd: this.ProxyServer + "/add",
        /**代理上下分 */
        ProxyChangeWallet: this.ProxyServer + "/proxy",
        /**开启代理亲友圈 */
        ProxyOpenClub: this.ProxyServer + "/clan/open",
        /**用户上下分 */
        ProxyUserWallet: this.ProxyServer + "/user",
        /**历史数据 */
        ProxyHistory: this.ProxyServer + "/logs",
        /**修改代理信息 */
        ProxyUpdate: this.ProxyServer + "/update",
        /**用户统计 */
        ProxyTotalUser: this.ProxyServer + "/stat/users",
        /**对局统计 */
        ProxyTotalGame: this.ProxyServer + "/stat/games",
        /**充值统计 */
        ProxyTotalRecharge: this.ProxyServer + "/stat/recharge",
        /**收益统计 */
        ProxyTotalEarn: this.ProxyServer + "/stat/summary",
        /**机器人 */
        ProxyRobot: this.ProxyServer + "/robot",
        /**下级代理详情 */
        ProxyDetail: this.ProxyServer + "/detail",
        /**修改代理 */
        ProxyChange: this.ProxyServer + "/change",

        /**获取黑名单 */
        ProxyList: this.ProxyServer + "/report/list",
        /**更新黑名单玩家状态 */
        ProxyListUpdate: this.ProxyServer + "/report/update",
        /**黑名单玩家详情 */
        ProxyPunishDetail: this.ProxyServer + "/report/detail",
        /**黑名单玩家处理 */
        ProxyPunish: this.ProxyServer + "/report/punish",

        /**admin 修改玩家积分*/
        ProxyAdminChange: this.ProxyServer + "/report/process",
        /**admin 邮件*/
        ProxyMail: this.ProxyServer + "/mail",

        /**admin 封禁*/
        ProxyBan: this.ProxyServer + "/ban",
        /**admin 封禁代理*/
        ProxyBanProxy: this.ProxyServer + "/ban/proxy",
        /**admin 关入小黑屋*/
        ProxyHouseSet: this.ProxyServer + "/blackHouse/set",
        /**admin 放出小黑屋*/
        ProxyHouseDel: this.ProxyServer + "/blackHouse/del",

        /**admin Api*/
        ProxyApi: this.ProxyServer + "/api",
        /**admin 玩家互斥*/
        ProxyBlackList: this.ProxyServer + "/blackList",
        /**admin 重置密码*/
        ProxyResetPwd: this.ProxyServer + "/resetPwd",
        /**admin 绑定手机*/
        ProxyPhoneChanhe: this.ProxyServer + "/phone/change",
        /**admin 开关洗牌分*/
        ProxyChangeShuffle: this.ProxyServer + "/proxy/shuffle",



        /**代理活动 */
        ProxyActive: "global/proxy/profitRank",
        /**代理活动上周排名 */
        ProxyActiveRank: "global/proxy/profitRank/reward/lastWeek",
        /**代理奖励积分兑换 */
        ProxyAdminReward: this.ProxyServer + "/reward",



        /** 卖信息*/
        OTCInfo: "otc/info",
        /** 更新卖信息*/
        OTCMarket: "otc/market",
        /** 订单列表*/
        OTCMarkets: "otc/markets",

        /**卖方取消单 */
        OTCCancelMarket: "otc/cancelMarket",
        /**卖方放行 */
        OTCProcessTrade: "otc/finishTrade",


        /** 买 */
        OTCCreateTrade: "otc/createTrade",
        /**买方取消单 */
        OTCCancelTrade: "otc/cancelTrade",
        /**买方已付款 */
        OTCConfirmTrade: "otc/processTrade",

        /**申诉 */
        OTCReportTrade: "otc/reportTrade",
        /**协议取消 */
        OTCPleaseCancel: "otc/releaseTrade",
        /**协议放行 */
        OTCPleaseProcess: "otc/confirmTrade",

        /**收款信息 */
        OTCPayInfo: "otc/payInfo",

        /**qrcode上传 */
        OTCQrCode: "otc/uploadQRCode",
        /**上传receipt */
        OTCReceipt: "otc/uploadReceipt",


        /**卖方列表 */
        // OTCMarkets: "otc/markets",
        /**买方列表 */
        OTCTrades: "otc/trades",
        /**买方单个 列表 */
        OTCTrade: "otc/trade",



        /** 修改支付信息*/
        OTCUpdate: "otc/update",

        /** 修改交易密码*/
        OTCSecurity: "otc/security",

        /**admin查看用户战绩 */
        ProxyUserHistory: this.ProxyServer + "/user/gameLogs",
        // /** 市场*/
        // OTCMarket:"otc/markets",
        // /** 锁定订单*/
        // OTCLock:"otc/lock",
        // /** 提交订单*/
        // OTCConfirm:"otc/confirm",
        // /** 放行订单*/
        // OTCProcess:"otc/process",
        // /** 我的订单*/
        // OTCHistory:"otc/history",
        /**admin 查代理直属用户 */
        ProxySearchUser: this.ProxyServer + "/proxy/listUser",
        /**admin 查代理下级所有代理 */
        ProxySearchProxy: this.ProxyServer + "/proxy/listProxy",
        /**代理钱包变动 */
        ProxyWalletHistory: this.ProxyServer + "/wallet/history",



        /**流水活动排名 */
        ActiveFlowRank: "game/flow/rank",

        /**查询用户信息 (转账) */
        SearchUserInfo: 'game/getUser',
        
        /**更换用户ID  */
        ChangeUserID: 'game/swapWechatId',


        /**客服介入订单*/
        OTCServiceTrade: 'otc/serviceTrade',
        /**admin订单列表*/
        OTCAdminTradeList: this.ProxyServer + '/trade/list',
        /**admin订单详情*/
        OTCAdminTradeDetail: this.ProxyServer + '/trade/detail',
        /**admin订单判决*/
        OTCAdminTradeJudge: this.ProxyServer + '/trade/judge',
        /**admin封禁卖分*/
        AdminBanMarket: this.ProxyServer + '/ban/market',
        /**admin封禁买*/
        AdminBanBuy: this.ProxyServer + '/ban/buy',
        /**同意或拒绝匹配*/
        MatchOperate: 'game/match/operate',

        /**admin设置信用分 */
        AdminSetCredit: this.ProxyServer + '/setCredit',

        /**admin设置信用分 */
        AdminGetCredit: this.ProxyServer + '/getCredit',

        /**打点日志 */
        LogsClient: 'game/logs/client',
        /**玩家历史记录 */
        UserHistoryLogs: 'game/wallet/logs',
        /**admin历史记录 */
        AdminHistoryLogs: this.ProxyServer + '/user/wallet',

        /**代理  买 */
        POTCCreateTrade: "proxyOtc/createTrade",
        /**代理 订单详情 */
        POTCTrade: "proxyOtc/trade",
        /**代理卖信息*/
        POTCInfo: "proxyOtc/info",
        /**代理更新账号信息验证码 */
        OTCProxyCode: "global/sms/update/proxyotc",
        /**代理放行验证码 */
        OTCProxyFinishtrade: "global/sms/proxy/finishtrade",
        /**代理上架验证码 */
        OTCProxyMarket: "global/sms/proxy/market",
        /**代理 修改支付信息*/
        POTCUpdate: "proxyOtc/update",
        /** 代理更新卖信息*/
        POTCMarket: "proxyOtc/market",
        /**代理 订单记录列表 */
        POTCTrades: "proxyOtc/trades",

        /**申诉 */
        POTCReportTrade: "proxyOtc/reportTrade",
        /**协议取消 */
        POTCPleaseCancel: "proxyOtc/releaseTrade",
        /**协议放行 */
        POTCPleaseProcess: "proxyOtc/confirmTrade",

        /**卖方取消单 */
        POTCCancelMarket: "proxyOtc/cancelMarket",
        /**卖方放行 */
        POTCProcessTrade: "proxyOtc/finishTrade",


        /**买方取消单 */
        POTCCancelTrade: "proxyOtc/cancelTrade",
        /**买方已付款 */
        POTCConfirmTrade: "proxyOtc/processTrade",
        /**客服介入订单*/
        POTCServiceTrade: 'proxyOtc/serviceTrade',

        /**查下理财记录 */
        SearchFinanceRecord: 'game/fund/list',
        /**购买理财 */
        BuyFinance: 'game/fund/buy',

        /**出售理财 */
        SellFinance: 'game/fund/sell',
        /**投注信息 */
        BettingInfo: 'game/lottery/info',
        /**投注信息 */
        BettingInfo: 'game/lottery/info',
        /**下注 */
        BettingBuy: 'game/lottery/buy',
        /**投注列表 */
        BettingList: 'game/lottery/list',
        /**投注往期列表 */
        Bettinghistory: 'game/lottery/history',
        /**投注配置 */
        BetConfig: 'game/lottery/config',
        /**下级可投注额详情 */
        BetSubDetail: 'game/lottery/subDetail',
        /**投注列表 */
        ProxyActivity: this.ProxyServer + '/activity',
        /**投注列表 */
        ProxyActivityReward: this.ProxyServer + '/activity/reward',
        /**字牌活动排行榜 */
        ProxyZPRank: this.ProxyServer + '/rank',
        /**代理额度调整 */
        ProxyCreditUpdate: this.ProxyServer + '/credit/update',
        /**代理额度 */
        ProxyCredit: this.ProxyServer + '/credit',
        /**代理分润明细 */
        ProxyProfitDetail: this.ProxyServer + '/profit/detail',
        /**玩家冻结资金详情 */
        UserFreezeList: 'game/freeze/logs',
        /**问卷调查 */
        Questionnaire: 'game/questionnaire',

        /**代理提交邀请玩家ID */
        ProxyInviteUser: this.ProxyServer + '/inviteUser',
        /**玩家回复代理邀请 */
        ResponseInvite: 'game/responseInvite',
        /**玩家离开代理 */
        ExitClub: 'game/exitClub',
        /**玩家离开代理 记录 */
        InviteRecord: this.ProxyServer + '/inviteRecord',
        // -----------------------海南麻将-----------------------------------------
        /**玩家信息*/
        UserInfo: 'game/userInfo',
        /**玩家基础信息*/
        UserBaseInfo: 'game/baseInfo',
        /**玩家业绩日志*/
        UserPerformLog: 'game/performLog',
        /**玩家体力日志*/
        UserScoreLog: 'game/scoreLog',
        /**公会列表*/
        ClubList: 'game/clubs',
        /**公会信息*/
        ClubInfo: 'game/clubInfo',
        /**创建公会*/
        CreateClub: 'game/createClub',
        /**创建联盟*/
        CreateLeague: 'game/createLeague',
        /**邀请玩家加入公会*/
        Invite: 'game/invite',
        /**公会玩家列表*/
        UserList: 'game/subUsers',//'game/userList',

        /**公会上下分 */
        UpdateScore: 'game/updateScore',
        /**玩家回复邀请 */
        ProcessInvite: 'game/processInvite',
        /**更新公会公告 */
        UpdateClubNotice: 'game/updateClub',
        /**公会保险箱 */
        UpdateClubBank: 'game/updateBank',
        /**合伙人列表 */
        ProxiesList: 'game/proxies',
        /**添加合伙人 */
        AddProxy: 'game/addProxy',
        /**修改合伙人等级 */
        UpdateLevel: 'game/updateLevel',
        /**战绩 */
        ClubLogs: 'game/logs',
        /**发送短信 */
        SendCode: 'global/sms/login',
        /**提取体力 */
        DrawReward: 'game/drawReward',

        /**体力明细表 */
        RewardDetail: 'game/rewardDetail',
        /**修改用户权限 */
        UpdateStatus: 'game/updateStatus',
        /**修改用户权限 */
        AllRooms: 'game/rooms',
        /**体力汇总 */
        ScoreSummary: 'game/scoreSummary',
        /**房卡汇总 */
        CardSummary: 'game/cardSummary',
        /**设置管理员 */
        Promote: 'game/promote',
        /**整线信息 */
        GroupInfo: 'game/groupInfo',
        /**保险柜日志 */
        BankLog: 'game/bankLog',
        /**奖励日志 */
        RewardLog: 'game/rewardLog',
        /**抽水日志 */
        ShuffleLog: 'game/shuffleLog',
        /**奖励汇总 */
        RewardSummary: 'game/rewardSummary',
        /**调配合伙人 */
        ChangeProxyParent: 'club/updateProxyParent',
        /**调配玩家 */
        ChangeProxy: 'game/changeProxy',
        /**会长上分 */
        AdminWallet: 'game/admin/recharge',
        /**脱离公会 */
        QuitClub: 'game/quitClub',
        /**会长解散桌子 */
        DestroyTable: 'game/destroyTable',
        /**admin 查看公会列表 */
        AdminClubList: 'game/admin/clubs',
        /**admin 查看公会详情 */
        AdminClubInfo: 'game/admin/clubInfo',
        /**admin 查看玩家列表 */
        AdminUserList: 'game/admin/users',
        /**admin 查看玩家详情 */
        AdminUserInfo: 'game/admin/userInfo',
        /** 创建房型 */
        CreateRoom: 'game/createRoom',
        /** 删除房型 */
        DeleteRoom: 'game/deleteRoom',
        /** 每日排行榜 */
        DailyRank: 'game/dailyRank',
        /** 修改信用限制 */
        UpdateLimit: 'game/updateLimit',
        /** 手动解除限制 */
        LiftLimit: 'game/liftLimit',
        /** 假桌子 */
        Robot: 'game/robot',
        /** 举报名单 */
        ReportLogs: 'game/reportLogs',

        /** 举报细节 */
        ReportDetail: 'game/reportDetail',
        /** 处理赔偿 */
        HandleReport: 'game/handleReport',
        /** 举报名单 */
        FinishReport: 'game/finishReport',
        /**举报玩家 */
        ReportUser: "game/report",
        /**取消合伙人 */
        CancelProxy: "game/cancelProxy",
        /**惩罚记录 */
        ReportHandleLogs: "game/reportHandleLogs",
        /**恶意举报 */
        SetMalicious: "game/setMalicious",

        /**公会玩家输赢列表*/
        UserScore: 'club/gameResults',//'game/userList',

        /**联盟活动*/
        ClubActive: 'game/task',
        /**获取联盟活动*/
        GetTaskReward: 'game/getTaskReward',
    }

    static ErrorCode = {


    }
    /**游戏配置信息 */
    static GameInfo = {}
    /**桌子类型 */
    static TableType = {
        CUSTOM: '普通桌',
        MATCH: '匹配桌',
        PRIVATE: '私密桌'
    }

    /**游戏状态 */
    static GameStatus = {
        /**等待游戏 */
        WAIT: "WAIT",
        /**是否可以准备 */
        PREPARE: "PREPARE",
        CUTE: "CUTE",
        /**游戏开始 */
        START: "START",
        /**出牌 */
        PLAY: "PLAY",
        /**询问吃碰 */
        QUEST: "QUEST",
        /**牌已出完 */
        FINISH: "FINISH",
        /**游戏结束 */
        SUMMARY: "SUMMARY",
        /**小局结束 */
        CHAPTER: "CHAPTER",
        /**大局结束 */
        DESTORY: "DESTORY",
        /**包庄 */
        BAO: "BAO",
        /**选飘 */
        PIAO: "PIAO",
        /**包庄 */
        CALL: 'CALL'
    };

    /**海南麻将 行为 */
    static GameAction = {
        /**过 */
        GUO: 'GUO',
        /**碰 */
        PONG: 'PONG',
        /**吃 */
        CHOW: 'CHOW',
        /**暗杠 四张牌全盖 */
        KONG: 'KONG',
        /**明杠1 */
        ZHI: 'ZHI',
        /**补杠 2*/
        BU: 'BU',
        /**补杠 2*/
        SHOW: 'SHOW',
        /** 补花*/
        FLOWER: 'FLOWER',
        /** 补花多次*/
        FLOWER_MULTI: 'FLOWER_MULTI',
        /**胡牌 */
        WIN: 'WIN',

        /**抓牌 */
        DRAW: 'DRAW',
        DRAW_MULTI: 'DRAW_MULTI',
        /**出牌 */
        PLAY: 'PLAY',

        /**包庄 */
        CALL: 'CALL',

        /**过牌 */
        PASS: 'PASS',
        /**打完 */
        DONE: 'DONE',
        /**炸弹飞分 */
        CREDIT: 'CREDIT',
        /**炸弹海底 */
        PLUS: 'PLUS',
        /**报单 */
        ALERT: 'ALERT',
    }


    /**匹配状态 */
    static MatchStatus = {
        /**正在匹配中 */
        MATCHING: "MATCHING",
        /**匹配成功 */
        SUCCESS: "SUCCESS",
    }

    /**弹窗名--路径 */
    static pop = {
        /**提现 */
        CashPop: "Main/Prefab/CashPop",
        /**登陆 */
        LoginPop: "Main/Prefab/LoginPop",
        /**设置 */
        SettingPop: "Main/Prefab/SettingPop",
        /**活动 */
        ActivePop: "Main/Prefab/ActivePop",
        /**常见问题 */
        ProblemPop: "Main/Prefab/ProblemPop",
        /**规则 */
        RulePop: "Main/Prefab/RulePop",
        /**客服 */
        ServicePop: "Main/Prefab/ServicePop",
        /**个人信息 */
        InfoPop: "Main/Prefab/InfoPop",
        /**分享 */
        SharePop: "prefab/SharePop",

        /**房间大厅 */
        ClubPop: "Main/Prefab/ClubPop",
        /**改变手机密码 */
        ChangeDataPop: "Main/Prefab/ChangeDataPop",
        /**托管协议 */
        AutoTipsPop: "Main/Prefab/AutoTipsPop",
        /**邮箱*/
        MessagePop: "Main/Prefab/MessagePop",
        /**桌子*/
        TablePop: "Main/Prefab/TablePop",
        /**ZD GPS*/
        DistanceZDPop: "Main/Prefab/DistanceZDPop",
        /**市场 交易*/
        MarketPop: "Main/Prefab/MarketPop",
        /**代理管理*/
        ProxyManagePop: "Main/Prefab/ProxyManagePop",
        /**代理登录*/
        ProxyLoginPop: "Main/Prefab/ProxyLoginPop",
        /**代理修改信息*/
        ProxyDataPop: "Main/Prefab/ProxyDataPop",
        /**admin代理设置*/
        AdminSettingPop: "Main/Prefab/AdminSettingPop",
        /**匹配界面*/
        MatchPop: "Main/Prefab/MatchPop",
        /**举报窗口*/
        ReportPop: "Main/Prefab/ReportPop",
        /**交易所规则*/
        MarketRulePop: "Main/Prefab/MarketRulePop",
        /**上传receipt*/
        ConfirmReceiptPop: "Main/Prefab/ConfirmReceiptPop",
        /**修改交易密码*/
        UpdateTradePwd: "Main/Prefab/UpdateTradePwd",
        /**验证交易密码*/
        CheckTradePwd: "Main/Prefab/CheckTradePwd",
        /**每日任务活动*/
        CashActivePop: "Main/Prefab/CashActivePop",
        /**活动邀请*/
        ActiveSharePop: "Main/Prefab/ActiveSharePop",
        /**流水每日活动*/
        FlowActivePop: "Main/Prefab/FlowActivePop",
        /**转账积分*/
        GiveScorePop: "Main/Prefab/GiveScorePop",
        /**幸运用户活动*/
        LuckyActivePop: "Main/Prefab/LuckyActivePop",


        /**代理公告*/
        ProxyActivityPop: "Main/Prefab/ProxyActivityPop",
        /**玩家战绩界面*/
        AdminHistoryPop: "Main/Prefab/AdminHistoryPop",
        /**代理活动排行 */
        ProxyRankPop: "Main/Prefab/ProxyRankPop",
        /**系统提示 */
        NoticePop: "Main/Prefab/Notice",
        /**提示牌 */
        TipsCard: "GameBase/TipsCard",
        /**游戏内玩家信息 */
        PlayerInfo: "GameBase/PlayerInfo",
        /**游戏内设置*/
        GameSetting: "GameBase/preSet",

        TestPop: 'Main/Prefab/TestPop',
        /**游戏公告*/
        CommonActivePop: "prefab/CommonActivePop",
        /**玩家历史记录*/
        SettingHistoryPop: "prefab/HistoryPop",
        /**代理交易*/
        ProxyMarketPop: "prefab/ProxyMarketPop",
        /**战绩 */
        HistoryPop: "Main/Prefab/winHistory",
        /**理财 */
        ActiveCenterPop: "prefab/ActiveCenterPop",
        /**投注 */
        BettingPop: "prefab/BettingPop",
        /**代理活动 */
        ProxyActivePop: "prefab/ProxyActivePop",
        /**投注规则 */
        BettingList: "prefab/BettingList",
        /**d代理字牌排行榜 */
        ProxyZPRankPop: "prefab/ProxyZPRankPop",
        /**投注 */
        BetTipsPop: "prefab/BetTipsPop",
        /**代理分润细节 */
        ProxyProfitDetail: "prefab/ProxyProfitDetail",
        /**有奖专区 */
        RewardGameTable: "prefab/RewardGameTable",
        /**有奖专区 */
        QuestionPop: "prefab/QuestionPop",
        /**处理投诉 */
        AdminPunishPage: "prefab/AdminPunishPage",
        /**玩家冻结资金列表 */
        FreezeListPop: "prefab/FreezeListPop",

        /**MJ GPS*/
        DistanceMJPop: "prefab/DistanceMJPop",
        /**MJ规则弹窗*/
        MJRulePop: "prefab/MJRulePop",
        /**VIP规则说明*/
        VIPAdPop: "prefab/VIPAdPop",
        /**代理邀请玩家页面*/
        ProxyInviteUser: "prefab/ProxyInviteUser",
        /**玩家回复代理邀请*/
        InviteListPop: "prefab/InviteListPop",
        /**MJ规则弹窗*/
        MJGameSummary: "prefab/game/MJGameSummary",
        /**创建公会*/
        CreateClubPop: "prefab/CreateClubPop",
        /**我的公会列表*/
        ClubListPop: "prefab/ClubListPop",
        /**公会成员列表*/
        ClubUserListPop: "prefab/ClubUserListPop",
        /**换ID*/
        ChangeIDPop: "prefab/ChangeIDPop",
        /**公会成员输赢列表*/
        ChildScoreListPop: "prefab/ChildScoreListPop",
        /**公会公告*/
        ClubNoticePop: "prefab/ClubNoticePop",
        /**公会保险柜*/
        ClubBankPop: "prefab/ClubBankPop",
        /**数字输入*/
        Number: "prefab/Number",
        /**下属成员*/
        ChildUserListPop: "prefab/ChildUserListPop",
        /**合伙人管理*/
        ClubProxyListPop: "prefab/ClubProxyListPop",
        /**个人信息*/
        UserInfoPop: "prefab/UserInfoPop",
        /**战绩*/
        ClubHistoryListPop: "prefab/ClubHistoryListPop",
        /**战绩详情*/
        ClubHistoryDetailPop: "prefab/ClubHistoryDetailPop",
        /**体力汇总*/
        ClubScoreListPop: "prefab/ClubScoreListPop",
        /**钻石汇总*/
        ClubWalletListPop: "prefab/ClubWalletListPop",
        /**联盟活动*/
        ClubActivePop: "prefab/ClubActivePop",
        /**奖励界面*/
        ClubRewardPop: "prefab/ClubRewardPop",
        /**调配合伙人ID*/
        ChangeProxyPop: "prefab/ChangeProxyPop",
        /**调配玩家ID*/
        ChangeUserPop: "prefab/ChangeUserPop",
        /**admin界面*/
        AdminManagerPop: "prefab/AdminManagerPop",
        /**admin查看详情界面*/
        AdminDetailPop: "prefab/AdminDetailPop",
        /**创建房型*/
        CreateRoomPop: "prefab/CreateRoomPop",
        /**修改代理数据*/
        ProxyLevelPop: "prefab/ProxyLevelPop",
        /**每日排行榜*/
        ClubRankPop: "prefab/ClubRankPop",
        /**房型选择*/
        TableRoomPop: "prefab/TableRoomPop",
        /**机器人 假桌子*/
        RobotPop: "prefab/RobotPop",
        /**举报列表*/
        BlackListPop: "prefab/BlackListPop",
        /**admin处理举报*/
        AdminPunishPop: "prefab/AdminPunishPop",
    };
    /**本地存储key */
    static StorageKey = {
        /**link json */
        LinkJson:'LinkJson',
        /**server url obj */
        ServerUrlObj: "ServerUrlObj",

        /**公钥 token */
        TokenPKey: "TokenPKey",

        /**大厅背景 */
        HallBg: "HallBg",
        /**用户账户 */
        UserAccount: "UserAccount",
        /**用户密码 */
        UserPwd: "UserPwd",
        /**代理账户 */
        ProxyAccount: "ProxyAccount",
        /**代理密码 */
        ProxyPwd: "ProxyPwd",
        /**用户token */
        UserToken: "UserToken",
        /**用户登录时间 */
        UserLoginTime: "UserLoginTime",
        /**上次进入房间数据 */
        LastRoomData: "LastRoomData",
        /**上次进入房间id */
        LastRoomId: "LastRoomId",
        /**上次进入房间类型 */
        LastRoomType: "LastRoomType",
        /**上次进入房间底分 */
        LastRoomBase: "LastRoomBase",
        /**上次进入游戏 */
        LastGameType: "LastGameType",
        /**上次进入公会 */
        LastLeague: "LastLeague",

        /**上次提醒绑定手机时间 */
        LastTipsBindTime: "LastTipsBindTime",
        /**上次提醒代理时间 */
        LastTipsActiveTime: "LastTipsActiveTime",
        /**上次提醒投注时间 */
        LastTipsBetTime: "LastTipsBetTime",
        /**上次提醒结算投注时间 */
        LastTipsSumBetTime: "LastTipsSumBetTime",
        /**上次提醒代理字牌排行榜时间 */
        LastProxyZPTime: "LastProxyZPTime",
        /**上次提醒幸运时间 */
        LastTipsLuckyTime: "LastTipsLuckyTime",
        /**上次代理提醒活动时间 */
        LastTipsPActiveTime: "LastTipsPActiveTime",
        /**上次代理活动提示时间 */
        LastShowTipsActiveTime: "LastShowTipsActiveTime",
        /**是否弹出托管协议 */
        ShowAutoTips: "ShowAutoTips",
        /**邮件信息 */
        EmaliMsg: "EmaliMsg",

        /**牌桌背景 */
        tableBgSf: 'tableBgSf',
        /**牌桌背景index */
        tableBgIndex: "tableBgIndex",
        /**音效 */
        SoundVolume: "SoundVolume",
        /**音乐 */
        MusicVolume: "MusicVolume",
        /** 桌子大厅初始化数据 */
        TableInitData: "TableInitData",
        /** 玩家位置信息 */
        Location: "Location1",
        /**微信登录信息 */
        WxLoginData: "WxLoginData",
        /**access_token 获取时间 */
        AccessTokenTime: "AccessTokenTime",
        /**refresh_token 获取时间 */
        RefreshTokenTime: "RefreshTokenTime",

        /**代理登录token */
        ProxyToken: "ProxyToken",
        /**代理信息 */
        ProxyData: "ProxyData",

        /**交易待操作 */
        TradeWaitting: "TradeWaitting4",

        /**第一次打开普通交易 */
        FirstOpenSlow: "FirstOpenSlow1",
        /**第一次打开快速交易 */
        FirstOpenFast: "FirstOpenFast",

        /**第一次打开交易所 */
        FirstOpenMarket: "FirstOpenMarket",

        /**是否弹出更新说明 */
        ShowUpdateTIps: "ShowUpdateTIps",

        /**是否弹出代理公告 */
        ShowProxyActivity: "ShowProxyActivity",

        /**是否弹出亲友圈提示 */
        ShowQYQTips: "ShowQYQTips",
        /**购买确认 */
        CreateTrade: "CreateTrade",

        /**活动 今日不再弹出 */
        ActiveDayTips: "ActiveDayTips",
        /**投注 今日不再弹出 */
        BettingPopTips: "BettingPopTips",
        /**结算投注tips 今日不再弹出 */
        SummaryBetTips: "SummaryBetTips",
        /**代理字牌活动 今日不再弹出 */
        ProxyZPTips: "ProxyZPTips",

        /**活动提示 今日不再弹出 */
        ShowActiveDayTips: "ShowActiveDayTips",

        /**活动提示 今日不再弹出 */
        ProxyNoticeVersion: "ProxyNoticeVersion",
        // /**代理查看数据类型 */
        // ProxyIsLeague:'ProxyIsLeague',

        /** 图片缓存 */
        ImgCache: "ImgCache4",

        /** 打点失败 */
        LogsClientFail: "LogsClientFail",




        /** 上次进入公会ID */
        LastClubID: "LastClubID",
    };
    /**打点事件 */
    static LogsEvents = {
        /**选择链路 */
        SELECT_LINK: 'SELECT_LINK',
        /**socket 链接 */
        SOCKET_LINK: 'SOCKET_LINK',
        /**玩家行为 */
        PLAY_BEHAVIOR: 'PLAY_BEHAVIOR',
        /**广告 */
        AD_BEHAVIOR: 'AD_BEHAVIOR',
        /**选择链路 */
        BUG: 'BUG',
    }
    /**打点行为 */
    static LogsActions = {
        /**选择链路耗时 */
        SELECT_LINK_TIME: 'SELECT_LINK_TIME',
        /**选择备用链路 */
        SELECT_SPARE_LINK: 'SELECT_SPARE_LINK',
        /**选择链路失败 */
        SELECT_LINK_FAIL: 'SELECT_LINK_FAIL',

        /**socket链接 成功 */
        SOCKET_LINK_SUCCESS: 'SOCKET_LINK_SUCCESS',
        /**socket链接 进入房间 */
        SOCKET_LINK_ENTER: 'SOCKET_LINK_ENTER',
        /**socket链接 重连 */
        SOCKET_LINK_RECONNECT: 'SOCKET_LINK_RECONNECT',
        /**socket链接 失败 */
        SOCKET_LINK_FAIL: 'SOCKET_LINK_FAIL',
        /**socket链接 出错 */
        SOCKET_LINK_ERROR: 'SOCKET_LINK_ERROR',
        /**socket进入场景 */
        ENTER_SCENE: 'ENTER_SCENE',
        /**socket开始进入场景 */
        START_ENTER_SCENE: 'START_ENTER_SCENE',

        /**观看回放 */
        WATCH_REPLAY: 'WATCH_REPLAY',

        /**点击广告 */
        CLICK_AD: 'CLICK_AD',
        /**广告页面停留时间 */
        AD_DURTIME: 'AD_DURTIME',
    }


    /**错误类型 */
    static ErrorType = {
        /**超时 */
        Timeout: 'Timeout',
        /**请求错误 */
        Questerror: 'Questerror'
    }

    /**键盘类型 */
    static NumberType = {
        INT: 'INT',
        FLOAT: 'FLOAT'
    }

    /**游戏连接状态 */
    static ConnectState = {
        /**关闭 */
        CLOSED: "CLOSED",
        /**连接中 */
        CONNECTING: "CONNECTING",
        /**连接结束返回 */
        CONNECTED: "CONNECTED",
        /**断开 */
        DISCONNECTED: "DISCONNECTED"
    }
    /**支付渠道名称 */
    static ChannelName = {
        "alipay": "支付宝",
        "wechat": "微信",
        "bank": "银行卡",
    }
    /**大厅背景图 */
    static HallBgSprite = {
        toggle1: null,
        toggle2: null,
        toggle3: null,
        toggle4: null,
    };

    /**角色说明 */
    static ROLE_DESC = {
        "owner": "会长",
        "user": "成员",
        "proxy": "合伙人",
        "manager": "管理员"
    };
    /**牌桌背景图 */
    static tableBgSprite = [];

    /**头像 */
    static AvatartAtlas = null;

    static DefaultAvavtar = null;

    /**扑克牌图集 */
    static PorketAtlas = null;

    /**wifi 图 */
    static WiFiSprite = [];

    /**存储桶域名 */
    static ConfigUrl = "https://pku.qzhagy.com/";

    /**推送地址 */
    static NoticeUrl = '';
    /**头像地址 */
    static HeadUrl = '';
    /**h5地址 */
    static WebUrl = '';
    /**音效地址 */
    static VoiceUrl = '';
    /**回放地址 */
    static RecordUrl = '';
    /**下载地址 */
    static DownloadUrl = '';
    /**房型数据 */
    static RoomConfig = [];

    static ShareUrl = '';



    /**屏幕适配 */
    static FitScreen = 0;
    /**设备id */
    static DeviceID = "defaultDeviceId";
    /**IOS设备idfa */
    static DeviceIDFA = "defaultDeviceId";
    /**邀请码 */
    static InviteCode = "888888";
    /**邀请码绑定人数 */
    static InviteCodeCount = 0;
    /**当前头像 */
    static CurrentAvatar = 0;
    /**当前公会 false---亲友圈 true--大联盟 */
    static IsLeague = -1;
    /**当前游戏类型 */
    static CurrentGameType = "";
    /**上次socket连接时间 */
    static LastSocketTime = 0;
    /**是否正在连接 */
    static IsConnecting = false;
    /**炸弹当前玩家分组 */
    static ZDCurrentGroup = -1;
    /**连接数据 */
    static GameConnectData = null;
    /** 游戏内玩家分数 */
    static GameCurrentScore = 0;
    /**娄底字牌大结算数据 */
    static LDZPSummaryData = null;

    /**娄底字牌是否显示大结算数据 （投降显示，正常不显示） */
    static LDZPShowGameSummary = false;
    /**是否弹出桌子大厅 */
    static ShowTablePop = true;
    /**是否马上进行快速开始 */
    static IsQuickStart = false;

    /**代理信息 */
    static ProxyData = {};
    /**代理大联盟分成信息 */
    static ProxyProfitData = [];
    /**代理亲友圈分成信息 */
    static ProxyClubProfitData = [];

    /** 代理查看数据类型 */
    static ProxyIsLeague = true;

    /**当前回放数据 */
    static CurrentReplayData = "";

    /**服务器时间误差 */
    static ServerTimeDiff = 0;


    /**是否上传receipt */
    static isUpdateReceipt = false;

    /**活动是否提示 */
    static isShowLottery = true;



    /**默认版本号 */
    static DefaultVersion = "4.0.0";
    /**apkname */
    static ApkName = "ldqp";
    /**加密器 */
    static Encrtyptor = null;
    static PublicKey = "";
    static PrivateKey = "";
    /**任务列表 */
    static TaskRewardList = [];
    /**任务列表 */
    static TaskList = [];
    /**炸弹活动 */
    static TaskData = {};

    /**幸运用户活动 */
    static LuckyUserData = {};

    /**活动icon */
    static ActiveIconData = [];
    /**活动内容 */
    static ActiveContentData = [];

    static xhzdConfig = {};

    /**问卷调查 */
    static QuestData = {};

    /**广告数据 */
    static AdData = {};
    /**交易奖励 */
    static RewardConfig = [];

    /**代理交易配置 */
    static ProxyMarketConfig = [];
    /** */
    static BtnIsMoving = false;

    /**手机验证码时间 */
    static SendCodeTime = 0;
    /**任务描述 */
    static TaskDesc = {
        'INVITE': '邀请$个新玩家',
        'TRADE': '交易所完成$笔交易',
        'TURN': '完成$局游戏',
        'PLAYERS': '与$个玩家完成对局',
        'FLOW': '当日流水$元',
        'CHILD_CONTRIBUTE': '邀请的新玩家领取$次活跃奖励'
    }
    static TaskStartTime = "2021-06-20 22:15:00"
    static TaskEndTime = "2021-06-20 22:17:00"
    /**是否为调试模式 */
    static IsDebug = false;
    static isTest = false;

    /**投注赔率 */
    static BetRate = null;
    /**投注配置 */
    static BetConfig = null;
    /**投注走势图 */
    static BetResult = null;

    /**代理邀请列表 */
    static InviteList = null;


    /**桌子房间缓存 */
    static TableRoom = null;
    /**桌子所有房间缓存 */
    static TableAllRooms = null;


    static isNewMatch = false;
    static originalLogFun = null;
    static _enableLog = true;
    static set enableLog(v) {
        if (GameConfig._enableLog == v) return;
        GameConfig._enableLog = v

        if (GameConfig.originalLogFun == null) {
            GameConfig.originalLogFun = console.log;
            console.log = (...args) => {
                if (GameConfig._enableLog) {
                    GameConfig.originalLogFun.apply(null, args);
                }
            };
        }
    };
    static get enableLog() {
        return GameConfig._enableLog;
    }
}

