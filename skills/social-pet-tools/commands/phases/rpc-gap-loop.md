# RPC Gap Loop 命令

> **命令类型**：`phase`
>
> **所属主流程**：`goal-rpc-loop`
>
> **阶段定位**：`goal-rpc-loop` 的阶段 3：差异闭环

## 定位

这是 **阶段 3：差异闭环** 的单轮 worker。

它负责在主流程给定的“当前最小 gap”下完成一轮 `round-N/` 证据闭环，并把控制权交回 `goal-rpc-loop`。

它不负责在 phase 内无限循环到结束。

如果本轮发现当前最小差异已经明确属于某个 shared 能力，`rpc-gap-loop` 只负责把证据、判断依据和 `shared_command_needed` 写进 `result.json`，由主流程决定是否派发 `rpc-request-shape-check`、`scm-sha-check`、`rpc-pod-triage`、`cds` 或 `tcc`。

本阶段关注的差异通常来自：

1. 请求不对
2. 状态不对
3. 环境 / 配置不对
4. 代码 / 配置语义和原始预期不一致
5. 只是“看起来像 bug”，但没有完整证据链

`rpc-gap-loop` 的核心要求是：**每一轮都必须产出完整证据模型**，让后续任何人只看落盘目录，就能复原：

1. 这一轮做了什么
2. 用了什么命令 / 请求
3. 看到了什么原始返回 / 日志
4. 归一化后得出的事实是什么
5. 最终判定为什么是 `BLOCKED` / `FAIL` / `PASSED` / `SUPERSEDED`

## 输入

默认从首轮结果开始，也可以继续消费前一轮 gap 结果：

- `goal-rpc-loop/rpc-first-pass/verdict.md`
- `goal-rpc-loop/rpc-first-pass/requests/`
- `goal-rpc-loop/rpc-first-pass/responses/`
- `goal-rpc-loop/rpc-first-pass/logs/`
- `goal-rpc-loop/rpc-gap-loop/round-*/`

## 主流程传入内容

主流程在派发本阶段时，至少要给出：

- 当前 session 路径
- 当前要解释的最小 gap
- 可复用的上一轮证据路径
- 当前边界：本轮只追一个最小差异

## 输出目录

固定输出到 controller 指定的 phase 目录；默认 session 相对路径为：

```text
goal-rpc-loop/rpc-gap-loop/
├── round-1/
├── round-2/
├── ...
└── closeout.md
```

主流程派发时必须同时传入：

- 当前 session 绝对路径
- 当前 phase 输出目录绝对路径
- 当前 round 目录绝对路径
- 允许写入的白名单根目录

硬约束：

- 本阶段所有产物必须直接写入指定 `round-N/` 目录
- 不允许先写到 session 外再搬回
- 若产物未落到指定目录，视为本轮未完成

每个 `round-N/` 必须是一个**自解释证据快照**，至少包含：

```text
round-N/
├── commands/
│   ├── raw/
│   └── normalized/
├── requests/
│   ├── raw/
│   └── normalized/
├── responses/
│   ├── raw/
│   └── normalized/
├── logs/
│   ├── raw/
│   └── extracts/
├── index.json
├── verdict.md
└── result.json
```

不允许只保留结论、不保留原始证据；也不允许只保留原始证据、不保留归一化结果。

具体目录示例优先参考：

- `../../references/rpc-evidence-template.md`
- `../../references/recent-command-reuse.md`

## 完整证据模型

### 1. `commands/`

保存这一轮实际执行过的命令、工具调用或关键操作。

- `commands/raw/`：原始命令行、工具入参、stdout、stderr、exit code、执行时间、目标环境
- `commands/normalized/`：归一化后的步骤摘要，例如“查看 pod 日志”“拉取 TCC 配置”“重放 RPC 请求”

要求：

1. 每个关键操作都要有可追溯记录
2. 不能只写“已执行某命令”，要保留可复核的原始内容
3. 如果某轮没有执行 shell 命令，也要记录未执行原因，避免证据断层

### 2. `requests/`

保存这一轮用于验证假设的请求证据。

- `requests/raw/`：原始 RPC / HTTP / 配置查询请求，保留原始 payload、header、query、环境、调用时间
- `requests/normalized/`：归一化后的业务请求视图，例如“用户 A 在环境 X 请求接口 Y，关键参数为 Z”

要求：

1. 原始请求必须可复现
2. 归一化请求必须突出真正影响判断的关键字段
3. 如果本轮是沿用上一轮请求，也要显式写清楚“复用自哪一轮哪一份证据”

### 3. `responses/`

保存这一轮拿到的返回证据。

- `responses/raw/`：原始 RPC / HTTP 返回体、错误码、网关信息、trace 信息
- `responses/normalized/`：归一化后的返回事实，例如“接口返回 success=false，业务错误码为 xxx，资源状态仍为 yyy”

要求：

1. 原始返回不能被人工转述替代
2. 归一化结果必须能直接服务于差异判断
3. 请求与返回需要能在 `index.json` 中建立一一对应关系

### 4. `logs/`

保存这一轮用于解释差异的日志证据。

- `logs/raw/`：原始日志、原始 pod 输出、原始 triage 结果、原始配置读取结果
- `logs/extracts/`：从原始日志中提取出的关键片段与解释性摘录

要求：

1. `raw/` 保存原始上下文，避免只截一两行导致误判
2. `extracts/` 只保留用于支撑当前结论的关键片段，并附简要说明
3. 摘录必须能回指到 `raw/` 的来源

### 5. `index.json`

`index.json` 是这一轮的**证据索引与关系图**，至少要描述：

1. round 编号
2. 当前假设 / 待验证差异点
3. 本轮状态：`BLOCKED` / `FAIL` / `PASSED` / `SUPERSEDED`
4. 本轮引用了哪些 `commands` / `requests` / `responses` / `logs`
5. 每个请求对应哪个响应
6. 哪些日志支撑了哪个判断
7. 本轮是否依赖上一轮证据，依赖链是什么
8. 下一轮是否需要继续，以及继续原因

`index.json` 的目标不是写长文，而是让机器和人都能快速知道“证据有哪些、彼此怎么关联、当前结论是什么”。

### 6. `verdict.md`

`verdict.md` 是这一轮的人类可读结论，至少包含：

1. 本轮要解释的 gap 是什么
2. 本轮采取了哪些动作
3. 本轮得到的关键事实
4. 这些事实支撑什么判断
5. 当前轮状态为什么是 `BLOCKED` / `FAIL` / `PASSED` / `SUPERSEDED`
6. 是否进入下一轮；如果进入，下一轮要验证什么最小问题

## 状态定义

每一轮必须显式使用以下状态之一，不能自造模糊结论：

### `BLOCKED`

表示当前轮**无法继续推进验证**，原因通常是外部阻塞，而不是已经证明功能失败。

典型场景：

- 环境不可用
- 权限不足
- 配置未下发
- 上游依赖缺失
- 关键日志 / 请求 / 返回暂时拿不到

要求：

1. 写清楚阻塞点是什么
2. 写清楚谁能解除阻塞
3. 写清楚解除后下一步最小动作是什么

### `FAIL`

表示当前轮已经有充分证据说明：**当前行为与预期不一致，并且差异已被定位为真实失败**。

典型场景：

- 请求正确，但返回错误
- 配置正确，但代码语义不符合预期
- 状态正确，但最终业务行为仍错误

要求：

1. 说明失败的是哪一层
2. 说明失败证据来自哪些 request / response / log
3. 说明是否需要进入下一轮继续缩小范围

### `PASSED`

表示当前轮已经有充分证据说明：**差异已被解释清楚，且结果满足当前修正后的预期**。

典型场景：

- 修复后复测通过
- 原始误判被澄清
- 预期经过确认后，现有行为被证明是正确的

要求：

1. 说明为什么现在算通过
2. 说明通过依据来自哪些证据
3. 说明原始 gap 是被修复、被澄清，还是预期被修正

### `SUPERSEDED`

表示当前轮的假设、路径或证据集**已被后续更强证据替代**，因此这一轮不再作为最终判断依据。

典型场景：

- 本轮使用了错误请求，后续轮已更正
- 本轮日志窗口不完整，后续轮拿到了更完整日志
- 本轮走错排查方向，后续轮重建了正确假设

要求：

1. 明确说明被哪一轮替代
2. 明确说明替代原因
3. 不允许把 `SUPERSEDED` 当成“写不下去”的逃生口

## 执行步骤

1. 先明确当前 gap：本轮到底要解释哪一个最小差异
2. 建立本轮假设：是请求 / 状态 / 环境 / 配置 / 代码语义中的哪一层
3. 只为当前最小假设采集证据，不做无边界漫游
4. 落盘完整证据模型：
   - `commands/raw` 与 `commands/normalized`
   - `requests/raw` 与 `requests/normalized`
   - `responses/raw` 与 `responses/normalized`
   - `logs/raw` 与 `logs/extracts`
   - `index.json`
   - `verdict.md`
5. 如果当前最小差异已经明确属于 shared 能力，就在 `result.json` 返回 `NEEDS_SHARED_ACTION` 与 `shared_command_needed`，不要在 phase 内直接吞掉控制权
6. 为本轮给出唯一状态：
   - 已被外部阻塞，用 `BLOCKED`
   - 已证明当前行为失败，用 `FAIL`
   - 已证明差异闭环，用 `PASSED`
   - 已被后续轮替代，用 `SUPERSEDED`
7. 如果还没闭环，就在返回里明确下一轮应继承或替代上一轮的哪些证据，由主流程决定是否继续下一轮

## 单轮执行边界

- 一轮只解释一个最小差异
- 一轮只生成一个 `round-N/`
- 一轮结束后必须返回主流程
- 是否继续下一轮由主流程决定
## Shared 分流规则

当 `rpc-gap-loop` 发现本轮最小差异已经明确属于某个 shared 能力时，只返回建议，不在 phase 内直接把 shared 跑完。

优先分流规则：

- 当前阻塞点是“请求 shape 是否正确”时，优先返回 `shared_command_needed=rpc-request-shape-check`，不要直接跳到版本或日志排查
- 当前阻塞点是“线上实例当前版本是否真的包含本地代码”时，优先返回 `shared_command_needed=scm-sha-check`，不要一上来就把现象归因到代码未生效
- 当前已经有请求、回包或 `log_id`，并且需要运行时事实来解释差异时，返回 `shared_command_needed=rpc-pod-triage`
- 当前差异已明确落在配置或开关时，返回 `shared_command_needed=cds` 或 `shared_command_needed=tcc`

phase 在这里给出的只是共享能力建议，不是下一阶段决定。主流程仍需根据 shared 结果重新判断是回到 `rpc-first-pass`、继续 `rpc-gap-loop`，还是进入其他收口路径。


## 返回协议

每轮完成后必须写 `goal-rpc-loop/rpc-gap-loop/round-N/result.json`，至少包含：

```json
{
  "phase": "rpc-gap-loop",
  "session_root": "docs/social-pet/<YYYY-MM-DD>-<topic>",
  "phase_output_dir": "goal-rpc-loop/rpc-gap-loop/round-2",
  "status": "NEEDS_SHARED_ACTION",
  "artifacts_written": [
    "goal-rpc-loop/rpc-gap-loop/round-2/verdict.md",
    "goal-rpc-loop/rpc-gap-loop/round-2/index.json"
  ],
  "acceptance_inputs": [],
  "evidence_links": [],
  "key_findings": [
    "已排除请求参数问题，当前更像配置未生效"
  ],
  "open_questions": [],
  "protocol_check": {
    "all_artifacts_under_session": true
  },
  "shared_command_needed": "cds",
  "next_recommendation": "请主流程先派发 cds，再根据 shared 结果决定是否继续 rpc-gap-loop",
  "summary_input": [
    "本轮已定位到配置层差异"
  ]
}
```

## 轮次约束

### 只追一个最小差异

每一轮只解决一个最小问题，例如：

- “是不是请求参数不对”
- “是不是线上实例版本还没带上这次代码”
- “是不是依赖配置没生效”
- “是不是服务端状态没落库”

不要在同一轮里同时追三个方向，否则证据会混杂，无法复盘。

### 允许复用，但必须显式索引

可以复用上一轮证据，但必须在 `index.json` 和 `verdict.md` 中说明：

1. 复用了哪一轮哪一份证据
2. 为什么复用仍然成立
3. 本轮新增了什么证据

### 允许推翻前轮，但必须标记 `SUPERSEDED`

如果发现上一轮假设错了，不能默默覆盖；必须：

1. 保留上一轮目录
2. 将上一轮视为 `SUPERSEDED`
3. 在新一轮中说明替代关系

## 轮次约束

- 主流程每次只派一轮 `rpc-gap-loop`
- 如果本轮结论不足以关闭差异，返回 `NEEDS_ANOTHER_ROUND`
- 如果本轮需要 shared 能力，返回 `NEEDS_SHARED_ACTION`，并显式写出 `shared_command_needed`
- 如果本轮已足以说明最终结论，返回 `CLOSED`

## closeout.md 的职责

只有当主流程已经确认 gap 不需要继续下一轮时，当前轮才补写 `closeout.md`，用于向主流程提供跨轮总结素材，而不是代替 `03-final-summary.md` 或 `04-acceptance.md`

## 完成条件

只有同时满足下面条件，才算本轮 `rpc-gap-loop` 完成：

1. 已完成一个 `round-N/`
2. 已落盘完整证据模型
3. 已写出 `round-N/result.json`
4. 已明确本轮唯一状态：`NEEDS_ANOTHER_ROUND` / `NEEDS_SHARED_ACTION` / `BLOCKED` / `CLOSED`
5. 已把控制权交回主流程
