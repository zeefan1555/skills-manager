---
name: everything-to-obsidian
description: 将任意信息源统一导入 Obsidian。接受 URL、本地文件路径、剪贴板文本、聊天记录等，自动识别来源类型，路由到对应文件夹，生成结构化笔记。无脚本依赖，agent 根据下方规则直接写文件。涵盖原 learning-content-to-obsidian 和 youtube-to-obsidian 的全部能力。
---

# Everything To Obsidian

## 设计原则

1. **单一入口**：所有"内容 → Obsidian"都走本 skill
2. **无脚本依赖**：agent 根据本文档规则直接写文件（`cat >` 或 `obsidian create`），不调用任何 Python / TS 脚本
3. **按来源路由**：笔记直接落入目标文件夹，跳过 Inbox 中转（无法分类的才进 Inbox）
4. **格式服从 obsidian-markdown**：所有笔记遵循 `obsidian-markdown` skill 的语法规范
5. **写入前必检查**：同名文件或同 URL 已存在时不重复写入
6. **短内容自动合并**：正文 < 500 字时只生成单文件（摘要内嵌于正文末尾），不强制双笔记

## Vault 配置

```bash
VAULT="/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent"
```

```
Articles/            ← web-article、feishu-doc
YouTube/             ← youtube 视频摘要笔记
  字幕/              ← 字幕/transcript 原文
Books/               ← local-pdf、电子书
Code/                ← 代码片段
Conversations/       ← im-chat、email
Inbox/               ← 无法自动分类的兜底
Clippings/           ← Obsidian Web Clipper 自动落入（见「Clippings 收编」章节）
Daily/               ← 每日笔记（不经本 skill，由 Obsidian Daily Note 插件管理）
Pic/                 ← 图片附件
```

---

## 路由表

根据 `source_type` 决定笔记落地目录。**原文和摘要放同一目录**，靠文件名 `- Summary` 后缀区分。

| source_type | 目标目录 | 触发条件 |
|-------------|---------|---------|
| `web-article` | `Articles/` | 普通网页 URL |
| `feishu-doc` | `Articles/` | 飞书/Lark 文档 URL |
| `youtube` | `YouTube/` | youtube.com / youtu.be URL |
| `local-pdf` | `Books/` | 本地 PDF 路径 |
| `local-file` | 按内容判断，默认 `Inbox/` | 本地 .md / .txt 路径 |
| `code` | `Code/` | 代码片段、Gist URL |
| `im-chat` | `Conversations/` | 聊天记录 |
| `email` | `Conversations/` | 邮件内容 |
| `clipboard` | `Inbox/` | 剪贴板粘贴、来源不明 |

YouTube 额外规则：字幕/transcript 原文单独存入 `YouTube/字幕/{title}-字幕.md`。

---

## 流程（7 步）

```
① 识别来源 → ② 抓取/提取 → ③ 清洗 → ④ 生成摘要+标签 → ⑤ 去重检查 → ⑥ 写入 → ⑦ 验证
```

### Step 1：识别来源类型

根据输入自动判断 `source_type`：

```
youtube.com / youtu.be        → youtube
*.larkoffice.com / feishu.cn  → feishu-doc
*.pdf (本地路径)               → local-pdf
github.com/gist / 代码块      → code
其他 http(s):// URL           → web-article
用户声明为聊天记录              → im-chat
用户声明为邮件                  → email
其余                           → clipboard
```

### Step 2：抓取 / 提取

**优先级**：专用工具 > defuddle > 直接读取

| source_type | 推荐抓取方式 |
|-------------|-------------|
| `web-article` | `defuddle parse <url> --md`（标题用 `-p title`） |
| `youtube` | yt-dlp 提取字幕，或 youtube-transcript 类工具 |
| `feishu-doc` |  bytedcli |
| `local-pdf` | Python PDF 提取或用户提供文本 |
| `code` | 直接读取，保留代码块格式 |
| 其余 | 用户直接粘贴文本 |

**抓取 Fallback 链**（任一步成功即停）：

```
defuddle → curl + readability-cli → 浏览器渲染后提取 → 提示用户手动粘贴
```

如果 defuddle 未安装，提示 `npm install -g @anthropic-ai/defuddle`，同时尝试下一个 fallback。

### Step 3：清洗

- 移除：导航、页脚、Cookie 弹窗、广告、重复 UI 文本
- 保留：正文、代码块、表格、图片引用、标题层级

**图片处理策略**：
- **默认**：保留原始远程 URL（`![](https://...)`）
- **用户要求本地化时**：下载图片到 `Pic/`，替换为 `![[Pic/filename.png]]`

### Step 4：生成摘要 + 自动标签

#### 4a. 摘要结构

```markdown
> [!abstract] 一句话结论
> {核心观点}

### 关键要点
- 要点 1
- 要点 2
- 要点 3（3-7 条）

### 适用判断（可选，纯技术文档可省略）
- 适合：...
- 不适合：...
```

**摘要质量要求**：
- 长度：200-600 字（中文）；对于短内容（原文 < 500 字），摘要可缩短到 100 字以内
- 语言：与原文相同（英文原文用英文写摘要，中文原文用中文）
- 保留原文中的关键代码片段引用（用 `> ` 引用格式）
- 不虚构原文未提到的信息

#### 4b. 自动主题标签

Agent 在生成摘要时，**必须**同时推断 3-5 个层 3 主题标签，写入 frontmatter `tags` 字段。

```
推断规则：
- 从正文关键词、标题、代码语言等推断
- 使用小写中划线格式：ai-tools、go-lang、payment、obsidian
- 不重复层 1/层 2 标签（source/summary/web-article 等已自动打）
```

### Step 5：去重检查

写入前**依次**执行两项检查：

```bash
# 5a. 文件名重复检查
test -f "$VAULT/目标目录/YYYY-MM-DD {title}.md"
# 如果存在 → 追加序号：(2)

# 5b. URL 重复检查（仅对 URL 类来源）
grep -rl "source_url: \"$URL\"" "$VAULT" --include="*.md" 2>&1 | head -3
# 如果找到 → 提示用户：该 URL 已存在于 {文件名}，是否继续？
```

### Step 6：写入

#### 6a. 判断单文件 vs 双文件模式

```
正文 < 500 字  → 单文件模式：一个文件，正文 + 摘要内嵌在末尾
正文 >= 500 字 → 双文件模式：原文笔记 + 摘要笔记，互相 wikilink
```

单文件模式下，frontmatter 中 `linked_note` 字段省略，`tags` 同时包含 `source` 和 `summary`。

#### 6b. 确定文件名

```
原文：YYYY-MM-DD {title}.md
摘要：YYYY-MM-DD {title} - Summary.md
```

文件名清洗：`/ \ ? : * " < > |` → `-`，去控制字符，合并连续空白，截断至 100 字符。

#### 6c. 检测 Obsidian 状态 & 选择写入方式

```bash
# 检测 Obsidian 是否在运行
pgrep -x Obsidian && echo "running" || echo "not running"
```

**Obsidian 运行中** → 优先用 obsidian-cli：

```bash
obsidian create path="Articles/2026-03-31 文章标题.md" content="..." silent
```

**Obsidian 未运行** → 直接写文件：

```bash
cat > "$VAULT/Articles/2026-03-31 文章标题.md" << 'EOF'
---
frontmatter...
---
正文...
EOF
```

#### 6d. YouTube 特殊处理

YouTube 来源写 2-3 个文件：
1. `YouTube/YYYY-MM-DD {title}.md` — 摘要笔记（必须）
2. `YouTube/字幕/{title}-字幕.md` — 纯字幕文本（必须）
3. `YouTube/YYYY-MM-DD {title} - Source.md` — 完整 transcript（仅当 transcript > 2000 字时单独存）

如果 transcript ≤ 2000 字，直接嵌入摘要笔记末尾，只写 2 个文件。

### Step 7：验证

```bash
# 检查文件存在且非空
test -s "$VAULT/Articles/2026-03-31 文章标题.md" && echo "OK" || echo "FAIL"

# 检查 frontmatter 格式
head -20 "$VAULT/Articles/2026-03-31 文章标题.md"
```

验证 4 项：
1. 文件存在且非空
2. frontmatter 格式正确（YAML 有效）
3. 双文件模式下 wikilink 互相指向正确
4. source_url 存在

**抓取或提取失败 → 不写入空笔记。**

---

## Frontmatter Schema

所有笔记共用统一字段。完整模板和旧→新字段映射表见 [NOTE_FORMAT.md](references/NOTE_FORMAT.md)。

> [!tip] 单一来源
> Frontmatter 模板只在 NOTE_FORMAT.md 中维护，本文不再重复列出。修改 schema 时只需改一处。

---

## 标签体系

```
层 1 — 角色标签（自动打）：source / summary
层 2 — 来源标签（自动打）：web-article / youtube / local-pdf / ...
层 3 — 主题标签（Step 4b 自动推断，Review 时可调整）：ai-tools / go-lang / payment / ...
```

不使用 `#inbox` / `#processed` 等状态标签，状态由 frontmatter `status` 属性管理。

---

## Clippings 收编

Obsidian Web Clipper 的笔记使用不同的 frontmatter（`clipped`、`author`、无 `source_type`/`status`）。

**收编流程**（用户要求时执行）：

```bash
# 1. 列出 Clippings 中的笔记
ls "$VAULT/Clippings/"

# 2. 对每个笔记：读取 → 补全缺失字段 → 移动到正确目录
# 字段映射：
#   clipped     → created_at
#   source      → source_url
#   (缺失)      → source_type: "web-article"
#   (缺失)      → status: inbox
#   (缺失)      → linked_note: (不生成，除非用户要求补摘要)
```

执行时逐条确认，不批量自动执行。

---

## Review 工作流

`status` 字段的生命周期：`inbox` → `reviewed` → `archived`

**列出待 Review 笔记**：

```bash
grep -rl "status: inbox" "$VAULT" --include="*.md" | sort
```

**标记为 reviewed**（手动或 agent 辅助）：

```bash
# 使用 sed 替换（macOS 兼容语法）
sed -i '' 's/^status: inbox$/status: reviewed/' "$VAULT/path/to/note.md"
```

Review 时建议：
- 检查/调整层 3 主题标签
- 确认摘要质量
- 决定是否需要补充关联笔记

---

## 批量导入

当用户提供多个 URL 或一个 URL 列表文件时：

```
1. 逐条读取 URL
2. 对每条 URL 依次执行 Step 1-7
3. 每条完成后输出状态（成功/失败/跳过）
4. 全部完成后输出汇总表
```

失败的条目不阻塞后续处理。最终输出示例：

```
| # | URL | 状态 | 笔记路径 |
|---|-----|------|----------|
| 1 | https://... | ✅ 成功 | Articles/... |
| 2 | https://... | ❌ 抓取失败 | - |
| 3 | https://... | ⏭ URL 已存在 | Books/... |
```

---

## 与其他 Skill 的关系

| Skill | 本 skill 如何使用它 |
|-------|-------------------|
| `defuddle` | 网页抓取首选工具 |
| `obsidian-markdown` | 笔记格式规范（frontmatter、wikilink、callout 语法参考） |
| `obsidian-cli` | 写入和验证的首选方式（如果 Obsidian 正在运行） |
| `obsidian-bases` | 创建 dashboard.base 看板（见下方） |
| `json-canvas` | 可视化关联图（高级用法，非必须） |

**已废弃**：
- `learning-content-to-obsidian` — 功能已合并到本 skill
- `youtube-to-obsidian` — 已降级为纯 alias

---

## 错误处理

| 场景 | 处理方式 |
|------|---------|
| defuddle 抓取失败 | 尝试 fallback 链（curl → 浏览器 → 手动） |
| 正文为空 | 不写入空笔记，提示用户手动粘贴 |
| 标题提取失败 | 用 URL 域名 + 日期作为回退标题 |
| 文件名已存在 | 追加序号 `(2)` |
| URL 已存在 | 提示用户选择：更新 / 新建 / 跳过 |
| obsidian-cli 不可用 | 回退到 `cat > file.md` |
| defuddle 未安装 | 提示安装，同时尝试 curl fallback |
| Obsidian 状态未知 | 默认用 `cat >` 写入 |

---

## 完整示例：网页文章（从头到尾）

用户：「把这篇存到 Obsidian：https://example.com/ai-tools-2026」

```bash
# 0. 设置变量
VAULT="/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent"

# 1. 识别：普通 URL → source_type="web-article"

# 2. 抓取
defuddle parse "https://example.com/ai-tools-2026" --md -o /tmp/source.md
TITLE=$(defuddle parse "https://example.com/ai-tools-2026" -p title)
# 假设 TITLE="2026年最值得关注的AI工具"

# 3. 清洗：defuddle 已处理大部分噪声

# 4. 生成摘要 + 自动标签
# agent 生成摘要文本和推断标签：ai-tools, productivity, saas

# 5. 去重检查
test -f "$VAULT/Articles/2026-03-31 2026年最值得关注的AI工具.md"
grep -rl 'source_url: "https://example.com/ai-tools-2026"' "$VAULT" --include="*.md"

# 6a. 假设正文 > 500 字 → 双文件模式
# 6c. 检测 Obsidian
pgrep -x Obsidian && echo "running" || echo "not running"

# 6. 写入原文笔记
cat > "$VAULT/Articles/2026-03-31 2026年最值得关注的AI工具.md" << 'EOF'
---
title: "2026年最值得关注的AI工具"
aliases:
  - "2026年最值得关注的AI工具"
tags:
  - source
  - web-article
  - ai-tools
  - productivity
  - saas
source_url: "https://example.com/ai-tools-2026"
source_type: "web-article"
author: "Tech Blog"
created_at: "2026-03-31T17:00:00+08:00"
status: inbox
linked_note: "[[Articles/2026-03-31 2026年最值得关注的AI工具 - Summary]]"
cssclasses:
  - imported-note
  - source-note
---

# 2026年最值得关注的AI工具

- Source: [原文链接](https://example.com/ai-tools-2026)
- Type: web-article
- Summary: [[Articles/2026-03-31 2026年最值得关注的AI工具 - Summary]]

## Original Content

{提取后的正文内容}
EOF

# 写入摘要笔记
cat > "$VAULT/Articles/2026-03-31 2026年最值得关注的AI工具 - Summary.md" << 'EOF'
---
title: "2026年最值得关注的AI工具 - Summary"
aliases:
  - "2026年最值得关注的AI工具 摘要"
tags:
  - summary
  - web-article
  - ai-tools
  - productivity
  - saas
source_url: "https://example.com/ai-tools-2026"
source_type: "web-article"
author: "Tech Blog"
created_at: "2026-03-31T17:00:00+08:00"
status: inbox
linked_note: "[[Articles/2026-03-31 2026年最值得关注的AI工具]]"
cssclasses:
  - imported-note
  - summary-note
---

# 2026年最值得关注的AI工具 - Summary

- Source: [原文链接](https://example.com/ai-tools-2026)
- Type: web-article
- Original: [[Articles/2026-03-31 2026年最值得关注的AI工具]]

## Summary

> [!abstract] 一句话结论
> 2026 年 AI 工具赛道的核心趋势是"agent 化"——从单点工具转向能自主完成多步骤任务的 AI 代理。

### 关键要点
- 要点 1：Cursor、Windsurf 等 AI IDE 已从补全进化到全栈开发代理
- 要点 2：个人知识管理领域出现 AI + PKM 融合（如 Obsidian + AI 插件）
- 要点 3：企业级 AI 工具开始强调数据隐私和合规

### 适用判断
- 适合：关注 AI 工具选型、技术趋势的开发者
- 不适合：寻找具体工具配置教程的人
EOF

# 7. 验证
test -s "$VAULT/Articles/2026-03-31 2026年最值得关注的AI工具.md" && echo "✅ 原文" || echo "❌ 原文"
test -s "$VAULT/Articles/2026-03-31 2026年最值得关注的AI工具 - Summary.md" && echo "✅ 摘要" || echo "❌ 摘要"
head -20 "$VAULT/Articles/2026-03-31 2026年最值得关注的AI工具.md"
```

---

## 后续：Dashboard 看板

使用 `obsidian-bases` skill 创建 `dashboard.base`，推荐视图：

1. **Inbox 视图**：`status = inbox`，按 `created_at` 倒序
2. **按来源分组**：group by `source_type`
3. **按主题标签**：filter by 层 3 标签
4. **归档视图**：`status = archived`

创建命令留待用户确认后执行。
