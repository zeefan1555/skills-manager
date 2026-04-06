# 笔记格式规范

本文件是所有通过 everything-to-obsidian 导入笔记的**唯一格式定义**。SKILL.md 不再重复列出 frontmatter 模板。

## 统一 Frontmatter Schema

**所有笔记共用一套字段**，不再因来源不同使用不同 schema。

### 原文笔记

```yaml
---
title: "{title}"
aliases:
  - "{title}"
tags:
  - source
  - "{source_type}"
  - "{topic_tag_1}"
  - "{topic_tag_2}"
source_url: "{url_or_path_or_manual-input}"
source_type: "{source_type}"
author: "{author}"                       # 可选，可获得时填写
created_at: "{ISO 8601, 如 2026-03-31T16:00:00+08:00}"
status: inbox                            # inbox → reviewed → archived
linked_note: "[[{摘要笔记 vault 相对路径，不带 .md}]]"
cssclasses:
  - imported-note
  - source-note
---
```

### 摘要笔记

```yaml
---
title: "{title} - Summary"
aliases:
  - "{title} 摘要"
tags:
  - summary
  - "{source_type}"
  - "{topic_tag_1}"
  - "{topic_tag_2}"
source_url: "{url_or_path_or_manual-input}"
source_type: "{source_type}"
author: "{author}"                       # 可选
created_at: "{ISO 8601}"
status: inbox
linked_note: "[[{原文笔记 vault 相对路径，不带 .md}]]"
cssclasses:
  - imported-note
  - summary-note
---
```

### 单文件模式（正文 < 500 字）

当正文不足 500 字时，不生成双笔记，改用单文件：

```yaml
---
title: "{title}"
aliases:
  - "{title}"
tags:
  - source
  - summary
  - "{source_type}"
  - "{topic_tag_1}"
source_url: "{url_or_path}"
source_type: "{source_type}"
author: "{author}"
created_at: "{ISO 8601}"
status: inbox
cssclasses:
  - imported-note
---
```

注意：单文件模式下 **无** `linked_note` 字段，`tags` 同时包含 `source` 和 `summary`。

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 笔记标题 |
| `aliases` | 是 | 至少包含标题本身，方便 wikilink 搜索 |
| `tags` | 是 | 角色标签 + 来源标签 + 主题标签（3-5 个由 agent 自动推断） |
| `source_url` | 是 | URL / 本地路径 / `"manual-input"` |
| `source_type` | 是 | 见路由表 |
| `author` | 否 | 原作者 |
| `created_at` | 是 | ISO 8601 带时区 |
| `status` | 是 | `inbox` / `reviewed` / `archived` |
| `linked_note` | 双文件必填 | 指向对应笔记的 wikilink |
| `cssclasses` | 否 | 用于自定义样式 |

### 与旧字段的映射

| 旧字段名 | 新字段名 | 说明 |
|----------|---------|------|
| `captured_at` | `created_at` | 统一时间戳字段 |
| `generated_at` | `created_at` | 同上 |
| `date` | `created_at` | 同上 |
| `clipped` | `created_at` | Clippings 笔记同上 |
| `summary_note` | `linked_note` | 统一关联字段 |
| `source_note` | `linked_note` | 同上 |
| `source` | `source_url` | 统一来源字段 |
| `type` | `source_type` | 统一类型字段 |
| `source_platform` | 废弃 | 可从 source_type 推断 |

---

## 文件命名规则

| 笔记类型 | 格式 | 示例 |
|----------|------|------|
| 原文 | `YYYY-MM-DD {title}.md` | `2026-03-31 海外AI的正确充钱姿势.md` |
| 摘要 | `YYYY-MM-DD {title} - Summary.md` | `2026-03-31 海外AI的正确充钱姿势 - Summary.md` |
| YouTube 字幕 | `{title}-字幕.md` | `白嫖12个月Google AI Pro会员攻略-字幕.md` |
| 单文件 | `YYYY-MM-DD {title}.md` | （同原文格式） |

文件名清洗：`/ \ ? : * " < > |` → `-`，去控制字符，合并连续空白，截断至 100 字符。

---

## 正文结构

### 原文笔记

```markdown
# {title}

- Source: [原文链接]({url})
- Type: {source_type}
- Summary: [[{摘要笔记 wikilink}]]

## Original Content

{提取后的正文}
```

### 摘要笔记

```markdown
# {title} - Summary

- Source: [原文链接]({url})
- Type: {source_type}
- Original: [[{原文笔记 wikilink}]]

## Summary

> [!abstract] 一句话结论
> {核心观点，一句话}

### 关键要点
- 要点 1
- 要点 2
- 要点 3（控制 3-7 条）

### 适用判断
- 适合：{场景/人群}
- 不适合：{场景/人群}
- 注意：{风险或局限}
```

> `适用判断` 在纯技术文档等不适用的场景下可省略，但 `一句话结论 + 关键要点` 是必须的。

### 单文件模式

```markdown
# {title}

- Source: [原文链接]({url})
- Type: {source_type}

## Content

{正文}

## Summary

> [!abstract] {一句话结论}

### 关键要点
- ...
```

---

## 摘要质量要求

| 维度 | 要求 |
|------|------|
| 长度 | 200-600 字（中文）；短内容（原文 < 500 字）可缩短到 100 字以内 |
| 语言 | 与原文相同（英文原文用英文写摘要） |
| 代码 | 保留原文中的关键代码片段引用（用 `>` 引用格式） |
| 诚实 | 不虚构原文未提到的信息 |
| 标签 | 同步推断 3-5 个层 3 主题标签 |

---

## 标签体系

```
层 1 — 角色标签（自动）：  source / summary
层 2 — 来源标签（自动）：  web-article / youtube / local-pdf / feishu-doc / code / im-chat / email / clipboard
层 3 — 主题标签（Step 4b 推断，Review 可调）：ai-tools / go-lang / payment / obsidian / infra / ...
```

**不使用 tag 管理状态**。状态由 frontmatter `status` 属性承载（`inbox` → `reviewed` → `archived`），便于 Bases 过滤。

---

## Wikilink 规则

- 库内笔记：`[[vault 相对路径，不带 .md]]`
- 外部 URL：`[text](url)`
- frontmatter 中：`"[[path]]"`（带引号）
- 示例：`[[Articles/2026-03-31 文章标题]]`、`[[YouTube/字幕/视频标题-字幕]]`

---

## Obsidian 风格约定

- 使用 frontmatter 保存结构化属性
- 使用 `[[wikilink]]` 连接库内笔记
- 正文保持标准 Markdown，不原样写入 HTML/平台私有标签
- 强调说明优先使用 Obsidian callout：`[!abstract]`、`[!warning]`、`[!tip]`
