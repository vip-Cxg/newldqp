# 经营分析成员管理模块报告

## 当前结论

当前测试入口已经改为完整经营分析主界面：

```text
assets/prefabs/LeagueAnalysis/LeagueAnalysisView.prefab
```

不要再单独打开 `MemberPage.prefab` 或旧的 `MemberManageTest.prefab` 测最终布局。

原因：

- `MemberPage` 现在作为右侧内容页挂在 `LeagueAnalysisView/PageRoot` 下。
- 左侧 Tab、主框、关闭按钮、弹窗层都属于主界面壳子。
- 成员列表的 ScrollView、Row 坐标和可视区域必须依赖完整父级布局。

## 本次生成结构

```text
LeagueAnalysisView
├── MainFrame
├── Title
├── BtnClose
├── LeftMenu
│   ├── BtnStatistics
│   ├── BtnPartner
│   ├── BtnMember
│   ├── BtnAgentStatistics
│   ├── BtnRewardDetail
│   ├── BtnOperationRecord
│   └── BtnRewardWithdraw
├── PageRoot
│   └── MemberPage.prefab
└── PopupLayer
```

默认状态：

- `BtnMember` 使用选中态 `tab_selected_orange`
- 其他 Tab 使用未选中态 `tab_normal_green`
- 其他 Tab 暂时只打印日志，不切换页面
- `PageRoot` 运行时实例化 `MemberPage.prefab`

## Prefab 输出

目录：

```text
assets/prefabs/LeagueAnalysis/
```

当前生成：

```text
LeagueAnalysisView.prefab
MemberPage.prefab
MemberRow.prefab
SearchMemberPopup.prefab
ScorePopup.prefab
SetPartnerPopup.prefab
BattleDetailPopup.prefab
BattleReplayPopup.prefab
ConfirmPopup.prefab
```

旧入口已从生成结果中移除：

```text
MemberManageTest.prefab
```

## 脚本输出

目录：

```text
assets/scripts/LeagueAnalysis/
```

当前生成：

```text
LeagueAnalysisView.js
MemberRow.js
SearchMemberPopup.js
ScorePopup.js
SetPartnerPopup.js
BattleDetailPopup.js
BattleReplayPopup.js
ConfirmPopup.js
```

旧入口脚本已从生成结果中移除：

```text
MemberManageTest.js
```

## 成员页布局

`MemberPage.prefab` 只负责右侧内容区，不包含完整弹窗主框和左侧菜单。

结构：

```text
MemberPage
├── BgOut
├── BgIn
└── Content
    ├── TableHeader
    ├── HeaderPlayerInfo
    ├── HeaderStatus
    ├── HeaderRounds
    │   ├── LabelTop
    │   └── LabelBottom
    ├── HeaderContribution
    │   ├── LabelTop
    │   └── LabelBottom
    ├── HeaderResult
    │   ├── LabelTop
    │   └── LabelBottom
    ├── HeaderScore
    ├── ScrollView
    │   └── view
    │       └── content
    ├── SearchInput
    ├── SearchLabel
    └── BtnSearch
```

Header 多行文字已经拆成两个 Label，不再使用 `"\\n"`。

## Row 布局

`MemberRow.prefab` 使用真实 `row_member_bg`，并按效果图重新测量高度和内部节点。

结构重点：

```text
MemberRow
├── Bg
├── Avatar
├── RoleBadge
├── Name
├── UserID
├── Status
├── RoundsGroup
│   ├── TodayRounds
│   └── YesterdayRounds
├── ContributionGroup
│   ├── TodayContribution
│   └── YesterdayContribution
├── ResultGroup
│   ├── TodayResult
│   └── YesterdayResult
├── Score
├── TodayBox
├── TodayLabel
├── YesterdayBox
├── YesterdayLabel
├── BtnSetPartner
├── BtnLimitGame
├── BtnBattleDetail
├── BtnAddScore
└── BtnSubScore
```

Row 多行数值也已经拆成两个 Label。

## Popup 背景层级

所有弹窗统一为：

```text
PopupRoot
├── Mask
├── WindowFrame
│   └── Sprite = league_main_frame
├── BtnClose
└── PanelRoot
    ├── BgOut = league_bg_out
    ├── BgIn = league_bg_in
    └── Content
```

`ScorePopup` 是单独按参考图生成，不套普通弹窗模板。

## 九宫格资源

以下资源已写入非 0 inset，并在 prefab 中按需使用 `Sprite.Type.SLICED`：

```text
league_main_frame 35 35 35 35
league_bg_out 28 28 28 28
league_bg_in 24 24 24 24
row_member_bg 28 28 28 28
table_header_green 18 18 18 18
input_box 12 12 12 12
keypad_button 22 22 22 22
btn_green_small 18 18 18 18
btn_red_small 18 18 18 18
btn_blue_small 18 18 18 18
btn_score_add 28 28 28 28
btn_score_sub 28 28 28 28
btn_search 18 18 18 18
```

当前没有无法设置 inset 的资源。

## 测量文档

布局测量记录在：

```text
docs/league-analysis/LAYOUT_MEASUREMENTS.md
```

里面记录了：

- MainFrame
- LeftMenu
- 每个 Tab
- PageRoot
- MemberPage 背景
- TableHeader
- ScrollView view
- SearchInput
- BtnSearch
- MemberRow
- MemberRow 内主要节点

## 测试方式

在终端执行：

```bash
cd /Users/gj/develop/newqp/newldqp
/usr/local/bin/node packages/ui-generator/main.js generate
/usr/local/bin/node packages/ui-generator/main.js validate
```

然后在 Cocos Creator 中打开：

```text
assets/prefabs/LeagueAnalysis/LeagueAnalysisView.prefab
```

预期：

- 能看到完整左侧 Tab
- 默认选中“成员管理”
- 右侧显示成员管理列表
- 成员 Row 在 ScrollView/content 中从上往下排列
- ScrollView 可以滚动
- 点击查询、上分、下分、战绩明细等按钮能弹出对应 Popup

## 布局回填和手调保护

为避免 Cocos Creator 中手动微调过的 prefab 被生成器覆盖，已增加布局 JSON 回填机制。

布局 JSON 目录：

```text
docs/league-analysis/layout/
```

当前已回填：

```text
league_analysis_view.json
member_page.json
member_row.json
score_popup.json
set_partner_popup.json
search_member_popup.json
battle_detail_popup.json
battle_detail_row.json
battle_replay_popup.json
battle_replay_row.json
confirm_popup.json
lock.json
```

`lock.json` 默认开启：

```json
{
  "lockManualLayout": true,
  "protectedPrefabs": [
    "LeagueAnalysisView",
    "MemberPage",
    "MemberRow",
    "ScorePopup",
    "SetPartnerPopup",
    "SearchMemberPopup",
    "BattleDetailPopup",
    "BattleReplayPopup",
    "ConfirmPopup",
    "BattleDetailRow",
    "BattleReplayRow"
  ]
}
```

普通生成流程现在会先读取当前真实 prefab 并回填 JSON，再按 JSON 生成，尽量保护 Cocos 中刚手调过的位置。

Cocos 菜单：

```text
Tools/LeagueAnalysis/1 安装/检查
Tools/LeagueAnalysis/2 生成/更新 LeagueAnalysis（保护手调布局）
Tools/LeagueAnalysis/3 回填当前 Prefab 布局到 JSON
Tools/LeagueAnalysis/4 验证 Prefab 与 JSON
Tools/LeagueAnalysis/5 强制重建布局（危险，会覆盖手调）
```

命令行：

```bash
cd /Users/gj/develop/newqp/newldqp
/usr/local/bin/node packages/ui-generator/main.js pull-layouts
/usr/local/bin/node packages/ui-generator/main.js generate
/usr/local/bin/node packages/ui-generator/main.js validate-layouts
/usr/local/bin/node packages/ui-generator/main.js force-generate
```

推荐工作流：

1. 在 Cocos Creator 里手动调整 prefab 节点位置、大小、字体、层级。
2. 点 `Tools/LeagueAnalysis/3 回填当前 Prefab 布局到 JSON`。
3. 点 `Tools/LeagueAnalysis/4 验证 Prefab 与 JSON`，报告输出到 `docs/league-analysis/layout/VALIDATION_REPORT.md`。
4. 以后点 `Tools/LeagueAnalysis/2 生成/更新 LeagueAnalysis（保护手调布局）` 会优先使用 JSON 布局。
5. 只有确认要放弃手调位置时，才点 `强制重建布局（危险）`。

当前回填字段：

- node path
- x / y
- width / height
- anchorX / anchorY
- scaleX / scaleY
- active
- opacity
- zIndex（按父节点 children 顺序记录）
- color
- Label fontSize / lineHeight / horizontalAlign / verticalAlign
- Sprite assetName / uuid / type
- Button targetPath
- ScrollView contentPath
- Layout type / resizeMode / spacing / padding

当前限制：

- 只能从磁盘上的真实 prefab 文件回填，不能直接读取 Cocos 场景中尚未保存的临时状态。
- 如果在 Cocos 中调整后没有保存 prefab，生成器读不到这些修改。
- 如果手动重命名或移动节点，旧 JSON 路径会显示为 `missingInGenerated`，需要重新回填。
