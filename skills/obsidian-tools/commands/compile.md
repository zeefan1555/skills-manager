# Compile Command

> **引用规范**：`references/note-format.md`（4 层检索层级、Summary / Concept 格式、Concept 合并规则、promote 状态机、Wiki Log 格式）、`references/obsidian-cli.md`（CLI 语法）、`references/markdown.md`（正文格式）

## 设计原则：4 层检索层级

compile 的核心使命是维护知识库的 4 层检索层级（详见 `references/note-format.md`）：

| 层级 | 产物 | compile 职责 |
|------|------|-------------|
| L1 路由层 | `wiki/index.md` | 每次编译后更新：按 area 分组 + 一句话摘要 |
| L2 概念层 | `wiki/concepts/*.md` | 创建/更新概念页，含实战笔记、双向交叉引用 |
| L3 来源层 | `wiki/summaries/*.md` | raw 已生成 Summary，compile 从 inbox/ 读取并移到根目录 |
| L4 原始层 | `raw/{area}/*.md` | 不可变，compile 只读不写 |

**编译方向**：L4 → L3 → L2 → L1。每次编译都要完整走完这 4 层。

## Trigger

- `compile`
- `compare`、`编译`、`整理`、`更新 wiki`

## 目标

把 `wiki/summaries/inbox/` 中待编译的 Summary **和** `outputs/qa/` 中待反哺的问答，增量编译成 wiki 页面，并更新受影响页面：

- `wiki/summaries/`（L3 来源层）
- `wiki/concepts/`（L2 概念层，含实战笔记）
- `wiki/topics/`（主题聚合）
- `wiki/syntheses/`（综合/比较页）
- `wiki/index.md`（L1 唯一索引）
- `wiki/glossary.md`（术语表）
- `wiki/log.md`（操作日志）

**不修改 raw 文件，不移动 raw 文件。** 编译状态通过文件夹位置跟踪（inbox/ = 未编译，根目录 = 已编译）。

## 范围控制

| 用法 | 行为 |
|------|------|
| `compile` | 全量：扫描所有 inbox/ 中未编译 Summary + `outputs/qa/` 中 `promote_status: pending` |
| `compile wiki/summaries/inbox/xxx.md` | 只编译指定文件 |
| `compile --area=networking` | 只编译指定 area 下的未编译文件 |
| `compile --dry-run` | 只列出待编译文件 + 预估影响的 wiki 页面，不写入 |
| `compile --rebuild` | 全量重建：重新编译所有 Summary，重建全部索引 |
| `compile --batch` | 未编译 > 20 时分批处理，每批 10 篇 |

全量重建适用于：索引损坏、目录结构重大变更、concept 命名规范变化后。

## 增量判断机制

compile 通过以下方式判断待编译列表：

1. 列出 `wiki/summaries/inbox/` 下所有 `.md` 文件 = 待编译 Summary
2. **额外扫描** `outputs/qa/` 中 `promote_status: pending` 的文件 = 待反哺 QA

> **文件夹位置是编译状态的 source of truth**：inbox/ = 未编译，summaries 根目录 = 已编译。

## 执行步骤

### 步骤 1：确定待编译列表

- 扫描 `wiki/summaries/inbox/` 下所有 `.md` 文件
- 扫描 `outputs/qa/` 下 `promote_status: pending` 的文件
- 合并为待编译列表
- 如果是 `compile wiki/summaries/inbox/xxx.md` 或 `compile --area=xxx`，按指定范围过滤

### 步骤 2：读取待编译内容

- **Summary 文件**：读取 `wiki/summaries/inbox/` 中的 Summary 文档，提取要点和 tags
- **pending QA 文件**：读取完整正文，提取新知识点

### 步骤 3：确认 Summary 文档（L3 来源层）

- Summary 已由 raw 命令生成，compile 只需确认格式完整。如有问题可补充
- 格式见 `references/note-format.md` → Summary 笔记格式
- 最终路径为 `wiki/summaries/S-{编号}-{slug}.md`（编译完成后从 inbox/ 移到此处）
- 包含原文要点、关键结论、引用 backlink
- 若 vault 主要是中文内容，标题与文件名优先使用中文可读名称

### 步骤 4：抽取/更新 Concept（L2 概念层）— 核心步骤

这是 compile 最重要的步骤，包含 5 个子动作：

#### 4a. 合并判断

从 Summary 中识别出的每个概念，先执行合并判断（规则见 `references/note-format.md` → Concept 合并规则）：

1. 搜索现有 concepts：`obsidian search query="{概念名}" path="wiki/concepts"`
2. 按 3 条规则判断：名称匹配 / 定义重叠 >50% / aliases 包含
3. 命中 → 走更新流程（4b）；未命中 → 走新建流程（4c）
4. 模糊情况 → 提示用户确认，不自动合并

#### 4b. 更新已有 Concept

- **实战笔记追加**：如果新来源包含实操内容（命令、配置、解决方案），在"实战笔记"段**最顶部**插入新条目，格式：
  ```markdown
  ### [{YYYY-MM-DD}] {问题标题}
  > 来源：[[S-xxx]] | 我遇到了：{一句话描述遇到的问题}

  - **原因**：{为什么会出这个问题}
  - **正确做法**：
    - {具体命令或操作步骤}
  ```
- **实战笔记上限**：单个 concept 最多 10 条，超过后旧条目折叠到"历史笔记"段
- **其他更新**：追加 `sources` 引用、更新 `updated` 日期、补充"关键要点"
- 如新来源推翻旧结论，更新 `conflicts` / `open_questions`
- **不要覆盖重写**整个 concept，只做增量追加

#### 4c. 新建 Concept

- 格式见 `references/note-format.md` → Concept 笔记格式
- **title 必须中文**，英文原名放入 `aliases`
- `aliases` 必须包含用户可能搜索的所有变体（中英文、缩写、全称）
- 如果有实操内容，创建时即填写"实战笔记"段
- 如果是纯理论/纯定义的 concept，可以没有实战笔记段

#### 4d. 双向交叉引用

- 为新/更新的 concept A 建立 `related` 链接
- **必须同时回写**：如果 A 的 `related:` 新增了 B，则检查 B 的 `related:` 是否包含 A，不包含则追加
- 执行顺序：先写完新 concept → 再逐个更新已有 concept 的 related 字段

#### 4e. Promote QA 处理

- 对 `outputs/qa/` 中 `promote_status: pending` 的文件：
  - 提取新知识点，按上述 4a-4d 流程处理
  - 完成后更新原 QA 文件的 `promote_status: promoted`

### 步骤 5：识别受影响页面并更新

- **topic**：检查本次新建/更新的 concept 所属 area，如果该 area 下 concept 总数 ≥3，创建或更新 `wiki/topics/{slug}.md`
- **synthesis**：检查本次新建/更新的 concept 之间是否存在冲突、互补或比较关系；如果 ≥2 个 concept 有此关系，创建或更新 `wiki/syntheses/{slug}.md`
- 对受新证据影响的旧页面执行定向重写，而不是只追加来源

### 步骤 6：更新索引（L1 路由层）

维护 2 个文件（不再是 6 个）：

1. **`wiki/index.md`**：按 area 分组的 concept 目录表（模板见 `references/note-format.md` → index.md 模板）
   - 每个 concept 一行：4 列格式 — wikilink + 名称 + 一句话摘要（不超过 20 字，自动生成）+ 最近更新日期
   - "最近动态"段：从 log.md 摘取最近 5 条记录
2. **`wiki/glossary.md`**：如果本次编译产生了新术语，追加到术语表

### 步骤 7：记录编译完成（关键步骤）

- **先将 Summary 从 inbox/ 移到 summaries/ 根目录**（这是编译状态的原子性保证）
- **再写 `wiki/log.md`**：格式为 `## [{date}] compile | {title}`（简化格式，不写 touched/source 列表）
- **再更新 wiki 条目**
- **先移文件再写 log**：文件夹位置是状态 source of truth；移动失败则不继续

> **不再修改 raw 文件**：不写 `status: compiled`，不写 `compiled_at`。raw 的不可变性得到保证。

## 受影响页面更新策略

```text
待编译 Summary（inbox/）+ pending QA（读全文）
    ↓
确认 Summary 文档（L3）
    ↓
识别直接受影响的 concept（L2）
    ↓
实战笔记追加 + 双向交叉引用回写
    ↓
识别这些 concept 所属的 topic
    ↓
如果本次产生了比较、决策、综合分析 → 更新 synthesis
    ↓
刷新 index.md（L1）+ glossary.md + log.md
```

优先级：
- 先改已有页面，再考虑新建页面
- 先改 concept/topic，再决定是否需要 synthesis
- 对"被新证据影响"的旧页面可重写关键结论，不只 append

## 返回给用户

- 本次处理了哪些 Summary（或 promote 了哪些 QA）
- 确认了哪些 Summary 文档
- 新建/更新了哪些 concept / topic / synthesis
- 哪些 concept 追加了实战笔记
- 哪些旧页面被定向更新
- 双向交叉引用回写了哪些 concept
- 疑似重复的 concept 对（需用户确认）
- 建议下一步操作（如 `ask`、`lint`、`status`）

## 约束

- 增量编译优先，不要每次全量重建
- 已有 concept 追加更新优先（实战笔记追加），不静默覆盖重写
- 对受新证据影响的旧结论，不要只追加来源；要明确更新结论或记录冲突
- 如果未编译数量过多（> 20），自动切换 batch 模式，每批 10 篇并报告进度
- 编译输出质量要求：concept / topic / synthesis 不少于 100 字，Summary 覆盖原文核心要点
- 疑似重复 concept 不自动合并，必须提示用户确认
- **不修改 raw 文件**：编译状态由文件夹位置决定（inbox/ → 根目录）
- 日志只写 `wiki/log.md`，不写 `_kb_meta/`
- concept title 必须中文，英文放 aliases
- related 链接必须双向对称
- index.md 一句话摘要不超过 20 字
- compile 不检查 _inbox/ 状态，不拦截
