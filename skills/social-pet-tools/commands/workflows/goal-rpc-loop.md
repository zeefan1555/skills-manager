# Goal RPC Loop 命令

> **命令类型**：`workflow`
>
> **阶段命令**：`../phases/rpc-goal-clarify.md`、`../phases/rpc-first-pass.md`、`../phases/rpc-gap-loop.md`
>
> **可动态依赖的公有命令**：`../shared/rpc-pod-triage.md`、`../shared/rpc-request-shape-check.md`、`../shared/cds.md`、`../shared/tcc.md`
>
> **参考资料**：`../../references/goal-rpc-loop-example.md`、`../../references/goal-rpc-loop-controller-contract.md`

## 主控架构图

```text
+----------------------+
| 用户宏观 RPC 预期     |
+----------------------+
           |
           v
+-------------------------------+
| goal-rpc-loop controller      |
| 初始化 session / 恢复进度      |
+-------------------------------+
           |
           | 派发 phase / shared
           v
+-------------------------------+
| worker 执行当前单轮任务        |
| rpc-goal-clarify              |
| rpc-first-pass                |
| rpc-gap-loop round-N          |
| rpc-pod-triage / rpc-request-shape-check / cds / tcc |
+-------------------------------+
           |
           | 返回 result / 产物
           v
+----------------------------------------------+
| controller 读取返回并先落盘当前态              |
| 更新 manifest / log / progress                |
+----------------------------------------------+
           |
           | 基于当前态分流
           v
+----------------------------------------------+
| NEEDS_NEXT_PHASE / NEEDS_SHARED_ACTION        |
| NEEDS_ANOTHER_ROUND / BLOCKED / CLOSED        |
+----------------------------------------------+
   |                     |                                |
   | 继续派发下一跳        | 暂停等待解除                     | 最终收口
   |                     |                                |
   |                     v                                v
   |      +---------------------------+       +----------------------+
   |      | manifest.status=BLOCKED   |-----> | 02-final-summary.md |
   |      | 可等待，或显式结束本次会话 |  显式收口 | workflow_closed     |
   |      +---------------------------+       +----------------------+
   |                     ^
   +---------------------+
        未终止则继续循环判断
```

主流程永远持有下一跳决策权；phase / shared 只执行当前任务，完成后必须返回主流程。

## 定位

这是 `social-pet-tools` 下的主控 workflow。

它不是具体阶段的执行器，而是整次 RPC 验证任务的 controller，负责：

1. 初始化 session 与主流程状态
2. 判断当前应进入哪个阶段
3. 派发 phase / shared 命令
4. 读取各阶段 `result.json` 并决定下一跳
5. 在真正闭环后统一写入 `02-final-summary.md`

## 适用场景

当用户给出的信息还比较粗，例如：

- “我预期这个功能应该这样工作”
- “你帮我按目标把这个 RPC 功能验证一下”
- “我只知道大概输入输出，你帮我从 0 到 1 跑一遍”

就优先进入 `goal-rpc-loop`。

## 控制权模型

- `goal-rpc-loop` 永远持有下一跳决策权
- `rpc-goal-clarify`、`rpc-first-pass`、`rpc-gap-loop` 只负责当前阶段执行
- `rpc-pod-triage`、`rpc-request-shape-check`、`cds`、`tcc` 是临时借用能力，执行后回到主流程
- phase worker 不得自行进入下一个 phase

## 主流程状态机

- `INIT`：session 已创建，尚未派发阶段
- `IN_PROGRESS`：主流程正在推进
- `WAIT_SHARED`：当前需要先借用 shared 命令
- `BLOCKED`：当前流程暂时无法继续推进，等待解除或由主流程显式结束本次会话
- `CLOSED`：`02-final-summary.md` 已写完

## 强制目录规范

每次任务必须先创建一个 session 目录：

```text
docs/social-pet/<YYYY-MM-DD>-<topic>/
├── manifest.json
└── goal-rpc-loop/
    ├── 00-raw-expectation.md
    ├── 01-plan.md
    ├── controller-log.jsonl
    ├── 02-final-summary.md
    ├── 03-progress.md
    ├── rpc-goal-clarify/
    │   └── result.json
    ├── rpc-first-pass/
    │   └── result.json
    └── rpc-gap-loop/
        └── round-*/result.json
```

## 主流程执行步骤

### 第 0 步：检查最近可复用命令并优先复用

正式开始前，先检查最近一次或最近几次同类目标的 session 产物，优先复用已经验证有效的命令、参数模板、排查顺序和结论骨架，而不是重新从 0 组织。

最低检查范围：

- 最近同类目标的 `manifest.json`
- 最近一次可复用 round 的 `index.json`
- 最近一次可复用 round 的 `commands/`、`requests/`、`responses/`、`verdict.md`
- 最近一次 `02-final-summary.md` 里的收敛结论
- `references/recent-command-reuse.md`

复用时要遵守：

- 只复用已经在真实调用中验证过的命令和参数模板
- 发现环境、配置、目标对象已经变化时，先标注失效点，再决定局部改写
- 能沿用已有命令时，优先沿用，不要重复造轮子
- 复用的是“最近已验证证据”，不是“最近一次口头猜测”

### 第 1 步：初始化 session

- 创建 `docs/social-pet/<YYYY-MM-DD>-<topic>/`
- 写入 `goal-rpc-loop/00-raw-expectation.md`
- 写入 `goal-rpc-loop/01-plan.md`
- 初始化 `goal-rpc-loop/controller-log.jsonl`
- 初始化 `goal-rpc-loop/03-progress.md`
- 初始化 `manifest.json`

### 第 2 步：恢复最近进度并判断当前阶段

优先读取：

1. `manifest.json`
2. `goal-rpc-loop/controller-log.jsonl`
3. 最近一次 phase 的 `result.json`
4. 最近一次 `rpc-gap-loop/round-*/result.json`
5. `goal-rpc-loop/03-progress.md`
6. `goal-rpc-loop/02-final-summary.md`

### 第 3 步：派发当前阶段命令

- 还不知道请求怎么构造 -> `rpc-goal-clarify`
- 请求已经基本清楚，需要打第一轮真实 RPC -> `rpc-first-pass`
- 第一轮已经跑完，发现结果和预期不一致 -> `rpc-gap-loop`

### 第 4 步：读取阶段结果

- 主流程必须读取阶段目录下的 `result.json`
- 若缺少 `result.json`，视为该阶段未完成
- 阶段只能返回建议，不能替主流程决定下一跳
- 主流程要把关键请求/响应观测补写为 `controller-log.jsonl` 的 `request_observed` 事件

### 第 5 步：依据阶段状态分流

- 每次读取阶段返回后，主流程必须先落盘当前态：先更新 `manifest.json`、追加 `controller-log.jsonl`、刷新 `03-progress.md`，再决定下一跳
- `NEEDS_NEXT_PHASE` -> 进入下一阶段
- `NEEDS_SHARED_ACTION` -> 先派 shared 命令
- 当当前阻塞点是“请求形态是否正确”时，优先派 `rpc-request-shape-check`，不要直接跳到版本或日志排查
- `NEEDS_ANOTHER_ROUND` -> 再派一轮 `rpc-gap-loop`
- `BLOCKED` -> 主流程先停在 `BLOCKED`；只有显式决定结束本次会话时，才写 Final Summary 并进入 `CLOSED`
- `CLOSED` -> 进入最终收口
- `BLOCKED` 只表示当前轮无法继续推进，不等于已经关闭 workflow；只有显式决定本次就此收口时，才进入最终总结并追加 `workflow_closed`

### 第 6 步：统一写最终总结

只有主流程可以写 `goal-rpc-loop/02-final-summary.md`

## 最近进度参考规则

当不是全新问题，而是延续最近一轮验证、修复后回归、或同类目标复查时，必须先参考最近进度，再决定下一步。

优先参考顺序：

1. 最近一次同主题 session 的 `manifest.json`
2. 最近一次已完成阶段的产物目录
3. 最近一次可复用 round 的 `index.json` 与 `verdict.md`
4. 最近一次 `02-final-summary.md`

参考时要做到：

1. 先判断上次停在哪个阶段、当前是否应该续跑还是重开
2. 先继承已确认有效的前提、命令和观察结果，再补新的差异
3. 在新的计划或阶段产物里写清楚哪些内容是沿用的，哪些内容需要重跑验证
4. 不要把“上次的猜测”当成“这次的事实”，所有关键结论仍要以当前轮证据为准

## Manifest 更新规则

- 每次派发前更新 `manifest.json.current_phase`
- 每次阶段完成后把 `result.json` 记录进 `phase_history`
- 每次 shared 完成后把结果记录进 `shared_history`
- 只有主流程可以更新：
  - `status`
  - `next_recommendation`
  - `final_verdict`
  - `final_summary_ready`

## 主流程日志规则

- 主流程唯一过程账本是 `goal-rpc-loop/controller-log.jsonl`，格式为 JSON Lines，只允许按时间顺序追加，不允许回写历史事件
- 只有 `goal-rpc-loop` controller 可以写 `controller-log.jsonl`；phase / shared worker 不直接写这份日志
- session 初始化完成后写 `session_initialized`；每次派发前后写 `phase_dispatched` / `shared_dispatched`，每次读取返回后写 `phase_returned` / `shared_returned`
- 关键请求、响应、证据路径由主流程统一补写成 `request_observed` 事件，避免事实散落在各阶段正文中无法统一审计
- controller 基于返回结果完成下一跳判断时，必须追加 `decision_made` 事件，并显式写出 `decision`、`why`、`current_hypothesis`、`alternatives_considered`、`next_action`
- 写出或重写 `02-final-summary.md` 后追加 `final_summary_written`；只有 workflow 进入终止态时才追加 `workflow_closed`
- 若以阻塞结论显式结束本次会话，主流程仍应先从 `BLOCKED` 转入 `CLOSED`，再写 `workflow_closed`；此时 `final_verdict=BLOCKED`
- 每条事件都要维护严格递增的 `sequence`，并带上当时的 `controller_state`、`current_phase`；`manifest.json` 只保留当前态，不替代完整日志

## Final Summary 归并规则

- `goal-rpc-loop/02-final-summary.md` 只能由主流程写或重写，phase / shared worker 只能提供归并素材，不能直接落最终结论
- 归并输入至少包括：`manifest.json` 当前态、`controller-log.jsonl`、最近有效的 phase `result.json`、shared 产物、`rpc-gap-loop` 各轮 `result.json`；若存在 `closeout.md`，可作为补充输入参与归并
- 归并时优先采用最近一条未被 `SUPERSEDED` 的证据链与轮次结论；旧轮次若已被推翻，只能作为背景，不得继续当成最终事实
- 同一事实若同时出现在 phase 文档、shared 产物和主流程日志中，以带证据路径的主流程事件为准，并按证据路径去重
- Final Summary 要明确区分：已确认结论、仍未解决问题、阻塞原因、后续建议，不把“当前猜测”写成“最终结论”
- 只有在主流程确认状态为 `CLOSED`，或显式决定以阻塞结论结束本次会话并把状态转到 `CLOSED` 时，才允许写 Final Summary
- 若以阻塞结论结束，写 `manifest.json.final_verdict=BLOCKED`，同时把 `manifest.json.status` 从 `BLOCKED` 更新为 `CLOSED`
- 写完后同步更新 `manifest.json.final_summary_ready`

## 进度板规则

- `goal-rpc-loop/03-progress.md` 是给人读的当前态看板，不替代 `manifest.json` 和 `controller-log.jsonl`
- 每次 `decision_made` 后至少更新一次；若主流程进入 `WAIT_SHARED`、`BLOCKED`、`CLOSED`，必须同步刷新
- 进度板内容必须与 `manifest.json` 当前态一致，并能和 `controller-log.jsonl` 最近事件互相印证，禁止手写与日志脱节的平行叙事
- `current hypothesis` 的唯一来源固定为 `manifest.json.current_hypothesis`；若最近一次 `decision_made` 更新了假设，必须先回写 `manifest.json`，再刷新进度板，禁止直接摘抄 phase 文档或自由改写
- 允许覆盖重写，但至少保留这些块：当前 topic / session、controller status、current phase、current hypothesis、latest decision、next action、completed、open questions、key artifacts
- 进度板应优先引用最近事件序号和关键产物路径，帮助下一位接手者快速定位证据，而不是复述长篇过程细节

## Shared 命令返回规则

- `rpc-pod-triage`、`rpc-request-shape-check`、`cds`、`tcc` 完成后，不直接决定下一 phase
- shared 只返回当前阻塞是否解除、证据路径和建议动作
- 主流程必须重新判断是回到 `rpc-goal-clarify`、重跑 `rpc-first-pass` 还是继续 `rpc-gap-loop`

## 多开任务复用建议

当同时有多个相近目标需要推进时，优先复用最近已经验证有效的命令、排查顺序和公共结论，减少重复试错。

建议做法：

- 相同模块、相同环境、相同调用入口的任务，优先复用同一套命令模板
- 相同类型的问题，优先复用已经确认有效的排查顺序
- 公共配置判断可以复用，但每个目标的最终结论、差异说明和收敛状态必须单独落盘
- 如果多开任务之间出现前提冲突，立即停止盲目复用，回到各自目标重新校验

具体操作细则与目录示例，优先参考：

- `references/recent-command-reuse.md`
- `references/rpc-evidence-template.md`

## 完成条件

只有同时满足下面条件，`goal-rpc-loop` 才算结束：

1. 已创建 session 目录并按规范落盘
2. 已至少完成一个 phase worker，并生成对应 `result.json`
3. 当前状态已明确为下一阶段、下一轮、shared 分支、阻塞或关闭
4. `goal-rpc-loop/controller-log.jsonl` 已记录完整主流程关键事件
5. `goal-rpc-loop/03-progress.md` 已与最近一次决策保持一致
6. `manifest.json.status` 已更新到最终状态
7. `goal-rpc-loop/02-final-summary.md` 已由主流程统一写出
