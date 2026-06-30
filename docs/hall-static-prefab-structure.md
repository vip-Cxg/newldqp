# 新大厅 Prefab 结构与坐标调整文档

目标：我们已经先按 `assets/resources/hall/大厅效果.jpg` 用代码实现了大厅布局。当前决定是：静态节点结构放在 `HallStaticTestView.prefab`，但具体坐标、尺寸、层级继续由 `HallStaticTestView.js` 控制。

当前结论：

- 新大厅界面的静态搭建已经基本完成。
- 现在完成的是“代码布局版”，后续微调直接改脚本坐标。
- prefab 主要负责节点结构和美术挂载，不负责最终摆放。
- 后面主要是继续接真实数据、真实房间、真实玩法筛选、性能优化和细节动效。

## 一、当前资源与脚本

- 页面 prefab：`assets/resources/Main/Prefab/HallStaticTestView.prefab`
- 桌子 prefab：`assets/resources/Main/Prefab/HallStaticTableItem.prefab`
- 页面脚本：`assets/script/ui/hall/HallStaticTestView.js`
- 桌子脚本：`assets/script/ui/hall/HallStaticTableItem.js`
- 参考图：`assets/resources/hall/大厅效果.jpg`

当前没有布局开关。脚本每次进入大厅都会重新设置主要节点位置，所以你要调位置时直接改 `HallStaticTestView.js` 里的数字，运行后马上生效。

常用修改位置：

```text
顶部栏、右上角按钮         bindTopPrefab(size)
左上角头像、ID、金币       bindUserInfoPrefab()
喇叭公告条                 bindNoticePrefab(size)
左侧游戏菜单               bindMenuPrefab(size)
桌子滚动区域               bindTableScrollPrefab(size)
底部黑条和功能按钮         bindBottomPrefab(size)
桌子大小、间距、边距       文件顶部 DESIGN
玩法切换按钮               renderRoomTabs()
桌子生成位置               updateVisibleTables()
桌子内部头像位置           HallStaticTableItem.js 的 getGameLayout()
```

## 二、根节点结构

节点名尽量不要改，脚本按这些名字找节点。

```text
HallStaticTestView
  大厅效果                         参考图，运行时隐藏

  BgLayer
    BgImage                        大厅背景图
    TopTint                        顶部暗色遮罩

  TopBar
    InfoBg                         左上角用户信息后方黑底
    BtnBack                        返回按钮
    UserInfo
      AvatarRoot
        AvatarMask
          AvatarSprite
        AvatarFrame
      LabelID
      CoinBg
        CoinIcon
        LabelCoin
    ClubTitle
      julebudi
      Label
    BtnRefresh
    BtnMessage
    BtnSetting

  NoticeBar
    IconSpeaker
    NoticeText

  GameMenu
    GameBtn_ALL
    GameBtn_DNIU
    GameBtn_JH
    GameBtn_HSMJ
    GameBtn_ZMZ
    GameBtn_PDK                    当前隐藏备用

  TableScroll
    view                           必须有 Mask
      content                      运行时放桌子

  PlayTypeTabs                     运行时生成玩法按钮

  BottomBar
    bgBottom                       底部黑底
    BtnScore
    BtnManage
    BtnBank
    BtnQuickJoin
```

## 三、适配原则

不要所有节点都加 Widget。推荐只给“贴边容器”加 Widget，容器内部子节点继续用相对坐标。

推荐加 Widget：

- `BgLayer/BgImage`：四边贴齐，适配全屏背景。
- `TopBar`：Top 对齐，Left/Right 拉满，高度固定约 `108`。
- `TopBar/BtnBack`：Left + Top。
- `TopBar/UserInfo`：Left + Top。
- `TopBar/InfoBg`：Left + Top。
- `TopBar/BtnRefresh`：Right + Top。
- `TopBar/BtnMessage`：Right + Top。
- `TopBar/BtnSetting`：Right + Top。
- `GameMenu`：Left + Top/Bottom，或 Left + 固定 Y。
- `TableScroll`：Left/Right/Top/Bottom，避开左侧菜单和底部栏。
- `BottomBar`：Bottom + Left/Right，高度固定。
- `BottomBar/bgBottom`：四边贴齐 `BottomBar`。
- `BottomBar/BtnQuickJoin`：Right + CenterY 或 Right + Bottom。

不建议加 Widget：

- `UserInfo` 下面的 `AvatarRoot`、`LabelID`、`CoinBg`、`CoinIcon`、`LabelCoin`。
- 桌子 prefab 内部的头像座位。
- 运行时动态生成的桌子节点。
- `PlayTypeTabs` 里的玩法按钮。

原因：内部子节点加太多 Widget 会互相打架，iPhone X 这类超宽比例更容易出现局部错位。

## 四、当前代码坐标参考

以下坐标按 `1334 x 750` 设计稿换算，主要用于对照脚本里的数字。现在不要求你在 prefab 里逐个填写，因为运行时脚本会覆盖主要节点坐标。

换算规则：

```text
屏幕宽 1334，半宽 667
屏幕高 750，半高 375

leftX(n)  = -667 + n
rightX(n) =  667 - n
屏幕高/2  = 375
```

### 1. BgLayer

```text
BgLayer                x=0, y=0,   w=1334, h=750
BgImage                x=0, y=0,   w=1334, h=750
TopTint                x=0, y=323, w=1334, h=104
```

Widget 建议：

```text
BgLayer/BgImage        Left=0, Right=0, Top=0, Bottom=0
TopTint                Left=0, Right=0, Top=0
```

底部黑底统一用 `BottomBar/bgBottom`，不再需要 `BottomTint`。

### 2. TopBar

```text
TopBar                 x=0,    y=321, w=1334, h=108

InfoBg                 x=-428, y=10,  w=250, h=74
BtnBack                x=-614, y=10,  w=77,  h=77

ClubTitle              x=16,   y=5,   w=382, h=70
ClubTitle/julebudi     x=0,    y=0,   w=382, h=70
ClubTitle/Label        x=0,    y=2,   w=310, h=48

BtnRefresh             x=299,  y=4,   w=92,  h=92
BtnMessage             x=457,  y=4,   w=92,  h=92
BtnSetting             x=605,  y=4,   w=92,  h=92
```

Widget 建议：

```text
TopBar                 Left=0, Right=0, Top=0
InfoBg                 Left=114, Top=17
BtnBack                Left=14,  Top=17
BtnRefresh             Right=322, Top=8
BtnMessage             Right=164, Top=8
BtnSetting             Right=16,  Top=8
```

### 3. UserInfo

```text
UserInfo               x=-425,   y=10,  w=360, h=90

AvatarRoot             x=-93.718, y=0,  w=76,  h=76
AvatarMask             x=0,      y=0,  w=66,  h=66
AvatarSprite           x=0,      y=0,  w=58,  h=58
AvatarFrame            x=0,      y=0,  w=66,  h=66

LabelID                x=34, y=13,  w=220, h=36
CoinBg                 x=26, y=-18, w=168, h=34
CoinIcon               x=-54, y=0,  w=28,  h=28
LabelCoin              x=14,  y=0,  w=96,  h=28
```

Widget 建议：

```text
UserInfo               Left=62, Top=9
UserInfo 子节点         不加 Widget
```

金币数字设置：

- 左对齐。
- 超长显示省略号。
- 当前脚本用 `ellipsisText("52.7822222222", 8)` 做测试。

### 4. NoticeBar

```text
NoticeBar              x=8,    y=259, w=1318, h=40
IconSpeaker            x=-487, y=0,   w=74,   h=34
NoticeText             x=-422, y=0,   w=250,  h=34
```

Widget 建议：

```text
NoticeBar              Left=8, Right=8, Top=96
```

这个后续可以继续微调，目前不是主问题。

### 5. GameMenu

```text
GameMenu               x=-605, y=5,    w=128, h=553

GameBtn_ALL            x=0, y=199,  w=92, h=93
GameBtn_DNIU           x=0, y=103,  w=92, h=93
GameBtn_JH             x=0, y=7,    w=92, h=93
GameBtn_HSMJ           x=0, y=-89,  w=92, h=93
GameBtn_ZMZ            x=0, y=-185, w=92, h=93
GameBtn_PDK            hidden
```

Widget 建议：

```text
GameMenu               Left=0 或 Left=2，Top=99，Bottom=98
GameBtn_*              不加 Widget，作为 GameMenu 子节点按上面 y 填
```

注意：当前数组顺序是 `ALL、DNIU、JH、HSMJ、ZMZ、PDK`，如果 prefab 里顺序不同不影响脚本，但视觉上建议按这个顺序摆。

### 6. TableScroll

```text
TableScroll            x=67, y=-12, w=1184, h=491

tableLeft              142
tableRight             8
top                    175
bottom                 84

view                   x=0,    y=0,     w=1184, h=491
content                x=-592, y=245.5, w=动态内容宽, h=491
```

Widget 建议：

```text
TableScroll            Left=142, Right=8, Top=175, Bottom=84
view                   不加 Widget，由脚本或 prefab 填满 TableScroll
content                不加 Widget，脚本运行时控制
```

桌子布局参数：

```text
tableW                 360
tableH                 182
gapX                   44
gapY                   42
tableStrideX           404
tableStrideY           224
首个桌子 x              38 + tableW/2 = 218
首个桌子 y              -18 - tableH/2 = -109
```

`TableScroll/view` 必须有 `cc.Mask`，否则桌子会盖到菜单栏。

### 7. PlayTypeTabs

```text
PlayTypeTabs           x=leftX(menu + 360), y=-屏幕高/2 + bottom + 32, w=560, h=52
```

运行时生成：

```text
RoomTabAll             x=-184, y=0, w=157, h=52
RoomTab_0              x=-18,  y=0, w=157, h=52
RoomTab_1              x=152,  y=0, w=157, h=52
```

全部游戏时不显示玩法按钮。

### 8. BottomBar

```text
BottomBar              x=0, y=-333, w=屏幕宽, h=84
bgBottom               x=0, y=0,    w=BottomBar.w, h=BottomBar.h

BtnScore               x=-552, y=0, w=183, h=59
BtnManage              x=-308, y=0, w=192, h=56
BtnBank                x=-70,  y=0, w=171, h=50
BtnQuickJoin           x=536,  y=2, w=198, h=76
```

层级建议：

```text
BottomBar              zIndex=80
bgBottom               zIndex=0
BtnScore               zIndex=10
BtnManage              zIndex=10
BtnBank                zIndex=10
BtnQuickJoin           zIndex=10
```

## 五、桌子 prefab 结构

当前一个 `HallStaticTableItem.prefab` 继续满足五种游戏，暂时不用拆五个。

```text
HallStaticTableItem
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
  AvatarSeat8
```

不同游戏的座位坐标目前由 `HallStaticTableItem.js` 的 `getGameLayout()` 控制。等大厅主界面稳定后，再决定是否拆成五个桌子 prefab。

## 六、调整大厅的步骤

1. 打开 `HallStaticTestView.prefab`。
2. 只维护节点结构和拖美术资源，尤其是 `BottomBar/bgBottom`、`TableScroll/view/content`。
3. 位置和尺寸去 `HallStaticTestView.js` 对应方法里改。
4. `TableScroll/view` 保持 `cc.Mask`。
5. 保存 prefab 和脚本。
6. 浏览器分别测试：
   - Default
   - iPhone 6/7/8 Plus
   - iPhone X
   - iPad

进入大厅会先隐藏根节点，等脚本设置完布局和图片后再显示，避免看到 prefab 默认位置闪一下。

## 七、哪些还不是最终上线内容

大厅 UI 搭建基本完成，但上线前还需要：

- 接真实联盟信息、用户头像、金币。
- 接真实桌子列表和人数。
- 点击桌子进入真实房间。
- 快速加入真实逻辑。
- 玩法筛选真实逻辑。
- 大量头像加载优化和缓存。
- 不同机型截图验收。

所以现在可以认为：大厅界面“静态搭建阶段”完成，下一步是 prefab 回填和数据接入。
