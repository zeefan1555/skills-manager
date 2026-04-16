# RPC Acceptance Command

> **引用规范**：`../references/conventions.md`、`../references/mapping.md`、旧 skill `social-pet-rpc-acceptance-loop`

## Trigger

- `rpc-acceptance`
- “帮我做一轮 RPC 黑盒验收”
- “把这几个 RPC case 全量跑一遍并给我结果矩阵”
- “先别改代码，先把请求、回包、日志证据跑完整”
- “做一份请求 -> 回包 -> 日志 -> 断言 的验收报告”

## 目标

在 `social_pet` 上完成一轮“先跑完整验收、再决定是否进入修复”的 RPC 验收闭环：

1. 确认验收范围、环境参数与 case 矩阵
2. 逐个执行 case，并保存请求、回包、重试结果和日志证据
3. 输出最终 `PASS / FAIL / BLOCKED / NOT-COVERED` 结果矩阵
4. 在用户明确同意前，不进入业务代码修改

## 输入

优先收集这些输入：

- `psm`、method 列表
- `control_plane`、`idc`、`env`、`zone`、`cluster`
- `idl_source`、`idl_version`
- 现成请求体，或用于生成最小请求体的关键字段
- 验收文档、断言规则或最小成功标准
- 是否允许写操作 RPC 改变环境状态

如果用户给的信息不完整，先补齐最影响结论的缺口：

- 验收范围到底覆盖哪些 method / case
- 本次要打到哪个环境
- 成功与失败怎么判定

## 执行步骤

### 第 1 步：建立验收目录与证据索引

产物落盘到当前 session 的 `rpc-acceptance/` 子目录（详见 `../references/conventions.md` "证据落盘路径规范（AI 审计目录）"）：

```
docs/social-pet/<date-topic>/rpc-acceptance/
```

最低要求：

- `overview.md`
- `evidence-index.md`
- `manifest.json`
- 每个 case 独立子目录，内含 `req-<method>.json`、`resp-<method>.json` 与 `bundle.md`

如果用户没有指定 topic 名，先用 `YYYY-MM-DD-<topic>` 形式创建。

### 第 2 步：先做 pre-flight，不直接开跑

在第一次发 RPC 前先确认：

- 请求字段类型和 IDL 一致
- 环境参数完整，且没有把 `ppe` / `ppe_tab_template` 混用
- case 命名、输出路径、重试文件不会互相覆盖
- 写操作风险已得到用户确认

如果 pre-flight 失败：

- 先修请求模板或环境参数
- 不把这类错误算成产品失败
- 不提前进入代码修改

### 第 3 步：串行执行完整 case 矩阵

执行原则：

- 默认按 case 串行执行
- 每个 case 先保存请求体，再保存原始回包
- 从回包提取 `log_id`、`pod_name`、`request_address`
- 优先基于 `pod_name` 去看实例日志，而不是盲搜大盘日志

如果是可重试的外层失败：

- 走旧 skill `social-pet-rpc-acceptance-loop` 中已经沉淀的 retry policy
- 保留每一次尝试文件，不覆盖首轮失败证据

### 第 4 步：按 case 归档结论

每个 case 的 `bundle.md` 至少要写清：

- 请求文件路径
- 最终回包路径
- 所有重试回包路径
- `log_id`、`pod_name`
- 关键实例日志片段
- 必要时的外部状态证据
- 最终分类与一句话结论

分类建议保持和旧 skill 一致：

- `PASS`
- `FAIL-business`
- `FAIL-input-template`
- `FAIL-retriable-exhausted`
- `BLOCKED`
- `NOT-COVERED`

### 第 5 步：先出总报告，再决定是否进入下一阶段

在所有 planned cases 跑完前：

- 不宣布“问题已经定位”
- 不提前修改业务代码
- 不拿单个 case 的偶然成功代替最终矩阵

最终至少输出：

- 执行了哪些 case
- 每类结果数量
- 失败 case 的分类与证据路径
- 尚未覆盖或被环境阻塞的部分
- 建议下一步是“仅保留验收报告”还是“进入 triage / fix”

## 何时回退到旧 skill

遇到以下情况，直接读取旧 skill `social-pet-rpc-acceptance-loop`：

- 需要完整的 phase model、retry policy、manifest 字段规范
- 需要沿用已有模板文件或 case bundle 结构
- 需要在用户批准后进入 triage / code-fix phase

聚合命令只负责路由和收口，不重复重写旧 skill 的深细节。

## 推荐返回结构

- 验收范围与环境参数
- case 矩阵概览
- 关键证据目录
- 最终结果矩阵
- 是否建议进入下一阶段

## 常见错误

- 还没跑完整个矩阵，就根据单个失败 case 直接改代码
- 只看回包最外层 `status=success`，不看业务断言
- 没保存重试结果，导致无法区分瞬态失败和稳定失败
- 没从回包提取 `log_id/pod_name` 就直接去搜日志
- 把请求模板错误误判成业务失败

## 收口规则

只有同时满足以下条件，才算本命令完成：

- 已产出完整的 case 结果矩阵
- 关键请求、回包、日志证据已落盘
- 已返回 summary 路径与 evidence index 路径
- 尚未进入代码修改，或已明确拿到用户的下一阶段授权
