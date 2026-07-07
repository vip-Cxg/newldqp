# 新大厅 Prefab 结构与坐标调整文档

目标：我们已经先按 `assets/resources/hall/大厅效果.jpg` 用代码实现了大厅布局。当前决定是：静态节点结构放在 `HallStaticTestView.prefab`，但具体坐标、尺寸、层级继续由 `HallStaticTestView.js` 控制。

当前结论：

- 新大厅界面的静态搭建已经基本完成。
- 现在完成的是“代码布局版”，后续微调直接改脚本坐标。
- prefab 主要负责节点结构和美术挂载，不负责最终坐标。
- 后面主要是继续接真实数据、真实房间、真实玩法筛选、性能优化和细节动效。

## 一、当前资源与脚本

- 页面 prefab：`assets/resources/Main/Prefab/HallStaticTestView.prefab`
- 桌子 prefab：`assets/resources/Main/Prefab/HallStaticTableItem.prefab`
- 页面脚本：`assets/script/ui/hall/HallStaticTestView.js`
- 桌子脚本：`assets/script/ui/hall/HallStaticTableItem.js`
- 参考图：`assets/resources/hall/大厅效果.jpg`

当前没有布局开关。脚本每次进入大厅都会重新设置主要节点位置，所以你要调位置时直接改 `HallStaticTestView.js` 里的数字，运行后马上生效。  
也就是说：不用在 prefab 里填这些坐标；prefab 里只要节点名和层级对，美术拖好就行。

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

## 四、坐标在哪里改

下面这些就是现在运行时真正生效的坐标位置。你改这些方法里的数字，保存后重新运行大厅就能看到变化。

### 1. 背景

位置：`HallStaticTestView.js -> buildPrefabLayout(size)`

```js
this.resizeNode(this.getNode("BgLayer"), 0, 0, size.width, size.height);
this.resizeNode(this.getNode("BgLayer/BgImage"), 0, 0, size.width, size.height);
this.resizeNode(this.getNode("BgLayer/TopTint"), 0, size.height / 2 - 52, size.width, 104);
```

要调顶部暗色遮罩高度：改 `TopTint` 这一行的 `104`。  
要调顶部暗色遮罩上下位置：改 `size.height / 2 - 52` 里的 `52`。

底部黑底统一用 `BottomBar/bgBottom`，不再需要 `BottomTint`。

### 2. 顶部栏和右上角按钮

位置：`HallStaticTestView.js -> bindTopPrefab(size)`

```js
this.resizeNode(top, 0, size.height / 2 - 54, size.width, 108);
this.resizeNode(this.getNode("TopBar/BtnBack"), this.leftX(53), 10, 77, 77);
this.resizeNode(this.getNode("TopBar/InfoBg"), this.leftX(239), 10, 250, 74);
this.resizeNode(this.getNode("TopBar/ClubTitle"), 16, 5, 382, 70);
this.resizeNode(this.getNode("TopBar/ClubTitle/julebudi"), 0, 0, 382, 70);
this.resizeNode(this.getNode("TopBar/BtnRefresh"), size.width / 2 - 368, 4, 76, 90);
this.resizeNode(this.getNode("TopBar/BtnMessage"), size.width / 2 - 210, 4, 76, 90);
this.resizeNode(this.getNode("TopBar/BtnSetting"), size.width / 2 - 62, 4, 76, 90);
```

说明：

- `this.leftX(53)` 表示距离屏幕左边 `53` 像素。
- `size.width / 2 - 62` 表示距离屏幕右边 `62` 像素。
- 每行参数顺序都是：`节点, x, y, 宽, 高`。

### 3. 左上角头像、ID、金币

位置：`HallStaticTestView.js -> bindUserInfoPrefab()`

```js
this.resizeNode(userInfo, this.leftX(242), 10, 360, 90);
this.resizeNode(this.getNode("TopBar/UserInfo/AvatarRoot"), -93.718, 0, 76, 76);
this.resizeNode(this.getNode("TopBar/UserInfo/AvatarRoot/AvatarMask"), 0, 0, 66, 66);
this.resizeNode(this.getNode("TopBar/UserInfo/AvatarRoot/AvatarMask/AvatarSprite"), 0, 0, 58, 58);
this.resizeNode(this.getNode("TopBar/UserInfo/AvatarRoot/AvatarFrame"), 0, 0, 66, 66);
this.resizeNode(this.getNode("TopBar/UserInfo/LabelID"), 34, 13, 220, 36);
this.resizeNode(this.getNode("TopBar/UserInfo/CoinBg"), 26, -18, 168, 34);
this.resizeNode(coinIconPath, -54, 0, 28, 28);
this.resizeNode(coinLabelPath, 28, 0, 104, 28);
```

要调金币图标：改 `coinIconPath` 那行。  
要调金币数字：改 `coinLabelPath` 那行。  
金币数字现在已给金币图标留了占位，不要再把 `LabelCoin` 的 `x` 调太小，否则会重叠。

### 4. 喇叭公告条

位置：`HallStaticTestView.js -> bindNoticePrefab(size)`

```js
this.resizeNode(notice, 8, size.height / 2 - 116, size.width - 16, 40);
this.resizeNode(this.getNode("NoticeBar/IconSpeaker"), -size.width / 2 + 180, 0, 74, 34);
this.resizeNode(this.getNode("NoticeBar/NoticeText"), -size.width / 2 + 245, 0, 250, 34);
```

### 5. 左侧游戏菜单

位置：`HallStaticTestView.js -> bindMenuPrefab(size)`

```js
this.resizeNode(menu, -size.width / 2 + 62, 5, DESIGN.menu, size.height - DESIGN.top - 22);
this.resizeNode(btn, 0, size.height / 2 - 176 - index * 96, DESIGN.menuBtnW, DESIGN.menuBtnH);
```

要调菜单整体左右：改 `-size.width / 2 + 62` 里的 `62`。  
要调第一个按钮上下：改 `size.height / 2 - 176` 里的 `176`。  
要调按钮间距：改 `index * 96` 里的 `96`。  
要调按钮大小：改文件顶部 `DESIGN.menuBtnW`、`DESIGN.menuBtnH`。

注意：当前数组顺序是 `ALL、DNIU、JH、HSMJ、ZMZ、PDK`，如果 prefab 里顺序不同不影响脚本，但视觉上建议按这个顺序摆。

### 6. 桌子滚动区域

位置：`HallStaticTestView.js -> bindTableScrollPrefab(size)`

```js
let viewW = size.width - DESIGN.tableLeft - DESIGN.tableRight;
let viewH = size.height - DESIGN.top - DESIGN.bottom;
let x = -size.width / 2 + DESIGN.tableLeft + viewW / 2;
let y = -12;
this.resizeNode(this.scrollNode, x, y, viewW, viewH);
```

要让桌子区域离左侧菜单更远：改文件顶部 `DESIGN.tableLeft`。  
要让桌子区域右侧留白变大：改 `DESIGN.tableRight`。  
要让桌子区域顶部避开公告条：改 `DESIGN.top`。  
要让桌子区域底部避开底栏：改 `DESIGN.bottom`。  
要整体上下微调：改 `y = -12`。

### 7. 桌子大小、间距、生成位置

位置 1：文件顶部 `DESIGN`

```js
tableW: 360,
tableH: 182,
gapX: 44,
gapY: 42,
```

位置 2：`HallStaticTestView.js -> updateVisibleTables()`

```js
let x = 38 + col * this.tableStrideX + DESIGN.tableW / 2;
let y = -18 - row * this.tableStrideY - DESIGN.tableH / 2;
```

要调第一列桌子的左边起点：改 `38`。  
要调第一排桌子的上下起点：改 `-18`。  
要调桌子横向间距：改 `DESIGN.gapX`。  
要调桌子纵向间距：改 `DESIGN.gapY`。

`TableScroll/view` 必须有 `cc.Mask`，否则桌子会盖到菜单栏。

### 8. 玩法切换按钮

位置 1：`HallStaticTestView.js -> bindBottomPrefab(size)`

```js
this.resizeNode(this.playTypeBar, this.leftX(DESIGN.menu + 360), -size.height / 2 + DESIGN.bottom + 32, 560, 52);
```

位置 2：`HallStaticTestView.js -> renderRoomTabs()`

```js
let allBtn = this.makeImageTab("RoomTabAll", -184, 0, "所有玩法", this.currentRuleIndex === -1);
let btn = this.makeImageTab("RoomTab_" + index, -18 + index * 170, 0, rule, this.currentRuleIndex === index);
```

要调整整条玩法位置：改 `bindBottomPrefab()` 里的 `PlayTypeTabs`。  
要调每个玩法按钮的位置和间距：改 `renderRoomTabs()` 里的 `-184`、`-18`、`170`。  
全部游戏时不显示玩法按钮。

### 9. 底部黑条和功能按钮

位置：`HallStaticTestView.js -> bindBottomPrefab(size)`

```js
this.resizeNode(bottom, 0, -333, size.width, 84);
this.resizeNode(bgBottom, 0, 0, bottom ? bottom.width : size.width, bottom ? bottom.height : DESIGN.bottom);
this.resizeNode(this.getNode("BottomBar/BtnScore"), -552, 0, 183, 59);
this.resizeNode(this.getNode("BottomBar/BtnManage"), -308, 0, 192, 56);
this.resizeNode(this.getNode("BottomBar/BtnBank"), -70, 0, 171, 50);
this.resizeNode(this.getNode("BottomBar/BtnQuickJoin"), 536, 2, 198, 76);
```

要调底部黑条高度：改 `84` 和文件顶部 `DESIGN.bottom`。  
要调底部整体上下：改 `-333`。  
要调按钮位置：改对应按钮那一行的 `x,y`。  
要调按钮大小：改对应按钮那一行的 `w,h`。

### 10. 桌子内部头像位置

位置：`HallStaticTableItem.js -> getGameLayout()`

这里控制每个游戏的头像座位、规则文字、人数文字。比如牛牛、金花、麻将的头像位置不一样，就在这个方法里分别调。

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
