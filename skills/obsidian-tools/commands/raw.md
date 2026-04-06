# Raw Command

> **引用规范**：`references/note-format.md`（Raw 笔记格式、Vault 目录）、`references/obsidian-cli.md`（CLI 语法）、`references/markdown.md`（正文格式）

## Trigger

- `raw`
- `row`、`roll`、`ingest`
- "收录这篇"、"先存一下"、"把这个存到知识库"

## 输入形式

| 形式 | 示例 | 处理方式 |
|---|---|---|
| URL | `raw https://example.com/article` | 抓取正文（Web Clipper 格式优先，或 defuddle / readability） |
| 文本 | `raw <一段文本>` | 直接入库 |
| 本地文件 | `raw /path/to/file.md` | 读取文件内容 |
| PDF | `raw /path/to/paper.pdf` | 提取文本（`pdftotext` 或 python `pymupdf`），保留结构 |
| Git repo | `raw https://github.com/user/repo` | clone --depth 1 → 提取 README + 关键文件，生成 repo 摘要 |
| 批量 | `raw /path/to/folder/` 或 `raw <url1> <url2> ...` | 逐个入库，每个生成独立 raw 笔记 |
| Tweet/Thread | `raw https://x.com/user/status/...` | 提取完整 thread 文本 + 图片 |

## 目标

把原始内容保存到 `raw/{area}/`，只补齐必要 frontmatter，不直接写知识结论。

低摩擦入库 —— 成功落盘是第一优先级。

## 执行步骤

1. 识别输入类型（见上表）
2. 提取内容
   - URL：抓取正文（Obsidian Web Clipper 格式优先，或 defuddle / readability）
   - PDF：`pdftotext` 或 `python3 -c "import fitz; ..."`，保留标题/章节结构
   - Git repo：`git clone --depth 1`，提取 README、核心入口文件、package.json/go.mod 等
   - 批量：逐个处理，失败的跳过并汇总报告
3. 判断领域归属，确定 `raw/{area}/`
4. 生成 raw frontmatter（格式见 `references/note-format.md` → Raw 笔记格式）
5. 多媒体处理
   - 图片：下载到 `raw/{area}/assets/` 并用相对路径引用
   - PDF 内嵌图片：如有重要图表，提取到 `assets/`
   - Repo：不复制整个 repo，只保留提取的摘要文件
6. 保存到 `raw/`（使用 `obsidian create` 或直接文件写入，见 `references/obsidian-cli.md`）
7. 去重检查
   - 按 `source_url` 查找已有笔记
   - 重复时提示用户：覆盖 / 重命名 / 跳过
8. 记录 ingest 活动
   - append 到 `_kb_meta/ingest_log.md`
   - append 到 `wiki/log.md`（仅一句摘要 + 触达路径）
9. 返回给用户
   - 保存路径
   - area
   - `status: pending`
   - 当前 pending 总数
   - 推断可能受影响的页面类型（如 topic / concept）
   - 智能编排建议（pending ≤ 5 → 是否立刻 compile？）

## 批量导入

当输入为目录或多个 URL 时：

```bash
# 目录导入
raw /path/to/articles/

# 多 URL 导入
raw https://url1 https://url2 https://url3
```

每个源生成独立 raw 笔记。处理完成后汇总：

```text
Batch ingest: 5/6 succeeded, 1 failed
  ✓ raw/ml/attention-mechanism.md
  ✓ raw/ml/transformer-architecture.md
  ✗ https://broken-url.com — 404 Not Found
Pending total: 12 → suggest `compile --batch`
```

## 约束

- `raw` 阶段不生成 `wiki/summaries` 或 `wiki/concepts`
- `raw` 阶段不直接写 topic / synthesis 结论页
- 目标是低摩擦入库，不追求一次整理到位
- 如果用户只是"先存一下"，优先成功落盘
- Git repo 不要 clone 完整历史，用 `--depth 1`
- PDF 超过 50 页时只提取前 50 页 + 目录结构，提示用户是否继续
