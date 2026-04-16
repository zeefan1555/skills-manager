---
name: "rpc-acceptance-loop"
description: "Execute RPC acceptance runs end-to-end: prepare cases, run all requests, save evidence, retry transient failures, assert results, and only enter code-fix after explicit user approval."
---

# RPC Acceptance Loop

面向“RPC 黑盒验收执行”的通用 skill。

它的核心职责不是帮你猜业务结论，也不是一看到失败就改代码，而是：

- 先把验收范围和 case 矩阵跑完整
- 把请求、原始回包、重试回包、`log_id/pod`、实例日志、外部状态证据留完整
- 输出最终 `PASS / FAIL / NOT-COVERED` 结果
- 只有用户显式同意后，才进入 triage / code-fix 阶段

这个 skill 只负责“怎么执行 RPC 验收”。
不内置某个项目的专有业务规则、关键词、表名、缓存 key 或日志前缀。

## When To Invoke

适用于：

- 你要对一个或一组 RPC 做系统化验收
- 你希望形成“请求 -> 回包 -> 日志 -> 断言 -> 结果矩阵”的完整证据链
- 你需要把结果长期归档，后续可复跑、可回归
- 你需要先拿到完整结果，再决定是否修代码

不适用于：

- 只有一个明确请求，目标只是快速排查“为什么没生效”
- 只想做本地单测
- 需求和场景都还没定，还处于探索阶段

## Core Rules

- Default mode: **full acceptance run only, no business-code changes**
- Hard gate: **before all planned cases finish and final results are summarized, do not modify business code**
- Code-fix phase is **explicit opt-in**: only enter after user confirms
- Save request and raw response first; inspect logs second
- Extract `log_id` and `pod_name` from response first; do not blind-search service logs
- Prefer instance logs over broad log search whenever instance identity is available
- First decide whether the request entered the intended branch; then decide whether branch result is correct
- Any conclusion must be backed by saved artifacts, not memory

## Generic Execution Chain

无论具体验收哪个 RPC，默认都按这条链执行：

1. request template / req.json
2. raw response / retry responses
3. extract `log_id`, `pod_name`, `request_address`, `argos_link`, `instance_log_link`
4. inspect instance log around this request
5. if needed, inspect external state
   - database row / cache key / downstream artifact / callback evidence
6. write case bundle
7. update final acceptance matrix

注意：

- “外部状态”是可选步骤，不是每个 case 都必须查
- 只有在响应和实例日志不足以解释结果时，才扩展到 DB / cache / downstream
- 不要把项目专有的 triage 细节写死在主流程里

## Artifact Layout (Mandatory)

### Topic Layout

- Topic 目录：`docs/rpc-verify/summary/<date-topic>/`
- Tmp 目录：`docs/rpc-verify/tmp/<date-topic>/run-<timestamp>/`
- `date-topic` 形式：`YYYY-MM-DD-<topic>`
- `run-<timestamp>` 推荐：`run-YYYYMMDDTHHMMSS`

### Summary Files

`summary/<date-topic>/overview.md` 必须放：

- 验收目标与范围
- 环境参数（psm / env / idc / zone / cluster / idl）
- 场景矩阵与最终 `PASS / FAIL / NOT-COVERED`
- 关键结论与下一步建议

`summary/<date-topic>/evidence-index.md` 必须放：

- 每个 case 的请求文件路径
- 每个 case 的最终回包路径
- `log_id` / `pod_name` / `argos_link` / `instance_log_link`
- 对应日志文件与 bundle 路径

`summary/<date-topic>/decision-log.md` 建议放：

- 为什么停止重试
- 为什么某个 case 被判定为 blocked / not-covered
- 为什么没有进入 code-fix phase
- 任何影响结论的人工判断

### Tmp Run Files

`tmp/<date-topic>/run-<timestamp>/` 必须包含：

- `manifest.json`
- `logs/`
- `exports/`
- `cases/<case-id>/`

`cases/<case-id>/` 必须放：

- `params.json`
- `*_req.json`
- `*_try1_out.json`, `*_try2_out.json`, `*_try3_out.json`
- `*_final_out.json`
- `bundle.md`

`logs/` 必须放：

- 实例日志 / lane 日志 / logid 日志原始文件
- 不要把日志散落在 case 根目录

`exports/` 必须放：

- `assert_report.json`
- 外部状态导出（如果有）

### Manifest Responsibilities

每次 run 必须生成 `manifest.json`，记录：

- 本次 run 的全局参数
- case 列表
- 每个 case 的请求文件、每轮重试回包、最终回包
- 每个 case 的断言状态与最终分类

## Inputs Required (Ask User)

开始前必须确认：

1. RPC info
   - `psm`
   - methods list
2. Environment args
   - `control_plane`, `idc`, `env`, `zone`, `cluster`
3. IDL args
   - `idl_source`
   - `idl_version`
4. Request source
   - 现成 req.json
   - 或生成模板所需的最小字段
5. Acceptance expectation
   - 验收文档
   - 或 assertion spec
6. Write-risk policy
   - 是否允许写操作 RPC（例如 create / update / feed / submit）
7. Local test strategy
   - 仅在用户批准进入 Phase 2 时才需要

## Phase Model

### Phase 1: Full Acceptance Run (Default)

目标：**先跑完整套 case，不改业务代码**。

必须完成：

1. 写或确认场景矩阵
2. 生成 / 检查请求体
3. 做 pre-flight 检查
4. 跑完整套 case
5. 对失败 case 执行 retry policy
6. 解析与断言
7. 输出最终矩阵
8. 询问用户是否进入 Phase 2

### Phase 2: Triage / Code Fix (Opt-in Only)

只有在以下条件全部满足时才能进入：

- 所有 planned cases 已跑完
- 已产出最终 `PASS / FAIL / NOT-COVERED` 矩阵
- 已保存失败 case 的完整 req/out/log artifacts
- 用户明确同意进入 triage / code-fix

未满足上述条件时，禁止修改业务代码。

## Pre-flight Checks (Mandatory)

在第一次发 RPC 前，必须完成以下检查：

1. 请求字段类型检查
   - 对照 IDL 检查关键字段类型
   - 常见坑：string / i64 / bool / list / map 类型不匹配
   - 如果是请求模板问题，先修模板再发请求；这不算修改业务代码
2. 必填字段检查
   - 用户标识、设备标识、环境标识、方法必填业务字段必须齐全
3. 环境参数检查
   - `idl_version`, `control_plane`, `idc`, `env`, `zone`, `cluster` 必须完整
4. 输出路径检查
   - 同一 run 下 case 命名不能互相覆盖
   - 每次重试必须独立落盘
5. 解析路径检查
   - 同时支持 `resp_body_json`
   - 若缺失，则 fallback 解析 `resp_body` 字符串
6. 写操作风险检查
   - 如果 case 会修改环境状态，必须先确认用户允许这样做

If pre-flight fails:

- fix req / env / template
- re-run pre-flight
- do **not** mark as product failure
- do **not** modify business code

## Retry Policy (Mandatory)

### Retry Goal

如果 case 没跑通，先判断是不是“请求体、代理、网络、环境抖动、平台外层错误”导致的，不要第一次失败就推断业务逻辑有问题。

### Retriable Failures

以下情况默认先重试，最多 3 次：

- `call error: remote or network error`
- `timeout`
- `找不到服务地址`
- `connection reset`
- `EOF`
- `thrift marshal` / `thrift unmarshal`
- 明显由请求体类型错误导致的失败
- 外层平台错误，且没有进入业务逻辑

### Retry Rules

- 最大重试次数：3 次
- 退避：1s / 2s / 4s
- 每次尝试都要独立落盘：`*_try1_out.json`, `*_try2_out.json`, `*_try3_out.json`
- 若中途成功：保留全部尝试文件，并把最后一次成功结果保存为 `*_final_out.json`
- 若 3 次均失败：分类为 `FAIL-retriable-exhausted`

### Non-Retriable Failures

以下情况一般不靠重试解决：

- `BaseResp.StatusCode` 稳定非 0 且语义明确
- 同一 case 多次返回同一业务错误
- 请求明确进入目标分支，但断言稳定失败

## Send RPCs And Save Responses

Template:

```bash
export NPM_CONFIG_REGISTRY=http://bnpm.byted.org

npx -y @bytedance-dev/bytedcli@latest --json api-test rpc-call \
  <psm> <method> \
  --idl-source <idl_source> \
  --idl-version <idl_version> \
  --control-plane <control_plane> \
  --idc <idc> \
  --env <env> \
  --zone <zone> \
  --cluster <cluster> \
  --body-file <req_json_path> \
  --with-logid > <out_json_path>
```

执行要求：

- 按场景矩阵逐个执行所有 planned cases
- 可重试失败按 retry policy 处理
- 原始失败尝试不得覆盖
- 所有 case 跑完后，才做最终汇总

## Parse / Assert Rules

对每个 final output，必须提取：

- `log_id`
- `pod_name`
- `request_address`
- `argos_link`
- `instance_log_link`
- response body

解析顺序：

1. 优先读 `resp_body_json`
2. 如果没有，fallback 解析 `resp_body`
3. 断言时使用统一路径规则

每个 case 最终分类为：

- `PASS`
- `FAIL-business`
- `FAIL-input-template`
- `FAIL-retriable-exhausted`
- `BLOCKED`
- `NOT-COVERED`

## Generic Triage Chain

当某个 case 失败时，按以下顺序判断：

1. 请求有没有真正发出去
2. 外层平台是否成功返回
3. 有没有拿到 `log_id`
4. 有没有拿到 `pod_name`
5. 是否能在实例日志中确认请求进入目标服务
6. 是否进入了目标分支 / 目标阶段
7. 分支命中后，结果是否与预期一致
8. 若仍不能解释，再查外部状态

### Instance Log Rules

- 只要拿到了 `pod_name`，优先看实例日志
- 不要优先依赖全站关键词搜索
- 日志时间窗尽量限制在本次请求附近
- 先用日志回答“有没有进入目标分支”，再回答“为什么结果不对”

### Optional External State

只有在必要时才查：

- DB row / document
- cache key
- downstream callback record
- generated artifact / storage object

外部状态检查的目标不是“多查一点”，而是解释“为什么回包与日志仍不能闭环”。

## Bundle Rules

每个 case 的 `bundle.md` 至少包含：

1. 请求体路径
2. 最终回包路径
3. 所有 retry 回包路径
4. `log_id`
5. `pod_name`
6. 关键实例日志片段
7. 外部状态证据（如果查了）
8. 最终结论

结论建议收敛到这种粒度：

- 请求未真正发出
- 请求发出但未进入目标服务
- 请求进入服务但未命中目标分支
- 请求命中目标分支，但业务结果不符合预期
- 请求命中目标分支，且最终结果符合预期
- 外部依赖未就绪 / 外部状态未更新

## Summary Before Any Fix

在修改任何业务代码前，必须先输出最终 summary：

- executed cases
- pass / fail / blocked / not-covered counts
- failures grouped by category
- operator mistakes in request / env / template
- unknowns that remain unresolved
- recommended next action

然后询问用户：

- 只保留验收报告
- 继续做日志 triage
- 进入 Phase 2 code-fix

## Phase 2 Only: Triage -> Fix -> Local Tests -> Re-test

只有用户明确批准后，才能进入：

1. 用失败 case 的 `log_id/pod` 确认分支命中情况
2. 确认输入是否真的符合目标场景
3. 找最小业务修复
4. 跑本地测试
5. commit only, no push
6. 部署后复跑相同请求
7. 更新 summary 与 evidence index

## Common Misjudgments

- 外层 `status=success` 就以为业务成功
- `BaseResp.StatusCode=0` 就以为整条链路成功
- 只看一次失败就立刻改代码
- 不保存重试回包，导致无法分辨瞬态问题和稳定问题
- 先盲搜日志，不先从回包提取 `log_id/pod`
- 不看实例日志，只看摘要日志
- 没跑完整个矩阵，就提前宣布结论

## Minimal Example

一个最小 case 至少应有：

- `cases/<case-id>/params.json`
- `cases/<case-id>/<method>_req.json`
- `cases/<case-id>/<method>_try1_out.json`
- `cases/<case-id>/<method>_final_out.json`
- `cases/<case-id>/bundle.md`

一个最小 run 至少应有：

- `manifest.json`
- `exports/assert_report.json`
- `summary/<date-topic>/overview.md`
- `summary/<date-topic>/evidence-index.md`
