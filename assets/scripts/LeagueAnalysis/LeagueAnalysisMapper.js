function money(value) {
    value = Number(value || 0);
    if (!isFinite(value)) value = 0;
    return (value / 100).toFixed(2).replace(/\.00$/, "");
}

function text(value, fallback) {
    if (value === 0) return "0";
    return value == null || value === "" ? (fallback || "") : String(value);
}

function role(raw) {
    var value = raw && raw.role || "user";
    if (value === "owner") return "owner";
    if (value === "manager") return "manager";
    if (value === "proxy") return "proxy";
    return "user";
}

function normalizeMember(raw) {
    raw = raw || {};
    var user = raw.user || {};
    var score = Number(raw.score || 0);
    var r = role(raw);
    return {
        raw: raw,
        userId: raw.userID || raw.userId || raw.id,
        userID: raw.userID || raw.userId || raw.id,
        nickname: raw.name || user.name || "玩家信息",
        name: raw.name || user.name || "玩家信息",
        avatar: raw.head || raw.avatar || user.head || "",
        role: r,
        roleName: raw.roleName || (r === "proxy" ? "合伙人" : r === "owner" ? "盟主" : r === "manager" ? "管理员" : "成员"),
        online: !!(raw.online || raw.isInGame),
        todayRounds: Number(raw.todayRounds || raw.tdTurn || 0),
        yesterdayRounds: Number(raw.yesterdayRounds || raw.ydTurn || 0),
        todayContribution: money(raw.todayContribution != null ? raw.todayContribution : raw.tdFee),
        yesterdayContribution: money(raw.yesterdayContribution != null ? raw.yesterdayContribution : raw.ydFee),
        todayResult: money(raw.todayResult != null ? raw.todayResult : raw.tdFee),
        yesterdayResult: money(raw.yesterdayResult != null ? raw.yesterdayResult : raw.ydFee),
        score: money(score),
        scoreValue: score,
        forbidden: !!(raw.forbidden || raw.hasLimit || raw.status === "limit" || raw.status === "frozen"),
        partner: raw.partner != null ? !!raw.partner : r !== "user",
        parent: raw.parent,
        roomRate: raw.roomRate != null ? raw.roomRate : raw.level || 0,
        waterRate: raw.waterRate != null ? raw.waterRate : raw.shuffleLevel || 0
    };
}

function normalizeMemberList(res) {
    var data = res && (res.data || res.users || res.userList) || {};
    var rows = data.rows || [];
    return {
        rows: rows.map(normalizeMember),
        count: data.count || rows.length,
        page: data.page || 1,
        pageSize: data.pageSize || rows.length
    };
}

function normalizeBattlePlayer(raw) {
    raw = raw || {};
    return {
        userID: raw.userID || raw.id,
        name: raw.name || "玩家",
        avatar: raw.head || raw.avatar || "",
        maskedID: raw.maskedID || "",
        score: (Number(raw.score || raw.total || 0) / 100).toFixed(2).replace(/\.00$/, "")
    };
}

function normalizeBattleDetail(raw) {
    raw = raw || {};
    return {
        id: raw.id || raw.logID,
        logID: raw.logID || raw.id,
        roomID: raw.roomID || raw.tableID || "",
        time: raw.time || raw.createdAt || "",
        gameName: raw.gameName || raw.gameType || "",
        replayCode: raw.replayCode || raw.fileID || "",
        fileID: raw.fileID || "",
        players: (raw.players || []).map(normalizeBattlePlayer)
    };
}

function normalizeBattleDetails(res) {
    var data = res && res.data || {};
    var rows = data.rows || [];
    return {
        rows: rows.map(normalizeBattleDetail),
        count: data.count || rows.length
    };
}

function normalizeReplayRow(raw) {
    raw = raw || {};
    return {
        round: raw.round || "1/1",
        result: raw.result || "lose",
        players: (raw.players || []).map(normalizeBattlePlayer),
        replayCode: raw.replayCode || raw.fileID || ""
    };
}

function normalizeBattleReplay(res) {
    var data = res && res.data || {};
    return {
        roomID: data.roomID || data.tableID || "",
        totalRounds: data.totalRounds || 0,
        replayCode: data.replayCode || "",
        rows: (data.rows || []).map(normalizeReplayRow)
    };
}

module.exports = {
    money: money,
    text: text,
    normalizeMember: normalizeMember,
    normalizeMemberList: normalizeMemberList,
    normalizeBattleDetails: normalizeBattleDetails,
    normalizeBattleReplay: normalizeBattleReplay
};
