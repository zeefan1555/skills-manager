# RPC Evidence Template

本模板用于沉淀一套可复用的 RPC 证据保存结构，目标是让每一轮验证都能做到：

- 证据可追溯
- round 边界清晰
- 请求 / 回包 / 日志 / 命令彼此可对齐
- 后续复盘时不用重新猜“这份文件是怎么来的”

## 推荐目录结构

```text
<case-dir>/
├── index.md
├── index.json
├── 00-raw-expectation.md
├── 01-find-request.md
├── 02-first-pass.md
├── round-1/
│   ├── commands/
│   │   ├── raw/
│   │   └── normalized/
│   ├── requests/
│   │   ├── raw/
│   │   └── normalized/
│   ├── responses/
│   │   ├── raw/
│   │   └── normalized/
│   ├── logs/
│   │   ├── raw/
│   │   └── extracts/
│   ├── index.json
│   └── verdict.md
├── round-2/
│   ├── commands/
│   ├── requests/
│   ├── responses/
│   ├── logs/
│   ├── index.json
│   └── verdict.md
└── closeout.md
```

## 顶层文件职责

### `index.md`

`index.md` 是整份证据目录的人类入口，建议至少回答：

1. 这组证据围绕什么目标
2. 早期错误假设是什么
3. 当前最终结论是什么
4. 哪些文件最值得优先阅读
5. 当前状态是否已经闭环

### `index.json`

顶层 `index.json` 是整份案例的结构化索引，用来回答三件事：

1. 这组证据是在什么环境、围绕什么目标生成的
2. 当前一共做了几轮，每轮产出了哪些 round 级索引与结论
3. 当前结论进行到什么状态

推荐字段：

- `topic`
- `service`
- `env`
- `phase`
- `status`
- `created_at`
- `updated_at`
- `current_round`
- `entrypoints`
- `round_indexes`
- `closeout`
- `final_verdict`

推荐状态值：

- `running`
- `blocked`
- `closed`

## round 目录职责

- `round-N/` 表示一次独立的验证轮次，只记录这一轮新增或显式复用的证据。
- `commands/` 保存这一轮真实执行过的命令与归一化步骤。
- `requests/` 保存这一轮真正发出的请求体及其归一化视图。
- `responses/` 保存与请求对应的回包及关键事实提炼。
- `logs/` 保存这一轮为了归因而补拉的原始日志与关键摘录。
- `index.json` 保存这一轮证据之间的关系图和状态。
- `verdict.md` 只写这一轮的判断，不提前写最终结论。

## round 级目录规范

### `commands/`

- `commands/raw/`：原始命令行、工具入参、stdout、stderr、exit code、执行时间、目标环境。
- `commands/normalized/`：归一化后的步骤摘要，例如“查看 pod 日志”“重放 RPC 请求”“查询配置”。
- 如果习惯使用单文件命令记录，也应落到 `commands/raw/` 下，而不是直接漂浮在 round 根目录。

### `requests/`

- `requests/raw/`：原始 RPC / HTTP / 配置查询请求，保留原始 payload、header、query、环境、调用时间。
- `requests/normalized/`：归一化后的业务请求视图，突出真正影响判断的关键字段。
- 如果本轮是沿用上一轮请求，也要显式写清楚“复用自哪一轮哪一份证据”。

### `responses/`

- `responses/raw/`：原始 RPC / HTTP 返回体、错误码、网关信息、trace 信息。
- `responses/normalized/`：归一化后的返回事实，例如“接口返回 success=false，业务错误码为 xxx”。
- 请求与回包需要能在本轮 `index.json` 中建立一一对应关系。

### `logs/`

- `logs/raw/`：原始日志、原始 pod 输出、原始 triage 结果、原始配置读取结果。
- `logs/extracts/`：从原始日志中提取出的关键片段与解释性摘录。
- `extracts/` 必须能回指到 `raw/` 的来源。

## round 级 `index.json` 职责

每个 `round-N/index.json` 至少回答下面问题：

1. 本轮要验证的最小问题是什么
2. 本轮状态是 `BLOCKED`、`FAIL`、`PASSED` 还是 `SUPERSEDED`
3. 本轮实际引用了哪些 `commands`、`requests`、`responses`、`logs`
4. 每个请求对应哪个响应
5. 哪些日志支撑了哪个判断
6. 本轮是否复用了上一轮证据，依赖链是什么
7. 下一轮是否需要继续，以及继续原因

推荐字段：

- `round`
- `goal`
- `status`
- `hypothesis`
- `reused_from_rounds`
- `command_files`
- `request_files`
- `response_files`
- `log_files`
- `request_response_links`
- `reasoning_links`
- `next_action`

## round 级 `index.json` 示例

```json
{
  "round": 2,
  "goal": "补齐实验字段后复测并核对日志",
  "status": "BLOCKED",
  "hypothesis": "回包不符合预期可能是请求缺少实验字段，或日志仍未命中目标实例",
  "reused_from_rounds": [1],
  "command_files": [
    "commands/raw/01-rpc-call.md",
    "commands/raw/02-search-log.md",
    "commands/normalized/01-summary.md"
  ],
  "request_files": [
    "requests/raw/01-req-GetWidget-hit-exp.json",
    "requests/normalized/01-req-GetWidget-hit-exp.md"
  ],
  "response_files": [
    "responses/raw/01-resp-GetWidget-hit-exp.json",
    "responses/normalized/01-resp-GetWidget-hit-exp.md"
  ],
  "log_files": [
    "logs/raw/01-log-exp-hit.log",
    "logs/extracts/01-log-exp-hit.md"
  ],
  "request_response_links": [
    {
      "request": "requests/raw/01-req-GetWidget-hit-exp.json",
      "response": "responses/raw/01-resp-GetWidget-hit-exp.json"
    }
  ],
  "reasoning_links": [
    {
      "evidence": "logs/extracts/01-log-exp-hit.md",
      "supports": "当前回包对应的实例日志仍未命中目标实验"
    }
  ],
  "next_action": "固定目标实例后继续下一轮复测"
}
```

## 命名对齐原则

- 同一轮内，请求、回包、日志尽量共用同一组顺序号和 tag。
- 一个请求对应多个日志时，日志可以扩展为 `01-log-1-<tag>.log`、`01-log-2-<tag>.log`。
- round 之间不要复用文件并覆盖；新结论进入新 round。
- 归一化文件与原始文件尽量共用相同顺序号，便于人工比对。

## 最小完成标准

一轮证据至少满足：

1. 有 `commands/`
2. 有 `requests/`
3. 有 `responses/`
4. 有 `logs/`
5. 有 `round-N/index.json`
6. 有 `verdict.md`
7. 顶层 `index.json` 已更新到这一轮

一份案例证据若要作为长期复用资产，还建议同时满足：

1. 有顶层 `index.md`
2. 有 `closeout.md`
3. 能从顶层索引直接跳到最新 round 证据

如果缺少其中任一关键项，这一轮通常还不够支撑可复盘的结论。
