# Doushan RPC Shape And SCM SHA

## 背景

本轮在 `goal-rpc-loop -> rpc-first-pass -> rpc-gap-loop` 中，围绕 `DouShanActualSign` 的 `GetPetElfCfg / UpdateWidget / GetWidget` 最小闭环做了多轮验证。

## 最终结论

1. 先按代码推导请求构造，再判断服务端逻辑是否有问题。
2. 先核对线上实例的 SCM 版本和 base commit，再判断版本是否带代码。

## 推荐命令候选

### 候选 1：请求形态校验命令

- 先读代码，找到服务端真正消费哪些请求字段。
- 判断 `Extra.widget / Extra.bag / cur_image` 是否是客户端上报态。
- 对齐会影响前置分支的字段，再做 RPC 复测。

### 候选 2：SCM SHA 核对命令

- 查线上命中实例的真实 cluster / deployment / version。
- 查该 version 的 `base_commit_hash`。
- 查本地 `git rev-parse HEAD`。
- 判断线上版本是否真的更新到你的代码。

## 关键证据

- `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/analysis.md`
- `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/scm/version-list.json`
- `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/requests/raw/20-getpetelfcfg-client-shape.actual.json`
- `docs/social-pet/2026-04-19-doushan-actualsign-rpc-acceptance/goal-rpc-loop/rpc-gap-loop/round-1/responses/raw/20-getpetelfcfg-client-shape.resp.json`

## 结果

这两条经验都已经具备明确错误假设、修正结论和证据链，适合作为 `archive inbox` 草稿继续推进。
