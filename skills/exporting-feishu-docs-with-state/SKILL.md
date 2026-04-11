---
name: exporting-feishu-docs-with-state
description: Use when a user provides a Feishu/Lark doc or wiki URL and wants Markdown export by reusing an existing Playwright storage state, with output saved to the Obsidian raw inbox path.
---

# 复用状态导出飞书文档

只走这一条 SOP：

1. `playwright-cli`
2. `feishu-docx export-browser`
3. 复用已经保存好的 Playwright 浏览器状态文件

默认先复用已有凭证导出。只有当凭证失效、文件不存在、或导出时跳回登录页，才提示用户重新打开页面、登录、再保存状态。

## 何时使用

- 用户给了 Feishu/Lark `docx` 或 `wiki` URL，要导出成 Markdown。
- 用户明确说要复用之前保存好的浏览器凭证。
- 用户不想每次重新登录，只想在失效时再重新保存状态。
- 导出结果要落到固定目录：
  `/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox`

## 固定约定

- 默认 Playwright session：`zeefan`
- 默认状态文件：`~/lark-storage-state.json`
- 固定输出目录：`/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox`

## 标准 SOP

### 1. 先直接复用已有状态导出

```bash
feishu-docx export-browser "<FEISHU_OR_LARK_URL>" \
  --storage-state ~/lark-storage-state.json \
  -o "/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox"
```

这是默认路径。不要先重新登录，也不要先重新生成 state。

### 2. 如果失败，再走“打开 -> 登录 -> 保存状态”

```bash
playwright-cli -s=zeefan open "<FEISHU_OR_LARK_URL>" \
  --browser=chrome \
  --profile="$HOME/.playwright-cli-profiles/zeefan"
```

如果页面跳到登录页：

- 让用户在这个浏览器会话里手动完成登录
- 确认页面已经回到真实 doc/wiki 页面

然后保存状态：

```bash
playwright-cli -s=zeefan state-save ~/lark-storage-state.json
```

再重新导出：

```bash
feishu-docx export-browser "<FEISHU_OR_LARK_URL>" \
  --storage-state ~/lark-storage-state.json \
  -o "/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox"
```

## 最小判断逻辑

按这个顺序做，不要扩展成别的流程：

1. 先尝试复用 `~/lark-storage-state.json`
2. 如果提示状态文件不存在，要求用户重新打开页面并保存状态
3. 如果导出时跳登录页或明显无权限，要求用户重新打开页面、登录、再保存状态
4. 如果导出成功，停止，不追加其他步骤

## 常见提示词

当下面这些现象出现时，再提示用户重建状态：

- `--storage-state` 指向的文件不存在
- 导出过程跳转到登录页
- 页面虽然打开了，但没有文档权限
- 用户切换了账号或工作区

## 常见错误

| 错误 | 原因 | 修复 |
|---|---|---|
| `./lark-storage-state.json` 不存在 | 当前目录不是状态文件所在目录 | 改成 `~/lark-storage-state.json` |
| 每次都先 `state-save` | 把状态文件当成一次性文件 | 先复用，失败了再重建 |
| 登录还没完成就保存状态 | 浏览器还停在登录跳转链路里 | 只在真实文档页保存状态 |
| 导出目录写成相对路径 | 当前 shell 目录不稳定 | 用固定绝对路径输出到 Obsidian inbox |

## 最小示例

直接导出：

```bash
feishu-docx export-browser "https://bytedance.larkoffice.com/docx/XXXX" \
  --storage-state ~/lark-storage-state.json \
  -o "/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox"
```

失效后重建状态：

```bash
playwright-cli -s=zeefan open "https://bytedance.larkoffice.com/docx/XXXX" \
  --browser=chrome \
  --profile="$HOME/.playwright-cli-profiles/zeefan"

playwright-cli -s=zeefan state-save ~/lark-storage-state.json

feishu-docx export-browser "https://bytedance.larkoffice.com/docx/XXXX" \
  --storage-state ~/lark-storage-state.json \
  -o "/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox"
```
