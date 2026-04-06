# Lint Command

> **引用规范**：`references/note-format.md`（Lint Report 格式、所有 frontmatter 字段定义）、`references/obsidian-cli.md`（files / search / backlinks）

## Trigger

- `lint`
- `health`、"健康检查"、"检查一下"、"知识库有什么问题"

## 目标

对 wiki 做全面健康检查，发现并报告问题，可选自动修复和 web search 补值。除了结构问题，还要检测“新来源是否让旧结论失效”。每次 lint 都保存报告，支持趋势对比。

## 模式

| 模式 | 触发 | 行为 |
|---|---|---|
| **标准** | `lint` | 4 维度检查 + 报告 |
| **修复** | `lint --fix` | 检查 + 自动修复低风险问题 |
| **补值** | `lint --impute` | 检查 + web search 补充缺失数据 → raw → compile |
| **对比** | `lint --diff` | 与上次 lint 报告对比，展示趋势 |

## 检查维度

### 1. 数据一致性
- frontmatter 字段是否完整（对照 `references/note-format.md` 中的各格式定义）
- `status: compiled` 的 raw 是否确实有对应 summary
- concept 的 `sources` 引用是否有效
- 日期格式是否统一
- summary 的 `source` backlink 是否指向存在的 raw

### 2. 链接完整性
- 扫描所有 `[[wikilinks]]`，找到断链（指向不存在的笔记）
- 检查 `wiki/indexes/` 是否覆盖了所有 concepts 和 summaries
- backlinks 是否对称（A 引用 B，B 的 backlinks 应包含 A）
- 索引文件的条目数 vs 实际文件数是否一致

### 3. 内容质量
- 重复概念检测（不同名字但描述同一事物，参考 `commands/compile.md` → Concept 合并策略）
- 极短或空笔记（< 50 字的 concept / summary）
- 长期 `status: pending` 未编译的 raw（> 7 天）
- concept 缺少 `sources` 引用
- summary 缺少关键结论

### 4. 知识拓展候选
- 分析现有 concepts 之间的关联，建议缺失的 `related` 链接
- 基于 raw 内容建议新的 concept 候选
- 发现值得深入研究的方向
- **识别数据缺口**：哪些 concept 只有 1 个 source？哪些 area 覆盖薄弱？

### 5. 证据漂移 / 结论失效
- 新来源是否与旧 summary / concept / topic / synthesis 的关键结论冲突
- 旧页面是否长期未 review，但最近已有新来源进入同主题
- 某个 synthesis 是否已被更晚证据部分推翻、却仍标记为 `active`
- 某个 concept 的 `conflicts` / `open_questions` 是否应该更新

## 执行步骤

1. 收集元数据
   - `obsidian files folder="raw" ext=md`（见 `references/obsidian-cli.md`）
   - `obsidian files folder="wiki" ext=md`
   - 读取 `_kb_meta/` 下的日志
   - 读取 `wiki/log.md` 识别最近更新主题
2. 逐维度检查（按上述 5 个维度）
3. 生成报告 → `outputs/health/lint-{YYYY-MM-DD}.md`（格式见 `references/note-format.md` → Lint Report 格式）
4. 趋势对比（如有历史报告）
   - 读取最近一次 lint 报告
   - 对比 issues 数量变化
   - 标注新增 / 已解决 / 持续存在的问题
5. 记录 lint 活动
   - append 到 `_kb_meta/lint_log.md`
   - append 到 `wiki/log.md`（记录本次检查范围、关键问题、是否发现 evidence drift）
6. 可选：自动修复（`--fix`）
   - 补齐缺失的 frontmatter 字段
   - 更新断链的索引
   - 标记需要 re-compile 的 raw
7. 可选：web search 补值（`--impute`）
   - 对数据缺口执行 web search
   - 找到的补充资料走 `raw` 入库（见 `commands/raw.md`）
   - 入库后建议 `compile`（见 `commands/compile.md`）

## Web Search 补值流程

```text
lint 发现缺口 → 确定补充主题 → web search
     ↓
找到补充资料？ ─→ 否 → 标记为 "impute_failed"，建议用户手动补充
     │
     是
     ↓
raw <url> → compile → 重新 lint 验证
```

- 每次 impute 最多补 5 条来源，防止过度
- 每条来源入库前展示标题和 URL，用户可跳过
- impute 的 raw 标记 `ingested_by: lint-impute`（见 `references/note-format.md`）

## 报告格式

```markdown
# Lint Report — {date}

## Summary
- 检查笔记数：{n}
- 发现问题数：{n}（Critical: {n}, Warning: {n}, Suggestion: {n}）
- 自动修复数：{n}
- Web 补值数：{n}

## Trend（vs 上次 lint）
- 上次：{date}，{n} issues
- 本次：{n} issues（↓{n} 已解决，↑{n} 新增）

## Issues

### Critical
- ...

### Warning
- ...

### Suggestion
- ...

## Evidence Drift
- [[wiki/concepts/xxx]] 的结论 A 可能已被 `[[wiki/summaries/S-yyy]]` 推翻
- [[wiki/syntheses/syn-zzz]] 应考虑标记为 `superseded`

## Knowledge Gaps
- {area} 领域只有 {n} 个 source，建议补充
- concept [[xxx]] 只被引用 1 次，缺乏交叉验证

## Recommended Actions
- 建议运行 `compile` 处理 {n} 条 pending raw
- 建议合并重复概念：[[A]] 和 [[B]]
- 建议新增概念：{候选名}
- 建议 `lint --impute` 补充 {area} 领域数据
```

## 返回给用户

- 检查结果摘要
- 趋势变化（vs 上次）
- 按严重程度分级的问题列表
- 结论失效 / 证据漂移列表
- 知识缺口列表
- 建议的下一步操作
- 报告保存路径

## 约束

- 不静默修改用户内容，修复前先列出计划
- 不删除任何笔记，只标记和建议
- 每次 lint 都保存报告到 `outputs/health/` 以便追踪趋势
- lint 应优先指出“哪些结论需要重写”，而不只是“哪些字段缺失”
- web search 补值需要用户确认每条来源，不自动批量入库
- impute 每次最多 5 条来源
