# XHZD 包庄成功后才全员明牌—前端变更文档

更新时间：2026-08-26

## 1. 变更目标

XHZD 两副牌带癞子玩法的明牌规则调整为：

- 发牌后不立即明牌；
- 包庄过程中不公开其他玩家手牌；
- 某位玩家包庄成功后，服务端立即自动公开四家手牌；
- 不询问是否明牌，前端不展示明牌选择弹窗；
- 如果无人包庄，本局不明牌；
- 明牌不影响分数，基础分和炸弹喜分均不翻倍。

## 2. 生效范围

仅当以下条件同时满足时生效：

```text
gameType = XHZD
rules.poker = 2
rules.lai = true
本局有玩家包庄成功
```

两副牌不带癞子和三副牌不受本次变更影响。

## 3. 前端判定标准

前端不需要自行判断包庄玩家，也不需要自行获取其他玩家手牌。

收到服务端 `SC_SHOW_HANDS` 后，即可认定为“包庄已成功，全员明牌开启”。

## 4. 消息时序

```text
发牌完成
  -> SC_GAME_INIT
  -> SC_CALL
  -> 前端继续显示其他玩家的牌背

某玩家包庄成功
  -> SC_ACTION { event: "CALL", call: true }
  -> SC_SHOW_HANDS { idx: -1, players: [四家手牌] }
  -> SC_PLAY_CARD
```

服务端不会发送 `SC_OPEN_HANDS pending:true`，前端也不需要发送 `CS_OPEN_HANDS`。

## 5. 包庄前的状态

`SC_GAME_INIT` 或重连数据中，包庄前的明牌字段为：

```json
{
  "openHands": false,
  "openHandsPending": false,
  "openHandsRevealed": false,
  "openHandsIdx": -1,
  "openHandsClock": 0,
  "openHandsAuto": false,
  "multiplier": 1,
  "openHandsPlayers": []
}
```

前端此时只显示当前用户自己的手牌，其他三家继续显示牌背和剩余张数。

## 6. 包庄后的 `SC_SHOW_HANDS`

包庄成功后，服务端广播：

```json
{
  "gameID": "example-game-id",
  "round": 1,
  "idx": -1,
  "players": [
    {
      "idx": 0,
      "hands": [105, 205]
    },
    {
      "idx": 1,
      "hands": [106, 206]
    },
    {
      "idx": 2,
      "hands": [107, 207]
    },
    {
      "idx": 3,
      "hands": [108, 208]
    }
  ]
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `gameID` | string | 当前小局 ID |
| `round` | number | 当前小局数 |
| `idx` | number | 固定为 `-1`，表示全员明牌 |
| `players` | array | 四家手牌数据 |
| `players[].idx` | number | 玩家座位 |
| `players[].hands` | number[] | 玩家的完整原始手牌 |

癞子保留原始牌码 `117` 或 `217`。

## 7. 明牌开启后的状态

包庄成功后，游戏数据和重连数据中的明牌字段为：

```json
{
  "openHands": true,
  "openHandsPending": false,
  "openHandsRevealed": true,
  "openHandsIdx": -1,
  "openHandsClock": 0,
  "openHandsAuto": false,
  "multiplier": 1,
  "openHandsPlayers": [
    { "idx": 0, "hands": [] },
    { "idx": 1, "hands": [] },
    { "idx": 2, "hands": [] },
    { "idx": 3, "hands": [] }
  ]
}
```

`openHandsPlayers` 实际返回四家当前剩余手牌，上面的空数组仅用于省略示例牌码。

## 8. 出牌后扣除公开手牌

收到出牌消息后：

1. 使用 `currentCard.idx` 确定出牌玩家；
2. 遍历 `currentCard.cards`；
3. 从该玩家公开手牌中逐张删除完全相同的原始牌码。

```js
function removePlayedCards(openHandsBySeat, currentCard) {
  const hands = openHandsBySeat[currentCard.idx];
  for (const card of currentCard.cards) {
    const index = hands.indexOf(card);
    if (index >= 0) {
      hands.splice(index, 1);
    }
  }
}
```

不要根据癞子转换后的 `currentCard.card` 猜测扣牌。

## 9. 断线重连

- 包庄前重连：`openHands:false`，不返回其他玩家手牌。
- 包庄后重连：`openHands:true`，`openHandsPlayers` 返回四家实时剩余手牌。
- 前端应使用重连数据覆盖本地的公开手牌缓存。

## 10. UI 修改要求

- 删除“是否明牌”弹窗和倒计时。
- 包庄前不提前展示其他玩家手牌。
- 收到 `SC_SHOW_HANDS` 后立即展开四家手牌。
- 可显示“全员明牌”标识。
- 不显示“明牌 ×2”，不对结算分数二次计算。
- 新一局发牌时清空上一局的公开手牌。

## 11. 验收清单

- [ ] 发牌后、包庄前只能看到自己的手牌。
- [ ] 不出现明牌询问弹窗。
- [ ] 包庄成功后立即收到包含四家手牌的 `SC_SHOW_HANDS`。
- [ ] 无人包庄时不公开其他玩家手牌。
- [ ] 各玩家出牌后能正确扣除对应的公开手牌。
- [ ] 癞子出牌后按 `currentCard.cards` 原始牌码扣除。
- [ ] 包庄后重连可恢复四家实时剩余手牌。
- [ ] `multiplier` 始终为 `1`，基础分和喜分不翻倍。
