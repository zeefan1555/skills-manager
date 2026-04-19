# Recent Command Reuse

本文件用于沉淀“如何优先复用最近一轮已经跑过的命令、请求体和证据”，避免在 `social-pet-tools` 的重复任务里每次都从零重新造轮子。

## 适用场景

- 新任务和最近一次任务属于同一条链路，只是目标、字段或断言略有变化
- 已经存在一轮或多轮 RPC 验证记录，需要快速续跑下一轮
- 用户要求“照上次的命令再跑一遍”“把上次请求改几个字段再试”
- 当前任务要并行开多个小分支，但底层命令模板和请求骨架高度相似
- 你已经知道仓库里有历史证据文件，不希望再次手工拼接长命令或长 JSON

不适用于：

- 当前任务和最近一轮任务不属于同一条业务链路
- 历史请求体依赖的环境、账号、分支或配置已明显失效
- 你无法确认历史证据对应的是哪次 round、哪个环境、哪个目标

## 推荐检查顺序

每次准备复用前，先按下面顺序做最小检查：

1. 先确认当前目标是否真的和最近任务同链路，只差少量字段、参数或断言
2. 再确认当前分支、环境、测试账号、会话信息是否仍可复用；必要时先查 `references/env.md`
3. 再找最近一轮的证据目录、round 级 `index.json`、`verdict.md` 和顶层 `closeout.md`
4. 先复用最接近当前目标的现成命令，不要急着自己重写
5. 只替换本轮真正变化的字段，如 `uid`、`did`、`conversation_id`、配置值或断言
6. 新一轮跑完后，立刻把新的 req / resp / log / verdict 落盘，避免下一次又回到口头记忆

## 如何定位最近 round

优先从最近任务的证据目录里找“最后一次真正执行成功或失败的 round”，而不是只看总结结论。

推荐定位方式：

1. 先看最近任务目录下是否有 `round-N/` 及其 `index.json`
2. 再看该 round 是否同时包含 `commands/`、`requests/`、`responses/`、`logs/`、`verdict.md`
3. 如果同时有多个 round，优先选择与当前目标最接近、且状态不是纯分析态的那一轮
4. 如果最后一轮只是分析没有实际执行，就回退到上一轮有真实请求和响应的 round
5. 如果顶层已有 `index.md` 或 `closeout.md`，先读它们确认本轮与历史结论的关系

一个简单判断标准：

- 有 `round-N/index.json`
- 有原始命令和请求体
- 有响应或报错
- 有本轮 `verdict.md`
- 能说清楚本轮目标和结论

满足这五点，才算“可复用的最近 round”。

## 如何复用命令与请求体

复用时遵循“先复制，再最小修改，再重新命名落盘”。

推荐做法：

1. 先复制最近 round 的命令文本，优先取 `commands/raw/` 里的对应文件
2. 再复制最近 round 的请求体 JSON，作为本轮初始版本
3. 只改和本轮目标直接相关的字段，不顺手重排结构或重写全部参数
4. 如果命令里引用了文件路径，先新建本轮自己的 `req` / `resp` / `log` 文件名，避免覆盖历史证据
5. 如果命令包含固定环境参数，先逐项确认仍然有效，不要盲目原样执行
6. 如果同一个请求已经被验证过多个变种，优先复用最接近当前目标的那个变种，而不是最早版本
7. 如果本轮复用了上一轮证据，要在新的 `round-N/index.json` 中写清楚 `reused_from_rounds`

复用时重点检查的字段通常包括：

- `uid`
- `did`
- `conversation_id`
- `pet_id`、`widget_id`、`item_id` 等业务主键
- `env`、`cluster`、`namespace`、`ppe` 等环境字段
- 输出文件路径和 round 编号

## 多开任务避免重复造轮子

当同一主题需要并行开多个小任务时，不要让每个任务都从零构造命令。

推荐原则：

1. 先选一个最完整的最近 round 作为母版
2. 把母版中的公共命令、公共请求骨架和公共环境参数抽出来复用
3. 每个并行任务只维护自己的差异字段和独立证据文件
4. 不要多个任务共用同一个输出文件，避免互相覆盖
5. 如果某个子任务已经跑出更接近目标的新 round，后续任务应优先复用这个更新的 round，而不是继续抱着旧母版不放
6. 若任务之间已经明显分叉为不同链路，就各自维护最近 round，不再强行共用

核心目标不是“统一”，而是：

- 公共部分复用
- 差异部分隔离
- 证据文件不互相污染

## 简短示例

假设你刚做完一轮 `GetPetElfCfg -> UpdateWidget -> GetWidget` 验证，目录里已有：

- `round-6/index.json`
- `round-6/commands/raw/02-update-widget.md`
- `round-6/requests/raw/02-req-UpdateWidget-new.json`
- `round-6/responses/raw/02-resp-UpdateWidget-new.json`
- `round-6/verdict.md`

现在用户说：“沿用上一轮请求，把 `widget_id` 换成新值再跑一次。”

推荐动作：

1. 从最近目录找到 `round-6/requests/raw/02-req-UpdateWidget-new.json`
2. 复制为本轮新文件，例如 `round-7/requests/raw/02-req-UpdateWidget-rerun.json`
3. 只改 `widget_id` 和本轮需要变动的少数字段
4. 从 `round-6/commands/raw/02-update-widget.md` 复制上一轮命令，并把输入输出文件名替换成本轮文件
5. 执行后保存 `round-7/responses/raw/02-resp-UpdateWidget-rerun.json`
6. 在 `round-7/index.json` 里写清楚：本次复用自 `round-6`，只做最小变体复跑
7. 在 `round-7/verdict.md` 里记录这轮和上一轮相比到底改了什么

这样做的重点不是省几秒钟，而是保证每一轮都能追溯到“它复用了哪一轮，又只改了什么”。
