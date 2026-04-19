# Goal RPC Loop Controller Contract

## 定位

本文件定义 `goal-rpc-loop` 的控制面协议：

- 主流程 `goal-rpc-loop` 是唯一 controller
- `rpc-goal-clarify`、`rpc-first-pass`、`rpc-gap-loop` 是 phase worker
- `rpc-pod-triage`、`cds`、`tcc` 是 shared worker
- 所有 worker 完成后都必须把控制权交回主流程

## 主流程状态

- `INIT`
- `IN_PROGRESS`
- `WAIT_SHARED`
- `BLOCKED`
- `CLOSED`

## Phase Result Status

- `NEEDS_NEXT_PHASE`
- `NEEDS_SHARED_ACTION`
- `NEEDS_ANOTHER_ROUND`
- `BLOCKED`
- `CLOSED`

## Manifest Template

```json
{
  "workflow": "goal-rpc-loop",
  "topic": "<topic>",
  "session_dir": "docs/social-pet/<YYYY-MM-DD>-<topic>/",
  "status": "INIT",
  "current_phase": "none",
  "phase_history": [],
  "shared_history": [],
  "current_hypothesis": "",
  "next_recommendation": "rpc-goal-clarify",
  "final_verdict": "UNKNOWN",
  "final_summary_ready": false
}
```

## Phase Result Template

```json
{
  "phase": "rpc-goal-clarify",
  "status": "NEEDS_NEXT_PHASE",
  "artifacts_written": [
    "goal-rpc-loop/rpc-goal-clarify/input.md"
  ],
  "key_findings": [
    "已收敛第一轮最小请求候选"
  ],
  "open_questions": [],
  "shared_command_needed": "none",
  "next_recommendation": "rpc-first-pass",
  "summary_input": [
    "原始预期已经转换成接口链路与请求候选"
  ]
}
```

## Controller Log Ledger

`controller-log.jsonl` 是 controller 侧唯一的过程账本，使用 JSON Lines 逐行追加，不允许回写历史事件。

- `manifest.json` 保存当前态，不负责保留完整历史
- `result.json` 保存单个 worker 的阶段返回，不负责串联整个主流程因果链
- `controller-log.jsonl` 负责记录 controller 的派发、返回、请求观测、决策与关闭过程
- `03-progress.md` 与 `02-final-summary.md` 都应优先基于 `controller-log.jsonl` 和对应产物归并生成
- 所有关键请求观测都由主流程补写为 `request_observed` 事件，避免散落在 phase 文档里难以统一审计

## Workflow Integration Note

本文件只定义 controller 事件协议与进度板模板。

- `goal-rpc-loop.md` 负责把 `controller-log.jsonl`、`03-progress.md`、最终 summary 归并规则纳入主流程目录、初始化步骤、循环判断与完成条件
- phase / shared 命令不直接写 `controller-log.jsonl`
- shared 相关事件由 controller 在读取 shared 产物后归纳写入，不要求 shared 命令统一输出专用 `result.json`

## Controller Log Common Envelope

除事件特有字段外，每一行事件都应至少包含以下公共字段：

```json
{
  "ts": "2026-04-19T15:20:00Z",
  "sequence": 7,
  "event_type": "decision_made",
  "workflow": "goal-rpc-loop",
  "session_dir": "docs/social-pet/2026-04-19-widget-config/",
  "controller_state": "IN_PROGRESS",
  "current_phase": "rpc-gap-loop"
}
```

字段要求：

- `ts`：ISO 8601 时间戳，表示事件落盘时刻
- `sequence`：主流程内严格递增的事件序号，用于回放
- `event_type`：事件类型，必须来自下表
- `workflow`：固定为 `goal-rpc-loop`
- `session_dir`：当前任务 session 根目录
- `controller_state`：记录事件发生时的 controller 状态
- `current_phase`：若事件发生在某个 phase 上下文内，则写对应 phase；否则写 `none`

## Controller Event Types

| Event type | 触发时机 | 最少补充字段 |
|---|---|---|
| `session_initialized` | session 目录、`manifest.json`、`01-plan.md` 初始化完成后 | `topic`, `initial_recommendation` |
| `phase_dispatched` | controller 决定派发某个 phase worker 前 | `phase`, `dispatch_reason`, `expected_outputs` |
| `phase_returned` | phase worker 写完 `result.json` 且被 controller 读取后 | `phase`, `result_path`, `result_status`, `next_recommendation` |
| `shared_dispatched` | controller 决定借用 shared worker 前 | `shared_command`, `dispatch_reason`, `blocking_reason` |
| `shared_returned` | shared worker 产物已被 controller 读取后 | `shared_command`, `artifact_paths`, `controller_observation`, `unblocked` |
| `request_observed` | 主流程确认某个 RPC 请求/响应证据被新观测到后 | `source_kind`, `source_worker`, `request_name`, `observation`, `evidence_paths` |
| `decision_made` | controller 基于阶段结果或请求观测完成一次下一跳判断后 | `decision`, `why`, `alternatives_considered`, `next_action` |
| `final_summary_written` | `02-final-summary.md` 写出或重写后 | `summary_path`, `final_verdict` |
| `workflow_closed` | controller 将 `manifest.json.status` 收敛到最终态后 | `final_status`, `closure_reason`, `final_summary_path` |

## Event Templates

### `phase_dispatched`

```json
{
  "ts": "2026-04-19T15:05:00Z",
  "sequence": 2,
  "event_type": "phase_dispatched",
  "workflow": "goal-rpc-loop",
  "session_dir": "docs/social-pet/2026-04-19-widget-config/",
  "controller_state": "IN_PROGRESS",
  "current_phase": "rpc-first-pass",
  "phase": "rpc-first-pass",
  "dispatch_reason": "请求骨架已经明确，需要首轮真实调用验证",
  "input_artifacts": [
    "goal-rpc-loop/rpc-goal-clarify/result.json"
  ],
  "expected_outputs": [
    "goal-rpc-loop/rpc-first-pass/result.json"
  ],
  "boundary_notes": [
    "只执行第一轮真实 RPC，不负责决定是否进入 gap loop"
  ]
}
```

### `phase_returned`

```json
{
  "ts": "2026-04-19T15:08:00Z",
  "sequence": 3,
  "event_type": "phase_returned",
  "workflow": "goal-rpc-loop",
  "session_dir": "docs/social-pet/2026-04-19-widget-config/",
  "controller_state": "IN_PROGRESS",
  "current_phase": "rpc-first-pass",
  "phase": "rpc-first-pass",
  "result_path": "goal-rpc-loop/rpc-first-pass/result.json",
  "result_status": "NEEDS_ANOTHER_ROUND",
  "artifacts_written": [
    "goal-rpc-loop/rpc-first-pass/result.json"
  ],
  "key_findings": [
    "首次调用返回与目标预期不一致"
  ],
  "open_questions": [
    "差异来自配置、请求参数还是后端逻辑"
  ],
  "shared_command_needed": "none",
  "next_recommendation": "rpc-gap-loop"
}
```

### `request_observed`

```json
{
  "ts": "2026-04-19T15:09:30Z",
  "sequence": 4,
  "event_type": "request_observed",
  "workflow": "goal-rpc-loop",
  "session_dir": "docs/social-pet/2026-04-19-widget-config/",
  "controller_state": "IN_PROGRESS",
  "current_phase": "rpc-first-pass",
  "source_kind": "phase",
  "source_worker": "rpc-first-pass",
  "request_name": "GetWidget",
  "observation": "确认首轮真实请求已命中目标接口，响应体缺少预期字段",
  "request_status": "response_mismatch",
  "evidence_paths": [
    "goal-rpc-loop/rpc-first-pass/requests/raw/get-widget.json",
    "goal-rpc-loop/rpc-first-pass/responses/raw/get-widget.json"
  ],
  "related_hypothesis": "疑似配置未生效"
}
```

### `decision_made`

```json
{
  "ts": "2026-04-19T15:10:00Z",
  "sequence": 5,
  "event_type": "decision_made",
  "workflow": "goal-rpc-loop",
  "session_dir": "docs/social-pet/2026-04-19-widget-config/",
  "controller_state": "IN_PROGRESS",
  "current_phase": "rpc-first-pass",
  "decision": "进入 rpc-gap-loop",
  "why": "首轮请求已具备可复现差异，应该围绕最小 gap 做单轮收敛",
  "observed_from": [
    "goal-rpc-loop/rpc-first-pass/result.json",
    "controller-log.jsonl#sequence=4"
  ],
  "current_hypothesis": "问题更像是配置未落到目标实例，而不是请求构造错误",
  "alternatives_considered": [
    {
      "option": "回退到 rpc-goal-clarify",
      "accepted": false,
      "reason": "请求链路已经明确，没有必要重新拆接口"
    },
    {
      "option": "先进入 rpc-gap-loop",
      "accepted": true,
      "reason": "当前最缺的是差异归因证据"
    }
  ],
  "next_action": "dispatch rpc-gap-loop"
}
```

### `workflow_closed`

```json
{
  "ts": "2026-04-19T15:35:00Z",
  "sequence": 12,
  "event_type": "workflow_closed",
  "workflow": "goal-rpc-loop",
  "session_dir": "docs/social-pet/2026-04-19-widget-config/",
  "controller_state": "CLOSED",
  "current_phase": "none",
  "final_status": "CLOSED",
  "final_verdict": "MISMATCH_CONFIRMED",
  "closure_reason": "关键差异已经被复现并归因，最终总结已写出",
  "final_summary_path": "goal-rpc-loop/02-final-summary.md",
  "unresolved_items": [],
  "followup_recommendation": "若需修复，进入独立改动任务，不在本 workflow 内继续循环"
}
```

## Controller Decision Rules

| Phase result | Controller action |
|---|---|
| `NEEDS_NEXT_PHASE` | 派发下一阶段 |
| `NEEDS_SHARED_ACTION` | 先派发指定 shared 命令，再回主流程重判 |
| `NEEDS_ANOTHER_ROUND` | 再派一轮 `rpc-gap-loop` |
| `BLOCKED` | 更新 `manifest.json.status=BLOCKED` 并停止推进 |
| `CLOSED` | 写 `02-final-summary.md` 并关闭 |

## Gap Loop Boundary

- `rpc-gap-loop` 每次只处理一个最小 gap
- 每次只生成一个 `round-N/`
- 完成后必须写 `round-N/result.json`
- 不允许在 phase 内自己无限循环到结束

## `03-progress.md` Template

`03-progress.md` 是给人读的进度看板，不替代 `controller-log.jsonl`。它应从最近事件中提炼当前态、下一步和风险，而不是手写一份与日志脱节的叙述。

更新规则：

- 每次 `decision_made` 后至少更新一次
- 若进入 `WAIT_SHARED`、`BLOCKED`、`CLOSED`，必须同步更新
- 内容应与 `manifest.json` 当前态一致，与 `controller-log.jsonl` 最近事件可互相印证
- 允许覆盖重写，但要保留“最近一次决策”和“下一步动作”两块信息

```md
# Goal RPC Loop Progress

- Topic: `<topic>`
- Session: `docs/social-pet/<YYYY-MM-DD>-<topic>/`
- Controller Status: `IN_PROGRESS`
- Current Phase: `rpc-gap-loop`
- Current Hypothesis: `配置未落到目标实例`
- Last Event Sequence: `5`

## Latest Decision

- Decision: `进入 rpc-gap-loop`
- Why: `首轮真实请求已经复现差异，需要围绕最小 gap 收敛`
- Next Action: `派发 rpc-gap-loop 处理 round-1`

## Completed

- `session_initialized`: 已创建 session、`manifest.json`、`00-raw-expectation.md`、`01-plan.md`
- `phase_dispatched/phase_returned`: 已完成 `rpc-goal-clarify`
- `phase_dispatched/phase_returned`: 已完成 `rpc-first-pass`
- `request_observed`: 已确认 `GetWidget` 响应缺少预期字段

## Open Questions

- 差异是否由配置未发布导致
- 是否需要切换到 `cds` 或 `tcc` 辅助排查

## Key Artifacts

- `manifest.json`
- `controller-log.jsonl`
- `goal-rpc-loop/rpc-first-pass/result.json`
- `goal-rpc-loop/rpc-gap-loop/round-1/`
```
