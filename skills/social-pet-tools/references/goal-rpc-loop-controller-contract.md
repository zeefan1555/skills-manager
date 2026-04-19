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

- `DONE`
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
