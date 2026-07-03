# ui-generator

适配 Cocos Creator 2.4.14。

1. 删除/备份项目 `packages/ui-generator`
2. 将本目录复制到项目 `packages/ui-generator`
3. 完全退出并重启 Creator
4. 打开带 Canvas 的场景
5. 插件 -> ui-generator -> 生成成员管理完整模块
6. 层级出现 MemberManageModule
7. 手动拖到 assets/prefabs/auto 保存为 Prefab

说明：当前版本按 1334x750 效果图建立完整主页面和 5 个弹窗节点结构。截图本身不是可复用 SpriteFrame，因此按钮渐变、边框、头像、字体等最终 1:1 视觉需要接入原始美术资源后做资源名自动匹配。
