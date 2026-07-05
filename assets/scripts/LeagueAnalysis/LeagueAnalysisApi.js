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
    if (Cache && Cache.showTipsMsg) {
        Cache.showTipsMsg(message);
    } else if (Cache && Cache.alertTip) {
        Cache.alertTip(message);
    }
}

function request(route, data, mask) {
    var payload = clone(data);
    cc.log("[LeagueAnalysisApi] request", route, payload);
    return new Promise(function (resolve, reject) {
        Connector.request(route, payload, function (res) {
            cc.log("[LeagueAnalysisApi] response", route, res);
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
    members: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.UserList, {
            clubID: getClubID(),
            userID: getSelfID(),
            page: data.page || 1,
            pageSize: data.pageSize || 20,
            keywords: data.keywords || null,
            whole: true
        });
    },
    searchMember: function (userID) {
        return this.members({ keywords: userID, page: 1, pageSize: 20 });
    },
    setPartner: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.AddProxy, {
            clubID: getClubID(),
            userID: data.userID,
            level: data.roomRate || data.level || 0,
            shuffleLevel: data.waterRate || data.shuffleLevel || 0
        });
    },
    changeScore: function (userID, mode, amount) {
        var score = Math.floor(Number(amount || 0) * 100);
        if (mode === "sub" || mode === "reduce") score = -score;
        return request(GameConfig.ServerEventName.UpdateScore, {
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
    battleDetails: function (data) {
        data = data || {};
        return request(GameConfig.ServerEventName.ClubLogs, {
            clubID: getClubID(),
            userID: data.userID || getSelfID(),
            page: data.page || 1,
            pageSize: data.pageSize || 20
        });
    },
    battleReplay: function (data) {
        data = data || {};
        return request("businessAnalysis/battleReplay", {
            clubID: getClubID(),
            logID: data.logID || data.id,
            fileID: data.fileID || data.replayCode
        });
    }
};
