# Notebooks

## 何时读取

- 用户要创建、列出、查看、重命名、删除 notebook
- 用户要配置 alias 或 tag，方便后续命令复用

## 高频命令

```bash
nlm notebook list
nlm notebook create "Title"
nlm notebook get <id>
nlm notebook rename <id> "New Title"
nlm notebook delete <id> --confirm
```

## Alias 与 Tag

```bash
nlm alias set myproject <notebook-id>
nlm alias list
nlm alias get myproject

nlm tag add <notebook> --tags "ai,research"
nlm tag remove <notebook> --tags "ai"
nlm tag list
nlm tag select "ai research"
```

## 推荐工作流

1. `nlm notebook create "Title"`
2. 记录 notebook id
3. 如果后续要反复操作，立刻 `nlm alias set <alias> <id>`
4. 再去添加 source，而不是依赖手工复制长 UUID

## 返回用户时要给的信息

- notebook 标题
- notebook id
- alias（如果创建了）
- source 数量或是否为空

## 注意

- 删除是不可逆操作，必须显式 `--confirm`
- 用户说“给我建一个知识库/笔记本”时，默认映射到 `nlm notebook create`
- 用户只给了模糊名字时，可先 `nlm notebook list` 再确认目标对象
