# Status Command

> **引用规范**：`references/note-format.md`（Vault 目录、4 层检索层级）、`references/obsidian-cli.md`（files 命令）

## Trigger

- `status`
- `stat`、"概览"、"知识库状态"、"现在什么情况"

## 目标

快速返回知识库状态快照，包括规模、健康度、增长趋势、最近活动，以及 `wiki/index.md` / `wiki/log.md` 的维护状态。

## 执行步骤

1. 统计各目录文件数（目录结构见 `references/note-format.md` → Vault 目录）
   - `raw/`：总数（_inbox: {n}, 已编译: {n}）
   - `raw/_inbox/` 待编译数
   - `_inbox/` 积压：文件数量和最早文件日期
   - `wiki/summaries/`：总数
   - `wiki/summaries/_inbox/`：待编译数量
   - `wiki/concepts/`：总数
   - `wiki/topics/`：总数
   - `wiki/syntheses/`：总数
   - `wiki/glossary.md`：是否存在
   - `wiki/index.md`：是否存在、最近更新时间、覆盖的 concept 数
   - `wiki/log.md`：条目数、最近更新时间
   - `outputs/`：各子目录数（qa、health、remnote、slides、charts）
   - `outputs/qa/_inbox/` 待反哺数
2. 计算规模指标
   - 总词数估算：`find wiki/ -name "*.md" -exec wc -w {} + | tail -1`
   - 总文件数
3. 读取最近活动
   - 读取 `wiki/log.md` 中对应 action 类型的最近记录
   - 最近修改的 5 篇笔记
4. 增长趋势（与上次 status 或 lint 对比）
   - 如有 `wiki/log.md` 中的历史 status 记录：对比 concept 数、summary 数、raw 数、词数
   - 如无历史数据：标注"首次统计"
5. 健康快照
   - _inbox 积压数（3 个 _inbox 各自的文件数，及超 7 天的数量）
   - `_inbox/` 积压数
   - 断链数（快速抽样检查 10 条 wikilinks）
   - 最近 lint 报告摘要（如有）
6. append 到 `wiki/log.md`，格式 `[{date}] status | vault snapshot`

## 返回格式

```text
📊 Knowledge Base Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scale:
  Raw:          {total} (_inbox: {n}, compiled: {n})
  _inbox:        {n} files ({oldest_date})
  Summaries:    {n} ({_inbox} in _inbox)
  Concepts:     {n}
  Topics:       {n}
  Syntheses:    {n}
  Glossary:     {exists? ✓/✗}
  Index:        {concept_count} concepts indexed, updated {date}
  Total words:  ~{n}K
  Outputs:      {n} (qa: {n}, health: {n}, remnote: {n}, slides: {n}, charts: {n})

_inbox Pending:
  raw/_inbox/:              {n} files
  wiki/summaries/_inbox/:   {n} files
  outputs/qa/_inbox/:       {n} files

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
  ⚠ {n} raw in _inbox pending > 7 days
  ⚠ {n} summaries in _inbox backlog
  ⚠ {n} QA in _inbox pending feedback
  ⚠ {n} broken links (sampled)
  ⚠ {n} stale conclusions flagged by lint
  ✓ Last lint: {n} issues ({date})

Suggestions:
  → Run `compile` to process {n} _inbox files (raw: {n}, summaries: {n}, qa: {n})
  → Run `lint` (last run > 7 days ago)
```

## 约束

- 只读操作，不修改 wiki / raw / outputs 内容
- 统计优先用 `obsidian files` / `find` / `wc`，避免逐文件读取 frontmatter
- 如果状态显示积压，主动建议 `compile` 或 `lint`
- 如果首页或演化日志长期未更新，主动建议刷新 `wiki/index.md` / `wiki/log.md`
- 如果从未运行过 lint，建议首次 `lint`
- 唯一写入：append 到 `wiki/log.md` 记录本次统计供下次对比
