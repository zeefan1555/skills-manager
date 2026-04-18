---
name: social-pet-tools
description: Use when tasks involve social_pet local tests, ppe_* CDS or Excel config changes, TCC update/deploy, RPC acceptance, RPC pod triage, RPC verify loops, goal-driven RPC verification, or social-pet oncall handling.
---

# Social Pet Tools - 统一入口

`social-pet-tools` 是面向 `social_pet` 仓库及其相邻运维动作的聚合路由 skill。

本 skill 的职责是：

- 统一识别 `social_pet` 相关任务入口
- 将请求路由到稳定、短命令名的 `commands/*.md`
- 把跨命令共用约束集中到 `references/*.md`
- 保持旧的 `social-pet-*` skill 原样可用，不做覆盖式迁移

## 适用范围

优先用于以下场景：

- 在 `social_pet` 仓库中跑本地单测
- 修改 `ppe_*` 环境下的 `social_pet` CDS / SVN 配置
- 修改 `ppe_*` 下以 `.xlsx` 为载体的配置表，并完成 `svn update -> 修改 -> 校验 -> svn commit` 闭环
- 用 `bytedcli` 做 `social_pet` 相关 TCC 修改与发布
- 做 RPC 黑盒验收、回归验证、修复后复测
- 用户只给了较粗的 RPC 预期文档，需要从代码和运行结果中推导请求并循环验证
- 已有明确请求，按 `request -> response -> log_id/pod -> instance log -> Mongo/Redis` 链路排障
- 处理 `social-pet` oncall 事务

不适用于：

- 非 `social_pet` 仓库的一般 Go / RPC 开发任务
- 与 `social_pet` 无关的 bytedcli / TCE / Feishu 等泛化工作流
- 需要直接复用旧 skill 内部模板或深度步骤，但本聚合层尚未补齐对应 `commands/*.md` 的场景

## 目录结构

```text
social-pet-tools/
├── SKILL.md
├── commands/
│   ├── cds.md
│   ├── local-test.md
│   ├── oncall.md
│   ├── rpc-acceptance.md
│   ├── goal-rpc-loop.md
│   ├── rpc-pod-triage.md
│   ├── rpc-verify.md
│   └── tcc.md
└── references/
    ├── conventions.md
    ├── goal-rpc-loop-example.md
    └── mapping.md
```

## 加载规则

- 先读取本文件，判断当前任务是否属于 `social_pet` 聚合路由范围
- 优先依据显式命令或语义意图选择目标命令
- 命中命令后，只按需读取对应的 `commands/*.md`
- 涉及跨命令公共规则时，再读取 `references/conventions.md`
- 需要确认旧 skill 对照关系或回退兼容时，再读取 `references/mapping.md`
- 如果当前命令需要更深模板、refs 或实战细节，再回退到 `references/mapping.md` 中对应的旧 skill

## 全局执行规则

以下行为准则用于减少 LLM 在编码任务中的常见失误；与项目特定指令并存时，应一并遵循。

**取舍说明：** 这些准则更偏向谨慎而不是速度。对于非常简单的任务，可以结合实际情况判断。

## 1. 编码前先思考

**不要想当然，不要掩盖困惑，要把权衡明确说出来。**

在开始实现前：
- 明确写出你的假设；如果不确定，就先问清楚。
- 如果存在多种理解方式，要把它们列出来，不要默认挑一种直接做。
- 如果有更简单的方案，要主动指出；必要时要对过度实现提出异议。
- 如果有地方不清楚，就先停下来，说明困惑点，并发起澄清。

## 2. 简单优先

**只写解决问题所需的最少代码，不做任何臆测性扩展。**

- 不添加超出需求范围的功能。
- 不为一次性代码提前设计抽象。
- 不加入未被要求的“灵活性”或“可配置性”。
- 不为实际上不可能发生的场景补错误处理。
- 如果你写了 200 行，但其实 50 行就够，就应该重写并简化。

请始终自问：**“一个资深工程师会不会觉得这里过度复杂了？”** 如果答案是会，那就继续简化。

## 3. 手术式修改

**只改必须改的部分，只清理你自己造成的问题。**

在修改现有代码时：
- 不要顺手“优化”相邻代码、注释或格式。
- 不要重构那些本来没坏的部分。
- 尽量匹配现有风格，即使你个人会写得不一样。
- 如果你发现了无关的死代码，可以提出来，但不要擅自删除。

当你的改动产生了遗留项时：
- 只移除那些因为你本次改动而变得无用的 import、变量或函数。
- 不要删除本来就存在的死代码，除非用户明确要求。

判断标准只有一个：**每一行变更都应该能直接追溯到用户当前的需求。**

## 4. 以目标驱动执行

**先定义成功标准，再持续循环，直到验证通过。**

要把任务改写成可验证的目标：
- “增加校验” → “先写出非法输入的测试，再让测试通过”
- “修复这个 bug” → “先写出能复现问题的测试，再让测试通过”
- “重构 X” → “确保重构前后测试都通过”

对于多步骤任务，先给出简短计划：
```
1. [步骤] → 验证：[检查项]
2. [步骤] → 验证：[检查项]
3. [步骤] → 验证：[检查项]
```

强成功标准意味着你可以独立闭环推进；弱成功标准，比如“把它弄好”，只会导致你不断需要回头确认。

---

**当这些准则真正发挥作用时，会出现这些结果：** diff 里无关改动更少，因为过度复杂而返工的情况更少，而且澄清问题会出现在实现之前，而不是出错之后。

- 只在 `social_pet` 相关上下文中使用，不要泛化到其他仓库
- 人类可读结论默认用中文；命令、参数、路径、RPC 名保持原文
- 长链路任务必须保留证据文件路径，避免只在终端口头总结
- 优先最小改动、最小请求体、最短排障路径，不扩写无关流程
- 聚合层不改写旧 skill 的历史约束；如有差异，以旧 skill 的原始细节为准
- 对空白或未沉淀完成的子域，不要虚构流程或模板

## CDS / Excel 快速路径

当 `cds` 场景命中的是 `.xlsx` 配置文件时，默认目标是“最快完成正确修改并提交”。

- `.xlsx` 在 `svn diff` 中通常只会显示 binary diff，因此必须补“读回校验 + `svn status`”证据。
- 默认直接走 `python + openpyxl`，避免先走一轮别的工具再回退。
- 列移动 / 列插入 / 字段顺序调整场景，必须同时校验：位置、值、样式。
- `.bak`、`~$*.xlsx` 等临时产物不能进入提交范围；提交前必须显式检查 `svn status`。

## 命令路由

### 显式命令

| 用户输入 | 路由目标 | 兼容旧 skill |
|---|---|---|
| `local-test` | `commands/local-test.md` | `social-pet-local-test` |
| `cds` | `commands/cds.md` | `social-pet-config-modify` |
| `config-modify` | `commands/cds.md` | `social-pet-config-modify` |
| `tcc` | `commands/tcc.md` | `social-pet-config-modify` |
| `rpc-acceptance` | `commands/rpc-acceptance.md` | `social-pet-rpc-acceptance-loop` |
| `goal-rpc-loop` | `commands/goal-rpc-loop.md` | `rpc-goal-loop` |
| `rpc-pod-triage` | `commands/rpc-pod-triage.md` | `social-pet-rpc-pod-triage` |
| `rpc-verify` | `commands/rpc-verify.md` | `social-pet-rpc-verify-loop` |
| `oncall` | `commands/oncall.md` | `social-pet-oncall` |

### 语义路由

| 用户意图 | 优先命令 |
|---|---|
| “跑一下 social_pet 本地单测” | `local-test` |
| “帮我改 ppe 的 cds social_pet 配置” | `cds` |
| “帮我改一个 WidgetCfg.xlsx / Excel 配置并提交” | `cds` |
| “测试一下 cds 技能” | `cds` |
| “帮我改 TCC 并发布” | `tcc` |
| “用 bytedcli 更新 TCC” | `tcc` |
| “帮我做一轮 RPC 黑盒验收” | `rpc-acceptance` |
| “我给你一份宏观 RPC 预期文档，你帮我一步步推导请求再验证” | `goal-rpc-loop` |
| “先找到请求，再打 RPC，不对就继续循环调试” | `goal-rpc-loop` |
| “按目标驱动做 RPC 验证闭环” | `goal-rpc-loop` |
| “按 pod 日志链路排查这次请求” | `rpc-pod-triage` |
| “改完代码后帮我继续 RPC 验证” | `rpc-verify` |
| “处理 social-pet oncall 事务” | `oncall` |

## 兼容性说明

- 旧 skill 保持不变，仍然可以被直接触发
- 新聚合层的目标是统一入口，不是替换历史资产
- 当新命令文档需要更深模板或实战细节时，按 `references/mapping.md` 回退到旧 skill

## References

- `references/conventions.md`
- `references/goal-rpc-loop-example.md`
- `references/mapping.md`
