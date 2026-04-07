# Admin

## 何时读取

- 用户要跑诊断、配置默认行为、配置 MCP/AI 工具集成
- 用户要做 share、setup、config、doctor、batch、pipeline、research 等管理类任务

## Doctor / Config / Setup

```bash
nlm doctor
nlm config show
nlm config get auth.default_profile
nlm config set auth.default_profile work
nlm setup list
nlm setup add claude-code
nlm setup add gemini
nlm setup add cursor
nlm setup add json
```

## Sharing

```bash
nlm share status <notebook>
nlm share public <notebook>
nlm share private <notebook>
nlm share invite <notebook> email@example.com
```

## Batch / Cross / Pipeline

```bash
nlm batch create "Project A, Project B"
nlm batch add-source --url "https://..." --notebooks "id1,id2"
nlm batch studio --type audio --tags "research" --confirm

nlm pipeline list
nlm pipeline run <notebook> ingest-and-podcast --url "https://..."
nlm pipeline run <notebook> research-and-report --url "https://..."
```

## 推荐排障顺序

1. `nlm doctor`
2. `nlm login --check`
3. `nlm config show`
4. 再看是否需要 `nlm setup add <client>` 或切 profile

## 何时用这些命令

- 要诊断环境：`doctor`
- 要改默认 profile / 输出格式：`config`
- 要给 AI 工具配置 MCP：`setup`
- 要开放 notebook 给别人：`share`
- 要批量操作多个 notebook：`batch`
- 要跑内置多步流程：`pipeline`

## 注意

- `setup` 是配置 AI 工具接入，不是 Notebook 内容操作
- `batch` 和 `pipeline` 会放大影响范围，执行前要先确认目标 notebooks
