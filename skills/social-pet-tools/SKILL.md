---
name: social-pet-tools
description: Use when working in the social_pet workspace on goal-driven RPC verification, goal-driven code implementation, CDS or TCC updates, local tests, request triage, oncall handling, archive writeback, or downstream Go dependency updates.
---

# Social Pet Tools - 统一入口

`social-pet-tools` 是面向 `social_pet` 仓库及其相邻研发动作的聚合路由 skill。

它不把所有细节塞进一个大文档，而是把命令分成三层：

- `workflows/`：主流程命令，负责整次任务编排与收口
- `phases/`：阶段命令，只负责某个 workflow 内的一段
- `shared/`：公有命令，既可独立调用，也可被 workflow 动态依赖

## 适用范围

优先用于以下场景：

- 在 `social_pet` 仓库中跑本地单测或最小验证
- 修改 `ppe_*` 环境下的 `social_pet` CDS / SVN 配置
- 修改 `social_pet` 相关 TCC 配置并发布
- 做 RPC 黑盒验收、回归验证、修复后复测
- 用户只给了较粗的 RPC 预期，需要按“目标澄清 -> 第一轮执行 -> 差异闭环”的阶段方式推进
- 用户给了预期输入输出和 IDL，需要按目标驱动做代码闭环
- 在编码过程中发现当前依赖库缺字段、缺方法或接口签名落后，阻塞本仓开发，需要自动走 Overpass 流程
- 需要按 pod / 实例日志链路做一次请求级排障
- 处理 `social_pet` 相关 oncall 事务
- 需要把已跑通的经验整理、归档或回写

不适用于：

- 非 `social_pet` 仓库的一般 Go / RPC 开发任务
- 与 `social_pet` 无关的 bytedcli / TCE / Feishu 等泛化工作流
- 当前 skill 未沉淀对应命令且没有现成上下文支撑的陌生子域；此时不要虚构流程

## 目录结构

```text
social-pet-tools/
├── SKILL.md
├── commands/
│   ├── workflows/
│   │   ├── goal-rpc-loop.md
│   │   └── goal-code-loop.md
│   ├── phases/
│   │   ├── rpc-goal-clarify.md
│   │   ├── rpc-first-pass.md
│   │   ├── rpc-gap-loop.md
│   │   └── use-superpower.md
│   └── shared/
│       ├── archive.md
│       ├── cds.md
│       ├── local-test.md
│       ├── oncall.md
│       ├── overpass.md
│       ├── rpc-pod-triage.md
│       └── tcc.md
└── references/
    ├── env.md
    ├── goal-rpc-loop-example.md
    ├── goal-rpc-loop-test/
    └── lesson.md
```

## 三层模型

### Workflow 命令

`workflows/` 面向完整目标，负责：

- 接收用户任务
- 判断当前所处阶段
- 动态调用 `phases/` 或 `shared/`
- 维护整次任务的收口逻辑

当前 workflow 命令：

- `goal-rpc-loop`
- `goal-code-loop`

### Phase 命令

`phases/` 只属于某个 workflow 内部阶段。

它们可以被显式调用，但语义上仍然是“主流程的一段”，不负责整次任务收口。

当前 phase 命令：

- `rpc-goal-clarify`
- `rpc-first-pass`
- `rpc-gap-loop`
- `use-superpower`

### Shared 命令

`shared/` 是公有命令。

这类命令既可以被用户直接调用，也可以在 workflow 内被动态依赖。

当前 shared 命令：

- `archive`
- `cds`
- `local-test`
- `oncall`
- `overpass`
- `rpc-pod-triage`
- `tcc`

## 加载规则

- 先读取本文件，判断任务是否属于 `social_pet` 聚合路由范围
- 先判断这是完整目标、阶段任务，还是单点公有能力
- 如果是完整任务，优先进入 `commands/workflows/`
- 如果用户明确点名某个阶段，或主流程已经收敛到阶段内部，再进入 `commands/phases/`
- 如果当前只是需要一个独立能力，或主流程运行中需要借用某个能力，再进入 `commands/shared/`
- 只按需读取目标命令文件，不要一次性展开所有命令
- 涉及环境、固定路径或环境差异时，再读取 `references/env.md`
- 需要复用已沉淀的 RPC 示例、案例过程或经验时，再读取：
  - `references/goal-rpc-loop-example.md`
  - `references/goal-rpc-loop-test/`
  - `references/lesson.md`

## 全局执行规则

以下行为准则适用于整个 `social-pet-tools`。

### 1. 编码前先思考

不要想当然，不要掩盖困惑，要把权衡明确说出来。

在开始实现前：

- 明确写出你的假设；如果不确定，就先问清楚
- 如果存在多种理解方式，要列出来，不要默认挑一种直接做
- 如果有更简单的方案，要主动指出
- 如果有地方不清楚，就先停下来，说明困惑点，并发起澄清

### 2. 简单优先

只写解决问题所需的最少代码，不做任何臆测性扩展。

- 不添加超出需求范围的功能
- 不为一次性代码提前设计抽象
- 不加入未被要求的“灵活性”或“可配置性”
- 不为实际上不可能发生的场景补错误处理
- 如果 50 行能解决，就不要写成 200 行

请始终自问：

**“一个资深工程师会不会觉得这里过度复杂了？”**

如果答案是会，那就继续简化。

### 3. 手术式修改

只改必须改的部分，只清理你自己造成的问题。

在修改现有代码时：

- 不要顺手“优化”相邻代码、注释或格式
- 不要重构那些本来没坏的部分
- 尽量匹配现有风格
- 如果发现了无关死代码，可以提出来，但不要擅自删除

判断标准只有一个：

**每一行变更都应该能直接追溯到用户当前的需求。**

### 4. 以目标驱动执行

先定义成功标准，再持续循环，直到验证通过。

对于多步骤任务，先给出简短计划：

```text
1. [步骤] -> 验证：[检查项]
2. [步骤] -> 验证：[检查项]
3. [步骤] -> 验证：[检查项]
```

长链路任务必须保留证据文件路径，避免只在终端口头总结。

## Workflow 路由

### `goal-rpc-loop`

适用于：

- 用户给的是宏观 RPC 预期
- 用户只知道大概输入输出，希望你一步步推导请求并验证
- 任务需要按“目标澄清 -> 第一轮执行 -> 差异闭环”推进

默认依赖的 phase 命令：

- `rpc-goal-clarify`
- `rpc-first-pass`
- `rpc-gap-loop`

运行过程中可动态依赖的 shared 命令：

- `rpc-pod-triage`
- `cds`
- `tcc`

### `goal-code-loop`

适用于：

- 用户给了预期输入输出，希望你生成代码
- 用户给了 IDL，希望你把 handler / service / model 等代码补出来
- 任务需要从目标出发，通过测试或最小验证闭环收敛
- 实现过程中可能被下游依赖变更阻塞

可显式调用的 phase 命令：

- `use-superpower`

运行过程中可动态依赖的 shared 命令：

- `local-test`
- `overpass`

必要时也可以继续调用：

- `cds`
- `tcc`

## Phase 路由

### `rpc-goal-clarify`

适用于：

- 还不知道请求怎么构造
- 需要先把宏观预期收敛成接口链路、请求候选和断言

### `rpc-first-pass`

适用于：

- 请求已经基本清楚
- 需要先打第一轮真实 RPC 看事实

### `rpc-gap-loop`

适用于：

- 第一轮已执行
- 当前结果与预期不一致
- 需要 round-by-round 地继续归因、重试与关闭

### `use-superpower`

适用于：

- 用户明确说要进入 `goal-code-loop` 的某个编码阶段
- 需要先读阶段注意事项，再调用对应的 SuperPower 技能
- 当前阶段属于 `write-plan` 或 `sub-agent`

## Shared 路由

### `archive`

适用于：

- 需要把本次跑通的经验整理成可复用资产
- 需要沉淀 route、lesson、候选回写内容或 inbox 素材
- 需要把一次执行中的碎片经验收敛成长期知识

### `cds`

适用于：

- 修改 `ppe_*` 下的 `social_pet` CDS / SVN 配置
- 修改 `.xlsx` 配置并提交
- 需要触发测试环境同步

### `local-test`

适用于：

- 需要在 `social_pet` 仓库中做本地构建、单测或最小验证
- 需要用本地测试闭环确认代码行为

### `oncall`

适用于：

- 处理 `social_pet` 相关 oncall 事务
- 需要沿既有 oncall 处理方式做快速分流、排障或收口

### `overpass`

适用于：

- 当前 `social_pet` 开发被下游 Go 依赖库缺字段、缺方法或接口签名落后阻塞
- 需要先去下游仓库改动，再把依赖拉回当前仓库
- 用户明确说“这个字段先去下游加，再拉回来”

默认约束：

- 当前主仓库为 `social_pet`
- 下游仓库根目录固定为 `/Users/bytedance/bytecode`
- 默认读取当前 `social_pet` 分支名
- 在 `/Users/bytedance/bytecode/<repo_name>` 下创建同名 `worktree`
- 在下游完成 `修改 -> push -> 等待 -> go get -> go/pkg/mod 校验`

### `rpc-pod-triage`

适用于：

- 已经有请求、回包或 `log_id`
- 需要串起实例日志、Redis、Mongo 或下游状态来判断根因

### `tcc`

适用于：

- 修改 `social_pet` 相关 TCC 配置
- 需要发布开关、白名单或 JSON 配置

## 显式命令入口

| 用户输入 | 路由目标 |
|---|---|
| `goal-rpc-loop` | `commands/workflows/goal-rpc-loop.md` |
| `goal-code-loop` | `commands/workflows/goal-code-loop.md` |
| `rpc-goal-clarify` | `commands/phases/rpc-goal-clarify.md` |
| `rpc-first-pass` | `commands/phases/rpc-first-pass.md` |
| `rpc-gap-loop` | `commands/phases/rpc-gap-loop.md` |
| `use-superpower` | `commands/phases/use-superpower.md` |
| `archive` | `commands/shared/archive.md` |
| `cds` | `commands/shared/cds.md` |
| `local-test` | `commands/shared/local-test.md` |
| `oncall` | `commands/shared/oncall.md` |
| `overpass` | `commands/shared/overpass.md` |
| `rpc-pod-triage` | `commands/shared/rpc-pod-triage.md` |
| `tcc` | `commands/shared/tcc.md` |

## 语义路由

| 用户意图 | 优先命令 |
|---|---|
| “我给你一份宏观 RPC 预期文档，你帮我一步步推导请求再验证” | `goal-rpc-loop` |
| “先找到请求，再打 RPC，不对就继续循环调试” | `goal-rpc-loop` |
| “按目标驱动做 RPC 验证闭环” | `goal-rpc-loop` |
| “帮我先把宏观 RPC 预期拆成接口链路和请求候选” | `rpc-goal-clarify` |
| “先跑第一轮真实 RPC 看结果” | `rpc-first-pass` |
| “第一轮不对，继续做 gap 闭环” | `rpc-gap-loop` |
| “写计划前先读 SuperPower 注意事项” | `use-superpower` |
| “开始 SubAgent 开发前先读 SuperPower 注意事项” | `use-superpower` |
| “sub-agent” | `use-superpower` |
| “subagent” | `use-superpower` |
| “现在进入 sub-agent 阶段” | `use-superpower` |
| “我给你预期输入输出，你帮我生成代码” | `goal-code-loop` |
| “根据 IDL 和预期输入输出去写代码” | `goal-code-loop` |
| “先写测试再把代码做出来” | `goal-code-loop` |
| “从目标出发，用单测循环把代码做出来” | `goal-code-loop` |
| “跑一下 social_pet 本地单测” | `local-test` |
| “帮我改 ppe 的 cds social_pet 配置” | `cds` |
| “帮我改一个 WidgetCfg.xlsx / Excel 配置并提交” | `cds` |
| “帮我改 TCC 并发布” | `tcc` |
| “按 pod 日志链路排查这次请求” | `rpc-pod-triage` |
| “处理 social-pet oncall 事务” | `oncall` |
| “把这次跑通的经验整理一下” | `archive` |
| “生成一版回写候选补丁” | `archive` |
| “先去下游依赖库加字段，再拉回 social_pet” | `overpass` |
| “当前依赖版本里缺少字段 / 方法，阻塞本仓开发” | `overpass` |

## 动态依赖原则

workflow 可以在执行过程中动态依赖 `shared/` 命令。

判断原则：

1. 如果当前问题仍然属于主任务本身，就留在 workflow 中继续推进
2. 如果当前阻塞点已经明确属于某个公有能力，就切到对应 `shared/` 命令
3. phase 命令只负责阶段内推进，不负责替 workflow 做全局编排
4. shared 命令完成后，应返回原 workflow 继续收口

示例：

- `goal-rpc-loop` 发现是配置问题 -> 调 `cds` 或 `tcc`
- `goal-rpc-loop` 发现需要日志链路定位 -> 调 `rpc-pod-triage`
- `goal-code-loop` 发现依赖库缺字段 -> 调 `overpass`
- `goal-code-loop` 改码后需要验证 -> 调 `local-test`

## References

- `references/env.md`
- `references/goal-rpc-loop-example.md`
- `references/goal-rpc-loop-test/`
- `references/lesson.md`
