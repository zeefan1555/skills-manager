# Query Command

> **引用规范**：`references/note-format.md`（QA Output 格式、promote 状态机）、`references/obsidian-cli.md`（search / backlinks）、`references/markdown.md`（正文格式）

## Trigger

- `query`
- `qa`、`问`、`问答`
- "分析一下"
- "xxx 是什么"（wiki 能回答的主题）

## 目标

基于已编译的 wiki 做复杂问答。采用**多轮自主研究**模式：像研究员一样，读 → 发现线索 → 追踪 → 再读 → 直到充分回答。高价值结果优先直写 `wiki/syntheses/`，而不是长期停留在 `outputs/qa/`。

## 执行步骤

### Phase 1：理解与定位

1. 分解复杂问题为子问题
2. 识别需要查找的关键概念
3. 先读入口：`wiki/index.md`，再按需读 `wiki/indexes/_all_concepts.md` 和 `_all_sources.md`
4. 用 `obsidian search query="..." path="wiki"` 缩小范围（见 `references/obsidian-cli.md`）

### Phase 2：多轮自主研究（核心差异化）

```text
  ┌─→ 读取命中笔记 ─→ 提取关键信息
  │                        │
  │                  发现新线索？
  │                   ↙        ↘
  │                 是           否
  │                 ↓            ↓
  │         追踪新线索      进入 Phase 3
  │         (search / backlinks / raw)
  │                 │
  └─────────────────┘
```

具体操作：
- 读取命中的 summaries / concepts 正文
- 检查 backlinks：`obsidian backlinks path="..." counts`
- 发现引用的其他 concept → 继续读取
- 如需原文细节 → 回溯对应 `raw/` 文件
- **每轮最多追踪 3 条新线索**，防止无限递归
- **最多 5 轮**研究循环，超过后总结当前发现并输出

### Phase 3：生成回答

- 结构化 Markdown 格式（见 `references/markdown.md`）
- 引用来源用 `[[wikilinks]]`
- 区分确定事实、推断、不确定点
- 如果发现 wiki 覆盖不足，**明确列出知识缺口**

### Phase 4：归档与反哺

归档判断标准：

| 条件 | 归档 | 反哺（promote） |
|---|---|---|
| 回答涉及 ≥3 个 concepts 的交叉分析 | 是 | 直接写 `wiki/syntheses/` |
| 回答揭示了 wiki 中没有的新知识点 | 是 | 直接写 `wiki/syntheses/` + 更新 concept/topic |
| 回答本质上是比较、决策或框架总结 | 是 | 直接写 `wiki/syntheses/` |
| 简单事实查询，wiki 已完整覆盖 | 否 | 否 |
| 用户明确说"存一下" | 是 | 按内容判断 |

归档 / 回写操作：
1. **高价值结果**：直接保存到 `wiki/syntheses/{slug}.md`
2. **普通归档结果**：保存到 `outputs/qa/{YYYY-MM-DD}-{slug}.md`
3. 无论问题复杂度如何，都 append 到 `_kb_meta/query_log.md`
4. append 到 `wiki/log.md`
   - 简单查询可只记录问题、命中页面和结论摘要
   - 综合查询额外记录新建 / 更新的 synthesis、concept、topic
5. 如是综合页，同时回写相关 concept / topic
6. 如暂不适合直写 wiki：设 `promote_status: pending`，建议用户运行 `compile --promote`

### 命名规范（query 专用）

- `outputs/qa/` 的 **标题** 默认直接等于用户原问题。
- `outputs/qa/` 的 **文件名** 默认优先直接使用用户原问题；若过长，再做最小必要裁剪，但仍保持可读的完整中文语义。
- 若用户问题本身是中文，禁止只用英文 slug 命名 QA 文件。
- 若 `query` 直接产出 `wiki/syntheses/`，标题优先使用用户原问题或贴近原问题的一句中文结论，不能只保留英文概念名。
- 需要兼顾稳定标识时，可保留英文 `uid`，但不要牺牲人类可读的标题与文件名。

### Phase 5：知识缺口处理

当 Phase 2 发现 wiki 覆盖不足时：

```text
知识缺口 → 建议 raw <补充来源> → compile → 重新 query
```

具体操作：
- 列出缺少数据的具体主题
- 如果能推断补充来源（论文、文章、repo），直接建议 `raw <url>`
- 如果不确定来源，建议 `lint --impute` 用 web search 寻找

## 返回给用户

- 问题的结构化回答
- 研究路径：经过了几轮，追踪了哪些线索
- 引用了哪些 wiki 文档
- 是否写入 `wiki/syntheses/` 或归档到 `outputs/qa/`
- 知识缺口列表（如有）+ 建议的补充操作

## 约束

- 优先基于 wiki 已有内容回答，而非凭空生成
- 多轮研究最多 5 轮，每轮最多追踪 3 条线索
- 归档的 QA 不应替代 wiki 本身的 concepts/topics/syntheses；高价值结果应优先进入 wiki
- 区分"wiki 说了什么"和"LLM 推断了什么"
