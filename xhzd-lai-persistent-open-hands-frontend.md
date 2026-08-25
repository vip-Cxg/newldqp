# XHZD 两副牌带癞子全员常驻明牌协议

更新时间：2026-08-25  
当前规则：全员自动明牌、无询问、不翻倍

## 1. 生效范围

仅当以下条件同时满足时开启：

- XHZD 炸弹玩法；
- `rules.poker === 2`；
- `rules.lai === true`。

不再依赖是否有人恰毒，也不再由庄家选择。

## 2. 服务端行为

1. 发牌完成后，服务端自动开启明牌。
2. 服务端先向每位玩家发送自己的 `SC_GAME_INIT`。
3. 随后广播一次 `SC_SHOW_HANDS`，`players` 包含四家完整手牌。
4. 恰毒/叫牌流程正常进行，不会发送明牌询问。
5. 后续出牌时，前端使用 `SC_ACTION.currentCard.cards` 从对应玩家的公开手牌中精确扣除。
6. 断线重连时，`SC_GAME_INIT`/`SC_GAME_DATA` 中的 `openHandsPlayers` 包含四家实时剩余手牌。

## 3. `SC_SHOW_HANDS`

```json
{
  "gameID": "example-game-id",
  "round": 1,
  "idx": -1,
  "players": [
    { "idx": 0, "hands": [105, 205] },
    { "idx": 1, "hands": [106, 206] },
    { "idx": 2, "hands": [107, 207] },
    { "idx": 3, "hands": [108, 208] }
  ]
}
```

- `idx` 固定为 `-1`，表示全员明牌，没有单独决策人。
- `players` 必须包含四个座位。
- 癞子保留原始牌码 `117` 或 `217`。

## 4. 局内状态字段

```json
{
  "openHands": true,
  "openHandsPending": false,
  "openHandsRevealed": true,
  "openHandsIdx": -1,
  "openHandsClock": 0,
  "openHandsAuto": false,
  "multiplier": 1,
  "openHandsPlayers": []
}
```

- 正常公开后 `openHandsPlayers` 实际包含四家实时手牌，示例省略具体牌码。
- `openHandsPending` 固定为 `false`，前端不显示明牌确认框。
- `multiplier` 为兼容字段，固定为 `1`。
- 明牌不改变基础输赢和炸弹喜分。

## 5. 旧客户端兼容

旧客户端如果仍发送 `CS_OPEN_HANDS`，服务端只返回当前权威状态：

```json
{
  "idx": -1,
  "pending": false,
  "open": true,
  "clock": 0,
  "multiplier": 1
}
```

该请求不能关闭明牌，也不会影响牌局状态。

## 6. 验收要点

- [ ] 两副牌带癞子发牌后立即展示四家手牌。
- [ ] 无人恰毒时仍然全员明牌。
- [ ] 全程不出现明牌询问弹窗。
- [ ] 每次出牌后正确扣除对应玩家的公开手牌。
- [ ] 重连后恢复四家实时剩余手牌。
- [ ] 明牌不使基础分或喜分翻倍。
