---
name: feishu-docx
description: Use when reading, exporting, writing, or managing Feishu/Lark docs, sheets, bitable, wiki, or WeChat article content, especially when exporting knowledge into the local workspace.
---

# Feishu Docx

把飞书 / Lark 文档导出为 Markdown，或直接创建、追加、更新文档内容。适合把知识库内容拉到本地工作区给 AI 使用，或把整理好的内容再写回飞书。

## 何时使用

- 需要把飞书文档、知识库、表格导出到本地
- 需要把导出的内容放进当前项目，例如默认放到 `raw/`
- 需要创建飞书文档、向文档追加 Markdown、更新指定 Block
- 需要导出公众号文章、批量导出 Wiki、查看云空间文件
- 普通 API 导出拿不到完整资源时，需要走浏览器导出

## 一次性配置

```bash
feishu-docx config set --app-id YOUR_APP_ID --app-secret YOUR_APP_SECRET
```

说明：

- 默认使用 `tenant_access_token`
- Token 会自动刷新
- 不需要每次重新授权

查看当前配置：

```bash
feishu-docx config show
```

## 常用命令

| 命令 | 用途 |
|------|------|
| `feishu-docx export <URL>` | 导出飞书文档到 Markdown |
| `feishu-docx export-browser <URL>` | 用浏览器会话导出，带本地资源 |
| `feishu-docx export-wechat <URL>` | 导出公众号文章 |
| `feishu-docx export-wiki-space <URL>` | 批量导出整个知识空间 |
| `feishu-docx create <TITLE>` | 创建文档 |
| `feishu-docx write <URL>` | 向文档追加 Markdown |
| `feishu-docx update <URL>` | 更新指定 Block |
| `feishu-docx drive ls` | 列出云空间文件 |
| `feishu-docx drive perm-show <TOKEN>` | 查看公开权限 |
| `feishu-docx drive perm-members <TOKEN>` | 查看权限成员 |
| `feishu-docx tui` | 打开交互式终端界面 |

## 默认导出模板

当前项目里优先把文档导出到 `raw/`。

导出单篇文档：

```bash
feishu-docx export "<FEISHU_URL>" -o ./raw
```

导出公开文档或当前浏览器会话可读文档：

```bash
feishu-docx export-browser "<FEISHU_OR_LARK_URL>" -o ./raw
```

导出公众号文章：

```bash
feishu-docx export-wechat "<WECHAT_URL>" -o ./raw
```

## 当前项目推荐命令

把飞书文档导出到 `raw/`：

```bash
/Users/bytedance/Library/Python/3.14/bin/feishu-docx export "<FEISHU_URL>" -o ./raw
```

如果已经把用户级 bin 目录加入 `PATH`，可以直接用：

```bash
feishu-docx export "<FEISHU_URL>" -o ./raw
```

## 浏览器导出

当文档是公开链接，或 API 导出缺图片、附件、白板、图表时，优先用 `export-browser`。

先安装依赖：

```bash
pip install playwright
playwright install chromium
```

然后导出：

```bash
feishu-docx export-browser "<FEISHU_OR_LARK_URL>" -o ./raw
```

也可以复用已有 Playwright 登录态：

```bash
feishu-docx export-browser "<FEISHU_OR_LARK_URL>" --storage-state ./storage_state.json -o ./raw
```

## 支持类型

- `docx`：飞书云文档
- `sheet`：电子表格
- `bitable`：多维表格
- `wiki`：知识库节点
- `wechat`：公众号文章
- `browser-readable docs`：浏览器可访问文档，连同本地资源一起导出

## 写回飞书

创建文档：

```bash
feishu-docx create "文档标题"
```

把本地 Markdown 追加到文档：

```bash
feishu-docx write "<DOC_URL>" --file ./raw/example.md
```

更新指定 Block：

```bash
feishu-docx update "<DOC_URL>" --block-id BLOCK_ID --file ./raw/example.md
```

## 云空间管理

列出应用云空间中的 docx：

```bash
feishu-docx drive ls --type docx
```

查看文档公开权限：

```bash
feishu-docx drive perm-show "<DOC_URL_OR_TOKEN>"
```

查看权限成员：

```bash
feishu-docx drive perm-members "<DOC_URL_OR_TOKEN>"
```

## 注意事项

- 默认优先用 `export`
- 遇到图片、附件、白板、图表不完整时，切到 `export-browser`
- 当前项目导出目录默认用 `./raw`
- 批量删除云空间文件前，先用 `drive ls` 确认范围

### Export a wiki page

```bash
feishu-docx export "https://xxx.feishu.cn/wiki/ABC123" -o ./docs
```

### Export a document with custom filename

```bash
feishu-docx export "https://xxx.feishu.cn/docx/XYZ789" -o ./docs -n meeting_notes
```

### Export a public or browser-readable doc in a real browser session

```bash
feishu-docx export-browser "https://xxx.larkoffice.com/wiki/ABC123" -o ./browser_docs
```

### Read content directly (recommended for AI Agent)

```bash
# Output content to stdout instead of saving to file
feishu-docx export "https://xxx.feishu.cn/wiki/ABC123" --stdout
# or use short flag
feishu-docx export "https://xxx.feishu.cn/wiki/ABC123" -c
```

### Export with Block IDs (for later updates)

```bash
# Include block IDs as HTML comments in the Markdown output
feishu-docx export "https://xxx.feishu.cn/wiki/ABC123" --with-block-ids
# or use short flag
feishu-docx export "https://xxx.feishu.cn/wiki/ABC123" -b
```

### Batch Export Entire Wiki Space

```bash
# Export all documents in a wiki space (auto-extract space_id from URL)
feishu-docx export-wiki-space "https://xxx.feishu.cn/wiki/ABC123" -o ./wiki_backup

# Specify depth limit
feishu-docx export-wiki-space "https://xxx.feishu.cn/wiki/ABC123" -o ./docs --max-depth 3

# Export with Block IDs for later updates
feishu-docx export-wiki-space "https://xxx.feishu.cn/wiki/ABC123" -o ./docs -b
```

### Export Database Schema

```bash
# Export bitable/workspace database schema as Markdown
feishu-docx export-workspace-schema <workspace_id>

# Specify output file
feishu-docx export-workspace-schema <workspace_id> -o ./schema.md
```

## Write Documents (CLI)

### Create Document

```bash
# Create empty document
feishu-docx create "我的笔记"

# Create with Markdown content
feishu-docx create "会议记录" -c "# 会议纪要\n\n- 议题一\n- 议题二"

# Create from Markdown file
feishu-docx create "周报" -f ./weekly_report.md

# Create in specific folder
feishu-docx create "笔记" --folder fldcnXXXXXX

# Create from a WeChat article URL
feishu-docx create --url "https://mp.weixin.qq.com/s/xxxxx"
```

**如何获取 folder token**:
1. 在浏览器中打开目标文件夹
2. 从 URL 中提取 token：`https://xxx.feishu.cn/drive/folder/fldcnXXXXXX`
3. `fldcnXXXXXX` 就是 folder token

### Append Content to Existing Document

```bash
# Append Markdown content
feishu-docx write "https://xxx.feishu.cn/docx/xxx" -c "## 新章节\n\n内容"

# Append from file
feishu-docx write "https://xxx.feishu.cn/docx/xxx" -f ./content.md
```

## Manage Drive Files

```bash
# List app cloud-space documents
feishu-docx drive ls --auth-mode tenant --type docx

# List personal cloud-space documents
feishu-docx drive ls --auth-mode oauth --type docx

# Show public permission
feishu-docx drive perm-show "https://xxx.feishu.cn/docx/ABC123"

# List permission members
feishu-docx drive perm-members "https://xxx.feishu.cn/docx/ABC123"

# Clear files with double confirmation
feishu-docx drive clear --type docx
```

### Update Specific Block

```bash
# Step 1: Export with Block IDs
feishu-docx export "https://xxx.feishu.cn/docx/xxx" -b -o ./

# Step 2: Find block ID from HTML comments
# <!-- block:blk123abc -->
# # Heading
# <!-- /block -->

# Step 3: Update the specific block
feishu-docx update "https://xxx.feishu.cn/docx/xxx" -b blk123abc -c "新内容"
```

> **Tip for AI Agents**: When you need to update a specific section:
> 1. Export with `-b` to get block IDs
> 2. Find the target block ID from HTML comments
> 3. Use `feishu-docx update` with that block ID

## Tips

- Images and attachments auto-download to `{doc_title}/` folder when local assets are available
- Prefer `export-browser` for public share links or browser-readable docs
- Use `--stdout` or `-c` for direct content output (recommended for agents)
- Use `-b` to export with block IDs for later updates
- Token auto-refreshes, no re-auth needed
- For Lark (overseas): add `--lark` flag
- `tenant_access_token` manages app cloud space, `user_access_token` manages personal cloud space
