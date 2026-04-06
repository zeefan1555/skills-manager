# Status Command

> **引用规范**：`references/note-format.md`（Vault 目录）、`references/obsidian-cli.md`（files 命令）

## Trigger

- `status`
- `stat`、"概览"、"知识库状态"、"现在什么情况"

## 目标

快速返回知识库状态快照，包括规模、健康度、增长趋势、最近活动，以及 `wiki/index.md` / `wiki/log.md` 的维护状态。

## 执行步骤

1. 统计各目录文件数（目录结构见 `references/note-format.md` → Vault 目录）
   - `raw/`：总数、pending 数、compiled 数
   - `wiki/summaries/`：总数
   - `wiki/concepts/`：总数
   - `wiki/topics/`：总数
   - `wiki/syntheses/`：总数
   - `wiki/indexes/`：总数
   - `wiki/index.md`：是否存在、最近更新时间
   - `wiki/log.md`：条目数、最近更新时间
   - `outputs/`：各子目录数（qa、health、remnote、slides、charts）
2. 计算规模指标
   - 总词数估算：`find wiki/ -name "*.md" -exec wc -w {} + | tail -1`
   - 总文件数
3. 读取最近活动
   - `_kb_meta/ingest_log.md`：最近一次收录时间
   - `_kb_meta/compile_log.md`：最近一次编译时间
   - `_kb_meta/search_log.md`：最近一次搜索时间
   - `_kb_meta/query_log.md`：最近一次问答时间
   - `_kb_meta/lint_log.md`：最近一次 lint 时间
   - `wiki/log.md`：最近 3 条知识演化记录
   - 最近修改的 5 篇笔记
4. 增长趋势（与上次 status 或 lint 对比）
   - 如有 `_kb_meta/status_log.md`：对比 concept 数、summary 数、raw 数、词数
   - 如无历史数据：标注"首次统计"
5. 健康快照
   - pending 积压数（及超 7 天的数量）
   - 断链数（快速抽样检查 10 条 wikilinks）
   - 最近 lint 报告摘要（如有）
6. 保存本次统计到 `_kb_meta/status_log.md`（append 模式）

## 返回格式

```text
📊 Knowledge Base Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scale:
  Raw:        {total} ({pending} pending, {compiled} compiled)
  Summaries:  {n}
  Concepts:   {n}
  Topics:     {n}
  Syntheses:  {n}
  Indexes:    {n}
  Total words: ~{n}K
  Outputs:    {n} (qa: {n}, health: {n}, remnote: {n}, slides: {n}, charts: {n})

Growth (vs last check on {date}):
  Raw:      +{n}
  Concepts: +{n}
  Words:    +{n}K
  (or: no previous data — first check)

Recent Activity:
  Last ingest:  {date}
  Last compile: {date} ({n} notes)
  Last search:  {date}
  Last lint:    {date}
  Last query:   {date}
  Wiki log:     {date} ({n} recent entries)

Recently Modified:
  1. {path} — {mtime}
  2. ...

Health:
  ⚠ {n} raw pending > 7 days
  ⚠ {n} broken links (sampled)
  ⚠ {n} stale conclusions flagged by lint
  ✓ Last lint: {n} issues ({date})

Suggestions:
  → Run `compile` to process {n} pending raw
  → Run `lint` (last run > 7 days ago)
```

## 约束

- 只读操作，不修改 wiki / raw / outputs 内容
- 统计优先用 `obsidian files` / `find` / `wc`，避免逐文件读取 frontmatter
- 如果状态显示积压，主动建议 `compile` 或 `lint`
- 如果首页或演化日志长期未更新，主动建议刷新 `wiki/index.md` / `wiki/log.md`
- 如果从未运行过 lint，建议首次 `lint`
- 唯一写入：append 到 `_kb_meta/status_log.md` 记录本次统计供下次对比
