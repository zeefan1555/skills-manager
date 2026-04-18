---
name: social-pet-tools
description: Use when tasks involve social_pet local tests, ppe_* CDS or Excel config changes, TCC update/deploy, RPC acceptance, RPC pod triage, RPC verify loops, or social-pet oncall handling.
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
│   ├── rpc-pod-triage.md
│   ├── rpc-verify.md
│   └── tcc.md
└── references/
    ├── conventions.md
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
| “按 pod 日志链路排查这次请求” | `rpc-pod-triage` |
| “改完代码后帮我继续 RPC 验证” | `rpc-verify` |
| “处理 social-pet oncall 事务” | `oncall` |

## 兼容性说明

- 旧 skill 保持不变，仍然可以被直接触发
- 新聚合层的目标是统一入口，不是替换历史资产
- 当新命令文档需要更深模板或实战细节时，按 `references/mapping.md` 回退到旧 skill

## References

- `references/conventions.md`
- `references/mapping.md`
