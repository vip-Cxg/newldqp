# LeagueAnalysis 布局测量表

坐标基准：

- 参考图尺寸：1334 x 750
- `CocosX = 截图中心点X - 667`
- `CocosY = 375 - 截图中心点Y`
- 表格里的截图 x / y 都是节点中心点，不是左上角。

当前测试入口统一为：

```text
assets/prefabs/LeagueAnalysis/LeagueAnalysisView.prefab
```

不要再单独打开 `MemberPage.prefab` 做最终效果验证。`MemberPage` 必须挂在完整经营分析主框架的 `PageRoot` 下。

## ref_member_page.jpg

来源：`docs/ui-reference/member/ref_member_page.jpg`

### 主界面壳子

| 节点名 | 截图x | 截图y | width | height | CocosX | CocosY | 资源 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| LeagueAnalysisView | 667 | 375 | 1334 | 750 | 0 | 0 | - |
| MainFrame | 664 | 372 | 1311 | 717 | -3 | 3 | league_main_frame |
| Title | 667 | 48 | 360 | 58 | 0 | 327 | Label |
| BtnClose | 1302 | 31 | 54 | 54 | 635 | 344 | btn_close |
| LeftMenu | 142 | 396 | 228 | 580 | -525 | -21 | - |
| PageRoot | 783 | 395 | 1040 | 582 | 116 | -20 | - |
| PopupLayer | 667 | 375 | 1334 | 750 | 0 | 0 | - |

### 左侧 Tab

| 节点名 | 截图x | 截图y | width | height | CocosX | CocosY | 资源 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| BtnStatistics | 142 | 149 | 204 | 74 | -525 | 226 | tab_normal_green |
| BtnPartner | 142 | 230 | 204 | 74 | -525 | 145 | tab_normal_green |
| BtnMember | 142 | 311 | 204 | 74 | -525 | 64 | tab_selected_orange |
| BtnAgentStatistics | 142 | 392 | 204 | 74 | -525 | -17 | tab_normal_green |
| BtnRewardDetail | 142 | 473 | 204 | 74 | -525 | -98 | tab_normal_green |
| BtnOperationRecord | 142 | 555 | 204 | 74 | -525 | -180 | tab_normal_green |
| BtnRewardWithdraw | 142 | 636 | 204 | 74 | -525 | -261 | tab_normal_green |

在 `LeftMenu` 内部的本地坐标：

| 节点名 | localX | localY |
| --- | ---: | ---: |
| BtnStatistics | 0 | 247 |
| BtnPartner | 0 | 166 |
| BtnMember | 0 | 85 |
| BtnAgentStatistics | 0 | 4 |
| BtnRewardDetail | 0 | -77 |
| BtnOperationRecord | 0 | -159 |
| BtnRewardWithdraw | 0 | -240 |

### MemberPage 右侧内容区

这些节点坐标先按参考图测量，再换算到 `PageRoot` 本地坐标生成。

| 节点名 | 截图x | 截图y | width | height | CocosX | CocosY | PageRoot localX | PageRoot localY | 资源 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| MemberPage Bg | 783 | 395 | 1040 | 582 | 116 | -20 | 0 | 0 | league_bg_out / league_bg_in |
| TableHeader | 782 | 136 | 1028 | 63 | 115 | 239 | -1 | 259 | table_header_green |
| ScrollView view | 782 | 355 | 1028 | 372 | 115 | 20 | -1 | 40 | - |
| SearchInput | 425 | 650 | 290 | 48 | -242 | -275 | -358 | -255 | input_box |
| BtnSearch | 648 | 648 | 131 | 67 | -19 | -273 | -135 | -253 | btn_search |

### Header 拆分 Label

Header 禁止使用 `"\\n"`。需要上下两行的表头全部拆成两个 Label。

| 节点名 | 说明 |
| --- | --- |
| HeaderRounds/LabelTop | 今日局数 |
| HeaderRounds/LabelBottom | 昨日局数 |
| HeaderContribution/LabelTop | 今日贡献 |
| HeaderContribution/LabelBottom | 昨日贡献 |
| HeaderResult/LabelTop | 今日战绩 |
| HeaderResult/LabelBottom | 昨日战绩 |

### MemberRow

| 节点名 | 截图x | 截图y | width | height | CocosX | CocosY | Row localX | Row localY | 资源 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| MemberRow | 782 | 260 | 1028 | 184 | 115 | 115 | 0 | 0 | row_member_bg |
| RoleBadge | 282 | 206 | 22 | 56 | -385 | 169 | -500 | 54 | badge_leader / badge_direct |
| Avatar | 320 | 212 | 72 | 72 | -347 | 163 | -462 | 48 | input_box_bg |
| Name | 400 | 204 | 120 | 30 | -267 | 171 | -382 | 56 | Label |
| UserID | 400 | 235 | 120 | 30 | -267 | 140 | -382 | 25 | Label |
| Status | 545 | 226 | 90 | 42 | -122 | 149 | -237 | 34 | Label |
| RoundsGroup | 742 | 224 | 80 | 64 | 75 | 151 | -40 | 36 | LabelGroup |
| ContributionGroup | 906 | 224 | 90 | 64 | 239 | 151 | 124 | 36 | LabelGroup |
| ResultGroup | 1065 | 224 | 90 | 64 | 398 | 151 | 283 | 36 | LabelGroup |
| Score | 1215 | 224 | 100 | 42 | 548 | 151 | 433 | 36 | Label |
| TodayBox | 371 | 295 | 160 | 30 | -296 | 80 | -411 | -35 | league_bg_out |
| YesterdayBox | 371 | 329 | 160 | 30 | -296 | 46 | -411 | -69 | league_bg_out |
| BtnSetPartner | 629 | 314 | 127 | 47 | -38 | 61 | -153 | -54 | btn_green_small |
| BtnLimitGame | 776 | 314 | 127 | 47 | 109 | 61 | -6 | -54 | btn_red_small |
| BtnBattleDetail | 923 | 314 | 127 | 47 | 256 | 61 | 141 | -54 | btn_blue_small |
| BtnAddScore | 1066 | 311 | 131 | 67 | 399 | 64 | 284 | -51 | btn_score_add |
| BtnSubScore | 1217 | 311 | 131 | 67 | 550 | 64 | 435 | -51 | btn_score_sub |

Row 内多行数值也必须拆 Label：

| 节点名 | 子 Label |
| --- | --- |
| RoundsGroup | TodayRounds / YesterdayRounds |
| ContributionGroup | TodayContribution / YesterdayContribution |
| ResultGroup | TodayResult / YesterdayResult |

ScrollView/content 规则：

- `ScrollView` 节点尺寸：1028 x 372
- `view` 节点尺寸：1028 x 372，并挂 `cc.Mask`
- `content` 锚点：`(0, 1)`
- `content` 初始坐标：`(-514, 186)`
- `content` 宽度：1028
- `content` 高度：1600
- `Layout.spacingY`：4
- Row 从 `content` 顶部往下排列，不允许超出 view 后仍可见。

## ref_score_popup.jpg

来源：`docs/ui-reference/member/ref_score_popup.jpg`

| 节点名 | 截图x | 截图y | width | height | CocosX | CocosY | 资源 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| WindowFrame | 693 | 366 | 892 | 647 | 26 | 9 | league_main_frame |
| BtnClose | 1125 | 57 | 58 | 58 | 458 | 318 | btn_close |
| PanelRoot | 691 | 385 | 862 | 556 | 24 | -10 | - |
| BgOut | 691 | 385 | 862 | 556 | 0 | 0 | league_bg_out |
| BgIn | 691 | 385 | 838 | 532 | 0 | 0 | league_bg_in |
| Title | 693 | 73 | 300 | 56 | 2 | 312 | Label |
| LeftPanel | 378 | 386 | 222 | 552 | -313 | -1 | league_bg_out |
| BtnAddMode | 375 | 156 | 200 | 74 | -316 | 229 | tab_selected_orange / tab_normal_green |
| BtnSubMode | 375 | 242 | 200 | 74 | -316 | 143 | tab_selected_orange / tab_normal_green |
| ScoreInput | 807 | 152 | 624 | 91 | 116 | 233 | league_bg_out |
| ScoreInputBox | 809 | 156 | 550 | 58 | 118 | 229 | input_box |
| Keyboard | 807 | 376 | 631 | 354 | 116 | 9 | keypad_button |
| MyScoreLabel | 620 | 612 | 260 | 42 | -71 | -227 | Label |
| BtnConfirm | 1014 | 609 | 202 | 70 | 323 | -224 | btn_green_small |

## ref_search_member_popup.jpg

| 节点名 | 截图x | 截图y | width | height | CocosX | CocosY | 资源 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| WindowFrame | 667 | 375 | 760 | 500 | 0 | 0 | league_main_frame |
| BtnClose | 1013 | 159 | 54 | 54 | 346 | 216 | btn_close |
| PanelRoot | 667 | 403 | 698 | 384 | 0 | -28 | - |
| BgOut | 667 | 403 | 698 | 384 | 0 | 0 | league_bg_out |
| BgIn | 667 | 403 | 664 | 348 | 0 | 0 | league_bg_in |
| Content | 667 | 403 | 644 | 328 | 0 | 0 | - |
| InputBox | 757 | 313 | 360 | 55 | 90 | 90 | input_box |
| Keyboard | 457 | 395 | 433 | 308 | -210 | -20 | keypad_button |

## ref_battle_detail_popup.jpg

来源：`docs/ui-reference/member/ref_battle_detail_popup.jpg`

| 节点名 | 截图x | 截图y | width | height | CocosX | CocosY | 资源 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| WindowFrame | 667 | 375 | 1075 | 604 | 0 | 0 | league_main_frame |
| BtnClose | 1171 | 107 | 54 | 54 | 504 | 268 | btn_close |
| PanelRoot | 667 | 403 | 1013 | 488 | 0 | -28 | - |
| BgOut | 667 | 403 | 1013 | 488 | 0 | 0 | league_bg_out |
| BgIn | 667 | 403 | 979 | 452 | 0 | 0 | league_bg_in |
| DateButton1 | 240 | 145 | 136 | 48 | -427 | 230 | btn_orange |
| DateButton2 | 388 | 145 | 136 | 48 | -279 | 230 | btn_green_small |
| DateButton3 | 536 | 145 | 136 | 48 | -131 | 230 | btn_green_small |
| DateButton4 | 684 | 145 | 136 | 48 | 17 | 230 | btn_green_small |
| DateButton5 | 832 | 145 | 136 | 48 | 165 | 230 | btn_green_small |
| DateButton6 | 980 | 145 | 136 | 48 | 313 | 230 | btn_green_small |
| DateButton7 | 1128 | 145 | 136 | 48 | 461 | 230 | btn_green_small |
| PlayerSummary | 667 | 234 | 920 | 96 | 0 | 141 | row_simple_bg |
| PlayerSummary/Bg | 667 | 234 | 920 | 92 | 0 | 141 | row_simple_bg |
| PlayerSummary/Avatar | 277 | 234 | 66 | 66 | -390 | 141 | input_box |
| PlayerSummary/Name | 365 | 219 | 145 | 30 | -302 | 156 | Label |
| PlayerSummary/UserID | 365 | 251 | 145 | 30 | -302 | 124 | Label |
| PlayerSummary/TodayRound | 639 | 234 | 230 | 44 | -28 | 141 | Label |
| PlayerSummary/WinLose | 973 | 234 | 230 | 44 | 306 | 141 | Label |
| ScrollView | 667 | 437 | 920 | 300 | 0 | -62 | - |
| BattleDetailRow | 667 | 403 | 920 | 206 | 0 | -28 | row_battle_bg |
| BattleDetailRow/HeaderBar | 595 | 329 | 760 | 48 | -72 | 46 | table_header_green |
| HeaderBar/RoomId | 285 | 329 | 170 | 36 | -382 | 46 | Label |
| HeaderBar/Time | 473 | 329 | 210 | 36 | -194 | 46 | Label |
| HeaderBar/GameType | 683 | 329 | 150 | 36 | 16 | 46 | Label |
| HeaderBar/ReplayCode | 850 | 329 | 300 | 36 | 183 | 46 | Label |
| BattleDetailRow/PlayerCardsArea | 597 | 433 | 760 | 124 | -70 | -58 | - |
| PlayerCard_0..7 | 271..922 | 433 | 86 | 116 | -396..255 | -58 | input_box / Label |
| RightButtons | 1057 | 399 | 140 | 150 | 390 | -24 | - |
| BtnCopyReplayCode | 1057 | 367 | 127 | 47 | 390 | 8 | btn_blue_small |
| BtnViewReplay | 1057 | 433 | 127 | 47 | 390 | -58 | btn_blue_small |

日期按钮结构：

```text
DateButtonN
├── Normal   // btn_green_small
├── Selected // btn_orange
└── Label
```

点击任意日期时，脚本会把所有按钮切回 `Normal`，当前按钮显示 `Selected`。

BattleDetailRow 分区：

```text
BattleDetailRow
├── HeaderBar
│   ├── RoomId
│   ├── Time
│   ├── GameType
│   └── ReplayCode
├── PlayerCardsArea
│   ├── PlayerCard_0
│   ├── PlayerCard_1
│   └── ...
└── RightButtons
    ├── BtnCopyReplayCode
    └── BtnViewReplay
```

BattleDetailRow 静态数据至少包含：

```js
{
  roomID: "123456",
  time: "2019-12-12 12:12",
  gameName: "牛牛0.5底",
  replayCode: "WEEWTFDGFDFGDGFAF",
  players: [
    { name: "哇卡一为...", maskedID: "12****6", score: "+3605" },
    { name: "哇卡一为...", maskedID: "12****6", score: "-36" }
  ]
}
```

## ref_battle_replay_popup.jpg

来源：`docs/ui-reference/member/ref_battle_replay_popup.jpg`

| 节点名 | 截图x | 截图y | width | height | CocosX | CocosY | 资源 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| WindowFrame | 667 | 375 | 1075 | 604 | 0 | 0 | league_main_frame |
| BtnClose | 1171 | 107 | 54 | 54 | 504 | 268 | btn_close |
| PanelRoot | 667 | 403 | 1013 | 488 | 0 | -28 | - |
| BgOut | 667 | 403 | 1013 | 488 | 0 | 0 | league_bg_out |
| BgIn | 667 | 403 | 979 | 452 | 0 | 0 | league_bg_in |
| HeaderBg | 667 | 197 | 920 | 58 | 0 | 178 | row_simple_bg |
| RoomLabel | 337 | 197 | 250 | 42 | -330 | 178 | Label |
| RoundLabel | 597 | 197 | 170 | 42 | -70 | 178 | Label |
| ScrollView | 667 | 413 | 920 | 430 | 0 | -38 | - |
| BattleReplayRow | 667 | 305 | 920 | 188 | 0 | 70 | battle_replay_row_bg |
| ResultArea | 297 | 305 | 180 | 160 | -370 | 70 | battle_lose_icon / battle_win_icon |
| ResultIcon | 259 | 283 | 72 | 72 | -408 | 92 | battle_lose_icon / battle_win_icon |
| ResultArea/RoundLabel | 337 | 285 | 85 | 54 | -330 | 90 | Label |
| PlayerListArea | 631 | 305 | 570 | 160 | -36 | 70 | - |
| PlayerListLeft | 491 | 305 | 250 | 150 | -176 | 70 | Label |
| PlayerListRight | 781 | 305 | 250 | 150 | 114 | 70 | Label |
| ActionArea | 1025 | 305 | 180 | 160 | 358 | 70 | - |
| BtnViewReplay | 1025 | 305 | 145 | 56 | 358 | 70 | btn_blue_small |

BattleReplayRow 分区：

```text
BattleReplayRow
├── ResultArea       // 180 宽，输/赢 + 1/7
├── PlayerListArea   // 570 宽，两列玩家名字和分数
└── ActionArea       // 180 宽，查看回放按钮居中
```

BattleReplayRow 静态数据至少包含：

```js
[
  {
    result: "lose",
    round: "1/7",
    players: [
      { name: "玩家昵称...", score: "+18" },
      { name: "玩家昵称...", score: "-180" }
    ]
  },
  {
    result: "win",
    round: "2/7",
    players: [
      { name: "玩家昵称...", score: "+18" },
      { name: "玩家昵称...", score: "-180" }
    ]
  },
  { result: "lose", round: "3/7", players: [] },
  { result: "win", round: "4/7", players: [] },
  { result: "lose", round: "5/7", players: [] }
]
```

## 当前未处理参考图

以下图片属于后续 partner tab 或当前 `docs/ui-reference/member` 目录不存在，本阶段不作为成员管理主界面生成依据：

```text
set_partner_popup.jpg
ref_member_direct_page.jpg
ref_member_leader_page.jpg
```
