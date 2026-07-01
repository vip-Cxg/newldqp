# 经营分析实现计划

本文档记录新版大厅 `经营分析` 的前后端实现路线。

目标：

- 按 `assets/resources/hall/经营分析` 下的效果图和美术资源，一步一步还原联盟经营分析界面。
- 后端优先复用现有联盟接口。
- 缺少的数据接口再补。
- 前端先搭静态结构和 Prefab，再接接口，再逐步抠样式和交互细节。

## 0. 当前进度

2026-07-01：

- 后端策略已调整为：新建经营分析后端模块，不直接修改旧联盟 JS。
- 已生成第一版主框架 Prefab：

```text
newldqp/assets/resources/Main/Prefab/BusinessAnalysisView.prefab
```

- 已按 `统计/效果图.jpg` 重做第一个 Tab 的静态布局：
  - 使用 `统计/bg01.png` 做主窗口背景。
  - 使用 `统计/anniu01.png`、`统计/anniu02.png` 做左侧 Tab 普通/选中状态。
  - 使用 `统计/bg02.png` 做“分数统计 / 总数据”数据块。
  - 使用 `统计/bg03.png` 做底部直属队长、直属成员、间接成员数据块。
  - 使用 `统计/an01.png` 做“邀请玩家 / 设置合伙人”按钮。
  - 使用 `统计/guanbi.png` 做关闭按钮。

- `BusinessAnalysisView.prefab` 已改为手动维护布局，生成脚本已删除，后续不再用脚本覆盖 Prefab 坐标。
- 已新增业务脚本并挂到 Prefab 根节点：

```text
newldqp/assets/script/ui/hall/BusinessAnalysisView.js
```

- 已新增弹窗路径：

```text
GameConfig.pop.BusinessAnalysisView = "Main/Prefab/BusinessAnalysisView"
```

当前 `BusinessAnalysisView.prefab` 是结构壳，包含：

- `Bg`
- `Panel`
- `Header`
- `LeftTabs`
- `CommonFilter`
- `Content`
- `StatsTab`，已初步对齐 `统计/效果图.jpg`
- 其他 Tab 占位节点
- `Pager`
- `LoadingMask`

当前还没有：

- 接入大厅入口。
- 接入后端接口。
- 其他 Tab 引用正式 SpriteFrame。

## 1. 资源目录

当前美术资源已放入：

```text
newldqp/assets/resources/hall/经营分析/
├── 统计/
│   ├── 效果图.jpg
│   ├── bg01.png
│   ├── bg02.png
│   ├── bg03.png
│   ├── anniu01.png
│   ├── anniu02.png
│   ├── an01.png
│   ├── liao01.png
│   └── guanbi.png
├── 代理统计/
│   └── 效果图.jpg
├── 成员管理/
│   ├── 成员管理效果图.jpg
│   ├── 设置合伙人效果图.jpg
│   ├── 战绩明细.jpg
│   ├── 战绩回放.jpg
│   ├── bg01.png
│   ├── bg11.png
│   ├── bg12.png
│   ├── zaixian.png
│   ├── lixian.png
│   ├── fengjin.png
│   ├── dayingjia_.png
│   ├── 上下分/
│   │   ├── 效果图.jpg
│   │   └── 查找成员效果图.jpg
│   └── ...
├── 合伙人/
│   ├── 合伙人效果图.jpg
│   ├── 调整比例效果图.jpg
│   ├── 调整警戒值效果图.jpg
│   ├── 查看下级/
│   │   ├── 查看下级-下级成员.jpg
│   │   └── 查看下级-下级队长.jpg
│   └── ...
├── 奖励明细/
│   ├── 效果图.jpg
│   ├── anniu.png
│   ├── shijianbg.png
│   ├── rili.png
│   └── ...
├── 奖励提取/
│   └── 效果图.jpg
└── 操作记录/
    └── 效果图.jpg
```

## 2. 后端策略

新版经营分析后端先不改旧联盟接口文件。

原因：

- 旧联盟逻辑集中在 `ldqp_xh/logic/game.js` 和 `ldqp_xh/logic/club.js`，文件已经很大。
- 直接改旧接口容易影响现有大厅、旧成员管理、旧合伙人功能。
- 新版经营分析需要按效果图重新聚合字段，适合先做新模块。

新策略：

```text
ldqp_xh/logic/businessAnalysis.js
```

建议路由前缀：

```text
/businessAnalysis
```

第一阶段只新增文件，不删除旧代码。

第二阶段新界面全部跑通后，再回头梳理旧接口是否删减或迁移。

### 2.1 新后端模块建议

```text
ldqp_xh/logic/businessAnalysis.js
├── POST /overview
├── POST /members
├── POST /member/detail
├── POST /partners
├── POST /partner/children
├── POST /reward/detail
├── POST /reward/withdraw
├── POST /operate/logs
└── POST /game/results
```

对外给前端的新接口：

```text
businessAnalysis/overview
businessAnalysis/members
businessAnalysis/member/detail
businessAnalysis/partners
businessAnalysis/partner/children
businessAnalysis/reward/detail
businessAnalysis/reward/withdraw
businessAnalysis/operate/logs
businessAnalysis/game/results
```

内部实现可以复用旧逻辑：

- 直接查询同一批表。
- 复用 `ApiHelper`。
- 必要时把旧接口里的 SQL 拷贝到新模块中整理，不直接修改旧接口。

### 2.2 现有接口盘点

旧前端接口常量在：

```text
newldqp/assets/GameBase/GameConfig.js
```

旧后端主要实现位置：

```text
ldqp_xh/logic/game.js
ldqp_xh/logic/club.js
```

这些接口暂时作为参考和复用来源，不作为新版前端直接依赖的最终接口。

### 2.3 可复用的旧接口逻辑

| 功能 | 前端常量 | 后端路由 | 备注 |
| --- | --- | --- | --- |
| 联盟信息 | `ClubInfo` | `game/clubInfo` | 返回当前用户在联盟中的角色、分数、房型等 |
| 成员/下级列表 | `UserList` | `game/subUsers` | 可用于成员管理、查看下级 |
| 上下分 | `UpdateScore` | `game/updateScore` | 成员管理里的上下分 |
| 设置合伙人 | `AddProxy` | `game/addProxy` | 普通成员升级合伙人 |
| 调配合伙人上级 | `ChangeProxyParent` | `club/updateProxyParent` | 调整上下级关系 |
| 调配玩家 | `ChangeProxy` | `game/changeProxy` | 玩家转移到指定合伙人 |
| 战绩 | `ClubLogs` | `game/logs` | 成员战绩列表、详情入口 |
| 体力明细 | `RewardDetail` | `game/rewardDetail` | 奖励明细可复用 |
| 体力汇总 | `RewardSummary` | `game/rewardSummary` | 奖励统计可复用 |
| 体力提取 | `DrawReward` | `game/drawReward` | 奖励提取 |
| 分数汇总 | `ScoreSummary` | `game/scoreSummary` | 统计页可复用一部分 |
| 业绩日志 | `UserPerformLog` | `game/performLog` | 代理统计/合伙人业绩 |
| 输赢统计 | `UserScore` | `club/gameResults` | 统计页、代理统计可复用 |
| 操作记录 | `ClubLogs` 或新增 | `game/logs` 不完全匹配 | 需要确认效果图字段 |

### 2.4 需要补的新接口

现有接口能覆盖主要数据，但新版效果图需要聚合字段和更明确的页面接口。建议新增一组 `businessAnalysis` 接口，前端更容易接：

```text
businessAnalysis/overview
businessAnalysis/members
businessAnalysis/member/detail
businessAnalysis/partners
businessAnalysis/partner/children
businessAnalysis/reward/detail
businessAnalysis/reward/withdraw
businessAnalysis/operate/logs
```

这组接口可以先在后端内部复用现有查询逻辑，不一定重写全部 SQL。

## 3. 权限规则

经营分析属于联盟管理能力，权限必须先定清楚。

建议：

| 角色 | 可见模块 |
| --- | --- |
| 会长 owner | 全部模块 |
| 管理员 manager | 统计、成员管理、战绩、操作记录，是否能上下分按现有规则 |
| 合伙人 proxy | 自己及下级统计、下级成员、奖励明细、奖励提取 |
| 普通成员 user | 默认不显示经营分析入口 |

后端必须以 `club_user.role / cluster / parent` 判断权限，前端只负责隐藏入口，不能当权限依据。

## 4. 前端模块拆分

建议新增目录：

```text
newldqp/assets/script/ui/business/
├── BusinessAnalysisView.js
├── BusinessStatsTab.js
├── BusinessAgentStatsTab.js
├── BusinessMemberTab.js
├── BusinessPartnerTab.js
├── BusinessRewardDetailTab.js
├── BusinessRewardWithdrawTab.js
├── BusinessOperateLogTab.js
├── components/
│   ├── BusinessTabButton.js
│   ├── BusinessTableRow.js
│   ├── BusinessDateFilter.js
│   ├── BusinessPager.js
│   ├── BusinessSearchBox.js
│   └── BusinessConfirmDialog.js
└── data/
    └── BusinessAnalysisApi.js
```

建议新增 Prefab：

```text
newldqp/assets/resources/Main/Prefab/
├── BusinessAnalysisView.prefab
├── BusinessStatsTab.prefab
├── BusinessAgentStatsTab.prefab
├── BusinessMemberTab.prefab
├── BusinessPartnerTab.prefab
├── BusinessRewardDetailTab.prefab
├── BusinessRewardWithdrawTab.prefab
├── BusinessOperateLogTab.prefab
├── BusinessTableRow.prefab
├── BusinessDateFilter.prefab
└── BusinessConfirmDialog.prefab
```

## 5. 主界面节点建议

```text
BusinessAnalysisView
├── Bg
├── Header
│   ├── Title
│   ├── CloseButton
│   └── ClubName
├── LeftTabs
│   ├── Tab_Stats
│   ├── Tab_AgentStats
│   ├── Tab_Member
│   ├── Tab_Partner
│   ├── Tab_RewardDetail
│   ├── Tab_RewardWithdraw
│   └── Tab_OperateLog
├── Content
│   ├── StatsTab
│   ├── AgentStatsTab
│   ├── MemberTab
│   ├── PartnerTab
│   ├── RewardDetailTab
│   ├── RewardWithdrawTab
│   └── OperateLogTab
├── CommonFilter
│   ├── DateFilter
│   ├── SearchBox
│   └── RefreshButton
└── LoadingMask
```

第一版可以先一个大 Prefab，等能跑后再拆子 Prefab。

## 6. 各模块需求拆解

### 6.1 统计

资源：

```text
经营分析/统计/效果图.jpg
```

前端显示：

- 今日/昨日切换。
- 总输赢。
- 总局数。
- 活跃人数。
- 奖励/抽水。
- 游戏分类统计。
- 日期筛选。

可复用接口：

- `club/gameResults`
- `game/scoreSummary`
- `game/rewardSummary`

可能补缺：

- 总览卡片建议新增 `game/business/overview`，一次性返回页面顶部所有聚合数据。

### 6.2 代理统计

资源：

```text
经营分析/代理统计/效果图.jpg
```

前端显示：

- 合伙人/队长列表。
- 下级人数。
- 今日业绩。
- 总业绩。
- 奖励。
- 输赢。
- 排序。

可复用接口：

- `club/gameResults`
- `game/performLog`
- `game/subUsers`

可能补缺：

- 需要按代理维度聚合所有下级数据，建议新增 `game/business/partner/stat`.

### 6.3 成员管理

资源：

```text
经营分析/成员管理/成员管理效果图.jpg
经营分析/成员管理/上下分/效果图.jpg
经营分析/成员管理/上下分/查找成员效果图.jpg
经营分析/成员管理/战绩明细.jpg
经营分析/成员管理/战绩回放.jpg
经营分析/成员管理/设置合伙人效果图.jpg
```

前端显示：

- 成员列表。
- 在线/离线。
- 当前分数。
- 奖励。
- 保险箱。
- 状态：正常、封禁、限制。
- 操作：上下分、查看战绩、设置合伙人、调配上级。

可复用接口：

- `game/subUsers`
- `game/updateScore`
- `game/addProxy`
- `game/logs`
- `game/changeProxy`

可能补缺：

- 成员列表需要更完整字段：`score / bank / reward / role / status / level / shuffleLevel / parent / online / todayScore / todayTurn`。
- 如果 `game/subUsers` 返回不全，建议新增 `game/business/members`。

### 6.4 合伙人

资源：

```text
经营分析/合伙人/合伙人效果图.jpg
经营分析/合伙人/调整比例效果图.jpg
经营分析/合伙人/调整警戒值效果图.jpg
经营分析/合伙人/查看下级/查看下级-下级成员.jpg
经营分析/合伙人/查看下级/查看下级-下级队长.jpg
```

前端显示：

- 合伙人列表。
- 分成比例。
- 洗牌比例。
- 警戒值。
- 下级队长。
- 下级成员。
- 调整比例。
- 调整警戒值。

可复用接口：

- `game/subUsers`
- `game/addProxy`
- `club/updateProxyParent`
- `game/updateLimit`

可能补缺：

- 修改比例接口目前只有 `addProxy` 创建合伙人时带 `level / shuffleLevel`，需要确认是否已有 `game/updateLevel` 实现。
- 若效果图支持修改已有合伙人比例，需补 `game/business/partner/updateLevel` 或复用 `game/updateLevel`。

### 6.5 奖励明细

资源：

```text
经营分析/奖励明细/效果图.jpg
```

前端显示：

- 日期筛选。
- 奖励来源。
- 奖励数量。
- 操作人/来源 ID。
- 备注。
- 分页。

可复用接口：

- `game/rewardDetail`
- `game/rewardSummary`

### 6.6 奖励提取

资源：

```text
经营分析/奖励提取/效果图.jpg
```

前端显示：

- 当前可提取奖励。
- 输入提取数量。
- 确认提取。
- 提取后刷新分数和奖励。

可复用接口：

- `game/drawReward`
- `game/clubInfo`

注意：

- 后端 `club_user.reward` 存储放大 10 倍，模型 getter 返回除以 10 后的值。
- 前端显示和输入需要统一单位。

### 6.7 操作记录

资源：

```text
经营分析/操作记录/效果图.jpg
```

前端显示：

- 时间。
- 操作人。
- 被操作人。
- 操作类型。
- 变化值。
- 备注。

可复用接口：

- 部分可复用 `game/scoreLog / game/rewardLog / game/bankLog`。

可能补缺：

- 如果效果图要求“统一操作流水”，建议新增 `game/business/operate/logs`，后端合并：
  - 上下分日志 `log_score`
  - 奖励日志 `log_reward`
  - 保险箱日志
  - 状态修改日志
  - 合伙人调整日志

## 7. 后端实现步骤

### 第一步：接口盘点和返回字段确认

逐个调用现有接口，确认字段是否满足效果图。

先测：

```text
game/clubInfo
game/subUsers
club/gameResults
game/scoreSummary
game/rewardSummary
game/rewardDetail
game/drawReward
game/performLog
game/logs
```

输出一份字段对照表。

### 第二步：新增业务聚合接口

如果现有接口字段分散，建议补：

```text
POST game/business/overview
POST game/business/members
POST game/business/partners
POST game/business/operate/logs
```

接口返回统一格式：

```js
{
  summary: {},
  rows: [],
  count: 0,
  page: 1,
  pageSize: 20
}
```

### 第三步：权限封装

新增后端 helper：

```text
assertBusinessAccess(userID, clubID, action, targetUserID?)
```

统一判断：

- owner。
- manager。
- proxy 是否在 `target.cluster` 内。
- user 是否只能看自己。

### 第四步：性能优化

聚合数据主要来自：

```text
club_user
log_score
log_reward
club_profit_summary
log_game
```

后续大数据量时要关注索引：

- `log_score(clubID, strDate, userID, reason)`
- `log_score(clubID, strDate, parent)`
- `log_reward(clubID, strDate, userID)`
- `club_user(clubID, parent)`
- `club_user(clubID, role)`

## 8. 前端实现步骤

### 第一步：创建静态 Prefab

先按效果图创建：

```text
BusinessAnalysisView.prefab
BusinessStatsTab.prefab
BusinessMemberTab.prefab
BusinessPartnerTab.prefab
BusinessRewardDetailTab.prefab
BusinessRewardWithdrawTab.prefab
BusinessOperateLogTab.prefab
```

先只用静态假数据把界面摆出来。

### 第二步：接入口

大厅底部或新版大厅按钮 `经营分析` 点击：

```js
GameUtils.pop(GameConfig.pop.BusinessAnalysisView)
```

需要在 `GameConfig.pop` 增加：

```js
BusinessAnalysisView: "Main/Prefab/BusinessAnalysisView"
```

### 第三步：封装 API

新增：

```text
BusinessAnalysisApi.js
```

统一封装：

```js
loadOverview(params)
loadMembers(params)
loadPartners(params)
loadRewardDetail(params)
drawReward(params)
loadOperateLogs(params)
```

### 第四步：逐个 Tab 接数据

顺序建议：

1. `统计`
2. `成员管理`
3. `合伙人`
4. `奖励明细`
5. `奖励提取`
6. `操作记录`
7. `代理统计`

### 第五步：细节还原

逐个效果图对齐：

- 背景。
- 标题。
- Tab 选中态。
- 列表行高度。
- 字体颜色。
- 数字颜色。
- 分页按钮。
- 弹窗层级。
- 点击音效。
- 空数据状态。
- 加载状态。

## 9. 第一版开发优先级

第一版只做最小可用：

1. 经营分析入口。
2. 主弹窗框架。
3. 左侧 Tab。
4. 统计页静态布局。
5. 成员管理静态布局。
6. 接 `game/subUsers` 显示真实成员。
7. 接 `game/updateScore` 完成上下分。
8. 接 `game/rewardDetail / drawReward` 完成奖励明细和提取。

第二版再补：

- 合伙人层级。
- 调整比例。
- 调整警戒值。
- 操作记录合并接口。
- 代理统计聚合。

第三版再做：

- 完全一比一还原所有效果图。
- 大数据分页性能优化。
- 权限边界测试。
- 操作日志审计。

## 10. 测试清单

### 10.1 权限测试

- 会长能打开全部模块。
- 合伙人只能看自己和下级。
- 普通用户看不到经营分析入口。
- 非本联盟用户不能访问接口。
- 前端隐藏入口后，直接请求接口也不能绕过权限。

### 10.2 数据测试

- 上下分后成员分数刷新。
- 奖励提取后奖励减少、分数增加。
- 今日/昨日切换数据正确。
- 搜索用户 ID 正确。
- 分页正确。
- 空数据不报错。

### 10.3 UI 测试

- iPhone X、iPad、浏览器 16:9 不遮挡。
- 列表长名字省略。
- 金额正负颜色正确。
- 弹窗层级正确。
- 关闭后不残留事件监听。

## 11. 当前暂停点

当前已完成：

- `BusinessAnalysisView.prefab` 第一版统计页手动布局。
- `BusinessAnalysisView.js` 静态脚本。
- `GameConfig.pop.BusinessAnalysisView` 弹窗路径。
- 旧的 Prefab 生成脚本已删除，避免误覆盖手动布局。

下一步建议：

1. 在大厅加临时入口，调用 `GameUtils.pop(GameConfig.pop.BusinessAnalysisView)`。
2. 验证关闭、统计页静态数据、左侧 Tab 切换。
3. 新建后端 `ldqp_xh/logic/businessAnalysis.js`，先提供 `overview` 静态/聚合接口。
4. 前端把统计页 mock 数据替换成 `businessAnalysis/overview` 返回数据。
5. 再接成员管理第一张真实列表。
