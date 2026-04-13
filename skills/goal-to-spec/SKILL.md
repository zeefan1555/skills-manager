---
name: goal-to-spec
description: Use when the user wants to turn a product idea, feature request, or vague goal into a staged spec with current-state research, option comparison, and code-change planning.
---

# Goal-to-Spec：统一入口

把用户目标逐步整理成一个统一的 spec 文件夹，里面按阶段分别产出独立 `.md` 文档。

这个 skill 只负责：
- 定义总原则
- 判断用户当前处在哪个阶段
- 把请求路由到对应命令
- 按需加载共享参考规范

具体阶段动作放在 `commands/`，共享模板与审查规则放在 `references/`。

## 核心原则

1. **先理解现状，再比较方案，最后落到代码改动。**
2. **方案选择顺序固定**：先看能不能达成最终目标，再看是不是主路径优先级，最后看简单性。
3. **用户显式触发阶段**：不自动推进到下一阶段。
4. **分析必须有证据**：尽量引用具体 `文件:行号`；不确定就写“待确认”。
5. **不直接改业务代码**：这个 skill 产出的是 spec 文件夹里的阶段文档，而不是实现代码。

## 目录结构

```text
goal-to-spec/
├── SKILL.md                ← 你在这里：统一入口 + 路由
├── commands/               ← 用户可触发的阶段命令
│   ├── init.md             ← 初始化目标与 spec 骨架
│   ├── research.md         ← 阶段 1：调研现状
│   ├── options.md          ← 阶段 2：比较方案并选型
│   └── breakpoints.md      ← 阶段 3：分析断点与代码改动
└── references/             ← 公共规范与模板
    ├── spec-template.md
    ├── solution-selection.md
    ├── technical-risk-checklist.md
    └── code-review-guidelines.md
```

## 加载规则

- agent 首先读取本文件，判断用户意图与当前阶段。
- 用户触发具体阶段后，加载对应的 `commands/*.md`。
- `commands/*.md` 按需引用 `references/*.md`，避免重复定义公共规则。
- `references/*.md` 不直接对应用户命令，只作为共享参考。

## 命令路由

### 显式路由

| 用户输入 | 路由到 |
|---|---|
| `init` / `goal-to-spec` / “帮我把目标变成 spec” | `commands/init.md` |
| `阶段1` / `research` / “先调研现状” | `commands/research.md` |
| `阶段2` / `options` / “给我 1~3 个方案并帮我选” | `commands/options.md` |
| `阶段3` / `breakpoints` / “分析断点和代码改动” | `commands/breakpoints.md` |

### 语义路由

| 用户意图 | 路由到 |
|---|---|
| “先把目标、范围、成功标准定一下” | `init` |
| “看看这个场景现在是怎么工作的” | `research` |
| “给我几个方案，挑一个最合适的” | `options` |
| “如果选这个方案，代码要改哪里” | `breakpoints` |

一条消息里有多个命令时，按书写顺序逐个执行。

## 阶段依赖

| 阶段 | 作用 | 依赖 |
|---|---|---|
| `init` | 明确目标、范围、约束、成功标准，并初始化 spec 文件夹 | 无 |
| `research` | 根据场景调研当前现状 | 建议先有 `init` |
| `options` | 给出 1~3 个方案并筛选推荐方案 | 依赖 `research` |
| `breakpoints` | 基于选定方案分析断点和代码改动 | 依赖 `research + options` |

## 智能编排

| 触发条件 | 自动建议 |
|---|---|
| `init` 完成 | 建议进入 `research` |
| `research` 发现目标还不清楚 | 回到 `init` 补齐目标或成功标准 |
| `options` 发现没有任何方案能达标 | 回到 `research` 补充现状与约束 |
| `options` 已选出推荐方案 | 建议进入 `breakpoints` |
| `breakpoints` 发现关键链路信息缺失 | 回到 `research` 或 `options` 补证据 |

## 公共参考

| 参考文件 | 定义内容 | 被引用于 |
|---|---|---|
| `references/spec-template.md` | spec 文件夹结构与各阶段文档模板 | 所有命令 |
| `references/solution-selection.md` | 阶段 2 的筛选顺序、比较维度、简单性判断 | `options` |
| `references/technical-risk-checklist.md` | 原阶段 C 的技术排雷维度 | `options`、`breakpoints` |
| `references/code-review-guidelines.md` | 证据引用、断点定义、改动项写法 | `research`、`breakpoints` |

## 给 agent 的建议执行顺序

1. 先判断用户是在初始化、调研、比方案，还是看断点。
2. 只加载当前命令需要的 `commands/*.md`。
3. 再按命令文档引用需要的 `references/*.md`。
4. 产出对应阶段文档，写入同一个 spec 文件夹。
5. 回复用户摘要，并指出下一步最自然的命令。
