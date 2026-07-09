var Connector = require("../../Main/NetWork/Connector");
var DataBase = require("../../Main/Script/DataBase");
var Cache = require("../../Main/Script/Cache");
var GameConfig = require("../../GameBase/GameConfig").GameConfig;
var App = require("../../script/ui/hall/data/App").App;

function getClubID() {
    return App && App.Club ? App.Club.CurrentClubID : 0;
}

function getSelfID() {
    return DataBase.player && DataBase.player.id || 0;
}

function clone(data, withClubID) {
    var output = {};
    data = data || {};
    for (var key in data) output[key] = data[key];
    if (withClubID !== false && !output.clubID) output.clubID = getClubID();
    return output;
}

function getKeyword(data) {
    data = data || {};
    return data.keyword != null ? data.keyword : (data.keywords != null ? data.keywords : null);
}

function getErrorMessage(err) {
    if (!err) return "请求失败";
    if (typeof err === "string") return err;
    if (err.message) return err.message;
    if (err.msg) return err.msg;
    if (err.detail) return err.detail;
    return "请求失败";
}

function showErrorTip(err) {
    var message = getErrorMessage(err);
    showMessagePopup(message);
    if (err && typeof err === "object") err.__leagueAnalysisTipShown = true;
}

function showMessagePopup(message) {
    if (!message) return;
    if (Cache && Cache.showTipsMsg) Cache.showTipsMsg(message);
    else if (Cache && Cache.alertTip) Cache.alertTip(message);
}

function request(route, data, mask, withClubID) {
    var payload = clone(data, withClubID);
    cc.log("[LeagueAnalysisApi] request", route, payload);
    return new Promise(function (resolve, reject) {
        Connector.request(route, payload, function (res) {
            cc.log("[LeagueAnalysisApi] response", route, res);
            if (res && ((res.status != null && Number(res.status) !== 0) || res.success === false)) {
                console.error("[LeagueAnalysisApi] error", route, res);
                showErrorTip(res);
                reject(res);
                return;
            }
            resolve(res);
        }, mask == null ? 1 : mask, function (err) {
            console.error("[LeagueAnalysisApi] error", route, err);
            showErrorTip(err);
            reject(err || { message: "请求失败" });
        });
    });
}

module.exports = {
    request: request,
    overview: function (data) {
        data = data || {};
        return request("game/analysisSummary", {
            clubID: getClubID(),
            userID: data.userID || getSelfID()
        });
    },
    members: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.UserList, {
            clubID: getClubID(),
            userID: getSelfID(),
            page: data.page || 1,
            pageSize: data.pageSize || 20,
            keyword: getKeyword(data),
            whole: true
        });
    },
    searchMember: function (userID) {
        return this.members({ keyword: userID, page: 1, pageSize: 20 });
    },
    findUser: function (userID) {
        return request(GameConfig.ServerEventName.SearchUserInfo, {
            userID: parseInt(userID)
        }, 1, false);
    },
    invitePlayer: function (userID) {
        return request(GameConfig.ServerEventName.Invite, {
            clubID: getClubID(),
            userID: parseInt(userID)
        });
    },
    partners: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.ProxiesList, {
            clubID: getClubID(),
            userID: getSelfID(),
            page: data.page || 1,
            pageSize: data.pageSize || 20,
            keyword: getKeyword(data)
        });
    },
    setPartner: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.AddProxy, {
            clubID: getClubID(),
            userID: parseInt(data.userID),
            level: parseInt(data.roomRate || data.level || 0),
            shuffleLevel: parseInt(data.waterRate || data.shuffleLevel || 0)
        });
    },
    updatePartnerRate: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.UpdateLevel, {
            clubID: getClubID(),
            userID: data.userID,
            level: data.roomRate || data.level || 0,
            shuffleLevel: data.waterRate || data.shuffleLevel || 0
        });
    },
    updateWarning: function (userID, warningScore) {
        return request(GameConfig.ServerEventName.UpdateLimit, {
            clubID: getClubID(),
            userID: userID,
            limit: Math.floor(Number(warningScore || 0))
        });
    },
    changeScore: function (userID, mode, amount) {
        var score = Math.floor(Number(amount || 0) * 100);
        if (mode === "sub" || mode === "reduce") score = -score;
        return request(GameConfig.ServerEventName.UpdateScore, {
            clubID: getClubID(),
            userID: userID,
            score: score
        });
    },
    updateForbidden: function (userID, forbidden) {
        return request(GameConfig.ServerEventName.UpdateStatus, {
            userID: userID,
            whole: false,
            status: forbidden ? "limit" : "normal"
        });
    },
    children: function (data) {
        data = data || {};
        var route = (data.type || data.mode) === "member" ? GameConfig.ServerEventName.UserList : GameConfig.ServerEventName.ProxiesList;
        return request(route, {
            clubID: getClubID(),
            userID: data.userID || data.userId || data.id,
            page: data.page || 1,
            pageSize: data.pageSize || 50,
            keyword: getKeyword(data)
        });
    },
    battleDetails: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.ClubLogs, {
            clubID: getClubID(),
            userID: data.userID || getSelfID(),
            page: data.page || 1,
            pageSize: data.pageSize || 20,
            strDate: data.strDate || data.date || null
        });
    },
    battleReplay: function (data) {
        return Promise.resolve({ data: { rows: [] } });
    },
    agentStats: function (data) {
        data = data || {};
        return request("game/proxyStats", {
            clubID: getClubID(),
            userID: getSelfID(),
            page: data.page || 1,
            pageSize: data.pageSize || 20,
            keyword: getKeyword(data)
        });
    },
    rewardDetails: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.RewardDetail, {
            clubID: getClubID(),
            userID: getSelfID(),
            page: data.page || 1,
            pageSize: data.pageSize || 20,
            keyword: getKeyword(data),
            startDate: data.startDate || null,
            endDate: data.endDate || null
        });
    },
    operateLogs: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.UserScoreLog, {
            clubID: getClubID(),
            userID: getSelfID(),
            targetUserID: data.targetUserID || null,
            page: data.page || 1,
            pageSize: data.pageSize || 20,
            keyword: getKeyword(data),
            startDate: data.startDate || null,
            endDate: data.endDate || null
        });
    },
    rewardWithdraw: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.RewardLog, {
            clubID: getClubID(),
            userID: getSelfID(),
            page: data.page || 1,
            pageSize: data.pageSize || 20,
            keyword: getKeyword(data),
            startDate: data.startDate || null,
            endDate: data.endDate || null
        });
    },
    drawReward: function (reward, userID) {
        return request(GameConfig.ServerEventName.DrawReward, {
            clubID: getClubID(),
            userID: userID || getSelfID(),
            reward: Math.floor(Number(reward || 0))
        });
    }
};
