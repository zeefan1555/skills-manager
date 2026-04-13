---
name: lark-to-obsidian
description: Use when a user provides a Feishu/Lark doc or wiki URL and wants it ingested into an Obsidian knowledge base by reusing an existing Playwright login state.
---

# Lark 导入 Obsidian

这个 skill 的本质只有一件事：

**拿到完整的飞书 Markdown 正文 + 图片/附件资源，然后按 `obsidian-tools` 的 `raw` 规则收录进知识库。**

不要把它理解成“导出到某个目录就结束”。

## 何时使用

- 用户给了 Feishu/Lark `docx` 或 `wiki` URL
- 用户希望复用已有浏览器登录态，不想每次重新登录
- 用户最终目标是把文档收录进 Obsidian 知识库，而不是只落一个临时导出文件

## 固定约定

- 默认 Playwright session：`zeefan`
- 默认状态文件：`~/lark-storage-state.json`
- 临时导出目录：`/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox`
- Obsidian vault 根目录：`/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent`
- 图片/附件统一目录：`raw/assets/`

## 核心原则

1. **先复用状态导出，不先登录**
2. **导出成功不代表任务完成**
3. **必须检查 Markdown 与资源是否完整可用**
4. **图片/附件统一进入 `raw/assets/`，不要散落在每篇笔记旁边**
5. **最后必须严格按 `obsidian-tools` 的 `raw` 命令收录，不在这个 skill 里重复发明额外流程**

## 标准 SOP

### 1. 先直接复用已有状态导出

```bash
feishu-docx export-browser "<FEISHU_OR_LARK_URL>" \
  --storage-state ~/lark-storage-state.json \
  -o "/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox"
```

不要先重新登录，也不要先重新生成 state。

### 2. 只有失败时，才走“打开 → 登录 → 保存状态”

```bash
playwright-cli -s=zeefan open "<FEISHU_OR_LARK_URL>" \
  --browser=chrome \
  --profile="$HOME/.playwright-cli-profiles/zeefan"
```

如果页面跳到登录页：

- 让用户在该浏览器会话里手动完成登录
- 确认页面已经回到真实 doc/wiki 页面

然后保存状态：

```bash
playwright-cli -s=zeefan state-save ~/lark-storage-state.json
```

再重新导出一次。

### 3. 导出后立刻检查“正文 + 资源”是否完整

最小检查项：

- Markdown 中是否还残留 `browser-asset://...` 这类浏览器内部链接
- Markdown 引用的本地图片文件是否都存在
- 是否有资源文件缺少扩展名
- 是否有资源文件名过于通用，后续放进 `raw/assets/` 会冲突

### 4. 修复资源，再整理成 raw 可收录形态

目标不是保留导出工具原样目录，而是把产物整理成 `raw` 命令可以接收的输入：

- 图片/附件统一搬到 `raw/assets/`
- Markdown 中的图片引用统一改成指向 `raw/assets/...`

如果发现 `browser-asset://...`：

- 优先寻找是否已有真实落盘文件可替换
- 如果没有真实文件，不要原样保留这个链接进入知识库
- 改成占位说明，明确这是导出阶段未落盘的白板/浏览器资源

如果发现无扩展名资源：

- 按真实类型补 `.png` / `.jpg` 等扩展名
- 同步修改 Markdown 引用

### 5. 按 `obsidian-tools raw` 的结果收录，而不是停在 `_inbox`

这个 skill 只负责两件事：

- 拿到完整 Markdown 和可用资源
- 把资源整理成符合 `obsidian-tools raw` 约定的输入

收录时的最终落点、日志、Summary 生成方式，**以 `obsidian-tools` 的 `raw` 命令文档为准**，不要在这里额外加规则。

换句话说，**这个 skill 的完成条件是“已经按 `raw` 命令完成收录”**，不是“命令成功导出”。

## 最小判断逻辑

按这个顺序做，不要扩展成别的流程：

1. 先尝试复用 `~/lark-storage-state.json`
2. 如果状态文件不存在，再要求用户登录并保存状态
3. 如果导出时跳登录页或明显无权限，再要求用户重新登录
4. 如果导出成功，检查 Markdown 和资源是否完整
5. 修复图片/附件问题，并统一整理到 `raw/assets/`
6. 按 `obsidian-tools raw` 命令收录进知识库

## 常见错误

| 错误 | 原因 | 修复 |
|---|---|---|
| `./lark-storage-state.json` 不存在 | 当前目录不是状态文件所在目录 | 改成 `~/lark-storage-state.json` |
| 每次都先 `state-save` | 把状态文件当成一次性文件 | 先复用，失败了再重建 |
| 登录还没完成就保存状态 | 浏览器还停在登录跳转链路里 | 只在真实文档页保存状态 |
| 导出成功就停止 | 把“导出”当成最终目标 | 导出后还要修图、整理资源、执行 raw 收录 |
| `browser-asset://...` 直接保留 | 浏览器内部资源不能稳定渲染 | 替换为真实本地文件，或改成占位说明 |
| 图片/附件散落在每篇笔记旁边 | 后续维护和复用困难 | 统一移动到 `raw/assets/` |
| 只写到 `raw/_inbox/` | 没走完整知识库收录流程 | 继续执行 `obsidian-tools raw`，不要停在临时导出目录 |

## 最小示例

```bash
# 1) 导出
feishu-docx export-browser "https://bytedance.larkoffice.com/wiki/XXXX" \
  --storage-state ~/lark-storage-state.json \
  -o "/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox"

# 2) 修复 Markdown 与资源
# - 去掉 browser-asset://
# - 给无扩展名资源补后缀
# - 把图片/附件移动到 raw/assets/
# - 更新正文中的引用

# 3) 收录
# - 然后严格按 obsidian-tools raw 命令收录
```

## 一句话标准

**只要还没按 `obsidian-tools raw` 完成收录，或者资源还没统一进 `raw/assets/`，这个 skill 就还没完成。**
