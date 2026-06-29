# 新大厅 HallStaticTestView Prefab 结构说明

目标：先用代码把大厅效果图的位置和层级调准；等视觉稳定后，再导出节点结构和坐标，手动回填到 prefab。

当前脚本入口：

- `assets/resources/Main/Prefab/HallStaticTestView.prefab`
- `assets/script/ui/hall/HallStaticTestView.js`
- `assets/resources/Main/Prefab/HallStaticTableItem.prefab`
- `assets/script/ui/hall/HallStaticTableItem.js`

## 一、页面 prefab 推荐层级

节点名尽量不要改，脚本按这些路径查找。

```text
HallStaticTestView
  大厅效果                         参考图，可隐藏

  BgLayer
    BgImage                        大厅背景图
    TopTint                        顶部黑色压暗层
    BottomTint                     底部黑色压暗层

  TopBar
    BtnBack                        返回按钮，挂 Sprite/Button

    UserInfo                       左上角用户信息整体容器
      InfoBg                       可保留但当前脚本隐藏；顶部大黑底建议放在 TopTint
      AvatarRoot                   头像整体容器
        AvatarMask                 圆形/圆角遮罩，挂 Mask
          AvatarSprite             真实头像图
        AvatarFrame                头像金框/占位框
      LabelID                      ID:123456789
      CoinBg                       只包住金币图标和金币数字的黑色圆角背景
      CoinIcon                     金币图标
      LabelCoin                    金币数字

    ClubTitle                      中间联盟标题
      julebudi                     紫色标题底图
      Label                        娱乐至上俱乐部

    BtnRefresh                     右上刷新
    BtnMessage                     右上消息
    BtnSetting                     右上设置

  NoticeBar
    IconSpeaker                    喇叭图标或文字
    NoticeText                     公告文字

  GameMenu                         左侧游戏菜单
    GameBtn_ALL
      Label                        可隐藏，按钮图片自带字时不用
    GameBtn_DNIU
      Label
    GameBtn_JH
      Label
    GameBtn_HSMJ
      Label
    GameBtn_ZMZ
      Label
    GameBtn_PDK                    当前隐藏，保留备用
      Label

  TableScroll                      桌子横向滚动区域，位置和大小在 prefab 里调
    view                           滚动裁剪层，挂 Mask
      content                      脚本运行时放桌子，不要手动放桌子

  PlayTypeTabs                     玩法切换按钮容器，位置在 prefab 里调

  BottomBar                        底部功能区
    BottomBlackBg                  底部黑底；没有时脚本会创建
    BtnScore
    BtnManage
    BtnBank
    BtnQuickJoin
```

## 二、现在可以手动调整的内容

这些节点的位置、大小、缩放可以直接在 prefab 里调：

- `TopBar/BtnBack`
- `TopBar/UserInfo`
- `TopBar/UserInfo/AvatarRoot`
- `TopBar/UserInfo/CoinBg`
- `TopBar/UserInfo/CoinIcon`
- `TopBar/UserInfo/LabelID`
- `TopBar/UserInfo/LabelCoin`
- `TopBar/ClubTitle`
- `TopBar/BtnRefresh`
- `TopBar/BtnMessage`
- `TopBar/BtnSetting`
- `NoticeBar`
- `GameMenu` 和每个 `GameBtn_*`
- `TableScroll`
- `PlayTypeTabs`
- `BottomBar` 和底部按钮

当前阶段 `HallStaticTestView.js` 使用 `PREFAB_OWNS_LAYOUT = false`，也就是代码会强制摆位置。等最终布局确认后，再把坐标导出到 prefab。

## 三、脚本仍然会动态处理的内容

这些保持脚本控制更合适：

- 背景图填充窗口大小。
- `TableScroll/view/content` 的滚动内容宽度。
- 桌子测试数据，默认 30 张。
- 横向滚动复用桌子节点，避免一次性生成太多。
- 游戏切换、玩法切换、快速刷新。
- 菜单按钮的选中透明度/缩放。
- 桌子 prefab 内的游戏图片、规则文字、人数文字、头像显示。

如果要调桌子之间的间距，改 `HallStaticTestView.js` 顶部的：

```js
const DESIGN = {
    tableW: 360,
    tableH: 182,
    gapX: 44,
    gapY: 42,
};
```

## 四、左上角用户信息建议坐标

参考效果图结构是：顶部黑背景上，左边返回按钮，右边用户信息。只有金币这一行有单独黑色圆角背景。

建议结构和层级：

```text
UserInfo
  AvatarRoot
    AvatarMask
      AvatarSprite
    AvatarFrame
  LabelID
  CoinBg
  CoinIcon
  LabelCoin
```

建议大致尺寸：

- `UserInfo`: `360 x 90`
- `AvatarRoot`: `76 x 76`
- `AvatarMask`: `66 x 66`
- `AvatarSprite`: `66 x 66`
- `AvatarFrame`: `76 x 76`
- `LabelID`: `210 x 36`
- `CoinBg`: `176 x 34`
- `CoinIcon`: `28 x 28`
- `LabelCoin`: `112 x 32`

建议相对位置：

```text
AvatarRoot  x=-92, y=0
LabelID     x=92,  y=18
CoinBg      x=82,  y=-22
CoinIcon    x=18,  y=-22
LabelCoin   x=88,  y=-22
```

如果头像离返回按钮太近，只移动整个 `UserInfo` 节点向右，不要单独移动头像。

## 五、桌子 prefab 结构

当前一个 `HallStaticTableItem.prefab` 可以继续满足五种游戏，不急着拆五个。

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
    avatarMask
      avatarSprite
    nameBg
    nameLabel
  ...
  AvatarSeat8
```

目前座位位置由 `HallStaticTableItem.js` 里的 `getGameLayout()` 控制，因为不同游戏的桌子图座位位置不同。

如果以后想完全在 prefab 里调每个游戏的座位，可以再拆成：

```text
HallStaticTableItem_DN.prefab
HallStaticTableItem_JH.prefab
HallStaticTableItem_HSMJ.prefab
HallStaticTableItem_ZMZ.prefab
HallStaticTableItem_PDK.prefab
```

但现在先不拆，减少维护量。

## 六、美术替换步骤

1. 把图片放到 `assets/resources/hall`。
2. 在 Cocos 里等待资源导入完成。
3. 打开 `HallStaticTestView.prefab`。
4. 选中对应节点，把图片拖到 SpriteFrame。
5. 调节点位置、大小、缩放。
6. 不改节点名。
7. 保存 prefab。
8. 浏览器运行检查。

页面级美术优先替换：

- 背景：`BgLayer/BgImage`
- 返回：`TopBar/BtnBack`
- 用户头像框：`TopBar/UserInfo/AvatarRoot/AvatarFrame`
- 金币：`TopBar/UserInfo/CoinIcon`
- 联盟标题：`TopBar/ClubTitle/julebudi`
- 右上按钮：`BtnRefresh`、`BtnMessage`、`BtnSetting`
- 左侧菜单：`GameMenu/GameBtn_*`
- 底部按钮：`BottomBar/BtnScore`、`BtnManage`、`BtnBank`、`BtnQuickJoin`
- 玩法按钮图：脚本使用 `hall/suoyouwanan` 和 `hall/suoyouwanfadi`

## 七、注意事项

- `TableScroll/view/content` 不要手动摆桌子，否则运行时会被脚本清理或覆盖。
- `GameBtn_PDK` 当前只是保留备用，运行时隐藏。
- `PlayTypeTabs` 容器可以调位置，但里面的玩法按钮由脚本运行时生成。
- 桌子文字颜色当前在脚本里设置为黄色：`#FFE778`。
- 名字黑底目前使用 `nameBg` 节点，脚本只调大小和黑色，不再画额外 Graphics。
