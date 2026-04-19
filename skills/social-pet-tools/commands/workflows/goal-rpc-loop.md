# Goal RPC Loop 命令

> **命令类型**：`workflow`
>
> **阶段命令**：`../phases/rpc-goal-clarify.md`、`../phases/rpc-first-pass.md`、`../phases/rpc-gap-loop.md`
>
> **可动态依赖的公有命令**：`../shared/rpc-pod-triage.md`、`../shared/cds.md`、`../shared/tcc.md`
>
> **参考资料**：`../../references/goal-rpc-loop-example.md`、`../../references/goal-rpc-loop-controller-contract.md`

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
- `rpc-pod-triage`、`cds`、`tcc` 是临时借用能力，执行后回到主流程
- phase worker 不得自行进入下一个 phase

## 主流程状态机

- `INIT`：session 已创建，尚未派发阶段
- `IN_PROGRESS`：主流程正在推进
- `WAIT_SHARED`：当前需要先借用 shared 命令
- `BLOCKED`：当前流程无法继续推进
- `CLOSED`：`02-final-summary.md` 已写完

## 强制目录规范

每次任务必须先创建一个 session 目录：

```text
docs/social-pet/<YYYY-MM-DD>-<topic>/
├── manifest.json
└── goal-rpc-loop/
    ├── 00-raw-expectation.md
    ├── 01-plan.md
    ├── 02-final-summary.md
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
- 初始化 `manifest.json`

### 第 2 步：恢复最近进度并判断当前阶段

优先读取：

1. `manifest.json`
2. 最近一次 phase 的 `result.json`
3. 最近一次 `rpc-gap-loop/round-*/result.json`
4. `goal-rpc-loop/02-final-summary.md`

### 第 3 步：派发当前阶段命令

- 还不知道请求怎么构造 -> `rpc-goal-clarify`
- 请求已经基本清楚，需要打第一轮真实 RPC -> `rpc-first-pass`
- 第一轮已经跑完，发现结果和预期不一致 -> `rpc-gap-loop`

### 第 4 步：读取阶段结果

- 主流程必须读取阶段目录下的 `result.json`
- 若缺少 `result.json`，视为该阶段未完成
- 阶段只能返回建议，不能替主流程决定下一跳

### 第 5 步：依据阶段状态分流

- `NEEDS_NEXT_PHASE` -> 进入下一阶段
- `NEEDS_SHARED_ACTION` -> 先派 shared 命令
- `NEEDS_ANOTHER_ROUND` -> 再派一轮 `rpc-gap-loop`
- `BLOCKED` -> 主流程停在 `BLOCKED`
- `CLOSED` -> 进入最终收口

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

## Shared 命令返回规则

- `rpc-pod-triage`、`cds`、`tcc` 完成后，不直接决定下一 phase
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
4. `manifest.json.status` 已更新到最终状态
5. `goal-rpc-loop/02-final-summary.md` 已由主流程统一写出
