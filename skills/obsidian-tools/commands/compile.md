# Compile Command 技术规范

> **引用规范**：`references/note-format.md`（4 层检索层级、Summary / Concept 格式、Concept 合并规则、Wiki Log 格式）、`references/obsidian-cli.md`（CLI 语法）、`references/markdown.md`（正文格式）

---

## 1. 概述

Compile 是知识库的**增量编译引擎**，核心使命是将散落在各处 _inbox 中的原始素材，沿 **L4 → L3 → L2 → L1** 的方向逐层编译为结构化的 wiki 知识体系。

### 1.1 两阶段流程

| 阶段 | 名称 | 核心动作 |
|------|------|---------|
| **Phase A** | Summarize 收敛 | 扫描**所有 `**/_inbox/*.md`**，将非 Summary 的原始文件**先生成 Summary**，统一汇聚到 `wiki/summaries/_inbox/` |
| **Phase B** | Compile 编译 | **统一从 `wiki/summaries/_inbox/` 出发**，执行 L3 → L2 → L1 的完整编译 |

> **`wiki/summaries/_inbox/` 是编译的唯一入口。** 所有其他 _inbox 文件夹中的文件都不会被直接编译，它们必须先经过 Phase A 的 Summary 收敛。

### 1.2 核心编译哲学：Delta Learning

Compile 遵循 **Delta Learning（增量学习）** 原则：

> **不追求把所有来源内容写进知识库，而是系统性地只保留"你还不知道的"那 10-20% 新知。**

具体体现为编译时的三层过滤：

| 过滤层 | 动作 | 目的 |
|--------|------|------|
| **去重过滤** | 新 Summary 与已有 concepts 做语义比对 | 识别出哪些观点知识库里已经有了 |
| **增量萃取** | 只提取未被已有 concept 覆盖的新观点 | 避免重复写入已知内容 |
| **冲突检测** | 新观点与旧结论矛盾时标记冲突 | 知识库不只膨胀，也会自我修正 |

**不修改原始文件内容。** 编译状态完全由 _inbox 文件夹位置决定。

---

## 2. 设计原则：4 层检索层级

每次编译必须完整走完 4 层，编译方向为 **L4 → L3 → L2 → L1**：

| 层级 | 名称 | 产物 | Compile 职责 |
|------|------|------|-------------|
| **L4** | 原始层 | `raw/{area}/*.md` | 编译后将原始文件从各自 _inbox 移到已编译位置 |
| **L3** | 来源层 | `wiki/summaries/*.md` | Phase A 生成 Summary 到 _inbox/；Phase B 确认后移到根目录 |
| **L2** | 概念层 | `wiki/concepts/*.md` | 创建/更新概念页，含实战笔记、双向交叉引用 |
| **L1** | 路由层 | `wiki/index.md` | 每次编译后更新：按 area 分组 + 一句话摘要 |

---

## 3. 触发方式与范围控制

### 3.1 触发关键词

`compile` / `compare` / `编译` / `整理` / `更新 wiki`

### 3.2 范围控制

| 用法 | 行为 |
|------|------|
| `compile` | **全量扫描**：扫描所有 _inbox 文件夹 |
| `compile wiki/summaries/_inbox/xxx.md` | **指定文件**：跳过 Phase A，直接编译该 Summary |
| `compile --area=networking` | **指定领域**：只处理该 area 下的未编译文件 |
| `compile --dry-run` | **预览模式**：列出待编译文件 + 预估影响页面，不写入 |
| `compile --rebuild` | **全量重建**：所有已编译文件移回 _inbox 后重新编译 |
| `compile --batch` | **分批处理**：未编译 > 20 时自动启用，每批 10 篇 |

> `--rebuild` 适用场景：索引损坏、目录结构重大变更、concept 命名规范变化后。

---

## 4. _inbox 发现机制（可扩展设计）

### 4.1 核心规则

Compile **不硬编码**具体的 _inbox 路径列表，而是使用通配规则自动发现：