# Goal RPC Loop 命令

> **命令类型**：`workflow`
>
> **阶段命令**：`../phases/rpc-goal-clarify.md`、`../phases/rpc-first-pass.md`、`../phases/rpc-gap-loop.md`
>
> **可动态依赖的公有命令**：`../shared/rpc-pod-triage.md`、`../shared/cds.md`、`../shared/tcc.md`
>
> **参考资料**：`../../references/goal-rpc-loop-example.md`

## 定位

这是 `social-pet-tools` 下的主流程命令。

它不负责包办所有细节，而是负责：

1. 接收用户的宏观 RPC 预期
2. 判断当前处于哪一个阶段
3. 创建并维护整次验证的目录结构
4. 把任务路由到对应阶段命令
5. 在需要时动态借用 `shared/` 下的通用能力
6. 确保所有阶段产物都按统一规范落盘

## 适用场景

当用户给出的信息还比较粗，例如：

- “我预期这个功能应该这样工作”
- “你帮我按目标把这个 RPC 功能验证一下”
- “我只知道大概输入输出，你帮我从 0 到 1 跑一遍”

就优先进入 `goal-rpc-loop`。

## 核心原则

不要直接从请求开始。

先从目标开始，再按阶段推进：

1. 澄清目标
2. 设计第一轮请求
3. 跑第一轮真实调用
4. 如果结果不对，再进入差异闭环
5. 最后再收敛成结论

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
    ├── rpc-first-pass/
    └── rpc-gap-loop/
```

## 固定执行顺序

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

### 第 1 步：记录原始预期

先把用户原始预期写到：

- `goal-rpc-loop/00-raw-expectation.md`

### 第 2 步：写计划

计划写到：

- `goal-rpc-loop/01-plan.md`

格式固定为：

```text
1. [步骤] -> 验证：[检查项]
2. [步骤] -> 验证：[检查项]
3. [步骤] -> 验证：[检查项]
```

### 第 3 步：判断当前应进入哪个阶段

- 还不知道请求怎么构造 -> `rpc-goal-clarify`
- 请求已经基本清楚，需要打第一轮真实 RPC -> `rpc-first-pass`
- 第一轮已经跑完，发现结果和预期不一致 -> `rpc-gap-loop`

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

## 和其他命令的动态衔接

在阶段内部，允许再动态调用其他公有命令：

- 需要 pod / instance 日志 -> `rpc-pod-triage`
- 需要 CDS / Excel 配置修正 -> `cds`
- 需要 TCC / 白名单 / 开关修正 -> `tcc`

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
2. 已至少完成一个阶段命令
3. 当前状态已明确是继续下一阶段、继续下一轮，或最终关闭
4. `02-final-summary.md` 已在真正闭环后写出
