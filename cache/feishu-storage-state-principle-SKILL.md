# 复用 Playwright 状态导出飞书文档的原理

## 何时使用

当你满足下面这几个条件时，这条链路最合适：

- 飞书/Lark 文档在浏览器里能正常看
- 想把文档导出成 Markdown
- 不想每次都重新登录
- 希望把导出结果继续沉淀到 Obsidian 之类的知识库里

## 核心心智模型

这条链路本质上不是“一个工具代替另一个工具”，而是两个工具分工协作：

- `playwright-cli` 负责“拿到一个可用的浏览器身份”
- `feishu-docx export-browser` 负责“带着这个身份去把页面导出成 Markdown”

所以真正关键的，不是 URL 本身，而是“这份 URL 是否能在一个已登录的浏览器上下文里被正常打开”。

## `lark-storage-state.json` 到底是什么

`lark-storage-state.json` 可以理解成一个“浏览器登录态快照”。

它通常会保存这些内容：

- cookies
- localStorage
- 与当前站点 origin 绑定的一些浏览器状态

它**不是**：

- 原始文档内容
- 用户名密码明文
- 飞书官方 API token

它更像是：

- “此刻这个浏览器已经登录好了”的快照副本

因此，当 `feishu-docx export-browser` 带上：

```bash
--storage-state ~/lark-storage-state.json
```

它的含义不是“拿这个 JSON 去请求文档 API”，而是：

- 新建一个 Playwright 浏览器上下文
- 先把这份状态加载进去
- 让这个新上下文看起来像“已经登录过的浏览器”
- 再访问飞书文档页面并尝试导出

## 两个工具是如何配合的

### 1. `playwright-cli` 的职责

`playwright-cli` 负责这几件事：

- 打开一个持久化 profile，例如 `zeefan`
- 如果页面跳登录页，让用户在这个会话里手动登录
- 等页面真正回到文档页后，执行 `state-save`

典型命令：

```bash
playwright-cli -s=zeefan open "<FEISHU_OR_LARK_URL>" --browser=chrome --profile="$HOME/.playwright-cli-profiles/zeefan"
playwright-cli -s=zeefan state-save ~/lark-storage-state.json
```

这一步产生的核心资产，不是 Markdown，而是那份 state 文件。

### 2. `feishu-docx` 的职责

`feishu-docx export-browser` 不负责登录流程本身，它负责：

- 读取 `--storage-state` 指向的文件
- 用这份状态启动一个新的浏览器上下文
- 打开目标文档页面
- 从页面中提取可导出的结构，并写成 Markdown

典型命令：

```bash
feishu-docx export-browser "<FEISHU_OR_LARK_URL>" --storage-state ~/lark-storage-state.json -o "<OUTPUT_DIR>"
```

所以可以把它理解成：

- `playwright-cli` 解决“你是谁”
- `feishu-docx` 解决“你把什么导出来”

## 为什么默认先复用已有 state

因为这份 state 的目标就是复用。

如果你已经有：

```bash
~/lark-storage-state.json
```

那最合理的默认策略就是：

1. 先直接拿它导出
2. 只有失败了，再重新打开浏览器
3. 必要时重新登录
4. 再重新 `state-save`

这背后的原因是：

- 同一个账号、同一套工作区、同一段有效会话里，这份 state 往往可以复用多次
- 每次都重新生成只会增加操作成本
- 只有在 cookie 过期、权限变化、账号切换、或 state 文件丢失时，才需要重建

## 为什么“保存 state 的时机”很重要

`state-save` 不是随便什么时候都能保存。

如果你在这些时机保存：

- 还停在登录页
- 正在跳转中
- 还没真正回到文档页

那保存出来的状态往往是不完整的。

最稳的时机是：

- 页面标题已经是文档页
- 文档内容已经能正常看到
- 你确认这个浏览器上下文确实有权限访问该页面

## 典型 SOP

### 默认路径：先复用

```bash
feishu-docx export-browser "<FEISHU_OR_LARK_URL>" \
  --storage-state ~/lark-storage-state.json \
  -o "/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox"
```

### 失败时再重建状态

```bash
playwright-cli -s=zeefan open "<FEISHU_OR_LARK_URL>" \
  --browser=chrome \
  --profile="$HOME/.playwright-cli-profiles/zeefan"

playwright-cli -s=zeefan state-save ~/lark-storage-state.json

feishu-docx export-browser "<FEISHU_OR_LARK_URL>" \
  --storage-state ~/lark-storage-state.json \
  -o "/Users/bytedance/Library/Mobile Documents/iCloud~md~obsidian/Documents/agent/raw/_inbox"
```

## 常见误解

### 误解 1：这个 JSON 是一次性的

不是。它通常可以复用，直到失效。

### 误解 2：这个 JSON 等于密码

不完全等于密码，但它确实属于高敏感登录材料，因为它可以复用浏览器身份。

### 误解 3：`feishu-docx` 自己在负责登录

不是。登录态通常来自 `playwright-cli` 或用户已有浏览器会话，`feishu-docx` 只是消费这份状态。

### 误解 4：每次导出都必须先 `state-save`

不是。应该先复用，失败了再重建。

## 红旗信号

如果出现下面这些现象，说明应该重建状态，而不是继续硬导：

- `--storage-state` 指向的文件不存在
- 导出时跳回登录页
- 页面能打开，但没有文档权限
- 用户切换了账号或租户
- 导出结果明显异常，且确认不是文档格式问题

## 一句话总结

这条链路的本质是：

- `playwright-cli` 负责拿到并保存“已登录的浏览器身份”
- `feishu-docx export-browser` 负责复用这份身份去访问页面并导出 Markdown

所以最优策略永远是：

**先复用已有 state，失败时再打开、登录、保存。**
