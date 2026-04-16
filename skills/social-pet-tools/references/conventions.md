# Social Pet Tools Conventions

本文件记录 `social-pet-tools` 聚合层的跨命令公共约束。

命令文档只引用这里，不重复改写一遍同样规则。

## 范围边界

- 默认仓库范围是 `social_pet`
- 默认任务范围是本地单测、`ppe_*` 配置修改、RPC 验收、RPC 排障、RPC 验证闭环与 `social-pet` oncall
- 超出以上范围时，不要勉强套用本聚合层；优先回退到更合适的原 skill 或通用 skill

## 加载约定

- 先读主路由 `SKILL.md`
- 再按需读目标 `commands/*.md`
- 只有碰到跨命令共性规则、输出规范、兼容说明时才读本文件
- 如果命令文档还未建立，先查 `references/mapping.md` 决定回退到哪个旧 skill

## 输出与语言

- 面向人工 review 的总结、阶段结论、风险说明默认使用中文
- CLI 命令、参数名、环境名、路径、RPC 名、字段名保持原文
- 返回结果优先写“事实 + 证据路径 + 结论”，不要只给口头判断

## 证据落盘

- 长流程任务必须把关键证据保存在磁盘，而不是只依赖终端滚屏
- 推荐保存的证据类型包括请求体、响应体、日志文件、报告文件、diff 或提交结果
- 回答用户时要给出关键产物路径，方便后续复查

## 执行原则

- 优先最小必要动作：最小请求体、最小配置改动、最短验证链路
- 优先先确认事实，再补动作；例如先确认环境配置、实例日志、实际返回，再判断是否需要继续修改
- 能复用已有旧 skill 沉淀时，不在聚合层重复发明一套新流程
- 不要为尚未沉淀完成的子域虚构不存在的模板、脚本或命令

## 本地测试约束

- 当任务要求使用仓库原生测试流程时，遵循既有 `social-pet-local-test` 的约束
- 默认理解为先 `sh build.sh`，再按 `./ci/run.sh '<TestRegex>'` 执行
- 不能只凭 exit code 判定通过，必须校验目标测试函数在日志中的 `=== RUN` / `--- PASS:` / `--- FAIL:` 证据
- 如果用户明确要求 `test-driven-development`，本地测试阶段仍参考 `social-pet-local-test` 的执行和校验方式

## 兼容与迁移

- 旧 `social-pet-*` skill 保持可用，不做删除、重命名或就地改造
- 新聚合层用于统一入口和统一命令名，不用于否定历史使用方式
- 当聚合层信息不够时，应显式回退到对应旧 skill，而不是自行脑补细节

## 证据落盘路径规范（AI 审计目录）

### 设计目的

Agent 执行一次任务时，通常会串行调用多个子命令（local-test → rpc-verify → rpc-acceptance …）。
每个子命令都会产生请求体和返回体。这些证据需要：

1. **执行 Agent 自判**：子命令跑完后，立即读取 req/resp 判断结果是否正确，写入 `verdict.md`
2. **审核 Agent 综合判定**：任务结束后，读取所有子命令的 verdict，生成整体 `review.md`
3. **人工 review**：按目录浏览完整的请求/返回/判定链路

### 路径格式

```
docs/social-pet/<YYYY-MM-DD>-<topic>/
├── manifest.json                  ← 会话元数据
├── review.md                      ← 审核 Agent 综合判定
│
├── <command>/                     ← 子命令目录，与 commands/*.md 同名
│   ├── 01-req-<method>.json       ← 请求体（按执行顺序编号）
│   ├── 01-resp-<method>.json      ← 原始回包
│   ├── 02-req-<method>.json
│   ├── 02-resp-<method>.json
│   └── verdict.md                 ← 本步 AI 判定
│
├── <command-2>/
│   └── ...
└── ...
```

| 层级 | 含义 | 示例 |
|---|---|---|
| `docs/social-pet/` | 固定前缀 | — |
| `<YYYY-MM-DD>-<topic>/` | 一次任务（session） | `2026-04-16-widget-visibility/` |
| `<command>/` | 子命令目录 | `rpc-verify/`、`local-test/` |
| `NN-req-<method>.json` | 第 N 次请求 | `01-req-GetWidget.json` |
| `NN-resp-<method>.json` | 第 N 次回包 | `01-resp-GetWidget.json` |

### manifest.json

每个 session 根目录必须有 `manifest.json`，记录：

```json
{
  "topic": "widget-visibility",
  "created_at": "2026-04-16T22:25:00+08:00",
  "commands": [
    {
      "name": "local-test",
      "status": "pass",
      "verdict_path": "local-test/verdict.md"
    },
    {
      "name": "rpc-verify",
      "status": "fail",
      "verdict_path": "rpc-verify/verdict.md"
    }
  ],
  "review_status": "pending"
}
```

Agent 每完成一个子命令，就更新 `manifest.json` 追加该命令条目。

### verdict.md（子命令判定）

每个子命令目录下的 `verdict.md` 由执行 Agent 在该步骤完成后立即生成，至少包含：

- 本步执行了什么（命令、参数）
- 请求体和回包文件路径索引
- 关键字段校验结果（`log_id`、业务状态码、目标字段值）
- 结论：`PASS` / `FAIL` / `BLOCKED` + 一句话原因

### review.md（综合审核）

任务所有子命令跑完后（或用户主动触发审核时），审核 Agent 读取 `manifest.json` 遍历所有 `verdict.md`，生成 `review.md`：

- 各步骤结论汇总
- 跨步骤的一致性校验（例如 local-test 通过但 rpc-verify 失败的矛盾分析）
- 整体结论与下一步建议

### AI 行为规则

加载本 skill 后，Agent 自动遵循：

1. **任务开始时**：`mkdir -p docs/social-pet/<date-topic>/`，创建 `manifest.json`
2. **每个子命令开始时**：`mkdir -p docs/social-pet/<date-topic>/<command>/`
3. **每次 RPC / 测试执行后**：将 req/resp 按 `NN-req-*.json` / `NN-resp-*.json` 写入
4. **子命令结束时**：写 `verdict.md`，更新 `manifest.json`
5. **全部子命令结束时**：生成 `review.md`，更新 `manifest.json` 的 `review_status`
6. **查证据时**：读取 `docs/social-pet/` 下最新的 session 目录
7. **汇报时**：回复中给出 session 目录路径

### 约束

- 一次任务的所有子命令产物必须在同一个 session 目录下，禁止分散
- 不同次任务必须用独立的 session 目录隔离，禁止互相覆盖
- 如果目录不存在，自动创建（`mkdir -p`）
- 已有的 session 目录不可删除或重命名，只追加
- 同一天多次执行同一 topic 时，追加序号：`2026-04-16-widget-visibility-2/`
