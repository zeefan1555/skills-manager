# Output Command

> **引用规范**：`references/note-format.md`（Output 格式、Vault 目录）、`references/markdown.md`（Mermaid、正文格式）

## Trigger

- `output`
- `render`、`可视化`
- "生成幻灯片"、"画个图"、"做个 slides"、"对比图"

## 目标

把 wiki 知识渲染为多种可视化格式，在 Obsidian 中直接查看。所有产出保存到 `outputs/` 对应子目录（见 `references/note-format.md` → Vault 目录）。输出层主要负责表达，不替代 wiki 主体。

## 支持的输出格式

| 格式 | 工具 | 输出路径 | 在 Obsidian 中查看 | 退化方案 |
|---|---|---|---|---|
| Marp Slides | `marp-cli` | `outputs/slides/` | Marp 插件 | 纯 Markdown + 分页 |
| Matplotlib Charts | `python3 + matplotlib` | `outputs/charts/` | 图片 embed `![[chart.png]]` | Mermaid pie/graph |
| Markdown Report | 直接写 `.md` | `outputs/qa/` 或自定义 | 原生渲染 | — |
| JSON Canvas | 直接写 `.canvas` | vault 根或指定路径 | Obsidian Canvas | Mermaid graph |
| Mermaid Diagram | 内嵌 `.md` | 跟随报告或独立文件 | 原生渲染 | — |

## 执行步骤

### Marp Slides

1. 确定 slide 主题和大纲
2. 从 wiki 中读取相关 concepts / summaries
3. 生成 Marp 格式 markdown：
   ```markdown
   ---
   marp: true
   theme: default
   paginate: true
   ---

   # Slide Title

   ---

   ## Key Concept

   - Point 1
   - Point 2

   ---
   ```
4. 保存到 `outputs/slides/{slug}.md`
5. 可选：`marp --html outputs/slides/{slug}.md -o outputs/slides/{slug}.html`

### Matplotlib Charts

1. 确定图表类型（bar / line / scatter / heatmap / comparison）
2. 从 wiki 中提取数据点
3. 生成 python 脚本并执行：
   ```bash
   python3 outputs/charts/{slug}.py
   ```
4. 图片保存到 `outputs/charts/{slug}.png`
5. 在相关笔记中 embed：`![[outputs/charts/{slug}.png]]`

### JSON Canvas

1. 确定节点和连接关系
2. 生成 `.canvas` 文件（JSON 格式）
3. 保存到 vault 中

### 归档回 wiki

所有 output 都可以反向引用到 wiki：
- 在相关 concept / topic / synthesis 的 `related` 中添加 output 链接
- 在 output 的 frontmatter 中记录 `sources`（格式见 `references/note-format.md` → Output 格式）
- 如果 output 过程中形成了新框架、对比或综合结论，优先新建 / 更新 `wiki/syntheses/`，其次再走 `promote` 流程

## 返回给用户

- 输出文件路径
- 在 Obsidian 中如何查看（哪个插件、直接打开）
- 是否需要额外依赖（marp-cli、python3）
- 是否引用了 wiki 中的内容

## 约束

- 渲染前确认依赖可用（`which marp`、`python3 -c "import matplotlib"`）
- 依赖不可用时，退化到纯 Markdown + Mermaid（Obsidian 原生支持，见 `references/markdown.md` → Mermaid）
- 图表数据必须来自 wiki，不要凭空编造数据点
- `output` 是表达层，不应成为高价值知识的最终停留点
- Marp slides 控制在 20 页以内，超过建议拆分
