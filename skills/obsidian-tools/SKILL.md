---
name: obsidian-tools
description: "Unified agent guide for Obsidian knowledge base workflows. Use when the task involves saving source material (raw), compiling pending notes into wiki (compile), querying existing knowledge in the vault (query), asking AI questions and saving answers (ask), rendering visual outputs like slides or charts (output), running health checks (lint), checking vault status (status), or any Obsidian CLI / Markdown / Bases operation. Routes by explicit command or semantic intent; commands live in commands/, shared specs live in references/."
---

# Obsidian Tools — 统一入口

给 agent 的 Obsidian 知识库操作入口。读完这个文件后，遇到知识库相关任务，优先使用 `obsidian-tools` 路由，而不是手写文件操作或拼临时脚本。

## 4 层检索层级

知识库的核心杶构原则——所有命令都围绕这 4 层展开：

| 层级 | 位置 | 职败 |
|------|------|------|
| L1 路由层 | `wiki/index.md` | 按 area 分组的概念目录，一句话摘要，快速定位 |
| L2 概念层 | `wiki/concepts/*.md` | 跨来源概念页，含实战笔记，回答大多数问题 |
| L3 来源层 | `wiki/summaries/*.md` | 单来源的详细分析页 |
| L4 原始层 | `raw/{area}/*.md` | 不可变的原始材料 |

- **compile** 从 L4 往上构建：raw → summary → concept → index.md
- **query** 从 L1 往下检索：index.md → concept → summary → raw

## 目录结构

```text
obsidian-tools/
├── SKILL.md                ← 你在这里：统一入口 + 路由
├── commands/               ← 命令型文档（每个对应一个用户可触发的操作）
│   ├── raw.md              ← 收录原始内容
│   ├── compile.md          ← 增量编译 → wiki
│   ├── query.md            ← 知识库内检索（搜索 + 问答）
│   ├── ask.md              ← AI 解答（知识库外）+ 存入知识库
│   ├── output.md           ← 多格式可视化输出
│   ├── lint.md             ← 健康检查 + 补值
│   └── status.md           ← 知识库状态概览
└── references/             ← 参考型文档（公共规范，被 commands/ 引用）
    ├── note-format.md      ← 笔记格式、4 层检索层级、frontmatter、目录结构
    ├── obsidian-cli.md     ← Obsidian CLI 命令参考
    ├── markdown.md         ← Obsidian Markdown 语法
    ├── feishu-docx.md      ← 飞书文档抓取工具
    ├── raw.md              ← raw 命令简版参考
    └── bases.md            ← Obsidian Bases (.base 文件)

vault/
├── _Project/               ← 正在工作的目录
├── raw/                    ← L4 原始层
│   ├── _inbox/             ← raw 命令写入，compile 后移到 {area}/
│   └── {area}/             ← 已编译的 raw（按 area 分子目录），不可变
├── wiki/
│   ├── index.md
│   ├── log.md
│   ├── glossary.md
│   ├── summaries/          ← L3 来源层
│   │   └── _inbox/         ← compile Phase A 生成，compile Phase B 后移到根目录
│   ├── concepts/
│   ├── topics/
│   └── syntheses/
├── outputs/
│   ├── qa/
│   │   └── _inbox/          ← 待反哺 QA，compile 后移到根目录
│   ...
├── todo/                    ← todo 根目录
│   ├── _inbox/              ← todo add 写入，待分类/整理/执行
│   ├── doing/               ← 进行中的 todo
│   └── done/                ← 已完成的 todo
```

**加载规则**：

- agent 首先读取本文件（SKILL.md），获得路由和全局原则。
- 用户触发命令时，按路由表加载 `commands/` 下对应文件。
- `commands/` 中的文件按需引用 `references/` 下的公共规范，不重复定义。
- `references/` 不直接对应用户命令，只在被 `commands/` 引用或用户显式查阅时加载。

## 何时使用

当任务涉及以下任一操作时，优先考虑本 skill：

| 意图 | 命令 | 文件 |
|---|---|---|
| 存文章/链接/PDF/Git repo/批量导入 | `raw` | `commands/raw.md` |
| 编译未处理的 raw 为 wiki | `compile` | `commands/compile.md` |
| 只编译指定文件或 area | `compile raw/xxx.md` / `compile --area=xxx` | `commands/compile.md` |
| 预览待编译列表 | `compile --dry-run` | `commands/compile.md` |
| 检索知识库已有知识 | `query` | `commands/query.md` |
| 向 AI 提问（知识库外）+ 存入知识库 | `ask` | `commands/ask.md` |
| 生成幻灯片/图表/canvas | `output` | `commands/output.md` |
| 健康检查/补值/趋势对比 | `lint` | `commands/lint.md` |
| 查看知识库状态 | `status` | `commands/status.md` |
| 查看 CLI 用法 | `cli` | `references/obsidian-cli.md` |
| 查看 Markdown 语法 | `markdown` | `references/markdown.md` |
| 操作 .base 文件 | `bases` | `references/bases.md` |
| 把内容作为 todo 存到知识库 / 批量执行待办 | `todo` | `commands/todo.md` |

## 前置检查

每次新会话首次操作前，执行连通性检查：

```bash
# 1. 确认 CLI 可用
obsidian help

# 2. 确认 vault 可访问
ls "${OBSIDIAN_ROOT}/raw" "${OBSIDIAN_ROOT}/wiki" 2>/dev/null
```

如果 `obsidian help` 失败，退化策略：`rg` / `find` / 直接文件操作，并提示用户检查 Obsidian 是否运行。

## 工作原则

1. **4 层检索层级**：所有命令围绕 L1（index.md 路由）→ L2（concept 回答）→ L3（summary 细节）→ L4（raw 原文）展开。compile 从下往上构建，query 从上往下检索。
2. **工具选择按操作类型**：`写文件/创建 → Unix 命令 (mkdir, cat, mv) | 搜索/属性/反向链接 → Obsidian CLI | 批量文本扬描 → rg/find`。不强制统一用 CLI，按场景选最合适的。
3. **Wiki-first**：真正覀持续维护的是 `wiki/`，不是临时回答。高价值知识优先沉淀为 `summary / concept / topic / synthesis` 页面。
4. **LLM 写、人不碰**：wiki 的主体由 LLM 编写和维护；原始材料保持可溯源，结构化页面负责吸收与演化。
5. **编译状态通过文件夹位置跟踪：3 个 _inbox（`raw/_inbox/`、`wiki/summaries/_inbox/`、`outputs/qa/_inbox/`）= 未编译/待处理，对应根目录 = 已编译/已处理。不回写 raw**。
6. **页面演化优先于命令完成**：完成某个命令不是终点；关键是判断哪些页面因此受影响，并及时更新它们。
7. **自主深入**：遇到复杂问题时，不要只做一轮查找就结束。像研究员一样：读 → 发现线索 → 追踪 → 再读 → 直到充分回答。
8. **反哹闭环**：每次 query / ask / lint / output 产生的高价值结果，都优先考虑直接更新 wiki，而不是只停留在 `outputs/`。需要反哺的 QA 保存到 `outputs/qa/_inbox/`，compile 默认扫描所有 _inbox 文件夹自动处理。
9. **统一日志**：所有操作日志写入 `wiki/log.md`，不使用 `_kb_meta/`。log 是活动日志（activity log），不用于跟踪编译状态。
10. **唯一索引 + 操作日志并重**：`wiki/index.md` 是唯一的导航入口，`wiki/log.md` 是时间序列上下文；二者都要持续维护。
11. **中文优先命名**：标题与文件名优先用中文；concept / topic 的英文名放到 aliases。
12. **问题型产物保留原问题**：`query` 落到 `outputs/qa/` 时，默认用用户原问题作为标题和文件名。
13. 不确定命令参数时先看帮助：`obsidian help` / `obsidian <command> --help`。
14. 回复用户时做摘要——返回关键信息和下一步建议，不要整段输出原始内容。

## 错误处理

- **CLI 不可用**：退化到 `rg` / `find` / 直接文件操作，并在输出中提示用户。
- **CLI 返回错误**：读取 stderr，判断是参数错误还是 vault 问题。参数错误先 `--help`；vault 问题提示用户检查 Obsidian 状态。
- **文件冲突**：已有同路径文件时，默认不覆盖，提示用户选择覆盖 / 重命名 / 跳过。
- **超时**：长时间操作（批量 compile > 20 篇）分批执行，每批报告进度。
## 知识管理流程

### 核心闭环

```text
                     ┌─── web search 补值 ───┐
                    │                       ↓
raw → compile → wiki pages → query / ask / output / lint
       ↑           │              │
       │           │              ↓
       │           │        synthesis/topic updates
       │           ↓               │
       │      index.md + log      │
       └─────────── feedback loop ─┘
```

### 阶段说明

| 阶段 | 命令 | 作用 | 输入 | 输出 |
|---|---|---|---|---|
| **收录** | `raw` | 低摩擦入库 | URL / 文本 / PDF / repo / 批量 | `raw/_inbox/*.md` + `wiki/log.md` |
| **编译** | `compile` | 增量编译（含 Summary 生成）+ 受影响页面更新 + 待反哺 QA 处理 | _inbox 文件夹中的待编译文件 | `wiki/summaries/` + `wiki/concepts/`（含实战笔记）+ `wiki/topics/` + `wiki/syntheses/` + `wiki/index.md` + `wiki/log.md` |
| **检索** | `query` | shallow 搜索 + deep 推理，沿 4 层层级检索 | 用户查询/问题 | 结构化回答 + `wiki/syntheses/` 或 `outputs/qa/` |
| **问答** | `ask` | AI 解答（知识库外）+ 引导存入知识库 | 用户问题 | AI 回答 + 可选 `raw/_inbox/` 存储 |
| **软出** | `output` | 多格式可视化 | wiki 内容 用户指令 | `outputs/slides/` / `outputs/charts/` / `.canvas` |
| **健检** | `lint` | 6 维检查 + web search 补值 | wiki 全量 | `outputs/health/` 报告 |
| **状倁** | `status` | 只读快照 + 增长趋势 | vault 元数据 | 终端输出 |

### 数据流向

```text
外部世界 ──→ _inbox/ ──(raw --triage)──→ raw/_inbox/
               │                            │
用户主动收录 ──(raw)──→ raw/_inbox/
                              │
                    compile 扫描 3 个 _inbox
                              │
                  ┌─────────┼─────────┐
                  ↓         ↓         ↓
             raw/{area}/  summaries/  outputs/qa/
                              │
                              ↓
                          wiki pages
```

- **raw → wiki**：由 `compile` 驱动，扫描 `raw/_inbox/`、`outputs/qa/_inbox/` 等 _inbox 做增量编译
- **wiki → outputs**：由 `query` / `ask` / `output` / `lint` 驱动
- **outputs → wiki**：需要反哺的 QA 保存到 `outputs/qa/_inbox/`，compile 扫描 _inbox 自动处理（反哺闭环）
- **_inbox → raw**：由 `raw --triage` 驱动，处理 Web Clipper 等外部落地文件

## 命令路由

### 显式路由

| 用户输入 | 路由到 |
|---|---|
| `raw <url\|文本\|文件>` | `commands/raw.md` |
| `compile` / `编译` / `整理` | `commands/compile.md` |
| `compile raw/xxx.md` / `compile --area=xxx` / `compile --dry-run` | `commands/compile.md` |
| `query <question>` / `搜 xxx` / `search` / `检索` / `查` | `commands/query.md` |
| `ask <question>` / `问 xxx` / `问答` / "帮我解答" / "解释一下" | `commands/ask.md` |
| `output` / `render` / `生成幻灯片` | `commands/output.md` |
| `lint` / `health` / `检查` | `commands/lint.md` |
| `status` / `概览` | `commands/status.md` |
| `cli` / `obsidian-cli` | `references/obsidian-cli.md` |
| `markdown` / `md` | `references/markdown.md` |
| `bases` / `base` | `references/bases.md` |
| `todo &lt;内容&gt;` / `todo add &lt;内容&gt;` | `commands/todo.md` → todo add |
| `todo run` / `todo process` | `commands/todo.md` → todo run |

### 语义路由（无显式命令时）

| 用户意图 | 路由到 |
|---|---|
| "把这篇存到知识库" | `raw` |
| "帮我编译一下" | `compile` |
| "搜一下 xxx" / "xxx 是什么？"（知识库里有） | `query` |
| "帮我解答 xxx" / "这个怎么理解"（知识库里没有） | `ask` |
| "做个幻灯片" / "画个对比图" | `output` |
| "知识库有什么问题吗" | `lint` |
| "现在知识库什么情况" | `status` |
| "把这个作为 todo 存一下" / "记个 todo：xxx" / "帮我加个待办：xxx" | `todo add` |
| "帮我处理一下 todo" / "把待办都跑一下" / "todo 全执行" | `todo run` |

一条消息里有多个命令时，按书写顺序逐个执行。

## 智能编排

以下场景自动触发多步操作，无需用户逐个指定：

| 触发条件 | 自动编排 |
|---|---|
| `raw` 完成且当前未编译 ≤ 5 | 提示用户是否立刻 `compile` |
| `raw` 完成且当前未编译 > 5 | 自动建议 `compile --batch` |
| `raw` 完成且能推断受影响 topic/concept | 提示用户优先定向 `compile` |
| `query` 发现知识缺口 | 建议 `raw <补充来源>` → `compile`，或用 `ask` 向 AI 提问 |
| `query` 输出高价值且跨 2 个以上页面 | 优先写入 `wiki/syntheses/` |
| `ask` 回答有沉淀价值 | 建议用 `raw` 存入知识库 → `compile` |
| `lint` 发现 missing data | 建议 `lint --impute` |
| `lint` 发现结论失效或证据漂移 | 建议定向 `compile` 更新受影响页面 |
| `lint` 发现未编译积压 | 自动建议 `compile` |
| `_inbox/` 中有文件 | 提示 `raw --triage` 处理 |
| 首次使用 / 新会话 | 建议先 `status` 了解当前状态 |
| `todo/_inbox/` 中有 &gt;0 个文件 | 提示用户是否 `todo run` |

## 给 agent 的建议执行顺序

1. **前置检查**：`obsidian help` + vault 可访问性。
2. **判断意图**：路由到对应 `commands/` 文件。
3. **加载参考**：命令文件中引用的 `references/` 按需加载。
4. **执行命令**：按命令文件的步骤操作。
5. **评估受影响页面**：这次操作影响哪些 `summary / concept / topic / synthesis / index.md / log`？
6. **反馈闭环**：优先直写 wiki；若暂不适合直写，保存到 `outputs/qa/_inbox/` 等待 compile 处理。
7. **摘要返回**：关键信息 + 下一步建议。

## 前置条件

- Vault 根目录：`/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent`
  - 环境变量：`OBSIDIAN_ROOT` 指向此路径
- Obsidian CLI 可用（Obsidian 需运行中），并按操作类型选择工具
- RemNote 输出依赖 `remnote-cli`
- 可视化输出依赖 `marp-cli`（slides）、`python3 + matplotlib`（charts）

## 公共参考规范

以下 `references/` 文件被多个命令引用，定义了跨命令的公共约定：

| 参考文件 | 定义内容 | 被引用于 |
|---|---|---|
| `references/note-format.md` | Vault 目录、4 层检索层级、所有笔记格式、frontmatter 字段、Concept 合并规则、Area 管理 | 所有命令 |
| `references/obsidian-cli.md` | CLI 语法、常用命令、参数约定、何时用 CLI vs Unix 命令 | raw、compile、query、lint、status |
| `references/markdown.md` | Obsidian Markdown 语法（wikilinks、callouts、frontmatter） | raw、compile、query、output |
| `references/feishu-docx.md` | 飞书文档抓取工具用法 | raw（URL 路由） |
| `references/bases.md` | .base 文件语法（filters、formulas、views） | 独立使用 |
| `../remnote-card-designer/SKILL.md` | RemNote 卡片设计约定 | query（晋升时调用） |
