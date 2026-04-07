---
name: notebooklm-cli
description: Use when the task involves operating Google NotebookLM through the `nlm` CLI, especially for login, notebook creation, source ingestion, querying, artifact generation, downloads, batch workflows, setup, or diagnostics.
---

# NotebookLM CLI

任务导向的 `nlm` CLI 路由 skill。它服务的是“完成 NotebookLM 工作流”，不是背命令表。

## 适用范围

- 用户要做 `nlm login`、建 notebook、加 source、提问、生成/下载产物、批量处理、研究导入、配置 MCP、排查故障
- 用户给出的是任务目标，如“把这篇文章放进 NotebookLM 并总结”“帮我建个 notebook 再加 PDF”
- 用户提到 `NotebookLM CLI`、`nlm`、`notebooklm-mcp-cli`

## 不适用

- 用户只是要查询网页或浏览器当前页面状态；那更像 `opencli` / 浏览器自动化任务
- 用户只是要用 MCP 工具问 NotebookLM；那优先走 NotebookLM MCP，而不是 `nlm`

## 前置检查

每次新会话首次使用时，先确认 CLI 与认证状态：

```bash
nlm --help
nlm login --check
```

如果不确定具体参数，先看帮助：

```bash
nlm <command> --help
nlm <command> <subcommand> --help
```

## 路由表

按用户意图加载对应参考文档：

| 用户意图 | 读取文件 |
|---|---|
| 登录、检查认证、切换 profile | `references/login.md` |
| 建 notebook、列 notebook、改名、删除、alias、tag | `references/notebooks.md` |
| 添加 URL / PDF / 文本 / YouTube / Drive source | `references/sources.md` |
| 提问、跨 notebook 查询、聊天配置 | `references/query.md` |
| 生成 audio / report / quiz / flashcards / slides / 下载产物 | `references/output.md` |
| doctor、setup、config、share、research、batch、pipeline | `references/admin.md` |

## 工作原则

1. **任务优先**：先理解用户要达成什么，再选择对应 `nlm` 子命令。
2. **帮助优先**：命令不确定时先跑 `--help`，不要猜参数。
3. **认证优先**：任何 401、空结果、列表失败，先检查 `nlm login --check` 和 `nlm doctor`。
4. **等待就绪**：添加 source 时优先考虑 `--wait`；生成 artifact 后用状态命令轮询，不要假设立刻完成。
5. **安全删除**：删除 notebook、source、artifact 前必须显式使用 `--confirm`。
6. **结构化输出**：若后续需要给 agent 解析，优先使用 `--json`。
7. **别混淆工具**：本 skill 默认命令前缀是 `nlm`，不是 `notebooklm`、不是 MCP tool 名。

## 常用闭环

### 1. 登录并验证

```bash
nlm login
nlm login --check
```

### 2. 建本并添加来源

```bash
nlm notebook create "AI Research"
nlm source add <notebook> --url "https://example.com" --wait
```

### 3. 查询并生成产物

```bash
nlm notebook query <notebook> "总结关键观点"
nlm report create <notebook> --format "Briefing Doc" --confirm
nlm studio status <notebook>
```

## 错误处理

- 认证失效：先看 `references/login.md`
- source 长时间未就绪：先看 `references/sources.md`
- artifact 未完成或下载失败：先看 `references/output.md`
- CLI / 配置 / MCP 集成问题：先看 `references/admin.md`

## 返回给用户时

- 汇报你实际执行了哪些 `nlm` 命令
- 给出关键结果：notebook id、source id、artifact id、当前 profile、错误原因
- 说明下一步最合理的命令，而不是贴整份文档
