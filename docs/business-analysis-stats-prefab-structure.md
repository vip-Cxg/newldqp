# 经营分析统计页 Prefab 结构

本文档用于把 `assets/resources/hall/经营分析/统计/效果图.jpg` 一比一还原成 `BusinessAnalysisView.prefab`。

## 1. 推荐方式

统计页先用 Cocos 编辑器手动摆 Prefab。

代码只负责：

- 打开/关闭弹窗。
- 切换左侧 Tab。
- 填充统计数据。
- 绑定按钮点击。

不要让代码持续控制所有节点坐标。这样后续你替换美术、微调位置最快，也最不容易出现不同步。

## 2. 坐标基准

Prefab 设计尺寸：

```text
BusinessAnalysisView  1334 x 750
锚点：0.5, 0.5
坐标原点：中心点
```

效果图资源尺寸：

```text
统计/效果图.jpg  1334 x 750
统计/bg01.png    1311 x 720
统计/bg02.png    499 x 238
统计/bg03.png    271 x 107
统计/anniu01.png 167 x 67
统计/anniu02.png 167 x 67
统计/an01.png    204 x 74
统计/guanbi.png  54 x 54
```

注意：所有图片节点的 `cc.Sprite.sizeMode` 要用 `CUSTOM`，否则图片会保持原始尺寸，导致布局和效果图完全错位。

## 3. 主节点目录

```text
BusinessAnalysisView
├── Mask
├── Panel
│   ├── Bg
│   ├── Header
│   │   ├── TitleLabel
│   │   └── CloseButton
│   ├── LeftTabs
│   │   ├── Tab_Stats
│   │   ├── Tab_Partner
│   │   ├── Tab_Member
│   │   ├── Tab_AgentStats
│   │   ├── Tab_RewardDetail
│   │   ├── Tab_OperateLog
│   │   └── Tab_RewardWithdraw
│   └── Content
│       ├── ContentBg
│       ├── StatsTab
│       │   ├── ScoreTitle
│       │   ├── ScoreBlock
│       │   │   ├── TodayRewardLabel
│       │   │   └── YesterdayRewardLabel
│       │   ├── TotalTitle
│       │   ├── TotalBlock
│       │   │   ├── TeamScoreLabel
│       │   │   ├── TeamUserLabel
│       │   │   ├── RoomRateLabel
│       │   │   ├── ShuffleRateLabel
│       │   │   └── GameRoundLabel
│       │   └── BottomActions
│       │       ├── InviteButton
│       │       ├── DirectCaptainBox
│       │       │   ├── Label
│       │       │   └── Value
│       │       ├── DirectMemberBox
│       │       │   ├── Label
│       │       │   └── Value
│       │       ├── IndirectMemberBox
│       │       │   ├── Label
│       │       │   └── Value
│       │       └── SetPartnerButton
│       ├── PartnerTab
│       ├── MemberTab
│       ├── AgentStatsTab
│       ├── RewardDetailTab
│       ├── OperateLogTab
│       └── RewardWithdrawTab
└── LoadingMask
```

## 4. 第一版参考坐标

以下坐标基于 `BusinessAnalysisView` 中心点。

```text
Panel                 x=0,    y=0,    w=1311, h=720,  sprite=bg01
Header                x=0,    y=322,  w=1311, h=70
TitleLabel            x=0,    y=0,    w=260,  h=62
CloseButton           x=645,  y=0,    w=54,   h=54,   sprite=guanbi

LeftTabs              x=-524, y=-48,  w=214,  h=594
Tab_Stats             x=0,    y=236,  w=204,  h=74,   sprite=anniu02
Tab_Partner           x=0,    y=155,  w=204,  h=74,   sprite=anniu01
Tab_Member            x=0,    y=74,   w=204,  h=74,   sprite=anniu01
Tab_AgentStats        x=0,    y=-7,   w=204,  h=74,   sprite=anniu01
Tab_RewardDetail      x=0,    y=-88,  w=204,  h=74,   sprite=anniu01
Tab_OperateLog        x=0,    y=-169, w=204,  h=74,   sprite=anniu01
Tab_RewardWithdraw    x=0,    y=-250, w=204,  h=74,   sprite=anniu01

Content               x=118,  y=-22,  w=1038, h=606
ContentBg             x=0,    y=0,    w=1038, h=606,  sprite=bg02

StatsTab              x=0,    y=0,    w=1038, h=606
ScoreTitle            x=-405, y=250,  w=220,  h=44
ScoreBlock            x=0,    y=183,  w=1032, h=107,  sprite=bg03
TodayRewardLabel      x=-260, y=0,    w=360,  h=48
YesterdayRewardLabel  x=260,  y=0,    w=360,  h=48

TotalTitle            x=-405, y=70,   w=220,  h=44
TotalBlock            x=0,    y=-62,  w=1032, h=208,  sprite=bg03
TeamScoreLabel        x=-270, y=48,   w=420,  h=48
TeamUserLabel         x=-270, y=-50,  w=420,  h=48
RoomRateLabel         x=260,  y=62,   w=380,  h=44
ShuffleRateLabel      x=260,  y=10,   w=380,  h=44
GameRoundLabel        x=260,  y=-44,  w=380,  h=44

BottomActions         x=0,    y=-257, w=1000, h=76
InviteButton          x=-420, y=0,    w=164,  h=60,   sprite=an01
DirectCaptainBox      x=-210, y=0,    w=194,  h=80,   sprite=bg03
DirectMemberBox       x=0,    y=0,    w=194,  h=80,   sprite=bg03
IndirectMemberBox     x=210,  y=0,    w=194,  h=80,   sprite=bg03
SetPartnerButton      x=428,  y=0,    w=164,  h=60,   sprite=an01
```

这些坐标是第一版参考值。你在 Cocos 里可以直接按效果图继续微调。

## 5. 手动摆放建议

建议你先只摆这几个关键层：

1. `Panel/Bg`
2. `Header/TitleLabel`
3. `Header/CloseButton`
4. `LeftTabs` 下 7 个按钮
5. `Content/ContentBg`
6. `StatsTab/ScoreBlock`
7. `StatsTab/TotalBlock`
8. `StatsTab/BottomActions`

其他 Label 先放在对应父节点里，等底图位置稳定后再调文字。

## 6. 后续脚本绑定原则

后续新增 `BusinessAnalysisView.js` 时，只通过节点名查找并赋值：

```text
ScoreBlock/TodayRewardLabel
ScoreBlock/YesterdayRewardLabel
TotalBlock/TeamScoreLabel
TotalBlock/TeamUserLabel
TotalBlock/RoomRateLabel
TotalBlock/ShuffleRateLabel
TotalBlock/GameRoundLabel
BottomActions/DirectCaptainBox/Value
BottomActions/DirectMemberBox/Value
BottomActions/IndirectMemberBox/Value
```

脚本不要再写死这些节点坐标。

