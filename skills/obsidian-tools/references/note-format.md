# Note Format

本文件定义 `obsidian-tools` 的公共笔记格式和运行时属性。所有命令都共享这里的约定。

## 4 层检索层级

知识库采用 4 层检索层级，从粗到细：

| 层级 | 位置 | 职责 | 维护者 |
|------|------|------|--------|
| L1 路由层 | `wiki/index.md` | 按 area 分组的概念目录，一句话摘要，快速定位 | compile 自动维护 |
| L2 概念层 | `wiki/concepts/*.md` | 跨来源概念页，含实战笔记，回答大多数问题 | compile 创建/更新 |
| L3 Summary | `wiki/summaries/*.md` | 单来源的详细分析页 | raw 创建，compile 处理 |
| L4 原始层 | `raw/{area}/*.md` | 不可变的原始材料 | raw 命令写入 |

**检索方向**：L1 → L2 → L3 → L4（从索引到概念到 Summary 到原文）
**编译方向**：L4 → L3 → L2 → L1（从原文到 Summary 到概念到索引）

## Vault 目录

```text
{OBSIDIAN_ROOT}/
├── _inbox/                 ← Web Clipper / 外部工具落地区（未经 raw 处理）
├── raw/                    ← L4 原始层（按 area 分子目录），不可变
│   ├── assets/             ← 所有 raw 笔记共用的图片/附件目录
│   ├── _inbox/              ← raw 命令写入，compile 处理后移到 {area}/
│   └── {area}/
├── wiki/
│   ├── index.md            ← L1 路由层
│   ├── log.md              ← 统一活动日志
│   ├── glossary.md         ← 术语表
│   ├── summaries/          ← L3 来源层
│   │   └── _inbox/          ← compile Phase A 生成，Phase B 后移到根目录
│   ├── concepts/           ← L2 概念层
│   ├── topics/             ← 主题聚合
│   └── syntheses/          ← 综合/比较/高价值问答
├── outputs/
│   ├── qa/                 ← query / ask 命令的问答归档
│   │   └── _inbox/          ← 待反哺 QA，compile 处理后移到根目录
│   ├── health/
│   ├── remnote/
│   ├── slides/
│   └── charts/
```

`{OBSIDIAN_ROOT}` = `/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent`

> **编译状态由文件夹位置决定**：`wiki/summaries/_inbox/` 中的 Summary 文档表示"待编译"，compile 完成后将其移到 `wiki/summaries/` 根目录表示"已编译"。`raw/_inbox/` 中的 raw 文件表示"待编译"，compile 处理后移到 `raw/{area}/`。`outputs/qa/_inbox/` 中的 QA 表示"待反哺"，compile 处理后移到 `outputs/qa/` 根目录。无需通过 log 或其他字段判断编译状态。

## index.md 模板

`wiki/index.md` 是知识库的唯一索引文件，由 compile 自动维护。按 area 分组，每个 concept 附一句话摘要（不超过 20 字，compile 自动生成）。

```markdown
# 知识库索引

> 自动维护，每次 compile 更新。手动编辑会被覆盖。

## dev-workflow 开发工作流

| 概念 | 名称 | 一句话 | 最近更新 |
|------|------|--------|---------|
| [[terminal-multiplexing-with-tmux]] | tmux 终端复用 | 会话保持、内外切换、多窗口分屏 | 2026-04-06 |
| [[git-worktree]] | Git Worktree | 同仓库多分支并行开发 | 2026-04-05 |

## ai-tools AI 工具

| 概念 | 名称 | 一句话 | 最近更新 |
|------|------|--------|---------|
| [[xxx]] | 概念中文名 | 一句话描述 | 日期 |

## 最近动态

- [2026-04-06 14:30] compile | tmux 终端复用
- [2026-04-06 10:00] compile | Git Worktree
（最近 5 条，从 log.md 摘取）

## 术语表

→ 详见 [[glossary]]

```

## Area 管理

- area 不设固定注册表，由 LLM 根据内容语义自主判断
- 判断时优先匹配 `raw/` 下已有的子文件夹名称
- 如果现有 area 都不合适，可以创建新的 area 文件夹
- 命名规则：小写英文 + 连字符，如 `dev-workflow`、`ai-tools`
- lint 会检查是否有 area 文件夹只含 1 篇笔记（可能是过度细分）

## Raw 笔记格式

```yaml
---
source_url: {url，如有}
author: {作者，如有}
published: {发布日期，如有}
ingested: {datetime}
ingested_by: manual|lint-impute|batch
type: article|paper|podcast|tweet|note|repo|dataset|pdf|thread
area: {领域名}
tags:
  - {tag1}
  - {tag2}
summary: |
  3-5 句摘要，由 raw 命令在收录时生成。
  必须覆盖每个 tag 对应的核心观点。
---
```

> **附件约定**：所有 raw 笔记的图片与附件统一落到 `raw/assets/`，不要在 `raw/{area}/` 下再创建独立 `assets/` 子目录。正文统一引用 `raw/assets/...` 中的文件。
>
> **文件名即 ID**：不再使用 uid 字段，markdown 文件名就是笔记的唯一标识。
>
> **不可变约束**：raw 文件写入 `raw/_inbox/`，compile 处理后移到 `raw/{area}/`。一旦移入 `raw/{area}/`，正文和 frontmatter 均不可修改。如需修正，删除原文件重新收录。
>
> **已移除字段**：`uid`、`status`、`compiled_at` 不再使用。编译状态通过文件夹位置跟踪（见 Vault 目录说明）。

## Summary 笔记格式

> Summary 文档由 compile Phase A 统一生成到 `wiki/summaries/_inbox/`，作为 L3 层的单来源分析页。compile Phase B 处理后将 Summary 移到 `wiki/summaries/`。raw 命令不生成 Summary 文档。

```yaml
---
title: "S-{编号} {中文标题}"
source: "[[raw/{area}/{raw-file}]]"
compiled: {date}
tags:
  - {tag1}
  - {tag2}
---
```

- compile Phase A 生成到 `wiki/summaries/_inbox/S-{编号}-{slug}.md`
- compile Phase B 处理后移动到 `wiki/summaries/S-{编号}-{slug}.md`
- 包含原文要点、关键结论、引用 backlink
- 面向单个来源的分析页（L3 Summary）
- 若 vault 主要是中文内容，标题与文件名优先使用中文可读名称

## 命名规范

- 标题与文件名优先服务于**人类检索**，其次才是 slug 稳定性。
- **中文优先**：`title` 与文件名默认中文。英文术语放入 `aliases`。
- `wiki/concepts/` 和 `wiki/topics/` 的标题必须是中文；英文原名放到 `aliases`。
- `outputs/qa/` 的标题默认直接等于用户原问题；文件名也默认直接使用用户原问题。
- `wiki/syntheses/` 如果由用户问题直接触发，标题优先使用原问题或一条紧贴问题的中文结论。

## Concept 笔记格式

### Frontmatter

```yaml
---
title: "{中文概念名}"
aliases:
  - "{英文原名}"
  - "{其他别名/缩写}"
created: {date}
updated: {date}
last_reviewed: {date，如有}
sources:
  - "[[wiki/summaries/S-xxx]]"
related:
  - "[[wiki/concepts/yyy]]"
open_questions:
  - "待确认问题，如有"
conflicts:
  - "与新来源冲突的旧结论，如有"
tags:
  - {tag1}
  - {tag2}
---
```

### 正文结构

```markdown
# {中文概念名}

## 实战笔记（最新在前）

### [{YYYY-MM-DD}] {问题标题}
> 来源：[[S-xxx]] | 我遇到了：{一句话描述遇到的问题}

- **原因**：{为什么会出这个问题}
- **正确做法**：
  - {具体命令或操作步骤}
  - {具体命令或操作步骤}

### [{earlier-date}] {另一个问题标题}
> 来源：[[S-yyy]] | 我遇到了：{...}

- **正确做法**：
  - {具体命令或操作步骤}

## 定义

{概念的简明定义，2-3 句话}

## 关键要点

- {要点 1}
- {要点 2}
- ...
```

### 实战笔记规则

- 每次 compile 新来源时，如果产生了实操内容（命令、配置、解决方案），在"实战笔记"段**最顶部**追加新条目
- 格式固定：日期 + 问题标题 → 来源引用 + 遇到的问题 → 原因 → 正确做法
- 每个 concept 最多保留最近 **10 条**实战笔记；超过后旧条目折叠到"历史笔记"段
- 非实操型的 concept（纯理论、纯定义）可以没有实战笔记段

### aliases 规则

- `aliases` 必须包含英文原名（如果 title 是中文）
- 包含用户可能用来搜索的所有变体（缩写、全称、中英文）
- compile 合并 concept 时，被合并方的名称自动加入 aliases

### 双向交叉引用

- compile 创建/更新 concept A 并在 `related:` 中引用 concept B 时，**必须同时**在 B 的 `related:` 中追加 A 的链接
- 保证任何时刻 `related` 关系都是对称的

## Concept 合并规则

compile 创建新 concept 前，必须先搜索现有 concepts 判断是否应合并。判断依据为以下 3 条可执行规则（满足任一即合并）：

1. **名称匹配**：slug 只差大小写、复数、缩写（如 "LLM" vs "Large Language Model"）→ 合并
2. **定义重叠**：两个 concept 的"定义"段 >50% 关键词重叠 → 合并
3. **aliases 包含**：新 concept 的名称/别名已出现在现有 concept 的 aliases 中 → 合并

合并时：保留更规范的名称作为 title，另一个加入 aliases。模糊情况一律提示用户确认，不自动合并。

## Topic 笔记格式

```yaml
---
title: "{中文主题名}"
aliases:
  - "{英文名}"
created: {date}
updated: {date}
sources:
  - "[[wiki/summaries/S-xxx]]"
concepts:
  - "[[wiki/concepts/xxx]]"
related:
  - "[[wiki/syntheses/syn-yyy]]"
tags:
  - topic
  - {tag}
---
```

**触发规则**：同一 area 下积累 ≥3 个 concept 时，自动创建该 area 的 topic 页。

## Synthesis 笔记格式

```yaml
---
title: "{综合页标题}"
question: "触发该综合页的问题或任务"
created: {date}
updated: {date}
sources:
  - "[[wiki/summaries/S-xxx]]"
concepts:
  - "[[wiki/concepts/xxx]]"
topics:
  - "[[wiki/topics/yyy]]"
kind: qa|comparison|synthesis|decision
status: active|superseded
supersedes:
  - "[[wiki/syntheses/old-page]]"
tags:
  - synthesis
  - {tag}
---
```

**触发规则**：当 ≥2 个 concept 之间存在冲突、互补或比较关系时，创建 synthesis 页。

## QA Output 格式

```yaml
---
title: "用户的原始问题"
question: "用户的原始问题"
answered_at: {datetime}
research_rounds: {n}
sources:
  - "[[wiki/concepts/xxx]]"
  - "[[wiki/summaries/S-xxx]]"
knowledge_gaps:
  - "缺少 xxx 的详细数据"
filed_back: true|false
tags:
  - qa
---
```

> 需要反哺的 QA 保存到 `outputs/qa/_inbox/`，不需要反哺的保存到 `outputs/qa/` 根目录。文件夹位置即状态。
>
> `outputs/qa/` 更适合临时归档、低价值问答；高价值结果优先写入 `wiki/syntheses/`。

## Output 格式

```yaml
---
type: slides|chart|canvas|report
created_at: {datetime}
query: "触发 output 的原始问题或指令"
sources:
  - "[[wiki/concepts/xxx]]"
format: marp|matplotlib|canvas|markdown|mermaid
tags:
  - output
---
```

## Lint Report 格式

```yaml
---
lint_date: {date}
checked: {n}
issues_found: {n}
issues_critical: {n}
issues_warning: {n}
issues_suggestion: {n}
auto_fixed: {n}
imputed: {n}
prev_lint: {date，如有}
prev_issues: {n，如有}
tags:
  - health
---
```

## Search 阶段运行时属性

这些属性只在 `query` 阶段维护，优先写 frontmatter property，不要散落到正文。

```yaml
search_hits: 2
last_searched_at: 2026-04-05T00:56:40
remnote_status: new|queued|exported
remnote_exported_at: 2026-04-05T00:58:10
remnote_backup: "[[outputs/remnote/2026-04-05-example-remnote]]"
```

## Wiki Log 格式

`wiki/log.md` 是所有操作的统一活动日志。纯文本行（不使用 `##` 标题），每条记录使用 `[[wikilink]]` 包裹文件名，确保在 Obsidian 中可点击跳转：

```text
[{YYYY-MM-DD HH:mm}] {action} | [[{文件名}]]
```

其中：
- `action` 可选值：`ingest`、`compile`、`query`、`ask`、`lint`、`promote`、`output`
- `ingest` 链接到 raw 文件：`[[2026-04-06 tmux attach、switch-client 与嵌套会话]]`
- `compile` 链接到 Summary 文件：`[[S-019-ai-近30天跨平台舆情观察]]`
- `query` 链接到产出文件：`[[如果我要做晋升答辩...]]`
- 一次 compile 涉及多个文件时，空格分隔多个 wikilink

> **wiki/log.md 是活动日志**，不是编译状态的 source of truth。编译状态由文件夹位置决定（`raw/_inbox/` = 待编译 raw，`summaries/_inbox/` = 待编译 summary，`outputs/qa/_inbox/` = 待反哺 QA）。

## 关键约束

- `raw` 阶段只写入 `raw/_inbox/`（frontmatter 中保留 `summary` 字段供浏览），不生成 Summary 文档。Summary 由 compile Phase A 统一生成
- `raw` 文件写入 `raw/_inbox/`，compile 处理后移到 `raw/{area}/`
- `compile` 通过扫描 3 个 _inbox 文件夹判断待编译列表
- `compile` 完成后将 Summary 从 `_inbox/` 移到 `wiki/summaries/` 根目录，raw 从 `raw/_inbox/` 移到 `raw/{area}/`，QA 从 `outputs/qa/_inbox/` 移到 `outputs/qa/` 根目录
- `wiki/log.md` 是活动日志，不是编译状态的 source of truth
- `compile` 默认模式扫描 `raw/_inbox/`、`wiki/summaries/_inbox/`、`outputs/qa/_inbox/` 三个文件夹
- `compile` 阶段优先更新受影响页面，不只是机械生成新文件
- 高价值问答优先写入 `wiki/syntheses/`，而不是长期停留在 `outputs/qa/`
- `search_hits` 只记在最终命中的主笔记上
- `query` 的普通结果归档到 `outputs/qa/`；需要反哺的结果保存到 `outputs/qa/_inbox/`
- `wiki/index.md` 是唯一索引文件，也是首要导航页
- `output` 产出归档到 `outputs/slides/`、`outputs/charts/` 等
- `lint` 报告归档到 `outputs/health/`
- RemNote 备份统一落到 `outputs/remnote/`
- frontmatter 字段名保持稳定，不随意发明新字段
- `ingested_by` 区分手动收录、lint 补值、批量导入
- concept 的 `aliases` 用于语义合并时保留所有已知名称；必须包含英文原名
- raw 文件不可变：移入 `raw/{area}/` 后不再修改
- concept `related:` 链接必须双向对称
