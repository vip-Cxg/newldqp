
cc.Class({
    extends: cc.Component,
    properties: {
        rowPrefab: cc.Prefab
    },
    onLoad: function () {
        this.cacheNodes();
        this.bindButtons();
    },

    init: function (data) {
        this.data = data || {};
        if (!this.nodes) this.cacheNodes();
        this.bindButtons();
        this.render();
    },

    cacheNodes: function () {
        this.nodes = {};
        this.collectNodes(this.node);
    },

    collectNodes: function (node) {
        if (!node) return;
        this.nodes[node.name] = node;
        for (var i = 0; i < node.children.length; i++) {
            this.collectNodes(node.children[i]);
        }
    },

    bindButtons: function () {
        this.bindClick("CloseBtn", this.close.bind(this));
        this.bindClick("Mask", this.close.bind(this));
        this.bindClick("JoinBtn", this.join.bind(this));
    },

    bindClick: function (name, callback) {
        var node = this.nodes && this.nodes[name];
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            callback();
        }, this);
    },

    render: function () {
        var table = this.getTableData();
        var room = this.getRoomData();
        var players = this.getPlayers(table);
        var maxPlayers = this.getMaxPlayers(table, room);

        this.setText("Title", table.title || "桌子详情");
        this.setText("lblGameName", this.getGameName(table, room));
        this.setText("lblRound", this.getRoundText(table, room));
        this.setText("lblPlayerCount", players.length + "/" + maxPlayers);
        this.setText("lblRule", this.getRuleText(table, room));
        this.setText("RoomId", this.getRoomIDText(table, room));
        this.renderPlayers(players, table.ownerID || table.creatorID || room.ownerID);
    },

    renderPlayers: function (players, ownerID) {
        var content = this.nodes.PlayerList;
        if (!content || !this.rowPrefab) return;
        content.removeAllChildren();
        for (var i = 0; i < players.length; i++) {
            var node = cc.instantiate(this.rowPrefab);
            var comp = node.getComponent("HallPlayerItem");
            if (comp && comp.setData) comp.setData(players[i], i, ownerID);
            content.addChild(node);
        }
    },

    getTableData: function () {
        return this.data.table || this.data || {};
    },

    getRoomData: function () {
        var table = this.getTableData();
        return this.data.room || table.roomData || table.realRoomData || {};
    },

    getPlayers: function (table) {
        var source = table.players || table.seats || [];
        var players = [];
        for (var i = 0; i < source.length; i++) {
            if (this.isValidPlayer(source[i])) players.push(source[i]);
        }
        return players;
    },

    isValidPlayer: function (player) {
        if (!player) return false;
        if (typeof player !== "object") return true;
        var prop = player.prop || player.user || player;
        return !!(prop.id || prop.userID || prop.pid || prop.name || prop.nickname || prop.nickName || prop.head || prop.avatar || prop.avatarUrl);
    },

    getMaxPlayers: function (table, room) {
        return table.person || table.maxPlayer || table.maxPlayers || table.seatCount ||
            room.person || room.maxPlayer || room.maxPlayers ||
            (table.game && table.game.seats) || 2;
    },

    getGameName: function (table, room) {
        var GameConfig = require("../../../GameBase/GameConfig").GameConfig;
        var gameType = table.gameType || room.gameType || (table.game && table.game.key) || "";
        return table.gameName || (GameConfig.GameName && GameConfig.GameName[gameType]) || (table.game && table.game.name) || gameType || "";
    },

    getRoundText: function (table, room) {
        var current = table.currentRound || table.turn || table.round || 0;
        var total = table.totalRound || this.getRulesValue(room, "turn") || this.getRulesValue(room, "round") || this.getRulesValue(room, "maxTurn") || 0;
        if (!current && !total) return "";
        return String(current || 0) + "/" + String(total || 0);
    },

    getRuleText: function (table, room) {
        return table.rule || table.entryText || room.name || "";
    },

    getRoomIDText: function (table, room) {
        var roomID = table.roomID || room.roomID || "";
        var tableID = table.tableID || "";
        if (roomID && tableID) return "房间ID：" + roomID + "  桌号：" + tableID;
        return "房间ID：" + (roomID || tableID || "");
    },

    getRulesValue: function (room, key) {
        var rules = room && room.rules;
        if (typeof rules === "string") {
            try {
                rules = JSON.parse(rules);
            } catch (err) {
                rules = null;
            }
        }
        return rules && rules[key];
    },

    setText: function (name, value) {
        var node = this.nodes && this.nodes[name];
        var label = node && node.getComponent(cc.Label);
        if (label) label.string = String(value || "");
    },

    join: function () {
        if (this.data && typeof this.data.onJoin === "function") {
            this.data.onJoin(this.getTableData(), this.getRoomData());
        }
        this.close();
    },

    close: function () {
        if (this.node) this.node.destroy();
    }

});
