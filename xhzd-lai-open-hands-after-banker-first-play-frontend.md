# XHZD 包庄者打完第一手牌后全员明牌——前端对接文档

更新时间：2026-08-27  
适用玩法：XHZD 两副牌带癞子

## 1. 规则说明

- 发牌后不明牌。
- 包庄询问期间不明牌。
- 玩家包庄成功后也不立即明牌。
- 包庄者打出第一手合法牌后，服务端才向所有客户端公开四家手牌。
- 首次公开的是扣除包庄者第一手出牌后的四家当前剩余手牌。
- 全程不询问是否明牌，客户端不需要发送明牌选择。
- 明牌不翻倍，`multiplier` 始终为 `1`。
- 如果无人包庄，本局不会明牌。

## 2. 生效条件

以下条件同时满足时生效：

```text
gameType = XHZD
rules.poker = 2
rules.lai = true
本局有玩家包庄成功
```

两副牌不带癞子及三副牌玩法不使用本规则。

## 3. 消息时序

```text
发牌完成
  -> SC_GAME_INIT
  -> SC_CALL

某玩家包庄成功
  -> SC_ACTION { event: "CALL", call: true }
  -> SC_PLAY_CARD
  -> 此时仍不明牌，不发送 SC_SHOW_HANDS

包庄者打出第一手合法牌
  -> SC_ACTION { event: "PLAY", currentCard: ... }
  -> SC_SHOW_HANDS { idx: -1, players: [四家当前剩余手牌] }
  -> 后续正常出牌
```

关键要求：`SC_SHOW_HANDS` 一定晚于包庄者第一手牌对应的 `SC_ACTION/PLAY`。

如果包庄者提交的牌不合法，服务端只返回出牌错误，不会开启明牌。

## 4. 首手出牌前的状态

从发牌完成到包庄者打出第一手合法牌之前，包括已经包庄成功但尚未出牌的阶段，明牌状态均为：

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

客户端此时只展示当前用户自己的手牌，其他玩家继续显示牌背及剩余张数。

## 5. 全员明牌消息

包庄者第一手合法出牌广播完成后，服务端紧接着广播 `SC_SHOW_HANDS`：

```json
{
  "gameID": "example-game-id",
  "round": 1,
  "idx": -1,
  "players": [
    {
      "idx": 0,
      "hands": [205, 305]
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
| `idx` | number | 固定为 `-1`，代表全员明牌 |
| `players` | array | 四个座位的当前剩余手牌 |
| `players[].idx` | number | 玩家座位号 |
| `players[].hands` | number[] | 该玩家当前剩余的原始牌码 |

`players` 中包庄者的手牌已经扣除了刚刚打出的第一手牌。客户端不要再次从这份 `SC_SHOW_HANDS` 数据中扣除首手牌。

癞子继续使用原始牌码 `117`、`217`，不会替换成其配成的目标牌。

## 6. 前端处理方式

1. 收到包庄成功的 `SC_ACTION/CALL` 时，不展开其他玩家手牌。
2. 收到包庄者第一手 `SC_ACTION/PLAY` 时，按正常出牌动画处理。
3. 随后收到 `SC_SHOW_HANDS` 时，使用 `players` 初始化或直接覆盖四家的公开手牌。
4. 从第二手牌开始，根据每次 `currentCard.cards` 从对应玩家公开手牌中逐张扣除。
5. 新一局开始时，清空上一局的公开手牌缓存。

后续扣牌示例：

```js
function removePlayedCards(openHandsBySeat, currentCard) {
  const hands = openHandsBySeat[currentCard.idx];
  if (!hands) return;

  for (const card of currentCard.cards) {
    const index = hands.indexOf(card);
    if (index >= 0) {
      hands.splice(index, 1);
    }
  }
}
```

必须使用 `currentCard.cards` 中的原始牌码扣牌，不要根据 `currentCard.card` 推测癞子实际牌码。

## 7. 明牌后的状态与重连

包庄者打出第一手牌后：

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

上面的空数组仅为示例；实际的 `openHandsPlayers` 会返回四家实时剩余手牌。

- 首手出牌前重连：`openHands:false`，`openHandsPlayers:[]`。
- 首手出牌后重连：`openHands:true`，返回四家实时剩余手牌。
- 重连时前端应使用服务端数据覆盖本地缓存。

## 8. 不再使用的交互

- 不展示“是否明牌”弹窗。
- 不展示明牌选择倒计时。
- 不发送 `CS_OPEN_HANDS`。
- 不等待 `SC_OPEN_HANDS pending:true`。
- 不显示“明牌 ×2”。
- 不在客户端对基础分或喜分进行明牌翻倍。

## 9. 验收清单

- [ ] 发牌后不显示其他玩家手牌。
- [ ] 包庄过程中不显示其他玩家手牌。
- [ ] 包庄成功后不立即发送或展示全员手牌。
- [ ] 包庄者提交非法首手牌时不明牌。
- [ ] 包庄者第一手合法 `SC_ACTION/PLAY` 后才收到 `SC_SHOW_HANDS`。
- [ ] 首次公开的包庄者手牌已经扣除第一手出牌。
- [ ] `SC_SHOW_HANDS` 一次包含四家当前剩余手牌。
- [ ] 后续出牌按 `currentCard.cards` 正确扣除公开手牌。
- [ ] 首手出牌前重连不明牌，首手出牌后重连恢复四家手牌。
- [ ] 无人包庄时不明牌。
- [ ] 全程没有明牌询问，且 `multiplier` 始终为 `1`。

