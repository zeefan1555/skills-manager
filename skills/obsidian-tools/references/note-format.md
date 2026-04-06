# Note Format

本文件定义 `obsidian-tools` 的公共笔记格式和运行时属性。所有命令都共享这里的约定。

## Vault 目录

```text
{OBSIDIAN_ROOT}/
├── _inbox/                 ← Web Clipper / 外部工具落地区（未经 raw 处理）
├── wiki/index.md            ← 人类 + LLM 共用主页
├── wiki/log.md              ← 统一操作日志（时间序）
├── raw/                    ← 原始收录（按 area 分子目录）
│   └── {area}/
│       └── assets/         ← 关联图片/附件
├── wiki/
│   ├── summaries/          ← 编译产物：摘要
│   ├── concepts/           ← 编译产物：概念
│   ├── topics/             ← 编译产物：主题聚合
│   ├── syntheses/          ← 编译产物：综合/比较/高价值问答
│   └── indexes/            ← 索引文件
│       ├── _all_sources.md
│       ├── _all_concepts.md
│       ├── _glossary.md
│       └── {area}.md       ← 按领域分组的子索引
├── outputs/
│   ├── qa/                 ← query 命令的问答归档
│   ├── health/             ← lint 命令的健康报告
│   ├── remnote/            ← RemNote 导出备份
│   ├── slides/             ← Marp 幻灯片
│   └── charts/             ← matplotlib 图表
```

`{OBSIDIAN_ROOT}` = `/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent`

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

> **文件名即 ID**：不再使用 uid 字段，markdown 文件名就是笔记的唯一标识。
>
> **不可变约束**：raw 文件一旦写入 `raw/{area}/`，正文和 frontmatter 均不可修改。如需修正，删除原文件重新收录。
>
> **已移除字段**：`uid`、`status`、`compiled_at` 不再使用。编译状态通过 `wiki/log.md` 中的编译记录跟踪。

## Summary 笔记格式

```yaml
---
title: "S-{编号} {标题}"
source: "[[raw/{area}/{raw-file}]]"
compiled: {date}
tags:
  - {tag1}
  - {tag2}
---
```

> `summary` 在信息架构里等价于 source note：面向单个来源的已编译页面。

## 命名规范

- 标题与文件名优先服务于**人类检索**，其次才是 slug 稳定性。
- 如果用户主要用中文提问、中文检索，`title` 与文件名默认优先中文。
- `outputs/qa/` 的标题默认直接等于用户原问题；文件名也默认直接使用用户原问题。
- `wiki/syntheses/` 如果由用户问题直接触发，标题优先使用原问题或一条紧贴问题的中文结论。
- `wiki/concepts/` 和 `wiki/topics/` 如果生成中文标题，英文名优先放到 `aliases`，而不是反过来。

## Concept 笔记格式

```yaml
---
title: "{概念名}"
aliases:
  - "{别名，如有}"
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

## Topic 笔记格式

```yaml
---
title: "{主题名}"
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
promote_status: none|pending|promoted
tags:
  - qa
---
```

> `outputs/qa/` 更适合临时归档、低价值问答或等待 promote 的内容；高价值结果优先写入 `wiki/syntheses/`。

### promote_status 状态机

```text
none ──(归档判断为值得反哺)──→ pending ──(compile --promote)──→ promoted
```

- `none`：不需要反哺的普通 QA
- `pending`：等待 compile 提取新知识入 wiki
- `promoted`：已经 compile 入 wiki

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

这些属性只在 `ask` 阶段维护，优先写 frontmatter property，不要散落到正文。

```yaml
search_hits: 2
last_searched_at: 2026-04-05T00:56:40
remnote_status: new|queued|exported
remnote_exported_at: 2026-04-05T00:58:10
remnote_backup: "[[outputs/remnote/2026-04-05-example-remnote]]"
```

## Wiki Log 格式

`wiki/log.md` 是所有操作的统一日志，格式为 grep 友好的追加型条目：

```markdown
## [{YYYY-MM-DD HH:mm}] {action} | {title}
- touched:
  - [[wiki/summaries/S-xxx]]
  - [[wiki/concepts/xxx]]
- source: [[raw/{area}/{file}]] 或外部任务说明
```

其中 `action` 可选值：`ingest`、`compile`、`ask`、`lint`、`promote`、`output`

> **wiki/log.md 是编译状态的 source of truth**：compile 通过对比 `raw/` 中的文件名与 log 中的 `compile` 记录来判断哪些文件还未编译。

## 关键约束

- `raw` 阶段生成 `summary` 字段写入 frontmatter，但不生成 `wiki/summaries` 或 `wiki/concepts`
- `compile` 通过 `wiki/log.md` 判断哪些 raw 还未编译（不再依赖 status 字段）
- `compile` 阶段优先更新受影响页面，不只是机械生成新文件
- `compile --promote` 负责把 `promote_status: pending` 的 QA 提取入 wiki
- 高价值问答优先写入 `wiki/syntheses/`，而不是长期停留在 `outputs/qa/`
- `search_hits` 只记在最终命中的主笔记上
- `ask` 的普通结果归档到 `outputs/qa/`；只有"暂不适合直写 wiki"的结果才设 `promote_status: pending`
- `wiki/index.md` 是首要导航页，`wiki/log.md` 是首要操作日志
- `output` 产出归档到 `outputs/slides/`、`outputs/charts/` 等
- `lint` 报告归档到 `outputs/health/`
- RemNote 备份统一落到 `outputs/remnote/`
- frontmatter 字段名保持稳定，不随意发明新字段
- `ingested_by` 区分手动收录、lint 补值、批量导入
- concept 的 `aliases` 用于语义合并时保留所有已知名称
- raw 文件不可变：写入 `raw/{area}/` 后不再修改
