# 经营分析视频流程规格

参考视频：

```text
ldqp_xh/docs/BusinessAnalysis.mp4
```

抽帧工具：

```bash
/usr/bin/python3 ldqp_xh/tools/video_frames.py ldqp_xh/docs/BusinessAnalysis.mp4 --info --every 3 --sheet --out ldqp_xh/docs/business_analysis_frames_tool --width 960
```

关键帧目录：

```text
ldqp_xh/docs/business_analysis_frames_tool/
ldqp_xh/docs/business_analysis_keyframes/
```

说明：视频里的 UI 皮肤是旧版，当前项目使用新版美术资源。本文只抽取布局关系、按钮交互、弹窗流程、数据字段和前后端逻辑，不照搬旧皮肤。

## 1. 总体结构

经营分析是一个覆盖在大厅上的弹窗式管理界面。

固定区域：

- 顶部：联盟名称、当前奖励/金币。
- 左侧：Tab 菜单。
- 中间：当前 Tab 内容区。
- 底部右侧：分页控件，列表类页面都有。
- 搜索类页面底部：输入框 + 查询按钮。

左侧 Tab 顺序：

1. 统计
2. 合伙人
3. 成员管理
4. 代理统计
5. 奖励明细
6. 操作记录
7. 奖励提取

Tab 点击规则：

- 点击后切换内容区。
- 当前 Tab 使用选中态背景。
- 非当前 Tab 使用普通态背景。
- 切换 Tab 后列表默认回到第一页。
- 列表类 Tab 保留搜索框，但搜索条件按页面独立保存更好。

## 2. 统计 Tab

视频时间：约 0s、12s、90s。

展示字段：

- 分数统计
  - 今日总奖励
  - 昨日总奖励
- 总数据
  - 团队总积分
  - 团队总人数
  - 房费比例
  - 抽水比例
  - 游戏局数
- 底部统计卡
  - 直属队长
  - 直属成员
  - 间接成员

按钮：

- 邀请玩家
- 设置合伙人

交互：

- 点击“邀请玩家”弹出数字输入弹窗。
- 点击“设置合伙人”弹出数字输入弹窗。

后端接口建议：

```text
businessAnalysis/overview
```

返回：

```js
{
  todayReward,
  yesterdayReward,
  teamScore,
  teamCount,
  roomRate,
  waterRate,
  gameRounds,
  directCaptainCount,
  directMemberCount,
  indirectMemberCount,
  canInvite,
  canSetPartner
}
```

## 3. 数字输入弹窗

视频时间：约 3s、6s、9s、48s。

用途：

- 添加成员/邀请玩家。
- 添加合伙人/设置合伙人。
- 搜索成员。

结构：

- 标题：添加成员 / 添加合伙人 / 搜索成员。
- 输入行：`输入ID号：` + 输入框。
- 数字键盘：
  - 1 2 3
  - 4 5 6
  - 7 8 9
  - 重输 0 添加/删除/查询

行为：

- 点击数字追加到输入框。
- 重输清空输入框。
- 删除删除最后一位。
- 添加/查询/邀请提交接口。
- 成功时弹出中间 toast，例如“544266已经在俱乐部”。
- 失败也用 toast 展示。

当前新版实现建议：

- `BusinessAnalysisPopupInvite.prefab` 复用此结构。
- `BusinessAnalysisPopupSearch.prefab`、`BusinessAnalysisPopupSearchMember.prefab` 也复用此结构。
- 后续可以抽一个数字键盘子 prefab，但当前先不拆。

## 4. 合伙人 Tab

视频时间：约 15s、24s、33s、42s、45s。

列表字段：

- 队长信息：头像、昵称、ID、队长/直属标识。
- 人数、比例：成员数、房费比例、抽水比例。
- 今日局数、昨日局数。
- 今日收益、昨日收益。
- 今日贡献、昨日贡献。
- 积分、警戒值。

每行按钮：

- 调整比例
- 警戒值
- 查看下级
- 上分
- 下分

显隐规则：

- 当前登录者自己的队长行不显示“调整比例/警戒值”。
- 下级队长行显示“调整比例/警戒值”。
- 上分/下分根据权限显示。

搜索：

- 底部输入 ID。
- 点击查询筛选。

分页：

- 右下角上一页、页码、下一页。

后端接口建议：

```text
businessAnalysis/partners
```

请求：

```js
{ clubID, keyword, page, pageSize }
```

返回：

```js
{
  rows: [
    {
      userID,
      nickname,
      avatar,
      roleType, // owner/direct/captain/member
      memberCount,
      roomRate,
      waterRate,
      todayRounds,
      yesterdayRounds,
      todayIncome,
      yesterdayIncome,
      todayContribution,
      yesterdayContribution,
      score,
      warningScore,
      canAdjustRate,
      canSetWarning,
      canViewChildren,
      canAddScore,
      canReduceScore
    }
  ],
  page,
  pageSize,
  total
}
```

## 5. 查看下级弹窗

视频时间：约 18s、21s、39s。

结构：

- 标题：查看下级。
- 左侧：
  - 当前查看的上级信息。
  - 下级队长按钮。
  - 下级成员按钮。
- 右侧：
  - header 表头。
  - 列表滚动区。
  - 底部搜索输入框 + 查询。
  - 右下角分页。

两个子页：

### 5.1 下级队长

表头：

- 队长信息
- 人数、比例
- 今日局数、昨日局数
- 今日收益、昨日收益
- 积分

行数据：

- 头像、昵称、ID。
- 房费比例、抽水比例。
- 今日/昨日局数。
- 今日/昨日收益。
- 积分。
- 可继续“查看下级”。

### 5.2 下级成员

表头：

- 玩家信息
- 局数
- 积分
- 大赢家次数
- 总赢分
- 贡献分

行数据：

- 头像、昵称、ID。
- 局数。
- 积分。
- 大赢家次数。
- 总赢分。
- 贡献分。

交互：

- 点击左侧两个按钮切换 `CaptainView / MemberView`。
- 当前按钮选中态，另一个普通态。
- 列表必须是 ScrollView。
- 查询只刷新当前子页。

后端接口建议：

```text
businessAnalysis/partner/children
```

请求：

```js
{ clubID, parentID, type: "captain" | "member", keyword, page, pageSize }
```

## 6. 上下分弹窗

视频时间：约 27s、30s、36s。

结构：

- 标题：加减积分。
- 左侧 mode：
  - 增加
  - 减少
- 右侧：
  - 当前输入积分，格式 `+0` 或 `-0`。
  - 数字键盘。
  - 小数点。
  - 重输。
  - 底部显示“我的积分：xx”。
  - 确定按钮。

行为：

- 点击“增加/减少”切换符号和按钮选中态。
- 输入数字更新输入框。
- 点小数点允许一位或两位小数，具体按后端分数精度确认。
- 重输清空为 `+0` 或 `-0`。
- 确认调用上下分接口。
- 成功后关闭弹窗并刷新当前列表。

后端接口建议：

```text
businessAnalysis/score/update
```

也可以第一阶段内部复用旧：

```text
game/updateScore
```

## 7. 成员管理 Tab

视频时间：约 51s、57s、60s。

列表字段：

- 成员：头像、昵称、ID。
- 状态：在线/离线。
- 今日局数、昨日局数。
- 今日贡献、昨日贡献。
- 积分。

每行按钮：

- 战绩明细。
- 设置合伙人。
- 上分。
- 下分。
- 禁止/允许进入游戏。

交互：

- 点击“禁止进入游戏/允许进入游戏”直接切换状态并 toast。
- 点击“战绩明细”进入战绩明细弹窗。
- 搜索成员使用数字输入弹窗或底部搜索框。
- 列表分页。

后端接口建议：

```text
businessAnalysis/members
businessAnalysis/member/forbid
businessAnalysis/member/setPartner
```

## 8. 战绩明细弹窗

视频时间：约 54s、63s、72s。

结构：

- 标题：战绩明细。
- 顶部日期 tab：最近多天。
- 玩家概要：
  - 头像、昵称、ID。
  - 今日局数。
  - 输赢。
- 房间记录：
  - 房间 ID。
  - 时间。
  - 游戏名。
  - 回放码。
- 每局玩家牌局结果横向展示：
  - 头像。
  - 昵称。
  - ID 脱敏。
  - 输赢分。
- 右侧按钮：
  - 复制回放码。
  - 查看回放。
- 右下角分页。

行为：

- 点击日期切换当天战绩列表。
- 点击复制回放码 toast。
- 点击查看回放打开战绩回放弹窗或进入回放场景。

后端接口建议：

```text
businessAnalysis/member/records
businessAnalysis/member/record/detail
```

## 9. 战绩回放弹窗/回放场景

视频时间：约 66s、69s。

流程：

1. 从战绩明细点击“查看回放”。
2. 进入牌局回放场景。
3. 回放场景显示牌桌、玩家手牌、操作按钮。
4. 另一个战绩回放列表展示每局输赢结果：
   - 房间号。
   - 局数。
   - 每局结果：赢/输、1/7、玩家得分列表。
   - 每行“回放”按钮。

当前新版建议：

- 第一阶段只做弹窗列表和按钮。
- 第二阶段复用现有回放入口跳转真实牌局回放。

## 10. 代理统计 Tab

视频时间：约 75s。

字段：

- 玩家信息。
- 人数。
- 收益。
- 成员积分。
- 总输赢。
- 贡献分。

行为：

- 列表 + 搜索 + 分页。

后端接口建议：

```text
businessAnalysis/agent/stats
```

## 11. 奖励明细 Tab

视频时间：约 78s、81s。

结构：

- 日期范围筛选。
- 查询按钮。
- 列表表头：
  - 门票奖励
  - 玩家名称
  - 游戏人数
  - 房间号
  - 日期
- 空数据时显示“暂时没有数据哦”。
- 底部汇总：
  - 我的门票
  - 下级门票奖励
  - 我的收益
- 分页。

后端接口建议：

```text
businessAnalysis/reward/detail
```

## 12. 操作记录 Tab

视频时间：约 84s。

结构：

- 日期范围筛选。
- 查询按钮。
- 左侧或表格中展示日期列表。
- 表头：
  - 操作日期
  - 盟友昵称
  - 已提取奖励
- 底部红色提示文案。
- 分页。

后端接口建议：

```text
businessAnalysis/operate/logs
```

## 13. 奖励提取 Tab

视频时间：约 87s。

结构：

- 日期范围筛选。
- 当前奖励。
- 取出按钮。
- 列表：
  - 时间
  - 提取奖励
  - 已提取奖励
- 空/失败时 toast：例如“体力不足！”。

后端接口建议：

```text
businessAnalysis/reward/withdraw/list
businessAnalysis/reward/withdraw
```

## 14. 前端接入顺序

建议按风险从低到高：

1. 统计 Tab 接 `overview`。
2. 邀请玩家数字键盘逻辑。
3. 合伙人列表接 `partners`。
4. 查看下级弹窗接 `partner/children`。
5. 上下分弹窗逻辑和接口。
6. 成员管理列表接 `members`。
7. 成员管理按钮：禁止/允许、设置合伙人、战绩明细。
8. 代理统计。
9. 奖励明细。
10. 操作记录。
11. 奖励提取。

## 15. 后端接入顺序

第一阶段只新增新模块，不修改旧联盟主逻辑：

```text
ldqp_xh/logic/businessAnalysis.js
```

接口从 mock/轻量查询开始：

1. `overview`
2. `partners`
3. `partner/children`
4. `members`
5. `score/update`
6. `member/forbid`
7. `agent/stats`
8. `reward/detail`
9. `operate/logs`
10. `reward/withdraw/list`
11. `reward/withdraw`

## 16. 注意事项

- 前端隐藏按钮不等于权限，后端必须校验。
- 合伙人只能看自己和下级。
- 普通用户看不到入口，也不能直接请求接口绕过。
- 列表返回字段应尽量贴合页面，不让前端做复杂聚合。
- 所有列表接口统一 `{ rows, page, pageSize, total }`。
- 所有金额/积分字段统一约定精度，避免前端显示和后端计算不一致。
