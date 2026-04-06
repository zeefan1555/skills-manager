# Compile Command

> **引用规范**：`references/note-format.md`（Summary / Concept 格式、promote 状态机、Wiki Log 格式）、`references/obsidian-cli.md`（CLI 语法）、`references/markdown.md`（正文格式）

## Trigger

- `compile`
- `compare`、`编译`、`整理`、`更新 wiki`

## 目标

把 `raw/` 中尚未编译的内容增量编译成 wiki 页面，并更新受影响页面：

- `wiki/summaries/`
- `wiki/concepts/`
- `wiki/topics/`
- `wiki/syntheses/`（如 promote 或需要综合更新）
- `wiki/indexes/`
- `wiki/index.md`
- `wiki/log.md`

**不修改 raw 文件，不移动文件。** 编译状态通过 `wiki/log.md` 的编译记录跟踪。

## 增量判断机制

compile 不再依赖 `status` 字段，而是通过以下方式判断哪些 raw 还未编译：

1. 列出 `raw/` 下所有 `.md` 文件（含子目录）
2. 读取 `wiki/log.md` 中所有 `compile` 类型的记录
3. 未出现在 log 编译记录中的文件 = 待编译

> **log 是编译状态的 source of truth**。

## 模式选择

| 模式 | 触发 | 行为 |
|---|---|---|
| **增量**（默认） | `compile` | 只处理未出现在 wiki/log.md 编译记录中的 raw |
| **定向更新** | `compile --target <path-or-slug>` | 只更新某个 concept / topic / synthesis 及其依赖页面 |
| **全量重建** | `compile --rebuild` | 重新编译所有 raw，重建全部索引 |
| **批量** | `compile --batch` | 未编译 > 20 时分批处理，每批 10 篇 |
| **promote** | `compile --promote <path>` | 把 `outputs/qa/` 中高价值输出编译入 wiki |

全量重建适用于：索引损坏、目录结构重大变更、concept 命名规范变化后。

## 执行步骤

1. 扫描 `raw/` 下所有 `.md` 文件，对比 `wiki/log.md` 编译记录，确定待编译列表
2. 如果 `_inbox/` 中有文件，提示用户先跑 `raw --triage`，compile 不处理 _inbox
3. 读取待编译 raw 的 frontmatter 中的 `summary` + `tags`
   - **优先只读 summary**（这是减负核心：raw 阶段已预消化）
   - Fallback：如果 summary 字段为空或概念提取困难，回退读原文全文（标记为 deep-compile）
4. 为每条 raw 生成或更新 summary（source note）
   - 格式见 `references/note-format.md` → Summary 笔记格式
   - 保存到 `wiki/summaries/S-{编号}-{slug}.md`
   - 包含原文要点、关键结论、引用 backlink
   - 若 vault 主要是中文内容，summary 的标题与文件名优先使用中文可读名称
5. 从 summary 抽取 concept — **含合并策略**（见下文）
   - 格式见 `references/note-format.md` → Concept 笔记格式
   - 新概念创建 `wiki/concepts/{slug}.md`
   - 已有概念追加来源和补充内容
   - 概念之间建立 `related` 链接
   - 如新来源推翻旧结论，更新 `conflicts` / `open_questions`
   - 中文工作流下，concept / topic / synthesis 的标题优先中文；英文术语放入 `aliases`
6. 识别受影响页面并更新
   - `topic`：当多个 concept 指向同一主题时，创建或更新 `wiki/topics/{slug}.md`
   - `synthesis`：当 promote 内容、高价值 query 或显式比较问题出现时，创建或更新 `wiki/syntheses/{slug}.md`
   - 对受新证据影响的旧页面执行定向重写，而不是只追加来源
7. 更新索引文件
   - `wiki/indexes/_all_sources.md`
   - `wiki/indexes/_all_concepts.md`
   - `wiki/indexes/_glossary.md`
   - 按 area 分组的子索引：`wiki/indexes/{area}.md`
   - `wiki/index.md`（人类可读首页）
8. **记录编译完成**（关键步骤）
   - 先写 `wiki/log.md`：`## [{date}] compile | {title}`，记录本次编译的文件列表和产出
   - 再更新 wiki 条目
   - **先写 log 再更新 wiki**：保证 log 是状态 source of truth；log 写失败则不继续编译，下次重试

> **不再修改 raw 文件**：不写 `status: compiled`，不写 `compiled_at`。raw 的不可变性得到保证。

## 受影响页面更新策略

```text
待编译 raw（读 summary + tags）
    ↓
生成/更新 source summary
    ↓
识别直接受影响的 concept
    ↓
识别这些 concept 所属的 topic
    ↓
如果本次产生了比较、决策、综合分析 → 更新 synthesis
    ↓
刷新 index.md / indexes / log.md
```

优先级：
- 先改已有页面，再考虑新建页面
- 先改 concept/topic，再决定是否需要 synthesis
- 对"被新证据影响"的旧页面可重写关键结论，不只 append

## Concept 合并策略

先搜索现有 concepts：`obsidian search query="{概念名}" path="wiki/concepts"`

```text
完全匹配 slug  ──→ 直接 append sources + 补充内容
                     │
语义近似（>80%） ──→ 提示用户确认合并
                     │  合并时保留更规范名称，另一个设为 alias
                     │
不确定           ──→ 新建 concept + related 标注疑似重复
```

"语义近似"判断依据：
- 名称只差大小写、复数、缩写（e.g. "LLM" vs "Large Language Model"）
- 定义段落有 >50% 重叠关键词
- 已有 concept 的 `aliases` 包含当前名称

## Promote 模式

当 `query` 或 `lint` 产出了高价值内容（参见 `references/note-format.md` → promote_status 状态机）：

1. 读取 `outputs/qa/` 中 `promote_status: pending` 的文件
2. 提取新的知识点
3. 按标准 compile 流程生成 / 更新 syntheses、topics、concepts 和 summaries
4. 更新原 QA output 的 `promote_status: promoted`

## 返回给用户

- 本次处理了哪些 raw（或 promote 了哪些 QA）
- 新建了哪些 summary
- 新建/更新了哪些 concept / topic / synthesis
- 哪些旧页面被定向更新
- 疑似重复的 concept 对（需用户确认）
- 建议下一步操作（如 `ask`、`lint`、`status`）

## 约束

- 增量编译优先，不要每次全量重建
- 已有 concept 追加更新优先，不静默覆盖
- 对受新证据影响的旧结论，不要只追加来源；要明确更新结论或记录冲突
- 如果未编译数量过多（> 20），自动切换 batch 模式，每批 10 篇并报告进度
- 编译输出质量要求：concept / topic / synthesis 不少于 100 字，summary 覆盖原文核心要点
- 疑似重复 concept 不自动合并，必须提示用户确认
- **不修改 raw 文件**：编译状态只写入 wiki/log.md
- 日志只写 `wiki/log.md`，不写 `_kb_meta/`
