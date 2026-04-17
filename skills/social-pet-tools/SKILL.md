---
name: social-pet-tools
description: Use when tasks involve social_pet local tests, ppe config modify, TCC update/deploy, RPC acceptance, RPC pod triage, RPC verify loops, or social-pet oncall handling. Routes through command docs and keeps legacy skills unchanged.
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
- 用 `bytedcli` 做 `social_pet` 相关 TCC 修改与发布
- 做 RPC 黑盒验收、回归验证、修复后复测
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
│   ├── config-modify.md
│   ├── local-test.md
│   ├── oncall.md
│   ├── rpc-acceptance.md
│   ├── rpc-pod-triage.md
│   ├── rpc-verify.md
│   ├── rpc-verify-spec.md
│   └── tcc.md
└── references/
    ├── conventions.md
    └── mapping.md
```

目标结构会采用 router skill 的通用分层：

- `SKILL.md`：统一入口、触发条件、命令路由、加载规则
- `commands/`：按命令拆分的操作文档
- `references/`：跨命令共用约束、兼容映射和补充说明

## 加载规则

- 先读取本文件，判断当前任务是否属于 `social_pet` 聚合路由范围
- 优先依据显式命令或语义意图选择目标命令
- 命中命令后，只按需读取对应的 `commands/*.md`
- 涉及跨命令公共规则时，再读取 `references/conventions.md`
- 需要确认旧 skill 对照关系或回退兼容时，再读取 `references/mapping.md`
- 如果当前命令需要更深模板、refs 或实战细节，再回退到 `references/mapping.md` 中对应的旧 skill

## 全局执行规则

- 只在 `social_pet` 相关上下文中使用，不要泛化到其他仓库
- 人类可读结论默认用中文；命令、参数、路径、RPC 名保持原文
- 长链路任务必须保留证据文件路径，避免只在终端口头总结
- 优先最小改动、最小请求体、最短排障路径，不扩写无关流程
- 聚合层不改写旧 skill 的历史约束；如有差异，以旧 skill 的原始细节为准
- 对空白或未沉淀完成的子域，不要虚构流程或模板
- 每次任务的全部子命令产物（请求体、回包、AI 判定）统一落盘到仓库 `docs/social-pet/<date-topic>/` 下，按子命令分子目录；执行 Agent 写 `verdict.md`，审核 Agent 写 `review.md`；详见 `references/conventions.md` "证据落盘路径规范（AI 审计目录）"
- `rpc-verify-spec` 只生成验证文档、预期返回和断言，不执行真实 `rpc-call`

详细公共约束见：

- `references/conventions.md`

## 命令路由

### 显式命令

| 用户输入 | 路由目标 | 兼容旧 skill |
|---|---|---|
| `local-test` | `commands/local-test.md` | `social-pet-local-test` |
| `config-modify` | `commands/config-modify.md` | `social-pet-config-modify` |
| `tcc` | `commands/tcc.md` | `social-pet-config-modify` |
| `rpc-acceptance` | `commands/rpc-acceptance.md` | `social-pet-rpc-acceptance-loop` |
| `rpc-pod-triage` | `commands/rpc-pod-triage.md` | `social-pet-rpc-pod-triage` |
| `rpc-verify` | `commands/rpc-verify.md` | `social-pet-rpc-verify-loop` |
| `rpc-verify-spec` | `commands/rpc-verify-spec.md` | `aggregate-native` |
| `oncall` | `commands/oncall.md` | `social-pet-oncall` |

### 语义路由

| 用户意图 | 优先命令 |
|---|---|
| “跑一下 social_pet 本地单测” | `local-test` |
| “帮我改 ppe 的 social_pet 配置” | `config-modify` |
| “帮我改 TCC 并发布” | `tcc` |
| “用 bytedcli 更新 TCC” | `tcc` |
| “帮我做一轮 RPC 黑盒验收” | `rpc-acceptance` |
| “按 pod 日志链路排查这次请求” | `rpc-pod-triage` |
| “改完代码后帮我继续 RPC 验证” | `rpc-verify` |
| “帮我把受影响接口的预期返回和断言梳理成文档” | `rpc-verify-spec` |
| “不打 rpc-call，只生成每个接口的验证文档” | `rpc-verify-spec` |
| “给你改动点和预期结果，输出每个接口的请求、返回、断言” | `rpc-verify-spec` |
| “处理 social-pet oncall 事务” | `oncall` |

## 兼容性说明

- 旧 skill 保持不变，仍然可以被直接触发
- 新聚合层的目标是统一入口，不是替换历史资产
- 当新命令文档与旧 skill 同时存在时，优先走 `social-pet-tools` 的路由入口
- 当新命令文档需要更深模板或实战细节时，按 `references/mapping.md` 回退到旧 skill

## References

- `references/conventions.md`
- `references/mapping.md`
