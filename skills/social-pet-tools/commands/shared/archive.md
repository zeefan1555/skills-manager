# Archive Command

> **命令类型**：`shared`
>
> **引用文件**：`../../references/lesson.md`

## Trigger

- `archive`
- `archive inbox`
- `archive lesson`
- `archive route`
- “把经验先收进 inbox”
- “把 inbox 里的经验写进 lesson”
- “扫描 lesson 里还没处理的经验并路由到命令”

## 目标

`archive` 是 `social-pet-tools` 下统一的经验沉淀命令。

它把经验沉淀拆成 3 个动作：

1. `archive inbox`
2. `archive lesson`
3. `archive route`

整体目标不是“一次性改完所有文档”，而是按下面顺序分层处理：

1. 先把任务中产生的经验收集到 Inbox 草稿箱
2. 再把成熟经验正式写入 `lesson.md`
3. 最后再从 `lesson.md` 自动路由到合适的 `commands/*.md`

## 核心原则

- 经验先收集，后确认，再路由
- 不把探索期判断直接写进具体命令
- `archive inbox` 可以多次执行，必须支持自动去重和增量更新
- `lesson.md` 是长期总账，不删除历史条目，只追加状态和去向
- `archive route` 不要求用户先指定目标命令，而是自动判断最合适落点

## 相关文件

### Inbox 草稿箱

建议固定使用 skill 仓内的：

```text
social-pet-tools/references/archive-inbox.md
```

用途：

- 保存当前 skill 内持续积累的经验草稿
- 允许多次 `archive inbox`
- 允许补证据、补结论、补状态

### Evidence 证据目录

建议固定使用：

```text
social-pet-tools/references/evidence/<date-topic>/
```

要求：

- 每个主题证据目录必须包含 `index.md`
- `index.md` 作为人类入口，汇总背景、错误假设、最终结论、关键文件清单和验证结果
- 如果证据按 round 组织，建议同时提供顶层 `index.json`，并在每个 `round-N/` 下提供 `index.json`
- `evidence` 字段优先记录 `index.md` 路径；如有必要，再追加顶层 `index.json`、round 级 `index.json`、原始请求、响应、日志、截图等具体文件
- Inbox 和 lesson 中引用的证据路径，默认都落在 `social-pet-tools/references/evidence/` 下，不再依赖本地 `docs/social-pet/...`

### Lesson 总账

固定使用：

```text
social-pet-tools/references/lesson.md
```

用途：

- 保存长期经验
- 保存尚未处理和已处理经验的完整历史
- 作为 `archive route` 的来源

## 动作一：archive inbox

### 适用场景

- 当前任务中已经发现并修正了一些错误
- 还没准备好正式写入 `lesson.md`
- 想先把经验沉淀到草稿箱
- 同一轮对话里可能会多次执行，要求自动去重

### 输入

优先读取：

- 当前对话中的纠正、修正和最终结论
- 当前任务的证据文件
- 已有的 `social-pet-tools/references/archive-inbox.md`

### 核心动作

1. 扫描当前任务里新出现的经验候选
2. 读取已有 Inbox
3. 进行语义去重
4. 只新增真正新的经验
5. 对已存在条目补充：
   - `index`
   - 新证据
   - 新结论
   - 最近一次出现时间
   - 状态

### 去重原则

不要按全文字符串去重。

默认按下面 3 项组合判断是否为同一条经验：

- `scope`
- `wrong_assumption`
- 归一化后的 `current_conclusion`

如果三者表达的是同一件事，就视为同一条经验。

### Inbox 条目建议字段

- `draft_id`
- `created_at`
- `last_seen_at`
- `source`
- `topic`
- `scope`
- `wrong_assumption`
- `current_conclusion`
- `index`
- `evidence`
- `status`
- `lesson_id`
- `note`

### Inbox 状态

- `draft`
- `updated`
- `ready-for-lesson`
- `moved-to-lesson`
- `rejected`

### 返回给用户

- 新增多少条经验
- 更新多少条已有经验
- 跳过多少条重复经验
- 哪些条目已接近 `ready-for-lesson`
- Inbox 文件路径

## 动作二：archive lesson

### 适用场景

- 当前任务或长对话已接近结束
- Inbox 里已有较成熟的经验
- 希望把值得长期保留的内容正式写入 `lesson.md`

### 输入

优先读取：

- `social-pet-tools/references/archive-inbox.md`
- `social-pet-tools/references/lesson.md`
- 对应任务证据目录下的 `index.md` 和关键证据文件

### 核心动作

1. 扫描 Inbox 中可入账条目
2. 排除明显未成熟、无证据或不值得保留的内容
3. 将成熟条目写入 `lesson.md`
4. 回头更新 Inbox 原条目：
   - `status`
   - `lesson_id`
   - `note`

### Lesson 入账条件

一条 Inbox 经验至少满足下面条件，才允许进入 `lesson.md`：

1. 原始错误假设明确
2. 修正后结论明确
3. 有可追溯的 `index.md` 入口和证据路径；若按 round 组织，最好同时带顶层或 round 级 `index.json`
4. 具备复用价值
5. 不只是一次性噪音

### 写入要求

- 写入 `lesson.md` 后，不删除 Inbox 原条目
- 同一经验如果已经进入 lesson，不重复生成新的 lesson 条目
- 只补：
  - lesson 的新条目
  - Inbox 到 lesson 的关联关系

### 返回给用户

- 本次写入了多少条 lesson
- 哪些 Inbox 条目被跳过
- 哪些 Inbox 条目已标记为 `moved-to-lesson`
- `lesson.md` 路径

## 动作三：archive route

### 适用场景

- `lesson.md` 中已经积累了一批经验
- 其中部分经验尚未复制到具体命令
- 当前已有子命令可以承接这些经验

### 输入

优先读取：

- `social-pet-tools/references/lesson.md`
- 当前已有的 `skills/social-pet-tools/commands/**.md`

### 核心动作

1. 扫描 `lesson.md` 中未处理的条目
2. 扫描当前已有命令集合
3. 自动判断每条经验最适合落到哪个命令
4. 把经验复制到对应命令
5. 回写 `lesson.md`：
   - `status`
   - `copied_to`
   - `routed_at`
   - `note`

### 路由原则

优先匹配最小作用域：

- `cds`、环境、配置、Excel 修改经验 -> `commands/shared/cds.md`
- 本地测试执行与判定经验 -> `commands/shared/local-test.md`
- 宏观 RPC 编排经验 -> `commands/workflows/goal-rpc-loop.md`
- gap 闭环、round 归因经验 -> `commands/phases/rpc-gap-loop.md`

如果当前没有合适命令：

- 保留在 `lesson.md`
- 不强行复制
- 等未来命令补齐后再执行 `archive route`

### 返回给用户

- 本次扫描了多少条未处理 lesson
- 其中多少条被成功路由
- 哪些条目暂时没有合适命令
- 哪些命令被补充了新经验

## lesson.md 条目格式

`lesson.md` 本身只作为总账和日志文件使用。

推荐条目格式：

```md
## YYYY-MM

### L-YYYYMMDD-NN

- created_at: `YYYY-MM-DD HH:MM:SS +08:00`
- source: `用户纠正 | AI 修正 | 复测结论`
- topic: `<topic>`
- wrong_assumption: `<原始错误假设>`
- verified_conclusion: `<最终验证后的正确结论>`
- scope: `<cds | local-test | goal-rpc-loop | rpc-gap-loop | 未拆分命令>`
- index: `social-pet-tools/references/evidence/<date-topic>/index.md`
- evidence:
  - `social-pet-tools/references/evidence/<date-topic>/index.md`
  - `social-pet-tools/references/evidence/<date-topic>/...`
- status: `active`
- copied_to:
  - `<留空或 commands/<layer>/xxx.md>`
- routed_at: `<留空或 YYYY-MM-DD HH:MM:SS +08:00>`
- note: `<补充说明>`
```

### lesson 状态

- `active`
- `copied`
- `rejected`

## 完成条件

### archive inbox

只有同时满足下面条件才算完成：

1. 已读取当前上下文和现有 Inbox
2. 已完成去重
3. 已把新增或更新内容写回 Inbox
4. 已向用户汇报变更结果

### archive lesson

只有同时满足下面条件才算完成：

1. 已读取 Inbox
2. 已筛出可入账条目
3. 已写入 `lesson.md`
4. 已回写 Inbox 的关联状态

### archive route

只有同时满足下面条件才算完成：

1. 已扫描 `lesson.md` 未处理条目
2. 已扫描当前命令集合
3. 已完成动态路由或明确说明无法路由
4. 已回写 `lesson.md` 的去向状态

## 约束

- 不要把 `archive` 实现成一次性把三步都做完
- 不要在没有证据时把经验写入 `lesson.md`
- 不要在缺少 `index.md` 入口时把经验标记为可复用 lesson
- 不要在 `lesson.md` 中删除已存在经验，只能打标
- 不要要求用户先指定目标命令，`archive route` 应优先自动判断
- 不要把暂时没有落点的经验强行塞进不相关命令
