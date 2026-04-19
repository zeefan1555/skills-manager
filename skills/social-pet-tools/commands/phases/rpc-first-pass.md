# RPC First Pass 命令

> **命令类型**：`phase`
>
> **所属主流程**：`goal-rpc-loop`
>
> **阶段定位**：`goal-rpc-loop` 的阶段 2：第一轮真实执行

## 定位

这是 **阶段 2：第一轮真实执行**。

它负责：

1. 按 `rpc-goal-clarify` 产出的请求候选执行第一轮 RPC
2. 保存请求、返回、`log_id`
3. 给出第一轮初判

## 输入

来自：

- `goal-rpc-loop/rpc-goal-clarify/affected-rpcs.md`
- `goal-rpc-loop/rpc-goal-clarify/request-derivation.md`

## 主流程传入内容

主流程在派发本阶段时，至少要给出：

- 当前 session 路径
- `rpc-goal-clarify/affected-rpcs.md`
- `rpc-goal-clarify/request-derivation.md`
- 当前最小目标：打出第一轮真实请求并拿到事实
- 当前边界：第一轮先拿事实，不在本阶段做多轮归因

## 输出目录

固定输出到：

```text
goal-rpc-loop/rpc-first-pass/
├── requests/
├── responses/
├── logs/
├── verdict.md
└── result.json
```

## 各目录职责

- `requests/`
  - 第一轮请求 JSON
- `responses/`
  - 第一轮返回 JSON
- `logs/`
  - `log_id`、必要日志、补充链路信息
- `verdict.md`
  - 第一轮判断：哪些通过、哪些未知、下一步往哪走
- `result.json`
  - 返回给主流程的结构化阶段结果

## 任务目标

第一轮的目标不是“把所有问题都查清楚”，而是：

1. 让真实请求打出去
2. 拿到第一批事实
3. 判断哪些点已通过、哪些点需要继续 gap loop

## 执行步骤

1. 按顺序执行第一轮请求
2. 每个请求都保存 req / resp / `log_id`
3. 优先看关键字段，不先纠缠所有细节
4. 在 `verdict.md` 中标记：
   - `PASS`
   - `UNKNOWN`
   - `EXPECTED_DIFF`
   - `FAIL`

## 首轮分流判断规则

- 如果第一轮证据已足够证明结果符合预期，返回 `CLOSED`
- 如果结果与预期存在差异，但可继续做最小归因，返回 `NEEDS_ANOTHER_ROUND`
- 如果已确认需要日志、CDS 或 TCC 支持，返回 `NEEDS_SHARED_ACTION`
- 如果请求无法继续执行，且暂无可行 shared 动作，返回 `BLOCKED`

## 返回协议

本阶段完成后必须写 `goal-rpc-loop/rpc-first-pass/result.json`，至少包含：

```json
{
  "phase": "rpc-first-pass",
  "status": "NEEDS_ANOTHER_ROUND",
  "artifacts_written": [
    "goal-rpc-loop/rpc-first-pass/verdict.md"
  ],
  "key_findings": [
    "第一轮请求已打出，拿到了 req/resp/log_id"
  ],
  "open_questions": [
    "差异是否由配置未生效导致"
  ],
  "shared_command_needed": "none",
  "next_recommendation": "rpc-gap-loop",
  "summary_input": [
    "第一轮已完成，存在待解释差异"
  ]
}
```

## 完成条件

只有同时满足下面条件，才算 `rpc-first-pass` 完成：

1. 第一轮关键请求都已落盘
2. 每个请求都至少有 req / resp / `log_id`
3. `verdict.md` 已明确本轮观察结果
4. `result.json` 已明确返回状态
5. 是否关闭、是否进入下一轮、是否切 shared，均由主流程决定
