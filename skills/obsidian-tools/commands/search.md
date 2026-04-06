# Search Command

> **引用规范**：`references/note-format.md`（search 运行时属性）、`references/obsidian-cli.md`（search / backlinks 命令）

## Trigger

- `search`
- "搜"、"查"、"检索"

## 目标

用 Obsidian CLI 搜索知识库，先利用 `wiki/index.md` / `wiki/indexes/` 做导航，再做 CLI 粗筛 + LLM 精排，并在最终命中的主笔记上维护 `search_hits`。

当同一主笔记 `search_hits >= 2` 时：

- 输出 RemNote 卡片到 `outputs/remnote/`
- 写入 RemNote Journal
- 回写导出状态

## 执行步骤

1. **入口导航**
   - 优先读取 `wiki/index.md`
   - 必要时读取 `wiki/indexes/_all_concepts.md` / `_all_sources.md`
2. **CLI 粗筛**（见 `references/obsidian-cli.md` → 搜索）
   - `obsidian search query="..." path="wiki"`
   - 或 `obsidian search:context query="..." path="wiki" limit=10`
   - 如果命中太少，扩大到 `path="raw"` 再搜一轮
3. **LLM 精排**
   - 读取候选笔记的 frontmatter + 前 200 字
   - 按与查询的相关度排序
   - 过滤掉纯索引页、极短占位页
   - 输出 top-3 结果及排序理由
4. 选择最终真正命中的主笔记
   - 只对真正被读取、被回答引用、或被用户确认有价值的那篇笔记计数
   - 不要把搜索结果页里的所有候选都算一次命中
5. 读取主笔记正文或关键段落
6. 更新属性（格式见 `references/note-format.md` → Search 运行时属性）
   - `search_hits += 1`
   - `last_searched_at`
   - 如无 `remnote_status`，初始化为 `new`
7. 写 `_kb_meta/search_log.md`

## 返回给用户

- 精排后的 top-3 结果（路径 + 相关度说明）
- 选中的主笔记路径
- 关键内容摘要
- 当前 `search_hits`
- 是否触发了 RemNote 晋升

## 可选扩展：晋升为 RemNote

这不是知识库主闭环，而是复习系统扩展。当以下条件同时满足时才触发：

- `search_hits >= 2`
- `remnote_status != exported`
- 笔记不是纯索引、纯导航或极短占位页

执行顺序：

1. 读取目标笔记正文
2. 补充上下文
   - `obsidian backlinks path="..." counts`（见 `references/obsidian-cli.md` → 图谱辅助）
   - 如是 concept，可继续读取对应 summary / raw
3. 调用 `remnote-card-designer`（见 `../remnote-card-designer/SKILL.md`）
4. 生成备份文件到 `outputs/remnote/`
5. 写入 RemNote Journal
6. 回写属性（见 `references/note-format.md`）

## 用户视角下的效果

- 第 1 次 `search`：只累计 `search_hits`，返回精排结果
- 第 2 次 `search`：如果同一主笔记再次有效命中，就升级到 `outputs/remnote/`

## 约束

- 同一会话内连续重复搜同一篇，不应无限刷计数
- `index` 页不应作为主笔记计数
- 如 `summary` 和 `concept` 同时命中，优先给更适合作为知识单元的主笔记计数
- RemNote 是可选扩展，不应盖过 wiki-first 主流程
- LLM 精排时要给出排序理由，不要黑箱排序
