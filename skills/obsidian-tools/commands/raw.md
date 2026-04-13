# Raw Command

> **引用规范**：`references/note-format.md`（Raw 笔记格式、Summary 格式、Vault 目录、Area 管理）、`references/obsidian-cli.md`（CLI 语法）、`references/markdown.md`（正文格式）

## Trigger

- `raw`
- `row`、`roll`、`ingest`
- "收录这篇"、"先存一下"、"把这个存到知识库"

## 输入形式

| 形式 | 示例 | 处理方式 |
|---|---|---|
| URL | `raw https://example.com/article` | 按 URL 路由表抓取正文 |
| 文本 | `raw <一段文本>` | 直接入库 |
| 本地文件 | `raw /path/to/file.md` | 读取文件内容 |
| PDF | `raw /path/to/paper.pdf` | 提取文本（`pdftotext` 或 python `pymupdf`），保留结构 |
| Git repo | `raw https://github.com/user/repo` | clone --depth 1 → 提取 README + 关键文件，生成 repo 摘要 |
| 批量 | `raw /path/to/folder/` 或 `raw <url1> <url2> ...` | 逐个入库，每个生成独立 raw 笔记 |
| Tweet/Thread | `raw https://x.com/user/status/...` | 提取完整 thread 文本 + 图片 |

## URL 抓取路由表

根据 URL 模式选择抓取工具，确保最佳抓取质量：

| URL 模式 | 抓取工具 | 说明 |
|----------|----------|------|
| `*.larkoffice.com/*`, `*.feishu.cn/*` | feishu-docx CLI | 见 `references/feishu-docx.md` |
| `*.bytedance.net/*`（内网） | bytedcli-tools | ~/.skills-manager/skills/bytedcli-tools/ |
| 其他所有 URL | agent-reach | ~/.skills-manager/skills/agent-reach/ |



## 目标

把原始内容保存到 `raw/{area}/`，补齐 frontmatter，生成 summary，并产出 Summary 文档到 `wiki/summaries/_inbox/`。

低摩擦入库 —— 成功落盘是第一优先级。

## 执行步骤

1. 识别输入类型（见上表）
2. 提取内容
   - URL：按路由表选择工具抓取正文
   - PDF：`pdftotext` 或 `python3 -c "import fitz; ..."`，保留标题/章节结构
   - Git repo：`git clone --depth 1`，提取 README、核心入口文件、package.json/go.mod 等
   - 批量：逐个处理，失败的跳过并汇总报告
3. **Area 归类**
   - LLM 分析内容语义，匹配 `raw/` 下已有的 area 文件夹
   - 如果现有 area 都不合适，创建新 area 文件夹（命名规则见 `references/note-format.md` → Area 管理）
4. **生成 summary**（3-5 句）
   - 必须覆盖每个 tag 对应的核心观点
   - 写入 frontmatter 的 `summary:` 字段
5. 生成完整 frontmatter（格式见 `references/note-format.md` → Raw 笔记格式）
6. 多媒体处理
   - 图片：统一下载到 `raw/assets/`，避免每篇笔记各自维护附件目录
   - Markdown/Obsidian 正文中的图片统一改写为 `raw/assets/...` 路径引用
   - PDF 内嵌图片：如有重要图表，也提取到 `raw/assets/`
   - Repo：不复制整个 repo，只保留提取的摘要文件
7. **直接写入 `raw/{area}/`**
   - 使用 Unix 命令：`mkdir -p raw/{area}` + `cat > raw/{area}/{filename}.md`
   - 也可使用 `obsidian create`（见 `references/obsidian-cli.md`），但 Unix 命令更通用
   - **文件直接写入最终位置，不经过 _inbox/**
   - 附件文件名需要加前缀避免冲突，推荐：`{note-slug}--{asset-name}`
8. 去重检查
   - 按 `source_url` 查找已有笔记（`rg 'source_url: {url}' raw/`）
   - 重复时提示用户：覆盖 / 重命名 / 跳过
10. 记录活动
    - append 到 `wiki/log.md`，格式 `[{date}] ingest | {title}`
11. 返回给用户
    - 保存路径（raw 文件 + Summary 文档）
    - area
    - summary 摘要
    - 当前未编译总数（`ls wiki/summaries/_inbox/ | wc -l`）
    - 推断可能受影响的页面类型（如 topic / concept）
    - 智能编排建议（未编译 ≤ 5 → 是否立刻 compile？）

## 不可变约束

raw 文件一旦写入 `raw/{area}/`，正文和 frontmatter 均不可修改。如需修正，删除原文件重新收录。

编译状态由文件夹位置体现（`wiki/summaries/_inbox/` = 未编译，`wiki/summaries/` 根目录 = 已编译），不回写 raw 文件。



> **原子性保证**：采用"写新删旧"策略。先在 `raw/{area}/` 写入完整新文件并生成 Summary 文档到 `wiki/summaries/_inbox/`，成功后才删除 `_inbox/` 中的原文件。这样要么成功（新文件在 raw/{area}/ + Summary 在 wiki/summaries/_inbox/），要么失败（原文件仍在 _inbox/），不会出现半成品。

触发方式：`raw --triage` 或当用户说"处理一下 _inbox"时自动触发。

## 批量导入

当输入为目录或多个 URL 时：

```bash
# 目录导入
raw /path/to/articles/

# 多 URL 导入
raw https://url1 https://url2 https://url3
```

每个源生成独立 raw 笔记 + Summary 文档。处理完成后汇总：

```text
Batch ingest: 5/6 succeeded, 1 failed
  ✓ raw/ml/attention-mechanism.md
  ✓ raw/ml/transformer-architecture.md
  ✗ https://broken-url.com — 404 Not Found
Uncompiled total: 12 → suggest `compile --batch`
```

## 工具选择

| 操作 | 推荐工具 | 理由 |
|------|----------|------|
| 创建/写入文件 | `mkdir -p` + `cat > file` | 不依赖 Obsidian 运行状态，更通用 |
| 搜索已有笔记（去重） | `rg` 或 `obsidian search` | rg 更快，CLI 更精确 |
| 读取 frontmatter | `obsidian read --properties` | 解析 YAML 更可靠 |

## 约束

- `raw` 阶段生成 Summary 文档到 `wiki/summaries/_inbox/`，但不生成 `wiki/concepts`
- `raw` 阶段不直接写 topic / synthesis 结论页
- 目标是低摩擦入库，不追求一次整理到位
- 如果用户只是"先存一下"，优先成功落盘
- Git repo 不要 clone 完整历史，用 `--depth 1`
- PDF 超过 50 页时只提取前 50 页 + 目录结构，提示用户是否继续
- 日志只写 `wiki/log.md`
