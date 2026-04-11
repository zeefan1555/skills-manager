---
name: feishu-docx
description: 当你需要读取、分析、写入或管理飞书/Lark 知识库内容时使用。支持 docx、sheet、bitable、wiki、微信公众号文章导入导出、云盘管理，以及面向公开文档或浏览器可读文档的浏览器导出。
---

# 飞书 Docx 导出器

将飞书/Lark 云文档导出为 Markdown，便于 AI 进行分析、写作和自动化处理。

## 安装（一次性）

```bash
pip install feishu-docx
feishu-docx config set --app-id YOUR_APP_ID --app-secret YOUR_APP_SECRET
```

> Token 会自动刷新，无需人工交互。

### 可选：基于浏览器的导出

`export-browser` 需要 Playwright 和 Chromium 运行时：

```bash
pip install playwright
playwright install chromium
```

## 导出文档

```bash
feishu-docx export "<FEISHU_URL>" -o ./output
```

导出的 Markdown 文件会以文档标题作为文件名保存。

如果文档是公开文档，或只能在你当前浏览器会话中读取，优先使用：

```bash
feishu-docx export-browser "<FEISHU_OR_LARK_URL>" -o ./output
```

也可以复用现有的 Playwright 会话：

```bash
feishu-docx export-browser "<FEISHU_OR_LARK_URL>" --storage-state ./storage_state.json
```

### 支持的文档类型

- **docx**：飞书云文档 -> Markdown（含图片）
- **sheet**：电子表格 -> Markdown 表格
- **bitable**：多维表格 -> Markdown 表格
- **wiki**：知识库节点 -> 自动解析后导出
- **public/browser-readable docs**：公开文档或浏览器可读文档 -> 通过浏览器导出，并保存本地图片和附件

## 命令速查

| Command | Description |
|---------|-------------|
| `feishu-docx export <URL>` | 将文档导出为 Markdown |
| `feishu-docx export-browser <URL>` | 在真实浏览器会话中导出，并保留本地资源 |
| `feishu-docx export-wechat <URL>` | 将微信公众号文章导出为 Markdown |
| `feishu-docx create <TITLE>` | 创建新文档 |
| `feishu-docx create --url <URL>` | 根据微信公众号文章创建文档 |
| `feishu-docx write <URL>` | 追加内容到文档 |
| `feishu-docx update <URL>` | 更新指定区块 |
| `feishu-docx drive ls` | 列出应用或个人云空间文件 |
| `feishu-docx drive perm-show <TOKEN>` | 查看公开权限 |
| `feishu-docx drive perm-members <TOKEN>` | 列出权限成员 |
| `feishu-docx drive clear` | 二次确认后清空文件 |
| `feishu-docx export-wiki-space <URL>` | 批量导出整个知识库空间 |
| `feishu-docx export-workspace-schema <ID>` | 导出 bitable 数据库结构 |
| `feishu-docx auth` | OAuth 授权 |
| `feishu-docx config set` | 设置凭证 |
| `feishu-docx config show` | 显示当前配置 |
| `feishu-docx config clear` | 清空 token 缓存 |
| `feishu-docx tui` | 启动交互式 TUI 界面 |

## 示例

### 导出一个 wiki 页面

```bash
feishu-docx export "https://xxx.feishu.cn/wiki/ABC123" -o ./docs
```

### 导出文档并指定文件名

```bash
feishu-docx export "https://xxx.feishu.cn/docx/XYZ789" -o ./docs -n meeting_notes
```

### 在真实浏览器会话中导出公开文档或浏览器可读文档

```bash
feishu-docx export-browser "https://xxx.larkoffice.com/wiki/ABC123" -o ./browser_docs
```

### 直接读取内容（推荐 AI Agent 使用）

```bash
# 将内容输出到 stdout，而不是保存为文件
feishu-docx export "https://xxx.feishu.cn/wiki/ABC123" --stdout
# 或使用短参数
feishu-docx export "https://xxx.feishu.cn/wiki/ABC123" -c
```

### 导出时附带 Block ID（便于后续更新）

```bash
# 在导出的 Markdown 中以 HTML 注释形式包含 block ID
feishu-docx export "https://xxx.feishu.cn/wiki/ABC123" --with-block-ids
# 或使用短参数
feishu-docx export "https://xxx.feishu.cn/wiki/ABC123" -b
```

### 批量导出整个知识库空间

```bash
# 导出知识库空间中的所有文档（自动从 URL 提取 space_id）
feishu-docx export-wiki-space "https://xxx.feishu.cn/wiki/ABC123" -o ./wiki_backup

# 指定深度限制
feishu-docx export-wiki-space "https://xxx.feishu.cn/wiki/ABC123" -o ./docs --max-depth 3

# 导出时附带 Block ID，便于后续更新
feishu-docx export-wiki-space "https://xxx.feishu.cn/wiki/ABC123" -o ./docs -b
```

### 导出数据库结构

```bash
# 将 bitable/workspace 数据库结构导出为 Markdown
feishu-docx export-workspace-schema <workspace_id>

# 指定输出文件
feishu-docx export-workspace-schema <workspace_id> -o ./schema.md
```

## 写入文档（CLI）

### 创建文档

```bash
# 创建空文档
feishu-docx create "我的笔记"

# 使用 Markdown 内容创建文档
feishu-docx create "会议记录" -c "# 会议纪要\n\n- 议题一\n- 议题二"

# 从 Markdown 文件创建文档
feishu-docx create "周报" -f ./weekly_report.md

# 在指定文件夹中创建文档
feishu-docx create "笔记" --folder fldcnXXXXXX

# 根据微信公众号文章 URL 创建文档
feishu-docx create --url "https://mp.weixin.qq.com/s/xxxxx"
```

**如何获取 folder token**:
1. 在浏览器中打开目标文件夹
2. 从 URL 中提取 token：`https://xxx.feishu.cn/drive/folder/fldcnXXXXXX`
3. `fldcnXXXXXX` 就是 folder token

### 向已有文档追加内容

```bash
# 追加 Markdown 内容
feishu-docx write "https://xxx.feishu.cn/docx/xxx" -c "## 新章节\n\n内容"

# 从文件追加
feishu-docx write "https://xxx.feishu.cn/docx/xxx" -f ./content.md
```

## 管理云盘文件

```bash
# 列出应用云空间文档
feishu-docx drive ls --auth-mode tenant --type docx

# 列出个人云空间文档
feishu-docx drive ls --auth-mode oauth --type docx

# 查看公开权限
feishu-docx drive perm-show "https://xxx.feishu.cn/docx/ABC123"

# 列出权限成员
feishu-docx drive perm-members "https://xxx.feishu.cn/docx/ABC123"

# 二次确认后清空文件
feishu-docx drive clear --type docx
```

### 更新指定区块

```bash
# 第 1 步：导出时附带 Block ID
feishu-docx export "https://xxx.feishu.cn/docx/xxx" -b -o ./

# 第 2 步：从 HTML 注释中找到 block ID
# <!-- block:blk123abc -->
# # Heading
# <!-- /block -->

# 第 3 步：更新指定区块
feishu-docx update "https://xxx.feishu.cn/docx/xxx" -b blk123abc -c "新内容"
```

> **给 AI Agent 的提示**：当你需要更新某个特定部分时：
> 1. 使用 `-b` 导出以获取 block ID
> 2. 从 HTML 注释中找到目标 block ID
> 3. 使用 `feishu-docx update` 搭配该 block ID 进行更新

## 提示

- 当本地资源可用时，图片和附件会自动下载到 `{doc_title}/` 目录
- 对公开分享链接或浏览器可读文档，优先使用 `export-browser`
- 推荐使用 `--stdout` 或 `-c` 直接输出内容，便于 agent 消费
- 使用 `-b` 导出 block ID，便于后续更新
- Token 会自动刷新，无需重复认证
- 对于 Lark（海外版）：添加 `--lark` 参数
- `tenant_access_token` 用于管理应用云空间，`user_access_token` 用于管理个人云空间
