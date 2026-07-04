var DataBase = require("../../Main/Script/DataBase");

var App = null;
try {
    var appModule = require("../../script/ui/hall/data/App");
    App = appModule.App || appModule.default || appModule;
} catch (e) {
    App = null;
}

function getClub() {
    return App && App.Club ? App.Club : {};
}

module.exports = {
    getClubID: function () {
        var club = getClub();
        return club.CurrentClubID || club.currentClubID || 0;
    },
    getClubRole: function () {
        var club = getClub();
        return club.CurrentClubRole || club.currentClubRole || "user";
    },
    getPlayerID: function () {
        return DataBase.player && DataBase.player.id || 0;
    },
    getPlayer: function () {
        return DataBase.player || {};
    }
};
