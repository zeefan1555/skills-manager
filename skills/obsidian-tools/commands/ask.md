# Ask Command

> **引用规范**：`references/note-format.md`（4 层检索层级、QA Output 格式、promote 状态机）、`references/obsidian-cli.md`（search / backlinks）、`references/markdown.md`（正文格式）

## Trigger

- `ask`
- `search`、`query`、`qa`
- `搜`、`查`、`检索`、`问`、`问答`
- "搜一下 xxx"、"xxx 是什么"、"分析一下"

## 目标

统一入口处理所有知识库查询请求。根据问题复杂度自动选择 shallow（关键词搜索）或 deep（语义推理）模式。检索遵循 4 层层级：L1 index.md → L2 concepts → L3 summaries → L4 raw。

## 模式

### Shallow 模式（默认）

关键词搜索，快速返回匹配笔记列表。

- **工具**：`obsidian search` 或 `rg`
- **适用**：「找一下关于 X 的笔记」「有没有提过 Y」「列出所有 Z 相关的」
- **流程**：
  1. 先读 `wiki/index.md`（唯一索引）做导航——按 area 分组的 concept 目录表快速定位目标 concept
  2. CLI 粗筛：`obsidian search query="..." path="wiki" limit=10`（concept 有中文 title + aliases，中英文关键词都能命中）
  3. 如果命中太少，扩大到 `path="raw"` 再搜一轮
  4. LLM 精排：读取候选笔记 frontmatter + 前 200 字，按相关度排序
  5. 输出 top-3 结果及排序理由

### Deep 模式

语义推理，综合多篇笔记回答复杂问题。

- **工具**：读取相关笔记全文 + LLM 推理
- **适用**：「总结一下我对 X 的认知」「X 和 Y 有什么关系」「比较 A 和 B」
- **流程**：采用多轮自主研究模式，沿 4 层检索层级逐层深入

#### 多轮自主研究（Deep 核心）

```text
  ┌─→ 读取命中的 concept（L2）─→ 提取关键信息
  │                                    │
  │                              发现新线索？
  │                               ↙        ↘
  │                             是           否
  │                             ↓            ↓
  │                     追踪新线索      生成回答
  │                     │
  │    ┌────────────────┤
  │    │                │
  │    ↓                ↓
  │  related concepts   summaries（L3）→ raw（L4）
  │    │                │
  └────┴────────────────┘
```

- 读取命中的 concepts 正文（L2 概念层，含实战笔记）
- **沿 `related` 链接追踪**关联 concept（L2 → L2 横向跳转）
- 需要更多细节时，**下沉到 summaries**（L2 → L3）
- 需要原文时，**继续下沉到 raw**（L3 → L4）
- 检查 backlinks：`obsidian backlinks path="..." counts`
- **每轮最多追踪 3 条新线索**，防止无限递归
- **最多 5 轮**研究循环，超过后总结当前发现并输出

### 自动升级

Agent 根据问题复杂度自动从 shallow 升级到 deep：

| 信号 | 模式 |
|------|------|
| 问题含「找」「有没有」「列出」「哪些」 | shallow |
| 问题含「总结」「比较」「关系」「为什么」「分析」 | deep |
| shallow 结果不足以回答（命中 < 2 或信息不够） | 自动升级 deep |

## 搜索命中计数

对真正被读取、被回答引用、或被用户确认有价值的主笔记维护 `search_hits`：

1. 选择最终真正命中的主笔记（不是所有搜索候选都算）
2. 更新属性（格式见 `references/note-format.md` → Search 运行时属性）：
   - `search_hits += 1`
   - `last_searched_at`
   - 如无 `remnote_status`，初始化为 `new`

## 归档与反哺

### 归档判断标准

| 条件 | 归档 | 反哺（promote） |
|---|---|---|
| 回答涉及 ≥3 个 concepts 的交叉分析 | 是 | 直接写 `wiki/syntheses/` |
| 回答揭示了 wiki 中没有的新知识点 | 是 | 直接写 `wiki/syntheses/` + 更新 concept/topic |
| 回答本质上是比较、决策或框架总结 | 是 | 直接写 `wiki/syntheses/` |
| 简单事实查询，wiki 已完整覆盖 | 否 | 否 |
| 用户明确说"存一下" | 是 | 按内容判断 |

### 归档操作

1. **高价值结果**：直接保存到 `wiki/syntheses/{slug}.md`
2. **普通归档结果**：保存到 `outputs/qa/{YYYY-MM-DD}-{slug}.md`
3. append 到 `wiki/log.md`，格式 `## [{date}] ask | {question}`
4. 如是综合页，同时回写相关 concept / topic
5. 如暂不适合直写 wiki：设 `promote_status: pending`，等 compile 自动扫描并提取

### 命名规范

- `outputs/qa/` 的标题默认直接等于用户原问题
- 文件名默认优先直接使用用户原问题；若过长再做最小必要裁剪
- 若用户问题是中文，禁止只用英文 slug 命名
- `wiki/syntheses/` 标题优先使用用户原问题或贴近原问题的一句中文结论

## 可选扩展：晋升为 RemNote

当以下条件同时满足时触发：

- `search_hits >= 2`
- `remnote_status != exported`
- 笔记不是纯索引、纯导航或极短占位页

执行顺序：

1. 读取目标笔记正文
2. 补充上下文（backlinks、相关 summary / raw）
3. 调用 `remnote-card-designer`
4. 生成备份文件到 `outputs/remnote/`
5. 写入 RemNote Journal
6. 回写导出属性

## 知识缺口处理

当研究过程中发现 wiki 覆盖不足时：

- 列出缺少数据的具体主题
- 如果能推断补充来源（论文、文章、repo），建议 `raw <url>`
- 如果不确定来源，建议 `lint --impute` 用 web search 寻找

## 返回给用户

- 问题的结构化回答
- 使用的模式（shallow / deep）及原因
- 研究路径（deep 模式：经过几轮，追踪了哪些线索，下沉到了哪一层）
- 引用了哪些 wiki 文档
- 是否写入 `wiki/syntheses/` 或归档到 `outputs/qa/`
- 知识缺口列表（如有）+ 建议的补充操作
- 当前 `search_hits`（如触发计数）
- 是否触发了 RemNote 晋升

## 约束

- 优先基于 wiki 已有内容回答，而非凭空生成
- 多轮研究最多 5 轮，每轮最多追踪 3 条线索
- 高价值结果应优先进入 wiki，而非长期停留在 outputs/qa/
- 区分"wiki 说了什么"和"LLM 推断了什么"
- 同一会话内连续重复搜同一篇，不应无限刷 search_hits
- index 页不应作为主笔记计数
- LLM 精排时要给出排序理由，不要黑箱排序
- 日志只写 `wiki/log.md`，不写 `_kb_meta/`
