var Connector = require("../../Main/NetWork/Connector");
var Context = require("./LeagueAnalysisContext");

function clone(data) {
    var output = {};
    data = data || {};
    for (var key in data) output[key] = data[key];
    if (!output.clubID) output.clubID = Context.getClubID();
    return output;
}

function request(route, data, mask) {
    var payload = clone(data);
    cc.log("[LeagueAnalysisApi] request", route, payload);
    return new Promise(function (resolve, reject) {
        Connector.request(route, payload, function (res) {
            cc.log("[LeagueAnalysisApi] response", route, res);
            resolve(res);
        }, mask == null ? 1 : mask, function (err) {
            cc.log("[LeagueAnalysisApi] error", route, err);
            reject(err || { message: "请求失败" });
        });
    });
}

module.exports = {
    request: request,
    members: function (data) { return request("businessAnalysis/members", data); },
    searchMember: function (userID) { return request("businessAnalysis/members", { keywords: userID, page: 1, pageSize: 20 }); },
    findUser: function (userID) { return request("businessAnalysis/findUser", { userID: userID }); },
    setPartner: function (data) { return request("businessAnalysis/setPartner", data); },
    changeScore: function (userID, mode, amount) {
        return request("businessAnalysis/changeScore", { userID: userID, mode: mode, amount: amount });
    },
    updateForbidden: function (userID, forbidden) {
        return request("businessAnalysis/updateStatus", { userID: userID, forbidden: !!forbidden });
    },
    battleDetails: function (data) { return request("businessAnalysis/battleDetails", data); },
    battleReplay: function (data) { return request("businessAnalysis/battleReplay", data); }
};
