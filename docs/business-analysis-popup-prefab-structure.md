# 经营分析弹窗 Prefab 结构

本阶段弹窗布局以 prefab 为主，脚本只负责按钮点击、关闭、切换显示隐藏和后续数据填充。

资源目录：

- `assets/resources/Main/Prefab/BusinessAnalysis/`
- `assets/resources/hall/经营分析/images/`

## 1. 通用规则

每个弹窗根节点统一结构：

```text
BusinessAnalysisPopupXxx
├── PanelBg             # 弹窗整图背景
├── TitleLabel          # 标题
├── CloseButton         # 关闭按钮
└── Content / 左右面板   # 主内容区
```

要对齐效果图时，优先在 prefab 里调整节点位置、尺寸、字体、颜色和 SpriteFrame。
脚本中不要再写布局坐标。

## 2. 邀请玩家

文件：`BusinessAnalysisPopupInvite.prefab`

```text
BusinessAnalysisPopupInvite
├── PanelBg
├── TitleLabel
├── CloseButton
└── Content
    ├── InputPanel
    ├── InputTitle
    ├── SearchInput
    ├── SearchInputLabel
    ├── Key_1
    ├── Key_2
    ├── Key_3
    ├── Key_4
    ├── Key_5
    ├── Key_6
    ├── Key_7
    ├── Key_8
    ├── Key_9
    ├── Key_重输
    ├── Key_0
    ├── Key_删除
    └── SearchConfirmButton
```

点击 `SearchConfirmButton` 后续接入“输入玩家 ID 发起邀请”接口。

## 3. 查看下级

文件：`BusinessAnalysisPopupChildren.prefab`

```text
BusinessAnalysisPopupChildren
├── PanelBg
├── TitleLabel
├── CloseButton
├── LeftPanel
│   ├── LeftBg
│   ├── TopUserBg
│   ├── LeaderBadge
│   ├── LeaderAvatar
│   ├── LeaderName
│   ├── LeaderId
│   ├── CaptainTabButton
│   └── MemberTabButton
└── RightPanel
    ├── RightBg
    ├── CaptainView
    │   ├── HeaderBg
    │   ├── 玩家信息Title
    │   ├── 比例Title
    │   ├── 昨日收益/昨日局数Title
    │   ├── 今日收益/今日局数Title
    │   ├── 积分Title
    │   └── CaptainScroll
    │       └── content
    │           └── RowBg/Avatar/Name/Rate/Yesterday/Today/Score...
    ├── MemberView
    │   ├── HeaderBg
    │   ├── 玩家信息Title
    │   ├── 局数Title
    │   ├── 积分Title
    │   ├── 大赢家次数Title
    │   ├── 总赢分Title
    │   ├── 贡献分Title
    │   └── MemberScroll
    │       └── content
    │           └── RowBg/Avatar/Name/Rounds/Score/Winner/TotalWin/Contribution...
    ├── SearchInputBg
    ├── SearchInputLabel
    └── SearchButton
```

`CaptainView` 和 `MemberView` 是两个独立页面，点击左侧两个按钮时只切换 active。

## 4. 战绩明细

文件：`BusinessAnalysisPopupRecord.prefab`

```text
BusinessAnalysisPopupRecord
├── PanelBg
├── TitleLabel
├── CloseButton
└── Content
    ├── DateTab0..DateTab6
    ├── SummaryBg
    ├── Avatar
    ├── UserNameLabel
    ├── TodayRoundsLabel
    ├── WinLabel
    ├── RoundHeaderBg
    ├── RoomInfoLabel
    ├── GameNameLabel
    ├── ReplayCodeLabel
    ├── DetailScroll
    │   └── content
    │       └── PlayerAvatar/PlayerName/PlayerScore...
    ├── CopyReplayCodeButton
    └── OpenReplayButton
```

## 5. 战绩回放

文件：`BusinessAnalysisPopupReplay.prefab`

```text
BusinessAnalysisPopupReplay
├── PanelBg
├── TitleLabel
├── CloseButton
└── Content
    ├── RoomHeaderBg
    ├── RoomLabel
    ├── RoundLabel
    └── ReplayScroll
        └── content
            └── ReplayRowBg/ReplayResult/ReplayRound/ReplayPlayer/ReplayScore/ReplayButton...
```

回放列表已经改为 `ScrollView`，后续接接口时只往 `ReplayScroll/content` 填数据。
