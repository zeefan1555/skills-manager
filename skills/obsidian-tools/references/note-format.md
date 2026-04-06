# Note Format

本文件定义 `obsidian-tools` 的公共笔记格式和运行时属性。所有命令都共享这里的约定。

## Vault 目录

```text
{OBSIDIAN_ROOT}/
├── wiki/index.md            ← 人类 + LLM 共用主页
├── wiki/log.md              ← 演化日志（时间序）
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
└── _kb_meta/               ← 日志等元数据
    ├── compile_log.md
    ├── search_log.md
    ├── ingest_log.md
    ├── query_log.md
    ├── lint_log.md
    └── status_log.md
```

`{OBSIDIAN_ROOT}` = `/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent`

## Raw 笔记格式

```yaml
---
uid: raw-{YYYYMMDD}-{4hex}
source_url: {url，如有}
author: {作者，如有}
published: {发布日期，如有}
ingested: {datetime}
ingested_by: manual|lint-impute|batch
type: article|paper|podcast|tweet|note|repo|dataset|pdf|thread
area: {领域名}
status: pending|compiled
compiled_at: {date，compile 后回写}
tags:
  - {tag1}
  - {tag2}
---
```

## Summary 笔记格式

```yaml
---
uid: S-{编号}-{slug}
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
- `uid` 可以保留稳定 slug，但标题不要只写英文概念名。
- `outputs/qa/` 的标题默认直接等于用户原问题；文件名也默认直接使用用户原问题。
- `wiki/syntheses/` 如果由用户问题直接触发，标题优先使用原问题或一条紧贴问题的中文结论。
- `wiki/concepts/` 和 `wiki/topics/` 如果生成中文标题，英文名优先放到 `aliases`，而不是反过来。

## Concept 笔记格式

```yaml
---
uid: con-{slug}
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
uid: topic-{slug}
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
uid: syn-{YYYYMMDD}-{slug}
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
uid: qa-{YYYYMMDD}-{slug}
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

这些属性只在 `search` 阶段维护，优先写 frontmatter property，不要散落到正文。

```yaml
search_hits: 2
last_searched_at: 2026-04-05T00:56:40
remnote_status: new|queued|exported
remnote_exported_at: 2026-04-05T00:58:10
remnote_backup: "[[outputs/remnote/2026-04-05-example-remnote]]"
```

## Wiki Log 条目格式

```markdown
## {YYYY-MM-DD HH:mm}
- action: ingest|compile|query|lint|promote|output
- summary: 一句话说明这次做了什么
- touched:
  - [[wiki/summaries/S-xxx]]
  - [[wiki/concepts/xxx]]
  - [[wiki/topics/yyy]]
  - [[wiki/syntheses/syn-zzz]]
- source: [[raw/{area}/{file}]] 或外部任务说明
```

## 关键约束

- `raw` 阶段不提前生成 summary / concept
- `compile` 阶段负责把 `status: pending` 转成 `compiled`
- `compile` 阶段优先更新受影响页面，不只是机械生成新文件
- `compile --promote` 负责把 `promote_status: pending` 的 QA 提取入 wiki
- 高价值问答优先写入 `wiki/syntheses/`，而不是长期停留在 `outputs/qa/`
- `search_hits` 只记在最终命中的主笔记上
- `query` 的普通结果归档到 `outputs/qa/`；只有“暂不适合直写 wiki”的结果才设 `promote_status: pending`
- `wiki/index.md` 是首要导航页，`wiki/log.md` 是首要演化日志
- `output` 产出归档到 `outputs/slides/`、`outputs/charts/` 等
- `lint` 报告归档到 `outputs/health/`
- RemNote 备份统一落到 `outputs/remnote/`
- frontmatter 字段名保持稳定，不随意发明新字段
- `ingested_by` 区分手动收录、lint 补值、批量导入
- concept 的 `aliases` 用于语义合并时保留所有已知名称
