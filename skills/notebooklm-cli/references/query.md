# Query

## 何时读取

- 用户要对某个 notebook 提问
- 用户要跨多个 notebook 做比较或汇总
- 用户要调整聊天目标、长度或自定义 prompt

## 高频命令

```bash
nlm notebook query <id> "问题"
nlm batch query "问题" --notebooks "notebook-a,notebook-b"
nlm cross query "比较两者方法" --notebooks "id1,id2"
nlm chat configure <notebook> --goal learning_guide --response-length longer
nlm chat configure <notebook> --goal custom --prompt "You are an expert..."
```

## 选择原则

- 单 notebook 问答：`nlm notebook query`
- 多 notebook 同问一遍：`nlm batch query`（`--notebooks` 传名称更稳妥）
- 需要综合比较 / 交叉总结：`nlm cross query`
- 需要长期调整回答风格：`nlm chat configure`

## 推荐工作流

1. 先确认 notebook / tags / aliases
2. 再选择 `query`、`batch query`、`cross query`
3. 若输出风格不合适，再做 `chat configure`

## 返回用户时

- 先给答案摘要
- 再给你实际使用的 notebook 范围
- 如果做了配置修改，说明新的 goal / length / prompt

## 注意

- 对比问题不要误用单 notebook `query`
- 用户说“把这几个 notebook 一起总结”时，优先考虑 `cross query` 或 `batch query`
- 当前 skill 统一使用 `nlm notebook query` 作为单 notebook 示例；如果本地 help 暴露顶层 `nlm query`，也先以 help 为准
