# 新华包牌（SDH）客户端实现说明

## 隔离原则

- SDH 使用独立场景 `GameSDH` 和独立资源目录，不修改 Game07/Game09 场景。
- 场景资源 UUID 已重新生成；只继续使用项目公共牌面、弹窗和网络模块。
- 客户端只做基础选牌校验，牌型合法性、墩赢家与结算以服务端为准。

## 服务端状态映射

| 状态 | 客户端界面 |
|---|---|
| WAIT | 三人座位、准备按钮 |
| CALL/bid | 不叫、滑杆、-5/+5、叫庄确认 |
| CALL/suit | 四种主花色 |
| BURY | 庄家33张手牌、已选x/8、确认扣底 |
| START | 三方本墩出牌、得分、倒台目标、托管和投降 |
| SUMMARY | 单局结算与重新准备 |

服务端在单局结算后马上重置为 `WAIT`。本地服务端补丁允许重连私有快照携带漏收的服务端 `summary`；客户端会显示该结果，也会在同桌同步时保留已收到的结算。未打补丁的服务端在漏收结算时只能恢复等待状态。

`tools/patches/sdh-resume-settlement.patch` 只涉及 SDH：复用原结算数据，仅在同局同座的原玩家重连且尚未为下一局准备时发送。补丁已应用到本机 `D:/work/ldqp`，未部署上线。用 `node tools/test-sdh-resume-patch.cjs` 可验证服务端快照分发、结算重置和序列化恢复；加 `--wire` 可验证隔离 WebSocket 重连，两种测试均不写服务端源码、不连接数据库。真实测试桌已用 `node tools/test-sdh-local-game.cjs 669645 182 --miss-settlement` 验证断线补发。

## 本地服务器联调

1. 启动本机开发数据库（当前 Windows 开发机 MySQL 使用 3307，Redis 使用 6379）。
2. 在客户端仓库执行 `node tools/start-sdh-local.cjs`。它从 `D:/work/ldqp` 启动真实 API 和 SDH 服务，分别监听 `192.168.1.186:8000` 和 `192.168.1.186:8204`；手机需在同一局域网。MySQL、Redis 仍用回环地址，正式网关的 58204 不在本地启动。
3. 首次使用执行 `node tools/seed-sdh-local.cjs`，创建独立测试俱乐部、三名测试账号和一个 SDH 房型，不更新现有数据。用 `node tools/check-sdh-local-login.cjs` 验证。
4. Creator 预览场景选 `Update`，与真机一样通过 `SelectLink` 选线，不从 URL 参数绕过启动。连接本地测试服务后，从大厅原有的亲友俱乐部入口选择“新华包牌本地测试”（本机俱乐部 ID：669645）。先由一人开桌，其他人点已创建的同一张桌。

若编辑器早于代码改动已打开，先在不带任何查询参数的预览首页点 `Recompile`，重新生成脚本缓存，再打开多座位标签页。Creator 2.4 在带查询参数的地址上会拼错重新编译请求；仅刷新浏览器标签页也不会重新编译旧脚本。

真实服务端回归：`node tools/test-sdh-local-game.cjs <clubID> <roomID>`，参数为种子脚本输出的本地测试房间。会占用三个测试账号打一局，检查托管、闲家拒绝投降和中途重连，请不要和手动测试同时运行。旧版 `tools/test-sdh-creator-browser.cjs` 依赖已撤掉的预览入口，不适用于当前正常启动流程。

叫庄恢复对应 `tools/patches/sdh-auction-recovery.patch`：没有合格竞价者时，有有效叫分则原最高分玩家选主，没有叫分则流局；还有竞价者但缺少操作位时由服务端补发轮次。本地源码已应用，已启动的 Node 进程需重新加载；`node tools/test-sdh-resume-patch.cjs --wire` 能隔离复现该状态，不占用测试桌。

智能提示需要服务端 `tools/patches/sdh-smart-hint.patch`。客户端请求 `CS_SDH_HINT`，只有当轮出牌者或扣底庄家收到私有的 `SC_SDH_HINT`；提示和托管共用候选生成，不更改 `canPlayGroup` 的现行判定。真实候选和权限回归用 `node tools/test-sdh-hint.cjs`，不连接测试桌。

## 本地逻辑测试

Creator 的浏览器离线牌桌入口已撤掉。离线模拟只保留用于 Node 脚本回归，不影响实际选线、登录或牌局。

纯逻辑模块不依赖 Cocos，可在项目根目录执行：

```powershell
node tools/test-sdh-state.cjs
node tools/test-sdh-preview.cjs
node tools/test-sdh-scene-controller.cjs
node tools/remap-sdh-bindings.cjs --check
```
