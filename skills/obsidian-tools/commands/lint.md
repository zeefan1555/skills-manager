# Lint Command

> **引用规范**：`references/note-format.md`（4 层检索层级、Lint Report 格式、所有 frontmatter 字段定义、Concept 合并规则）、`references/obsidian-cli.md`（files / search / backlinks）

## Trigger

- `lint`
- `health`、"健康检查"、"检查一下"、"知识库有什么问题"

## 目标

对 wiki 做全面健康检查，发现并报告问题，可选自动修复和 web search 补值。除了结构问题，还要检测"新来源是否让旧结论失效"。每次 lint 都保存报告，支持趋势对比。

## 模式

| 模式 | 触发 | 行为 |
|---|---|---|
| **标准** | `lint` | 6 维度检查 + 报告 |
| **修复** | `lint --fix` | 检查 + 自动修复低风险问题 |
| **补值** | `lint --impute` | 检查 + web search 补充缺失数据 → raw → compile |
| **对比** | `lint --diff` | 与上次 lint 报告对比，展示趋势 |

## 检查维度

### 1. 数据一致性
- frontmatter 字段是否完整（对照 `references/note-format.md` 中的各格式定义）
- 已编译 raw（在 `raw/{area}/` 中）是否都有对应 summary（在 `wiki/summaries/` 中）
- concept 的 `sources` 引用是否有效
- 日期格式是否统一
- Summary 的 `source` backlink 是否指向存在的 raw

### 2. 链接完整性
- 扫描所有 `[[wikilinks]]`，找到断链（指向不存在的笔记）
- **index.md 完整性**：是否所有 `wiki/concepts/` 下的 concept 都在 `wiki/index.md` 中有对应条目
- **双向链接完整性**：concept A 的 `related` 包含 B → B 的 `related` 必须包含 A，不对称则报告
- backlinks 是否对称（A 引用 B，B 的 backlinks 应包含 A）

### 3. 内容质量
- 重复概念检测（按 Concept 合并规则的 3 条标准：名称匹配、定义重叠 >50%、aliases 包含）
- 极短或空笔记（< 50 字的 concept / Summary）
- `raw/inbox/` 中 ingested > 7 天的文件
- concept 缺少 `sources` 引用
- Summary 缺少关键结论
- raw 的 `summary` 字段为空（应由 raw 命令生成）

### 4. 命名与别名规范
- **concept aliases 完整性**：是否所有 concept 都有 `aliases` 字段且包含英文原名
- **中文标题规范**：concept / topic 的 `title` 是否为中文
- **孤立页面**：concept 的 `related` 数量为 0（孤立概念岛，无法通过交叉引用被发现）

### 5. 知识拓展候选
- 分析现有 concepts 之间的关联，建议缺失的 `related` 链接
- 基于 raw 内容建议新的 concept 候选
- 发现倾得深入研究的方向
- **识别数据缺口**：哪些 concept 只有 1 个 source？哪些 area 覆盖薄弱？

### 6. 证据漂移 / 结论失效
- 新来源是否与旧 Summary / concept / topic / synthesis 的关键结论冲突
- 旧页面是否长期未 review，但最近已有新来源进入同主题
- 某个 synthesis 是否已被更晚证据部分推翻、却仍标记为 `active`
- 某个 concept 的 `conflicts` / `open_questions` 是否应该更新

### 7. 架构健康
- inbox 积压检查：`raw/inbox/`、`wiki/summaries/inbox/`、`outputs/qa/inbox/` 文件数量
- `_inbox/` 积压检查：文件数 > 0 则提示跑 `raw --triage`
- area 文件夹只含 1 篇笔记的检查（可能过度细分）
- `raw/inbox/` 积压检查：文件数 > 0 则提示 compile
- raw 的 tags 在 wiki 中没有对应条目（可能 Summary 遗漏了关键概念）
- `outputs/qa/inbox/` 积压数量

## 执行步骤 ... (rest of file)
