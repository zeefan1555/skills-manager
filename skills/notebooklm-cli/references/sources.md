# Sources

## 何时读取

- 用户要把网页、PDF、文本、YouTube、Drive 文档加入 notebook
- source 刚添加完，需要确认是否就绪
- 需要查看、总结、删除、同步 source

## 高频命令

```bash
nlm source list <notebook>
nlm source add <notebook> --url "https://..." --wait
nlm source add <notebook> --file document.pdf --wait
nlm source add <notebook> --text "content" --title "Notes"
nlm source add <notebook> --youtube "https://..."
nlm source add <notebook> --drive <doc-id>
nlm source get <source-id>
nlm source describe <source-id>
nlm source delete <source-id> --confirm
```

## 默认策略

- 对 URL / 文件导入，优先加 `--wait`
- 用户只说“放进去”时，先判定输入类型：URL、文件、纯文本、YouTube、Drive
- 添加后优先返回 source id 与就绪状态

## Research 导入

若用户要“先搜再导入来源”，通常走；更完整的研究 / 批量 / pipeline 语义见 `references/admin.md`：

```bash
nlm research start "query" --notebook-id <id> --mode fast
nlm research status <notebook> --max-wait 300
nlm research import <notebook> <task-id>
```

## stale / sync

Drive 来源可能需要同步：

```bash
nlm source stale <notebook>
nlm source sync <notebook> --confirm
```

## 常见问题

- **source 刚加进去就查询失败**：通常是没等就绪；优先 `--wait`
- **Drive 文档过期**：先检查 `stale`，再执行 `sync`
- **不确定 source 是否正确**：用 `nlm source get <source-id>` 或 `describe`

## 注意

- source 操作依赖 notebook 上下文；先确认 notebook id / alias
- 删除 source 前要明确告知用户这是不可逆的
