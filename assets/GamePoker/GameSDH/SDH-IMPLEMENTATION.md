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
2. 在客户端仓库执行 `node tools/start-sdh-local.cjs`。它从 `D:/work/ldqp` 启动真实 API 和 SDH 服务，监听本机 8000 / 8204；正式网关的 58204 不在本地启动。
3. 首次使用执行 `node tools/seed-sdh-local.cjs`，创建独立测试俱乐部、三名测试账号和一个 SDH 房型，不更新现有数据。用 `node tools/check-sdh-local-login.cjs` 验证。
4. Creator 预览场景选 `Update`，点击浏览器预览。默认使用本地 API，登录页点击“玩家1 / 玩家2 / 玩家3”。从大厅原有的亲友俱乐部入口选择“新华包牌本地测试”（本机俱乐部 ID：669645），进入俱乐部后点击“新华包牌开房”，选择“新华包牌本地桌”房型。其他测试玩家在同一俱乐部点击已创建的桌子入座，不要再次点开房。同一浏览器测三席时分别打开默认预览地址、`?seat=2` 和 `?seat=3`，各点对应玩家，避免共享登录状态。

若编辑器早于代码改动已打开，先在不带任何查询参数的预览首页点 `Recompile`，重新生成脚本缓存，再打开多座位标签页。Creator 2.4 在带查询参数的地址上会拼错重新编译请求；仅刷新浏览器标签页也不会重新编译旧脚本。

真实服务端回归：`node tools/test-sdh-local-game.cjs <clubID> <roomID>`，参数为种子脚本输出的本地测试房间。会占用三个测试账号打一局，检查托管、闲家拒绝投降和中途重连，请不要和手动测试同时运行。Creator 已启动预览时，可用 `node tools/test-sdh-creator-browser.cjs --recompile` 检查离线扣底界面，以及真实测试号登录和进桌；加 `--three-seats` 继续验证三席实局和出牌中途重连。

叫庄恢复对应 `tools/patches/sdh-auction-recovery.patch`：没有合格竞价者时，有有效叫分则原最高分玩家选主，没有叫分则流局；还有竞价者但缺少操作位时由服务端补发轮次。本地源码已应用，已启动的 Node 进程需重新加载；`node tools/test-sdh-resume-patch.cjs --wire` 能隔离复现该状态，不占用测试桌。

智能提示需要服务端 `tools/patches/sdh-smart-hint.patch`。客户端请求 `CS_SDH_HINT`，只有当轮出牌者或扣底庄家收到私有的 `SC_SDH_HINT`；提示和托管共用候选生成，不更改 `canPlayGroup` 的现行判定。真实候选和权限回归用 `node tools/test-sdh-hint.cjs`，不连接测试桌。

仅 Creator 浏览器预览启用本地登录。包体与普通 Web 构建仍使用既有选线流程；需要恢复 Creator 的原选线流程，可用 `?online=1`。

## 离线验证

在 Cocos Creator 2.4.14 启动浏览器预览，保留原有启动场景。给预览地址加 `?sdh=1`（已有查询参数时用 `&sdh=1`），例如 `http://localhost:7456/?sdh=1`。只在 Creator 浏览器预览生效，绕过选线和登录，不连接正式环境。

点击“准备”即可走叫庄、选主、扣底和出牌。电脑席位自动跟牌，“模拟重连”用离线快照重新渲染当前阶段。选“不叫”可测试流局；选“投降”可测试庄家投降结算。离线牌局用于检查界面和消息流，不用于验证正式玩法的牌型或计分规则。

纯逻辑模块不依赖 Cocos，可在项目根目录执行：

```powershell
node tools/test-sdh-state.cjs
node tools/test-sdh-preview.cjs
node tools/test-sdh-scene-controller.cjs
node tools/remap-sdh-bindings.cjs --check
```
