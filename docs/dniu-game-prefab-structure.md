# 牛牛游戏场景 Prefab 拆分和美术接入计划

本文档记录牛牛游戏内场景的下一阶段开发方式。

当前原则：

- 先暂停继续在 `SceneDniu.js` 里堆临时 UI。
- 先给出稳定的节点目录和 Prefab 边界。
- 等美术资源到位后，再按视频 `myself.mp4 / others.MP4` 一比一还原。
- 先保证“有没有”，再逐步扣“像不像”，最后扣“动效节奏”。

## 0. 已创建文件

2026-07-01 已创建第一版结构 Prefab：

```text
newldqp/assets/GamePoker/GameDniu/Prefab/
├── SceneDniuRoot.prefab
├── DniuSeat.prefab
├── DniuCard.prefab
├── DniuCardGroup.prefab
├── DniuActionPanel.prefab
├── DniuRubCardPanel.prefab
├── DniuEffectLayer.prefab
└── DniuResultLayer.prefab
```

同时新增生成脚本：

```text
newldqp/tools/generate_dniu_prefabs.js
```

注意：

- 这些 Prefab 当前是“结构壳”，主要用于建立节点层级、占位和后续拖美术。
- 暂时没有接入 `SceneDniu.js` 的正式流程。
- 暂时没有绑定业务脚本。
- 暂时没有引用正式美术资源。
- 后续你可以先在 Cocos 里打开这些 Prefab，替换 SpriteFrame、调整坐标、调整大小。
- 等美术和位置稳定后，再把 `SceneDniu.js` 的临时代码逐步迁移到这些 Prefab。

## 1. 当前状态

当前 `SceneDniu.js` 已经具备临时可玩的流程：

- 8 人座位映射。
- 自己视角永远在下方。
- 抢庄按钮：`不抢 / 1倍 / 2倍 / 3倍 / 4倍`。
- 下注按钮：`1 / 2 / 4 / 5`。
- 发前 4 张牌。
- 补第 5 张牌。
- 临时 `搓牌 / 开牌`。
- 开牌确认协议 `CS_DNIU_SHOW_CARDS`。
- 旁观者基础视角。

但这些 UI 大部分仍是代码直接生成的临时节点，不适合长期维护和替换美术。

## 2. 目标结构

建议把牛牛场景拆成一个主场景 Prefab，加若干子 Prefab：

```text
SceneDniuRoot
├── BackgroundLayer
│   ├── TableBg
│   ├── DarkMask
│   └── SafeAreaGuides
├── TopLayer
│   ├── BackButton
│   ├── RoomInfo
│   ├── NetworkInfo
│   ├── RuleButton
│   └── MenuButton
├── TableLayer
│   ├── SeatRoot
│   │   ├── Seat_0_Self      DniuSeat.prefab
│   │   ├── Seat_1_RightLow  DniuSeat.prefab
│   │   ├── Seat_2_RightMid  DniuSeat.prefab
│   │   ├── Seat_3_RightTop  DniuSeat.prefab
│   │   ├── Seat_4_Top       DniuSeat.prefab
│   │   ├── Seat_5_LeftTop   DniuSeat.prefab
│   │   ├── Seat_6_LeftMid   DniuSeat.prefab
│   │   └── Seat_7_LeftLow   DniuSeat.prefab
│   ├── CardRoot
│   │   ├── Cards_0_Self      DniuCardGroup.prefab
│   │   ├── Cards_1_RightLow  DniuCardGroup.prefab
│   │   ├── Cards_2_RightMid  DniuCardGroup.prefab
│   │   ├── Cards_3_RightTop  DniuCardGroup.prefab
│   │   ├── Cards_4_Top       DniuCardGroup.prefab
│   │   ├── Cards_5_LeftTop   DniuCardGroup.prefab
│   │   ├── Cards_6_LeftMid   DniuCardGroup.prefab
│   │   └── Cards_7_LeftLow   DniuCardGroup.prefab
│   ├── CenterRoot
│   │   ├── Clock
│   │   ├── PhaseTitle
│   │   ├── BankerFlyStart
│   │   └── PotArea
│   └── EffectRoot
│       ├── BankerEffect
│       ├── ChipEffect
│       ├── CoinEffect
│       └── ToastEffect
├── ActionLayer
│   ├── CallBankerPanel     DniuActionPanel.prefab
│   ├── BetPanel            DniuActionPanel.prefab
│   ├── RubCardPanel        DniuRubCardPanel.prefab
│   ├── ReadyButton
│   └── SitButton
├── ResultLayer
│   ├── RoundSummary
│   └── ContinueTip
└── DebugLayer
    └── DniuDebugPanel
```

## 3. Prefab 拆分

### 3.1 DniuSeat.prefab

单个座位，只负责玩家信息显示。

```text
DniuSeat
├── AvatarFrame
│   ├── AvatarMask
│   │   └── AvatarSprite
│   └── BankerIcon
├── NameBg
│   └── NameLabel
├── ScoreLabel
├── ReadyStatus
├── CallBetStatus
├── NiuTypeLabel
└── TurnScoreLabel
```

脚本只绑定这些节点，不负责决定位置。位置由 `SceneDniuRoot` 的 8 个座位节点确定。

### 3.2 DniuCard.prefab

单张牌。

```text
DniuCard
├── Back
├── Front
│   ├── RankSmall
│   ├── SuitSmall
│   └── SuitCenter
└── Highlight
```

后续美术到位后：

- `Back` 替换牌背图。
- `Front` 替换牌面图或牌面图集。
- 翻牌、抬牌、搓牌只操作这个节点。

### 3.3 DniuCardGroup.prefab

一个玩家的 5 张牌。

```text
DniuCardGroup
├── CardSlot1
├── CardSlot2
├── CardSlot3
├── CardSlot4
├── CardSlot5
└── NiuResult
```

自己视角和别人视角可以用同一个 Prefab，但尺寸和间距由配置控制：

```js
self:  scale 0.82, gap 44
other: scale 0.46, gap 22
```

### 3.4 DniuActionPanel.prefab

抢庄和下注可以共用一个按钮面板。

```text
DniuActionPanel
├── Bg
├── Button_0
├── Button_1
├── Button_2
├── Button_3
└── Button_4
```

抢庄状态显示：

```text
不抢 / 1倍 / 2倍 / 3倍 / 4倍
```

下注状态显示：

```text
1 / 2 / 4 / 5
```

### 3.5 DniuRubCardPanel.prefab

搓牌阶段单独做，后续重点按 `myself.mp4` 还原。

```text
DniuRubCardPanel
├── Bg
├── RubButton
├── OpenButton
├── RubCardPreview
│   ├── CardBack
│   ├── CardFrontMask
│   └── FingerGuide
└── Countdown
```

当前临时版本只是第 5 张牌上移、晃动、回位；正式版本应做局部揭牌和手势轨迹。

## 4. 脚本拆分建议

后续从 `SceneDniu.js` 抽出：

```text
DniuSceneController.js      主流程、消息分发
DniuSeatView.js             座位显示
DniuCardView.js             单张牌显示和翻牌
DniuCardGroupView.js        牌组布局、发牌、抬牌
DniuActionPanelView.js      抢庄/下注按钮
DniuRubCardView.js          搓牌和开牌
DniuEffectLayer.js          飞庄、筹码、金币
DniuDebugPanel.js           测试按钮
```

拆分顺序：

1. `DniuSeatView`
2. `DniuCardView`
3. `DniuCardGroupView`
4. `DniuActionPanelView`
5. `DniuRubCardView`
6. `DniuEffectLayer`

## 5. 美术资源接入顺序

等美术资源到位后，按这个顺序替换：

1. 桌面背景和房间顶部 UI。
2. 8 个座位头像框、名字底、分数底。
3. 牌背和牌面。
4. 抢庄按钮和下注按钮。
5. 搓牌面板和开牌按钮。
6. 庄标、抢庄倍数、不抢标识。
7. 筹码、金币、飞行动效资源。
8. 结算面板。
9. 旁观者 `坐下` 按钮和下局加入状态。

每一步替换后都先跑一局，不要一次性全换。

## 6. 坐标和适配策略

建议在 Prefab 中手动摆好基础坐标，脚本只做数据填充和状态切换。

节点坐标建议：

- `SeatRoot` 和 `CardRoot` 使用同一套 8 人座位参考点。
- 自己座位固定在屏幕下方。
- 其他 7 个座位按视频分布。
- `ActionLayer` 永远在牌桌上方，不能被牌、金币、结算遮挡。
- `EffectRoot` 高于桌面和座位，低于弹窗。
- `DebugLayer` 最上层，但正式版隐藏。

适配建议：

- 顶部栏、右上角按钮、底部操作区使用 `Widget`。
- 牌桌区域不要用 `Widget` 拉伸单个座位，使用统一缩放。
- 关键按钮不要贴边，预留刘海屏和浏览器黑边。

## 7. 后续执行方式

下一步不是继续深改临时代码，而是：

1. 先按本文档创建节点目录。
2. 再把现有代码里的临时节点绑定到这些节点。
3. 然后拆 `DniuSeat.prefab`。
4. 再拆 `DniuCard.prefab / DniuCardGroup.prefab`。
5. 再拆操作面板。
6. 美术资源到位后，从背景、座位、牌、按钮逐步替换。
7. 最后对照 `myself.mp4 / others.MP4` 一帧一帧扣动画和流程。

## 8. 当前暂停点

截至目前，牛牛游戏内临时流程已经能跑，但只是开发版：

- 不再继续以临时代码为最终 UI。
- 后续正式视觉都以 Prefab 和美术资源为准。
- 代码只负责流程、数据、动效调度。

## 9. Cocos 里优先打开和调整的顺序

建议先打开：

```text
assets/GamePoker/GameDniu/Prefab/SceneDniuRoot.prefab
```

先看整体层级和位置：

1. `BackgroundLayer`
2. `TopLayer`
3. `TableLayer/SeatRoot`
4. `TableLayer/CardRoot`
5. `ActionLayer`
6. `ResultLayer`

然后依次打开子 Prefab：

```text
DniuSeat.prefab
DniuCard.prefab
DniuCardGroup.prefab
DniuActionPanel.prefab
DniuRubCardPanel.prefab
DniuEffectLayer.prefab
DniuResultLayer.prefab
```

建议第一轮只做这些事：

- 替换背景图。
- 替换座位头像框、名字底、分数底。
- 替换牌背和牌面占位图。
- 调整 8 个座位和 8 组牌的坐标。
- 调整抢庄、下注、搓牌按钮的位置。

第一轮不要急着做：

- 复杂动画。
- 真正搓牌遮罩。
- 结算弹窗细节。
- 所有分辨率适配。

原因是现在还没有把 `SceneDniu.js` 正式绑定到这些 Prefab，先把视觉骨架摆准更重要。
