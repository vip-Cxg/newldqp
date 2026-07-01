const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const PREFAB_DIR = path.join(ROOT, 'assets/GamePoker/GameDniu/Prefab');
const MATERIAL_UUID = 'eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432';

function uuid() {
  return crypto.randomUUID();
}

function fileId() {
  return crypto.randomBytes(12).toString('base64').replace(/[+/=]/g, '').slice(0, 20);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function writeFolderMeta(dir) {
  const meta = `${dir}.meta`;
  if (fs.existsSync(meta)) return;
  writeJson(meta, {
    ver: '1.1.3',
    uuid: uuid(),
    importer: 'folder',
    isBundle: false,
    bundleName: '',
    priority: 1,
    compressionType: {},
    optimizeHotUpdate: {},
    inlineSpriteFrames: {},
    isRemoteBundle: {},
    subMetas: {},
  });
}

function vec2(x, y) {
  return { __type__: 'cc.Vec2', x, y };
}

function vec3(x, y, z) {
  return { __type__: 'cc.Vec3', x, y, z };
}

function size(width, height) {
  return { __type__: 'cc.Size', width, height };
}

function color(r, g, b, a = 255) {
  return { __type__: 'cc.Color', r, g, b, a };
}

function trs(x, y, sx = 1, sy = 1) {
  return {
    __type__: 'TypedArray',
    ctor: 'Float64Array',
    array: [x, y, 0, 0, 0, 0, 1, sx, sy, 1],
  };
}

class PrefabBuilder {
  constructor(name, width, height) {
    this.assetUuid = uuid();
    this.objects = [
      {
        __type__: 'cc.Prefab',
        _name: '',
        _objFlags: 0,
        _native: '',
        data: { __id__: 1 },
        optimizationPolicy: 0,
        asyncLoadAssets: false,
        readonly: false,
      },
    ];
    this.root = this.node(name, null, 0, 0, width, height);
  }

  ref(id) {
    return { __id__: id };
  }

  node(name, parentId, x = 0, y = 0, width = 100, height = 100, active = true) {
    const id = this.objects.length;
    const prefabInfoId = id + 1;
    const node = {
      __type__: 'cc.Node',
      _name: name,
      _objFlags: 0,
      _parent: parentId == null ? null : this.ref(parentId),
      _children: [],
      _active: active,
      _components: [],
      _prefab: this.ref(prefabInfoId),
      _opacity: 255,
      _color: color(255, 255, 255, 255),
      _contentSize: size(width, height),
      _anchorPoint: vec2(0.5, 0.5),
      _trs: trs(x, y),
      _eulerAngles: vec3(0, 0, 0),
      _skewX: 0,
      _skewY: 0,
      _is3DNode: false,
      _groupIndex: 0,
      groupIndex: 0,
      _id: '',
    };
    const prefabInfo = {
      __type__: 'cc.PrefabInfo',
      root: this.ref(1),
      asset: { __uuid__: this.assetUuid },
      fileId: fileId(),
      sync: false,
    };
    this.objects.push(node, prefabInfo);
    if (parentId != null) {
      this.objects[parentId]._children.push(this.ref(id));
    }
    return id;
  }

  sprite(nodeId, r = 255, g = 255, b = 255, a = 255) {
    const id = this.objects.length;
    this.objects.push({
      __type__: 'cc.Sprite',
      _name: '',
      _objFlags: 0,
      node: this.ref(nodeId),
      _enabled: true,
      _materials: [{ __uuid__: MATERIAL_UUID }],
      _srcBlendFactor: 770,
      _dstBlendFactor: 771,
      _spriteFrame: null,
      _type: 0,
      _sizeMode: 1,
      _fillType: 0,
      _fillCenter: vec2(0, 0),
      _fillStart: 0,
      _fillRange: 0,
      _isTrimmedMode: true,
      _atlas: null,
      _id: '',
    });
    this.objects[nodeId]._components.push(this.ref(id));
    this.objects[nodeId]._color = color(r, g, b, a);
    return id;
  }

  label(nodeId, text, fontSize = 24, r = 255, g = 255, b = 255) {
    const id = this.objects.length;
    this.objects.push({
      __type__: 'cc.Label',
      _name: '',
      _objFlags: 0,
      node: this.ref(nodeId),
      _enabled: true,
      _useOriginalSize: false,
      _actualFontSize: fontSize,
      _fontSize: fontSize,
      _lineHeight: fontSize + 6,
      _enableWrapText: true,
      _N$file: null,
      _isSystemFontUsed: true,
      _spacingX: 0,
      _N$string: text,
      _N$horizontalAlign: 1,
      _N$verticalAlign: 1,
      _N$fontFamily: 'Arial',
      _N$overflow: 0,
    });
    this.objects[nodeId]._components.push(this.ref(id));
    this.objects[nodeId]._color = color(r, g, b, 255);
    return id;
  }

  button(nodeId) {
    const id = this.objects.length;
    this.objects.push({
      __type__: 'cc.Button',
      _name: '',
      _objFlags: 0,
      node: this.ref(nodeId),
      _enabled: true,
      transition: 3,
      pressedColor: color(120, 120, 120, 255),
      hoverColor: color(255, 255, 255, 255),
      duration: 0.1,
      zoomScale: 0.96,
      clickEvents: [],
      _N$interactable: true,
      _N$enableAutoGrayEffect: false,
      _N$normalColor: color(255, 255, 255, 255),
      _N$disabledColor: color(124, 124, 124, 255),
      _N$target: this.ref(nodeId),
      _id: '',
    });
    this.objects[nodeId]._components.push(this.ref(id));
    return id;
  }

  save(name) {
    ensureDir(PREFAB_DIR);
    writeJson(path.join(PREFAB_DIR, `${name}.prefab`), this.objects);
    writeJson(path.join(PREFAB_DIR, `${name}.prefab.meta`), {
      ver: '1.3.2',
      uuid: this.assetUuid,
      importer: 'prefab',
      optimizationPolicy: 'AUTO',
      asyncLoadAssets: false,
      readonly: false,
      subMetas: {},
    });
  }
}

function addLabelNode(builder, parentId, name, text, x, y, w, h, sizeValue = 24) {
  const id = builder.node(name, parentId, x, y, w, h);
  builder.label(id, text, sizeValue);
  return id;
}

function buildSeat() {
  const b = new PrefabBuilder('DniuSeat', 180, 160);
  const root = b.root;
  const avatarFrame = b.node('AvatarFrame', root, 0, 38, 72, 72);
  b.sprite(avatarFrame, 255, 220, 96, 255);
  const avatarMask = b.node('AvatarMask', avatarFrame, 0, 0, 62, 62);
  b.sprite(avatarMask, 210, 225, 242, 255);
  const avatarSprite = b.node('AvatarSprite', avatarMask, 0, 0, 58, 58);
  b.sprite(avatarSprite, 180, 196, 218, 255);
  const bankerIcon = addLabelNode(b, avatarFrame, 'BankerIcon', '庄', 38, 26, 36, 36, 22);
  bankerIcon && (b.objects[bankerIcon]._active = false);
  const nameBg = b.node('NameBg', root, 0, -10, 110, 26);
  b.sprite(nameBg, 0, 0, 0, 220);
  addLabelNode(b, nameBg, 'NameLabel', '玩家名', 0, 0, 106, 24, 18);
  addLabelNode(b, root, 'ScoreLabel', '10000', 0, -40, 120, 24, 18);
  addLabelNode(b, root, 'ReadyStatus', '已准备', 0, -66, 120, 24, 20);
  addLabelNode(b, root, 'CallBetStatus', '下注 x1', 0, -92, 132, 24, 20);
  addLabelNode(b, root, 'NiuTypeLabel', '牛牛 x3', 0, -118, 132, 26, 22);
  addLabelNode(b, root, 'TurnScoreLabel', '+20', 0, -146, 100, 26, 22);
  b.save('DniuSeat');
}

function buildCard() {
  const b = new PrefabBuilder('DniuCard', 72, 104);
  const root = b.root;
  const back = b.node('Back', root, 0, 0, 72, 104);
  b.sprite(back, 46, 114, 182, 255);
  addLabelNode(b, back, 'BackLabel', '斗牛', 0, 0, 60, 30, 18);
  const front = b.node('Front', root, 0, 0, 72, 104, false);
  b.sprite(front, 250, 248, 238, 255);
  addLabelNode(b, front, 'RankSmall', 'A', -22, 34, 28, 28, 22);
  addLabelNode(b, front, 'SuitSmall', '♠', -22, 12, 28, 28, 22);
  addLabelNode(b, front, 'SuitCenter', '♠', 12, -10, 38, 38, 30);
  const highlight = b.node('Highlight', root, 0, 0, 78, 110, false);
  b.sprite(highlight, 255, 225, 80, 90);
  b.save('DniuCard');
}

function buildCardGroup() {
  const b = new PrefabBuilder('DniuCardGroup', 280, 130);
  const root = b.root;
  for (let i = 0; i < 5; i++) {
    const slot = b.node(`CardSlot${i + 1}`, root, (i - 2) * 44, 0, 72, 104);
    b.sprite(slot, 46, 114, 182, 255);
    addLabelNode(b, slot, 'Placeholder', String(i + 1), 0, 0, 40, 30, 20);
  }
  addLabelNode(b, root, 'NiuResult', '牛牛 x3', 0, -72, 160, 34, 26);
  b.save('DniuCardGroup');
}

function buildActionPanel() {
  const b = new PrefabBuilder('DniuActionPanel', 600, 96);
  const root = b.root;
  const bg = b.node('Bg', root, 0, 0, 600, 96);
  b.sprite(bg, 0, 0, 0, 90);
  const labels = ['不抢', '1倍', '2倍', '3倍', '4倍'];
  labels.forEach((label, i) => {
    const btn = b.node(`Button_${i}`, root, -224 + i * 112, 0, 96, 50);
    b.sprite(btn, i === 0 ? 116 : 222, i === 0 ? 112 : 162, i === 0 ? 108 : 48, 255);
    b.button(btn);
    addLabelNode(b, btn, 'Label', label, 0, 0, 88, 42, 24);
  });
  b.save('DniuActionPanel');
}

function buildRubCardPanel() {
  const b = new PrefabBuilder('DniuRubCardPanel', 360, 220);
  const root = b.root;
  const bg = b.node('Bg', root, 0, 0, 360, 220);
  b.sprite(bg, 0, 0, 0, 120);
  const preview = b.node('RubCardPreview', root, 0, 36, 130, 150);
  const cardBack = b.node('CardBack', preview, 0, 0, 72, 104);
  b.sprite(cardBack, 46, 114, 182, 255);
  const cardFrontMask = b.node('CardFrontMask', preview, 0, -16, 72, 36);
  b.sprite(cardFrontMask, 250, 248, 238, 180);
  const fingerGuide = addLabelNode(b, preview, 'FingerGuide', '手势', 0, -70, 80, 24, 18);
  b.objects[fingerGuide]._active = false;
  const rubBtn = b.node('RubButton', root, -72, -78, 108, 48);
  b.sprite(rubBtn, 72, 190, 90, 255);
  b.button(rubBtn);
  addLabelNode(b, rubBtn, 'Label', '搓牌', 0, 0, 96, 42, 24);
  const openBtn = b.node('OpenButton', root, 72, -78, 108, 48);
  b.sprite(openBtn, 72, 190, 90, 255);
  b.button(openBtn);
  addLabelNode(b, openBtn, 'Label', '开牌', 0, 0, 96, 42, 24);
  addLabelNode(b, root, 'Countdown', '4', 0, 92, 80, 48, 36);
  b.save('DniuRubCardPanel');
}

function buildEffectLayer() {
  const b = new PrefabBuilder('DniuEffectLayer', 1136, 640);
  const root = b.root;
  addLabelNode(b, root, 'BankerEffect', '庄标飞行动画挂点', 0, 80, 240, 34, 22);
  addLabelNode(b, root, 'ChipEffect', '筹码动画挂点', 0, 20, 220, 34, 22);
  addLabelNode(b, root, 'CoinEffect', '金币动画挂点', 0, -40, 220, 34, 22);
  addLabelNode(b, root, 'ToastEffect', '提示动画挂点', 0, -100, 220, 34, 22);
  b.save('DniuEffectLayer');
}

function buildResultLayer() {
  const b = new PrefabBuilder('DniuResultLayer', 720, 420);
  const root = b.root;
  const bg = b.node('RoundSummary', root, 0, 0, 720, 420, false);
  b.sprite(bg, 0, 0, 0, 170);
  addLabelNode(b, bg, 'Title', '本局结算', 0, 160, 220, 42, 30);
  addLabelNode(b, bg, 'PlayerList', '玩家结算列表', 0, 20, 360, 180, 24);
  const continueTip = addLabelNode(b, root, 'ContinueTip', '准备进入下一局', 0, -250, 260, 38, 26);
  b.objects[continueTip]._active = false;
  b.save('DniuResultLayer');
}

function buildSceneRoot() {
  const b = new PrefabBuilder('SceneDniuRoot', 1136, 640);
  const root = b.root;
  const background = b.node('BackgroundLayer', root, 0, 0, 1136, 640);
  const tableBg = b.node('TableBg', background, 0, 0, 1136, 640);
  b.sprite(tableBg, 26, 126, 106, 255);
  const darkMask = b.node('DarkMask', background, 0, 0, 1136, 640);
  b.sprite(darkMask, 0, 0, 0, 20);
  const safeArea = b.node('SafeAreaGuides', background, 0, 0, 1030, 560, false);
  b.sprite(safeArea, 255, 255, 255, 30);

  const top = b.node('TopLayer', root, 0, 280, 1136, 120);
  const back = b.node('BackButton', top, -510, 0, 92, 64);
  b.sprite(back, 48, 78, 118, 255);
  b.button(back);
  addLabelNode(b, back, 'Label', '<', 0, 0, 60, 50, 34);
  addLabelNode(b, top, 'RoomInfo', '房间号: --', 380, 0, 220, 40, 22);
  addLabelNode(b, top, 'NetworkInfo', '1ms', 300, 32, 100, 30, 18);
  const ruleBtn = b.node('RuleButton', top, 455, 0, 70, 70);
  b.sprite(ruleBtn, 70, 70, 70, 160);
  b.button(ruleBtn);
  addLabelNode(b, ruleBtn, 'Label', '规', 0, 0, 50, 40, 24);
  const menuBtn = b.node('MenuButton', top, 520, 0, 70, 70);
  b.sprite(menuBtn, 70, 70, 70, 160);
  b.button(menuBtn);
  addLabelNode(b, menuBtn, 'Label', '≡', 0, 0, 50, 40, 28);

  const table = b.node('TableLayer', root, 0, 0, 1136, 520);
  const seatRoot = b.node('SeatRoot', table, 0, 0, 1136, 520);
  const cardRoot = b.node('CardRoot', table, 0, 0, 1136, 520);
  const seats = [
    ['Seat_0_Self', 0, -214],
    ['Seat_1_RightLow', 410, -112],
    ['Seat_2_RightMid', 430, 44],
    ['Seat_3_RightTop', 320, 184],
    ['Seat_4_Top', 0, 210],
    ['Seat_5_LeftTop', -320, 184],
    ['Seat_6_LeftMid', -430, 44],
    ['Seat_7_LeftLow', -410, -112],
  ];
  seats.forEach(([name, x, y]) => {
    const seat = b.node(name, seatRoot, x, y, 180, 160);
    b.sprite(seat, 255, 255, 255, 45);
    addLabelNode(b, seat, 'PrefabPlaceholder', 'DniuSeat', 0, 0, 120, 28, 18);
    const cards = b.node(name.replace('Seat_', 'Cards_'), cardRoot, x, y - 34, 280, 130);
    b.sprite(cards, 255, 255, 255, 25);
    addLabelNode(b, cards, 'PrefabPlaceholder', 'DniuCardGroup', 0, 0, 150, 28, 18);
  });
  const center = b.node('CenterRoot', table, 0, 0, 360, 220);
  addLabelNode(b, center, 'Clock', '4', 0, 40, 100, 56, 36);
  addLabelNode(b, center, 'PhaseTitle', '抢庄', 0, 98, 180, 42, 30);
  addLabelNode(b, center, 'BankerFlyStart', '庄', 0, 0, 56, 56, 32);
  addLabelNode(b, center, 'PotArea', '筹码区', 0, -78, 160, 40, 22);
  b.node('EffectRoot', table, 0, 0, 1136, 520);

  const action = b.node('ActionLayer', root, 0, -214, 1136, 170);
  addLabelNode(b, action, 'CallBankerPanel', 'DniuActionPanel: 抢庄', 0, 20, 360, 42, 22);
  addLabelNode(b, action, 'BetPanel', 'DniuActionPanel: 下注', 0, -28, 360, 42, 22);
  addLabelNode(b, action, 'RubCardPanel', 'DniuRubCardPanel', 420, 0, 220, 42, 22);
  const ready = b.node('ReadyButton', action, 0, 68, 132, 68);
  b.sprite(ready, 65, 205, 92, 255);
  b.button(ready);
  addLabelNode(b, ready, 'Label', '准备', 0, 0, 110, 54, 30);
  const sit = b.node('SitButton', action, 455, -6, 118, 58);
  b.sprite(sit, 86, 205, 84, 255);
  b.button(sit);
  addLabelNode(b, sit, 'Label', '坐下', 0, 0, 100, 46, 28);

  const result = b.node('ResultLayer', root, 0, 0, 1136, 640);
  addLabelNode(b, result, 'RoundSummary', 'DniuResultLayer', 0, 0, 260, 42, 24);
  const debug = b.node('DebugLayer', root, -400, -230, 330, 104, false);
  b.sprite(debug, 0, 0, 0, 80);
  addLabelNode(b, debug, 'DniuDebugPanel', '斗牛测试面板', 0, 0, 220, 34, 20);
  b.save('SceneDniuRoot');
}

function main() {
  ensureDir(PREFAB_DIR);
  writeFolderMeta(PREFAB_DIR);
  buildSeat();
  buildCard();
  buildCardGroup();
  buildActionPanel();
  buildRubCardPanel();
  buildEffectLayer();
  buildResultLayer();
  buildSceneRoot();
}

main();
