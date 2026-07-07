# 新大厅 Prefab 拆分与美术替换流程

目标：第二个联盟进入新大厅，布局逐步还原参考截图。旧大厅继续保留，不影响原来的炸弹、跑得快、红中麻将等入口。

当前已经有：

- `assets/resources/Main/Prefab/HallStaticTestView.prefab`：新大厅测试入口。
- `assets/script/ui/hall/HallStaticTestView.js`：新大厅布局、菜单、横向滚动、测试桌数据。
- `assets/resources/Main/Prefab/HallStaticTableItem.prefab`：当前测试桌子 prefab。
- `assets/script/ui/hall/HallStaticTableItem.js`：桌子渲染逻辑。
- `assets/resources/Main/Prefab/HallStaticAvatarSeat.prefab`：独立头像座位 prefab。

## 当前 HallStaticTestView 替换清单

现在 `HallStaticTestView.prefab` 已经生成了可视化层级，不再只是空节点。后面替换美术时优先改这些节点的 `SpriteFrame`。

```text
HallStaticTestView
  BgLayer
    BgImage          大厅主背景
    TopTint          顶部暗色遮罩，可换成顶部装饰图
    BottomTint       底部暗色遮罩，可换成底部栏背景

  TopBar
    BtnBack          返回按钮
      Label
    UserPanel        左上角用户信息背景
      UserAvatar     用户头像底图
      LabelID
      LabelCoin
    BtnRefresh       刷新按钮
      Label
    ClubTitle        中间联盟标题
      Label
      Line
    BtnSearch        查找牌桌按钮
      Label
    BtnMessage       消息按钮
      Label

  NoticeBar          喇叭横条背景
    IconSpeaker
    NoticeText

  GameMenu
    GameBtn_ALL
      Label
    GameBtn_DNIU
      Label
    GameBtn_JH
      Label
    GameBtn_ZMZ
      Label
    GameBtn_HSMJ
      Label
    GameBtn_PDK
      Label

  TableScroll
    view
      content        桌子 prefab 会运行时放到这里

  PlayTypeTabs       玩法按钮会运行时放到这里

  BottomBar          底部栏背景
    BtnScore
      Label
    BtnManage
      Label
    BtnBank
      Label
    BtnQuickJoin
      Label
```

替换规则：

- 可以改节点位置、大小、颜色、SpriteFrame。
- 不要改节点名。
- `TableScroll/view/content` 不要手动放桌子，脚本会放。
- `PlayTypeTabs` 不要手动放玩法按钮，脚本会按游戏生成。
- `GameBtn_*` 可以换按钮图片，但保留 `Label` 子节点。
- `BottomBar/BtnQuickJoin` 可以换成大黄按钮图片。
- 当前这些节点的 SpriteFrame 大多是空的，你拖图进去即可。

## 一、最终 prefab 拆分

推荐最终拆成这些 prefab：

```text
HallStaticTestView.prefab
  BgLayer
  TopBar
  NoticeBar
  GameMenu
  TableScroll
  PlayTypeTabs
  BottomBar

HallStaticTableItem_DN.prefab
HallStaticTableItem_JH.prefab
HallStaticTableItem_ZMZ.prefab
HallStaticTableItem_HSMJ.prefab
HallStaticTableItem_PDK.prefab

HallStaticAvatarSeat.prefab
```

### 1. `HallStaticTestView`

负责整个大厅页面：

- 背景图
- 左上角用户信息
- 顶部联盟名
- 右上角查找牌桌/消息/设置
- 左侧游戏菜单
- 中间桌子横向滚动区
- 底部按钮
- 玩法 tabs

这个 prefab 后面主要换页面级美术，不放具体桌子细节。

### 2. 桌子 prefab：先一个，必要时再拆五个

当前如果一个 `HallStaticTableItem.prefab` 已经能满足需求，就先不要拆五个。

现在更推荐：

```text
HallStaticTableItem.prefab
  TableArt
  RuleLabel
  RoundLabel
  AvatarSeat1...
```

脚本根据游戏类型切换：

- `TableArt` 的 SpriteFrame。
- `RuleLabel` 位置。
- `AvatarSeat` 位置。
- 显示几个座位。

只有当后面发现每个游戏桌子结构差异很大，比如：

- 节点数量完全不同。
- 状态图标完全不同。
- 文字层级完全不同。
- 特效/按钮位置完全不同。

再拆成这些 prefab：

```text
HallStaticTableItem_DN.prefab     牛牛，8人
HallStaticTableItem_JH.prefab     金花，6人
HallStaticTableItem_ZMZ.prefab    捉麻子，2人
HallStaticTableItem_HSMJ.prefab   划水麻将，2人
HallStaticTableItem_PDK.prefab    跑得快，2人
```

无论一个 prefab 还是五个 prefab，内部统一节点名：

```text
HallStaticTableItem_XX
  TableArt
  RuleLabel
  RoundLabel
  AvatarSeat1
    avatarMask
      avatarSprite
    nameBg
    nameLabel
  AvatarSeat2
  ...
```

脚本只认这些名字，所以换美术时不要改节点名。

### 3. `HallStaticAvatarSeat`

头像座位通用 prefab：

```text
HallStaticAvatarSeat
  avatarMask
    avatarSprite
  nameBg
  nameLabel
```

用途：

- 以后每张桌子复制它作为 `AvatarSeat1`、`AvatarSeat2`。
- `avatarMask` 控制圆形头像遮罩。
- `avatarSprite` 挂项目已有 `Avatar` 组件，用真实头像。
- `nameBg` 用纯黑半透明色块，保证名字清楚。
- `nameLabel` 显示昵称，超长省略。

## 二、下一步开发顺序

### 第一步：先固定桌子 prefab

当前已经有一个 `HallStaticTableItem.prefab`，并且现在一个 prefab 暂时够用。

建议操作：

1. 先保留一个 `HallStaticTableItem.prefab`。
2. `TableArt` 由脚本按游戏切换图片。
3. `AvatarSeat` 位置由脚本按游戏切换。
4. 先不要拆五个，等美术差异真的变大再拆。

如果后面需要拆五个，再复制当前 `HallStaticTableItem.prefab`，分别命名为：

```text
HallStaticTableItem_DN.prefab
HallStaticTableItem_JH.prefab
HallStaticTableItem_ZMZ.prefab
HallStaticTableItem_HSMJ.prefab
HallStaticTableItem_PDK.prefab
```

每个 prefab 替换自己的 `TableArt` 图片，并只保留自己需要的人数：

```text
牛牛：AvatarSeat1 - AvatarSeat8
金花：AvatarSeat1 - AvatarSeat6
麻将/捉麻子/跑得快：AvatarSeat1 - AvatarSeat2
```

5. 按游戏单独调整头像座位位置。

当前参考位置：

```text
牛牛:
AvatarSeat1 -161,47
AvatarSeat2 -161,-28
AvatarSeat3 -88,-44
AvatarSeat4 75,-44
AvatarSeat5 161,-28
AvatarSeat6 161,47
AvatarSeat7 75,72
AvatarSeat8 -88,72
RuleLabel 0,28

金花:
AvatarSeat1 -161,69
AvatarSeat2 -161,-23
AvatarSeat3 -85,-32
AvatarSeat4 83,-32
AvatarSeat5 161,-23
AvatarSeat6 161,69
RuleLabel 0,54

划水麻将:
AvatarSeat1 -143,63
AvatarSeat2 93,-30
RuleLabel -12,40

捉麻子/跑得快:
AvatarSeat1 -143,63
AvatarSeat2 119,-19
RuleLabel -12,40
```

### 第二步：先把大厅页面从“代码画 UI”改成“prefab 节点换图”

现在 `HallStaticTestView.prefab` 看起来是空的，是因为大部分 UI 都在 `HallStaticTestView.js` 里运行时创建：

```js
drawBackground()
buildTop()
buildNotice()
buildMenu()
buildBottom()
```

这种方式适合快速验证逻辑，但不适合替换美术。因为编辑器里没有节点，自然没地方拖图片。

下一步应该把大厅拆成可视化节点：

```text
HallStaticTestView
  BgLayer
    BgImage
    TopDark
    BottomDark
  TopBar
  NoticeBar
  GameMenu
  TableScroll
  PlayTypeTabs
  BottomBar
```

然后脚本只负责：

- 找节点。
- 设置文字。
- 切换按钮选中状态。
- 创建/复用桌子 prefab。
- 不再用 `Graphics` 画主要 UI。

这样你就可以在 Cocos 里直接拖图替换美术。

### 第三步：如果以后需要，再改成按游戏加载不同桌子 prefab

如果一个桌子 prefab 不够用了，再把 `HallStaticTestView.js` 改成：

```text
DNIU -> HallStaticTableItem_DN
JH   -> HallStaticTableItem_JH
ZMZ  -> HallStaticTableItem_ZMZ
HSMJ -> HallStaticTableItem_HSMJ
PDK  -> HallStaticTableItem_PDK
```

### 第四步：还原整体大厅布局

参考截图的层级建议：

```text
HallStaticTestView
  BgLayer
    BgImage
    DarkTop
    DarkBottom

  TopBar
    BtnBack
    UserPanel
      UserAvatar
      LabelID
      LabelCoin
    BtnRefresh
    ClubTitle
    BtnSearch
    BtnMessage
    BtnSetting

  NoticeBar
    IconSpeaker
    LabelNotice

  GameMenu
    MenuItem_ALL
    MenuItem_DNIU
    MenuItem_JH
    MenuItem_ZMZ
    MenuItem_HSMJ
    MenuItem_PDK

  TableScroll
    view
      content
        TableItem...

  PlayTypeTabs
    Tab_All
    Tab_Rule1
    Tab_Rule2

  BottomBar
    BtnScore
    BtnPartner
    BtnBank
    BtnQuickJoin
```

布局要求：

- 左侧菜单从上到下：全部、牛牛、金花、捉麻子、划水麻将、跑得快。
- 选择“全部”时不显示玩法 tabs。
- 选择具体游戏时，玩法 tabs 贴在底部栏上方。
- 桌子区域横向滑动。
- 切换游戏时滚动回第一桌。
- 顶部喇叭条不要压桌子。
- 底部功能区不要压玩法 tabs。

### 第四步：接真实数据

桌子数据建议统一成：

```js
{
  game: { key: "DNIU", name: "牛牛", seats: 8 },
  rule: "暗一100锅",
  occupied: 4,
  totalRound: 20,
  players: [
    { name: "玩家A", head: "avatar/xxx.jpg" },
    { name: "玩家B", head: "file://2" }
  ]
}
```

头像显示规则：

1. 有真实头像 `head/avatarUrl/avatar` 时优先显示真实头像。
2. `file://0` 这种本地头像走头像图集。
3. 没有头像时使用 prefab 默认头像。

昵称显示规则：

- 固定宽度。
- 单行。
- 超长用 `...`。
- 名字下面用黑色色块 `nameBg`，不要用浅色图片。

## 三、美术怎么替换

### 1. 替换大厅背景

改 `HallStaticTestView.prefab`：

```text
BgLayer/BgImage
```

把参考截图里的蓝色森林背景放这里。

### 2. 替换左侧菜单

改：

```text
GameMenu/MenuItem_*
```

每个按钮建议拆：

```text
MenuItem
  BgNormal
  BgSelected
  Label
```

脚本只控制选中状态，不直接画按钮。

### 3. 替换桌子

改每个游戏自己的桌子 prefab：

```text
HallStaticTableItem_DN/TableArt
HallStaticTableItem_JH/TableArt
...
```

桌子图最好包含桌子和椅子，头像直接摆在图上对应椅子位置。

### 4. 替换头像框

改：

```text
HallStaticAvatarSeat/avatarMask
HallStaticAvatarSeat/avatarSprite
HallStaticAvatarSeat/nameBg
HallStaticAvatarSeat/nameLabel
```

建议：

- `avatarMask` 保留圆形遮罩。
- `avatarSprite` 保留 `Avatar` 组件。
- `nameBg` 用纯黑半透明 Sprite 或纯色色块。
- 不要改节点名。

### 5. 替换底部按钮

改：

```text
BottomBar/BtnScore
BottomBar/BtnPartner
BottomBar/BtnBank
BottomBar/BtnQuickJoin
```

每个按钮建议拆：

```text
Button
  Icon
  Label
  Bg
```

后面有真实图标时直接换 `Icon`。

## 四、谁来拖，谁来写代码

你负责：

- 把美术图片导入 Cocos。
- 在 prefab 里替换 SpriteFrame。
- 手动微调最终视觉位置。
- 保持节点名不变。

我负责：

- 生成 prefab 初始结构。
- 写脚本绑定这些节点。
- 做数据渲染、切换游戏、横向滚动、虚拟列表优化。
- 接真实后端数据。
- 保证旧大厅不受影响。

## 五、马上要做的下一步

建议下一步按这个顺序：

1. 复制出五个游戏桌子 prefab。
2. 我把 `HallStaticTestView.js` 改成按游戏加载不同桌子 prefab。
3. 你确认每个桌子的 `TableArt` 和头像位置。
4. 再拆 `TopBar/GameMenu/BottomBar` 的独立 prefab。
5. 最后整体对截图微调。

现在不要急着一次性把整个大厅全做完。先把“桌子 prefab + 横向滚动 + 菜单切换”稳定下来，后面替换美术会轻很多。
