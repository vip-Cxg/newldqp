const fs = require('fs');
const path = require('path');

const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const MATERIAL_UUID = 'eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432';

const REQUIRED_ASSETS = [
  'league_main_frame',
  'league_bg_out',
  'league_bg_in',
  'row_member_bg',
  'row_simple_bg',
  'table_header_green',
  'tab_normal_green',
  'tab_selected_orange',
  'btn_close',
  'btn_green_small',
  'btn_red_small',
  'btn_blue_small',
  'btn_score_add',
  'btn_score_sub',
  'btn_search',
  'input_box',
  'input_box_bg',
  'keypad_button',
  'badge_leader',
  'badge_direct',
  'status_online',
  'status_offline',
  'stamp_banned',
  'battle_replay_row_bg',
  'row_battle_bg',
  'battle_win_icon',
  'battle_lose_icon',
  'date_input_box',
  'btn_orange'
];

const SLICED_INSETS = {
  league_main_frame: [35, 35, 35, 35],
  league_bg_out: [28, 28, 28, 28],
  league_bg_in: [24, 24, 24, 24],
  row_member_bg: [28, 28, 28, 28],
  row_simple_bg: [18, 18, 18, 18],
  table_header_green: [18, 18, 18, 18],
  input_box: [12, 12, 12, 12],
  btn_green_small: [18, 18, 18, 18],
  btn_red_small: [18, 18, 18, 18],
  btn_blue_small: [18, 18, 18, 18],
  btn_score_add: [28, 28, 28, 28],
  btn_score_sub: [28, 28, 28, 28],
  btn_search: [18, 18, 18, 18],
  keypad_button: [22, 22, 22, 22],
  row_battle_bg: [18, 18, 18, 18],
  battle_replay_row_bg: [25, 25, 25, 25],
  date_input_box: [18, 18, 18, 18],
  btn_orange: [18, 18, 18, 18]
};

const MEMBER_PAGE_LAYOUT = {
  mainFrame: { x: 664, y: 372, w: 1311, h: 717 },
  title: { x: 667, y: 48, w: 360, h: 58 },
  btnClose: { x: 1302, y: 31, w: 54, h: 54 },
  leftMenu: { x: 142, y: 396, w: 228, h: 580 },
  tabs: [
    { name: 'BtnStatistics', text: '统计', x: 142, y: 149, w: 204, h: 74, selected: false },
    { name: 'BtnPartner', text: '合伙人', x: 142, y: 230, w: 204, h: 74, selected: false },
    { name: 'BtnMember', text: '成员管理', x: 142, y: 311, w: 204, h: 74, selected: true },
    { name: 'BtnAgentStatistics', text: '代理统计', x: 142, y: 392, w: 204, h: 74, selected: false },
    { name: 'BtnRewardDetail', text: '奖励明细', x: 142, y: 473, w: 204, h: 74, selected: false },
    { name: 'BtnOperationRecord', text: '操作记录', x: 142, y: 555, w: 204, h: 74, selected: false },
    { name: 'BtnRewardWithdraw', text: '奖励提取', x: 142, y: 636, w: 204, h: 74, selected: false }
  ],
  pageRoot: { x: 783, y: 395, w: 1040, h: 582 },
  pageBg: { x: 783, y: 395, w: 1040, h: 582 },
  tableHeader: { x: 782, y: 136, w: 1028, h: 63 },
  scrollView: { x: 782, y: 355, w: 1028, h: 372 },
  memberRow: { x: 782, y: 260, w: 1028, h: 184 },
  rowSpacingY: 4,
  searchInput: { x: 425, y: 650, w: 290, h: 48 },
  searchButton: { x: 648, y: 648, w: 131, h: 67 },
  rowNodes: {
    roleBadge: { x: 282, y: 206, w: 22, h: 56 },
    avatar: { x: 320, y: 212, w: 72, h: 72 },
    name: { x: 400, y: 204, w: 120, h: 30 },
    userID: { x: 400, y: 235, w: 120, h: 30 },
    status: { x: 545, y: 226, w: 90, h: 42 },
    rounds: { x: 742, y: 224, w: 80, h: 64 },
    contribution: { x: 906, y: 224, w: 90, h: 64 },
    result: { x: 1065, y: 224, w: 90, h: 64 },
    score: { x: 1215, y: 224, w: 100, h: 42 },
    todayBox: { x: 371, y: 295, w: 160, h: 30 },
    yesterdayBox: { x: 371, y: 329, w: 160, h: 30 },
    btnSetPartner: { x: 629, y: 314, w: 127, h: 47 },
    btnLimitGame: { x: 776, y: 314, w: 127, h: 47 },
    btnBattleDetail: { x: 923, y: 314, w: 127, h: 47 },
    btnAddScore: { x: 1066, y: 311, w: 131, h: 67 },
    btnSubScore: { x: 1217, y: 311, w: 131, h: 67 }
  }
};

const SCORE_POPUP_LAYOUT = {
  windowFrame: { x: 693, y: 366, w: 892, h: 647 },
  btnClose: { x: 1125, y: 57, w: 58, h: 58 },
  panelRoot: { x: 691, y: 385, w: 862, h: 556 },
  title: { x: 693, y: 73, w: 300, h: 56 },
  leftPanel: { x: 378, y: 386, w: 222, h: 552 },
  inputPanel: { x: 807, y: 152, w: 624, h: 91 },
  inputBox: { x: 809, y: 156, w: 550, h: 58 },
  btnAddMode: { x: 375, y: 156, w: 200, h: 74 },
  btnSubMode: { x: 375, y: 242, w: 200, h: 74 },
  myScore: { x: 620, y: 612, w: 260, h: 42 },
  btnConfirm: { x: 1014, y: 609, w: 202, h: 70 },
  keyboard: { x: 807, y: 376, keyW: 207, keyH: 84, gapX: 5, gapY: 6 }
};

function cx(rect) { return rect.x - 667; }
function cy(rect) { return 375 - rect.y; }
function lx(rect, parentRect) { return rect.x - parentRect.x; }
function ly(rect, parentRect) { return parentRect.y - rect.y; }

const SCRIPT_UUIDS = {
  LeagueAnalysisView: '69d4b51e-025d-4e83-b25a-fad0da38f000',
  MemberRow: '69d4b51e-025d-4e83-b25a-fad0da38f002',
  SearchMemberPopup: '69d4b51e-025d-4e83-b25a-fad0da38f003',
  ScorePopup: '69d4b51e-025d-4e83-b25a-fad0da38f004',
  SetPartnerPopup: '69d4b51e-025d-4e83-b25a-fad0da38f005',
  BattleDetailPopup: '69d4b51e-025d-4e83-b25a-fad0da38f006',
  BattleReplayPopup: '69d4b51e-025d-4e83-b25a-fad0da38f007',
  BattleDetailRow: '69d4b51e-025d-4e83-b25a-fad0da38f009',
  BattleReplayRow: '69d4b51e-025d-4e83-b25a-fad0da38f00a',
  ConfirmPopup: '69d4b51e-025d-4e83-b25a-fad0da38f008'
};

const PREFAB_UUIDS = {
  LeagueAnalysisView: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0000',
  MemberPage: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0002',
  MemberRow: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0003',
  SearchMemberPopup: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0004',
  ScorePopup: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0005',
  SetPartnerPopup: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0006',
  BattleDetailPopup: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0007',
  BattleReplayPopup: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0008',
  BattleDetailRow: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0010',
  BattleReplayRow: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0011',
  ConfirmPopup: '1bf7c1f0-9112-4d6e-9a91-6b87f12c0009'
};

const PREFAB_LAYOUT_FILES = {
  LeagueAnalysisView: 'league_analysis_view.json',
  MemberPage: 'member_page.json',
  MemberRow: 'member_row.json',
  ScorePopup: 'score_popup.json',
  SetPartnerPopup: 'set_partner_popup.json',
  SearchMemberPopup: 'search_member_popup.json',
  BattleDetailPopup: 'battle_detail_popup.json',
  BattleReplayPopup: 'battle_replay_popup.json',
  ConfirmPopup: 'confirm_popup.json',
  BattleDetailRow: 'battle_detail_row.json',
  BattleReplayRow: 'battle_replay_row.json'
};

const DEFAULT_LOCK = {
  lockManualLayout: true,
  protectedPrefabs: Object.keys(PREFAB_LAYOUT_FILES)
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJSON(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function writeText(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, data);
}

function compactUuid(uuid) {
  const clean = uuid.replace(/-/g, '');
  let out = clean.slice(0, 5);
  for (let i = 5; i < clean.length; i += 3) {
    const value = parseInt(clean.slice(i, i + 3), 16);
    out += BASE64_KEYS[value >> 6] + BASE64_KEYS[value & 0x3f];
  }
  return out;
}

function newMeta(uuid, importer = 'prefab') {
  return importer === 'javascript'
    ? {
      ver: '1.1.0',
      uuid,
      importer,
      isPlugin: false,
      loadPluginInWeb: true,
      loadPluginInNative: true,
      loadPluginInEditor: false,
      subMetas: {}
    }
    : {
      ver: '1.2.4',
      uuid,
      importer,
      optimizationPolicy: 'AUTO',
      asyncLoadAssets: false,
      readonly: false,
      subMetas: {}
    };
}

function dirMeta(uuid) {
  return { ver: '1.1.3', uuid, importer: 'folder', isBundle: false, bundleName: '', priority: 1, compressionType: {}, optConfig: {}, subMetas: {} };
}

function scanSprites(root) {
  const dir = path.join(root, 'assets/resources/LeagueAnalysis');
  const map = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.meta')) continue;
    const meta = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (!meta.subMetas) continue;
    Object.keys(meta.subMetas).forEach(key => {
      if (meta.subMetas[key].uuid) map[key] = meta.subMetas[key].uuid;
    });
  }
  return map;
}

function layoutDir(root) {
  return path.join(root, 'docs/league-analysis/layout');
}

function layoutFile(root, prefabName) {
  return path.join(layoutDir(root), PREFAB_LAYOUT_FILES[prefabName]);
}

function lockFile(root) {
  return path.join(layoutDir(root), 'lock.json');
}

function ensureLayoutLock(root) {
  const file = lockFile(root);
  if (!fs.existsSync(file)) writeJSON(file, DEFAULT_LOCK);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return DEFAULT_LOCK;
  }
}

function prefabPath(root, prefabName) {
  return path.join(root, 'assets/prefabs/LeagueAnalysis', prefabName + '.prefab');
}

function readPrefabData(root, prefabName) {
  const file = prefabPath(root, prefabName);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function roundValue(value) {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}

function refId(ref) {
  return ref && typeof ref.__id__ === 'number' ? ref.__id__ : null;
}

function colorToPlain(value) {
  if (!value) return null;
  return {
    r: value.r == null ? 255 : value.r,
    g: value.g == null ? 255 : value.g,
    b: value.b == null ? 255 : value.b,
    a: value.a == null ? 255 : value.a
  };
}

function plainToColor(value) {
  if (!value) return null;
  return color([value.r, value.g, value.b, value.a]);
}

function makeSpriteReverseMap(root) {
  const sprites = scanSprites(root);
  const map = {};
  Object.keys(sprites).forEach(name => { map[sprites[name]] = name; });
  return map;
}

function buildPrefabIndex(data) {
  const nodeIds = [];
  const nodeById = {};
  const compByNode = {};
  const parentOf = {};
  data.forEach((item, index) => {
    if (item && item.__type__ === 'cc.Node') {
      nodeIds.push(index);
      nodeById[index] = item;
      (item._children || []).forEach(child => {
        const id = refId(child);
        if (id != null) parentOf[id] = index;
      });
    }
  });
  data.forEach((item, index) => {
    if (!item || !item.node) return;
    const nid = refId(item.node);
    if (nid == null || !nodeById[nid]) return;
    if (!compByNode[nid]) compByNode[nid] = [];
    compByNode[nid].push({ id: index, comp: item });
  });
  const rootId = refId(data[0] && data[0].data) || nodeIds[0];
  const pathByNodeId = {};
  const nodeIdByPath = {};
  function walk(id, prefix) {
    const node = nodeById[id];
    if (!node) return;
    const p = prefix ? prefix + '/' + node._name : node._name;
    pathByNodeId[id] = p;
    nodeIdByPath[p] = id;
    (node._children || []).forEach(child => walk(refId(child), p));
  }
  walk(rootId, '');
  return { nodeIds, nodeById, compByNode, parentOf, rootId, pathByNodeId, nodeIdByPath };
}

function componentOf(index, nodeId, type) {
  const comps = index.compByNode[nodeId] || [];
  for (let i = 0; i < comps.length; i++) {
    if (comps[i].comp.__type__ === type) return comps[i].comp;
  }
  return null;
}

function extractLayoutFromPrefab(root, prefabName) {
  const data = readPrefabData(root, prefabName);
  if (!data) return null;
  const index = buildPrefabIndex(data);
  const spriteNames = makeSpriteReverseMap(root);
  const nodes = {};
  index.nodeIds.forEach(nodeId => {
    const node = index.nodeById[nodeId];
    const p = index.pathByNodeId[nodeId];
    const arr = node._trs && node._trs.array ? node._trs.array : [];
    const parent = index.nodeById[index.parentOf[nodeId]];
    const zIndex = parent && parent._children ? parent._children.findIndex(child => refId(child) === nodeId) : 0;
    const entry = {
      path: p,
      x: roundValue(arr[0]),
      y: roundValue(arr[1]),
      width: roundValue(node._contentSize && node._contentSize.width),
      height: roundValue(node._contentSize && node._contentSize.height),
      anchorX: roundValue(node._anchorPoint && node._anchorPoint.x),
      anchorY: roundValue(node._anchorPoint && node._anchorPoint.y),
      scaleX: roundValue(arr[7] == null ? 1 : arr[7]),
      scaleY: roundValue(arr[8] == null ? 1 : arr[8]),
      active: node._active !== false,
      opacity: node._opacity == null ? 255 : node._opacity,
      zIndex,
      color: colorToPlain(node._color)
    };
    const label = componentOf(index, nodeId, 'cc.Label');
    if (label) {
      entry.label = {
        fontSize: label._fontSize,
        lineHeight: label._lineHeight,
        horizontalAlign: label._N$horizontalAlign,
        verticalAlign: label._N$verticalAlign
      };
    }
    const sprite = componentOf(index, nodeId, 'cc.Sprite');
    if (sprite) {
      const uuid = sprite._spriteFrame && sprite._spriteFrame.__uuid__;
      entry.sprite = {
        assetName: spriteNames[uuid] || null,
        uuid: uuid || null,
        type: sprite._type
      };
    }
    const button = componentOf(index, nodeId, 'cc.Button');
    if (button) {
      const tid = refId(button._target);
      entry.button = { targetPath: tid == null ? null : index.pathByNodeId[tid] || null };
    }
    const scrollView = componentOf(index, nodeId, 'cc.ScrollView');
    if (scrollView) {
      const cid = refId(scrollView.content);
      entry.scrollView = { contentPath: cid == null ? null : index.pathByNodeId[cid] || null };
    }
    const layout = componentOf(index, nodeId, 'cc.Layout');
    if (layout) {
      entry.layout = {
        type: layout._type,
        resizeMode: layout._resize,
        spacingX: layout._spacingX,
        spacingY: layout._spacingY,
        paddingLeft: layout._N$paddingLeft,
        paddingRight: layout._N$paddingRight,
        paddingTop: layout._N$paddingTop,
        paddingBottom: layout._N$paddingBottom
      };
    }
    nodes[p] = entry;
  });
  return {
    version: 1,
    sourcePrefab: 'assets/prefabs/LeagueAnalysis/' + prefabName + '.prefab',
    generatedAt: new Date().toISOString(),
    nodes
  };
}

function pullLayoutsFromPrefabs(root) {
  ensureDir(layoutDir(root));
  const lock = ensureLayoutLock(root);
  const pulled = [];
  const missing = [];
  Object.keys(PREFAB_LAYOUT_FILES).forEach(prefabName => {
    const layout = extractLayoutFromPrefab(root, prefabName);
    if (!layout) {
      missing.push(prefabName);
      return;
    }
    writeJSON(layoutFile(root, prefabName), layout);
    pulled.push(prefabName);
  });
  return { pulled, missing, lock };
}

function ensureLayoutFilesFromCurrentPrefabs(root) {
  ensureDir(layoutDir(root));
  ensureLayoutLock(root);
  const created = [];
  Object.keys(PREFAB_LAYOUT_FILES).forEach(prefabName => {
    const file = layoutFile(root, prefabName);
    if (fs.existsSync(file)) return;
    const layout = extractLayoutFromPrefab(root, prefabName);
    if (!layout) return;
    writeJSON(file, layout);
    created.push(prefabName);
  });
  return created;
}

function readLayout(root, prefabName) {
  const file = layoutFile(root, prefabName);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return null;
  }
}

function applyLayoutToPrefabData(root, prefabName, data, options = {}) {
  const layout = readLayout(root, prefabName);
  if (!layout || !layout.nodes || options.forceRebuildLayout) return { applied: 0, missingInGenerated: [] };
  const sprites = scanSprites(root);
  const index = buildPrefabIndex(data);
  const applied = [];
  const missingInGenerated = [];
  Object.keys(layout.nodes).forEach(p => {
    const nodeId = index.nodeIdByPath[p];
    const entry = layout.nodes[p];
    if (nodeId == null) {
      missingInGenerated.push(p);
      return;
    }
    const node = index.nodeById[nodeId];
    const arr = node._trs && node._trs.array;
    if (arr) {
      if (entry.x != null) arr[0] = entry.x;
      if (entry.y != null) arr[1] = entry.y;
      if (entry.scaleX != null) arr[7] = entry.scaleX;
      if (entry.scaleY != null) arr[8] = entry.scaleY;
    }
    if (entry.width != null && entry.height != null) node._contentSize = size(entry.width, entry.height);
    if (entry.anchorX != null && entry.anchorY != null) node._anchorPoint = vec2(entry.anchorX, entry.anchorY);
    if (entry.active != null) node._active = !!entry.active;
    if (entry.opacity != null) node._opacity = entry.opacity;
    const c = plainToColor(entry.color);
    if (c) node._color = c;

    const label = componentOf(index, nodeId, 'cc.Label');
    if (label && entry.label) {
      if (entry.label.fontSize != null) label._fontSize = entry.label.fontSize;
      if (entry.label.lineHeight != null) label._lineHeight = entry.label.lineHeight;
      if (entry.label.horizontalAlign != null) label._N$horizontalAlign = entry.label.horizontalAlign;
      if (entry.label.verticalAlign != null) label._N$verticalAlign = entry.label.verticalAlign;
    }
    const sprite = componentOf(index, nodeId, 'cc.Sprite');
    if (sprite && entry.sprite) {
      if (entry.sprite.type != null) sprite._type = entry.sprite.type;
      if (entry.sprite.assetName && sprites[entry.sprite.assetName]) sprite._spriteFrame = { __uuid__: sprites[entry.sprite.assetName] };
    }
    const scrollView = componentOf(index, nodeId, 'cc.ScrollView');
    if (scrollView && entry.scrollView && entry.scrollView.contentPath) {
      const cid = index.nodeIdByPath[entry.scrollView.contentPath];
      if (cid != null) scrollView.content = { __id__: cid };
    }
    const button = componentOf(index, nodeId, 'cc.Button');
    if (button && entry.button && entry.button.targetPath) {
      const tid = index.nodeIdByPath[entry.button.targetPath];
      if (tid != null) button._target = { __id__: tid };
    }
    const layoutComp = componentOf(index, nodeId, 'cc.Layout');
    if (layoutComp && entry.layout) {
      if (entry.layout.resizeMode != null) layoutComp._resize = entry.layout.resizeMode;
      if (entry.layout.spacingX != null) layoutComp._spacingX = entry.layout.spacingX;
      if (entry.layout.spacingY != null) layoutComp._spacingY = entry.layout.spacingY;
      if (entry.layout.paddingLeft != null) layoutComp._N$paddingLeft = entry.layout.paddingLeft;
      if (entry.layout.paddingRight != null) layoutComp._N$paddingRight = entry.layout.paddingRight;
      if (entry.layout.paddingTop != null) layoutComp._N$paddingTop = entry.layout.paddingTop;
      if (entry.layout.paddingBottom != null) layoutComp._N$paddingBottom = entry.layout.paddingBottom;
    }
    applied.push(p);
  });
  index.nodeIds.forEach(parentId => {
    const parent = index.nodeById[parentId];
    if (!parent || !parent._children || parent._children.length < 2) return;
    parent._children.sort((a, b) => {
      const ap = index.pathByNodeId[refId(a)];
      const bp = index.pathByNodeId[refId(b)];
      const az = layout.nodes[ap] && layout.nodes[ap].zIndex != null ? layout.nodes[ap].zIndex : 99999;
      const bz = layout.nodes[bp] && layout.nodes[bp].zIndex != null ? layout.nodes[bp].zIndex : 99999;
      return az - bz;
    });
  });
  return { applied: applied.length, missingInGenerated };
}

function validateLayoutFiles(root) {
  const result = { checked: [], missingLayout: [], missingPrefab: [], differences: [] };
  Object.keys(PREFAB_LAYOUT_FILES).forEach(prefabName => {
    const layout = readLayout(root, prefabName);
    if (!layout) {
      result.missingLayout.push(prefabName);
      return;
    }
    if (!fs.existsSync(prefabPath(root, prefabName))) {
      result.missingPrefab.push(prefabName);
      return;
    }
    result.checked.push(prefabName);
    const current = extractLayoutFromPrefab(root, prefabName);
    const currentNodes = current.nodes || {};
    Object.keys(layout.nodes || {}).forEach(p => {
      const expected = layout.nodes[p];
      const actual = currentNodes[p];
      if (!actual) {
        result.differences.push({ prefabName, path: p, field: 'node', expected: 'exists', actual: 'missingInPrefab' });
        return;
      }
      [['x', 1], ['y', 1], ['width', 1], ['height', 1], ['anchorX', 0], ['anchorY', 0], ['scaleX', 0], ['scaleY', 0]].forEach(pair => {
        const field = pair[0];
        const tolerance = pair[1];
        if (expected[field] == null || actual[field] == null) return;
        if (Math.abs(expected[field] - actual[field]) > tolerance) {
          result.differences.push({ prefabName, path: p, field, expected: expected[field], actual: actual[field] });
        }
      });
      if (expected.label && actual.label) {
        ['fontSize', 'lineHeight', 'horizontalAlign', 'verticalAlign'].forEach(field => {
          if (expected.label[field] !== actual.label[field]) {
            result.differences.push({ prefabName, path: p, field: 'label.' + field, expected: expected.label[field], actual: actual.label[field] });
          }
        });
      }
      if (expected.sprite && !actual.sprite) {
        result.differences.push({ prefabName, path: p, field: 'sprite', expected: expected.sprite.assetName || expected.sprite.uuid, actual: 'missing' });
      } else if (expected.sprite && actual.sprite && expected.sprite.assetName && actual.sprite.assetName !== expected.sprite.assetName) {
        result.differences.push({ prefabName, path: p, field: 'sprite.assetName', expected: expected.sprite.assetName, actual: actual.sprite.assetName || actual.sprite.uuid });
      }
      if (expected.scrollView && expected.scrollView.contentPath && (!actual.scrollView || actual.scrollView.contentPath !== expected.scrollView.contentPath)) {
        result.differences.push({ prefabName, path: p, field: 'scrollView.contentPath', expected: expected.scrollView.contentPath, actual: actual.scrollView && actual.scrollView.contentPath });
      }
      if (expected.button && expected.button.targetPath && (!actual.button || actual.button.targetPath !== expected.button.targetPath)) {
        result.differences.push({ prefabName, path: p, field: 'button.targetPath', expected: expected.button.targetPath, actual: actual.button && actual.button.targetPath });
      }
    });
    Object.keys(currentNodes).forEach(p => {
      if (!layout.nodes[p]) result.differences.push({ prefabName, path: p, field: 'node', expected: 'notInJson', actual: 'extraInPrefab' });
    });
  });
  writeLayoutValidationReport(root, result);
  return result;
}

function writeLayoutValidationReport(root, result) {
  const lines = ['# LeagueAnalysis Layout Validation Report', '', `生成时间：${new Date().toISOString()}`, ''];
  lines.push(`- 已检查 Prefab：${result.checked.join(', ') || '无'}`);
  lines.push(`- 缺少 Layout JSON：${result.missingLayout.join(', ') || '无'}`);
  lines.push(`- 缺少 Prefab：${result.missingPrefab.join(', ') || '无'}`);
  lines.push(`- 差异数量：${result.differences.length}`);
  lines.push('');
  if (result.differences.length) {
    lines.push('| Prefab | Path | Field | JSON | Prefab |');
    lines.push('| --- | --- | --- | --- | --- |');
    result.differences.forEach(diff => {
      lines.push(`| ${diff.prefabName} | ${diff.path} | ${diff.field} | ${JSON.stringify(diff.expected)} | ${JSON.stringify(diff.actual)} |`);
    });
  } else {
    lines.push('当前 Prefab 与 layout JSON 一致。');
  }
  writeText(path.join(layoutDir(root), 'VALIDATION_REPORT.md'), lines.join('\n') + '\n');
}

function setSlicedInsets(root) {
  const dir = path.join(root, 'assets/resources/LeagueAnalysis');
  const report = { updated: [], missing: [] };
  Object.keys(SLICED_INSETS).forEach(name => {
    const file = findMetaBySubName(dir, name);
    if (!file) {
      report.missing.push(name);
      return;
    }
    const meta = JSON.parse(fs.readFileSync(file, 'utf8'));
    const sub = meta.subMetas && meta.subMetas[name];
    if (!sub) {
      report.missing.push(name);
      return;
    }
    const inset = SLICED_INSETS[name];
    sub.borderLeft = inset[0];
    sub.borderRight = inset[1];
    sub.borderTop = inset[2];
    sub.borderBottom = inset[3];
    writeJSON(file, meta);
    report.updated.push(name);
  });
  return report;
}

function findMetaBySubName(dir, subName) {
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.meta')) continue;
    const full = path.join(dir, file);
    const meta = JSON.parse(fs.readFileSync(full, 'utf8'));
    if (meta.subMetas && meta.subMetas[subName]) return full;
  }
  return null;
}

class PrefabBuilder {
  constructor(rootName, width, height) {
    this.data = [{
      __type__: 'cc.Prefab',
      _name: '',
      _objFlags: 0,
      _native: '',
      data: { __id__: 1 },
      optimizationPolicy: 0,
      asyncLoadAssets: false,
      readonly: false
    }];
    this.root = this.node(rootName, null, 0, 0, width, height);
  }

  ref(id) { return { __id__: id }; }

  node(name, parentId, x, y, w, h, opts = {}) {
    const id = this.data.length;
    const node = {
      __type__: 'cc.Node',
      _name: name,
      _objFlags: 0,
      _parent: parentId == null ? null : this.ref(parentId),
      _children: [],
      _active: opts.active !== false,
      _components: [],
      _prefab: null,
      _opacity: opts.opacity == null ? 255 : opts.opacity,
      _color: color(opts.color || [255, 255, 255, 255]),
      _contentSize: size(w, h),
      _anchorPoint: vec2(opts.ax == null ? 0.5 : opts.ax, opts.ay == null ? 0.5 : opts.ay),
      _trs: trs(x, y, opts.scaleX || 1, opts.scaleY || 1),
      _eulerAngles: vec3(0, 0, opts.rotation || 0),
      _skewX: 0,
      _skewY: 0,
      _is3DNode: false,
      _groupIndex: 0,
      groupIndex: 0,
      _id: ''
    };
    this.data.push(node);
    if (parentId != null) this.data[parentId]._children.push(this.ref(id));
    const prefabInfoId = this.data.length;
    node._prefab = this.ref(prefabInfoId);
    this.data.push({
      __type__: 'cc.PrefabInfo',
      root: this.ref(1),
      asset: this.ref(0),
      fileId: fileId(name + id),
      sync: false
    });
    return id;
  }

  comp(nodeId, comp) {
    const id = this.data.length;
    comp.node = this.ref(nodeId);
    comp._name = comp._name || '';
    comp._objFlags = 0;
    comp._enabled = comp._enabled !== false;
    comp._id = '';
    this.data.push(comp);
    this.data[nodeId]._components.push(this.ref(id));
    return id;
  }

  sprite(nodeId, spriteFrame, type = 0) {
    return this.comp(nodeId, {
      __type__: 'cc.Sprite',
      _materials: [{ __uuid__: MATERIAL_UUID }],
      _srcBlendFactor: 770,
      _dstBlendFactor: 771,
      _spriteFrame: spriteFrame ? { __uuid__: spriteFrame } : null,
      _type: type,
      _sizeMode: 0,
      _fillType: 0,
      _fillCenter: vec2(0, 0),
      _fillStart: 0,
      _fillRange: 0,
      _isTrimmedMode: true,
      _atlas: null
    });
  }

  label(nodeId, text, fontSize = 24, colorValue = [255, 255, 255, 255], opts = {}) {
    this.data[nodeId]._color = color(colorValue);
    return this.comp(nodeId, {
      __type__: 'cc.Label',
      _materials: [{ __uuid__: MATERIAL_UUID }],
      _useOriginalSize: false,
      _string: text,
      _N$string: text,
      _fontSize: fontSize,
      _lineHeight: opts.lineHeight || Math.ceil(fontSize * 1.25),
      _enableWrapText: opts.wrap !== false,
      _N$file: null,
      _isSystemFontUsed: true,
      _spacingX: 0,
      _batchAsBitmap: false,
      _styleFlags: opts.bold ? 1 : 0,
      _underlineHeight: 0,
      _N$horizontalAlign: opts.align || 1,
      _N$verticalAlign: opts.valign || 1,
      _N$fontFamily: 'Arial',
      _N$overflow: opts.overflow || 1,
      _N$cacheMode: 0,
      _id: ''
    });
  }

  button(nodeId) {
    return this.comp(nodeId, {
      __type__: 'cc.Button',
      clickEvents: [],
      _interactable: true,
      _transition: 0,
      transition: 0,
      _normalColor: color([255, 255, 255, 255]),
      _pressedColor: color([211, 211, 211, 255]),
      pressedColor: color([211, 211, 211, 255]),
      _hoverColor: color([255, 255, 255, 255]),
      hoverColor: color([255, 255, 255, 255]),
      _disabledColor: color([124, 124, 124, 255]),
      disabledColor: color([124, 124, 124, 255]),
      _duration: 0.1,
      _zoomScale: 1.05,
      _target: null
    });
  }

  mask(nodeId) {
    return this.comp(nodeId, {
      __type__: 'cc.Mask',
      _type: 0,
      _segements: 64,
      _N$spriteFrame: null,
      _N$alphaThreshold: 1,
      _N$inverted: false
    });
  }

  scrollView(nodeId, contentId) {
    return this.comp(nodeId, {
      __type__: 'cc.ScrollView',
      content: this.ref(contentId),
      horizontal: false,
      vertical: true,
      inertia: true,
      brake: 0.75,
      elastic: true,
      bounceDuration: 0.23,
      scrollEvents: [],
      cancelInnerEvents: true,
      _N$horizontalScrollBar: null,
      _N$verticalScrollBar: null
    });
  }

  layout(nodeId, opts = {}) {
    return this.comp(nodeId, {
      __type__: 'cc.Layout',
      _layoutSize: size(opts.w || 0, opts.h || 0),
      _resize: opts.resize == null ? 0 : opts.resize,
      _N$layoutType: 2,
      _N$cellSize: size(40, 40),
      _N$startAxis: 0,
      _N$paddingLeft: opts.left || 0,
      _N$paddingRight: opts.right || 0,
      _N$paddingTop: opts.top || 0,
      _N$paddingBottom: opts.bottom || 0,
      _N$spacingX: 0,
      _N$spacingY: opts.spacingY || 8,
      _N$verticalDirection: 1,
      _N$horizontalDirection: 0
    });
  }

  script(nodeId, name, props = {}) {
    const comp = { __type__: compactUuid(SCRIPT_UUIDS[name]) };
    Object.keys(props).forEach(k => comp[k] = props[k]);
    return this.comp(nodeId, comp);
  }
}

function color(arr) {
  return { __type__: 'cc.Color', r: arr[0], g: arr[1], b: arr[2], a: arr[3] == null ? 255 : arr[3] };
}
function size(width, height) { return { __type__: 'cc.Size', width, height }; }
function vec2(x, y) { return { __type__: 'cc.Vec2', x, y }; }
function vec3(x, y, z) { return { __type__: 'cc.Vec3', x, y, z }; }
function trs(x, y, scaleX, scaleY) {
  return { __type__: 'TypedArray', ctor: 'Float64Array', array: [x, y, 0, 0, 0, 0, 1, scaleX, scaleY, 1] };
}
function fileId(seed) {
  return Buffer.from(seed).toString('base64').replace(/[+/=]/g, '').slice(0, 22) || 'fileid';
}

function addSpriteButton(b, parent, name, sf, text, x, y, w, h, font = 24, spriteType = 1) {
  const node = b.node(name, parent, x, y, w, h);
  b.sprite(node, sf, spriteType);
  b.button(node);
  const label = b.node('Label', node, 0, 1, w - 12, h - 8);
  b.label(label, text, font, [255, 255, 255, 255], { bold: true });
  return node;
}

function addLabel(b, parent, name, text, x, y, w, h, font = 24, col = [255, 255, 255, 255], opts = {}) {
  const node = b.node(name, parent, x, y, w, h);
  b.label(node, text, font, col, opts);
  return node;
}

function addSprite(b, parent, name, sf, x, y, w, h, type = 0, opts = {}) {
  const node = b.node(name, parent, x, y, w, h, opts);
  b.sprite(node, sf, type);
  return node;
}

function addSplitHeader(b, parent, name, top, bottom, x, y, w, h, font = 21) {
  const group = b.node(name, parent, x, y, w, h);
  addLabel(b, group, 'LabelTop', top, 0, 10, w, h / 2, font, [255, 255, 255, 255], { bold: true });
  addLabel(b, group, 'LabelBottom', bottom, 0, -12, w, h / 2, font, [255, 255, 255, 255], { bold: true });
  return group;
}

function addValueGroup(b, parent, name, topName, bottomName, x, y, w, h, font = 24) {
  const group = b.node(name, parent, x, y, w, h);
  addLabel(b, group, topName, '0', 0, 13, w, h / 2, font, [110, 62, 36, 255], { bold: true });
  addLabel(b, group, bottomName, '0', 0, -17, w, h / 2, font, [110, 62, 36, 255], { bold: true });
  return group;
}

function addModeButton(b, parent, name, selectedSf, normalSf, text, x, y, w, h, selected, font = 30) {
  const node = b.node(name, parent, x, y, w, h);
  b.button(node);
  const normal = addSprite(b, node, 'Normal', normalSf, 0, 0, w, h, 1, { active: !selected });
  const selectedNode = addSprite(b, node, 'Selected', selectedSf, 0, 0, w, h, 1, { active: selected });
  const label = b.node('Label', node, 0, 0, w - 16, h - 8);
  b.label(label, text, font, [255, 255, 255, 255], { bold: true });
  return node;
}

function addToggleSpriteButton(b, parent, name, selectedSf, normalSf, text, x, y, w, h, selected, font = 24) {
  const node = b.node(name, parent, x, y, w, h);
  b.button(node);
  addSprite(b, node, 'Normal', normalSf, 0, 0, w, h, 1, { active: !selected });
  addSprite(b, node, 'Selected', selectedSf, 0, 0, w, h, 1, { active: selected });
  addLabel(b, node, 'Label', text, 0, 0, w - 10, h - 6, font, [255, 255, 255, 255], { bold: true });
  return node;
}

function addTabButton(b, parent, tab, s) {
  const x = tab.localX == null ? cx(tab) : tab.localX;
  const y = tab.localY == null ? cy(tab) : tab.localY;
  const node = b.node(tab.name, parent, x, y, tab.w, tab.h);
  b.button(node);
  addSprite(b, node, 'Normal', s.tab_normal_green, 0, 0, tab.w, tab.h, 1, { active: !tab.selected });
  addSprite(b, node, 'Selected', s.tab_selected_orange, 0, 0, tab.w, tab.h, 1, { active: tab.selected });
  addLabel(b, node, 'Label', tab.text, 0, 0, tab.w - 12, tab.h - 8, tab.text.length >= 4 ? 30 : 34, [255, 255, 255, 255], { bold: true });
  return node;
}

function addScoreKey(b, parent, s, name, text, x, y, w, h, font) {
  return addSpriteButton(b, parent, name, s.keypad_button, text, x, y, w, h, font, 1);
}

function childIdByName(b, parentId, name) {
  const children = b.data[parentId]._children || [];
  for (let i = 0; i < children.length; i++) {
    const id = children[i].__id__;
    if (b.data[id] && b.data[id]._name === name) return id;
  }
  throw new Error('missing child ' + name);
}

function makeMemberRow(s) {
  const l = MEMBER_PAGE_LAYOUT;
  const r = l.memberRow;
  const n = l.rowNodes;
  const b = new PrefabBuilder('MemberRow', r.w, r.h);
  addSprite(b, b.root, 'Bg', s.row_member_bg, 0, 0, r.w, r.h, 1);
  addSprite(b, b.root, 'Avatar', s.input_box_bg, lx(n.avatar, r), ly(n.avatar, r), n.avatar.w, n.avatar.h);
  addSprite(b, b.root, 'RoleBadge', s.badge_leader, lx(n.roleBadge, r), ly(n.roleBadge, r), n.roleBadge.w, n.roleBadge.h);
  addLabel(b, b.root, 'Name', '玩家信息', lx(n.name, r), ly(n.name, r), n.name.w, n.name.h, 22, [110, 62, 36, 255], { bold: true, align: 0 });
  addLabel(b, b.root, 'UserID', '123456', lx(n.userID, r), ly(n.userID, r), n.userID.w, n.userID.h, 21, [110, 62, 36, 255], { bold: true, align: 0 });
  addSprite(b, b.root, 'StatusOnline', s.status_online, lx(n.status, r), ly(n.status, r), n.status.w, n.status.h);
  addSprite(b, b.root, 'StatusOffline', s.status_offline, lx(n.status, r), ly(n.status, r), n.status.w, n.status.h, 0, { active: false });
  addValueGroup(b, b.root, 'RoundsGroup', 'TodayRounds', 'YesterdayRounds', lx(n.rounds, r), ly(n.rounds, r), n.rounds.w, n.rounds.h, 22);
  addValueGroup(b, b.root, 'ContributionGroup', 'TodayContribution', 'YesterdayContribution', lx(n.contribution, r), ly(n.contribution, r), n.contribution.w, n.contribution.h, 22);
  addValueGroup(b, b.root, 'ResultGroup', 'TodayResult', 'YesterdayResult', lx(n.result, r), ly(n.result, r), n.result.w, n.result.h, 22);
  addLabel(b, b.root, 'Score', '100.8', lx(n.score, r), ly(n.score, r), n.score.w, n.score.h, 22, [110, 62, 36, 255], { bold: true });
  addSprite(b, b.root, 'TodayBox', s.league_bg_out, lx(n.todayBox, r), ly(n.todayBox, r), n.todayBox.w, n.todayBox.h, 1, { color: [181, 141, 106, 255] });
  addLabel(b, b.root, 'TodayLabel', '今日：0', lx(n.todayBox, r), ly(n.todayBox, r), n.todayBox.w - 8, n.todayBox.h, 19);
  addSprite(b, b.root, 'YesterdayBox', s.league_bg_out, lx(n.yesterdayBox, r), ly(n.yesterdayBox, r), n.yesterdayBox.w, n.yesterdayBox.h, 1, { color: [181, 141, 106, 255] });
  addLabel(b, b.root, 'YesterdayLabel', '昨日：0', lx(n.yesterdayBox, r), ly(n.yesterdayBox, r), n.yesterdayBox.w - 8, n.yesterdayBox.h, 19);
  addSpriteButton(b, b.root, 'BtnSetPartner', s.btn_green_small, '设置合伙人', lx(n.btnSetPartner, r), ly(n.btnSetPartner, r), n.btnSetPartner.w, n.btnSetPartner.h, 19);
  addSpriteButton(b, b.root, 'BtnLimitGame', s.btn_red_small, '禁止游戏', lx(n.btnLimitGame, r), ly(n.btnLimitGame, r), n.btnLimitGame.w, n.btnLimitGame.h, 19);
  addSpriteButton(b, b.root, 'BtnBattleDetail', s.btn_blue_small, '战绩明细', lx(n.btnBattleDetail, r), ly(n.btnBattleDetail, r), n.btnBattleDetail.w, n.btnBattleDetail.h, 19);
  addSpriteButton(b, b.root, 'BtnAddScore', s.btn_score_add, '上分', lx(n.btnAddScore, r), ly(n.btnAddScore, r), n.btnAddScore.w, n.btnAddScore.h, 24);
  addSpriteButton(b, b.root, 'BtnSubScore', s.btn_score_sub, '下分', lx(n.btnSubScore, r), ly(n.btnSubScore, r), n.btnSubScore.w, n.btnSubScore.h, 24);
  b.script(b.root, 'MemberRow');
  return b.data;
}

function makeMemberPage(s) {
  const l = MEMBER_PAGE_LAYOUT;
  const b = new PrefabBuilder('MemberPage', l.pageRoot.w, l.pageRoot.h);
  addSprite(b, b.root, 'BgOut', s.league_bg_out, 0, 0, l.pageBg.w, l.pageBg.h, 1);
  addSprite(b, b.root, 'BgIn', s.league_bg_in, 0, 0, l.pageBg.w - 20, l.pageBg.h - 20, 1);
  const contentRoot = b.node('Content', b.root, 0, 0, l.pageRoot.w, l.pageRoot.h);
  addSprite(b, contentRoot, 'TableHeader', s.table_header_green, lx(l.tableHeader, l.pageRoot), ly(l.tableHeader, l.pageRoot), l.tableHeader.w, l.tableHeader.h, 1);
  addLabel(b, contentRoot, 'HeaderPlayerInfo', '成员信息', -392, 257, 150, 48, 24, [255,255,255,255], { bold: true });
  addLabel(b, contentRoot, 'HeaderStatus', '状态', -238, 257, 100, 48, 22, [255,255,255,255], { bold: true });
  addSplitHeader(b, contentRoot, 'HeaderRounds', '今日局数', '昨日局数', -40, 257, 120, 52, 21);
  addSplitHeader(b, contentRoot, 'HeaderContribution', '今日贡献', '昨日贡献', 124, 257, 120, 52, 21);
  addSplitHeader(b, contentRoot, 'HeaderResult', '今日战绩', '昨日战绩', 284, 257, 120, 52, 21);
  addLabel(b, contentRoot, 'HeaderScore', '积分', 438, 257, 120, 48, 22, [255,255,255,255], { bold: true });
  const scroll = b.node('ScrollView', contentRoot, lx(l.scrollView, l.pageRoot), ly(l.scrollView, l.pageRoot), l.scrollView.w, l.scrollView.h);
  const view = b.node('view', scroll, 0, 0, l.scrollView.w, l.scrollView.h);
  b.mask(view);
  const content = b.node('content', view, 0, l.scrollView.h / 2, l.scrollView.w, 1600, { ax: 0.5, ay: 1 });
  b.layout(content, { w: l.scrollView.w, h: 1600, spacingY: l.rowSpacingY, top: 0, bottom: 0 });
  b.scrollView(scroll, content);
  addSprite(b, contentRoot, 'SearchInput', s.input_box, lx(l.searchInput, l.pageRoot), ly(l.searchInput, l.pageRoot), l.searchInput.w, l.searchInput.h, 1);
  addLabel(b, contentRoot, 'SearchLabel', '', lx(l.searchInput, l.pageRoot), ly(l.searchInput, l.pageRoot), l.searchInput.w - 16, 40, 22, [110, 62, 36, 255]);
  addSpriteButton(b, contentRoot, 'BtnSearch', s.btn_search, '查询', lx(l.searchButton, l.pageRoot), ly(l.searchButton, l.pageRoot), l.searchButton.w, l.searchButton.h, 22);
  return b.data;
}

function makeLeagueAnalysisView(s) {
  const b = new PrefabBuilder('LeagueAnalysisView', 1334, 750);
  const l = MEMBER_PAGE_LAYOUT;
  addSprite(b, b.root, 'MainFrame', s.league_main_frame, cx(l.mainFrame), cy(l.mainFrame), l.mainFrame.w, l.mainFrame.h, 1);
  addLabel(b, b.root, 'Title', '经营分析', cx(l.title), cy(l.title), l.title.w, l.title.h, 40, [255, 255, 255, 255], { bold: true });
  addSpriteButton(b, b.root, 'BtnClose', s.btn_close, '', cx(l.btnClose), cy(l.btnClose), l.btnClose.w, l.btnClose.h, 1, 0);
  const leftMenu = b.node('LeftMenu', b.root, cx(l.leftMenu), cy(l.leftMenu), l.leftMenu.w, l.leftMenu.h);
  addSprite(b, leftMenu, 'Bg', s.league_bg_out, 0, 0, l.leftMenu.w, l.leftMenu.h, 1, { color: [176, 141, 127, 255] });
  l.tabs.forEach(tab => addTabButton(b, leftMenu, Object.assign({}, tab, {
    localX: tab.x - l.leftMenu.x,
    localY: l.leftMenu.y - tab.y
  }), s));
  b.node('PageRoot', b.root, cx(l.pageRoot), cy(l.pageRoot), l.pageRoot.w, l.pageRoot.h);
  b.node('PopupLayer', b.root, 0, 0, 1334, 750);
  b.script(b.root, 'LeagueAnalysisView', {
    memberPagePrefab: { __uuid__: PREFAB_UUIDS.MemberPage },
    rowPrefab: { __uuid__: PREFAB_UUIDS.MemberRow },
    searchPopupPrefab: { __uuid__: PREFAB_UUIDS.SearchMemberPopup },
    scorePopupPrefab: { __uuid__: PREFAB_UUIDS.ScorePopup },
    setPartnerPopupPrefab: { __uuid__: PREFAB_UUIDS.SetPartnerPopup },
    battleDetailPopupPrefab: { __uuid__: PREFAB_UUIDS.BattleDetailPopup },
    battleReplayPopupPrefab: { __uuid__: PREFAB_UUIDS.BattleReplayPopup },
    confirmPopupPrefab: { __uuid__: PREFAB_UUIDS.ConfirmPopup }
  });
  return b.data;
}

function popupBase(name, title, s, w = 900, h = 610) {
  const b = new PrefabBuilder(name, 1334, 750);
  const mask = b.node('Mask', b.root, 0, 0, 1334, 750, { color: [0, 0, 0, 160], opacity: 160 });
  b.sprite(mask, null);
  b.button(mask);
  const frame = b.node('WindowFrame', b.root, 0, 0, w, h);
  addSprite(b, frame, 'Sprite', s.league_main_frame, 0, 0, w, h, 1);
  addLabel(b, frame, 'Title', title, 0, h / 2 - 58, 360, 58, 40, [255, 255, 255, 255], { bold: true });
  addSpriteButton(b, b.root, 'BtnClose', s.btn_close, '', w / 2 - 34, h / 2 - 34, 54, 54, 1, 0);
  const panelRoot = b.node('PanelRoot', b.root, 0, -28, w - 62, h - 116);
  addSprite(b, panelRoot, 'BgOut', s.league_bg_out, 0, 0, w - 62, h - 116, 1);
  addSprite(b, panelRoot, 'BgIn', s.league_bg_in, 0, 0, w - 96, h - 152, 1);
  const content = b.node('Content', panelRoot, 0, 0, w - 116, h - 172);
  return { b, content };
}

function makeSearchPopup(s) {
  const { b, content: c } = popupBase('SearchMemberPopup', '查询成员', s, 760, 500);
  addLabel(b, c, 'InputTitle', '输入ID号：', -180, 90, 160, 48, 32);
  addSprite(b, c, 'InputBox', s.input_box, 90, 90, 360, 55, 1);
  addLabel(b, c, 'InputLabel', '', 90, 90, 340, 44, 30, [110, 62, 36, 255], { bold: true });
  addKeypad(b, c, s, -210, -20, 135, 68);
  b.script(b.root, 'SearchMemberPopup');
  return b.data;
}

function makeScorePopup(s) {
  const l = SCORE_POPUP_LAYOUT;
  const b = new PrefabBuilder('ScorePopup', 1334, 750);
  const mask = b.node('Mask', b.root, 0, 0, 1334, 750, { color: [0, 0, 0, 160], opacity: 160 });
  b.sprite(mask, null);
  b.button(mask);
  const frame = b.node('WindowFrame', b.root, cx(l.windowFrame), cy(l.windowFrame), l.windowFrame.w, l.windowFrame.h);
  addSprite(b, frame, 'Sprite', s.league_main_frame, 0, 0, l.windowFrame.w, l.windowFrame.h, 1);
  addSpriteButton(b, b.root, 'BtnClose', s.btn_close, '', cx(l.btnClose), cy(l.btnClose), l.btnClose.w, l.btnClose.h, 1, 0);
  const panel = b.node('PanelRoot', b.root, cx(l.panelRoot), cy(l.panelRoot), l.panelRoot.w, l.panelRoot.h);
  addSprite(b, panel, 'BgOut', s.league_bg_out, 0, 0, l.panelRoot.w, l.panelRoot.h, 1);
  addSprite(b, panel, 'BgIn', s.league_bg_in, 0, 0, l.panelRoot.w - 24, l.panelRoot.h - 24, 1);
  addLabel(b, panel, 'Title', '加减积分', cx(l.title) - cx(l.panelRoot), cy(l.title) - cy(l.panelRoot), l.title.w, l.title.h, 40, [255, 255, 255, 255], { bold: true });
  const content = b.node('Content', panel, 0, 0, l.panelRoot.w - 30, l.panelRoot.h - 30);
  addSprite(b, content, 'LeftPanel', s.league_bg_out, cx(l.leftPanel) - cx(l.panelRoot), cy(l.leftPanel) - cy(l.panelRoot), l.leftPanel.w, l.leftPanel.h, 1, { color: [181, 141, 126, 255] });
  addSprite(b, content, 'ScoreInput', s.league_bg_out, cx(l.inputPanel) - cx(l.panelRoot), cy(l.inputPanel) - cy(l.panelRoot), l.inputPanel.w, l.inputPanel.h, 1, { color: [181, 141, 126, 255] });
  addSprite(b, content, 'ScoreInputBox', s.input_box, cx(l.inputBox) - cx(l.panelRoot), cy(l.inputBox) - cy(l.panelRoot), l.inputBox.w, l.inputBox.h, 1);
  addLabel(b, content, 'InputLabel', '+0', cx(l.inputBox) - cx(l.panelRoot), cy(l.inputBox) - cy(l.panelRoot), l.inputBox.w - 20, l.inputBox.h, 36, [110, 62, 36, 255], { bold: true });
  addModeButton(b, content, 'BtnAddMode', s.tab_selected_orange, s.tab_normal_green, '增加积分', cx(l.btnAddMode) - cx(l.panelRoot), cy(l.btnAddMode) - cy(l.panelRoot), l.btnAddMode.w, l.btnAddMode.h, true, 30);
  addModeButton(b, content, 'BtnSubMode', s.tab_selected_orange, s.tab_normal_green, '减少积分', cx(l.btnSubMode) - cx(l.panelRoot), cy(l.btnSubMode) - cy(l.panelRoot), l.btnSubMode.w, l.btnSubMode.h, false, 30);
  const keyboard = b.node('Keyboard', content, cx(l.keyboard) - cx(l.panelRoot), cy(l.keyboard) - cy(l.panelRoot), l.keyboard.keyW * 3 + l.keyboard.gapX * 2, l.keyboard.keyH * 4 + l.keyboard.gapY * 3);
  const keyNames = [['Key1', 'Key2', 'Key3'], ['Key4', 'Key5', 'Key6'], ['Key7', 'Key8', 'Key9'], ['KeyDot', 'Key0', 'KeyReset']];
  const keyText = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', '重输']];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const x = (c - 1) * (l.keyboard.keyW + l.keyboard.gapX);
      const y = (1.5 - r) * (l.keyboard.keyH + l.keyboard.gapY);
      addScoreKey(b, keyboard, s, keyNames[r][c], keyText[r][c], x, y, l.keyboard.keyW, l.keyboard.keyH, keyText[r][c].length > 1 ? 32 : 52);
    }
  }
  addLabel(b, content, 'MyScoreLabel', '我的积分：99999', cx(l.myScore) - cx(l.panelRoot), cy(l.myScore) - cy(l.panelRoot), l.myScore.w, l.myScore.h, 30, [82, 72, 150, 255], { bold: true, align: 0 });
  addSpriteButton(b, content, 'BtnConfirm', s.btn_green_small, '确认操作', cx(l.btnConfirm) - cx(l.panelRoot), cy(l.btnConfirm) - cy(l.panelRoot), l.btnConfirm.w, l.btnConfirm.h, 30);
  b.script(b.root, 'ScorePopup');
  return b.data;
}

function makeSetPartnerPopup(s) {
  const { b, content: c } = popupBase('SetPartnerPopup', '设置合伙人', s, 760, 500);
  addLabel(b, c, 'RoomRateTitle', '房费比例：', -210, 90, 170, 48, 30);
  addSprite(b, c, 'RoomRateBox', s.input_box, 90, 90, 350, 54, 1);
  addLabel(b, c, 'RoomRateLabel', '0', 90, 90, 330, 48, 28, [110, 62, 36, 255], { bold: true });
  addLabel(b, c, 'WaterRateTitle', '抽水比例：', -210, 15, 170, 48, 30);
  addSprite(b, c, 'WaterRateBox', s.input_box, 90, 15, 350, 54, 1);
  addLabel(b, c, 'WaterRateLabel', '0', 90, 15, 330, 48, 28, [110, 62, 36, 255], { bold: true });
  addSpriteButton(b, c, 'BtnConfirm', s.btn_green_small, '确定', 0, -120, 150, 62, 30);
  b.script(b.root, 'SetPartnerPopup');
  return b.data;
}

function makeBattleDetailPopup(s) {
  const { b, content: c } = popupBase('BattleDetailPopup', '战绩明细', s, 1075, 604);
  const dates = ['06月28日', '06月27日', '06月27日', '06月27日', '06月27日', '06月27日', '06月27日'];
  for (let i = 0; i < dates.length; i++) {
    addToggleSpriteButton(b, c, 'DateButton' + (i + 1), s.btn_orange, s.btn_green_small, dates[i], -426 + i * 148, 258, 136, 48, i === 0, 24);
  }
  const playerSummary = b.node('PlayerSummary', c, 0, 169, 920, 96);
  addSprite(b, playerSummary, 'Bg', s.row_simple_bg, 0, 0, 920, 92, 1);
  addSprite(b, playerSummary, 'Avatar', s.input_box, -390, 0, 66, 66, 1);
  addLabel(b, playerSummary, 'Name', '玩家信息', -302, 15, 145, 30, 21, [110, 62, 36, 255], { bold: true, align: 0 });
  addLabel(b, playerSummary, 'UserID', '123456', -302, -17, 145, 30, 20, [110, 62, 36, 255], { bold: true, align: 0 });
  addLabel(b, playerSummary, 'TodayRound', '今日局数： 1', -28, 0, 230, 44, 25, [110, 62, 36, 255], { bold: true });
  addLabel(b, playerSummary, 'WinLose', '输赢： -35.6', 306, 0, 230, 44, 25, [54, 150, 54, 255], { bold: true });
  const scroll = b.node('ScrollView', c, 0, -62, 920, 300);
  const view = b.node('view', scroll, 0, 0, 920, 300);
  b.mask(view);
  const content = b.node('content', view, 0, 150, 920, 620, { ax: 0.5, ay: 1 });
  b.layout(content, { w: 920, h: 620, spacingY: 12 });
  b.scrollView(scroll, content);
  b.script(b.root, 'BattleDetailPopup', {
    rowPrefab: { __uuid__: PREFAB_UUIDS.BattleDetailRow }
  });
  return b.data;
}

function makeBattleDetailRow(s) {
  const b = new PrefabBuilder('BattleDetailRow', 920, 206);
  addSprite(b, b.root, 'Bg', s.row_battle_bg, 0, 0, 920, 206, 1);
  const header = b.node('HeaderBar', b.root, -72, 74, 760, 48);
  addSprite(b, header, 'Bg', s.table_header_green, 0, 0, 760, 42, 1);
  addLabel(b, header, 'RoomId', '房间ID:123456', -310, 0, 170, 36, 20, [255, 255, 255, 255], { bold: true, align: 0 });
  addLabel(b, header, 'Time', '2019-12-12 12:12', -122, 0, 210, 36, 20, [255, 255, 255, 255], { bold: true, align: 0 });
  addLabel(b, header, 'GameType', '牛牛0.5底', 88, 0, 150, 36, 20, [255, 255, 255, 255], { bold: true });
  addLabel(b, header, 'ReplayCode', '回访码：WEEWTFDGFDFGDGFAF', 255, 0, 300, 36, 18, [255, 255, 255, 255], { bold: true, align: 0 });
  const playersArea = b.node('PlayerCardsArea', b.root, -70, -30, 760, 124);
  for (let i = 0; i < 8; i++) {
    const x = -326 + i * 93;
    const slot = b.node('PlayerCard_' + i, playersArea, x, 0, 86, 116);
    addSprite(b, slot, 'Avatar', s.input_box, 0, 35, 52, 52, 1);
    addLabel(b, slot, 'NameLabel', '哇卡一为...', 0, -6, 84, 22, 15, [110, 62, 36, 255], { bold: true });
    addLabel(b, slot, 'MaskedIDLabel', '12****6', 0, -29, 84, 20, 14, [110, 62, 36, 255], { bold: true });
    addLabel(b, slot, 'ScoreLabel', i === 0 ? '+3605' : (i === 2 ? '-36.5' : '-36'), 0, -58, 84, 24, 17, i === 0 ? [200, 70, 35, 255] : [35, 110, 205, 255], { bold: true });
  }
  const right = b.node('RightButtons', b.root, 390, 4, 140, 150);
  addSpriteButton(b, right, 'BtnCopyReplayCode', s.btn_blue_small, '复制回放码', 0, 32, 127, 47, 19);
  addSpriteButton(b, right, 'BtnViewReplay', s.btn_blue_small, '查看回放', 0, -34, 127, 47, 19);
  b.script(b.root, 'BattleDetailRow');
  return b.data;
}

function makeBattleReplayPopup(s) {
  const { b, content: c } = popupBase('BattleReplayPopup', '战绩回放', s, 1075, 604);
  addSprite(b, c, 'HeaderBg', s.row_simple_bg, 0, 206, 920, 58, 1);
  addLabel(b, c, 'RoomLabel', '房间号：9999999', -330, 206, 250, 42, 24, [255, 255, 255, 255], { bold: true, align: 0 });
  addLabel(b, c, 'RoundLabel', '局数：7', -70, 206, 170, 42, 24, [255, 255, 255, 255], { bold: true, align: 0 });
  const scroll = b.node('ScrollView', c, 0, -38, 920, 430);
  const view = b.node('view', scroll, 0, 0, 920, 430);
  b.mask(view);
  const content = b.node('content', view, 0, 215, 920, 1050, { ax: 0.5, ay: 1 });
  b.layout(content, { w: 920, h: 1050, spacingY: 18 });
  b.scrollView(scroll, content);
  b.script(b.root, 'BattleReplayPopup', {
    rowPrefab: { __uuid__: PREFAB_UUIDS.BattleReplayRow }
  });
  return b.data;
}

function makeBattleReplayRow(s) {
  const b = new PrefabBuilder('BattleReplayRow', 920, 188);
  addSprite(b, b.root, 'Bg', s.battle_replay_row_bg, 0, 0, 920, 188, 1);
  const resultArea = b.node('ResultArea', b.root, -370, 0, 180, 160);
  addSprite(b, resultArea, 'ResultLoseIcon', s.battle_lose_icon, -38, 22, 72, 72);
  addSprite(b, resultArea, 'ResultWinIcon', s.battle_win_icon, -38, 22, 72, 72, 0, { active: false });
  addLabel(b, resultArea, 'RoundLabel', '1/7', 40, 20, 85, 54, 34, [110, 62, 36, 255], { bold: true });
  const listArea = b.node('PlayerListArea', b.root, -36, 0, 570, 160);
  const left = b.node('PlayerListLeft', listArea, -140, 0, 250, 150);
  const right = b.node('PlayerListRight', listArea, 150, 0, 250, 150);
  for (let i = 0; i < 4; i++) {
    addLabel(b, left, 'Name' + (i + 1), '玩家昵称...', -70, 55 - i * 36, 130, 28, 20, [50, 110, 210, 255], { bold: true, align: 0 });
    addLabel(b, left, 'Score' + (i + 1), '+18', 78, 55 - i * 36, 75, 28, 20, [190, 55, 35, 255], { bold: true });
    addLabel(b, right, 'Name' + (i + 1), '玩家昵称...', -70, 55 - i * 36, 130, 28, 20, [50, 110, 210, 255], { bold: true, align: 0 });
    addLabel(b, right, 'Score' + (i + 1), i === 0 ? '-180' : '+18', 78, 55 - i * 36, 75, 28, 20, i === 0 ? [42, 155, 48, 255] : [190, 55, 35, 255], { bold: true });
  }
  const actionArea = b.node('ActionArea', b.root, 358, 0, 180, 160);
  addSpriteButton(b, actionArea, 'BtnViewReplay', s.btn_blue_small, '查看回放', 0, 0, 145, 56, 23);
  b.script(b.root, 'BattleReplayRow');
  return b.data;
}

function makeConfirmPopup(s) {
  const { b, content: c } = popupBase('ConfirmPopup', '提示', s, 600, 360);
  addLabel(b, c, 'MessageLabel', '确认操作？', 0, 50, 420, 70, 30, [110, 62, 36, 255], { bold: true });
  addSpriteButton(b, c, 'BtnCancel', s.btn_blue_small, '取消', -110, -90, 130, 54, 24);
  addSpriteButton(b, c, 'BtnOK', s.btn_green_small, '确定', 110, -90, 130, 54, 24);
  b.script(b.root, 'ConfirmPopup');
  return b.data;
}

function addKeypad(b, parent, s, startX, startY, keyW, keyH) {
  const keys = [['1','2','3'], ['4','5','6'], ['7','8','9'], ['重输','0','删除']];
  for (let r = 0; r < keys.length; r++) {
    for (let c = 0; c < keys[r].length; c++) {
      addSpriteButton(b, parent, 'Key_' + keys[r][c], s.keypad_button, keys[r][c], startX + c * (keyW + 14), startY - r * (keyH + 12), keyW, keyH, keys[r][c].length > 1 ? 28 : 44);
    }
  }
}

function writeScripts(root) {
  const dir = path.join(root, 'assets/scripts/LeagueAnalysis');
  ensureDir(dir);
  writeText(path.join(root, 'assets/scripts.meta'), JSON.stringify(dirMeta('cae685bb-26c6-4d19-99e8-244c0a990000'), null, 2));
  writeText(path.join(dir + '.meta'), JSON.stringify(dirMeta('cae685bb-26c6-4d19-99e8-244c0a990001'), null, 2));
  const scripts = {
    LeagueAnalysisView: leagueAnalysisViewJs(),
    MemberRow: memberRowJs(),
    SearchMemberPopup: idPopupJs('SearchMemberPopup'),
    ScorePopup: scorePopupJs(),
    SetPartnerPopup: setPartnerPopupJs(),
    BattleDetailPopup: battleDetailPopupJs(),
    BattleDetailRow: battleDetailRowJs(),
    BattleReplayPopup: battleReplayPopupJs(),
    BattleReplayRow: battleReplayRowJs(),
    ConfirmPopup: confirmPopupJs()
  };
  Object.keys(scripts).forEach(name => {
    writeText(path.join(dir, name + '.js'), scripts[name]);
    writeJSON(path.join(dir, name + '.js.meta'), newMeta(SCRIPT_UUIDS[name], 'javascript'));
  });
}

function leagueAnalysisViewJs() {
  return `cc.Class({
    extends: cc.Component,
    properties: {
        memberPagePrefab: cc.Prefab,
        rowPrefab: cc.Prefab,
        searchPopupPrefab: cc.Prefab,
        scorePopupPrefab: cc.Prefab,
        setPartnerPopupPrefab: cc.Prefab,
        battleDetailPopupPrefab: cc.Prefab,
        battleReplayPopupPrefab: cc.Prefab,
        confirmPopupPrefab: cc.Prefab
    },
    onLoad: function () {
        this.cacheNodes();
        this.bindButtons();
        this.setData(this.mockMembers());
    },
    cacheNodes: function () {
        this.pageRoot = this.node.getChildByName('PageRoot');
        this.popupLayer = this.node.getChildByName('PopupLayer');
        this.leftMenu = this.node.getChildByName('LeftMenu');
        this.mountMemberPage();
        this.memberPage = this.getNode(this.memberPageNode, 'Content');
        var scroll = this.getNode(this.memberPage, 'ScrollView');
        this.content = this.getNode(scroll, 'view/content');
        this.contentLayout = this.content && this.content.getComponent(cc.Layout);
    },
    mountMemberPage: function () {
        if (!this.pageRoot || !this.memberPagePrefab) return;
        this.pageRoot.removeAllChildren();
        this.memberPageNode = cc.instantiate(this.memberPagePrefab);
        this.memberPageNode.name = 'MemberPage';
        this.pageRoot.addChild(this.memberPageNode);
        this.memberPageNode.setPosition(0, 0);
    },
    getNode: function (root, path) {
        if (!root || !path) return null;
        var node = root;
        var parts = path.split('/');
        for (var i = 0; i < parts.length; i++) node = node && node.getChildByName(parts[i]);
        return node;
    },
    bindButtons: function () {
        var btn = this.getNode(this.memberPage, 'BtnSearch');
        this.bindClick(btn, this.showSearchPopup.bind(this));
        this.bindTabs();
    },
    bindTabs: function () {
        if (!this.leftMenu) return;
        var names = ['BtnStatistics', 'BtnPartner', 'BtnMember', 'BtnAgentStatistics', 'BtnRewardDetail', 'BtnOperationRecord', 'BtnRewardWithdraw'];
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            var node = this.leftMenu.getChildByName(name);
            this.bindClick(node, function (tabName) {
                cc.log('[LeagueAnalysisView] tab click', tabName);
                if (tabName !== 'BtnMember') return;
                this.setTabSelected(tabName);
            }.bind(this, name));
        }
        this.setTabSelected('BtnMember');
    },
    setTabSelected: function (selectedName) {
        if (!this.leftMenu) return;
        var names = ['BtnStatistics', 'BtnPartner', 'BtnMember', 'BtnAgentStatistics', 'BtnRewardDetail', 'BtnOperationRecord', 'BtnRewardWithdraw'];
        for (var i = 0; i < names.length; i++) {
            var node = this.leftMenu.getChildByName(names[i]);
            if (!node) continue;
            var normal = node.getChildByName('Normal');
            var selected = node.getChildByName('Selected');
            var isSelected = names[i] === selectedName;
            if (normal) normal.active = !isSelected;
            if (selected) selected.active = isSelected;
        }
    },
    bindClick: function (node, fn) {
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            fn();
        }, this);
    },
    setData: function (list) {
        if (!this.content || !this.rowPrefab) return;
        this.content.removeAllChildren();
        var rowH = 184;
        var spacingY = 4;
        var contentW = this.content.width || 1028;
        this.content.setAnchorPoint(0.5, 1);
        this.content.setContentSize(contentW, Math.max(372, list.length * (rowH + spacingY)));
        for (var i = 0; i < list.length; i++) {
            var rowNode = cc.instantiate(this.rowPrefab);
            rowH = rowNode.height || rowH;
            rowNode.setAnchorPoint(0.5, 0.5);
            var row = rowNode.getComponent('MemberRow');
            if (row) row.setData(list[i], {
                setPartner: this.showSetPartnerPopup.bind(this),
                limitGame: this.showLimitConfirm.bind(this),
                battleDetail: this.showBattleDetailPopup.bind(this),
                addScore: function (data) { this.showScorePopup(data, 'add'); }.bind(this),
                subScore: function (data) { this.showScorePopup(data, 'sub'); }.bind(this)
            });
            this.content.addChild(rowNode);
        }
    },
    openPopup: function (prefab, data) {
        if (!prefab || !this.popupLayer) return null;
        var node = cc.instantiate(prefab);
        this.popupLayer.addChild(node);
        var comps = node.getComponents(cc.Component);
        for (var i = 0; i < comps.length; i++) {
            if (comps[i].init) comps[i].init(data || {}, this);
        }
        return node;
    },
    showSearchPopup: function () { this.openPopup(this.searchPopupPrefab, { title: '查询成员' }); },
    showSetPartnerPopup: function (data) { this.openPopup(this.setPartnerPopupPrefab, data); },
    showBattleDetailPopup: function (data) { this.openPopup(this.battleDetailPopupPrefab, data); },
    showBattleReplayPopup: function (data) { this.openPopup(this.battleReplayPopupPrefab, data); },
    showScorePopup: function (data, mode) { this.openPopup(this.scorePopupPrefab, { user: data, mode: mode }); },
    showLimitConfirm: function (data) {
        this.openPopup(this.confirmPopupPrefab, { message: '确认禁止该玩家游戏？', onOK: function () {
            data.banned = true;
            this.setData(this.members);
        }.bind(this) });
    },
    mockMembers: function () {
        var list = [];
        for (var i = 0; i < 12; i++) {
            list.push({
                userID: 123456 + i,
                name: i % 2 ? '测试玩家' + i : '旧朋友123',
                role: i % 4 === 0 ? 'proxy' : 'user',
                online: i % 3 !== 0,
                rounds: i,
                yesterdayRounds: i % 5,
                contribution: (2.78 + i).toFixed(2),
                result: i % 2 ? -38.9 : 20,
                score: 9885 + i * 7,
                today: i % 2 ? -38.9 : 0,
                yesterday: 0
            });
        }
        this.members = list;
        return list;
    }
});\n`;
}

function memberRowJs() {
  return `cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad: function () { this.cacheNodes(); },
    cacheNodes: function () {
        this.nodes = {};
        this.collect(this.node);
    },
    collect: function (node) {
        this.nodes[node.name] = node;
        for (var i = 0; i < node.children.length; i++) this.collect(node.children[i]);
    },
    setData: function (data, handlers) {
        this.data = data || {};
        this.handlers = handlers || {};
        if (!this.nodes) this.cacheNodes();
        this.text('Name', this.data.name || '玩家信息');
        this.text('UserID', String(this.data.userID || ''));
        this.text('TodayRounds', this.data.rounds || 0);
        this.text('YesterdayRounds', this.data.yesterdayRounds || 0);
        this.text('TodayContribution', this.data.contribution || 0);
        this.text('YesterdayContribution', 0);
        this.text('TodayResult', this.data.result || 0);
        this.text('YesterdayResult', 0);
        this.text('Score', String(this.data.score || 0));
        this.text('TodayLabel', '今日：' + (this.data.today || 0));
        this.text('YesterdayLabel', '昨日：' + (this.data.yesterday || 0));
        if (this.nodes.RoleBadge) this.nodes.RoleBadge.active = this.data.role !== 'user';
        if (this.nodes.BtnSetPartner) this.nodes.BtnSetPartner.active = this.data.role === 'user';
        if (this.nodes.StatusOnline) this.nodes.StatusOnline.active = !!this.data.online;
        if (this.nodes.StatusOffline) this.nodes.StatusOffline.active = !this.data.online;
        this.bind('BtnSetPartner', 'setPartner');
        this.bind('BtnLimitGame', 'limitGame');
        this.bind('BtnBattleDetail', 'battleDetail');
        this.bind('BtnAddScore', 'addScore');
        this.bind('BtnSubScore', 'subScore');
    },
    text: function (name, value) {
        var label = this.nodes[name] && this.nodes[name].getComponent(cc.Label);
        if (label) label.string = value;
    },
    bind: function (name, eventName) {
        var node = this.nodes[name];
        if (!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (event && event.stopPropagation) event.stopPropagation();
            if (this.handlers[eventName]) this.handlers[eventName](this.data);
        }, this);
    }
});\n`;
}

function idPopupJs(name) {
  return `cc.Class({
    extends: cc.Component,
    properties: {},
    init: function (data, owner) {
        this.data = data || {};
        this.owner = owner;
        this.input = '';
        this.cacheNodes();
        this.bindAll();
        this.refresh();
    },
    cacheNodes: function () { this.nodes = {}; this.collect(this.node); },
    collect: function (node) { this.nodes[node.name] = node; for (var i=0;i<node.children.length;i++) this.collect(node.children[i]); },
    bindAll: function () {
        this.bind('BtnClose', this.close);
        this.bind('Mask', this.close);
        for (var i=0;i<=9;i++) this.bind('Key_' + i, this.append.bind(this, String(i)));
        this.bind('Key_重输', function(){ this.input=''; this.refresh(); });
        this.bind('Key_删除', function(){ this.input=this.input.slice(0,-1); this.refresh(); });
    },
    bind: function (name, fn) {
        var node=this.nodes[name]; if(!node) return;
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function(e){ if(e&&e.stopPropagation)e.stopPropagation(); fn.call(this); }, this);
    },
    append: function (n) { if(this.input.length>=6) return; this.input+=n; this.refresh(); if(this.input.length===6) cc.log('[${name}] submit id', this.input); },
    refresh: function () { var label=this.nodes.InputLabel&&this.nodes.InputLabel.getComponent(cc.Label); if(label) label.string=this.input; },
    close: function () { this.node.destroy(); }
});\n`;
}

function scorePopupJs() {
  return `cc.Class({
    extends: cc.Component,
    properties: {},
    init: function (data) {
        this.data=data||{}; this.mode=this.data.mode==='sub'?'sub':'add'; this.input='0';
        this.cacheNodes(); this.bindAll(); this.refresh();
    },
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){
        this.bind('BtnClose',this.close); this.bind('Mask',this.close);
        this.bind('BtnAddMode',function(){this.mode='add';this.refresh();});
        this.bind('BtnSubMode',function(){this.mode='sub';this.refresh();});
        for(var i=0;i<=9;i++)this.bind('Key'+i,this.append.bind(this,String(i)));
        this.bind('KeyDot',this.append.bind(this,'.'));
        this.bind('KeyReset',function(){this.input='0';this.refresh();});
        this.bind('BtnConfirm',function(){cc.log('[ScorePopup]',this.mode,this.input,this.data.user);this.close();});
    },
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    append:function(n){if(n==='.'&&this.input.indexOf('.')>=0)return;if(this.input==='0'&&n!=='.')this.input='';if(this.input.length>=8)return;this.input+=n;this.refresh();},
    refresh:function(){this.text('Title','加减积分');this.text('InputLabel',(this.mode==='sub'?'-':'+')+(this.input||'0'));this.text('MyScoreLabel','我的积分：'+((this.data.user&&this.data.user.score)||0));this.setModeButton('BtnAddMode',this.mode==='add');this.setModeButton('BtnSubMode',this.mode==='sub');},
    setModeButton:function(name,selected){var node=this.nodes[name];if(!node)return;var normal=node.getChildByName('Normal');var selectedNode=node.getChildByName('Selected');if(normal)normal.active=!selected;if(selectedNode)selectedNode.active=selected;},
    text:function(name,v){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=v;},
    close:function(){this.node.destroy();}
});\n`;
}

function setPartnerPopupJs() {
  return `cc.Class({
    extends: cc.Component,
    properties: {},
    init:function(data){this.data=data||{};this.cacheNodes();this.bindAll();},
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){this.bind('BtnClose',this.close);this.bind('Mask',this.close);this.bind('BtnConfirm',function(){cc.log('[SetPartnerPopup]',this.data);this.close();});},
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    close:function(){this.node.destroy();}
});\n`;
}

function battleDetailPopupJs() {
  return `cc.Class({
    extends: cc.Component,
    properties: {
        rowPrefab: cc.Prefab
    },
    init:function(data,owner){
        this.data=data||{};
        this.owner=owner;
        this.rows=this.mockRows();
        this.cacheNodes();
        this.bindAll();
        this.renderRows();
    },
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){
        this.bind('BtnClose',this.close);
        this.bind('Mask',this.close);
        for(var i=1;i<=7;i++)this.bind('DateButton'+i,this.onDateClick.bind(this,i));
    },
    renderRows:function(){
        var content=this.nodes.content;
        if(!content||!this.rowPrefab)return;
        content.removeAllChildren();
        var rowH=206, spacingY=12, contentW=content.width||920;
        content.setAnchorPoint(0.5,1);
        content.setContentSize(contentW,Math.max(300,this.rows.length*(rowH+spacingY)));
        for(var i=0;i<this.rows.length;i++){
            var node=cc.instantiate(this.rowPrefab);
            var comp=node.getComponent('BattleDetailRow');
            if(comp)comp.setData(this.rows[i],{
                replay:this.openReplay.bind(this),
                copy:this.copyReplayCode.bind(this)
            });
            content.addChild(node);
        }
    },
    openReplay:function(row){
        if(this.owner&&this.owner.showBattleReplayPopup)this.owner.showBattleReplayPopup(row);
    },
    copyReplayCode:function(row){
        cc.log('[BattleDetailPopup] copy replay code',row&&row.replayCode);
    },
    onDateClick:function(index){
        this.selectedDate=index;
        for(var i=1;i<=7;i++){
            var n=this.nodes['DateButton'+i];
            if(!n)continue;
            var normal=n.getChildByName('Normal');
            var selected=n.getChildByName('Selected');
            if(normal)normal.active=i!==index;
            if(selected)selected.active=i===index;
        }
        cc.log('[BattleDetailPopup] date click',index);
    },
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    mockRows:function(){
        return [{
            roomID:'123456',
            time:'2019-12-12 12:12',
            gameName:'牛牛0.5底',
            replayCode:'WEEWTFDGFDFGDGFAF',
            players:[
                {name:'哇卡一为...',maskedID:'12****6',score:'+3605'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36.5'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'},
                {name:'哇卡一为...',maskedID:'12****6',score:'-36'}
            ]
        }];
    },
    close:function(){this.node.destroy();}
});\n`;
}

function battleDetailRowJs() {
  return `cc.Class({
    extends: cc.Component,
    properties:{},
    onLoad:function(){this.cacheNodes();},
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    setData:function(data,handlers){
        this.data=data||{};
        this.handlers=handlers||{};
        if(!this.nodes)this.cacheNodes();
        this.setChildText(this.nodes.HeaderBar,'RoomId','房间ID:'+this.data.roomID);
        this.setChildText(this.nodes.HeaderBar,'Time',this.data.time||'');
        this.setChildText(this.nodes.HeaderBar,'GameType',this.data.gameName||'');
        this.setChildText(this.nodes.HeaderBar,'ReplayCode','回访码：'+(this.data.replayCode||''));
        var players=this.data.players||[];
        for(var i=0;i<8;i++){
            var slot=this.nodes['PlayerCard_'+i];
            if(!slot)continue;
            slot.active=!!players[i];
            if(!players[i])continue;
            this.setChildText(slot,'NameLabel',players[i].name);
            this.setChildText(slot,'MaskedIDLabel',players[i].maskedID);
            this.setChildText(slot,'ScoreLabel',players[i].score);
            this.setScoreColor(slot,'ScoreLabel',players[i].score);
        }
        this.bind('BtnCopyReplayCode','copy');
        this.bind('BtnViewReplay','replay');
    },
    setChildText:function(root,name,value){var n=root.getChildByName(name);var l=n&&n.getComponent(cc.Label);if(l)l.string=value;},
    setScoreColor:function(root,name,value){var n=root.getChildByName(name);var l=n&&n.getComponent(cc.Label);if(!l)return;var str=String(value||'');l.node.color=str.indexOf('-')===0?new cc.Color(35,110,205,255):new cc.Color(200,70,35,255);},
    text:function(name,value){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=value;},
    bind:function(name,eventName){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();if(this.handlers[eventName])this.handlers[eventName](this.data);},this);}
});\n`;
}

function battleReplayPopupJs() {
  return `cc.Class({
    extends: cc.Component,
    properties:{
        rowPrefab: cc.Prefab
    },
    init:function(data,owner){
        this.data=data||{};
        this.owner=owner;
        this.rows=this.mockRows();
        this.cacheNodes();
        this.bindAll();
        this.renderRows();
    },
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){this.bind('BtnClose',this.close);this.bind('Mask',this.close);},
    renderRows:function(){
        var content=this.nodes.content;
        if(!content||!this.rowPrefab)return;
        content.removeAllChildren();
        var rowH=188, spacingY=18, contentW=content.width||920;
        content.setAnchorPoint(0.5,1);
        content.setContentSize(contentW,Math.max(430,this.rows.length*(rowH+spacingY)));
        for(var i=0;i<this.rows.length;i++){
            var node=cc.instantiate(this.rowPrefab);
            var comp=node.getComponent('BattleReplayRow');
            if(comp)comp.setData(this.rows[i],{
                viewReplay:this.viewReplay.bind(this)
            });
            content.addChild(node);
        }
    },
    viewReplay:function(row){cc.log('[BattleReplayPopup] view replay',row);},
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    mockRows:function(){
        function players(offset){
            return [
                {name:'玩家昵称...',score:'+18'},
                {name:'玩家昵称...',score:offset%2?'-36':'+18'},
                {name:'玩家昵称...',score:'+18'},
                {name:'玩家昵称...',score:'+18'},
                {name:'玩家昵称...',score:'-180'},
                {name:'玩家昵称...',score:'+18'},
                {name:'玩家昵称...',score:offset%2?'+36':'-18'},
                {name:'玩家昵称...',score:'+18'}
            ];
        }
        return [
            {result:'lose',round:'1/7',players:players(1)},
            {result:'win',round:'2/7',players:players(2)},
            {result:'lose',round:'3/7',players:players(3)},
            {result:'win',round:'4/7',players:players(4)},
            {result:'lose',round:'5/7',players:players(5)}
        ];
    },
    close:function(){this.node.destroy();}
});\n`;
}

function battleReplayRowJs() {
  return `cc.Class({
    extends: cc.Component,
    properties:{},
    onLoad:function(){this.cacheNodes();},
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    setData:function(data,handlers){
        this.data=data||{};
        this.handlers=handlers||{};
        if(!this.nodes)this.cacheNodes();
        this.setChildText(this.nodes.ResultArea,'RoundLabel',this.data.round||'1/7');
        var isWin=this.data.result==='win';
        if(this.nodes.ResultLoseIcon)this.nodes.ResultLoseIcon.active=!isWin;
        if(this.nodes.ResultWinIcon)this.nodes.ResultWinIcon.active=isWin;
        this.fillList(this.nodes.PlayerListLeft,(this.data.players||[]).slice(0,4));
        this.fillList(this.nodes.PlayerListRight,(this.data.players||[]).slice(4,8));
        this.bind('BtnViewReplay','viewReplay');
    },
    fillList:function(root,list){
        if(!root)return;
        for(var i=0;i<4;i++){
            this.setChildText(root,'Name'+(i+1),list[i]?list[i].name:'');
            this.setChildText(root,'Score'+(i+1),list[i]?list[i].score:'');
            this.setScoreColor(root,'Score'+(i+1),list[i]?list[i].score:'');
        }
    },
    setChildText:function(root,name,value){var n=root.getChildByName(name);var l=n&&n.getComponent(cc.Label);if(l)l.string=value;},
    setScoreColor:function(root,name,value){var n=root&&root.getChildByName(name);var l=n&&n.getComponent(cc.Label);if(!l)return;var str=String(value||'');l.node.color=str.indexOf('-')===0?new cc.Color(42,155,48,255):new cc.Color(190,55,35,255);},
    text:function(name,value){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=value;},
    bind:function(name,eventName){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();if(this.handlers[eventName])this.handlers[eventName](this.data);},this);}
});\n`;
}

function simplePopupJs(name) {
  return `cc.Class({
    extends: cc.Component,
    properties: {},
    init:function(data,owner){this.data=data||{};this.owner=owner;this.cacheNodes();this.bindAll();},
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){this.bind('BtnClose',this.close);this.bind('Mask',this.close);this.bind('BtnReplay',function(){if(this.owner)this.owner.showBattleReplayPopup(this.data);});this.bind('BtnOpenReplay',function(){cc.log('[${name}] open replay',this.data);});},
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    close:function(){this.node.destroy();}
});\n`;
}

function confirmPopupJs() {
  return `cc.Class({
    extends: cc.Component,
    properties: {},
    init:function(data){this.data=data||{};this.cacheNodes();this.bindAll();this.text('MessageLabel',this.data.message||'确认操作？');},
    cacheNodes:function(){this.nodes={};this.collect(this.node);},
    collect:function(node){this.nodes[node.name]=node;for(var i=0;i<node.children.length;i++)this.collect(node.children[i]);},
    bindAll:function(){this.bind('BtnClose',this.close);this.bind('Mask',this.close);this.bind('BtnCancel',this.close);this.bind('BtnOK',function(){if(this.data.onOK)this.data.onOK();this.close();});},
    bind:function(name,fn){var node=this.nodes[name];if(!node)return;node.off(cc.Node.EventType.TOUCH_END);node.on(cc.Node.EventType.TOUCH_END,function(e){if(e&&e.stopPropagation)e.stopPropagation();fn.call(this);},this);},
    text:function(name,v){var l=this.nodes[name]&&this.nodes[name].getComponent(cc.Label);if(l)l.string=v;},
    close:function(){this.node.destroy();}
});\n`;
}

function generateMemberModule(root, options = {}) {
  const assetDir = path.join(root, 'assets/resources/LeagueAnalysis');
  const refDir = path.join(root, 'docs/ui-reference/member');
  if (!fs.existsSync(assetDir)) throw new Error('missing assets/resources/LeagueAnalysis');
  const sprites = scanSprites(root);
  const missing = REQUIRED_ASSETS.filter(name => !sprites[name]);
  if (missing.length) throw new Error('missing LeagueAnalysis assets: ' + missing.join(', '));
  const referenceImages = fs.existsSync(refDir)
    ? fs.readdirSync(refDir).filter(name => /\.(jpg|jpeg|png)$/i.test(name)).sort()
    : [];
  const insetReport = setSlicedInsets(root);
  writeScripts(root);
  const lock = ensureLayoutLock(root);
  let autoPulledLayouts = null;
  if (!options.forceRebuildLayout && lock.lockManualLayout) {
    autoPulledLayouts = pullLayoutsFromPrefabs(root);
  }
  const createdLayoutFiles = options.forceRebuildLayout ? [] : ensureLayoutFilesFromCurrentPrefabs(root);

  const outDir = path.join(root, 'assets/prefabs/LeagueAnalysis');
  ensureDir(outDir);
  writeText(path.join(root, 'assets/prefabs.meta'), JSON.stringify(dirMeta('bcb3e18a-aea5-4f4e-ad06-93b935930001'), null, 2));
  writeText(path.join(outDir + '.meta'), JSON.stringify(dirMeta('bcb3e18a-aea5-4f4e-ad06-93b935930002'), null, 2));

  const prefabs = {
    LeagueAnalysisView: makeLeagueAnalysisView(sprites),
    MemberPage: makeMemberPage(sprites),
    MemberRow: makeMemberRow(sprites),
    SearchMemberPopup: makeSearchPopup(sprites),
    ScorePopup: makeScorePopup(sprites),
    SetPartnerPopup: makeSetPartnerPopup(sprites),
    BattleDetailPopup: makeBattleDetailPopup(sprites),
    BattleDetailRow: makeBattleDetailRow(sprites),
    BattleReplayPopup: makeBattleReplayPopup(sprites),
    BattleReplayRow: makeBattleReplayRow(sprites),
    ConfirmPopup: makeConfirmPopup(sprites)
  };

  const layoutApply = {};
  Object.keys(prefabs).forEach(name => {
    layoutApply[name] = applyLayoutToPrefabData(root, name, prefabs[name], options);
    writeJSON(path.join(outDir, name + '.prefab'), prefabs[name]);
    writeJSON(path.join(outDir, name + '.prefab.meta'), newMeta(PREFAB_UUIDS[name], 'prefab'));
  });
  [
    path.join(outDir, 'MemberManageTest.prefab'),
    path.join(outDir, 'MemberManageTest.prefab.meta'),
    path.join(root, 'assets/scripts/LeagueAnalysis/MemberManageTest.js'),
    path.join(root, 'assets/scripts/LeagueAnalysis/MemberManageTest.js.meta')
  ].forEach(file => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });

  const validation = validateMemberModule(root);
  return {
    prefabs: Object.keys(prefabs),
    insets: insetReport,
    referencesUsed: referenceImages,
    createdLayoutFiles,
    autoPulledLayouts,
    layoutLock: lock,
    layoutApply,
    validation
  };
}

function validateMemberModule(root) {
  const outDir = path.join(root, 'assets/prefabs/LeagueAnalysis');
  const required = Object.keys(PREFAB_UUIDS).map(name => path.join(outDir, name + '.prefab'));
  const missing = required.filter(file => !fs.existsSync(file));
  if (missing.length) throw new Error('missing generated prefab: ' + missing.join(', '));
  const main = JSON.parse(fs.readFileSync(path.join(outDir, 'LeagueAnalysisView.prefab'), 'utf8'));
  const names = main.filter(item => item && item.__type__ === 'cc.Node').map(item => item._name);
  ['LeagueAnalysisView', 'MainFrame', 'Title', 'BtnClose', 'LeftMenu', 'BtnStatistics', 'BtnPartner', 'BtnMember', 'BtnAgentStatistics', 'BtnRewardDetail', 'BtnOperationRecord', 'BtnRewardWithdraw', 'PageRoot', 'PopupLayer'].forEach(name => {
    if (!names.includes(name)) throw new Error('LeagueAnalysisView missing node: ' + name);
  });
  const page = JSON.parse(fs.readFileSync(path.join(outDir, 'MemberPage.prefab'), 'utf8'));
  const pageNames = page.filter(item => item && item.__type__ === 'cc.Node').map(item => item._name);
  ['MemberPage', 'BgOut', 'BgIn', 'Content', 'TableHeader', 'ScrollView', 'view', 'content', 'SearchInput', 'BtnSearch'].forEach(name => {
    if (!pageNames.includes(name)) throw new Error('MemberPage missing node: ' + name);
  });
  ['SearchMemberPopup', 'ScorePopup', 'SetPartnerPopup', 'BattleDetailPopup', 'BattleReplayPopup', 'ConfirmPopup'].forEach(prefabName => {
    const data = JSON.parse(fs.readFileSync(path.join(outDir, prefabName + '.prefab'), 'utf8'));
    const popupNames = data.filter(item => item && item.__type__ === 'cc.Node').map(item => item._name);
    ['Mask', 'WindowFrame', 'Sprite', 'Title', 'BtnClose', 'PanelRoot', 'BgOut', 'BgIn', 'Content'].forEach(nodeName => {
      if (!popupNames.includes(nodeName)) throw new Error(prefabName + ' missing node: ' + nodeName);
    });
  });
  const row = JSON.parse(fs.readFileSync(path.join(outDir, 'MemberRow.prefab'), 'utf8'));
  const rowText = JSON.stringify(row);
  if (!rowText.includes('"__type__": "cc.Sprite"') || !rowText.includes('"_type": 1')) {
    const hasSliced = row.some(item => item && item.__type__ === 'cc.Sprite' && item._type === 1);
    if (!hasSliced) throw new Error('MemberRow Bg must use sliced sprite');
  }
  return { ok: true, prefabs: required.length };
}

module.exports = {
  install() {},
  generateMemberModule,
  validateMemberModule,
  pullLayoutsFromPrefabs,
  validateLayoutFiles
};
