# RPC Goal Clarify 命令

> **命令类型**：`phase`
>
> **所属主流程**：`goal-rpc-loop`
>
> **阶段定位**：`goal-rpc-loop` 的阶段 1：目标澄清与请求推导

## 定位

这是 **阶段 1：目标澄清与请求推导**。

它负责把用户的宏观预期，收敛成：

1. 场景
2. 接口链路
3. 请求候选
4. 关键断言
5. 待确认问题

## 输入

输入来自主目录：

- `goal-rpc-loop/00-raw-expectation.md`
- `goal-rpc-loop/01-plan.md`

## 主流程传入内容

主流程在派发本阶段时，至少要显式给出：

- 当前 session 路径
- `goal-rpc-loop/00-raw-expectation.md`
- `goal-rpc-loop/01-plan.md`
- 当前最小目标：把宏观预期收敛成可执行请求
- 当前边界：不进入真实 RPC 执行，不直接做 gap 归因

## 输出目录

固定输出到 controller 指定的 phase 目录；默认 session 相对路径为：

```text
goal-rpc-loop/rpc-goal-clarify/
├── input.md
├── affected-rpcs.md
├── request-derivation.md
├── open-questions.md
└── result.json
```

主流程派发时必须同时传入：

- 当前 session 绝对路径
- 当前 phase 输出目录绝对路径
- 允许写入的白名单根目录

硬约束：

- 本阶段所有产物必须直接写入指定 phase 目录
- 不允许先写到 session 外再搬回
- 若产物未落到指定 phase 目录，视为阶段未完成

## 各文件职责

- `input.md`
  - 原始预期的结构化整理
- `affected-rpcs.md`
  - 当前链路涉及哪些接口、顺序是什么
- `request-derivation.md`
  - 从代码、状态、环境推导请求字段
- `open-questions.md`
  - 仍然不确定、需要后续验证的问题
- `result.json`
  - 返回给主流程的结构化阶段结果

## 任务目标

让“我大概知道输入输出”变成“我知道第一轮应该打哪些接口、请求最少需要什么字段”。

## 执行步骤

1. 先整理用户原始预期
2. 识别场景与接口顺序
3. 从代码和状态推导请求字段
4. 写出第一轮请求候选
5. 列出当前还没确认的问题

## 阶段执行边界

- 只负责把预期收敛成第一轮最小请求候选
- 不负责真实 RPC 调用
- 不负责跨轮 gap 闭环
- 若发现需要日志、配置或 TCC 前提，返回主流程决定是否切 shared

## 返回协议

本阶段完成后必须写 `goal-rpc-loop/rpc-goal-clarify/result.json`，至少包含：

```json
{
  "phase": "rpc-goal-clarify",
  "session_root": "docs/social-pet/<YYYY-MM-DD>-<topic>",
  "phase_output_dir": "goal-rpc-loop/rpc-goal-clarify",
  "status": "NEEDS_NEXT_PHASE",
  "artifacts_written": [
    "goal-rpc-loop/rpc-goal-clarify/affected-rpcs.md",
    "goal-rpc-loop/rpc-goal-clarify/request-derivation.md"
  ],
  "acceptance_inputs": [],
  "evidence_links": [],
  "key_findings": [
    "已识别第一轮最小请求候选"
  ],
  "open_questions": [],
  "protocol_check": {
    "all_artifacts_under_session": true
  },
  "shared_command_needed": "none",
  "next_recommendation": "rpc-first-pass",
  "summary_input": [
    "原始预期已转化成接口链路与请求候选"
  ]
}
```

## 完成条件

只有同时满足下面条件，才算 `rpc-goal-clarify` 完成：

1. 已写出接口链路
2. 已写出第一轮最小请求候选
3. 已把不确定点落到 `open-questions.md`
4. 已写出 `result.json`
5. 已明确返回主流程，由主流程决定是否进入 `rpc-first-pass` 或 shared 分支
