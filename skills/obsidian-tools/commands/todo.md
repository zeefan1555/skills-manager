
# Todo Command

&gt; **引用规范**：`references/note-format.md`（Vault 目录、命名规范）、`references/obsidian-cli.md`（CLI 语法，可选）、`references/markdown.md`（正文格式）

---

## Trigger

### 显式命令
| 用户输入 | 子命令 |
|----------|--------|
| `todo &lt;内容&gt;` | todo add |
| `todo add &lt;内容&gt;` | todo add |
| `todo run` | todo run |
| `todo process` | todo run |

### 语义路由
| 用户意图 | 子命令 |
|----------|--------|
| “把这个作为 todo 存一下”、“记个 todo：xxx”、“帮我加个待办：xxx” | todo add |
| “帮我处理一下 todo”、“把待办都跑一下”、“todo 全执行” | todo run |

---

## 目标与非目标

### todo add 子命令
#### 目标
- 将内容作为 todo 存到 `todo/_inbox/`
- 包含 frontmatter（元数据）+ 正文（内容 + 备注）
- 保持低摩擦落盘，优先保证成功写入

#### 非目标
- 暂不实现 todo 优先级、依赖关系、截止时间
- 暂不自动移动到 `todo/doing/` 或 `todo/done/`
- 暂不接入 wiki/index.md 或 4 层检索层级

---

### todo run 子命令
#### 目标
- 扫描 `todo/_inbox/` 中的待办列表
- 统计数量 N，向用户确认执行范围
- 使用 `dispatching-parallel-agents` skill 启动 N 个 Sub Agent 并行处理
- 每个 Sub Agent 处理单个 todo，完成后移到 `todo/done/`

#### 非目标
- 暂不实现 todo 之间的依赖调度（暂按文件名顺序/任意顺序处理）
- 暂不实现 todo 优先级排序
- 暂不自动重试失败的 todo

---

## todo add 子命令执行步骤

1. **识别用户输入的“核心内容”和“备注”**
   - 如果用户说“todo：xxx；备注：yyy” → 自动拆分
   - 如果用户只给一段文字 → 整体作为“内容”
2. **生成一句话标题**
   - 优先用用户明确给的；如无，用 LLM 从内容中提取，≤20 字
3. **补齐 frontmatter**
   - `created`：取当前时间，ISO 8601 格式
   - `source`：如用户未提供可以省略
   - `tags`：必带 `[todo]`
4. **构造完整 Markdown 内容**
   - frontmatter + 标题 + `## 内容` section + `## 备注` section（如存在）
5. **写入 `todo/_inbox/`**
   - 使用 Unix 命令：`mkdir -p todo/_inbox` + `cat &gt; todo/_inbox/{filename}.md`
   - 文件名：用一句话标题做 slug（中文优先，连字符分隔），格式：`{YYYY-MM-DD}-{标题-slug}.md`
6. **去重检查（可选）**
   - 按标题 + 内容前 100 字符简单去重，重复时提示用户覆盖/重命名/跳过
7. **记录活动日志**
   - append 到 `wiki/log.md`，格式：`[{datetime}] todo add | [[{filename}]]`
8. **返回给用户**
   - 保存路径（`todo/_inbox/` 中的文件）
   - 当前 todo 总数（`ls todo/_inbox/ todo/doing/ | wc -l`）
   - 建议后续操作（如“要不要现在手动整理到 todo/doing/？”）

---

## todo run 子命令执行步骤

1. **扫描待办**
   - 执行 `ls todo/_inbox/*.md`，列出当前待处理的 todo 列表
   - 统计数量 N
2. **向用户确认执行范围**
   - 显示待办列表（文件名 + 标题）
   - 显示数量 N
   - 明确：将启动 N 个 Sub Agent 并行处理，每个 Sub Agent 处理 1 个 todo
   - 询问用户是否确认执行（Yes/No/仅处理其中一部分）
3. **分发执行（Sub Agent 并行）**
   - 如果用户确认执行：
     - 使用 `dispatching-parallel-agents` skill
     - 分发 N 个独立任务
     - 每个任务分配 1 个 todo 文件作为输入
   - 每个 Sub Agent 处理单个 todo 的步骤：
     - 读取该 todo 的完整内容（frontmatter + 正文）
     - 以正文“备注”作为主要执行上下文，结合正文“内容”确定要做的事
     - 执行任务（按备注和内容的要求，可调用其他 skills/tools）
     - 执行完成后，用任务产出更新该 todo 的正文（可追加 `## 执行结果` section）
     - 将该 todo 从 `todo/_inbox/` 移动到 `todo/done/`
     - append 到 `wiki/log.md`，格式：`[{datetime}] todo run | [[{filename}]]`
4. **汇总反馈**
   - 所有 Sub Agent 完成后，汇总：
     - 成功数量
     - 失败数量（如有失败，列出失败 todo 文件名 + 原因）
     - 所有处理完成的 todo 的保存路径（`todo/done/`）

---

## Todo 笔记格式

### Frontmatter（必填）
```yaml
---
created: {datetime}  # ISO 8601 格式，如 2026-04-18T12:34:56
source: {如有，原文/链接/上下文，可选}
tags:
  - todo
  - {可选：补充标签}
---
```

### 正文
```markdown
# {一句话标题}

## 内容

{用户提供的 todo 核心内容}

## 备注

{用户提供的备注内容，可选；如果用户没给备注，本 section 可以省略}

## 执行结果

{todo run 子命令追加，可选}
```

---

## 约束

- `todo add` 只写入 `todo/_inbox/`，不自动移动到 `todo/doing/` / `todo/done/`
- 正文备注写在正文的“备注” section，不写在 frontmatter
- todo 不强制接入 4 层检索层级，不要求 compile 阶段处理
- 优先落盘成功，不追求完美整理到位
- `todo run` 必须先向用户确认数量和范围，再启动 Sub Agent
- `todo run` 使用 `dispatching-parallel-agents` skill 分发任务，确保每个 Sub Agent 独立运行无共享状态

---

## 工具选择

| 操作 | 推荐工具 | 理由 |
|------|----------|------|
| 创建/写入文件 | `mkdir -p` + `cat &gt; file` | 不依赖 Obsidian 运行状态，更通用 |
| 搜索已有 todo（去重） | `rg` 或 `find` | rg 更快，更通用 |
| 移动文件 | `mv` | 快速可靠 |
