# Social Pet Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建一个 `social-pet-tools` 聚合 skill，用主 `SKILL.md` 做路由，把现有全部 `social-pet-*` 能力收敛成 `commands/*.md` 命令文档，同时保持原 skill 完全不变。

**Architecture:** 采用“聚合路由层 + 命令文档层 + 公共 references 层”三层结构。`social-pet-tools/SKILL.md` 负责触发条件、显式命令、语义路由和全局约束；`commands/*.md` 分别承接 `config-modify`、`local-test`、`rpc-*` 与 `oncall`；`references/*.md` 集中保存跨命令约束和新旧 skill 映射，避免重复定义。

**Tech Stack:** Markdown skill docs, `apply_patch`, file reads, diagnostics, parallel subagents

---

### Task 1: 建立聚合目录骨架

**Files:**
- Create: `skills/social-pet-tools/SKILL.md`
- Create: `skills/social-pet-tools/commands/config-modify.md`
- Create: `skills/social-pet-tools/commands/local-test.md`
- Create: `skills/social-pet-tools/commands/oncall.md`
- Create: `skills/social-pet-tools/commands/rpc-acceptance.md`
- Create: `skills/social-pet-tools/commands/rpc-pod-triage.md`
- Create: `skills/social-pet-tools/commands/rpc-verify.md`
- Create: `skills/social-pet-tools/references/conventions.md`
- Create: `skills/social-pet-tools/references/mapping.md`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p /Users/bytedance/.skills-manager/skills/social-pet-tools/commands
mkdir -p /Users/bytedance/.skills-manager/skills/social-pet-tools/references
```

Expected: 目录存在且不影响任何旧的 `social-pet-*` skill。

- [ ] **Step 2: 验证旧 skill 未被纳入修改目标**

```bash
ls /Users/bytedance/.skills-manager/skills | grep '^social-pet'
```

Expected: 只看到旧目录列表，不对这些目录做原地重构。

### Task 2: 编写主路由 `SKILL.md`

**Files:**
- Create: `skills/social-pet-tools/SKILL.md`
- Reference: `skills/bytedance-tools/SKILL.md`
- Reference: `skills/obsidian-tools/SKILL.md`
- Reference: `docs/superpowers/specs/2026-04-16-social-pet-tools-design.md`

- [ ] **Step 1: 写 frontmatter 和总入口描述**

```markdown
---
name: social-pet-tools
description: Router skill for social_pet workflows. Use when tasks involve social_pet local tests, ppe config modify, RPC acceptance, RPC pod triage, RPC verify loops, or social-pet oncall handling. Routes through commands/ and keeps legacy skills unchanged.
---

# Social Pet Tools - 统一入口
```

Expected: 描述同时包含“做什么”和“何时触发”。

- [ ] **Step 2: 写目录结构和加载规则**

```markdown
## 目录结构

```text
social-pet-tools/
├── SKILL.md
├── commands/
└── references/
```

## 加载规则

- 先读本文件判断路由
- 只按需加载目标 `commands/*.md`
- 命令涉及公共约束时再读 `references/*.md`
```

Expected: 与 `obsidian-tools` 的 command-router 风格一致。

- [ ] **Step 3: 写显式命令和语义路由表**

```markdown
| 用户输入 | 路由到 |
|---|---|
| `local-test` | `commands/local-test.md` |
| `config-modify` | `commands/config-modify.md` |
| `rpc-acceptance` | `commands/rpc-acceptance.md` |
| `rpc-pod-triage` | `commands/rpc-pod-triage.md` |
| `rpc-verify` | `commands/rpc-verify.md` |
| `oncall` | `commands/oncall.md` |
```

Expected: 所有现有 `social-pet-*` 能力都被覆盖。

### Task 3: 编写公共 references

**Files:**
- Create: `skills/social-pet-tools/references/conventions.md`
- Create: `skills/social-pet-tools/references/mapping.md`
- Reference: `skills/social-pet-local-test/SKILL.md`
- Reference: `skills/social-pet-rpc-verify-loop/SKILL.md`

- [ ] **Step 1: 写 `conventions.md`**

```markdown
# Social Pet Tools Conventions

- 仓库范围默认是 `social_pet`
- 默认中文总结，英文保留给命令、参数和路径
- 长流程证据要落盘
- 原 skill 保持兼容，不在聚合层中改写其历史入口
- 需要仓库原生单测时，遵循 `social-pet-local-test` 的本地测试约束
```

Expected: 公共约束只写一次，供各命令复用。

- [ ] **Step 2: 写 `mapping.md`**

```markdown
# Legacy Mapping

| 新命令 | 旧 skill |
|---|---|
| `config-modify` | `social-pet-config-modify` |
| `local-test` | `social-pet-local-test` |
| `oncall` | `social-pet-oncall` |
| `rpc-acceptance` | `social-pet-rpc-acceptance-loop` |
| `rpc-pod-triage` | `social-pet-rpc-pod-triage` |
| `rpc-verify` | `social-pet-rpc-verify-loop` |
```

Expected: 明确聚合命令和旧 skill 的一一映射。

### Task 4: 编写非 RPC 命令文档

**Files:**
- Create: `skills/social-pet-tools/commands/local-test.md`
- Create: `skills/social-pet-tools/commands/config-modify.md`
- Create: `skills/social-pet-tools/commands/oncall.md`
- Reference: `skills/social-pet-local-test/SKILL.md`
- Reference: `skills/social-pet-config-modify/SKILL.md`
- Reference: `skills/social-pet-config-modify/commands/cds.md`
- Reference: `skills/social-pet-oncall/SKILL.md`

- [ ] **Step 1: 写 `local-test.md`**

```markdown
# local-test

## Trigger

- `local-test`
- “跑一下 social_pet 本地单测”

## 核心约束

- 先 `sh build.sh`
- 再 `./ci/run.sh '<TestRegex>'`
- PASS 依据必须包含日志中的 `=== RUN` 和 `--- PASS:`
```

Expected: 保留 `social-pet-local-test` 的证据优先原则。

- [ ] **Step 2: 写 `config-modify.md`**

```markdown
# config-modify

## Trigger

- `config-modify`
- “帮我改 ppe 的 social_pet 配置”

## 核心约束

- 固定目录 `/Users/bytedance/bytecode/im_pet/<ppe_xxx_xxx>`
- 必须先 `svn update`
- 只做最小 diff
- `svn commit` 成功后再返回通知文案
```

Expected: 与旧 `social-pet-config-modify` 行为一致，但入口归一到聚合命令。

- [ ] **Step 3: 写 `oncall.md`**

```markdown
# oncall

## Trigger

- `oncall`
- “处理 social-pet oncall”

## 当前边界

- 当前旧 `social-pet-oncall` 没有沉淀流程
- 本命令只作为聚合入口占位
- 具体操作步骤需要结合仓库上下文或后续补充文档确认
```

Expected: 不编造不存在的 oncall SOP。

### Task 5: 编写 RPC 命令文档

**Files:**
- Create: `skills/social-pet-tools/commands/rpc-acceptance.md`
- Create: `skills/social-pet-tools/commands/rpc-pod-triage.md`
- Create: `skills/social-pet-tools/commands/rpc-verify.md`
- Reference: `skills/social-pet-rpc-acceptance-loop/SKILL.md`
- Reference: `skills/social-pet-rpc-pod-triage/SKILL.md`
- Reference: `skills/social-pet-rpc-verify-loop/SKILL.md`

- [ ] **Step 1: 写 `rpc-acceptance.md`**

```markdown
# rpc-acceptance

## Trigger

- `rpc-acceptance`
- “帮我做一轮 RPC 黑盒验收”

## 核心约束

- 先跑完整 case 矩阵，再决定是否改业务代码
- 请求、回包、重试结果、日志证据必须落盘
- 保留 `PASS / FAIL / NOT-COVERED` 最终矩阵
```

Expected: 保留 acceptance loop 的 phase model 和 hard gate。

- [ ] **Step 2: 写 `rpc-pod-triage.md`**

```markdown
# rpc-pod-triage

## Trigger

- `rpc-pod-triage`
- “按 pod 日志链路排查这次请求”

## 核心链路

- 请求体
- 原始回包
- `log_id` / `pod_name`
- 实例日志
- Mongo / Redis 或其他外部状态
```

Expected: 明确这是“单请求快速排障”，不是全量验收。

- [ ] **Step 3: 写 `rpc-verify.md`**

```markdown
# rpc-verify

## Trigger

- `rpc-verify`
- “改完代码后帮我继续 RPC 验证”

## 核心约束

- 先完成本地单测
- 再构造最小请求体
- 再用 bytedcli 发 RPC
- 返回不符时进入修复-验证循环
```

Expected: 复用旧 `social-pet-rpc-verify-loop` 的闭环思想。

### Task 6: 并行实施与整体验证

**Files:**
- Verify: `skills/social-pet-tools/**/*`
- Verify only: `skills/social-pet-config-modify/**/*`
- Verify only: `skills/social-pet-local-test/SKILL.md`
- Verify only: `skills/social-pet-oncall/SKILL.md`
- Verify only: `skills/social-pet-rpc-acceptance-loop/SKILL.md`
- Verify only: `skills/social-pet-rpc-pod-triage/**/*`
- Verify only: `skills/social-pet-rpc-verify-loop/**/*`

- [ ] **Step 1: 并行分派子任务**

```text
Subagent A: 写 `SKILL.md` + `references/*.md`
Subagent B: 写 `commands/local-test.md` + `commands/config-modify.md` + `commands/oncall.md`
Subagent C: 写 `commands/rpc-acceptance.md` + `commands/rpc-pod-triage.md` + `commands/rpc-verify.md`
```

Expected: 各子任务写不同文件，避免冲突。

- [ ] **Step 2: 汇总后校验文件存在与内容一致性**

```bash
find /Users/bytedance/.skills-manager/skills/social-pet-tools -maxdepth 2 -type f | sort
```

Expected: 看到 1 个主 `SKILL.md`、6 个命令文件、2 个 reference 文件。

- [ ] **Step 3: 校验没有误改旧 skill**

```bash
git diff -- /Users/bytedance/.skills-manager/skills/social-pet-config-modify \
  /Users/bytedance/.skills-manager/skills/social-pet-local-test \
  /Users/bytedance/.skills-manager/skills/social-pet-oncall \
  /Users/bytedance/.skills-manager/skills/social-pet-rpc-acceptance-loop \
  /Users/bytedance/.skills-manager/skills/social-pet-rpc-pod-triage \
  /Users/bytedance/.skills-manager/skills/social-pet-rpc-verify-loop
```

Expected: 无旧 skill 目录改动。

- [ ] **Step 4: 读取新文件并做最终自检**

```text
检查项：
1. frontmatter 完整
2. 路由表覆盖全部命令
3. `oncall` 只做占位，不编造流程
4. 公共约束没有重复散落到每个命令里
```

Expected: 新聚合 skill 内部一致，且与 spec 对齐。
