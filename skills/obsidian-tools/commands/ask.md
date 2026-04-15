# Ask Command

> **引用规范**：`references/note-format.md`（Raw 笔记格式、QA Output 格式）、`references/markdown.md`（正文格式）

## Trigger

- `ask`
- `问`、`问答`
- "帮我解答一下"、"这个怎么理解"、"解释一下 xxx"

## 与 query 的区别

| | `query` | `ask` |
|---|---|---|
| **前提** | 知识库里**有**相关知识 | 知识库里**没有**相关知识 |
| **行为** | 检索 wiki 已有内容，沿 4 层层级检索 | AI 直接解答，不依赖 wiki |
| **产物** | 结构化回答 + 可选归档到 syntheses/qa | AI 回答 + 建议用 `raw` 存入知识库 |
| **知识流向** | wiki → 用户 | AI → 用户 → raw → wiki |

## 目标

用户知道知识库中没有相关知识，直接向 AI 提问。AI 给出解答后，引导用户将有价值的回答存入知识库，形成 `ask → raw → compile` 的知识沉淀闭环。

## 执行步骤

1. **确认知识库无覆盖**（可选快检）
   - 快速 `rg` 或 `obsidian search` 确认 wiki 中确实没有相关内容
   - 如果发现已有覆盖，提示用户改用 `query` 命令
   - 如果用户明确说"知识库里没有"或"直接回答"，跳过此步
2. **AI 解答**
   - 基于 LLM 自身知识直接回答用户问题
   - 如需要，可使用 web search 补充实时信息
   - 回答应结构化、清晰、可操作
3. **存储建议**
   - 回答完成后，评估内容价值
   - 如果回答有沉淀价值，主动建议用户存入知识库：`建议执行 raw 将这段内容存入知识库`
   - 如果用户同意或主动说"存一下"，调用 `raw` 命令将回答内容写入 `raw/_inbox/`
4. **记录活动**
   - append 到 `wiki/log.md`，格式 `[{date}] ask | {question}`
   - 如果触发了 raw 存储，额外记录 `[{date}] ingest | {title}`

## 存储判断标准

| 条件 | 建议存储 |
|---|---|
| 回答涉及具体技术方案、命令、配置 | 是 |
| 回答是通用常识或一次性查询 | 否 |
| 回答涉及决策分析、方案对比 | 是 |
| 用户明确说"存一下" | 是 |
| 回答内容可复用、未来可能再查 | 是 |

## 存储格式

当触发 raw 存储时，按 `references/note-format.md` → Raw 笔记格式写入：

```yaml
---
source_url: ""
author: "AI (LLM)"
ingested: {datetime}
ingested_by: manual
type: note
area: {LLM 推断的领域}
tags:
  - {tag1}
  - {tag2}
summary: |
  {3-5 句摘要}
---
```

正文为 AI 的结构化回答，保持原始回答的完整性。

## 返回给用户

- AI 的结构化回答
- 是否建议存入知识库（及理由）
- 如已存储：保存路径、area、建议后续 `compile`
- 如发现知识库其实有覆盖：提示改用 `query`

## 约束

- 回答要明确标注"这是 AI 生成的内容，非基于 wiki 已有知识"
- 区分 ask（AI 解答）和 query（知识库检索）的边界
- 存储时走标准 raw 流程（写入 `raw/_inbox/`），不跳过
- 日志只写 `wiki/log.md`
