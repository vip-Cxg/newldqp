const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "assets/resources/Main/Prefab/BusinessAnalysis");
const resDir = path.join(root, "assets/resources");
const materialUuid = "eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432";

function uuid() {
  return crypto.randomUUID();
}

function spriteUuid(resourcePath) {
  const metaPath = path.join(resDir, resourcePath + ".png.meta");
  if (!fs.existsSync(metaPath)) return null;
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const keys = Object.keys(meta.subMetas || {});
  return keys.length ? meta.subMetas[keys[0]].uuid : null;
}

const sprites = {
  formBg: spriteUuid("hall/经营分析/合伙人/bg10"),
  largeBg: spriteUuid("hall/经营分析/成员管理/bg11"),
  close: spriteUuid("hall/经营分析/统计/guanbi"),
  greenBtn: spriteUuid("hall/经营分析/合伙人/zlvanni"),
  blueBtn: spriteUuid("hall/经营分析/合伙人/zlannanni"),
  smallBlueBtn: spriteUuid("hall/经营分析/合伙人/zhonganni"),
  orangeBigBtn: spriteUuid("hall/经营分析/合伙人/zdhuangan"),
  greenBigBtn: spriteUuid("hall/经营分析/合伙人/ylvanniu"),
  input: spriteUuid("hall/经营分析/合伙人/bgshuru"),
  avatar: spriteUuid("hall/经营分析/成员管理/bg01"),
  childrenBg: spriteUuid("hall/经营分析/合伙人/查看下级/组 13"),
  leaderBadge: spriteUuid("hall/经营分析/合伙人/查看下级/上级队长"),
  dateBtn: spriteUuid("hall/经营分析/奖励明细/anniu"),
  key: spriteUuid("hall/经营分析/成员管理/上下分/anjian"),
  paleBlock: spriteUuid("hall/经营分析/合伙人/bg05"),
  brownBar: spriteUuid("hall/经营分析/合伙人/bg06"),
};

function makePrefab(name, width, height, childrenBuilder) {
  const arr = [];
  function push(obj) {
    arr.push(obj);
    return arr.length - 1;
  }

  push({
    "__type__": "cc.Prefab",
    "_name": "",
    "_objFlags": 0,
    "_native": "",
    "data": { "__id__": 1 },
    "optimizationPolicy": 0,
    "asyncLoadAssets": false,
    "readonly": false,
  });

  function prefabInfo() {
    return push({
      "__type__": "cc.PrefabInfo",
      "root": { "__id__": 1 },
      "asset": { "__id__": 0 },
      "fileId": crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12),
      "sync": false,
    });
  }

  function node(parentId, nodeName, x, y, w, h, opts = {}) {
    const id = arr.length;
    const obj = {
      "__type__": "cc.Node",
      "_name": nodeName,
      "_objFlags": 0,
      "_parent": parentId == null ? null : { "__id__": parentId },
      "_children": [],
      "_active": opts.active !== false,
      "_components": [],
      "_prefab": null,
      "_opacity": opts.opacity == null ? 255 : opts.opacity,
      "_color": {
        "__type__": "cc.Color",
        "r": opts.color ? opts.color[0] : 255,
        "g": opts.color ? opts.color[1] : 255,
        "b": opts.color ? opts.color[2] : 255,
        "a": opts.color ? opts.color[3] == null ? 255 : opts.color[3] : 255,
      },
      "_contentSize": { "__type__": "cc.Size", "width": w, "height": h },
      "_anchorPoint": { "__type__": "cc.Vec2", "x": 0.5, "y": 0.5 },
      "_trs": {
        "__type__": "TypedArray",
        "ctor": "Float64Array",
        "array": [x, y, 0, 0, 0, 0, 1, 1, 1, 1],
      },
      "_eulerAngles": { "__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0 },
      "_skewX": 0,
      "_skewY": 0,
      "_is3DNode": false,
      "_groupIndex": 0,
      "groupIndex": 0,
      "_id": "",
    };
    push(obj);
    obj._prefab = { "__id__": prefabInfo() };
    if (parentId != null) arr[parentId]._children.push({ "__id__": id });
    return id;
  }

  function sprite(nodeId, frameUuid, type = 0) {
    if (!frameUuid) return null;
    const id = push({
      "__type__": "cc.Sprite",
      "_name": "",
      "_objFlags": 0,
      "node": { "__id__": nodeId },
      "_enabled": true,
      "_materials": [{ "__uuid__": materialUuid }],
      "_srcBlendFactor": 770,
      "_dstBlendFactor": 771,
      "_spriteFrame": { "__uuid__": frameUuid },
      "_type": type,
      "_sizeMode": 0,
      "_fillType": 0,
      "_fillCenter": { "__type__": "cc.Vec2", "x": 0, "y": 0 },
      "_fillStart": 0,
      "_fillRange": 0,
      "_isTrimmedMode": true,
      "_atlas": null,
      "_id": "",
    });
    arr[nodeId]._components.push({ "__id__": id });
    return id;
  }

  function button(nodeId) {
    const id = push({
      "__type__": "cc.Button",
      "_name": "",
      "_objFlags": 0,
      "node": { "__id__": nodeId },
      "_enabled": true,
      "_normalMaterial": null,
      "_grayMaterial": null,
      "duration": 0.08,
      "zoomScale": 0.96,
      "clickEvents": [],
      "_N$interactable": true,
      "_N$enableAutoGrayEffect": false,
      "_N$transition": 3,
      "transition": 3,
      "_N$normalColor": { "__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255 },
      "_N$pressedColor": { "__type__": "cc.Color", "r": 160, "g": 160, "b": 160, "a": 255 },
      "pressedColor": { "__type__": "cc.Color", "r": 160, "g": 160, "b": 160, "a": 255 },
      "_N$hoverColor": { "__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255 },
      "hoverColor": { "__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255 },
      "_N$disabledColor": { "__type__": "cc.Color", "r": 124, "g": 124, "b": 124, "a": 255 },
      "_N$normalSprite": null,
      "_N$pressedSprite": null,
      "pressedSprite": null,
      "_N$hoverSprite": null,
      "hoverSprite": null,
      "_N$disabledSprite": null,
      "_N$target": { "__id__": nodeId },
      "_id": "",
    });
    arr[nodeId]._components.push({ "__id__": id });
    return id;
  }

  function label(nodeId, text, size = 24, color = [255, 255, 255, 255], outline = true) {
    arr[nodeId]._color = { "__type__": "cc.Color", "r": color[0], "g": color[1], "b": color[2], "a": color[3] == null ? 255 : color[3] };
    const id = push({
      "__type__": "cc.Label",
      "_name": "",
      "_objFlags": 0,
      "node": { "__id__": nodeId },
      "_enabled": true,
      "_materials": [{ "__uuid__": materialUuid }],
      "_srcBlendFactor": 770,
      "_dstBlendFactor": 771,
      "_string": text,
      "_N$string": text,
      "_fontSize": size,
      "_lineHeight": Math.ceil(size * 1.25),
      "_enableWrapText": true,
      "_N$file": null,
      "_isSystemFontUsed": true,
      "_spacingX": 0,
      "_batchAsBitmap": false,
      "_styleFlags": 0,
      "_underlineHeight": 0,
      "_N$horizontalAlign": 1,
      "_N$verticalAlign": 1,
      "_N$fontFamily": "Arial",
      "_N$overflow": 0,
      "_N$cacheMode": 0,
      "_id": "",
    });
    arr[nodeId]._components.push({ "__id__": id });
    if (outline) {
      const oid = push({
        "__type__": "cc.LabelOutline",
        "_name": "",
        "_objFlags": 0,
        "node": { "__id__": nodeId },
        "_enabled": true,
        "_color": { "__type__": "cc.Color", "r": 80, "g": 55, "b": 45, "a": 255 },
        "_width": 1,
        "_id": "",
      });
      arr[nodeId]._components.push({ "__id__": oid });
    }
  }

  function addSprite(parent, nodeName, frameUuid, x, y, w, h, opts = {}) {
    const id = node(parent, nodeName, x, y, w, h, opts);
    sprite(id, frameUuid, opts.type || 0);
    if (opts.button) button(id);
    if (opts.text) {
      const t = node(id, "Label", 0, 0, w, h, {});
      label(t, opts.text, opts.fontSize || 24, opts.textColor || [255, 255, 255, 255]);
    }
    return id;
  }

  function addLabel(parent, nodeName, text, x, y, w, h, size, color) {
    const id = node(parent, nodeName, x, y, w, h, {});
    label(id, text, size, color || [255, 255, 255, 255]);
    return id;
  }

  const rootId = node(null, name, 0, 0, width, height);
  childrenBuilder({ node, addSprite, addLabel, sprite, button, label, rootId });

  const file = path.join(outDir, name + ".prefab");
  fs.writeFileSync(file, JSON.stringify(arr, null, 2));
  fs.writeFileSync(file + ".meta", JSON.stringify({
    ver: "1.3.2",
    uuid: uuid(),
    importer: "prefab",
    optimizationPolicy: "AUTO",
    asyncLoadAssets: false,
    readonly: false,
    subMetas: {},
  }, null, 2));
}

function addClose(api, root, w, h) {
  api.addSprite(root, "CloseButton", sprites.close, w / 2 - 25, h / 2 - 25, 54, 54, { button: true });
}

function form(name, title, build) {
  makePrefab(name, 583, 444, (api) => {
    api.addSprite(api.rootId, "PanelBg", sprites.formBg, 0, 0, 583, 444);
    api.addLabel(api.rootId, "TitleLabel", title, 0, 168, 360, 64, 38);
    addClose(api, api.rootId, 583, 444);
    const content = api.node(api.rootId, "Content", 0, -28, 540, 300);
    api.addSprite(content, "FormPanel", sprites.paleBlock, 0, 10, 530, 245, { type: 1 });
    build(api, content);
  });
}

form("BusinessAnalysisPopupAdjustRate", "调整比例", (api, c) => {
  api.addLabel(c, "RoomRateTitle", "房费比例:", -205, 95, 170, 42, 30);
  api.addSprite(c, "RoomRateInput", sprites.input, 50, 95, 330, 54);
  api.addLabel(c, "RoomRateValue", "0", 50, 95, 300, 42, 26, [120, 75, 45, 255]);
  api.addLabel(c, "RoomPercent", "%", 245, 95, 44, 42, 30);
  api.addLabel(c, "WaterRateTitle", "抽水比例:", -205, 5, 170, 42, 30);
  api.addSprite(c, "WaterRateInput", sprites.input, 50, 5, 330, 54);
  api.addLabel(c, "WaterRateValue", "0", 50, 5, 300, 42, 26, [120, 75, 45, 255]);
  api.addLabel(c, "WaterPercent", "%", 245, 5, 44, 42, 30);
  api.addSprite(c, "ConfirmButton", sprites.greenBtn, 0, -115, 128, 58, { button: true, text: "确定", fontSize: 26 });
});

form("BusinessAnalysisPopupWarning", "设置警戒值", (api, c) => {
  api.addLabel(c, "WarningTitle", "警戒分:", -190, 95, 150, 42, 30);
  api.addSprite(c, "WarningInput", sprites.input, 50, 95, 330, 54);
  api.addLabel(c, "WarningValue", "0", 50, 95, 300, 42, 26, [120, 75, 45, 255]);
  api.addLabel(c, "WarningPercent", "%", 245, 95, 44, 42, 30);
  api.addLabel(c, "TipLabel", "注：一条线玩家总分数低于警戒值分，玩家不能进入游戏，警戒分设置0，警戒解除，只能给直属代理和玩家设置！", 0, -12, 520, 92, 19);
  api.addSprite(c, "ConfirmButton", sprites.greenBtn, 0, -125, 128, 58, { button: true, text: "确定", fontSize: 26 });
});

form("BusinessAnalysisPopupSetPartner", "添加合伙人", (api, c) => {
  api.addLabel(c, "RoomRateTitle", "房费比例:", -205, 95, 170, 42, 30);
  api.addSprite(c, "RoomRateInput", sprites.input, 50, 95, 330, 54);
  api.addLabel(c, "RoomRateValue", "0", 50, 95, 300, 42, 26, [120, 75, 45, 255]);
  api.addLabel(c, "RoomPercent", "%", 245, 95, 44, 42, 30);
  api.addLabel(c, "WaterRateTitle", "抽水比例:", -205, 5, 170, 42, 30);
  api.addSprite(c, "WaterRateInput", sprites.input, 50, 5, 330, 54);
  api.addLabel(c, "WaterRateValue", "0", 50, 5, 300, 42, 26, [120, 75, 45, 255]);
  api.addLabel(c, "WaterPercent", "%", 245, 5, 44, 42, 30);
  api.addSprite(c, "ConfirmButton", sprites.greenBtn, 0, -115, 128, 58, { button: true, text: "确定", fontSize: 26 });
});

form("BusinessAnalysisPopupForbid", "禁止游戏", (api, c) => {
  api.addLabel(c, "MessageLabel", "确认禁止该玩家游戏？", 0, 58, 520, 70, 30);
  api.addSprite(c, "CancelButton", sprites.blueBtn, -95, -80, 128, 58, { button: true, text: "取消", fontSize: 26 });
  api.addSprite(c, "ConfirmButton", sprites.greenBtn, 95, -80, 128, 58, { button: true, text: "确定", fontSize: 26 });
});

form("BusinessAnalysisPopupDate", "选择日期", (api, c) => {
  api.addLabel(c, "YearLabel", "2026年", -180, 82, 160, 44, 28);
  api.addLabel(c, "MonthLabel", "06月", 0, 82, 120, 44, 28);
  api.addLabel(c, "DayLabel", "28日", 160, 82, 120, 44, 28);
  api.addSprite(c, "DateInputBg", sprites.input, 0, -15, 520, 58, { type: 1 });
  api.addLabel(c, "SelectedLabel", "当前选择：2026-06-28", 0, -15, 420, 50, 26, [120, 75, 45, 255]);
  api.addSprite(c, "CancelButton", sprites.blueBtn, -95, -130, 128, 58, { button: true, text: "取消", fontSize: 26 });
  api.addSprite(c, "ConfirmButton", sprites.greenBtn, 95, -130, 128, 58, { button: true, text: "确定", fontSize: 26 });
});

form("BusinessAnalysisPopupInvite", "邀请玩家", (api, c) => {
  api.addLabel(c, "InviteTitle", "邀请码", -185, 78, 140, 42, 30);
  api.addSprite(c, "InviteCodeBg", sprites.input, 55, 78, 330, 54);
  api.addLabel(c, "InviteCodeLabel", "900001", 55, 78, 300, 42, 26, [120, 75, 45, 255]);
  api.addLabel(c, "InviteTip", "复制邀请码后发送给玩家加入联盟", 0, -15, 480, 52, 24);
  api.addSprite(c, "CopyButton", sprites.greenBtn, 0, -118, 128, 58, { button: true, text: "复制", fontSize: 26 });
});

form("BusinessAnalysisPopupWithdrawConfirm", "奖励提取", (api, c) => {
  api.addLabel(c, "MessageLabel", "确认取出当前奖励？", 0, 58, 520, 70, 30);
  api.addLabel(c, "RewardLabel", "当前奖励：2.7", 0, 4, 420, 40, 26);
  api.addSprite(c, "CancelButton", sprites.blueBtn, -95, -115, 128, 58, { button: true, text: "取消", fontSize: 26 });
  api.addSprite(c, "ConfirmButton", sprites.greenBtn, 95, -115, 128, 58, { button: true, text: "确定", fontSize: 26 });
});

makePrefab("BusinessAnalysisPopupScore", 880, 645, (api) => {
  api.addSprite(api.rootId, "PanelBg", sprites.largeBg, 0, 0, 880, 645);
  api.addLabel(api.rootId, "TitleLabel", "加减积分", 0, 270, 360, 64, 38);
  addClose(api, api.rootId, 880, 645);
  const c = api.node(api.rootId, "Content", 0, -40, 820, 535);
  api.addSprite(c, "ModePanel", sprites.paleBlock, -335, 0, 220, 485, { type: 1 });
  api.addSprite(c, "AddModeButton", sprites.orangeBigBtn, -335, 177, 194, 72, { button: true, text: "增加积分", fontSize: 30 });
  api.addSprite(c, "ReduceModeButton", sprites.greenBigBtn, -335, 87, 194, 72, { button: true, text: "减少积分", fontSize: 30 });
  api.addSprite(c, "ScoreInputBg", sprites.input, 165, 190, 520, 58, { type: 1 });
  api.addLabel(c, "ScoreInputLabel", "+0", 165, 190, 500, 52, 34, [120, 75, 45, 255]);
  [["1",-75,100],["2",140,100],["3",355,100],["4",-75,15],["5",140,15],["6",355,15],["7",-75,-70],["8",140,-70],["9",355,-70],[".",-75,-155],["0",140,-155],["重输",355,-155]].forEach(([t,x,y]) => {
    api.addSprite(c, "Key_" + t, sprites.key, x, y, 205, 78, { button: true, text: t, fontSize: t.length > 1 ? 38 : 58 });
  });
  api.addLabel(c, "MyScoreLabel", "我的积分：99999", -95, -245, 280, 42, 28, [82,72,150,255]);
  api.addSprite(c, "ConfirmButton", sprites.greenBtn, 360, -245, 205, 72, { button: true, text: "确认操作", fontSize: 28 });
});

function searchPopup(name, title) {
  makePrefab(name, 880, 645, (api) => {
    api.addSprite(api.rootId, "PanelBg", sprites.largeBg, 0, 0, 880, 645);
    api.addLabel(api.rootId, "TitleLabel", title, 0, 270, 360, 64, 38);
    addClose(api, api.rootId, 880, 645);
    const c = api.node(api.rootId, "Content", 0, -40, 820, 535);
    api.addSprite(c, "InputPanel", sprites.paleBlock, 0, 215, 760, 84, { type: 1 });
    api.addLabel(c, "InputTitle", "输入ID号：", -255, 215, 190, 54, 34);
    api.addSprite(c, "SearchInput", sprites.input, 115, 215, 450, 58, { type: 1 });
    [["1",-270,105],["2",0,105],["3",270,105],["4",-270,0],["5",0,0],["6",270,0],["7",-270,-105],["8",0,-105],["9",270,-105],["重输",-270,-210],["0",0,-210],["删除",270,-210]].forEach(([t,x,y]) => {
      api.addSprite(c, "Key_" + t, sprites.key, x, y, 260, 92, { button: true, text: t, fontSize: t.length > 1 ? 42 : 64 });
    });
    api.addSprite(c, "SearchConfirmButton", sprites.greenBtn, 380, -285, 128, 58, { button: true, text: "查询", fontSize: 26 });
  });
}
searchPopup("BusinessAnalysisPopupSearchMember", "搜索成员");
searchPopup("BusinessAnalysisPopupSearch", "查询");

makePrefab("BusinessAnalysisPopupChildren", 1075, 604, (api) => {
  api.addSprite(api.rootId, "PanelBg", sprites.childrenBg, 0, 0, 1075, 604);
  api.addLabel(api.rootId, "TitleLabel", "查看下级", 0, 258, 260, 62, 40);
  addClose(api, api.rootId, 1075, 604);
  const left = api.node(api.rootId, "LeftPanel", -420, -20, 225, 470);
  api.addSprite(left, "TopUserBg", sprites.paleBlock, 0, 186, 214, 78, { type: 1 });
  api.addSprite(left, "LeaderBadge", sprites.leaderBadge, -92, 186, 30, 74);
  api.addSprite(left, "LeaderAvatar", sprites.avatar, -50, 186, 62, 62);
  api.addLabel(left, "LeaderName", "玩家信息", 35, 202, 120, 28, 20, [120,75,45,255]);
  api.addLabel(left, "LeaderId", "123456", 35, 172, 120, 28, 20, [120,75,45,255]);
  api.addSprite(left, "CaptainTabButton", sprites.orangeBigBtn, 0, 84, 205, 67, { button: true, text: "下级队长", fontSize: 32 });
  api.addSprite(left, "MemberTabButton", sprites.greenBigBtn, 0, -3, 205, 67, { button: true, text: "下级成员", fontSize: 32 });
  const right = api.node(api.rootId, "RightPanel", 120, -20, 780, 470);
  const cv = api.node(right, "CaptainView", 0, 0, 780, 420);
  const mv = api.node(right, "MemberView", 0, 0, 780, 420, { active: false });
  [["玩家信息",-295,160],["比例",-105,105],["昨日收益\n昨日局数",55,145],["今日收益\n今日局数",225,145],["积分",360,90]].forEach(([t,x,w]) => api.addLabel(cv, t+"Title", t, x, 202, w, 50, 22));
  api.addSprite(cv, "Avatar0", sprites.avatar, -345, 80, 70, 70);
  api.addLabel(cv, "Name0", "玩家信息\n123456", -270, 80, 105, 56, 20, [120,75,45,255]);
  api.addLabel(cv, "Rate0", "房费:100%\n抽水:100%", -105, 80, 125, 56, 20, [120,75,45,255]);
  api.addLabel(cv, "Yesterday0", "0\n0", 55, 80, 90, 56, 20, [120,75,45,255]);
  api.addLabel(cv, "Today0", "0\n0", 225, 80, 90, 56, 20, [120,75,45,255]);
  api.addLabel(cv, "Score0", "9999", 360, 80, 90, 40, 20, [120,75,45,255]);
  [["玩家信息",-295,160],["局数",-105,80],["积分",5,90],["大赢家次数",145,130],["总赢分",285,100],["贡献分",395,90]].forEach(([t,x,w]) => api.addLabel(mv, t+"Title", t, x, 202, w, 50, 22));
  for (let i=0;i<2;i++) {
    const y = 80 - i*104;
    api.addSprite(mv, "Avatar"+i, sprites.avatar, -345, y, 70, 70);
    api.addLabel(mv, "Name"+i, "玩家信息\n123456", -270, y, 105, 56, 20, [120,75,45,255]);
    api.addLabel(mv, "Rounds"+i, "99", -105, y, 80, 40, 20, [120,75,45,255]);
    api.addLabel(mv, "Score"+i, "999999", 5, y, 100, 40, 20, [120,75,45,255]);
    api.addLabel(mv, "Winner"+i, "0", 145, y, 100, 40, 20, [120,75,45,255]);
    api.addLabel(mv, "TotalWin"+i, "9999", 285, y, 100, 40, 20, [120,75,45,255]);
    api.addLabel(mv, "Contribution"+i, "9999", 395, y, 90, 40, 20, [120,75,45,255]);
  }
  api.addSprite(right, "SearchInputBg", sprites.input, -235, -220, 290, 50);
  api.addSprite(right, "SearchButton", sprites.dateBtn, 55, -220, 126, 52, { button: true, text: "查询", fontSize: 26 });
});

makePrefab("BusinessAnalysisPopupRecord", 1075, 604, (api) => {
  api.addSprite(api.rootId, "PanelBg", sprites.largeBg, 0, 0, 1075, 604);
  api.addLabel(api.rootId, "TitleLabel", "战绩明细", 0, 258, 260, 62, 38);
  addClose(api, api.rootId, 1075, 604);
  const c = api.node(api.rootId, "Content", 0, -28, 980, 485);
  ["06月28日","06月27日","06月27日","06月27日","06月27日","06月27日","06月27日"].forEach((t,i)=>api.addSprite(c,"DateTab"+i,i===0?sprites.orangeBigBtn:sprites.greenBigBtn,-440+i*145,205,130,54,{button:true,text:t,fontSize:24}));
  api.addSprite(c, "Avatar", sprites.avatar, -430, 145, 66, 66);
  api.addLabel(c, "UserNameLabel", "玩家信息\n123456", -350, 145, 125, 66, 22, [130,75,35,255]);
  api.addLabel(c, "TodayRoundsLabel", "今日局数：1", -90, 145, 210, 52, 26, [130,75,35,255]);
  api.addLabel(c, "WinLabel", "输赢：-35.6", 230, 145, 230, 52, 26, [50,155,70,255]);
  api.addLabel(c, "RoomInfoLabel", "房间ID:123456  2019-12-12 12:12", -315, 66, 350, 36, 22);
  api.addLabel(c, "GameNameLabel", "牛牛0.5底", 0, 66, 180, 36, 22);
  api.addLabel(c, "ReplayCodeLabel", "回访码：WEEWTFDGDFFGDFGAF", 270, 66, 360, 36, 22);
  for(let i=0;i<8;i++){const x=-390+i*100; api.addLabel(c,"PlayerName"+i,"哇卡一为...\n12****6",x,-28,80,42,16,[130,75,35,255]); api.addLabel(c,"PlayerScore"+i,i===0?"+3605":"-36",x,-70,82,30,20,i===0?[220,130,25,255]:[45,92,210,255]);}
  api.addSprite(c,"CopyReplayCodeButton",sprites.smallBlueBtn,415,-4,132,54,{button:true,text:"复制回放码",fontSize:21});
  api.addSprite(c,"OpenReplayButton",sprites.smallBlueBtn,415,-68,132,54,{button:true,text:"查看回放",fontSize:22});
});

makePrefab("BusinessAnalysisPopupReplay", 1075, 604, (api) => {
  api.addSprite(api.rootId, "PanelBg", sprites.largeBg, 0, 0, 1075, 604);
  api.addLabel(api.rootId, "TitleLabel", "战绩回放", 0, 258, 260, 62, 38);
  addClose(api, api.rootId, 1075, 604);
  const c = api.node(api.rootId, "Content", 0, -28, 980, 485);
  api.addLabel(c, "RoomLabel", "房间号：9999999", -350, 195, 240, 36, 22);
  api.addLabel(c, "RoundLabel", "局数：7", -130, 195, 120, 36, 22);
  [["输",78,[55,115,190,255]],["赢",-92,[180,100,45,255]]].forEach(([r,y,col],idx)=>{api.addLabel(c,"ReplayResult"+idx,r,-430,y+8,80,60,48,col);api.addLabel(c,"ReplayRound"+idx,"1/7",-350,y+5,90,60,42,[95,62,45,255]);for(let i=0;i<8;i++){let x=-130+(i%2)*260;let yy=y+50-Math.floor(i/2)*34;api.addLabel(c,"ReplayPlayer"+idx+"_"+i,"玩家昵称...",x,yy,140,30,21,[60,95,195,255]);api.addLabel(c,"ReplayScore"+idx+"_"+i,i===1?"-180":"+18",x+120,yy,90,30,21,i===1?[35,155,70,255]:[190,45,45,255]);}api.addSprite(c,"ReplayButton"+idx,sprites.smallBlueBtn,390,y,145,56,{button:true,text:"查看回放",fontSize:22});});
});

console.log("Generated business analysis popup prefabs:", outDir);
