---
name: obsidian-tools
description: "Unified agent guide for Obsidian knowledge base workflows. Use when the task involves saving source material (raw), compiling pending notes into wiki (compile), searching the vault (search), asking questions against the wiki (query), rendering visual outputs like slides or charts (output), running health checks (lint), checking vault status (status), or any Obsidian CLI / Markdown / Bases operation. Routes by explicit command or semantic intent; commands live in commands/, shared specs live in references/."
---

# Obsidian Tools — 统一入口

给 Claude Code、Codex、Mira 等 agent 的 Obsidian 知识库操作入口。读完这个文件后，遇到知识库相关任务，优先使用 `obsidian-tools` 路由，而不是手写文件操作或拼临时脚本。

## 目录结构

```text
obsidian-tools/
├── SKILL.md                ← 你在这里：统一入口 + 路由
├── commands/               ← 命令型文档（每个对应一个用户可触发的操作）
│   ├── raw.md              ← 收录原始内容
│   ├── compile.md          ← 编译 pending → wiki
│   ├── search.md           ← 搜索知识库
│   ├── query.md            ← 基于 wiki 问答
│   ├── output.md           ← 多格式可视化输出
│   ├── lint.md             ← 健康检查 + 补值
│   └── status.md           ← 知识库状态概览
└── references/             ← 参考型文档（公共规范，被 commands/ 引用）
    ├── note-format.md      ← 笔记格式、frontmatter、目录结构、状态机
    ├── obsidian-cli.md     ← Obsidian CLI 命令参考
    ├── markdown.md         ← Obsidian Markdown 语法
    └── bases.md            ← Obsidian Bases (.base 文件)

vault/
├── raw/                    ← 原始来源，不改写
├── wiki/
│   ├── index.md            ← 人类 + LLM 共用的首页导航
│   ├── log.md              ← ingest / query / lint / compile 演化日志
│   ├── summaries/          ← 单来源摘要页（source notes）
│   ├── concepts/           ← 跨来源概念页
│   ├── topics/             ← 主题聚合页
│   ├── syntheses/          ← 高价值问答 / 比较 / 综合页
│   └── indexes/            ← 机器友好索引与台账
```

**加载规则**：

- agent 首先读取本文件（SKILL.md），获得路由和全局原则。
- 用户触发命令时，按路由表加载 `commands/` 下对应文件。
- `commands/` 中的文件按需引用 `references/` 下的公共规范，不重复定义。
- `references/` 不直接对应用户命令，只在被 `commands/` 引用或用户显式查阅时加载。

## 何时使用

当任务涉及以下任一操作时，优先考虑本 skill：

| 意图 | 命令 | 文件 |
|---|---|---|
| 存文章/链接/PDF/Git repo/批量导入 | `raw` | `commands/raw.md` |
| 编译 pending 为 wiki | `compile` | `commands/compile.md` |
| 搜索知识库 | `search` | `commands/search.md` |
| 基于 wiki 复杂问答 | `query` | `commands/query.md` |
| 生成幻灯片/图表/canvas | `output` | `commands/output.md` |
| 健康检查/补值/趋势对比 | `lint` | `commands/lint.md` |
| 查看知识库状态 | `status` | `commands/status.md` |
| 查看 CLI 用法 | `cli` | `references/obsidian-cli.md` |
| 查看 Markdown 语法 | `markdown` | `references/markdown.md` |
| 操作 .base 文件 | `bases` | `references/bases.md` |

## 前置检查

每次新会话首次操作前，执行连通性检查：

```bash
# 1. 确认 CLI 可用
obsidian help

# 2. 确认 vault 可访问
ls "${OBSIDIAN_ROOT}/raw" "${OBSIDIAN_ROOT}/wiki" 2>/dev/null
```

如果 `obsidian help` 失败，退化策略：`rg` / `find` / 直接文件操作，并提示用户检查 Obsidian 是否运行。

## 工作原则

1. **优先用 Obsidian CLI**，默认优先级 `CLI > rg/find > 直接文件操作`。只有 CLI 不适合时（批量扫描、超长文本落盘）才退回。
2. **Wiki-first**：真正要持续维护的是 `wiki/`，不是临时回答。高价值知识优先沉淀为 `summary / concept / topic / synthesis` 页面。
3. **LLM 写、人不碰**：wiki 的主体由 LLM 编写和维护；原始材料保持可溯源，结构化页面负责吸收与演化。
4. **页面演化优先于命令完成**：完成某个命令不是终点；关键是判断哪些页面因此受影响，并及时更新它们。
5. **自主深入**：遇到复杂问题时，不要只做一轮查找就结束。像研究员一样：读 → 发现线索 → 追踪 → 再读 → 直到充分回答。
6. **反哺闭环**：每次 query / lint / search / output 产生的高价值结果，都优先考虑直接更新 wiki，而不是只停留在 `outputs/`。
7. **首页与演化日志并重**：`wiki/index.md` 是导航入口，`wiki/log.md` 是时间序列上下文；二者都要持续维护。
8. **命名面向人类检索**：标题与文件名优先用用户的工作语言；中文工作流默认使用中文标题，避免只留下英文 slug。
9. **问题型产物保留原问题**：`query` 落到 `outputs/qa/` 时，默认用用户原问题作为标题和文件名，便于日后按问题检索。
10. 不确定命令参数时先看帮助，不要猜：`obsidian help` / `obsidian <command> --help`。
11. 回复用户时做摘要——返回关键信息和下一步建议，不要整段输出原始内容。

## 错误处理

- **CLI 不可用**：退化到 `rg` / `find` / 直接文件操作，并在输出中提示用户。
- **CLI 返回错误**：读取 stderr，判断是参数错误还是 vault 问题。参数错误先 `--help`；vault 问题提示用户检查 Obsidian 状态。
- **文件冲突**：已有同路径文件时，默认不覆盖，提示用户选择覆盖 / 重命名 / 跳过。
- **超时**：长时间操作（批量 compile > 20 篇）分批执行，每批报告进度。

## 知识管理流程

### 核心闭环

```text
                    ┌─── web search 补值 ───┐
                    │                       ↓
raw → compile → wiki pages → query / output / lint
       ↑           │              │
       │           │              ↓
       │           │        synthesis/topic updates
       │           ↓              │
       │      index + log         │
       └─────────── feedback loop ─┘
```

### 阶段说明

| 阶段 | 命令 | 作用 | 输入 | 输出 |
|---|---|---|---|---|
| **收录** | `raw` | 低摩擦入库，只补 frontmatter | URL / 文本 / PDF / repo / 批量 | `raw/{area}/*.md` (status: pending) + `wiki/log.md` |
| **编译** | `compile` | 增量编译 + 受影响页面更新 | `raw/` 中 pending 笔记 / 待 promote 内容 | `wiki/summaries/` + `wiki/concepts/` + `wiki/topics/` + `wiki/syntheses/` + `wiki/index.md` + `wiki/log.md` |
| **搜索** | `search` | CLI 粗筛 + LLM 精排 | 用户查询 | search_hits 累计，≥2 晋升 RemNote |
| **问答** | `query` | 多轮自主研究 + 直接产出综合页 | 用户问题 | 结构化回答 + `wiki/syntheses/` 或 `outputs/qa/` |
| **输出** | `output` | 多格式可视化 | wiki 内容 + 用户指令 | `outputs/slides/` / `outputs/charts/` / `.canvas` |
| **健检** | `lint` | 4 维检查 + web search 补值 | wiki 全量 | `outputs/health/` 报告 |
| **状态** | `status` | 只读快照 + 增长趋势 | vault 元数据 | 终端输出 |
| **反哺** | `compile --promote` | 提取 QA / lint / output 发现入 wiki | `outputs/qa/` 等候提升内容 | 新/更新的 syntheses + topics + concepts |

### 数据流向

```text
外部世界 ──→ raw/ ──→ wiki/
                       │  ├── summaries/
                       │  ├── concepts/
                       │  ├── topics/
                       │  ├── syntheses/
                       │  ├── index.md
                       │  └── log.md
                       ↓
                    outputs/
```

- **raw → wiki**：由 `compile` 驱动，先生成 source summary，再更新受影响页面
- **wiki → outputs**：由 `query` / `output` / `lint` 驱动，输出只是表达层，不是知识主体
- **outputs → wiki**：由 `compile --promote` 或 `query` 直写 synthesis 驱动（反哺闭环）

## 命令路由

### 显式路由

| 用户输入 | 路由到 |
|---|---|
| `raw <url\|文本\|文件>` | `commands/raw.md` |
| `compile` / `编译` / `整理` | `commands/compile.md` |
| `search <query>` / `搜 xxx` | `commands/search.md` |
| `query <question>` / `问 xxx` | `commands/query.md` |
| `output` / `render` / `生成幻灯片` | `commands/output.md` |
| `lint` / `health` / `检查` | `commands/lint.md` |
| `status` / `概览` | `commands/status.md` |
| `cli` / `obsidian-cli` | `references/obsidian-cli.md` |
| `markdown` / `md` | `references/markdown.md` |
| `bases` / `base` | `references/bases.md` |

### 语义路由（无显式命令时）

| 用户意图 | 路由到 |
|---|---|
| "把这篇存到知识库" | `raw` |
| "帮我编译一下" | `compile` |
| "搜一下 xxx" | `search` |
| "xxx 是什么？"（wiki 能回答的问题） | `query` |
| "做个幻灯片" / "画个对比图" | `output` |
| "知识库有什么问题吗" | `lint` |
| "现在知识库什么情况" | `status` |

一条消息里有多个命令时，按书写顺序逐个执行。

## 智能编排

以下场景自动触发多步操作，无需用户逐个指定：

| 触发条件 | 自动编排 |
|---|---|
| `raw` 完成且当前 pending ≤ 5 | 提示用户是否立刻 `compile` |
| `raw` 完成且当前 pending > 5 | 自动建议 `compile --batch` |
| `raw` 完成且能推断受影响 topic/concept | 提示用户优先定向 `compile`，更新相关页面而非只看 pending 数 |
| `query` 发现知识缺口 | 建议 `raw <补充来源>` → `compile` |
| `query` 输出高价值且跨 2 个以上页面 | 优先写入 `wiki/syntheses/`，再按需回写 concept/topic |
| `lint` 发现 missing data | 建议 `lint --impute`（web search 补值 → raw → compile） |
| `lint` 发现结论失效或证据漂移 | 建议定向 `compile` 更新受影响 summary/concept/topic/synthesis |
| `lint` 发现 pending 积压 | 自动建议 `compile` |
| 首次使用 / 新会话 | 建议先 `status` 了解当前状态 |

## 给 agent 的建议执行顺序

1. **前置检查**：`obsidian help` + vault 可访问性。
2. **判断意图**：路由到对应 `commands/` 文件。
3. **加载参考**：命令文件中引用的 `references/` 按需加载。
4. **执行命令**：按命令文件的步骤操作。
5. **评估受影响页面**：这次操作影响哪些 `summary / concept / topic / synthesis / index / log`？
6. **反馈闭环**：优先直写 wiki；若暂不适合直写，再归档到 `outputs/` 等待 promote。
7. **摘要返回**：关键信息 + 下一步建议。

## 前置条件

- Vault 根目录：`/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent`
  - 环境变量：`OBSIDIAN_ROOT` 指向此路径
- Obsidian CLI 可用（Obsidian 需运行中），并优先使用 `obsidian` CLI
- RemNote 输出依赖 `remnote-cli`
- 可视化输出依赖 `marp-cli`（slides）、`python3 + matplotlib`（charts）

## 公共参考规范

以下 `references/` 文件被多个命令引用，定义了跨命令的公共约定：

| 参考文件 | 定义内容 | 被引用于 |
|---|---|---|
| `references/note-format.md` | Vault 目录、所有笔记格式、frontmatter 字段、promote 状态机 | 所有命令 |
| `references/obsidian-cli.md` | CLI 语法、常用命令、参数约定 | raw、compile、search、query、lint、status |
| `references/markdown.md` | Obsidian Markdown 语法（wikilinks、callouts、frontmatter） | raw、compile、query、output |
| `references/bases.md` | .base 文件语法（filters、formulas、views） | 独立使用 |
| `../remnote-card-designer/SKILL.md` | RemNote 卡片设计约定 | search（晋升时调用） |
